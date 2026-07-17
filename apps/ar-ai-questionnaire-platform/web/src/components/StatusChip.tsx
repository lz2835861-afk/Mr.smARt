import type { Status } from "../data/questionnaire";

/** Tooltip-only labels (kept for accessibility / hover hint, not displayed). */
const HINT: Record<Status, string> = {
  verified: "已验证",
  "needs-confirm": "需 AR 补充",
  strategic: "措辞需推敲",
};

const DOT_CLASS: Record<Status, string> = {
  verified: "bg-success",
  "needs-confirm": "bg-warning",
  strategic: "bg-danger",
};

export function StatusChip({ status, size = "sm" }: { status: Status; size?: "sm" | "md" }) {
  const dotSize = size === "md" ? "size-2.5" : "size-2";
  return (
    <span
      role="status"
      aria-label={HINT[status]}
      title={HINT[status]}
      className={`inline-block rounded-full ${dotSize} ${DOT_CLASS[status]} shrink-0`}
    />
  );
}
