/**
 * Collaboration metadata sync over Supabase `answer_meta` (platform layer).
 *
 * Pairs with useRemoteAnswers (which owns the answer CONTENT in `answers`).
 * This hook owns the per-field collaboration STATE: workflow state, assignment,
 * fact_notes, and the skill-imported evidence / lint / conflicts / suggestions.
 *
 * Schema: web/supabase/platform-layer.sql · written by web/scripts/import-skill-output.ts
 *
 * Scoping mirrors useRemoteAnswers: only rows whose field_id belongs to the
 * active questionnaire are fetched / applied. Falls back to a no-op (empty map)
 * when Supabase is not configured or remote is off.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import type { Field, Section } from "../data/questionnaire";
import type { Questionnaire } from "../data/questionnaires";
import { isRemoteEnabled, supabase } from "../lib/supabase";

export type AnswerState =
  | "NOT STARTED"
  | "AI DRAFTED"
  | "PRODUCT REVIEW"
  | "KEVIN REVIEW"
  | "READY"
  | "SUBMITTED"
  | "BLOCKED";

/** Forward order of the workflow (BLOCKED is a side state, excluded). */
export const STATE_ORDER: AnswerState[] = [
  "NOT STARTED",
  "AI DRAFTED",
  "PRODUCT REVIEW",
  "KEVIN REVIEW",
  "READY",
  "SUBMITTED",
];

export interface EvidenceItem {
  tag?: string; // CITED | INFERRED | REVIEW
  claim?: string;
  quote?: string;
  source?: string;
  retrieved?: string;
  page_updated?: string;
  reviewer?: string;
  reason?: string;
}
export interface ReviewerHook {
  reviewer?: string; // product | Kevin
  kind?: string; // placeholder | thesis | honesty
  text?: string;
  reason?: string;
}
export interface LintFinding {
  severity?: string; // BLOCK | ERROR | WARN
  rule?: string;
  loc?: string; // ZH | EN
  message?: string;
  suggest?: string;
}
export interface Suggestion {
  at?: string;
  source?: string;
  content_zh?: string;
  content_en?: string;
}

export interface AnswerMeta {
  field_id: string;
  questionnaire_id?: string | null;
  state: AnswerState;
  assignee_role?: string | null;
  assignee_id?: string | null;
  fact_notes?: string;
  type_tag?: unknown;
  word_limit?: number | null;
  evidence?: EvidenceItem[];
  reviewer_hooks?: ReviewerHook[];
  lint?: LintFinding[];
  conflicts?: unknown[];
  suggestions?: Suggestion[];
  ai_origin?: boolean;
  needs_attention?: boolean;
  updated_at?: string;
}

export type MetaPatch = Partial<Omit<AnswerMeta, "field_id">>;

export interface UseAnswerMetaResult {
  /** Live metadata keyed by base field_id (no __en). Absent = no row yet. */
  metaByField: Record<string, AnswerMeta>;
  enabled: boolean;
  setState: (fieldId: string, state: AnswerState) => void;
  setFactNotes: (fieldId: string, notes: string) => void;
  /** Generic upsert for any subset of columns (always re-tags questionnaire_id). */
  patchMeta: (fieldId: string, patch: MetaPatch) => void;
  /** Drop a parked suggestion by index (after applying / dismissing it). */
  dropSuggestion: (fieldId: string, index: number) => void;
}

const baseFieldIds = (sections: Section[]): Set<string> => {
  const ids = new Set<string>();
  sections.forEach((s) =>
    s.questions.forEach((q) =>
      q.groups.forEach((g) => g.fields.forEach((f: Field) => ids.add(f.id))),
    ),
  );
  return ids;
};

const SELECT_COLS =
  "field_id, questionnaire_id, state, assignee_role, assignee_id, fact_notes, type_tag, word_limit, evidence, reviewer_hooks, lint, conflicts, suggestions, ai_origin, needs_attention, updated_at";

export function useAnswerMeta({
  remote,
  questionnaire,
}: {
  remote: boolean;
  questionnaire: Questionnaire;
}): UseAnswerMetaResult {
  const keySet = useMemo(() => baseFieldIds(questionnaire.sections), [questionnaire.sections]);
  const qid = questionnaire.id;
  const enabled = Boolean(isRemoteEnabled && remote && supabase);

  const [metaByField, setMetaByField] = useState<Record<string, AnswerMeta>>({});
  const pendingWrites = useRef<Set<string>>(new Set());
  const factTimers = useRef<Map<string, number>>(new Map());
  const channelRef = useRef<RealtimeChannel | null>(null);

  // ------ initial fetch ------
  useEffect(() => {
    if (!enabled || !supabase) return;
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase!.from("answer_meta").select(SELECT_COLS);
      if (cancelled) return;
      if (error) {
        console.warn("[useAnswerMeta] fetch failed:", error.message);
        return;
      }
      const next: Record<string, AnswerMeta> = {};
      for (const row of (data ?? []) as AnswerMeta[]) {
        if (!keySet.has(row.field_id)) continue;
        next[row.field_id] = row;
      }
      setMetaByField(next);
    })();
    return () => {
      cancelled = true;
    };
  }, [enabled, keySet]);

  // ------ realtime ------
  useEffect(() => {
    if (!enabled || !supabase) return;
    const channel = supabase
      .channel("answer-meta-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "answer_meta" },
        (payload) => {
          const row = (payload.new ?? payload.old) as AnswerMeta | undefined;
          if (!row?.field_id || !keySet.has(row.field_id)) return;
          if (pendingWrites.current.has(row.field_id)) return;
          if (payload.eventType === "DELETE") {
            setMetaByField((prev) => {
              const n = { ...prev };
              delete n[row.field_id];
              return n;
            });
            return;
          }
          setMetaByField((prev) => ({ ...prev, [row.field_id]: { ...prev[row.field_id], ...row } }));
        },
      )
      .subscribe();
    channelRef.current = channel;
    return () => {
      supabase!.removeChannel(channel);
      channelRef.current = null;
    };
  }, [enabled, keySet]);

  // ------ write helper ------
  const writeMeta = useCallback(
    async (fieldId: string, patch: MetaPatch) => {
      if (!enabled || !supabase) return;
      pendingWrites.current.add(fieldId);
      const row = { field_id: fieldId, questionnaire_id: qid, ...patch };
      const { error } = await supabase.from("answer_meta").upsert(row, { onConflict: "field_id" });
      if (error) console.warn("[useAnswerMeta] upsert failed:", error.message);
      // release the pending guard after realtime echo settles
      window.setTimeout(() => pendingWrites.current.delete(fieldId), 1200);
    },
    [enabled, qid],
  );

  const patchMeta = useCallback(
    (fieldId: string, patch: MetaPatch) => {
      setMetaByField((prev) => {
        const cur = prev[fieldId] ?? { field_id: fieldId, state: "NOT STARTED" as AnswerState };
        return { ...prev, [fieldId]: { ...cur, ...patch } };
      });
      void writeMeta(fieldId, patch);
    },
    [writeMeta],
  );

  const setState = useCallback(
    (fieldId: string, state: AnswerState) => patchMeta(fieldId, { state }),
    [patchMeta],
  );

  const setFactNotes = useCallback(
    (fieldId: string, notes: string) => {
      // optimistic local update now; debounce the remote write
      setMetaByField((prev) => {
        const cur = prev[fieldId] ?? { field_id: fieldId, state: "NOT STARTED" as AnswerState };
        return { ...prev, [fieldId]: { ...cur, fact_notes: notes } };
      });
      const timers = factTimers.current;
      const existing = timers.get(fieldId);
      if (existing) window.clearTimeout(existing);
      timers.set(
        fieldId,
        window.setTimeout(() => {
          void writeMeta(fieldId, { fact_notes: notes });
          timers.delete(fieldId);
        }, 600),
      );
    },
    [writeMeta],
  );

  const dropSuggestion = useCallback(
    (fieldId: string, index: number) => {
      setMetaByField((prev) => {
        const cur = prev[fieldId];
        if (!cur?.suggestions) return prev;
        const suggestions = cur.suggestions.filter((_, i) => i !== index);
        const nextRow = { ...cur, suggestions };
        void writeMeta(fieldId, { suggestions });
        return { ...prev, [fieldId]: nextRow };
      });
    },
    [writeMeta],
  );

  return { metaByField, enabled, setState, setFactNotes, patchMeta, dropSuggestion };
}

/**
 * Worst / least-progressed state across a question's fields — that's the one
 * that's actionable. BLOCKED anywhere wins. Used for sidebar dots, the
 * question-header rollup, and "我的待办" filtering.
 */
export function rollupState(
  metaByField: Record<string, AnswerMeta>,
  fieldIds: string[],
): { state: AnswerState; needsAttention: boolean; done: number; total: number } {
  let needsAttention = false;
  let blocked = false;
  let minIdx = STATE_ORDER.length - 1;
  let done = 0;
  for (const id of fieldIds) {
    const m = metaByField[id];
    const s: AnswerState = m?.state ?? "NOT STARTED";
    if (m?.needs_attention) needsAttention = true;
    if (s === "BLOCKED") blocked = true;
    const idx = STATE_ORDER.indexOf(s);
    if (idx >= 0 && idx < minIdx) minIdx = idx;
    if (s === "READY" || s === "SUBMITTED") done++;
  }
  return {
    state: blocked ? "BLOCKED" : STATE_ORDER[minIdx],
    needsAttention,
    done,
    total: fieldIds.length,
  };
}
