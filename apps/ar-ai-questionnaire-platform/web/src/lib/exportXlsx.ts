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

/** Rows for the export sheet: [question (field label), English answer, char count]. */
function buildRows(q: Questionnaire, answers: Answers): (string | number)[][] {
  const rows: (string | number)[][] = [["问题 / Question", "英文回答 / English answer", "字符数 / Char count"]];
  q.sections.forEach((sec) =>
    sec.questions.forEach((qq) =>
      qq.groups.forEach((g) =>
        g.fields.forEach((f) => {
          let answer: string;
          if (f.kind === "text") {
            answer = (answers[enKeyOf(f.id)] as string) ?? "";
          } else {
            const sel = (answers[f.id] as string[]) ?? [];
            answer = f.options.filter((o) => sel.includes(o.value)).map((o) => o.label).join(", ");
          }
          answer = answer.trim();
          rows.push([f.label, answer, answer.length]); // char count includes interior spaces
        }),
      ),
    ),
  );
  return rows;
}

/** Build + download a .xlsx of question / English answer / char count. */
export function exportQuestionnaireXlsx(q: Questionnaire, answers: Answers): void {
  const ws = XLSX.utils.aoa_to_sheet(buildRows(q, answers));
  ws["!cols"] = [{ wch: 48 }, { wch: 90 }, { wch: 12 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Answers");
  XLSX.writeFile(wb, `${q.slug}-answers.xlsx`);
}
