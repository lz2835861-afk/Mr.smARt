import Image from "next/image";
import { ArrowUp, Clock3, Sparkles, TrendingUp } from "lucide-react";

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

/** A framed, desaturated preview with a "coming soon" badge + title/description. */
export function ComingSoonCard({
  badge,
  windowTitle,
  title,
  desc,
  children,
}: {
  badge: string;
  windowTitle: string;
  title: string;
  desc: string;
  children: ReactNode;
}) {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
      {/* window chrome */}
      <div className="flex items-center gap-1.5 border-b border-zinc-100 bg-zinc-50/80 px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-zinc-300" />
        <span className="h-2.5 w-2.5 rounded-full bg-zinc-300" />
        <span className="h-2.5 w-2.5 rounded-full bg-zinc-300" />
        <span className="ml-2 truncate text-[11px] font-medium text-zinc-400">{windowTitle}</span>
      </div>

      {/* desaturated preview */}
      <div className="relative h-[244px] overflow-hidden">
        <div className="absolute inset-0 opacity-55 grayscale transition duration-500 group-hover:opacity-70">
          {children}
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent" />
        <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-zinc-600 shadow-sm backdrop-blur">
          <Clock3 className="h-3 w-3 text-sky-500" />
          {badge}
        </span>
      </div>

      {/* caption */}
      <div className="p-5">
        <h3 className="text-lg font-semibold tracking-tight text-zinc-900">{title}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-zinc-500">{desc}</p>
      </div>
    </div>
  );
}

/** The competitor ranking-monitor screenshot, shown as the preview content. */
export function RankingMonitorPreview() {
  return (
    <Image
      src="/ranking-monitor.png"
      alt=""
      fill
      sizes="(max-width: 1024px) 100vw, 600px"
      className="object-cover object-left-top"
    />
  );
}

/** Abstract Market Insight mock — competitive signals + narrative themes + a ready-to-use line. */
export function MarketInsightPreview({
  signalsLabel,
  themesLabel,
  signals,
  themes,
}: {
  signalsLabel: string;
  themesLabel: string;
  signals: { firm: string; note: string; delta: string }[];
  themes: string[];
}) {
  return (
    <div className="h-full w-full bg-zinc-50 p-4">
      {/* competitive signals */}
      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-500">
        <TrendingUp className="h-3.5 w-3.5 text-sky-500" />
        {signalsLabel}
      </div>
      <div className="mt-2 space-y-1.5">
        {signals.map((s) => (
          <div
            key={s.firm + s.note}
            className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5"
          >
            <div className="min-w-0">
              <span className="text-[11px] font-semibold text-zinc-700">{s.firm}</span>
              <span className="ml-1.5 text-[11px] text-zinc-400">{s.note}</span>
            </div>
            <span className="inline-flex items-center gap-0.5 rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10.5px] font-bold text-emerald-600">
              <ArrowUp className="h-2.5 w-2.5" />
              {s.delta}
            </span>
          </div>
        ))}
      </div>

      {/* narrative themes */}
      <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-zinc-500">
        <Sparkles className="h-3.5 w-3.5 text-sky-500" />
        {themesLabel}
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {themes.map((th, i) => (
          <span
            key={th}
            className={cn(
              "rounded-full border px-2 py-0.5 text-[11px] font-medium",
              i % 3 === 0
                ? "border-sky-200 bg-sky-50 text-sky-700"
                : "border-zinc-200 bg-white text-zinc-600",
            )}
          >
            {th}
          </span>
        ))}
      </div>
    </div>
  );
}
