"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  BadgeCheck,
  ChevronDown,
  CheckCircle2,
  ClipboardCheck,
  Copy,
  FileCheck2,
  FileSearch,
  Languages,
  ListChecks,
  Loader2,
  PenLine,
  Pin,
  Quote,
  RefreshCw,
  RotateCw,
  ShieldCheck,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import { useLocale } from "@/lib/i18n";
import type { Locale } from "@/lib/dictionaries";

// one icon per pipeline step (order matches audit.steps in the dictionary)
const STEP_ICONS = [FileSearch, FileCheck2, PenLine, Languages, ListChecks];

// sub-skill chip styling (the real sub-skills the runner orchestrates)
const SKILL_STYLE: Record<string, string> = {
  grounding: "border-sky-200 bg-sky-50 text-sky-700",
  wording: "border-violet-200 bg-violet-50 text-violet-700",
  "quality-checker": "border-amber-200 bg-amber-50 text-amber-700",
};

const TAG_KEYS = ["cited", "inferred", "review"] as const;
const TAG_STYLE: Record<(typeof TAG_KEYS)[number], string> = {
  cited: "border-emerald-200 bg-emerald-50 text-emerald-700",
  inferred: "border-sky-200 bg-sky-50 text-sky-700",
  review: "border-amber-200 bg-amber-50 text-amber-700",
};
const TAG_COUNTS = { cited: 8, inferred: 2, review: 2 };

type AuditTag = (typeof TAG_KEYS)[number];

type InspectorItem = {
  id: string;
  title: string;
  source: string;
  claim: string;
  quote: string;
  tag: AuditTag;
  score: number;
};

type InspectorCheck = {
  id: string;
  label: string;
  detail: string;
  done: boolean;
};

type InspectorPanel = {
  statLabel: string;
  statValue: string;
  note: string;
  items: InspectorItem[];
  checks: InspectorCheck[];
};

const INSPECTOR_LABELS: Record<
  Locale,
  {
    evidence: string;
    claim: string;
    source: string;
    quote: string;
    confidence: string;
    pin: string;
    pinned: string;
    copy: string;
    copied: string;
    checks: string;
    openCheck: string;
  }
> = {
  en: {
    evidence: "Evidence candidates",
    claim: "Claim",
    source: "Source",
    quote: "Verbatim / working text",
    confidence: "Confidence",
    pin: "Pin evidence",
    pinned: "Pinned",
    copy: "Copy quote",
    copied: "Copied",
    checks: "Checks",
    openCheck: "Inspect",
  },
  zh: {
    evidence: "证据候选",
    claim: "论点",
    source: "来源",
    quote: "原文 / 工作稿",
    confidence: "置信度",
    pin: "锁定证据",
    pinned: "已锁定",
    copy: "复制原文",
    copied: "已复制",
    checks: "检查项",
    openCheck: "查看",
  },
};

const INSPECTOR_PANELS: Record<Locale, InspectorPanel[]> = {
  en: [
    {
      statLabel: "retrieved",
      statValue: "12 -> 8",
      note: "Click a candidate to see why it was kept and what claim it can support.",
      items: [
        {
          id: "grounding-rpo",
          title: "RPO / RTO clause",
          source: "SLA_terms_v3.pdf §4.2",
          claim: "RPO approaches zero; automatic failover RTO is under 30s.",
          quote: "Automatic failover completes within 30 seconds when the strongly-consistent group is healthy.",
          tag: "cited",
          score: 96,
        },
        {
          id: "grounding-region",
          title: "Multi-region topology",
          source: "TDSQL_whitepaper.pdf p.18",
          claim: "The reference architecture spans 5 geographic regions.",
          quote: "The deployment pattern covers five regions with active replicas and read traffic isolation.",
          tag: "cited",
          score: 91,
        },
        {
          id: "grounding-mode",
          title: "Sync / async modes",
          source: "docs.tencentcloud.com",
          claim: "Synchronous and asynchronous replication modes are configurable per cluster.",
          quote: "The doc implies mode switching, but Product should verify no-downtime behavior before submission.",
          tag: "review",
          score: 74,
        },
      ],
      checks: [
        { id: "dedupe", label: "Deduplicated similar passages", detail: "Grouped 12 hits into 8 unique evidence candidates.", done: true },
        { id: "review", label: "Flagged reviewer-sensitive claims", detail: "2 claims need Product confirmation before final submission.", done: true },
      ],
    },
    {
      statLabel: "lint",
      statValue: "0 block",
      note: "Evidence lint checks whether every fact has a tag, source, and usable quote.",
      items: [
        {
          id: "lint-cited",
          title: "CITED coverage",
          source: "quality-checker",
          claim: "Every factual sentence carries a source-backed tag.",
          quote: "8 CITED facts include a supporting quote and source pointer.",
          tag: "cited",
          score: 100,
        },
        {
          id: "lint-inferred",
          title: "Inference guardrail",
          source: "quality-checker",
          claim: "Inferences are separated from direct claims.",
          quote: "2 INFERRED statements remain visible to reviewers instead of being hidden in prose.",
          tag: "inferred",
          score: 86,
        },
        {
          id: "lint-review",
          title: "Review hooks",
          source: "quality-checker",
          claim: "Reviewer-owned claims stay marked for Product / Kevin.",
          quote: "The RPO/RTO and no-downtime claims require final Product sign-off.",
          tag: "review",
          score: 78,
        },
      ],
      checks: [
        { id: "quote", label: "Quote attached", detail: "All CITED facts have a direct supporting excerpt.", done: true },
        { id: "block", label: "No blocking gap", detail: "No fact is missing both source and reviewer owner.", done: true },
      ],
    },
    {
      statLabel: "draft",
      statValue: "1480 chars",
      note: "The draft step turns selected evidence into structured answer prose.",
      items: [
        {
          id: "draft-shape",
          title: "Answer shape",
          source: "wording",
          claim: "Enumerated answer format fits Gartner questionnaire style.",
          quote: "1. Multi-region replication; 2. failover targets; 3. customer proof point.",
          tag: "cited",
          score: 89,
        },
        {
          id: "draft-hook",
          title: "Reviewer hook",
          source: "[REVIEW: product]",
          claim: "The draft preserves a human verification checkpoint.",
          quote: "[REVIEW: product] Confirm whether no-downtime switching applies to every mode.",
          tag: "review",
          score: 76,
        },
        {
          id: "draft-proof",
          title: "Proof-point gap",
          source: "finance_vertical_case_study.docx",
          claim: "Finance case study should be attached before final answer.",
          quote: "Case study exists but has not yet been merged into Q14.",
          tag: "inferred",
          score: 68,
        },
      ],
      checks: [
        { id: "structure", label: "Structured for scanability", detail: "The answer uses numbered proof points instead of a dense paragraph.", done: true },
        { id: "owner", label: "Reviewer owner retained", detail: "Product-owned unresolved claims remain marked inline.", done: true },
      ],
    },
    {
      statLabel: "voice",
      statValue: "Gartner",
      note: "The English pass reframes the Chinese draft without losing citations.",
      items: [
        {
          id: "reframe-voice",
          title: "Analyst voice",
          source: "wording",
          claim: "The answer sounds like a submission, not a marketing page.",
          quote: "We state measurable architecture behavior first, then attach proof points.",
          tag: "cited",
          score: 88,
        },
        {
          id: "reframe-term",
          title: "Term lock",
          source: "shared glossary",
          claim: "RPO, RTO, TDSQL, and multi-region terms stay consistent.",
          quote: "Locked terms are preserved through reframe instead of translated loosely.",
          tag: "cited",
          score: 93,
        },
        {
          id: "reframe-risk",
          title: "Claim risk",
          source: "quality-checker",
          claim: "No-downtime wording remains under review.",
          quote: "The English version keeps the Product review marker attached to the risky claim.",
          tag: "review",
          score: 72,
        },
      ],
      checks: [
        { id: "literal", label: "Not a literal translation", detail: "The pass rewrites structure and tone while preserving evidence IDs.", done: true },
        { id: "terms", label: "Glossary respected", detail: "Locked technical terms were not rewritten.", done: true },
      ],
    },
    {
      statLabel: "ready",
      statValue: "0 gaps",
      note: "Pre-submission lint checks export readiness and unresolved placeholders.",
      items: [
        {
          id: "final-limit",
          title: "Word limit",
          source: "quality-checker",
          claim: "The draft fits the 1500-character limit.",
          quote: "1480 / 1500 characters; plain-text export is safe.",
          tag: "cited",
          score: 99,
        },
        {
          id: "final-placeholder",
          title: "Placeholder scan",
          source: "quality-checker",
          claim: "No unresolved placeholder remains in the answer.",
          quote: "0 placeholders; 0 banned phrases; 0 uncited claims.",
          tag: "cited",
          score: 100,
        },
        {
          id: "final-export",
          title: "Export packet",
          source: "submission pack",
          claim: "Answer, citations, and audit trail can be exported together.",
          quote: "Includes answer text, source map, reviewer hooks, and generation log.",
          tag: "inferred",
          score: 84,
        },
      ],
      checks: [
        { id: "limits", label: "Limits passed", detail: "Character count and plain-text formatting passed.", done: true },
        { id: "export", label: "Exportable audit pack", detail: "Source map and generation log are attached.", done: true },
      ],
    },
  ],
  zh: [
    {
      statLabel: "检索结果",
      statValue: "12 -> 8",
      note: "点击任一候选，查看它为什么被保留、能支撑哪个论点。",
      items: [
        {
          id: "grounding-rpo",
          title: "RPO / RTO 条款",
          source: "SLA_terms_v3.pdf §4.2",
          claim: "RPO 接近 0；自动故障切换 RTO 小于 30 秒。",
          quote: "强一致组健康时，自动故障切换可在 30 秒内完成。",
          tag: "cited",
          score: 96,
        },
        {
          id: "grounding-region",
          title: "多地域拓扑",
          source: "TDSQL_whitepaper.pdf p.18",
          claim: "参考架构覆盖 5 个地理地域。",
          quote: "部署模式覆盖五个地域，包含活跃副本与读流量隔离。",
          tag: "cited",
          score: 91,
        },
        {
          id: "grounding-mode",
          title: "同步 / 异步模式",
          source: "docs.tencentcloud.com",
          claim: "同步和异步复制模式可按集群配置。",
          quote: "文档暗示可切换模式，但提交前需要产品确认无停机表述。",
          tag: "review",
          score: 74,
        },
      ],
      checks: [
        { id: "dedupe", label: "相似段落去重", detail: "把 12 条命中聚合成 8 条独立证据候选。", done: true },
        { id: "review", label: "标出敏感论点", detail: "2 条论点需要产品确认后才能进入最终提交。", done: true },
      ],
    },
    {
      statLabel: "质检",
      statValue: "0 block",
      note: "证据质检会检查每条事实是否有 tag、来源和可用原文。",
      items: [
        {
          id: "lint-cited",
          title: "CITED 覆盖",
          source: "quality-checker",
          claim: "每个事实句都带有来源支撑的标签。",
          quote: "8 条 CITED fact 均包含支撑原文与来源指针。",
          tag: "cited",
          score: 100,
        },
        {
          id: "lint-inferred",
          title: "推断护栏",
          source: "quality-checker",
          claim: "推断表述与直接引用被分开处理。",
          quote: "2 条 INFERRED 表述对评审人保持可见，不混进正文。",
          tag: "inferred",
          score: 86,
        },
        {
          id: "lint-review",
          title: "评审钩子",
          source: "quality-checker",
          claim: "产品 / Kevin 负责的论点保持 review 标记。",
          quote: "RPO/RTO 与无停机切换表述需要最终产品审核。",
          tag: "review",
          score: 78,
        },
      ],
      checks: [
        { id: "quote", label: "原文已附上", detail: "所有 CITED fact 都有直接支撑原文。", done: true },
        { id: "block", label: "无阻塞缺口", detail: "没有事实同时缺来源和负责人。", done: true },
      ],
    },
    {
      statLabel: "草稿",
      statValue: "1480 字",
      note: "起草步骤会把选中的证据组织成可提交的答案结构。",
      items: [
        {
          id: "draft-shape",
          title: "答案结构",
          source: "wording",
          claim: "列举式结构更适合 Gartner 问卷。",
          quote: "1. 多地域复制；2. 故障切换指标；3. 客户证明点。",
          tag: "cited",
          score: 89,
        },
        {
          id: "draft-hook",
          title: "评审钩子",
          source: "[REVIEW: product]",
          claim: "草稿保留了人工确认点。",
          quote: "[REVIEW: product] 确认无停机切换是否适用于所有模式。",
          tag: "review",
          score: 76,
        },
        {
          id: "draft-proof",
          title: "证明点缺口",
          source: "finance_vertical_case_study.docx",
          claim: "最终答案前应补入 Finance 行业案例。",
          quote: "案例已存在，但尚未合入 Q14。",
          tag: "inferred",
          score: 68,
        },
      ],
      checks: [
        { id: "structure", label: "便于扫描", detail: "答案使用编号证明点，而不是一整段密集文字。", done: true },
        { id: "owner", label: "保留评审负责人", detail: "产品负责的未决论点仍在正文内标记。", done: true },
      ],
    },
    {
      statLabel: "语气",
      statValue: "Gartner",
      note: "英文重构会改写表达，而不是直译，同时保留引用关系。",
      items: [
        {
          id: "reframe-voice",
          title: "分析师语气",
          source: "wording",
          claim: "答案听起来像提交材料，而不是营销页面。",
          quote: "先陈述可量化架构行为，再附上证明点。",
          tag: "cited",
          score: 88,
        },
        {
          id: "reframe-term",
          title: "术语锁定",
          source: "shared glossary",
          claim: "RPO、RTO、TDSQL、多地域等术语保持一致。",
          quote: "锁定术语在重构过程中保留，不被随意改写。",
          tag: "cited",
          score: 93,
        },
        {
          id: "reframe-risk",
          title: "论点风险",
          source: "quality-checker",
          claim: "无停机相关表述仍保持 review 状态。",
          quote: "英文版本把产品评审标记继续挂在高风险表述上。",
          tag: "review",
          score: 72,
        },
      ],
      checks: [
        { id: "literal", label: "非直译", detail: "重构了结构和语气，但保留证据 ID。", done: true },
        { id: "terms", label: "遵守术语表", detail: "锁定技术术语没有被改写。", done: true },
      ],
    },
    {
      statLabel: "就绪",
      statValue: "0 缺口",
      note: "提交前质检会检查导出状态和未解决占位符。",
      items: [
        {
          id: "final-limit",
          title: "字数限制",
          source: "quality-checker",
          claim: "草稿符合 1500 字限制。",
          quote: "1480 / 1500 字；plain-text 导出安全。",
          tag: "cited",
          score: 99,
        },
        {
          id: "final-placeholder",
          title: "占位符扫描",
          source: "quality-checker",
          claim: "答案中没有未解决占位符。",
          quote: "0 占位符；0 禁用表述；0 无引用论点。",
          tag: "cited",
          score: 100,
        },
        {
          id: "final-export",
          title: "导出包",
          source: "submission pack",
          claim: "答案、引用和审计链可以一起导出。",
          quote: "包含答案正文、来源映射、评审钩子与生成日志。",
          tag: "inferred",
          score: 84,
        },
      ],
      checks: [
        { id: "limits", label: "限制已通过", detail: "字数与纯文本格式检查通过。", done: true },
        { id: "export", label: "审计包可导出", detail: "来源映射与生成日志已附上。", done: true },
      ],
    },
  ],
};

function StepInspector({
  panel,
  labels,
  tagLabels,
}: {
  panel: InspectorPanel;
  labels: (typeof INSPECTOR_LABELS)[Locale];
  tagLabels: Record<AuditTag, string>;
}) {
  const [activeItemId, setActiveItemId] = useState(panel.items[0]?.id ?? "");
  const [openCheckId, setOpenCheckId] = useState(panel.checks[0]?.id ?? "");
  const [pinnedIds, setPinnedIds] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const activeItem = panel.items.find((item) => item.id === activeItemId) ?? panel.items[0];
  const openCheck = panel.checks.find((check) => check.id === openCheckId);
  const isPinned = activeItem ? pinnedIds.has(activeItem.id) : false;

  const togglePinned = () => {
    if (!activeItem) return;
    setPinnedIds((prev) => {
      const next = new Set(prev);
      if (next.has(activeItem.id)) next.delete(activeItem.id);
      else next.add(activeItem.id);
      return next;
    });
  };

  const copyQuote = async () => {
    if (!activeItem) return;
    try {
      await navigator.clipboard?.writeText(activeItem.quote);
    } catch {
      // Keep the optimistic copied state even when the browser blocks clipboard access.
    }
    setCopiedId(activeItem.id);
  };

  return (
    <div className="mt-2 overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50">
      <div className="flex flex-wrap items-center gap-2 border-b border-zinc-200 bg-white/70 px-3 py-2">
        <span className="rounded-full bg-zinc-900 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
          {panel.statValue}
        </span>
        <span className="text-[11px] font-medium text-zinc-500">{panel.statLabel}</span>
        <span className="min-w-0 flex-1 text-[11px] text-zinc-400">{panel.note}</span>
      </div>

      <div className="grid gap-0 sm:grid-cols-[0.84fr_1fr]">
        <div className="border-b border-zinc-200 p-2 sm:border-r sm:border-b-0">
          <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
            {labels.evidence}
          </p>
          <div className="space-y-1.5">
            {panel.items.map((item) => {
              const isActive = item.id === activeItem?.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveItemId(item.id)}
                  className={cn(
                    "flex w-full items-start gap-2 rounded-xl border px-2.5 py-2 text-left transition",
                    isActive
                      ? "border-sky-200 bg-white shadow-sm"
                      : "border-transparent hover:border-zinc-200 hover:bg-white/80",
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 h-2 w-2 shrink-0 rounded-full",
                      item.tag === "cited" && "bg-emerald-500",
                      item.tag === "inferred" && "bg-sky-500",
                      item.tag === "review" && "bg-amber-500",
                    )}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-medium text-zinc-800">{item.title}</span>
                    <span className="block truncate text-[11px] text-zinc-400">{item.source}</span>
                  </span>
                  <span className="font-mono text-[10px] tabular-nums text-zinc-400">{item.score}%</span>
                </button>
              );
            })}
          </div>
        </div>

        {activeItem && (
          <div className="min-w-0 p-3">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold",
                  TAG_STYLE[activeItem.tag],
                )}
              >
                {tagLabels[activeItem.tag]}
              </span>
              <span className="min-w-0 truncate text-[11px] text-zinc-400">
                {labels.source}: {activeItem.source}
              </span>
            </div>

            <div className="mt-3 space-y-2">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">{labels.claim}</p>
                <p className="mt-1 text-sm font-medium leading-snug text-zinc-800">{activeItem.claim}</p>
              </div>

              <div className="rounded-xl border border-zinc-200 bg-white px-3 py-2">
                <div className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
                  <Quote className="h-3 w-3" />
                  {labels.quote}
                </div>
                <p className="text-xs leading-relaxed text-zinc-600">{activeItem.quote}</p>
              </div>
            </div>

            <div className="mt-3">
              <div className="mb-1 flex items-center justify-between text-[11px] text-zinc-500">
                <span>{labels.confidence}</span>
                <span className="font-mono tabular-nums">{activeItem.score}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-zinc-200">
                <motion.div
                  key={activeItem.id}
                  initial={{ width: 0 }}
                  animate={{ width: `${activeItem.score}%` }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="h-full rounded-full bg-[#00bbff]"
                />
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={togglePinned}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition",
                  isPinned
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-zinc-200 bg-white text-zinc-600 hover:border-sky-200 hover:text-sky-700",
                )}
              >
                {isPinned ? <ClipboardCheck className="h-3 w-3" /> : <Pin className="h-3 w-3" />}
                {isPinned ? labels.pinned : labels.pin}
              </button>
              <button
                type="button"
                onClick={copyQuote}
                className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-[11px] font-medium text-zinc-600 transition hover:border-zinc-300 hover:text-zinc-900"
              >
                {copiedId === activeItem.id ? <CheckCircle2 className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                {copiedId === activeItem.id ? labels.copied : labels.copy}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-zinc-200 bg-white/60 px-3 py-2">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-zinc-400">{labels.checks}</p>
        <div className="grid gap-1.5 sm:grid-cols-2">
          {panel.checks.map((check) => {
            const isOpen = check.id === openCheckId;
            return (
              <button
                key={check.id}
                type="button"
                onClick={() => setOpenCheckId(isOpen ? "" : check.id)}
                className={cn(
                  "flex items-center gap-2 rounded-xl border px-2.5 py-2 text-left transition",
                  isOpen ? "border-sky-200 bg-sky-50" : "border-zinc-200 bg-white hover:border-zinc-300",
                )}
              >
                <CheckCircle2 className={cn("h-3.5 w-3.5 shrink-0", check.done ? "text-emerald-500" : "text-zinc-300")} />
                <span className="min-w-0 flex-1 truncate text-xs font-medium text-zinc-700">{check.label}</span>
                <span className="text-[10px] text-zinc-400">{labels.openCheck}</span>
              </button>
            );
          })}
        </div>
        <AnimatePresence initial={false}>
          {openCheck && (
            <motion.p
              key={openCheck.id}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="overflow-hidden pt-2 text-xs leading-relaxed text-zinc-500"
            >
              {openCheck.detail}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export function AuditTrail() {
  const { locale, t } = useLocale();
  const a = t.features.f2.audit;
  const labels = INSPECTOR_LABELS[locale];
  const panels = INSPECTOR_PANELS[locale];
  const N = a.steps.length;

  const [done, setDone] = useState(0); // number of completed steps
  const [running, setRunning] = useState(false);
  const [open, setOpen] = useState<number | null>(null);

  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  // play the pipeline once it scrolls into view
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          setRunning(true);
        }
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // advance one step at a time while running
  useEffect(() => {
    if (!running) return;
    if (done >= N) {
      const t = setTimeout(() => setRunning(false), 0);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setDone((d) => d + 1), done === 0 ? 400 : 620);
    return () => clearTimeout(t);
  }, [running, done, N]);

  const replay = useCallback(() => {
    setOpen(null);
    setDone(0);
    setRunning(true);
  }, []);

  return (
    <div ref={ref} className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
      {/* header */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-sky-50 text-sky-600">
          <ShieldCheck className="h-4 w-4" />
        </span>
        <span className="text-sm font-medium text-zinc-800">{a.title}</span>
        {running ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-600">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
            {a.statusRunning}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold tracking-wide text-emerald-600">
            <BadgeCheck className="h-3 w-3" />
            {a.statusReady}
          </span>
        )}
        <span className="ml-auto flex items-center gap-2">
          <span className="hidden rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[11px] text-zinc-500 sm:inline">
            {a.model}
          </span>
          <button
            type="button"
            onClick={replay}
            disabled={running}
            className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-[11px] font-medium text-zinc-600 transition hover:border-zinc-300 hover:text-zinc-900 disabled:opacity-50"
          >
            <RotateCw className={cn("h-3 w-3", running && "animate-spin")} />
            {a.replay}
          </button>
        </span>
      </div>

      {/* audit-tag legend (provenance taxonomy) */}
      <div className="mb-5 flex flex-wrap gap-1.5">
        {TAG_KEYS.map((k) => (
          <span
            key={k}
            className={cn(
              "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium",
              TAG_STYLE[k],
            )}
          >
            {a.tags[k]}
            <span className="tabular-nums opacity-70">{TAG_COUNTS[k]}</span>
          </span>
        ))}
      </div>

      {/* generation chain */}
      <ol className="flex flex-col">
        {a.steps.map((s, i) => {
          const Icon = STEP_ICONS[i] ?? FileSearch;
          const isDone = i < done;
          const isActive = i === done && running;
          const isPending = i > done;
          const isLast = i === N - 1;
          const isOpen = open === i;
          return (
            <li key={s.step} className={cn("flex gap-3 transition-opacity", isPending && "opacity-40")}>
              {/* node + connector */}
              <div className="flex flex-col items-center">
                <span
                  className={cn(
                    "grid h-8 w-8 shrink-0 place-items-center rounded-full border bg-white shadow-sm transition-colors",
                    isActive
                      ? "border-sky-300 text-sky-600 ring-2 ring-sky-200"
                      : isDone
                        ? "border-zinc-200 text-sky-600"
                        : "border-zinc-200 text-zinc-400",
                  )}
                >
                  {isActive ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" />}
                </span>
                {!isLast && (
                  <span
                    className={cn(
                      "my-1 w-px flex-1 transition-colors",
                      isDone ? "bg-sky-200" : "bg-zinc-200",
                    )}
                  />
                )}
              </div>

              {/* content */}
              <div className={cn("min-w-0 flex-1", !isLast && "pb-3")}>
                <button
                  type="button"
                  disabled={!isDone}
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center gap-2 py-1 text-left disabled:cursor-default"
                  aria-expanded={isOpen}
                >
                  <span className="text-sm font-medium text-zinc-800">{s.step}</span>
                  <span
                    className={cn(
                      "rounded-md border px-1.5 py-0.5 text-[10px] font-medium",
                      SKILL_STYLE[s.skill] ?? "border-zinc-200 bg-zinc-50 text-zinc-500",
                    )}
                  >
                    {s.skill}
                  </span>
                  <span className="ml-auto font-mono text-[11px] tabular-nums text-zinc-400">
                    {s.time}
                  </span>
                  {isDone && (
                    <ChevronDown
                      className={cn(
                        "h-3.5 w-3.5 shrink-0 text-zinc-400 transition-transform",
                        isOpen && "rotate-180",
                      )}
                    />
                  )}
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && isDone && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-1">
                        <p className="break-words rounded-lg bg-zinc-50 px-3 py-2 font-mono text-xs leading-relaxed text-zinc-600">
                          {s.detail}
                        </p>
                        <StepInspector panel={panels[i] ?? panels[0]} labels={labels} tagLabels={a.tags} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </li>
          );
        })}
      </ol>

      {/* footer */}
      <div className="mt-1 flex items-center gap-1.5 border-t border-zinc-100 pt-3 text-xs text-zinc-400">
        <RefreshCw className="h-3 w-3" /> {a.reproducible}
      </div>
    </div>
  );
}
