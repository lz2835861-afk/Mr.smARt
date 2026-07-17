"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { useT } from "@/lib/i18n";
import { WORKSPACE_URL } from "@/lib/site";
import { RaisedButton } from "@/components/ui/raised-button";

export default function GuidePage() {
  const g = useT().guide;

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
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-600">{g.eyebrow}</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">{g.title}</h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-zinc-600">{g.subtitle}</p>

        <div className="mt-8 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <div className="relative aspect-[21/9] w-full bg-zinc-100">
            <Image
              src="/nav-guide-tutorial.png"
              alt=""
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <p className="absolute bottom-4 left-5 right-5 text-sm font-medium text-white/90">{g.subtitle}</p>
          </div>

          <ol className="divide-y divide-zinc-100">
            {g.steps.map((step, i) => (
              <li key={step.title} className="flex gap-4 px-5 py-5 sm:px-6">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-50 text-sm font-semibold text-sky-700">
                  {i + 1}
                </span>
                <div>
                  <h2 className="text-base font-semibold text-zinc-900">{step.title}</h2>
                  <p className="mt-1.5 text-sm leading-relaxed text-zinc-600">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <RaisedButton color="#00bbff" onClick={() => window.open(WORKSPACE_URL, "_blank", "noopener,noreferrer")}>
            {g.openWorkspace}
            <ArrowRight className="h-4 w-4" />
          </RaisedButton>
          <Link href="/" className="text-sm font-medium text-zinc-600 hover:text-zinc-900">
            {g.back}
          </Link>
        </div>
      </article>
    </main>
  );
}
