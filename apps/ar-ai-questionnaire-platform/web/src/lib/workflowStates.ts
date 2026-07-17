import type { AnswerState } from "../hooks/useAnswerMeta";
import type { Status } from "../data/questionnaire";

/** Left-border / chip colors for workflow states (sidebar + rollup). */
export const STATE_INDICATOR: Record<AnswerState, string> = {
  "NOT STARTED": "bg-zinc-300",
  "AI DRAFTED": "bg-[#00bbff]",
  "PRODUCT REVIEW": "bg-amber-400",
  "KEVIN REVIEW": "bg-orange-400",
  READY: "bg-emerald-500",
  SUBMITTED: "bg-emerald-600",
  BLOCKED: "bg-red-500",
};

export const STATE_ROW_BG: Record<AnswerState, string> = {
  "NOT STARTED": "bg-transparent",
  "AI DRAFTED": "bg-[#00bbff]/5",
  "PRODUCT REVIEW": "bg-amber-400/8",
  "KEVIN REVIEW": "bg-orange-400/8",
  READY: "bg-emerald-500/8",
  SUBMITTED: "bg-emerald-600/8",
  BLOCKED: "bg-red-500/8",
};

export const STATIC_STATUS_INDICATOR: Record<Status, string> = {
  verified: "bg-emerald-500",
  "needs-confirm": "bg-amber-400",
  strategic: "bg-red-500",
};
