import { rollupState, type AnswerMeta, type AnswerState } from "../hooks/useAnswerMeta";
import { STATE_LABEL } from "../lib/locale";

const STYLE: Record<AnswerState, string> = {
  "NOT STARTED": "bg-default-200 text-muted",
  "AI DRAFTED": "bg-accent/10 text-accent",
  "PRODUCT REVIEW": "bg-warning/10 text-warning",
  "KEVIN REVIEW": "bg-warning/10 text-warning",
  READY: "bg-success/10 text-success",
  SUBMITTED: "bg-success/15 text-success",
  BLOCKED: "bg-danger/10 text-danger",
};

export function QuestionStateRollup({
  metaByField,
  fieldIds,
}: {
  metaByField: Record<string, AnswerMeta>;
  fieldIds: string[];
}) {
  if (fieldIds.length === 0) return null;
  const { state, needsAttention, done, total } = rollupState(metaByField, fieldIds);
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ${STYLE[state]}`}
    >
      {needsAttention && <span className="size-1.5 rounded-full bg-current" />}
      {STATE_LABEL[state]}
      <span className="tabular-nums opacity-70">
        {done}/{total}
      </span>
    </span>
  );
}
