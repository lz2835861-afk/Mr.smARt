import { Label, TextArea, TextField } from "@heroui/react";
import { CheckboxButtonGroup } from "@heroui-pro/react";
import type { ChecksField, Field, TextField as TextFieldData } from "../data/questionnaire";
import type { Answers } from "../hooks/useQuestionnaire";
import { enKeyOf } from "../hooks/useQuestionnaire";
import type { UseAnswerMetaResult } from "../hooks/useAnswerMeta";
import type { UseCommentsResult } from "../hooks/useComments";
import { AnswerMetaPanel } from "./AnswerMetaPanel";
import { CommentsThread } from "./CommentsThread";
import { ReasoningSheet } from "./ReasoningSheet";
import { StatusChip } from "./StatusChip";

export type FieldLocale = "zh" | "en";

interface Props {
  field: Field;
  answers: Answers;
  setText: (id: string, value: string) => void;
  toggleCheck: (id: string, value: string) => void;
  /** zh = product fill (CN only); en = AR review (EN edit + CN reference). */
  locale?: FieldLocale;
  /** Hide this field unless the controlling check has the given value selected. */
  visibleWhen?: { fieldId: string; value: string };
  /** Hide the field's own header (label + status + sources). Useful when the
   *  parent renders a shared header (e.g. ComplianceGrid). */
  hideHeader?: boolean;
  /** Live collaboration metadata (state/lint/evidence/suggestions). Omit to hide. */
  metaApi?: UseAnswerMetaResult;
  /** Per-field comment threads. Omit to hide. */
  commentsApi?: UseCommentsResult;
}

const statusBgClass = (status: Field["status"]) => {
  switch (status) {
    case "verified":
      return "bg-success/5 border-success/30 focus:border-success/60";
    case "needs-confirm":
      return "bg-warning/5 border-warning/30 focus:border-warning/60";
    case "strategic":
      return "bg-danger/5 border-danger/30 focus:border-danger/60";
    default:
      return "";
  }
};

function TextRow({
  field,
  answers,
  setText,
  locale,
}: {
  field: TextFieldData;
  answers: Answers;
  setText: (id: string, value: string) => void;
  locale: FieldLocale;
}) {
  const zh = (answers[field.id] as string) ?? "";
  const en = (answers[enKeyOf(field.id)] as string) ?? "";
  const rows = field.rows ?? 4;
  const textareaCls = `w-full text-[13px] leading-[1.75] tracking-[0.01em] border ${statusBgClass(field.status)}`;

  if (locale === "zh") {
    return (
      <div data-answer-field={field.id} className="w-full">
        <TextField value={zh} onChange={(v) => setText(field.id, v)} variant="secondary" className="w-full">
          <TextArea
            rows={rows}
            placeholder={field.placeholder ?? "中文回答..."}
            className={textareaCls}
          />
        </TextField>
      </div>
    );
  }

  return (
    <div className="space-y-3 w-full">
      <div className="rounded-lg border border-border bg-surface-secondary/40 p-3 space-y-1">
        <div className="text-[10px] uppercase tracking-[0.08em] text-muted font-semibold">
          中文参考（只读）
        </div>
        <div className="text-[13px] leading-[1.75] text-foreground/75 whitespace-pre-wrap max-h-40 overflow-y-auto">
          {zh.trim() ? zh : "（产品尚未填写中文）"}
        </div>
      </div>
      <div className="space-y-1.5">
        <div className="text-[10px] uppercase tracking-[0.08em] text-muted font-semibold">
          English · 提交稿
        </div>
        <TextField
          value={en}
          onChange={(v) => setText(enKeyOf(field.id), v)}
          variant="secondary"
          className="w-full"
        >
          <TextArea
            rows={rows}
            placeholder="English answer (used for submission)..."
            className={textareaCls}
          />
        </TextField>
      </div>
    </div>
  );
}

function ChecksRow({
  field,
  answers,
  toggleCheck,
}: {
  field: ChecksField;
  answers: Answers;
  toggleCheck: (id: string, value: string) => void;
}) {
  const value = (answers[field.id] as string[]) ?? [];
  return (
    <CheckboxButtonGroup
      aria-label={field.label}
      value={value}
      onChange={(next) => {
        const set = new Set(value);
        const nextSet = new Set(next);
        for (const v of nextSet) if (!set.has(v)) toggleCheck(field.id, v);
        for (const v of set) if (!nextSet.has(v)) toggleCheck(field.id, v);
      }}
      layout="flex"
      className="gap-2 flex-wrap"
    >
      {field.options.map((opt) => (
        <CheckboxButtonGroup.Item key={opt.value} value={opt.value}>
          <CheckboxButtonGroup.ItemContent>{opt.label}</CheckboxButtonGroup.ItemContent>
        </CheckboxButtonGroup.Item>
      ))}
    </CheckboxButtonGroup>
  );
}

export function QuestionField({
  field,
  answers,
  setText,
  toggleCheck,
  visibleWhen,
  hideHeader,
  metaApi,
  commentsApi,
  locale = "zh",
}: Props) {
  if (visibleWhen) {
    const v = answers[visibleWhen.fieldId];
    const arr = Array.isArray(v) ? v : [];
    if (!arr.includes(visibleWhen.value)) return null;
  }

  return (
    <div className="space-y-2.5">
      {!hideHeader && (
        <div className="flex items-center gap-2 flex-wrap">
          <Label className="text-[13px] font-semibold text-foreground leading-snug">
            {field.label}
          </Label>
          <StatusChip status={field.status} />
          <div className="ml-auto">
            <ReasoningSheet reasoning={field.reasoning} fieldLabel={field.label} />
          </div>
        </div>
      )}
      {metaApi?.enabled && (
        <AnswerMetaPanel
          meta={metaApi.metaByField[field.id]}
          onSetState={(s) => metaApi.setState(field.id, s)}
          onSetFactNotes={(n) => metaApi.setFactNotes(field.id, n)}
          onApplySuggestion={(s, i) => {
            if (s.content_zh) setText(field.id, s.content_zh);
            if (s.content_en) setText(enKeyOf(field.id), s.content_en);
            metaApi.dropSuggestion(field.id, i);
          }}
          onDropSuggestion={(i) => metaApi.dropSuggestion(field.id, i)}
        />
      )}
      {field.kind === "text" ? (
        <TextRow field={field} answers={answers} setText={setText} locale={locale} />
      ) : (
        <ChecksRow field={field} answers={answers} toggleCheck={toggleCheck} />
      )}
      {commentsApi?.enabled && (
        <CommentsThread
          comments={commentsApi.commentsByField[field.id] ?? []}
          onAdd={(body) => commentsApi.addComment(field.id, body)}
          onToggleResolved={commentsApi.toggleResolved}
        />
      )}
    </div>
  );
}
