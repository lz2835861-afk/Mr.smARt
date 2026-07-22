import { Button, Separator } from "@heroui/react";
import { Sheet } from "@heroui-pro/react";
import { Icon } from "@iconify/react";
import { useState, type ReactNode } from "react";
import type { Reasoning, Source } from "../data/questionnaire";
import { openExternalSource } from "../lib/openExternalSource";
import { cn } from "../lib/utils";

interface Props {
  reasoning?: Reasoning;
  fieldLabel: string;
}

// ============================================================================
// Brand icons — resolve a source's chip by its domain
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

/** Genuine Tencent Cloud tri-color cloud mark. */
function TencentCloudMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className={cn("shrink-0", className)}>
      <path d="M20.0483 17.1416C19.6945 17.4914 18.987 18.0161 17.7488 18.0161C17.2182 18.0161 16.5991 18.0161 16.3338 18.0161C15.98 18.0161 13.3268 18.0161 10.143 18.0161C12.4424 15.8298 14.3881 13.9932 14.565 13.8183C14.7419 13.6434 15.1841 13.2061 15.6263 12.8563C16.5107 12.0692 17.2182 11.9817 17.8373 11.9817C18.7217 11.9817 19.4292 12.3316 20.0483 12.8563C21.2864 13.9932 21.2864 16.0047 20.0483 17.1416ZM21.5518 11.457C20.6674 10.495 19.3408 9.88281 17.9257 9.88281C16.6875 9.88281 15.6263 10.3201 14.6534 11.0197C14.2997 11.3695 13.769 11.7194 13.3268 12.2441C12.9731 12.5939 5.36719 19.9401 5.36719 19.9401C5.80939 20.0276 6.34003 20.0276 6.78223 20.0276C7.22443 20.0276 16.0685 20.0276 16.4222 20.0276C17.1298 20.0276 17.6604 20.0276 18.191 19.9401C19.3408 19.8527 20.4905 19.4154 21.4633 18.5409C23.4975 16.6168 23.4975 13.381 21.5518 11.457Z" fill="#00A3FF" />
      <path d="M9.1701 10.9323C8.19726 10.2326 7.22442 9.88281 6.07469 9.88281C4.65965 9.88281 3.33304 10.495 2.44864 11.457C0.502952 13.4685 0.502952 16.6168 2.53708 18.6283C3.42148 19.4154 4.30589 19.8527 5.36717 19.9401L7.4013 18.0161C7.04754 18.0161 6.60533 18.0161 6.25157 18.0161C5.10185 17.9287 4.39433 17.5789 3.95212 17.1416C2.71396 15.9172 2.71396 13.9932 3.86368 12.7688C4.48277 12.1566 5.19029 11.8943 6.07469 11.8943C6.60533 11.8943 7.4013 11.9817 8.19726 12.7688C8.55102 13.1186 9.52386 13.8183 9.87763 14.1681H9.96607L11.2927 12.8563V12.7688C10.6736 12.1566 9.70075 11.3695 9.1701 10.9323Z" fill="#00C8DC" />
      <path d="M18.4564 8.74536C17.4836 6.12171 14.9188 4.28516 12.0003 4.28516C8.5511 4.28516 5.80945 6.82135 5.27881 9.96973C5.54413 9.96973 5.80945 9.88228 6.16321 9.88228C6.51697 9.88228 6.95917 9.96973 7.31294 9.96973C7.75514 7.78336 9.70082 6.20917 12.0003 6.20917C13.946 6.20917 15.6263 7.34608 16.4223 9.00773C16.4223 9.00773 16.5107 9.09518 16.5107 9.00773C17.1298 8.92027 17.8373 8.74536 18.4564 8.74536C18.4564 8.83282 18.4564 8.83282 18.4564 8.74536Z" fill="#006EFF" />
    </svg>
  );
}

interface ChipPreset {
  chip: string;
  icon: string;
  wechatIcon: string;
}
const LIST_CHIP: ChipPreset = {
  chip: "size-7 rounded-lg border border-separator/60 bg-surface-secondary",
  icon: "size-[15px]",
  wechatIcon: "size-[21px]", // WeChat glyph ~1.4x so it fills the chip
};
const STACK_CHIP: ChipPreset = {
  chip: "size-6 rounded-lg border border-separator/60 bg-surface-secondary shadow-sm",
  icon: "size-[13px]",
  wechatIcon: "size-[18px]",
};

function SourceChip({ url, preset }: { url: string; preset: ChipPreset }) {
  const brand = brandOf(url);
  const wrap = (extra: string, child: ReactNode) => (
    <span className={cn("flex items-center justify-center overflow-hidden shrink-0", preset.chip, extra)}>{child}</span>
  );
  if (brand === "wechat")
    return wrap("border-transparent bg-[#07C160]", <Icon icon="ri:wechat-fill" className={cn("text-white", preset.wechatIcon)} />);
  if (brand === "tcloud") return wrap("", <TencentCloudMark className={preset.icon} />);
  if (brand === "nvidia")
    return wrap("", <Icon icon="simple-icons:nvidia" className={preset.icon} style={{ color: "#76B900" }} />);
  return wrap("", <Icon icon="gravity-ui:globe" className={cn("text-muted", preset.icon)} />);
}

// ============================================================================
// Quote → source matching
// Date carries the WeChat posts; whole-word ASCII tokens carry the English
// sources (word boundaries so "ti" matches /product/ti but not "arTIcles").
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

/** The first token of a quote's leading [tag], e.g. "HONOR" or "公众号腾讯云". */
function tagHead(quote: string): string {
  const m = quote.match(/^\s*\[\s*([^\s\]]+)/);
  return m ? m[1].toLowerCase() : "";
}

/** Match every quote to a source. After the direct per-quote match, unmatched
 *  quotes inherit the source of a sibling quote sharing the same tag head —
 *  but only when those siblings agree (so the generic "公众号腾讯云 <date>"
 *  prefix, which spans several different posts, never cross-links). This rescues
 *  e.g. "[HONOR challenges]" whose English tag can't match a 荣耀 source label. */
function matchQuotes(quotes: string[], sources: Source[]): (Source | null)[] {
  const direct = quotes.map((q) => matchSource(q, sources));
  const byHead = new Map<string, Source | null>(); // head → agreed source, or null if it conflicts
  quotes.forEach((q, i) => {
    const hit = direct[i];
    const head = tagHead(q);
    if (!hit || !head) return;
    if (!byHead.has(head)) byHead.set(head, hit);
    else if (byHead.get(head) !== hit) byHead.set(head, null);
  });
  return quotes.map((q, i) => direct[i] ?? (tagHead(q) ? byHead.get(tagHead(q)) ?? null : null));
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

// ============================================================================
// Reasoning → derivation chain
// premise = lead-in clause before the first "："; steps split on "；" / "。";
// steps that disclaim a claim are flagged as boundary/caveat steps.
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
      className={cn(
        "flex cursor-pointer gap-2.5 transition-all duration-300 ease-out",
        open ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0",
      )}
      style={{ transitionDelay: open ? `${index * 70 + 60}ms` : "0ms" }}
      onClick={() => setActive((a) => !a)}
    >
      <div className="flex shrink-0 flex-col items-center">
        <span
          className={cn(
            "flex size-[21px] items-center justify-center rounded-full border text-[11px] font-bold",
            step.caveat ? "border-separator/70 bg-surface-secondary text-muted" : "border-accent/25 bg-accent/10 text-accent",
          )}
        >
          {step.caveat ? <Icon icon="gravity-ui:circle-info" className="size-3" /> : num}
        </span>
        {!last && <span className="my-0.5 min-h-2 w-px flex-1 bg-separator/70" />}
      </div>
      <div
        className={cn(
          "mb-2 flex-1 rounded-[10px] border border-l-2 px-3 py-2 text-[12.5px] leading-relaxed transition-colors",
          "hover:border-l-accent hover:bg-accent/10",
          step.caveat
            ? "border-dashed border-separator/70 border-l-separator/70 text-muted"
            : "border-separator/60 border-l-transparent text-foreground",
          active && "border-l-accent bg-accent/10",
        )}
      >
        {step.text}
        {step.caveat && (
          <span className="ml-2 inline-block rounded border border-separator/60 bg-surface px-1.5 py-px align-middle text-[10px] font-semibold text-muted">
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
        <div className="mb-2.5 rounded-[10px] border border-separator/60 bg-surface-secondary px-3 py-2 text-[12px] leading-relaxed text-muted">
          <span className="mr-2 inline-block rounded border border-accent/25 bg-accent/10 px-1.5 py-px align-middle text-[10px] font-bold tracking-wider text-accent">
            前提
          </span>
          {premise}
        </div>
      )}
      {steps.map((s, i) => (
        <ReasoningStep
          key={i}
          step={s}
          num={s.caveat ? null : ++n}
          last={i === steps.length - 1}
          open={open}
          index={i}
        />
      ))}
    </div>
  );
}

// ============================================================================
// Timeline section (collapsible node with rail icon + connector)
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
        <span className="flex size-8 items-center justify-center rounded-[11px] bg-accent/10 text-accent">{icon}</span>
        {!last && <span className="my-1 min-h-3 w-px flex-1 bg-separator/70" />}
      </div>
      <div className={cn("min-w-0 flex-1", last ? "pb-1" : "pb-4")}>
        <button type="button" onClick={() => setOpen((o) => !o)} className="flex w-full items-center gap-1.5 pt-1 text-left">
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
// Main
// ============================================================================

/** Icon-button + counter that opens a right-side Sheet showing the full
 *  source / quote / reasoning / decision provenance for one field, laid out as
 *  a collapsible tool-calls-style timeline. */
export function ReasoningSheet({ reasoning, fieldLabel }: Props) {
  if (!reasoning) return null;
  const sourceCount = reasoning.sources.length;
  const quoteCount = reasoning.quotes.length;
  const hasReasoning = !!reasoning.reasoning?.trim();
  const hasDecision = !!reasoning.decision?.trim();

  const order = (["sources", "quotes", "reasoning", "decision"] as const).filter((k) =>
    k === "sources" ? sourceCount > 0 : k === "quotes" ? quoteCount > 0 : k === "reasoning" ? hasReasoning : hasDecision,
  );
  const lastKey = order[order.length - 1];

  const quoteSources = matchQuotes(reasoning.quotes, reasoning.sources);

  // dedupe the stacked preview by brand, like the tool-calls component
  const seen = new Set<Brand>();
  const stackSources = reasoning.sources.filter((s) => {
    const b = brandOf(s.url);
    if (seen.has(b)) return false;
    seen.add(b);
    return true;
  });

  return (
    <Sheet placement="right" isDismissable>
      <Sheet.Trigger>
        <Button
          variant="ghost"
          size="sm"
          aria-label="View sources and reasoning"
          className="gap-1.5 text-xs text-muted hover:text-foreground"
        >
          <Icon icon="gravity-ui:book-open" className="size-3.5" />
          <span className="tabular-nums">
            {sourceCount} source{sourceCount === 1 ? "" : "s"}
          </span>
        </Button>
      </Sheet.Trigger>
      <Sheet.Backdrop variant="blur">
        <Sheet.Content className="w-full max-w-[520px]">
          <Sheet.Dialog>
            <Sheet.Header className="px-6 pt-6 pb-4">
              <div className="text-[11px] font-semibold tracking-wider text-muted uppercase">Provenance</div>
              <Sheet.Heading className="mt-1 text-base font-semibold text-foreground">{fieldLabel}</Sheet.Heading>
              <p className="mt-1 text-xs text-muted">这条答案是怎么来的——来源 / 原文引用 / 推理 / 决策。</p>
            </Sheet.Header>
            <Separator />
            <Sheet.Body className="overflow-y-auto px-5 py-4">
              {order.includes("sources") && (
                <Section
                  icon={<Icon icon="gravity-ui:link" className="size-[17px]" />}
                  title="来源"
                  count={sourceCount}
                  defaultOpen
                  last={lastKey === "sources"}
                  stack={
                    <div className="mt-1.5 flex items-center">
                      {stackSources.slice(0, 6).map((s, i) => (
                        <span
                          key={i}
                          className={cn("relative", i > 0 && "-ml-1.5")}
                          style={{ rotate: i % 2 ? "-7deg" : "7deg", zIndex: i }}
                        >
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
                          rel="noopener noreferrer"
                          onClick={(event) => openExternalSource(event, s.url)}
                          className="group flex items-start gap-2.5 rounded-[10px] px-2.5 py-2 transition-colors hover:bg-surface-secondary"
                        >
                          <SourceChip url={s.url} preset={LIST_CHIP} />
                          <span className="min-w-0">
                            <span className="block text-[12.5px] leading-snug text-foreground group-hover:text-accent">
                              {s.label}
                            </span>
                            <span className="mt-0.5 block break-all text-[11px] text-muted/80">{s.url}</span>
                          </span>
                        </a>
                      ))}
                    </div>
                  )}
                </Section>
              )}

              {order.includes("quotes") && (
                <Section
                  icon={<Icon icon="gravity-ui:quote-open" className="size-[17px]" />}
                  title="原文引用"
                  count={quoteCount}
                  last={lastKey === "quotes"}
                >
                  {() => (
                    <div className="rounded-xl border border-separator/60 bg-surface-secondary/50 p-3">
                      <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold text-muted">
                        <Icon icon="gravity-ui:quote-open" className="size-3" />
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
                                rel="noopener noreferrer"
                                onClick={(event) => openExternalSource(event, src.url)}
                                title={src.label}
                                className="group/q block whitespace-pre-wrap rounded-r-md border-l-2 border-separator px-3 py-1.5 text-[12px] leading-relaxed text-foreground transition-colors hover:border-accent hover:bg-accent/10"
                              >
                                <QuoteText text={q} />
                                <Icon
                                  icon="gravity-ui:arrow-up-right-from-square"
                                  className="ml-1 inline size-3 align-middle text-accent opacity-0 transition-opacity group-hover/q:opacity-100"
                                />
                              </a>
                            );
                          return (
                            <blockquote
                              key={i}
                              className="block whitespace-pre-wrap rounded-r-md border-l-2 border-separator px-3 py-1.5 text-[12px] leading-relaxed text-foreground"
                            >
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
                <Section
                  icon={<Icon icon="gravity-ui:bulb" className="size-[17px]" />}
                  title="推理"
                  defaultOpen
                  last={lastKey === "reasoning"}
                >
                  {(open) => <ReasoningChain text={reasoning.reasoning} open={open} />}
                </Section>
              )}

              {order.includes("decision") && (
                <Section
                  icon={<Icon icon="gravity-ui:circle-check" className="size-[17px]" />}
                  title="最终决策"
                  defaultOpen
                  last={lastKey === "decision"}
                >
                  {() => (
                    <div className="rounded-xl border border-accent/25 bg-accent/5 px-3.5 py-3 text-[12.5px] leading-relaxed text-foreground whitespace-pre-wrap">
                      {reasoning.decision}
                    </div>
                  )}
                </Section>
              )}
            </Sheet.Body>
          </Sheet.Dialog>
        </Sheet.Content>
      </Sheet.Backdrop>
    </Sheet>
  );
}
