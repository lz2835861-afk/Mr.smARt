import { useState, type ReactNode } from "react";
import { Button, Label, TextArea, TextField } from "@heroui/react";
import { Icon } from "@iconify/react";
import {
  STATE_ORDER,
  type AnswerMeta,
  type AnswerState,
  type Suggestion,
} from "../hooks/useAnswerMeta";

interface Props {
  meta?: AnswerMeta;
  onSetState: (state: AnswerState) => void;
  onSetFactNotes: (notes: string) => void;
  onApplySuggestion: (s: Suggestion, index: number) => void;
  onDropSuggestion: (index: number) => void;
}

const STATE_STYLE: Record<AnswerState, { dot: string; text: string; label: string }> = {
  "NOT STARTED": { dot: "bg-default-300", text: "text-muted", label: "未开始" },
  "AI DRAFTED": { dot: "bg-accent", text: "text-accent", label: "AI 初稿" },
  "PRODUCT REVIEW": { dot: "bg-warning", text: "text-warning", label: "待产品核对" },
  "KEVIN REVIEW": { dot: "bg-warning", text: "text-warning", label: "待 Kevin 确认" },
  READY: { dot: "bg-success", text: "text-success", label: "已定稿" },
  SUBMITTED: { dot: "bg-success", text: "text-success", label: "已提交" },
  BLOCKED: { dot: "bg-danger", text: "text-danger", label: "阻塞" },
};

const SEV_STYLE: Record<string, string> = {
  BLOCK: "bg-danger/10 text-danger border-danger/30",
  ERROR: "bg-danger/10 text-danger border-danger/30",
  WARN: "bg-warning/10 text-warning border-warning/30",
};

const TAG_STYLE: Record<string, string> = {
  CITED: "bg-success/10 text-success",
  INFERRED: "bg-warning/10 text-warning",
  REVIEW: "bg-danger/10 text-danger",
};

function Badge({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold ${className}`}
    >
      {children}
    </span>
  );
}

export function AnswerMetaPanel({
  meta,
  onSetState,
  onSetFactNotes,
  onApplySuggestion,
  onDropSuggestion,
}: Props) {
  const [open, setOpen] = useState(false);
  const state: AnswerState = meta?.state ?? "NOT STARTED";
  const style = STATE_STYLE[state];

  const lint = meta?.lint ?? [];
  const evidence = meta?.evidence ?? [];
  const hooks = meta?.reviewer_hooks ?? [];
  const suggestions = meta?.suggestions ?? [];
  const blockCount = lint.filter((l) => l.severity === "BLOCK" || l.severity === "ERROR").length;

  const idx = STATE_ORDER.indexOf(state);
  const canAdvance = idx >= 0 && idx < STATE_ORDER.length - 1;
  const canReturn = idx > 0;
  const detailCount = lint.length + evidence.length + hooks.length;

  return (
    <div className="rounded-lg border border-border bg-surface-secondary/30">
      {/* compact bar */}
      <div className="flex items-center gap-2 flex-wrap px-2.5 py-1.5">
        <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold ${style.text}`}>
          <span className={`size-2 rounded-full ${style.dot}`} />
          {style.label}
        </span>

        {meta?.ai_origin && (
          <Badge className="bg-accent/10 text-accent">
            <Icon icon="gravity-ui:sparkles" className="size-3" />
            AI
          </Badge>
        )}
        {meta?.needs_attention && (
          <Badge className="bg-warning/10 text-warning">
            <Icon icon="gravity-ui:circle-exclamation" className="size-3" />
            待处理
          </Badge>
        )}
        {blockCount > 0 && (
          <Badge className="bg-danger/10 text-danger">{blockCount} 闸门</Badge>
        )}
        {suggestions.length > 0 && (
          <Badge className="bg-accent/10 text-accent">{suggestions.length} 建议</Badge>
        )}

        <div className="ml-auto flex items-center gap-1">
          {state === "BLOCKED" ? (
            <Button size="sm" variant="outline" onPress={() => onSetState("AI DRAFTED")}>
              解除阻塞
            </Button>
          ) : (
            <>
              <Button
                size="sm"
                variant="ghost"
                isDisabled={!canReturn}
                onPress={() => canReturn && onSetState(STATE_ORDER[idx - 1])}
              >
                <Icon icon="gravity-ui:arrow-left" className="size-3" />
                退回
              </Button>
              <Button
                size="sm"
                variant="outline"
                isDisabled={!canAdvance}
                onPress={() => canAdvance && onSetState(STATE_ORDER[idx + 1])}
              >
                推进
                <Icon icon="gravity-ui:arrow-right" className="size-3" />
              </Button>
              <Button size="sm" variant="ghost" onPress={() => onSetState("BLOCKED")}>
                阻塞
              </Button>
            </>
          )}
          {(detailCount > 0 || suggestions.length > 0) && (
            <Button size="sm" variant="ghost" onPress={() => setOpen((v) => !v)}>
              <Icon
                icon={open ? "gravity-ui:chevron-up" : "gravity-ui:chevron-down"}
                className="size-3.5"
              />
            </Button>
          )}
        </div>
      </div>

      {/* details */}
      {open && (
        <div className="border-t border-border px-2.5 py-2.5 space-y-3">
          {suggestions.length > 0 && (
            <section className="space-y-1.5">
              <div className="text-[10px] uppercase tracking-[0.08em] text-accent font-semibold">
                AI 建议（你正在编辑，未自动覆盖）
              </div>
              {suggestions.map((s, i) => (
                <div key={i} className="rounded-md border border-accent/30 bg-accent/5 p-2 space-y-1.5">
                  <div className="text-[10px] text-muted">{s.source ?? "import"}</div>
                  <div className="text-[12px] leading-[1.6] text-foreground/90 whitespace-pre-wrap line-clamp-4">
                    {s.content_zh || "(无中文)"}
                  </div>
                  <div className="flex gap-1.5">
                    <Button size="sm" variant="primary" onPress={() => onApplySuggestion(s, i)}>
                      应用到草稿
                    </Button>
                    <Button size="sm" variant="ghost" onPress={() => onDropSuggestion(i)}>
                      忽略
                    </Button>
                  </div>
                </div>
              ))}
            </section>
          )}

          {lint.length > 0 && (
            <section className="space-y-1.5">
              <div className="text-[10px] uppercase tracking-[0.08em] text-muted font-semibold">
                质检 · Lint
              </div>
              {lint.map((l, i) => (
                <div key={i} className="flex items-start gap-2 text-[12px]">
                  <Badge className={SEV_STYLE[l.severity ?? "WARN"] ?? SEV_STYLE.WARN}>
                    {l.severity ?? "WARN"}
                  </Badge>
                  <div className="min-w-0">
                    <span className="text-foreground/90">{l.message}</span>
                    {l.suggest && <span className="text-muted"> — {l.suggest}</span>}
                    {l.loc && <span className="text-muted/70"> [{l.loc}]</span>}
                  </div>
                </div>
              ))}
            </section>
          )}

          {evidence.length > 0 && (
            <section className="space-y-1.5">
              <div className="text-[10px] uppercase tracking-[0.08em] text-muted font-semibold">
                证据 · Evidence
              </div>
              {evidence.map((e, i) => (
                <div key={i} className="text-[12px] leading-[1.5] space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <Badge className={TAG_STYLE[e.tag ?? ""] ?? "bg-default-200 text-muted"}>
                      {e.tag ?? "—"}
                    </Badge>
                    <span className="text-foreground/90">{e.claim}</span>
                  </div>
                  {e.quote && <div className="text-muted pl-1 border-l-2 border-border">「{e.quote}」</div>}
                  {e.source && (
                    <a
                      href={e.source}
                      target="_blank"
                      rel="noreferrer"
                      className="text-accent hover:underline break-all"
                    >
                      {e.source}
                    </a>
                  )}
                  {e.reason && <div className="text-muted/80">{e.reason}</div>}
                </div>
              ))}
            </section>
          )}

          {hooks.length > 0 && (
            <section className="space-y-1.5">
              <div className="text-[10px] uppercase tracking-[0.08em] text-muted font-semibold">
                Reviewer 待办
              </div>
              {hooks.map((h, i) => (
                <div key={i} className="text-[12px]">
                  <Badge className="bg-default-200 text-foreground/70">{h.reviewer ?? "?"}</Badge>{" "}
                  <span className="text-foreground/90">{h.text}</span>
                  {h.reason && <span className="text-muted"> — {h.reason}</span>}
                </div>
              ))}
            </section>
          )}

          <section className="space-y-1">
            <Label className="text-[10px] uppercase tracking-[0.08em] text-muted font-semibold">
              事实底稿 · 我的要点（产品填）
            </Label>
            <TextField
              value={meta?.fact_notes ?? ""}
              onChange={(v) => onSetFactNotes(v)}
              variant="secondary"
              className="w-full"
            >
              <TextArea
                rows={2}
                placeholder="先把事实要点 / 数字 / 来源贴这里，再让 AI 起草措辞…"
                className="w-full text-[12px] leading-[1.6]"
              />
            </TextField>
          </section>
        </div>
      )}
    </div>
  );
}
