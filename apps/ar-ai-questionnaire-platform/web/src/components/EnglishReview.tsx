import { Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import type { Questionnaire } from "../data/questionnaires";
import type { Question, Section } from "../data/questionnaire";
import type { Answers } from "../hooks/useQuestionnaire";
import { parseBilingualTitle } from "../lib/locale";
import { QuestionDetail } from "./QuestionDetail";

interface Props {
  questionnaire: Questionnaire;
  section: Section;
  question: Question;
  answers: Answers;
  setText: (id: string, value: string) => void;
  toggleCheck: (id: string, value: string) => void;
  questionIndexInSection: number;
  questionsInSection: number;
  onBackToFill: () => void;
  prev?: { question: Question };
  next?: { question: Question };
  onGoTo: (id: string) => void;
  activeIndex: number;
  total: number;
}

/** AR-facing view: edit English submission copy; Chinese shown as read-only reference. */
export function EnglishReview({
  section,
  question,
  answers,
  setText,
  toggleCheck,
  questionIndexInSection,
  questionsInSection,
  onBackToFill,
  prev,
  next,
  onGoTo,
  activeIndex,
  total,
}: Props) {
  const { num, en, zh } = parseBilingualTitle(question.title);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-accent/25 bg-accent/5 px-4 py-3">
        <div className="min-w-0">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-accent">
            英文审稿 · AR Review
          </div>
          <div className="text-sm text-muted mt-0.5">
            对照中文底稿审阅、润色英文提交稿。产品同学在「中文填写」页作答。
          </div>
        </div>
        <Button variant="outline" size="sm" onPress={onBackToFill}>
          <Icon icon="gravity-ui:arrow-left" className="size-3.5" />
          返回中文填写
        </Button>
      </div>

      <QuestionDetail
        section={section}
        question={question}
        answers={answers}
        setText={setText}
        toggleCheck={toggleCheck}
        questionIndexInSection={questionIndexInSection}
        questionsInSection={questionsInSection}
        locale="en"
        titleOverride={
          <span className="inline-flex flex-col gap-0.5">
            <span>
              {num} {zh}
            </span>
            {en !== zh && <span className="text-base font-normal text-muted">{en}</span>}
          </span>
        }
      />

      <div className="flex items-center justify-between gap-3">
        <Button
          variant="outline"
          size="md"
          isDisabled={!prev}
          onPress={() => prev && onGoTo(prev.question.id)}
        >
          <Icon icon="gravity-ui:arrow-left" className="size-4" />
          {prev ? `${parseBilingualTitle(prev.question.title).num} 上一题` : "上一题"}
        </Button>
        <span className="text-xs text-muted tabular-nums">
          {activeIndex + 1} / {total}
        </span>
        <Button
          variant="primary"
          size="md"
          isDisabled={!next}
          onPress={() => next && onGoTo(next.question.id)}
        >
          {next ? `下一题 ${parseBilingualTitle(next.question.title).num}` : "下一题"}
          <Icon icon="gravity-ui:arrow-right" className="size-4" />
        </Button>
      </div>
    </div>
  );
}
