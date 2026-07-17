"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  Building2,
  CalendarClock,
  Flame,
  LayoutGrid,
  List,
  Trophy,
  Users,
} from "lucide-react";

import { useLocale, useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { WORKSPACE_URL } from "@/lib/site";
import { RaisedButton } from "@/components/ui/raised-button";
import { ProductLogo } from "@/components/product-logo";
import { ProductHoloCard } from "@/components/product-holo-card";
import {
  FIRMS,
  REPORTS,
  PRODUCTS,
  UPDATED_AT,
  formatDue,
  getLeaderboard,
  nextDeadline,
  productsForReport,
  type LeaderboardEntry,
  type Report,
} from "@/lib/reports-in-progress";

export default function ReportsInProgressPage() {
  const t = useT();
  const L = t.leaderboard;
  const { locale } = useLocale();

  const board = useMemo(() => getLeaderboard(), []);
  const podium = board.slice(0, 3);
  const maxCount = board[0]?.count || 1;

  const [view, setView] = useState<"board" | "reports">("board");
  const [filter, setFilter] = useState<string | null>(null);

  const firmsCount = new Set(REPORTS.map((r) => r.firm)).size;
  const due = nextDeadline();
  const dueLabel = due ? formatDue(due, locale) : L.byReport.noDue;

  const rows = filter ? board.filter((e) => e.reports.some((r) => r.id === filter)) : board;
  const countLabel = (n: number) => (n === 1 ? L.board.countOne : L.board.countMany);

  const toggleFilter = (id: string) => setFilter((cur) => (cur === id ? null : id));

  return (
    <main className="relative min-h-screen bg-zinc-50 text-zinc-900">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(55rem 40rem at 85% -12%, rgba(0,82,217,0.12), transparent 60%), radial-gradient(42rem 32rem at -5% 0%, rgba(14,165,233,0.10), transparent 55%)",
        }}
      />

      {/* ── hero ───────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 pt-10 sm:px-6 sm:pt-14">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-600">
            {L.eyebrow}
          </span>
          {/* Sample-data tag — safe to delete once real data is in. */}
          <span className="rounded-full border border-amber-300/70 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">
            {L.sample}
          </span>
        </div>

        <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl">
          {L.titleLead}
          <span className="bg-gradient-to-r from-sky-500 to-[#0052D9] bg-clip-text text-transparent">
            {L.titleHighlight}
          </span>
          {L.titleTail}
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-zinc-600">{L.subtitle}</p>
        <p className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-zinc-500">
          <Flame className="h-4 w-4 text-orange-500" />
          {L.hot}
        </p>

        {/* stat strip */}
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatTile icon={<Trophy className="h-4 w-4" />} value={String(REPORTS.length)} label={L.stats.reports} />
          <StatTile icon={<Users className="h-4 w-4" />} value={String(PRODUCTS.length)} label={L.stats.products} />
          <StatTile icon={<Building2 className="h-4 w-4" />} value={String(firmsCount)} label={L.stats.firms} />
          <StatTile icon={<CalendarClock className="h-4 w-4" />} value={dueLabel} label={L.stats.nextDue} />
        </div>

        {/* view toggle */}
        <div className="mt-8 inline-flex rounded-xl border border-zinc-200 bg-white p-1 shadow-sm">
          <ToggleButton active={view === "board"} onClick={() => setView("board")} icon={<List className="h-4 w-4" />}>
            {L.views.board}
          </ToggleButton>
          <ToggleButton active={view === "reports"} onClick={() => setView("reports")} icon={<LayoutGrid className="h-4 w-4" />}>
            {L.views.reports}
          </ToggleButton>
        </div>
      </section>

      {view === "board" ? (
        <>
          {/* ── podium ─────────────────────────────────────────────────── */}
          <section className="mx-auto max-w-6xl px-4 pt-10 sm:px-6">
            <SectionHead title={L.podium.title} subtitle={L.podium.subtitle} />
            <div className="mt-6 flex flex-col items-center gap-6 sm:flex-row sm:items-end sm:justify-center sm:gap-5">
              {podium.map((entry, i) => (
                <div
                  key={entry.product.id}
                  className={cn(i === 0 && "sm:order-2", i === 1 && "sm:order-1", i === 2 && "sm:order-3")}
                >
                  <ProductHoloCard
                    entry={entry}
                    width={i === 0 ? 300 : 272}
                    height={i === 0 ? 412 : 376}
                  />
                </div>
              ))}
            </div>
          </section>

          {/* ── full leaderboard ───────────────────────────────────────── */}
          <section className="mx-auto max-w-4xl px-4 pt-14 pb-4 sm:px-6">
            <SectionHead title={L.board.title} subtitle={L.board.subtitle} />

            {/* filter chips */}
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="mr-1 text-xs font-medium text-zinc-400">{L.board.filterHint}:</span>
              <FilterChip active={filter === null} onClick={() => setFilter(null)}>
                {L.board.filterAll}
              </FilterChip>
              {REPORTS.map((r) => (
                <FilterChip key={r.id} active={filter === r.id} color={FIRMS[r.firm].color} onClick={() => toggleFilter(r.id)}>
                  {r.shortName}
                </FilterChip>
              ))}
            </div>

            <ol className="mt-5 space-y-2.5">
              {rows.map((entry) => (
                <LeaderboardRow
                  key={entry.product.id}
                  entry={entry}
                  maxCount={maxCount}
                  activeFilter={filter}
                  onBadgeClick={toggleFilter}
                  countLabel={countLabel}
                  taglineLocale={locale}
                  stages={L.stages}
                />
              ))}
              {rows.length === 0 && (
                <li className="rounded-xl border border-dashed border-zinc-200 bg-white/60 px-4 py-8 text-center text-sm text-zinc-400">
                  {L.board.empty}
                </li>
              )}
            </ol>
          </section>
        </>
      ) : (
        /* ── by-report view ───────────────────────────────────────────── */
        <section className="mx-auto max-w-6xl px-4 pt-10 pb-4 sm:px-6">
          <SectionHead title={L.byReport.title} subtitle={L.byReport.subtitle} />
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {REPORTS.map((r) => (
              <ReportCard
                key={r.id}
                report={r}
                locale={locale}
                stageLabel={L.stages[r.stage]}
                dueLabel={L.byReport.due}
                rosterLabel={L.byReport.roster}
                productsLabel={(n) => (n === 1 ? L.byReport.productsOne : L.byReport.productsMany)}
              />
            ))}
          </div>
        </section>
      )}

      {/* ── CTA ────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-gradient-to-br from-zinc-900 to-[#0a1730] px-6 py-12 text-center shadow-xl sm:px-12">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-60"
            style={{ background: "radial-gradient(40rem 20rem at 50% -30%, rgba(0,187,255,0.25), transparent 60%)" }}
          />
          <div className="relative">
            <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">{L.cta.title}</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-zinc-300">{L.cta.subtitle}</p>
            <div className="mt-7 flex justify-center">
              <RaisedButton
                color="#00bbff"
                size="lg"
                onClick={() => window.open(WORKSPACE_URL, "_blank", "noopener,noreferrer")}
              >
                {L.cta.button}
              </RaisedButton>
            </div>
            <p className="mt-6 text-xs text-zinc-500">
              {L.updated} {UPDATED_AT}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

/* ───────────────────────────── sub-components ────────────────────────────── */

function SectionHead({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <h2 className="text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl">{title}</h2>
      <p className="mt-1.5 text-sm text-zinc-500">{subtitle}</p>
    </div>
  );
}

function StatTile({ icon, value, label }: { icon: ReactNode; value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white/80 px-4 py-3.5 shadow-sm backdrop-blur-sm">
      <div className="flex items-center gap-1.5 text-sky-600">{icon}</div>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900">{value}</p>
      <p className="text-xs text-zinc-500">{label}</p>
    </div>
  );
}

function ToggleButton({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors",
        active ? "bg-zinc-900 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-900",
      )}
    >
      {icon}
      {children}
    </button>
  );
}

function FilterChip({
  active,
  color,
  onClick,
  children,
}: {
  active: boolean;
  color?: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
        active
          ? "border-transparent bg-zinc-900 text-white"
          : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:text-zinc-900",
      )}
    >
      {color && (
        <span
          className="h-2 w-2 rounded-full"
          style={{ background: active ? "#fff" : color }}
        />
      )}
      {children}
    </button>
  );
}

const RANK_TONE: Record<number, string> = {
  1: "text-amber-500",
  2: "text-zinc-400",
  3: "text-orange-700/70",
};

function LeaderboardRow({
  entry,
  maxCount,
  activeFilter,
  onBadgeClick,
  countLabel,
  taglineLocale,
  stages,
}: {
  entry: LeaderboardEntry;
  maxCount: number;
  activeFilter: string | null;
  onBadgeClick: (id: string) => void;
  countLabel: (n: number) => string;
  taglineLocale: "zh" | "en";
  stages: Record<string, string>;
}) {
  const { product, reports, count, rank } = entry;

  return (
    <li className="group flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white px-3.5 py-3 shadow-sm transition hover:border-zinc-300 hover:shadow-md sm:gap-4 sm:px-4">
      {/* rank */}
      <span className={cn("w-7 shrink-0 text-center text-lg font-bold tabular-nums sm:text-xl", RANK_TONE[rank] || "text-zinc-300")}>
        {rank}
      </span>

      {/* logo */}
      <ProductLogo product={product} size={44} rounded="rounded-xl" />

      {/* name + tagline + bar */}
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="truncate font-semibold text-zinc-900">{product.name}</span>
          {product.tagline && (
            <span className="hidden truncate text-xs text-zinc-400 sm:inline">{product.tagline[taglineLocale]}</span>
          )}
        </div>
        {/* participation bar */}
        <div className="mt-1.5 h-1.5 w-full max-w-[10rem] overflow-hidden rounded-full bg-zinc-100">
          <div
            className="h-full rounded-full"
            style={{ width: `${(count / maxCount) * 100}%`, background: product.accent }}
          />
        </div>
        {/* report badges */}
        <div className="mt-2 flex flex-wrap gap-1">
          {reports.map((r) => (
            <button
              key={r.id}
              type="button"
              title={`${r.name} · ${stages[r.stage]}`}
              onClick={() => onBadgeClick(r.id)}
              className={cn(
                "rounded-md px-1.5 py-0.5 text-[10.5px] font-medium text-white transition",
                activeFilter && activeFilter !== r.id && "opacity-35",
              )}
              style={{ background: FIRMS[r.firm].color }}
            >
              {r.shortName}
            </button>
          ))}
        </div>
      </div>

      {/* count */}
      <div className="shrink-0 text-right">
        <p className="text-xl font-bold tabular-nums text-zinc-900">{count}</p>
        <p className="text-[10px] uppercase tracking-wide text-zinc-400">{countLabel(count)}</p>
      </div>
    </li>
  );
}

function ReportCard({
  report,
  locale,
  stageLabel,
  dueLabel,
  rosterLabel,
  productsLabel,
}: {
  report: Report;
  locale: "zh" | "en";
  stageLabel: string;
  dueLabel: string;
  rosterLabel: string;
  productsLabel: (n: number) => string;
}) {
  const firm = FIRMS[report.firm];
  const roster = productsForReport(report);

  return (
    <div className="flex flex-col rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-zinc-300 hover:shadow-md">
      <div className="flex items-center justify-between">
        <span className="rounded-md px-2 py-0.5 text-[11px] font-semibold text-white" style={{ background: firm.color }}>
          {firm.label}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-600">
          {stageLabel}
        </span>
      </div>

      <h3 className="mt-3 text-sm font-semibold leading-snug text-zinc-900">{report.name}</h3>
      {report.track && <p className="mt-1 text-xs text-zinc-500">{report.track[locale]}</p>}

      {report.due && (
        <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-zinc-500">
          <CalendarClock className="h-3.5 w-3.5 text-sky-500" />
          {dueLabel} {formatDue(report.due, locale)}
        </p>
      )}

      <div className="mt-4 border-t border-zinc-100 pt-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium uppercase tracking-wide text-zinc-400">{rosterLabel}</span>
          <span className="text-[11px] text-zinc-400">
            {roster.length} {productsLabel(roster.length)}
          </span>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {roster.map((p) => (
            <span
              key={p.id}
              className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50 py-0.5 pl-0.5 pr-2 text-xs font-medium text-zinc-700"
            >
              <ProductLogo product={p} size={20} rounded="rounded-full" />
              {p.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
