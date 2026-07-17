"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { useT } from "@/lib/i18n";
import { WORKSPACE_URL } from "@/lib/site";
import { RaisedButton } from "@/components/ui/raised-button";

export default function RoadmapPage() {
  const r = useT().roadmap;

  return (
    <main className="relative min-h-screen bg-zinc-50 text-zinc-900">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(50rem 36rem at 90% -10%, rgba(0,82,217,0.10), transparent 60%), radial-gradient(40rem 30rem at 0% 0%, rgba(14,165,233,0.08), transparent 55%)",
        }}
      />

      <article className="mx-auto max-w-3xl px-4 pb-20 pt-10">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-600">{r.eyebrow}</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">{r.title}</h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-zinc-600">{r.subtitle}</p>

        <div className="mt-8 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <div className="relative aspect-[21/9] w-full bg-zinc-100">
            <Image src="/nav-roadmap.png" alt="" fill className="object-cover" priority />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <p className="absolute bottom-4 left-5 right-5 text-sm font-medium text-white/90">{r.subtitle}</p>
          </div>
        </div>

        <div className="mt-10 space-y-10">
          {r.phases.map((phase, i) => {
            const primary = i === 0;
            return (
              <section key={phase.tag}>
                <div className="flex flex-wrap items-center gap-2.5">
                  <span
                    className={
                      "grid h-7 place-items-center rounded-lg px-2.5 text-xs font-bold text-white " +
                      (primary ? "bg-sky-600" : "bg-zinc-400")
                    }
                  >
                    {phase.tag}
                  </span>
                  <span className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-500">
                    {phase.due}
                  </span>
                </div>
                <h2 className="mt-3 text-xl font-semibold tracking-tight text-zinc-900">{phase.title}</h2>
                <p className="mt-1.5 text-sm leading-relaxed text-zinc-600">{phase.desc}</p>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {phase.features.map((f) => (
                    <div
                      key={f.name}
                      className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-zinc-300 hover:shadow-md"
                    >
                      <h3 className="text-base font-semibold text-zinc-900">{f.name}</h3>
                      <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-sky-600">
                        {f.audience}
                      </p>
                      <p className="mt-2.5 text-sm leading-relaxed text-zinc-600">{f.desc}</p>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        <div className="mt-12 flex flex-wrap items-center gap-3">
          <RaisedButton
            color="#00bbff"
            onClick={() => window.open(WORKSPACE_URL, "_blank", "noopener,noreferrer")}
          >
            {r.cta}
            <ArrowRight className="h-4 w-4" />
          </RaisedButton>
          <Link href="/" className="text-sm font-medium text-zinc-600 hover:text-zinc-900">
            {r.back}
          </Link>
        </div>
      </article>
    </main>
  );
}
