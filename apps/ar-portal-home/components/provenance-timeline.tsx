"use client";

import { useState, type ReactNode } from "react";
import { ArrowUpRight, ChevronDown, CircleCheck, Globe, Info, Lightbulb, Link2, Quote } from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================================================
// Data shape (feed this in)
// ============================================================================
export interface Source {
  url: string;
  label: string;
}
export interface Reasoning {
  sources: Source[];
  /** Each quote may start with a "[tag]" — the tag links it to a source. */
  quotes: string[];
  /** Prose. Parsed into a 前提 (premise) + steps. */
  reasoning: string;
  decision: string;
}

// ============================================================================
// Brand marks (inline SVG — no icon CDN)
// ============================================================================
function TencentCloudMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={cn("shrink-0", className)}>
      <path d="M20.0483 17.1416C19.6945 17.4914 18.987 18.0161 17.7488 18.0161C17.2182 18.0161 16.5991 18.0161 16.3338 18.0161C15.98 18.0161 13.3268 18.0161 10.143 18.0161C12.4424 15.8298 14.3881 13.9932 14.565 13.8183C14.7419 13.6434 15.1841 13.2061 15.6263 12.8563C16.5107 12.0692 17.2182 11.9817 17.8373 11.9817C18.7217 11.9817 19.4292 12.3316 20.0483 12.8563C21.2864 13.9932 21.2864 16.0047 20.0483 17.1416ZM21.5518 11.457C20.6674 10.495 19.3408 9.88281 17.9257 9.88281C16.6875 9.88281 15.6263 10.3201 14.6534 11.0197C14.2997 11.3695 13.769 11.7194 13.3268 12.2441C12.9731 12.5939 5.36719 19.9401 5.36719 19.9401C5.80939 20.0276 6.34003 20.0276 6.78223 20.0276C7.22443 20.0276 16.0685 20.0276 16.4222 20.0276C17.1298 20.0276 17.6604 20.0276 18.191 19.9401C19.3408 19.8527 20.4905 19.4154 21.4633 18.5409C23.4975 16.6168 23.4975 13.381 21.5518 11.457Z" fill="#00A3FF" />
      <path d="M9.1701 10.9323C8.19726 10.2326 7.22442 9.88281 6.07469 9.88281C4.65965 9.88281 3.33304 10.495 2.44864 11.457C0.502952 13.4685 0.502952 16.6168 2.53708 18.6283C3.42148 19.4154 4.30589 19.8527 5.36717 19.9401L7.4013 18.0161C7.04754 18.0161 6.60533 18.0161 6.25157 18.0161C5.10185 17.9287 4.39433 17.5789 3.95212 17.1416C2.71396 15.9172 2.71396 13.9932 3.86368 12.7688C4.48277 12.1566 5.19029 11.8943 6.07469 11.8943C6.60533 11.8943 7.4013 11.9817 8.19726 12.7688C8.55102 13.1186 9.52386 13.8183 9.87763 14.1681H9.96607L11.2927 12.8563V12.7688C10.6736 12.1566 9.70075 11.3695 9.1701 10.9323Z" fill="#00C8DC" />
      <path d="M18.4564 8.74536C17.4836 6.12171 14.9188 4.28516 12.0003 4.28516C8.5511 4.28516 5.80945 6.82135 5.27881 9.96973C5.54413 9.96973 5.80945 9.88228 6.16321 9.88228C6.51697 9.88228 6.95917 9.96973 7.31294 9.96973C7.75514 7.78336 9.70082 6.20917 12.0003 6.20917C13.946 6.20917 15.6263 7.34608 16.4223 9.00773C16.4223 9.00773 16.5107 9.09518 16.5107 9.00773C17.1298 8.92027 17.8373 8.74536 18.4564 8.74536C18.4564 8.83282 18.4564 8.83282 18.4564 8.74536Z" fill="#006EFF" />
    </svg>
  );
}
/** White WeChat glyph — sits on the green chip (color comes from the chip). */
function WeChatGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor" className={cn("shrink-0", className)}>
      <path d="M18.575 13.711a.91.91 0 0 0 .898-.898a.895.895 0 0 0-.898-.898a.894.894 0 0 0-.898.898c0 .5.4.898.898.898m-4.425 0a.91.91 0 0 0 .898-.898c0-.498-.4-.898-.898-.898a.894.894 0 0 0-.898.898c0 .5.399.898.898.898m6.567 5.04a.35.35 0 0 0-.172.37c0 .048 0 .098.025.147c.098.417.294 1.081.294 1.106c0 .073.025.122.025.172a.22.22 0 0 1-.221.22c-.05 0-.074-.024-.123-.048l-1.449-.836a.8.8 0 0 0-.344-.098c-.073 0-.147 0-.196.024c-.688.197-1.4.295-2.161.295c-3.66 0-6.607-2.457-6.607-5.505s2.947-5.505 6.607-5.505c3.659 0 6.606 2.458 6.606 5.505c0 1.647-.884 3.146-2.284 4.154M16.674 8.099a9 9 0 0 0-.28-.005c-4.174 0-7.606 2.86-7.606 6.505c0 .554.08 1.09.228 1.6h-.089a10 10 0 0 1-2.584-.368c-.074-.025-.148-.025-.222-.025a.83.83 0 0 0-.419.123l-1.747 1.005a.35.35 0 0 1-.148.05a.273.273 0 0 1-.27-.27c0-.074.024-.123.049-.197c.024-.024.246-.834.369-1.324c0-.05.024-.123.024-.172a.56.56 0 0 0-.221-.441C2.059 13.376 1 11.586 1 9.599C1.001 5.944 4.571 3 8.951 3c3.765 0 6.93 2.169 7.723 5.098m-5.154.418c.573 0 1.026-.477 1.026-1.026c0-.573-.453-1.026-1.026-1.026s-1.026.453-1.026 1.026s.453 1.026 1.026 1.026m-5.26 0c.573 0 1.027-.477 1.027-1.026c0-.573-.454-1.026-1.027-1.026c-.572 0-1.026.453-1.026 1.026s.454 1.026 1.026 1.026" />
    </svg>
  );
}
function NvidiaMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="#76B900" className={cn("shrink-0", className)}>
      <path d="M8.948 8.798v-1.43a7 7 0 0 1 .424-.018c3.922-.124 6.493 3.374 6.493 3.374s-2.774 3.851-5.75 3.851a3.7 3.7 0 0 1-1.158-.185v-4.346c1.528.185 1.837.857 2.747 2.385l2.04-1.714s-1.492-1.952-4-1.952a6 6 0 0 0-.796.035m0-4.735v2.138l.424-.027c5.45-.185 9.01 4.47 9.01 4.47s-4.08 4.964-8.33 4.964a6.5 6.5 0 0 1-1.095-.097v1.325c.3.035.61.062.91.062c3.957 0 6.82-2.023 9.593-4.408c.459.371 2.34 1.263 2.73 1.652c-2.633 2.208-8.772 3.984-12.253 3.984c-.335 0-.653-.018-.971-.053v1.864H24V4.063zm0 10.326v1.131c-3.657-.654-4.673-4.46-4.673-4.46s1.758-1.944 4.673-2.262v1.237H8.94c-1.528-.186-2.73 1.245-2.73 1.245s.68 2.412 2.739 3.11M2.456 10.9s2.164-3.197 6.5-3.533V6.201C4.153 6.59 0 10.653 0 10.653s2.35 6.802 8.948 7.42v-1.237c-4.84-.6-6.492-5.936-6.492-5.936" />
    </svg>
  );
}

// ============================================================================
// Source chips — auto-resolved from the URL's host
// ============================================================================
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
interface ChipPreset {
  chip: string;
  icon: string;
  wechatIcon: string;
}
const LIST_CHIP: ChipPreset = {
  chip: "size-7 rounded-lg border border-zinc-200 bg-zinc-100",
  icon: "size-[15px]",
  wechatIcon: "size-[21px]", // WeChat glyph ~1.4x so it fills the chip
};
const STACK_CHIP: ChipPreset = {
  chip: "size-6 rounded-lg border border-zinc-200 bg-zinc-100 shadow-sm",
  icon: "size-[13px]",
  wechatIcon: "size-[18px]",
};
function SourceChip({ url, preset }: { url: string; preset: ChipPreset }) {
  const brand = brandOf(url);
  const wrap = (extra: string, child: ReactNode) => (
    <span className={cn("flex items-center justify-center overflow-hidden shrink-0", preset.chip, extra)}>{child}</span>
  );
  if (brand === "wechat") return wrap("border-transparent bg-[#07C160] text-white", <WeChatGlyph className={preset.wechatIcon} />);
  if (brand === "tcloud") return wrap("", <TencentCloudMark className={preset.icon} />);
  if (brand === "nvidia") return wrap("", <NvidiaMark className={preset.icon} />);
  return wrap("", <Globe className={cn("text-zinc-400", preset.icon)} />);
}

// ============================================================================
// Quote ↔ source matching (heuristic)
// ============================================================================
function matchSource(quote: string, sources: Source[]): Source | null {
  const m = quote.match(/^\s*\[([^\]]+)\]/);
  if (!m) return null;
  const tag = m[1];
  const date = (tag.match(/\d{4}-\d{2}-\d{2}/) || [])[0];
  const ascii = tag.toLowerCase().match(/[a-z0-9]{2,}/g) || [];
  const cjk = tag.match(/[一-龥]{2,}/g) || [];
  const escRe = (t: string) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  let best: Source | null = null;
  let bestScore = 0;
  let tie = false;
  for (const s of sources) {
    const lab = (s.label + " " + s.url).toLowerCase();
    let score = 0;
    if (date && lab.includes(date)) score += 10;
    for (const t of ascii) if (new RegExp("\\b" + escRe(t) + "\\b").test(lab)) score += t.length >= 4 ? 2 : 1;
    for (const c of cjk) if (s.label.includes(c)) score += 1;
    if (score > bestScore) {
      bestScore = score;
      best = s;
      tie = false;
    } else if (score === bestScore && score > 0) {
      tie = true;
    }
  }
  return bestScore >= 1 && !tie ? best : null;
}
function tagHead(quote: string): string {
  const m = quote.match(/^\s*\[\s*([^\s\]]+)/);
  return m ? m[1].toLowerCase() : "";
}
/** Unmatched quotes inherit a sibling's source when they share the same tag head
 *  AND those siblings agree (so a generic "公众号 <date>" prefix never cross-links). */
function matchQuotes(quotes: string[], sources: Source[]): (Source | null)[] {
  const direct = quotes.map((q) => matchSource(q, sources));
  const byHead = new Map<string, Source | null>();
  quotes.forEach((q, i) => {
    const hit = direct[i];
    const head = tagHead(q);
    if (!hit || !head) return;
    if (!byHead.has(head)) byHead.set(head, hit);
    else if (byHead.get(head) !== hit) byHead.set(head, null);
  });
  return quotes.map((q, i) => direct[i] ?? (tagHead(q) ? byHead.get(tagHead(q)) ?? null : null));
}
/** Highlight the leading [tag] in accent. */
function QuoteText({ text }: { text: string }) {
  const m = text.match(/^(\s*\[[^\]]+\])([\s\S]*)$/);
  if (!m) return <>{text}</>;
  return (
    <>
      <span className="font-semibold text-sky-600">{m[1]}</span>
      {m[2]}
    </>
  );
}

// ============================================================================
// Reasoning → derivation chain
// ============================================================================
interface RStep {
  text: string;
  caveat: boolean;
}
function parseReasoning(text: string): { premise: string; steps: RStep[] } {
  let body = text.trim();
  let premise = "";
  const stop = body.search(/。/);
  const colon = body.search(/[：:]/);
  if (colon >= 0 && (stop < 0 || colon < stop)) {
    premise = body.slice(0, colon).trim();
    body = body.slice(colon + 1).trim();
  }
  const caveat = /未公开|未披露|不作|不声称|诚实|让渡|未覆盖|REVIEW|by AR/;
  const steps = body
    .split(/[；;。]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => ({ text: s, caveat: caveat.test(s) }));
  return { premise, steps };
}
function ReasoningStep({ step, num, last, open, index }: { step: RStep; num: number | null; last: boolean; open: boolean; index: number }) {
  const [active, setActive] = useState(false);
  return (
    <div
      className={cn("flex cursor-pointer gap-2.5 transition-all duration-300 ease-out", open ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0")}
      style={{ transitionDelay: open ? `${index * 70 + 60}ms` : "0ms" }}
      onClick={() => setActive((a) => !a)}
    >
      <div className="flex shrink-0 flex-col items-center">
        <span
          className={cn(
            "flex size-[21px] items-center justify-center rounded-full border text-[11px] font-bold",
            step.caveat ? "border-zinc-200 bg-zinc-100 text-zinc-500" : "border-sky-200 bg-sky-50 text-sky-600",
          )}
        >
          {step.caveat ? <Info className="size-3" /> : num}
        </span>
        {!last && <span className="my-0.5 min-h-2 w-px flex-1 bg-zinc-200" />}
      </div>
      <div
        className={cn(
          "mb-2 flex-1 rounded-[10px] border border-l-2 px-3 py-2 text-[12.5px] leading-relaxed transition-colors",
          "hover:border-l-sky-500 hover:bg-sky-50",
          step.caveat ? "border-dashed border-zinc-200 border-l-zinc-200 text-zinc-500" : "border-zinc-200 border-l-transparent text-zinc-900",
          active && "border-l-sky-500 bg-sky-50",
        )}
      >
        {step.text}
        {step.caveat && (
          <span className="ml-2 inline-block rounded border border-zinc-200 bg-white px-1.5 py-px align-middle text-[10px] font-semibold text-zinc-500">
            边界
          </span>
        )}
      </div>
    </div>
  );
}
function ReasoningChain({ text, open }: { text: string; open: boolean }) {
  const { premise, steps } = parseReasoning(text);
  let n = 0;
  return (
    <div>
      {premise && (
        <div className="mb-2.5 rounded-[10px] border border-zinc-200 bg-zinc-100 px-3 py-2 text-[12px] leading-relaxed text-zinc-500">
          <span className="mr-2 inline-block rounded border border-sky-200 bg-sky-50 px-1.5 py-px align-middle text-[10px] font-bold tracking-wider text-sky-600">前提</span>
          {premise}
        </div>
      )}
      {steps.map((s, i) => (
        <ReasoningStep key={i} step={s} num={s.caveat ? null : ++n} last={i === steps.length - 1} open={open} index={i} />
      ))}
    </div>
  );
}

// ============================================================================
// Collapsible timeline node
// ============================================================================
function Section({
  icon,
  title,
  count,
  stack,
  defaultOpen,
  last,
  children,
}: {
  icon: ReactNode;
  title: string;
  count?: number;
  stack?: ReactNode;
  defaultOpen?: boolean;
  last?: boolean;
  children: (open: boolean) => ReactNode;
}) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <div className="flex gap-3">
      <div className="flex shrink-0 flex-col items-center">
        <span className="flex size-8 items-center justify-center rounded-[11px] bg-sky-50 text-sky-600">{icon}</span>
        {!last && <span className="my-1 min-h-3 w-px flex-1 bg-zinc-200" />}
      </div>
      <div className={cn("min-w-0 flex-1", last ? "pb-1" : "pb-4")}>
        <button type="button" onClick={() => setOpen((o) => !o)} className="flex w-full items-center gap-1.5 pt-1 text-left">
          <span className="text-[13px] font-semibold text-zinc-900">{title}</span>
          {count != null && (
            <span className="rounded-full bg-zinc-100 px-1.5 py-0.5 text-[10.5px] font-semibold leading-none text-zinc-500 tabular-nums">{count}</span>
          )}
          <ChevronDown className={cn("size-3.5 text-zinc-500 transition-transform duration-200", open && "rotate-180")} />
        </button>
        {stack}
        <div className={cn("grid transition-[grid-template-rows] duration-300 ease-out", open ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
          <div className="overflow-hidden">
            <div className="pt-2.5">{children(open)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// ProvenanceTimeline — the export you render
// ============================================================================
export function ProvenanceTimeline({ reasoning }: { reasoning: Reasoning }) {
  const sourceCount = reasoning.sources.length;
  const quoteCount = reasoning.quotes.length;
  const hasReasoning = !!reasoning.reasoning?.trim();
  const hasDecision = !!reasoning.decision?.trim();

  const order = (["sources", "quotes", "reasoning", "decision"] as const).filter((k) =>
    k === "sources" ? sourceCount > 0 : k === "quotes" ? quoteCount > 0 : k === "reasoning" ? hasReasoning : hasDecision,
  );
  const lastKey = order[order.length - 1];
  const quoteSources = matchQuotes(reasoning.quotes, reasoning.sources);

  const seen = new Set<Brand>();
  const stackSources = reasoning.sources.filter((s) => {
    const b = brandOf(s.url);
    if (seen.has(b)) return false;
    seen.add(b);
    return true;
  });

  return (
    <div>
      {order.includes("sources") && (
        <Section
          icon={<Link2 className="size-[17px]" />}
          title="来源"
          count={sourceCount}
          defaultOpen
          last={lastKey === "sources"}
          stack={
            <div className="mt-1.5 flex items-center">
              {stackSources.slice(0, 6).map((s, i) => (
                <span key={i} className={cn("relative", i > 0 && "-ml-1.5")} style={{ rotate: i % 2 ? "-7deg" : "7deg", zIndex: i }}>
                  <SourceChip url={s.url} preset={STACK_CHIP} />
                </span>
              ))}
            </div>
          }
        >
          {() => (
            <div className="space-y-0.5">
              {reasoning.sources.map((s, i) => (
                <a
                  key={i}
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-start gap-2.5 rounded-[10px] px-2.5 py-2 transition-colors hover:bg-zinc-100"
                >
                  <SourceChip url={s.url} preset={LIST_CHIP} />
                  <span className="min-w-0">
                    <span className="block text-[12.5px] leading-snug text-zinc-900 group-hover:text-sky-600">{s.label}</span>
                    <span className="mt-0.5 block break-all text-[11px] text-zinc-400">{s.url}</span>
                  </span>
                </a>
              ))}
            </div>
          )}
        </Section>
      )}

      {order.includes("quotes") && (
        <Section icon={<Quote className="size-[17px]" />} title="原文引用" count={quoteCount} last={lastKey === "quotes"}>
          {() => (
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
              <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold text-zinc-500">
                <Quote className="size-3" />
                原文 · 逐字引用
              </div>
              <div className="space-y-2">
                {reasoning.quotes.map((q, i) => {
                  const src = quoteSources[i];
                  if (src)
                    return (
                      <a
                        key={i}
                        href={src.url}
                        target="_blank"
                        rel="noreferrer"
                        title={src.label}
                        className="group/q block whitespace-pre-wrap rounded-r-md border-l-2 border-zinc-200 px-3 py-1.5 text-[12px] leading-relaxed text-zinc-900 transition-colors hover:border-sky-500 hover:bg-sky-50"
                      >
                        <QuoteText text={q} />
                        <ArrowUpRight className="ml-1 inline size-3 align-middle text-sky-600 opacity-0 transition-opacity group-hover/q:opacity-100" />
                      </a>
                    );
                  return (
                    <blockquote key={i} className="block whitespace-pre-wrap rounded-r-md border-l-2 border-zinc-200 px-3 py-1.5 text-[12px] leading-relaxed text-zinc-900">
                      <QuoteText text={q} />
                    </blockquote>
                  );
                })}
              </div>
            </div>
          )}
        </Section>
      )}

      {order.includes("reasoning") && (
        <Section icon={<Lightbulb className="size-[17px]" />} title="推理" defaultOpen last={lastKey === "reasoning"}>
          {(open) => <ReasoningChain text={reasoning.reasoning} open={open} />}
        </Section>
      )}

      {order.includes("decision") && (
        <Section icon={<CircleCheck className="size-[17px]" />} title="最终决策" defaultOpen last={lastKey === "decision"}>
          {() => (
            <div className="whitespace-pre-wrap rounded-xl border border-sky-200 bg-sky-50 px-3.5 py-3 text-[12.5px] leading-relaxed text-zinc-900">
              {reasoning.decision}
            </div>
          )}
        </Section>
      )}
    </div>
  );
}
