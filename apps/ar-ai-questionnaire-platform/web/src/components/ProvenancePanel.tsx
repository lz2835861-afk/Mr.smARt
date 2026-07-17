import { useState, type ReactNode } from "react";
import { Icon } from "@iconify/react";
import { cn } from "../lib/utils";
import type { Provenance, ProvSource } from "../types/provenance";
import { isProvenanceEmpty } from "../data/aiInfra";

// ─────────────────────────────────────────────────────────────────────────────
// Source chip — brand icon resolved from the source URL (mirrors ReasoningSheet).
// ─────────────────────────────────────────────────────────────────────────────

type Brand = "wechat" | "tcloud" | "nvidia" | "web";

function brandOf(url: string): Brand {
  let host: string;
  try {
    host = new URL(url).hostname.toLowerCase();
  } catch {
    host = "";
  }
  if (host.includes("weixin.qq.com") || host.includes("mp.weixin")) return "wechat";
  if (host.endsWith("tencentcloud.com") || host.endsWith("cloud.tencent.com")) return "tcloud";
  if (host.includes("nvidia.")) return "nvidia";
  return "web";
}

function TencentCloudMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className={cn("shrink-0", className)}>
      <path d="M20.0483 17.1416C19.6945 17.4914 18.987 18.0161 17.7488 18.0161C17.2182 18.0161 16.5991 18.0161 16.3338 18.0161C15.98 18.0161 13.3268 18.0161 10.143 18.0161C12.4424 15.8298 14.3881 13.9932 14.565 13.8183C14.7419 13.6434 15.1841 13.2061 15.6263 12.8563C16.5107 12.0692 17.2182 11.9817 17.8373 11.9817C18.7217 11.9817 19.4292 12.3316 20.0483 12.8563C21.2864 13.9932 21.2864 16.0047 20.0483 17.1416ZM21.5518 11.457C20.6674 10.495 19.3408 9.88281 17.9257 9.88281C16.6875 9.88281 15.6263 10.3201 14.6534 11.0197C14.2997 11.3695 13.769 11.7194 13.3268 12.2441C12.9731 12.5939 5.36719 19.9401 5.36719 19.9401C5.80939 20.0276 6.34003 20.0276 6.78223 20.0276C7.22443 20.0276 16.0685 20.0276 16.4222 20.0276C17.1298 20.0276 17.6604 20.0276 18.191 19.9401C19.3408 19.8527 20.4905 19.4154 21.4633 18.5409C23.4975 16.6168 23.4975 13.381 21.5518 11.457Z" fill="#00A3FF" />
      <path d="M9.1701 10.9323C8.19726 10.2326 7.22442 9.88281 6.07469 9.88281C4.65965 9.88281 3.33304 10.495 2.44864 11.457C0.502952 13.4685 0.502952 16.6168 2.53708 18.6283C3.42148 19.4154 4.30589 19.8527 5.36717 19.9401L7.4013 18.0161C7.04754 18.0161 6.60533 18.0161 6.25157 18.0161C5.10185 17.9287 4.39433 17.5789 3.95212 17.1416C2.71396 15.9172 2.71396 13.9932 3.86368 12.7688C4.48277 12.1566 5.19029 11.8943 6.07469 11.8943C6.60533 11.8943 7.4013 11.9817 8.19726 12.7688C8.55102 13.1186 9.52386 13.8183 9.87763 14.1681H9.96607L11.2927 12.8563V12.7688C10.6736 12.1566 9.70075 11.3695 9.1701 10.9323Z" fill="#00C8DC" />
      <path d="M18.4564 8.74536C17.4836 6.12171 14.9188 4.28516 12.0003 4.28516C8.5511 4.28516 5.80945 6.82135 5.27881 9.96973C5.54413 9.96973 5.80945 9.88228 6.16321 9.88228C6.51697 9.88228 6.95917 9.96973 7.31294 9.96973C7.75514 7.78336 9.70082 6.20917 12.0003 6.20917C13.946 6.20917 15.6263 7.34608 16.4223 9.00773C16.4223 9.00773 16.5107 9.09518 16.5107 9.00773C17.1298 8.92027 17.8373 8.74536 18.4564 8.74536C18.4564 8.83282 18.4564 8.83282 18.4564 8.74536Z" fill="#006EFF" />
    </svg>
  );
}

function SourceChip({ url }: { url: string }) {
  const brand = brandOf(url);
  const wrap = (extra: string, child: ReactNode) => (
    <span
      className={cn(
        "flex size-7 items-center justify-center overflow-hidden rounded-lg border border-separator/60 bg-surface-secondary shrink-0",
        extra,
      )}
    >
      {child}
    </span>
  );
  if (brand === "wechat")
    return wrap("border-transparent bg-[#07C160]", <Icon icon="ri:wechat-fill" className="size-[21px] text-white" />);
  if (brand === "tcloud") return wrap("", <TencentCloudMark className="size-[15px]" />);
  if (brand === "nvidia")
    return wrap("", <Icon icon="simple-icons:nvidia" className="size-[15px]" style={{ color: "#76B900" }} />);
  return wrap("", <Icon icon="gravity-ui:globe" className="size-[15px] text-muted" />);
}

// ─────────────────────────────────────────────────────────────────────────────
// Collapsible section (rail icon + connector), matching ReasoningSheet spirit.
// ─────────────────────────────────────────────────────────────────────────────

function Section({
  icon,
  title,
  count,
  defaultOpen,
  last,
  children,
}: {
  icon: ReactNode;
  title: string;
  count?: number;
  defaultOpen?: boolean;
  last?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <div className="flex gap-3">
      <div className="flex shrink-0 flex-col items-center">
        <span className="flex size-8 items-center justify-center rounded-[11px] bg-accent/10 text-accent">{icon}</span>
        {!last && <span className="my-1 min-h-3 w-px flex-1 bg-separator/70" />}
      </div>
      <div className={cn("min-w-0 flex-1", last ? "pb-1" : "pb-4")}>
        <button type="button" onClick={() => setOpen((o) => !o)} className="flex w-full items-center gap-1.5 pt-1 text-left cursor-[var(--cursor-interactive)]">
          <span className="text-[13px] font-semibold text-foreground">{title}</span>
          {count != null && (
            <span className="rounded-full bg-surface-secondary px-1.5 py-0.5 text-[10.5px] font-semibold leading-none text-muted tabular-nums">
              {count}
            </span>
          )}
          <Icon
            icon="gravity-ui:chevron-down"
            className={cn("size-3.5 text-muted transition-transform duration-200", open && "rotate-180")}
          />
        </button>
        <div className={cn("grid transition-[grid-template-rows] duration-300 ease-out", open ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
          <div className="overflow-hidden">
            <div className="pt-2.5">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Render a quote with its leading [tag] highlighted in accent. */
function QuoteText({ text }: { text: string }) {
  const m = text.match(/^(\s*\[[^\]]+\])([\s\S]*)$/);
  if (!m) return <>{text}</>;
  return (
    <>
      <span className="font-semibold text-accent">{m[1]}</span>
      {m[2]}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Header — "PROVENANCE / 生成式 AI 能力栈" style eyebrow + question title.
// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  /** Question id, e.g. "2.1.1". */
  questionId: string;
  /** Section + dimension context for the eyebrow line. */
  contextLabel: string;
  /** The question's 填写指引 — always shown so the panel is useful pre-grounding. */
  guidance: string;
  /** Fetched provenance, or null while loading / on 404. */
  provenance: Provenance | null;
  /** True while the /provenance fetch is in flight. */
  loading: boolean;
  /** True when there is a doc but the provenance file 404'd. */
  notFound: boolean;
}

function SourceRow({ s }: { s: ProvSource }) {
  return (
    <a
      href={s.url}
      target="_blank"
      rel="noreferrer"
      className="group flex items-start gap-2.5 rounded-[10px] px-2.5 py-2 transition-colors hover:bg-surface-secondary"
    >
      <SourceChip url={s.url} />
      <span className="min-w-0">
        <span className="block text-[12.5px] leading-snug text-foreground group-hover:text-accent">{s.label}</span>
        <span className="mt-0.5 block break-all text-[11px] text-muted/80">{s.url}</span>
      </span>
    </a>
  );
}

export function ProvenancePanel({ questionId, contextLabel, guidance, provenance, loading, notFound }: Props) {
  const empty = isProvenanceEmpty(provenance);
  const sources = provenance?.sources ?? [];
  const quotes = provenance?.quotes ?? [];
  const hasReasoning = !!provenance?.reasoning?.trim();
  const hasDecision = !!provenance?.decision?.trim();

  const order = (["sources", "quotes", "reasoning", "decision"] as const).filter((k) =>
    k === "sources" ? sources.length > 0 : k === "quotes" ? quotes.length > 0 : k === "reasoning" ? hasReasoning : hasDecision,
  );
  const lastKey = order[order.length - 1];

  return (
    <div className="flex h-full min-h-0 flex-col bg-surface">
      {/* Header */}
      <div className="shrink-0 border-b border-separator px-5 pt-5 pb-4">
        <div className="flex items-center gap-2 text-[11px] font-semibold tracking-wider text-muted uppercase">
          <Icon icon="gravity-ui:shield-check" className="size-3.5 text-accent" />
          Provenance
          <span className="text-separator">/</span>
          <span className="truncate normal-case tracking-normal text-muted/90">{contextLabel}</span>
        </div>
        <h3 className="mt-1.5 text-sm font-semibold text-foreground">
          <span className="mr-1.5 rounded bg-accent/10 px-1.5 py-0.5 text-[11px] font-bold text-accent tabular-nums">{questionId}</span>
          这条答案的证据链
        </h3>
        <p className="mt-1 text-[11px] leading-relaxed text-muted">来源 · 原文引用 · 推理 · 最终决策</p>
      </div>

      {/* Body */}
      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
        {/* 填写指引 — always shown */}
        {guidance && (
          <div className="mb-4 rounded-xl border border-separator/60 bg-surface-secondary/50 p-3.5">
            <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-muted">
              <Icon icon="gravity-ui:circle-info" className="size-3.5 text-accent" />
              填写指引
            </div>
            <p className="text-[12.5px] leading-relaxed text-foreground whitespace-pre-wrap">{guidance}</p>
          </div>
        )}

        {loading ? (
          <div className="flex items-center gap-2 rounded-xl border border-separator/60 bg-surface-secondary/40 px-3.5 py-3 text-[12px] text-muted">
            <Icon icon="gravity-ui:arrows-rotate-right" className="size-4 animate-spin text-accent" />
            正在加载证据…
          </div>
        ) : empty ? (
          // Placeholder — grounding hasn't run (or no provenance file).
          <div className="rounded-xl border border-dashed border-separator/70 bg-surface-secondary/30 px-4 py-5 text-center">
            <Icon icon="gravity-ui:sparkles" className="mx-auto size-6 text-accent/70" />
            <p className="mt-2 text-[12.5px] font-medium text-foreground">证据待生成</p>
            <p className="mt-1 text-[11.5px] leading-relaxed text-muted">
              {notFound ? "该题暂无证据文件 · " : ""}grounding 运行后自动填充来源、原文引用与推理。
            </p>
          </div>
        ) : (
          <div>
            {order.includes("sources") && (
              <Section
                icon={<Icon icon="gravity-ui:link" className="size-[17px]" />}
                title="来源"
                count={sources.length}
                defaultOpen
                last={lastKey === "sources"}
              >
                <div className="space-y-0.5">
                  {sources.map((s, i) => (
                    <SourceRow key={i} s={s} />
                  ))}
                </div>
              </Section>
            )}

            {order.includes("quotes") && (
              <Section
                icon={<Icon icon="gravity-ui:quote-open" className="size-[17px]" />}
                title="原文引用"
                count={quotes.length}
                last={lastKey === "quotes"}
              >
                <div className="rounded-xl border border-separator/60 bg-surface-secondary/50 p-3">
                  <div className="space-y-2">
                    {quotes.map((q, i) => (
                      <blockquote
                        key={i}
                        className="block whitespace-pre-wrap rounded-r-md border-l-2 border-separator px-3 py-1.5 text-[12px] leading-relaxed text-foreground"
                      >
                        <QuoteText text={q} />
                      </blockquote>
                    ))}
                  </div>
                </div>
              </Section>
            )}

            {order.includes("reasoning") && (
              <Section
                icon={<Icon icon="gravity-ui:bulb" className="size-[17px]" />}
                title="推理"
                defaultOpen
                last={lastKey === "reasoning"}
              >
                <div className="rounded-xl border border-separator/60 bg-surface-secondary/40 px-3.5 py-3 text-[12.5px] leading-relaxed text-foreground whitespace-pre-wrap">
                  {provenance?.reasoning}
                </div>
              </Section>
            )}

            {order.includes("decision") && (
              <Section
                icon={<Icon icon="gravity-ui:circle-check" className="size-[17px]" />}
                title="最终决策"
                defaultOpen
                last={lastKey === "decision"}
              >
                <div className="rounded-xl border border-accent/25 bg-accent/5 px-3.5 py-3 text-[12.5px] leading-relaxed text-foreground whitespace-pre-wrap">
                  {provenance?.decision}
                </div>
              </Section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
