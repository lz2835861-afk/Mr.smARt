import { Sidebar } from "@heroui-pro/react";
import type { AnswerState } from "../hooks/useAnswerMeta";
import type { Status } from "../data/questionnaire";
import { STATE_LABEL } from "../lib/locale";
import { assigneesForQuestion } from "../lib/questionAssignees";
import { STATE_INDICATOR, STATE_ROW_BG, STATIC_STATUS_INDICATOR } from "../lib/workflowStates";
import { AuthorTooltipStack } from "./ui/author-tooltip";
import { cn } from "@/lib/utils";

interface LiveMeta {
  state: AnswerState;
  needsAttention: boolean;
  mine: boolean;
}

interface Props {
  questionId: string;
  num: string;
  displayZh: string;
  isCurrent: boolean;
  staticStatus: Status;
  live?: LiveMeta;
  onSelect: () => void;
}

export function SidebarQuestionItem({
  questionId,
  num,
  displayZh,
  isCurrent,
  staticStatus,
  live,
  onSelect,
}: Props) {
  const indicator = live ? STATE_INDICATOR[live.state] : STATIC_STATUS_INDICATOR[staticStatus];
  const rowBg = live ? STATE_ROW_BG[live.state] : "bg-transparent";
  const authors = assigneesForQuestion(questionId);

  return (
    <Sidebar.MenuItem isCurrent={isCurrent} onAction={onSelect}>
      <div
        className={cn(
          "flex w-full min-w-0 items-stretch gap-0 rounded-lg overflow-hidden",
          rowBg,
          isCurrent && "ring-1 ring-accent/30",
        )}
      >
        <span
          className={cn("w-1 shrink-0 rounded-l-lg", indicator)}
          aria-hidden
          title={live ? STATE_LABEL[live.state] : undefined}
        />
        <div className="flex min-w-0 flex-1 items-center gap-2 py-1.5 pr-1 pl-2">
          <div className="min-w-0 flex-1">
            <div className="inline-flex items-baseline gap-1.5 min-w-0 w-full">
              <span className="text-[11px] font-semibold tabular-nums text-muted shrink-0">{num}</span>
              <span className="truncate text-[13px] leading-snug">{displayZh}</span>
            </div>
            {live && (
              <div className="mt-0.5 truncate text-[10px] text-muted">
                {STATE_LABEL[live.state]}
                {live.needsAttention ? " · 需关注" : ""}
                {live.mine ? " · 待办" : ""}
              </div>
            )}
          </div>
          <AuthorTooltipStack authors={authors} max={2} avatarSize="sm" />
        </div>
      </div>
    </Sidebar.MenuItem>
  );
}
