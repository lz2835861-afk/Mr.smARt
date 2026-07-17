import { Label, TextArea, TextField } from "@heroui/react";
import type { Field } from "../data/questionnaire";
import type { Answers } from "../hooks/useQuestionnaire";
import { enKeyOf } from "../hooks/useQuestionnaire";
import type { FieldLocale } from "./QuestionField";
import { ReasoningSheet } from "./ReasoningSheet";
import { StatusChip } from "./StatusChip";

interface Props {
  fields: Field[];
  answers: Answers;
  setText: (id: string, value: string) => void;
  locale?: FieldLocale;
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

const statusTint: Record<Field["status"], string> = {
  verified: "text-success",
  "needs-confirm": "text-warning",
  strategic: "text-danger",
};

/** Special-case grid for V.1 — 4 regions side-by-side so AR can see at a glance
 *  which regions have verified compliance lists vs blanks. */
export function ComplianceGrid({ fields, answers, setText, locale = "zh" }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {fields.map((f) => {
        if (f.kind !== "text") return null;
        const zh = (answers[f.id] as string) ?? "";
        const en = (answers[enKeyOf(f.id)] as string) ?? "";
        const filled = zh.trim().length > 0;
        const rows = f.rows ?? 4;
        const textareaCls = `w-full text-[13px] leading-[1.75] tracking-[0.01em] border ${statusBgClass(f.status)}`;
        return (
          <div
            key={f.id}
            className="rounded-2xl border border-border bg-surface-secondary/40 p-4 flex flex-col gap-3"
          >
            <div className="flex items-center gap-2 flex-wrap">
              <Label className="text-sm font-semibold text-foreground">{f.label}</Label>
              <StatusChip status={f.status} />
              <div className="ml-auto">
                <ReasoningSheet reasoning={f.reasoning} fieldLabel={f.label} />
              </div>
            </div>
            <div className={`flex items-center gap-1.5 text-[11px] tabular-nums ${statusTint[f.status]}`}>
              <span>{filled ? `${zh.trim().length} 字` : "空白"}</span>
            </div>
            {locale === "zh" ? (
              <TextField
                value={zh}
                onChange={(v) => setText(f.id, v)}
                variant="secondary"
                className="w-full"
              >
                <TextArea rows={rows} className={textareaCls} />
              </TextField>
            ) : (
              <>
                <div className="rounded-lg border border-border bg-surface/60 p-2 text-[12px] leading-relaxed text-foreground/75 whitespace-pre-wrap max-h-28 overflow-y-auto">
                  {zh.trim() ? zh : "（未填中文）"}
                </div>
                <TextField
                  value={en}
                  onChange={(v) => setText(enKeyOf(f.id), v)}
                  variant="secondary"
                  className="w-full"
                >
                  <TextArea
                    rows={rows}
                    placeholder="English answer..."
                    className={textareaCls}
                  />
                </TextField>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
