"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, TriangleAlert, Check } from "lucide-react";

import { cn } from "@/lib/utils";

export interface WordingContent {
  question: string;
  rawTab: string;
  refinedTab: string;
  raw: string;
  refined: string;
  rawFlags: string[];
  refinedFlags: string[];
  rewriteTag: string;
}

export function WordingShowcase({ content }: { content: WordingContent }) {
  const [view, setView] = useState<"raw" | "refined">("refined");
  const isRefined = view === "refined";

  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
      {/* toggle */}
      <div className="inline-flex rounded-xl border border-zinc-200 bg-zinc-50 p-1">
        {(["raw", "refined"] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setView(v)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors sm:text-sm",
              view === v ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-900",
            )}
          >
            {v === "raw" ? content.rawTab : content.refinedTab}
          </button>
        ))}
      </div>

      {/* answer card */}
      <div className="mt-4 rounded-2xl border border-zinc-200 bg-zinc-50/60 p-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-2.5 py-0.5 text-[11px] font-medium text-zinc-600">
            {content.question}
          </span>
          <AnimatePresence>
            {isRefined && (
              <motion.span
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2.5 py-0.5 text-[11px] font-medium text-sky-700"
              >
                <Sparkles className="h-3 w-3" /> {content.rewriteTag}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <div className="relative mt-3 min-h-[112px]">
          <AnimatePresence mode="wait">
            <motion.p
              key={view}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22 }}
              className={cn(
                "text-[15px] leading-relaxed",
                isRefined ? "text-zinc-800" : "text-zinc-400 italic",
              )}
            >
              {isRefined ? content.refined : content.raw}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* flags */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {(isRefined ? content.refinedFlags : content.rawFlags).map((flag) => (
            <span
              key={flag}
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
                isRefined ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700",
              )}
            >
              {isRefined ? <Check className="h-3 w-3" /> : <TriangleAlert className="h-3 w-3" />}
              {flag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
