import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import {
  deleteImportedQuestionnaire,
  getAllQuestionnaires,
  type Questionnaire,
  type QuestionnaireProduct,
} from "../data/questionnaires";
import { exportQuestionnaireXlsx, loadAnswersForExport, localAnswers, questionProgress } from "../lib/exportXlsx";
import { SiteNavbar } from "./SiteNavbar";
import { QuestionnaireUpload } from "./QuestionnaireUpload";
import {
  AI_INFRA_FIRM,
  AI_INFRA_QUESTIONS,
  AI_INFRA_SLUG,
  AI_INFRA_TITLE,
  docFor,
} from "../data/aiInfra";

/** A product under evaluation — logo if provided, else its abbreviation. */
function ProductChip({ product }: { product: QuestionnaireProduct }) {
  return (
    <span
      title={product.name}
      className="inline-flex h-8 min-w-8 items-center justify-center rounded-lg border border-border bg-surface-secondary px-2 text-[11px] font-semibold text-foreground"
    >
      {product.logoUrl ? (
        <img src={product.logoUrl} alt={product.name} className="h-5 w-5 object-contain" />
      ) : (
        product.abbr
      )}
    </span>
  );
}

/** Human "剩 N 天" label for a YYYY-MM-DD milestone (browser-time, best-effort). */
function daysLabel(date: string): string | null {
  try {
    const target = new Date(`${date}T00:00:00`).getTime();
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    const diff = Math.round((target - start) / 86_400_000);
    if (Number.isNaN(diff)) return null;
    if (diff < 0) return "已过期";
    if (diff === 0) return "今天";
    return `剩 ${diff} 天`;
  } catch {
    return null;
  }
}

function QuestionnaireCard({ q, onDeleted }: { q: Questionnaire; onDeleted: () => void }) {
  const navigate = useNavigate();
  const [exporting, setExporting] = useState(false);

  const questionCount = useMemo(
    () => q.sections.reduce((n, s) => n + s.questions.length, 0),
    [q],
  );
  // Progress from the local cache (no network) — good enough for an at-a-glance card.
  const prog = useMemo(() => questionProgress(q, localAnswers(q)), [q]);
  const due = daysLabel(q.nextMilestone.date);

  const onExport = async () => {
    setExporting(true);
    try {
      const answers = await loadAnswersForExport(q);
      exportQuestionnaireXlsx(q, answers);
    } catch (err) {
      console.error("[export] failed:", err);
    } finally {
      setExporting(false);
    }
  };

  const onDelete = () => {
    if (!q.imported) return;
    const confirmed = window.confirm(`确定删除本机导入问卷“${q.titleZh}”吗？填写内容也会一并删除。`);
    if (!confirmed) return;
    deleteImportedQuestionnaire(q.id);
    onDeleted();
  };

  return (
    <div className="flex flex-col rounded-2xl border border-border bg-surface p-5 transition-all hover:border-accent/40 hover:shadow-overlay">
      {/* Top: participating products + firm badge */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {q.products.map((p) => (
            <ProductChip key={p.abbr} product={p} />
          ))}
        </div>
        <div className="flex shrink-0 flex-wrap justify-end gap-1.5">
          {q.imported && (
            <span className="rounded-md bg-warning/10 px-2 py-0.5 text-[11px] font-semibold text-warning">
              本机导入
            </span>
          )}
          <span className="rounded-md bg-accent/10 px-2 py-0.5 text-[11px] font-semibold text-accent">
            {q.firm}
          </span>
        </div>
      </div>

      {/* Title (Chinese only) */}
      <h2 className="mt-4 text-base font-semibold leading-snug text-foreground">{q.titleZh}</h2>
      <p className="mt-1 text-xs text-muted">
        {q.vendor} · {questionCount} 题
      </p>
      {q.imported && q.sourceName && (
        <p className="mt-1 truncate text-[11px] text-muted" title={q.sourceName}>
          来源文件：{q.sourceName}
        </p>
      )}

      {/* Meta: progress + current activity + next milestone */}
      <div className="mt-4 space-y-2.5">
        <div>
          <div className="mb-1 flex items-center justify-between text-[11px] text-muted">
            <span>进度</span>
            <span className="tabular-nums">
              {prog.done}/{prog.total} 题 · {prog.pct}%
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-secondary">
            <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${prog.pct}%` }} />
          </div>
        </div>
        <div className="flex items-start gap-1.5 text-xs leading-relaxed">
          <Icon icon="gravity-ui:circle-dashed" className="mt-0.5 size-3.5 shrink-0 text-muted" />
          <span className="text-foreground">
            <span className="text-muted">当前 · </span>
            {q.status}
          </span>
        </div>
        <div className="flex items-start gap-1.5 text-xs leading-relaxed">
          <Icon icon="gravity-ui:calendar" className="mt-0.5 size-3.5 shrink-0 text-muted" />
          <span className="text-foreground">
            <span className="text-muted">下一节点 · </span>
            {q.nextMilestone.label} {q.nextMilestone.date}
            {due && <span className="text-muted"> （{due}）</span>}
          </span>
        </div>
      </div>

      {/* Footer actions */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4">
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" isDisabled={exporting} onPress={onExport}>
            <Icon icon="gravity-ui:arrow-down-to-line" className="size-3.5" />
            {exporting ? "导出中…" : "导出 Excel"}
          </Button>
          {q.imported && (
            <Button variant="ghost" size="sm" onPress={onDelete} aria-label={`删除 ${q.titleZh}`}>
              <Icon icon="gravity-ui:trash-bin" className="size-3.5" />
              删除
            </Button>
          )}
        </div>
        <Button variant="primary" size="sm" onPress={() => navigate(`/q/${q.slug}`)}>
          进入编辑
          <Icon icon="gravity-ui:arrow-right" className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}

/** AI-Infra 2026 — the embedded-doc + provenance questionnaire. Distinct shape
 *  (live Tencent Docs, no local answer set), so it gets its own card. */
function AiInfraCard() {
  const navigate = useNavigate();
  const total = AI_INFRA_QUESTIONS.length;
  const withDoc = useMemo(() => AI_INFRA_QUESTIONS.filter((q) => docFor(q.id)).length, []);
  const pct = total ? Math.round((withDoc / total) * 100) : 0;

  return (
    <div className="flex flex-col rounded-2xl border border-border bg-surface p-5 transition-all hover:border-accent/40 hover:shadow-overlay">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-surface-secondary px-2 text-[11px] font-semibold text-foreground">
            <Icon icon="gravity-ui:file-text" className="size-3.5 text-accent" />
            腾讯文档内嵌
          </span>
          <span className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-surface-secondary px-2 text-[11px] font-semibold text-foreground">
            <Icon icon="gravity-ui:shield-check" className="size-3.5 text-accent" />
            证据链
          </span>
        </div>
        <span className="shrink-0 rounded-md bg-accent/10 px-2 py-0.5 text-[11px] font-semibold text-accent">
          {AI_INFRA_FIRM}
        </span>
      </div>

      <h2 className="mt-4 text-base font-semibold leading-snug text-foreground">{AI_INFRA_TITLE}</h2>
      <p className="mt-1 text-xs text-muted">Tencent Cloud · {total} 题 · 内嵌文档协作</p>

      <div className="mt-4 space-y-2.5">
        <div>
          <div className="mb-1 flex items-center justify-between text-[11px] text-muted">
            <span>已建文档</span>
            <span className="tabular-nums">
              {withDoc}/{total} 题 · {pct}%
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-secondary">
            <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>
        <div className="flex items-start gap-1.5 text-xs leading-relaxed">
          <Icon icon="gravity-ui:circle-dashed" className="mt-0.5 size-3.5 shrink-0 text-muted" />
          <span className="text-foreground">
            <span className="text-muted">当前 · </span>
            内嵌文档已就绪，证据待 grounding 生成
          </span>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-end gap-2 border-t border-border pt-4">
        <Button variant="primary" size="sm" onPress={() => navigate(`/${AI_INFRA_SLUG}`)}>
          进入编辑
          <Icon icon="gravity-ui:arrow-right" className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}

/** Landing page — a launcher listing the in-progress questionnaires. */
export function HomePage() {
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>(getAllQuestionnaires);
  const refreshQuestionnaires = () => setQuestionnaires(getAllQuestionnaires());

  return (
    <div className="min-h-dvh bg-background">
      <SiteNavbar />
      <main className="mx-auto max-w-5xl px-6 py-10">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold text-foreground">进行中的问卷</h1>
          <p className="mt-1 text-sm text-muted">
            选择一份分析师问卷进入协作填写 · Analyst Questionnaire Workspace
          </p>
        </header>

        <QuestionnaireUpload onImported={refreshQuestionnaires} />

        <div className="grid gap-4 sm:grid-cols-2">
          <AiInfraCard />
          {questionnaires.map((q) => (
            <QuestionnaireCard key={q.id} q={q} onDeleted={refreshQuestionnaires} />
          ))}
        </div>
      </main>
    </div>
  );
}
