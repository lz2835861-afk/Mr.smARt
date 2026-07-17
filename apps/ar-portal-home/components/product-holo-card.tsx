"use client";

import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";

import { cn } from "@/lib/utils";
import { useLocale, useT } from "@/lib/i18n";
import {
  FIRMS,
  formatDue,
  type Firm,
  type LeaderboardEntry,
} from "@/lib/reports-in-progress";
import { ProductLogo } from "@/components/product-logo";
import "@/components/ui/holo-card.css";

const MEDALS: Record<number, { ring: string; chip: string; label: string }> = {
  1: { ring: "#FFD66B", chip: "linear-gradient(135deg,#FFE7A0,#E8A93B)", label: "#7A4E00" },
  2: { ring: "#D8E2EC", chip: "linear-gradient(135deg,#F2F6FA,#B9C6D4)", label: "#3C4A5A" },
  3: { ring: "#F0B98B", chip: "linear-gradient(135deg,#F7CBA0,#C9824E)", label: "#5A3210" },
};

const MAX_TILT = 9; // degrees

export function ProductHoloCard({
  entry,
  width = 300,
  height = 400,
}: {
  entry: LeaderboardEntry;
  width?: number;
  height?: number;
}) {
  const { locale } = useLocale();
  const t = useT().leaderboard;
  const sceneRef = useRef<HTMLDivElement>(null);
  const [flipped, setFlipped] = useState(false);

  const { product, reports, count, rank } = entry;
  const medal = MEDALS[rank];

  // Distinct firms this product is in — shown as badges on the front.
  const firms = Array.from(new Set(reports.map((r) => r.firm))) as Firm[];

  const setVars = (rx: string, ry: string, mx: string, my: string) => {
    const el = sceneRef.current;
    if (!el) return;
    el.style.setProperty("--phc-rx", rx);
    el.style.setProperty("--phc-ry", ry);
    el.style.setProperty("--phc-mx", mx);
    el.style.setProperty("--phc-my", my);
  };

  const handleMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const el = sceneRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    setVars(
      `${-(py - 0.5) * 2 * MAX_TILT}deg`,
      `${(px - 0.5) * 2 * MAX_TILT}deg`,
      `${px * 100}%`,
      `${py * 100}%`,
    );
  };

  const handleLeave = () => setVars("0deg", "0deg", "50%", "50%");

  const faceBg = {
    background: `radial-gradient(125% 120% at 12% 0%, ${product.accent} 0%, #0b1326 58%, #070b18 100%)`,
  };

  return (
    <div
      ref={sceneRef}
      className="phc-scene"
      style={{ width, height }}
      role="button"
      tabIndex={0}
      aria-pressed={flipped}
      aria-label={`${product.name} — ${t.podium.reportsIn.replace("{n}", String(count))}`}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      onClick={() => setFlipped((f) => !f)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setFlipped((f) => !f);
        }
      }}
    >
      <div className="phc-tilt">
        <div className="phc-flip" data-flipped={flipped}>
          {/* ── Front ─────────────────────────────────────────────── */}
          <div className="phc-face" style={faceBg}>
            <div className="phc-sheen" />
            <div className="phc-glare" />
            <div className="relative z-[5] flex h-full flex-col p-5 text-white">
              {/* top row: rank medal + report count */}
              <div className="flex items-start justify-between">
                <span
                  className="flex h-11 w-11 items-center justify-center rounded-full text-base font-bold tabular-nums ring-2"
                  style={
                    medal
                      ? { background: medal.chip, color: medal.label, boxShadow: `0 0 0 2px ${medal.ring}66` }
                      : { background: "rgba(255,255,255,0.12)", color: "#fff" }
                  }
                >
                  {rank}
                </span>
                <span className="rounded-full bg-white/12 px-2.5 py-1 text-[11px] font-medium text-white/85 backdrop-blur-sm">
                  {t.podium.reportsIn.replace("{n}", String(count))}
                </span>
              </div>

              {/* logo + name */}
              <div className="mt-auto">
                <ProductLogo product={product} size={64} className="ring-1 ring-white/20" />
                <h3 className="mt-3 text-2xl font-semibold tracking-tight">{product.name}</h3>
                {product.tagline && (
                  <p className="mt-1 text-sm text-white/70">{product.tagline[locale]}</p>
                )}

                {/* firm badges */}
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {firms.map((f) => (
                    <span
                      key={f}
                      className="rounded-md px-2 py-0.5 text-[11px] font-semibold text-white"
                      style={{ background: `${FIRMS[f].color}` }}
                    >
                      {FIRMS[f].label}
                    </span>
                  ))}
                </div>

                <p className="mt-4 text-[11px] text-white/45">{t.podium.flipHint}</p>
              </div>
            </div>
          </div>

          {/* ── Back ──────────────────────────────────────────────── */}
          <div className="phc-face phc-face--back" style={faceBg}>
            <div className="phc-sheen" />
            <div className="relative z-[5] flex h-full flex-col p-5 text-white">
              <div className="flex items-center gap-2.5">
                <ProductLogo product={product} size={36} rounded="rounded-xl" className="ring-1 ring-white/20" />
                <div>
                  <h3 className="text-base font-semibold leading-tight">{product.name}</h3>
                  <p className="text-[11px] text-white/55">
                    {t.podium.reportsIn.replace("{n}", String(count))}
                  </p>
                </div>
              </div>

              <ul className="mt-3 flex-1 space-y-1.5 overflow-y-auto pr-1">
                {reports.map((r) => (
                  <li
                    key={r.id}
                    className="rounded-lg bg-white/8 px-2.5 py-2 ring-1 ring-white/10"
                  >
                    <div className="flex items-center gap-1.5">
                      <span
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ background: FIRMS[r.firm].color }}
                      />
                      <span className="truncate text-[12px] font-medium text-white/90">
                        {r.shortName}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-[10.5px] text-white/55">
                      <span>{t.stages[r.stage]}</span>
                      {r.due && (
                        <span>
                          {t.byReport.due} {formatDue(r.due, locale)}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
