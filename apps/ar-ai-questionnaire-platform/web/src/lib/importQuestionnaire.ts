import * as XLSX from "xlsx";
import type { Question, Section } from "../data/questionnaire";
import type { Questionnaire } from "../data/questionnaires";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_EXTENSIONS = new Set(["xlsx", "xls", "csv"]);
const CJK_RE = /[\u3400-\u9fff\uf900-\ufaff]/;

const HEADER_ALIASES = {
  number: ["题号", "序号", "id", "no", "questionno"],
  question: ["问题", "题目", "question", "evaluationquestion"],
  guidance: ["填写说明", "指导", "guidance", "definition"],
  answer: ["回答", "答案", "vendorresponse", "response", "answer"],
  limit: ["字数限制", "wordlimit", "characterlimit"],
} as const;

type HeaderKind = keyof typeof HEADER_ALIASES;
type ColumnMap = Partial<Record<HeaderKind, number>>;

export interface QuestionnaireImportMetadata {
  title: string;
  firm: string;
  vendor: string;
  deadline: string;
}

export interface ParsedQuestionnaire {
  questionnaire: Questionnaire;
  warnings: string[];
  sourceName: string;
  sectionCount: number;
  questionCount: number;
}

function cellText(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value).replace(/\r\n/g, "\n").trim();
}

function normalizeHeader(value: string): string {
  return value.toLowerCase().replace(/[\s._:：()（）\-\/\\|·]+/g, "");
}

function headerParts(value: string): string[] {
  return value
    .split(/[\n\/\\|·]+/)
    .map(normalizeHeader)
    .filter(Boolean);
}

function matchesHeader(value: string, kind: HeaderKind, fuzzy: boolean): boolean {
  const aliases = HEADER_ALIASES[kind] as readonly string[];
  const normalized = normalizeHeader(value);
  const parts = headerParts(value);
  if (aliases.includes(normalized) || parts.some((part) => aliases.includes(part))) return true;
  if (!fuzzy) return false;
  if (kind === "question" && matchesHeader(value, "number", false)) return false;
  return aliases.some(
    (alias) =>
      alias.length >= 4 &&
      (normalized.startsWith(alias) || normalized.endsWith(alias)),
  );
}

function findColumns(header: string[]): ColumnMap {
  const columns: ColumnMap = {};
  (Object.keys(HEADER_ALIASES) as HeaderKind[]).forEach((kind) => {
    const index = header.findIndex((value) => matchesHeader(value, kind, true));
    if (index >= 0) columns[kind] = index;
  });
  return columns;
}

function looksLikeHeaderRow(row: string[]): boolean {
  const recognized = row.reduce((count, value) => {
    const matches = (Object.keys(HEADER_ALIASES) as HeaderKind[]).some((kind) =>
      matchesHeader(value, kind, false),
    );
    return count + (matches ? 1 : 0);
  }, 0);
  return recognized >= 2 || row.some((value) => matchesHeader(value, "question", false));
}

function longestTextColumn(rows: string[][], columnCount: number): number {
  let bestIndex = 0;
  let bestLength = -1;
  for (let column = 0; column < columnCount; column++) {
    const longest = rows.reduce(
      (max, row) => Math.max(max, cellText(row[column]).length),
      0,
    );
    if (longest > bestLength) {
      bestIndex = column;
      bestLength = longest;
    }
  }
  return bestIndex;
}

function splitBilingualPrompt(value: string): Pick<Question, "promptEn" | "promptZh"> {
  let parts = value
    .split(/\n+/)
    .map((part) => part.trim())
    .filter(Boolean);
  if (parts.length === 1) {
    const separated = value
      .split(/\s+(?:\/|\||·)\s+/)
      .map((part) => part.trim())
      .filter(Boolean);
    if (separated.length > 1) parts = separated;
  }

  const zh: string[] = [];
  const en: string[] = [];
  parts.forEach((part) => {
    if (CJK_RE.test(part)) zh.push(part);
    else en.push(part);
  });

  if (parts.length === 1 && zh.length === 1) {
    const firstCjk = value.search(CJK_RE);
    const possibleEnglish = value.slice(0, firstCjk).replace(/[\s/|·-]+$/, "").trim();
    if (possibleEnglish.length >= 3 && /[A-Za-z]/.test(possibleEnglish)) {
      en.push(possibleEnglish);
      zh[0] = value.slice(firstCjk).trim();
    }
  }

  return {
    promptEn: en.join("\n") || undefined,
    promptZh: zh.join("\n") || undefined,
  };
}

function safeSlug(value: string): string {
  const slug = value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9\u3400-\u9fff]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return slug || "questionnaire";
}

async function contentHash(buffer: ArrayBuffer): Promise<string> {
  if (globalThis.crypto?.subtle) {
    const digest = await globalThis.crypto.subtle.digest("SHA-256", buffer);
    return Array.from(new Uint8Array(digest).slice(0, 6), (byte) =>
      byte.toString(16).padStart(2, "0"),
    ).join("");
  }

  const bytes = new Uint8Array(buffer);
  let first = 2166136261;
  let second = 2246822519;
  bytes.forEach((byte) => {
    first = Math.imul(first ^ byte, 16777619);
    second = Math.imul(second ^ byte, 3266489917);
  });
  return `${(first >>> 0).toString(16).padStart(8, "0")}${(second >>> 0)
    .toString(16)
    .padStart(8, "0")}`.slice(0, 12);
}

function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function buildQuestion(
  namespace: string,
  sectionIndex: number,
  questionIndex: number,
  row: string[],
  columns: ColumnMap,
): Question | null {
  const questionText = cellText(row[columns.question!]);
  if (!questionText || looksLikeHeaderRow(row)) return null;

  const sourceNumber = columns.number === undefined ? "" : cellText(row[columns.number]);
  const guidance = columns.guidance === undefined ? "" : cellText(row[columns.guidance]);
  const answer = columns.answer === undefined ? "" : cellText(row[columns.answer]);
  const limit = columns.limit === undefined ? "" : cellText(row[columns.limit]);
  const bilingual = splitBilingualPrompt(questionText);
  const displayPrompt = [bilingual.promptEn, bilingual.promptZh].filter(Boolean).join(" · ") || questionText;
  const displayNumber = sourceNumber || `${sectionIndex + 1}.${questionIndex + 1}`;
  const questionId = `${namespace}-s${sectionIndex + 1}-q${questionIndex + 1}`;
  const hints = [guidance, limit ? `字数限制：${limit}` : ""].filter(Boolean);

  return {
    id: questionId,
    title: `${displayNumber} ${displayPrompt}`,
    ...(hints.length ? { zhHint: hints.join("\n") } : {}),
    ...bilingual,
    status: "needs-confirm",
    groups: [
      {
        fields: [
          {
            id: `${questionId}-answer`,
            kind: "text",
            label: displayPrompt,
            status: "needs-confirm",
            defaultValue: answer,
            defaultValueEn: answer && !CJK_RE.test(answer) ? answer : "",
            rows: 8,
            placeholder: "请输入回答",
          },
        ],
      },
    ],
  };
}

export async function parseQuestionnaireFile(
  file: File,
  metadata: QuestionnaireImportMetadata,
): Promise<ParsedQuestionnaire> {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!ALLOWED_EXTENSIONS.has(extension)) {
    throw new Error("仅支持 .xlsx、.xls 或 .csv 文件。");
  }
  if (file.size === 0) throw new Error("文件为空，请选择包含问卷题目的文件。");
  if (file.size > MAX_FILE_SIZE) throw new Error("文件不能超过 10MB。");
  if (!isValidDate(metadata.deadline)) {
    throw new Error("截止日期必须是合法的 YYYY-MM-DD 日期。");
  }

  const buffer = await file.arrayBuffer();
  let workbook: XLSX.WorkBook;
  try {
    workbook = XLSX.read(buffer, { type: "array" });
  } catch {
    throw new Error("文件解析失败，请确认文件未损坏且格式正确。");
  }

  const hash = await contentHash(buffer);
  const baseName = file.name.replace(/\.[^.]+$/, "");
  const namespace = `import-${safeSlug(baseName)}-${hash}`;
  const warnings: string[] = [];
  const sections: Section[] = [];
  let questionCount = 0;

  workbook.SheetNames.forEach((sheetName) => {
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) return;
    const rawRows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
      header: 1,
      defval: "",
      raw: false,
      blankrows: false,
    });
    const rows = rawRows.map((row) => row.map(cellText));
    const nonEmptyRows = rows.filter((row) => row.some(Boolean));
    if (nonEmptyRows.length === 0) return;

    const header = nonEmptyRows[0];
    const dataRows = nonEmptyRows.slice(1);
    const columnCount = nonEmptyRows.reduce((max, row) => Math.max(max, row.length), 0);
    const columns = findColumns(header);
    if (columns.question === undefined) {
      columns.question = longestTextColumn(dataRows.length ? dataRows : nonEmptyRows, columnCount);
      warnings.push(
        `工作表“${sheetName}”未识别到问题列，已选择最长文本所在的第 ${columns.question + 1} 列。`,
      );
    }

    const sectionIndex = sections.length;
    const questions = dataRows.reduce<Question[]>((result, row) => {
      if (!row.some(Boolean)) return result;
      const question = buildQuestion(namespace, sectionIndex, result.length, row, columns);
      if (question) result.push(question);
      return result;
    }, []);
    if (questions.length === 0) warnings.push(`工作表“${sheetName}”没有可导入的题目。`);
    questionCount += questions.length;
    sections.push({
      id: `${namespace}-s${sectionIndex + 1}`,
      index: String(sectionIndex + 1),
      title: sheetName,
      description: `从 ${file.name} 导入`,
      questions,
    });
  });

  if (questionCount === 0) throw new Error("文件中没有找到可导入的问卷题目。");

  const title = metadata.title.trim() || baseName;
  const firm = metadata.firm.trim() || "Other";
  const vendor = metadata.vendor.trim() || "Tencent Cloud";
  const questionnaire: Questionnaire = {
    id: namespace,
    slug: namespace,
    label: title,
    titleZh: title,
    subtitle: `${firm} · 本机导入`,
    firm,
    vendor,
    products: [{ name: vendor, abbr: vendor.slice(0, 12) }],
    status: "本机导入，待填写",
    nextMilestone: { label: "截止日期", date: metadata.deadline },
    storageKey: `${namespace}-answers`,
    imported: true,
    sourceName: file.name,
    importedAt: new Date().toISOString(),
    sections,
  };

  return {
    questionnaire,
    warnings,
    sourceName: file.name,
    sectionCount: sections.length,
    questionCount,
  };
}
