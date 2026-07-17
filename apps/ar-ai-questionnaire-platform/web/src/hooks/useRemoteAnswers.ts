/**
 * Multi-user answer sync over Supabase — now questionnaire-scoped.
 *
 * - Takes the ACTIVE questionnaire (sections + storageKey + id) as input, so the
 *   same hook serves any questionnaire in the registry.
 * - On mount: pulls all rows from `answers` table, keeps only the ones whose
 *   field_id belongs to the active questionnaire, seeds local state.
 * - On local change: debounced upsert to Supabase (1 row per field_id).
 * - On remote change: realtime subscription patches local state (ignoring rows
 *   that don't belong to the active questionnaire).
 * - Conflict policy: last-write-wins per field.
 *
 * Scoping note: field ids are namespaced per questionnaire (e.g. Gartner ids are
 * prefixed "gc_"), so the two answer sets coexist in the shared `answers` table
 * without a schema migration. A dedicated questionnaire_id column is the cleaner
 * long-term move (see supabase/schema.sql).
 *
 * If Supabase env vars are missing, falls back to localStorage-only.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import type { Field, Section } from "../data/questionnaire";
import type { Questionnaire } from "../data/questionnaires";
import { isRemoteEnabled, supabase } from "../lib/supabase";

export type AnswerValue = string | string[];
export type Answers = Record<string, AnswerValue>;

/** For text fields, EN content lives at this paired key (zh stays at f.id). */
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

/** Every answer key (incl. __en pairs) that belongs to this questionnaire. */
const buildKeySet = (sections: Section[]): Set<string> => {
  const keys = new Set<string>();
  collectFields(sections).forEach((f) => {
    keys.add(f.id);
    if (f.kind === "text") keys.add(enKeyOf(f.id));
  });
  return keys;
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

export interface UseAnswersResult {
  answers: Answers;
  setText: (id: string, value: string) => void;
  toggleCheck: (id: string, value: string) => void;
  reset: () => void;
  clear: () => void;
  exportJson: () => void;
  copyAsText: () => Promise<void>;
  print: () => void;
  saved: boolean;
  /** "local" = no Supabase env, localStorage only. "remote" = synced. "syncing" = remote write pending. */
  syncState: "local" | "remote" | "syncing";
  /** Map of field_id → who last updated it (user id) — for "edited by X" indicators */
  lastUpdatedBy: Record<string, string>;
  progress: {
    overall: { pct: number; done: number; total: number };
    bySection: Record<string, SectionProgress>;
    byQuestion: Record<string, QuestionProgress>;
  };
}

interface Options {
  /** When true, this hook actively fetches + writes to Supabase. */
  remote: boolean;
  /** The active questionnaire (sections + storageKey + id). */
  questionnaire: Questionnaire;
}

export function useRemoteAnswers({ remote, questionnaire }: Options): UseAnswersResult {
  const sections = questionnaire.sections;
  const storageKey = questionnaire.storageKey;
  const defaults = useMemo(() => buildDefaults(sections), [sections]);
  const allFields = useMemo(() => collectFields(sections), [sections]);
  const keySet = useMemo(() => buildKeySet(sections), [sections]);

  const [answers, setAnswers] = useState<Answers>(() => {
    if (typeof window === "undefined") return defaults;
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) return defaults;
      return { ...defaults, ...(JSON.parse(raw) as Answers) };
    } catch {
      return defaults;
    }
  });
  const [lastUpdatedBy, setLastUpdatedBy] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const [syncState, setSyncState] = useState<UseAnswersResult["syncState"]>(
    isRemoteEnabled && remote ? "remote" : "local",
  );

  const pendingWrites = useRef<Map<string, AnswerValue>>(new Map());
  const writeTimer = useRef<number | null>(null);
  const localSaveTimer = useRef<number | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  // ------ Initial remote fetch (only rows for THIS questionnaire) ------
  useEffect(() => {
    if (!remote || !supabase) return;
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("answers")
        .select("field_id, value, updated_by");
      if (cancelled) return;
      if (error) {
        console.warn("[useRemoteAnswers] initial fetch failed:", error.message);
        return;
      }
      if (data && data.length > 0) {
        setAnswers((prev) => {
          const next = { ...prev };
          const by: Record<string, string> = {};
          for (const row of data) {
            if (!keySet.has(row.field_id)) continue; // skip other questionnaires
            next[row.field_id] = row.value as AnswerValue;
            by[row.field_id] = row.updated_by;
          }
          setLastUpdatedBy(by);
          return next;
        });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [remote, keySet]);

  // ------ Realtime subscription ------
  useEffect(() => {
    if (!remote || !supabase) return;
    const channel = supabase
      .channel("answers-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "answers" },
        (payload) => {
          // Apply remote change locally (skip our own pending writes)
          const row = (payload.new ?? payload.old) as
            | { field_id: string; value: AnswerValue; updated_by: string }
            | undefined;
          if (!row?.field_id) return;
          if (!keySet.has(row.field_id)) return; // not this questionnaire
          if (pendingWrites.current.has(row.field_id)) return; // we just wrote it
          if (payload.eventType === "DELETE") return;
          setAnswers((prev) => ({ ...prev, [row.field_id]: row.value }));
          setLastUpdatedBy((prev) => ({ ...prev, [row.field_id]: row.updated_by }));
        },
      )
      .subscribe();
    channelRef.current = channel;
    return () => {
      supabase!.removeChannel(channel);
      channelRef.current = null;
    };
  }, [remote, keySet]);

  // ------ Persist to localStorage (always, as backup) ------
  useEffect(() => {
    if (localSaveTimer.current) window.clearTimeout(localSaveTimer.current);
    localSaveTimer.current = window.setTimeout(() => {
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(answers));
        setSaved(true);
        window.setTimeout(() => setSaved(false), 1200);
      } catch {
        /* noop */
      }
    }, 250);
    return () => {
      if (localSaveTimer.current) window.clearTimeout(localSaveTimer.current);
    };
  }, [answers, storageKey]);

  // ------ Flush pending writes to Supabase (debounced) ------
  const scheduleRemoteFlush = useCallback(() => {
    if (!remote || !supabase) return;
    if (writeTimer.current) window.clearTimeout(writeTimer.current);
    setSyncState("syncing");
    writeTimer.current = window.setTimeout(async () => {
      const writes = Array.from(pendingWrites.current.entries()).map(
        ([field_id, value]) => ({ field_id, value }),
      );
      pendingWrites.current.clear();
      if (writes.length === 0) {
        setSyncState("remote");
        return;
      }
      const { error } = await supabase!.from("answers").upsert(writes, {
        onConflict: "field_id",
      });
      if (error) {
        console.warn("[useRemoteAnswers] upsert failed:", error.message);
      }
      setSyncState("remote");
    }, 800);
  }, [remote]);

  // ------ Local mutations ------
  const setText = useCallback(
    (id: string, value: string) => {
      setAnswers((prev) => ({ ...prev, [id]: value }));
      pendingWrites.current.set(id, value);
      scheduleRemoteFlush();
    },
    [scheduleRemoteFlush],
  );

  const toggleCheck = useCallback(
    (id: string, value: string) => {
      setAnswers((prev) => {
        const cur = (prev[id] as string[]) ?? [];
        const next = cur.includes(value)
          ? cur.filter((v) => v !== value)
          : [...cur, value];
        pendingWrites.current.set(id, next);
        return { ...prev, [id]: next };
      });
      scheduleRemoteFlush();
    },
    [scheduleRemoteFlush],
  );

  const reset = useCallback(() => {
    setAnswers(defaults);
    // Push all defaults to remote
    Object.entries(defaults).forEach(([k, v]) => pendingWrites.current.set(k, v));
    scheduleRemoteFlush();
  }, [defaults, scheduleRemoteFlush]);

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
    Object.entries(empty).forEach(([k, v]) => pendingWrites.current.set(k, v));
    scheduleRemoteFlush();
  }, [allFields, scheduleRemoteFlush]);

  // ------ Export / copy / print ------
  const exportJson = useCallback(() => {
    const scoped: Answers = {};
    keySet.forEach((k) => {
      if (answers[k] !== undefined) scoped[k] = answers[k];
    });
    const blob = new Blob([JSON.stringify(scoped, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${questionnaire.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [answers, keySet, questionnaire.id]);

  const copyAsText = useCallback(async () => {
    const lines: string[] = [];
    sections.forEach((sec) => {
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
  }, [answers, sections]);

  const print = useCallback(() => window.print(), []);

  // ------ Progress ------
  const progress = useMemo(() => {
    const bySection: Record<string, SectionProgress> = {};
    const byQuestion: Record<string, QuestionProgress> = {};
    let qTotal = 0;
    let qDone = 0;
    sections.forEach((sec) => {
      let secTotal = 0;
      let secFilled = 0;
      sec.questions.forEach((q) => {
        let qFieldTotal = 0;
        let qFieldFilled = 0;
        q.groups.forEach((g) =>
          g.fields.forEach((f) => {
            qFieldTotal++;
            secTotal++;
            if (isFilled(answers[f.id])) {
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
  }, [answers, sections]);

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
    syncState,
    lastUpdatedBy,
    progress,
  };
}
