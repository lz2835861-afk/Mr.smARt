"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";
import { WORKSPACE_URL } from "@/lib/site";
import { RaisedButton } from "@/components/ui/raised-button";
import { WaveSpinner } from "@/components/ui/wave-spinner";
import { UnicornBackground } from "@/components/landing/unicorn-background";
import { WordingShowcase } from "@/components/landing/wording-showcase";
import { UpvoteWall } from "@/components/landing/upvote-wall";
import { WorkspaceHub } from "@/components/landing/workspace-hub";
import { ProvenanceTimeline, type Reasoning } from "@/components/provenance-timeline";
import { ProductHoloCard } from "@/components/product-holo-card";
import { getLeaderboard } from "@/lib/reports-in-progress";
import {
  ComingSoonCard,
  MarketInsightPreview,
  RankingMonitorPreview,
} from "@/components/landing/coming-soon";

/* ----------------------------- static data ------------------------------- */
// A real Chinese answer's provenance — shown verbatim in both locales (it's a
// sample artifact, like a screenshot). Swap for any answer's reasoning object.
const REASONING: Reasoning = {
  sources: [
    { url: "https://www.tencentcloud.com/product/ti", label: "tencentcloud.com/product/ti" },
    { url: "https://www.nvidia.com/en-us/on-demand/session/gtc25-S71563/", label: "NVIDIA GTC 2025 · Tencent HunYuan S71563" },
    { url: "https://mp.weixin.qq.com/s/hUUB6qnIP_OZMw8FxqBr_A", label: "公众号腾讯云 2026-03-03（混元 3D 海外开放 + Maxon）" },
  ],
  quotes: [
    `[TI Platform]: "Tencent Cloud TI Platform incorporates a wide variety of learning frameworks…"`,
    `[NVIDIA GTC]: "Tencent HunYuan has worked closely with NVIDIA to build AngelHCF…"`,
    `[公众号腾讯云 2026-03-03]: "德国软件公司 Maxon 已在其 Cinema 4D 中集成混元 3D API"`,
  ],
  reasoning: `三层框架（训练/推理 + Hunyuan + Agent）保留并加深：训练/推理层补充省 Token 优化已上游进入主流框架；Hunyuan 层把海外亮点切到 3D 系列。混元主 LLM 海外 GA 未公开，answer 不作此声称。`,
  decision: `按"框架 / Hunyuan / Agent"三层铺陈；海外通过 Hunyuan 3D / TokenHub / ADP 输出。`,
};

/* ------------------------------- primitives ------------------------------ */

function SectionHead({
  eyebrow,
  title,
  desc,
  center,
}: {
  eyebrow: string;
  title: string;
  desc?: string;
  center?: boolean;
}) {
  return (
    <div className={cn("max-w-2xl", center && "mx-auto text-center")}>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-600">{eyebrow}</p>
      <h2 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">{title}</h2>
      {desc && <p className="mt-3 text-base leading-relaxed text-zinc-500">{desc}</p>}
    </div>
  );
}

/* --------------------------------- page ---------------------------------- */

export default function Landing() {
  const t = useT();
  const podium = getLeaderboard().slice(0, 3);

  return (
    <main className="relative min-h-screen overflow-x-clip bg-zinc-50 text-zinc-900">
      {/* ------------------------------ hero ------------------------------- */}
      {/* Pulled up ~68px behind the global sticky navbar so the WebGL covers
          the page from the very top, including behind the nav. */}
      <section className="relative isolate -mt-[68px] overflow-hidden">
        <UnicornBackground className="absolute inset-0 -z-20" />
        {/* legibility scrim: a soft light halo behind the centered text, brighter
            WebGL up top (behind the navbar), fading into the page at the bottom. */}
        <div
          aria-hidden
          className="absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(44rem 26rem at 50% 47%, rgba(244,247,251,0.74), rgba(244,247,251,0) 72%), linear-gradient(0deg, #f4f7fb 0%, rgba(244,247,251,0) 34%)",
          }}
        />

        <div className="mx-auto w-full max-w-3xl px-4 pb-28 pt-36 text-center sm:px-6 sm:pb-36 sm:pt-48">
          <span className="inline-flex items-center gap-2 rounded-full border border-sky-200/70 bg-white/70 px-3 py-1 text-xs font-medium text-sky-700 backdrop-blur">
            <WaveSpinner size="xs" /> {t.hero.eyebrow}
          </span>
          <h1 className="mt-6 text-[2.75rem] font-semibold leading-[1.05] tracking-tight text-zinc-900 sm:text-7xl">
            {t.hero.titleLead}
            <span className="whitespace-nowrap bg-gradient-to-r from-sky-500 to-[#0052D9] bg-clip-text text-transparent">
              {t.hero.titleHighlight}
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-600">{t.hero.subtitle}</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <RaisedButton color="#00bbff" size="lg" onClick={() => window.open(WORKSPACE_URL, "_blank", "noopener,noreferrer")}>
              {t.hero.ctaPrimary}
            </RaisedButton>
            <a
              href="#board"
              className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white/80 px-5 py-2.5 text-sm font-medium text-zinc-700 shadow-sm backdrop-blur transition hover:border-zinc-300 hover:text-zinc-900"
            >
              {t.hero.ctaSecondary} <ArrowRight className="h-4 w-4" />
            </a>
          </div>
          <p className="mt-10 text-xs uppercase tracking-wider text-zinc-400">{t.hero.trustLabel}</p>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm font-medium text-zinc-500">
            <span>Gartner Magic Quadrant</span>
            <span className="text-zinc-300">·</span>
            <span>Forrester Wave</span>
            <span className="text-zinc-300">·</span>
            <span>IDC MarketScape</span>
            <span className="text-zinc-300">·</span>
            <span>Omdia Universe</span>
          </div>
        </div>
      </section>

      {/* ------------------------- 1 · wording handled --------------------- */}
      <section id="wording" className="scroll-mt-20 border-t border-zinc-200/70 bg-white">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:gap-14">
          <div>
            <SectionHead eyebrow={t.wording.eyebrow} title={t.wording.title} desc={t.wording.desc} />
            <div className="mt-6 flex flex-wrap gap-2">
              {t.wording.traits.map((tr) => (
                <span
                  key={tr}
                  className="inline-flex items-center rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-sm text-zinc-600"
                >
                  {tr}
                </span>
              ))}
            </div>
          </div>
          <WordingShowcase content={t.wording.showcase} />
        </div>
      </section>

      {/* ----------------------------- 2 · source -------------------------- */}
      <section className="scroll-mt-20 border-t border-zinc-200/70">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[1fr_1.05fr] lg:gap-14">
          <SectionHead eyebrow={t.source.eyebrow} title={t.source.title} desc={t.source.desc} />
          <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between border-b border-zinc-100 pb-3">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Provenance</div>
                <div className="text-sm font-semibold text-zinc-900">{t.source.fieldLabel}</div>
              </div>
              <span className="rounded-full bg-sky-50 px-2.5 py-1 text-[11px] font-semibold text-sky-700">
                {t.source.badge}
              </span>
            </div>
            <ProvenanceTimeline reasoning={REASONING} />
          </div>
        </div>
      </section>

      {/* ------------------------- 3 · unified workspace ------------------- */}
      <section id="board" className="scroll-mt-20 border-t border-zinc-200/70 bg-zinc-50">
        <div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6">
          <SectionHead center eyebrow={t.workspace.eyebrow} title={t.workspace.title} desc={t.workspace.desc} />
          <div className="mt-10">
            <WorkspaceHub />
          </div>
        </div>
      </section>

      {/* --------------------------- 4 · leaderboard ----------------------- */}
      <section id="rankings" className="scroll-mt-20 border-t border-zinc-200/70 bg-white">
        <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6">
          <SectionHead center eyebrow={t.board.eyebrow} title={t.board.title} desc={t.board.desc} />
          <div className="mt-12 flex flex-col items-center gap-6 sm:flex-row sm:items-end sm:justify-center sm:gap-5">
            {podium.map((entry, i) => (
              <div
                key={entry.product.id}
                className={cn(i === 0 && "sm:order-2", i === 1 && "sm:order-1", i === 2 && "sm:order-3")}
              >
                <ProductHoloCard entry={entry} width={i === 0 ? 288 : 264} height={i === 0 ? 396 : 364} />
              </div>
            ))}
          </div>
          <div className="mt-10 flex justify-center">
            <Link
              href="/reports-in-progress"
              className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-5 py-2.5 text-sm font-medium text-zinc-700 shadow-sm transition hover:border-zinc-300 hover:text-zinc-900"
            >
              {t.board.cta} <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ------------------------ 4 + 5 · coming soon ---------------------- */}
      <section className="scroll-mt-20 border-t border-zinc-200/70">
        <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6">
          <SectionHead center eyebrow={t.soon.eyebrow} title={t.soon.title} desc={t.soon.desc} />
          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            <ComingSoonCard
              badge={t.soon.badge}
              windowTitle={t.soon.ranking.windowTitle}
              title={t.soon.ranking.title}
              desc={t.soon.ranking.desc}
            >
              <RankingMonitorPreview />
            </ComingSoonCard>
            <ComingSoonCard
              badge={t.soon.badge}
              windowTitle={t.soon.market.windowTitle}
              title={t.soon.market.title}
              desc={t.soon.market.desc}
            >
              <MarketInsightPreview
                signalsLabel={t.soon.market.signalsLabel}
                themesLabel={t.soon.market.themesLabel}
                signals={t.soon.market.signals}
                themes={t.soon.market.themes}
              />
            </ComingSoonCard>
          </div>
        </div>
      </section>

      {/* --------------------------- 共建路线图 ---------------------------- */}
      <section className="border-t border-zinc-200/70 bg-white">
        <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6">
          <SectionHead center eyebrow={t.cta.eyebrow} title={t.cta.title} desc={t.cta.subtitle} />
          <div className="mt-12">
            <UpvoteWall />
          </div>
        </div>
      </section>

      {/* ------------------------------- CTA ------------------------------- */}
      <section className="border-t border-zinc-200/70">
        <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6">
          <div className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-gradient-to-br from-zinc-900 to-[#0a1730] px-6 py-14 text-center shadow-xl sm:px-12">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-60"
              style={{ background: "radial-gradient(40rem 20rem at 50% -30%, rgba(0,187,255,0.25), transparent 60%)" }}
            />
            <div className="relative">
              <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">{t.cta.finalTitle}</h2>
              <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-zinc-300">{t.cta.finalSubtitle}</p>
              <div className="mt-7 flex justify-center">
                <RaisedButton color="#00bbff" size="lg" onClick={() => window.open(WORKSPACE_URL, "_blank", "noopener,noreferrer")}>
                  {t.cta.finalCta}
                </RaisedButton>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------ footer ----------------------------- */}
      <footer className="border-t border-zinc-200/70">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-4 py-8 text-sm text-zinc-400 sm:flex-row sm:px-6">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="Mr.smARt" width={24} height={24} className="h-6 w-6 rounded-md object-cover" />
            <span className="font-medium text-zinc-600">Mr.smARt</span>
            <span>· {t.footer.tagline}</span>
          </div>
          <p>{t.footer.note}</p>
        </div>
      </footer>
    </main>
  );
}
