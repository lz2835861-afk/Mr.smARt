// Excel export for a questionnaire's question/answer pairs, plus helpers to load
// a questionnaire's answers and compute progress from outside the workspace
// (the home cards need both without mounting the full useRemoteAnswers hook).
import * as XLSX from "xlsx";
import type { Field, Section } from "../data/questionnaire";
import type { Questionnaire } from "../data/questionnaires";
import { enKeyOf, type Answers } from "../hooks/useRemoteAnswers";
import { isRemoteEnabled, supabase } from "./supabase";

const collectFields = (sections: Section[]): Field[] => {
  const out: Field[] = [];
  sections.forEach((s) => s.questions.forEach((q) => q.groups.forEach((g) => g.fields.forEach((f) => out.push(f)))));
  return out;
};

const buildDefaults = (sections: Section[]): Answers => {
  const out: Answers = {};
  collectFields(sections).forEach((f) => {
    if (f.kind === "text") {
      out[f.id] = f.defaultValue;
      out[enKeyOf(f.id)] = f.defaultValueEn ?? "";
    } else {
      out[f.id] = [...f.defaultValue];
    }
  });
  return out;
};

const buildKeySet = (sections: Section[]): Set<string> => {
  const keys = new Set<string>();
  collectFields(sections).forEach((f) => {
    keys.add(f.id);
    if (f.kind === "text") keys.add(enKeyOf(f.id));
  });
  return keys;
};

/** Registry defaults merged with this browser's localStorage cache (no network). */
export function localAnswers(q: Questionnaire): Answers {
  const defaults = buildDefaults(q.sections);
  try {
    const raw = window.localStorage.getItem(q.storageKey);
    if (raw) return { ...defaults, ...(JSON.parse(raw) as Answers) };
  } catch {
    /* ignore */
  }
  return defaults;
}

/** Authoritative answers for export: localAnswers overlaid with Supabase rows. */
export async function loadAnswersForExport(q: Questionnaire): Promise<Answers> {
  const merged = localAnswers(q);
  if (isRemoteEnabled && supabase) {
    try {
      const keys = buildKeySet(q.sections);
      const { data, error } = await supabase.from("answers").select("field_id, value");
      if (!error && data) {
        for (const row of data) if (keys.has(row.field_id)) merged[row.field_id] = row.value;
      }
    } catch {
      /* fall back to local */
    }
  }
  return merged;
}

/** Question-level completion (a question is done when all its fields are filled). */
export function questionProgress(q: Questionnaire, answers: Answers): { done: number; total: number; pct: number } {
  let total = 0;
  let done = 0;
  q.sections.forEach((sec) =>
    sec.questions.forEach((qq) => {
      total++;
      let anyField = false;
      let allFilled = true;
      qq.groups.forEach((g) =>
        g.fields.forEach((f) => {
          anyField = true;
          const v = answers[f.id];
          const filled = Array.isArray(v) ? v.length > 0 : typeof v === "string" && v.trim().length > 0;
          if (!filled) allFilled = false;
        }),
      );
      if (anyField && allFilled) done++;
    }),
  );
  return { done, total, pct: total > 0 ? Math.round((done / total) * 100) : 0 };
}

/** Count CJK ideographs (汉字) — excludes punctuation, spaces and digits. */
function countChineseChars(s: string): number {
  let n = 0;
  for (const ch of s) {
    const code = ch.codePointAt(0) ?? 0;
    if ((code >= 0x4e00 && code <= 0x9fff) || (code >= 0x3400 && code <= 0x4dbf)) n++;
  }
  return n;
}

/** Count English words (incl. numbers, hyphenated and apostrophe words). */
function countEnglishWords(s: string): number {
  const m = s.match(/[A-Za-z0-9]+(?:['-][A-Za-z0-9]+)*/g);
  return m ? m.length : 0;
}

/** Format a field's reasoning sources (url + label) into a single cell string. */
function formatSources(sources: { url: string; label: string }[] | undefined): string {
  if (!sources || sources.length === 0) return "";
  return sources.map((s, i) => `${i + 1}. ${s.label} — ${s.url}`).join("\n");
}

/**
 * Rows for the export sheet — the standard 7-column answer layout applied to
 * every questionnaire export:
 *   [题干, 对应产品, 中文, 中文字数, 英文, 英文单词数, 来源].
 * Column 1 keeps the full question title; column 2 is the field's product
 * label; column 7 lists the field's linked sources (url + label), drawn from
 * the field's `reasoning.sources` when present.
 */
function buildRows(q: Questionnaire, answers: Answers): (string | number)[][] {
  const rows: (string | number)[][] = [
    ["题干", "对应产品", "中文", "中文字数", "英文", "英文单词数", "来源"],
  ];
  q.sections.forEach((sec) =>
    sec.questions.forEach((qq) =>
      qq.groups.forEach((g) =>
        g.fields.forEach((f) => {
          let zh: string;
          let en: string;
          if (f.kind === "text") {
            zh = ((answers[f.id] as string) ?? f.defaultValue ?? "").trim();
            en = ((answers[enKeyOf(f.id)] as string) ?? f.defaultValueEn ?? "").trim();
          } else {
            const sel = (answers[f.id] as string[]) ?? [];
            const labels = f.options.filter((o) => sel.includes(o.value)).map((o) => o.label);
            zh = labels.join("、");
            en = labels.join(", ");
          }
          rows.push([
            qq.title,
            f.label,
            zh,
            countChineseChars(zh),
            en,
            countEnglishWords(en),
            formatSources(f.reasoning?.sources),
          ]);
        }),
      ),
    ),
  );
  return rows;
}

/** Build + download a .xlsx following the standard 7-column answer layout. */
export function exportQuestionnaireXlsx(q: Questionnaire, answers: Answers): void {
  const ws = XLSX.utils.aoa_to_sheet(buildRows(q, answers));
  ws["!cols"] = [
    { wch: 40 },
    { wch: 24 },
    { wch: 60 },
    { wch: 10 },
    { wch: 70 },
    { wch: 12 },
    { wch: 50 },
  ];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Answers");
  XLSX.writeFile(wb, `${q.slug}-answers.xlsx`);
}
