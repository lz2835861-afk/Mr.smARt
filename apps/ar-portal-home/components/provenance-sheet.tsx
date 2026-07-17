"use client";

import { useEffect, useState, type ReactNode } from "react";
import { BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProvenanceTimeline, type Reasoning } from "./provenance-timeline";

/** Trigger button + right-side slide-in drawer wrapping the timeline.
 *  No UI-kit dependency. */
export function ProvenanceSheet({ reasoning, fieldLabel, trigger }: { reasoning?: Reasoning; fieldLabel: string; trigger?: ReactNode }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!reasoning) return null;
  const sourceCount = reasoning.sources.length;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="View sources and reasoning"
        className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-zinc-500 transition-colors hover:text-zinc-900"
      >
        {trigger ?? (
          <>
            <BookOpen className="size-3.5" />
            <span className="tabular-nums">{sourceCount} source{sourceCount === 1 ? "" : "s"}</span>
          </>
        )}
      </button>

      <div className={cn("fixed inset-0 z-50", open ? "" : "pointer-events-none")} aria-hidden={!open}>
        <div
          className={cn("absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300", open ? "opacity-100" : "opacity-0")}
          onClick={() => setOpen(false)}
        />
        <div
          role="dialog"
          aria-modal="true"
          className={cn(
            "absolute right-0 top-0 flex h-full w-full max-w-[520px] flex-col bg-white shadow-2xl transition-transform duration-300 ease-out",
            open ? "translate-x-0" : "translate-x-full",
          )}
        >
          <div className="px-6 pt-6 pb-4">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Provenance</div>
            <h2 className="mt-1 text-base font-semibold text-zinc-900">{fieldLabel}</h2>
            <p className="mt-1 text-xs text-zinc-500">这条答案是怎么来的——来源 / 原文引用 / 推理 / 决策。</p>
          </div>
          <div className="h-px bg-zinc-200" />
          <div className="overflow-y-auto px-5 py-4">
            <ProvenanceTimeline reasoning={reasoning} />
          </div>
        </div>
      </div>
    </>
  );
}
