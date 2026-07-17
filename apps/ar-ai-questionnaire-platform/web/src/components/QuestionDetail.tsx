import type { ReactNode } from "react";
import { Card, Separator } from "@heroui/react";
import type { Field, Question, Section } from "../data/questionnaire";
import type { Answers } from "../hooks/useQuestionnaire";
import type { UseAnswerMetaResult } from "../hooks/useAnswerMeta";
import type { UseCommentsResult } from "../hooks/useComments";
import { parseBilingualTitle, sectionLabelZh } from "../lib/locale";
import { ComplianceGrid } from "./ComplianceGrid";
import { QuestionField, type FieldLocale } from "./QuestionField";
import { QuestionStateRollup } from "./QuestionStateRollup";
import { StatusChip } from "./StatusChip";

interface Props {
  section: Section;
  question: Question;
  answers: Answers;
  setText: (id: string, value: string) => void;
  toggleCheck: (id: string, value: string) => void;
  questionIndexInSection: number;
  questionsInSection: number;
  /** Live collaboration metadata. Omit to hide the platform layer. */
  metaApi?: UseAnswerMetaResult;
  /** Per-field comment threads. Omit to hide. */
  commentsApi?: UseCommentsResult;
  locale?: FieldLocale;
  titleOverride?: ReactNode;
}

export function QuestionDetail({
  section,
  question,
  answers,
  setText,
  toggleCheck,
  questionIndexInSection,
  questionsInSection,
  metaApi,
  commentsApi,
  locale = "zh",
  titleOverride,
}: Props) {
  const isComplianceGrid = question.id === "q5_1";
  const fieldIds = question.groups.flatMap((g) => g.fields.map((f) => f.id));
  const { num, displayZh } = parseBilingualTitle(question.title);

  return (
    <Card>
      <Card.Header className="flex flex-col items-start gap-3 pb-5">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-muted">
          <span className="inline-flex items-center justify-center min-w-6 h-5 rounded bg-accent/10 text-accent font-bold px-1.5">
            {section.index}
          </span>
          <span className="font-semibold text-foreground/70 normal-case tracking-normal">
            {sectionLabelZh(section.title)}
          </span>
          <span aria-hidden="true">·</span>
          <span className="tabular-nums">
            Q {questionIndexInSection + 1} / {questionsInSection}
          </span>
        </div>
        <div className="flex items-baseline gap-3 flex-wrap">
          <Card.Title className="text-2xl font-semibold tracking-tight">
            {titleOverride ?? (
              <>
                {num} {displayZh}
              </>
            )}
          </Card.Title>
          <StatusChip status={question.status} />
          {metaApi?.enabled && (
            <QuestionStateRollup metaByField={metaApi.metaByField} fieldIds={fieldIds} />
          )}
        </div>
        {(question.promptEn || question.promptZh) && (
          <div className="w-full space-y-2 pt-0.5">
            {question.promptEn && (
              <pre className="m-0 font-sans whitespace-pre-wrap text-sm leading-[1.65] text-foreground/85">
                {question.promptEn}
              </pre>
            )}
            {question.promptZh && (
              <pre className="m-0 font-sans whitespace-pre-wrap text-sm leading-[1.65] text-muted">
                {question.promptZh}
              </pre>
            )}
          </div>
        )}
      </Card.Header>

      <Separator />

      <Card.Content className="pt-6 pb-2">
        {isComplianceGrid ? (
          <ComplianceGrid
            fields={question.groups[0].fields}
            answers={answers}
            setText={setText}
            locale={locale}
          />
        ) : (
          <div className="space-y-7">
            {question.groups.map((group, gi) => {
              if (group.layout === "industry") {
                return (
                  <div
                    key={gi}
                    className="rounded-2xl border border-border bg-surface-secondary/40 p-5 space-y-4"
                  >
                    {group.industryName && (
                      <div className="text-sm font-semibold text-foreground">
                        {group.industryName}
                      </div>
                    )}
                    {renderGroupFields(group.fields, answers, setText, toggleCheck, metaApi, commentsApi, locale)}
                  </div>
                );
              }

              return (
                <div key={gi} className="space-y-7">
                  {renderGroupFields(group.fields, answers, setText, toggleCheck, metaApi, commentsApi, locale)}
                </div>
              );
            })}
          </div>
        )}
      </Card.Content>
    </Card>
  );
}

function renderGroupFields(
  fields: Field[],
  answers: Answers,
  setText: (id: string, value: string) => void,
  toggleCheck: (id: string, value: string) => void,
  metaApi?: UseAnswerMetaResult,
  commentsApi?: UseCommentsResult,
  locale: FieldLocale = "zh",
) {
  const checksWithOther = fields.find(
    (x): x is Extract<Field, { kind: "checks" }> => x.kind === "checks" && !!x.otherFieldId,
  );
  return fields.map((f, idx) => {
    const visibleWhen =
      f.kind === "text" && checksWithOther && checksWithOther.otherFieldId === f.id
        ? { fieldId: checksWithOther.id, value: "other" }
        : undefined;
    return (
      <div key={f.id}>
        {idx > 0 && <Separator className="mb-7 opacity-60" />}
        <QuestionField
          field={f}
          answers={answers}
          setText={setText}
          toggleCheck={toggleCheck}
          visibleWhen={visibleWhen}
          metaApi={metaApi}
          commentsApi={commentsApi}
          locale={locale}
        />
      </div>
    );
  });
}
