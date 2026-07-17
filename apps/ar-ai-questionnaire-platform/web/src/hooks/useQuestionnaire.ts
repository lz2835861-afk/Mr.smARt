import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SECTIONS, type Field, type Section } from "../data/questionnaire";

const STORAGE_KEY = "omdia_rfi_2026_v7";

export type AnswerValue = string | string[];
export type Answers = Record<string, AnswerValue>;

/** For text fields, EN content lives at this paired key. */
export const enKeyOf = (id: string): string => `${id}__en`;

const collectFields = (sections: Section[]): Field[] => {
  const out: Field[] = [];
  sections.forEach((s) =>
    s.questions.forEach((q) =>
      q.groups.forEach((g) => g.fields.forEach((f) => out.push(f))),
    ),
  );
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

const isFilled = (v: AnswerValue | undefined): boolean => {
  if (v === undefined) return false;
  if (Array.isArray(v)) return v.length > 0;
  return v.trim().length > 0;
};

export interface ProgressEntry {
  id: string;
  total: number;
  filled: number;
  done: boolean;
  partial: boolean;
}

export type SectionProgress = ProgressEntry;
export type QuestionProgress = ProgressEntry;

export interface UseQuestionnaireResult {
  answers: Answers;
  setText: (id: string, value: string) => void;
  toggleCheck: (id: string, value: string) => void;
  reset: () => void;
  clear: () => void;
  exportJson: () => void;
  copyAsText: () => Promise<void>;
  print: () => void;
  saved: boolean;
  progress: {
    overall: { pct: number; done: number; total: number };
    bySection: Record<string, SectionProgress>;
    byQuestion: Record<string, QuestionProgress>;
  };
}

export function useQuestionnaire(): UseQuestionnaireResult {
  const defaults = useMemo(() => buildDefaults(SECTIONS), []);
  const allFields = useMemo(() => collectFields(SECTIONS), []);

  const [answers, setAnswers] = useState<Answers>(() => {
    if (typeof window === "undefined") return defaults;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaults;
      const parsed = JSON.parse(raw) as Answers;
      // Merge so newly-added fields fall back to defaults
      return { ...defaults, ...parsed };
    } catch {
      return defaults;
    }
  });

  const [saved, setSaved] = useState(false);
  const saveTimer = useRef<number | null>(null);
  const savedTimer = useRef<number | null>(null);

  // Debounced persist
  useEffect(() => {
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
        setSaved(true);
        if (savedTimer.current) window.clearTimeout(savedTimer.current);
        savedTimer.current = window.setTimeout(() => setSaved(false), 1200);
      } catch {
        /* noop */
      }
    }, 250);
    return () => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
    };
  }, [answers]);

  const setText = useCallback((id: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }, []);

  const toggleCheck = useCallback((id: string, value: string) => {
    setAnswers((prev) => {
      const cur = (prev[id] as string[]) ?? [];
      const next = cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value];
      return { ...prev, [id]: next };
    });
  }, []);

  const reset = useCallback(() => {
    setAnswers(defaults);
  }, [defaults]);

  const clear = useCallback(() => {
    const empty: Answers = {};
    allFields.forEach((f) => {
      if (f.kind === "text") {
        empty[f.id] = "";
        empty[enKeyOf(f.id)] = "";
      } else {
        empty[f.id] = [];
      }
    });
    setAnswers(empty);
  }, [allFields]);

  const exportJson = useCallback(() => {
    const blob = new Blob([JSON.stringify(answers, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "omdia-rfi-2026.json";
    a.click();
    URL.revokeObjectURL(url);
  }, [answers]);

  const copyAsText = useCallback(async () => {
    const lines: string[] = [];
    SECTIONS.forEach((sec) => {
      lines.push(`# ${sec.index}. ${sec.title}`);
      sec.questions.forEach((q) => {
        lines.push(`\n## ${q.title}`);
        q.groups.forEach((g) =>
          g.fields.forEach((f) => {
            const v = answers[f.id];
            if (Array.isArray(v) && v.length) {
              lines.push(`- ${f.label}: ${v.join(", ")}`);
            } else if (typeof v === "string" && v.trim()) {
              lines.push(`- ${f.label}:`);
              lines.push(v.trim());
            }
          }),
        );
      });
      lines.push("");
    });
    const text = lines.join("\n");
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
  }, [answers]);

  const print = useCallback(() => window.print(), []);

  const progress = useMemo(() => {
    const bySection: Record<string, SectionProgress> = {};
    const byQuestion: Record<string, QuestionProgress> = {};
    let qTotal = 0;
    let qDone = 0;
    SECTIONS.forEach((sec) => {
      let secTotal = 0;
      let secFilled = 0;
      sec.questions.forEach((q) => {
        let qFieldTotal = 0;
        let qFieldFilled = 0;
        q.groups.forEach((g) =>
          g.fields.forEach((f) => {
            qFieldTotal++;
            secTotal++;
            const filled = isFilled(answers[f.id]);
            if (filled) {
              qFieldFilled++;
              secFilled++;
            }
          }),
        );
        const done = qFieldTotal > 0 && qFieldFilled === qFieldTotal;
        byQuestion[q.id] = {
          id: q.id,
          total: qFieldTotal,
          filled: qFieldFilled,
          done,
          partial: !done && qFieldFilled > 0,
        };
        qTotal++;
        if (done) qDone++;
      });
      const secDone = secTotal > 0 && secFilled === secTotal;
      bySection[sec.id] = {
        id: sec.id,
        total: secTotal,
        filled: secFilled,
        done: secDone,
        partial: !secDone && secFilled > 0,
      };
    });
    return {
      overall: {
        pct: qTotal > 0 ? Math.round((qDone / qTotal) * 100) : 0,
        done: qDone,
        total: qTotal,
      },
      bySection,
      byQuestion,
    };
  }, [answers]);

  return {
    answers,
    setText,
    toggleCheck,
    reset,
    clear,
    exportJson,
    copyAsText,
    print,
    saved,
    progress,
  };
}
