"use client";

import { useMemo, useState } from "react";
import { Bot, ExternalLink, FileCheck2, RefreshCw, ShieldCheck } from "lucide-react";

import { useT } from "@/lib/i18n";
import { QUESTIONNAIRE_ASSISTANT_URL, WORKSPACE_URL } from "@/lib/site";
import { cn } from "@/lib/utils";

type WorkspaceId = "assistant" | "questionnaire";

export function WorkspaceHub() {
  const t = useT();
  const [active, setActive] = useState<WorkspaceId>("questionnaire");
  const [reloadKey, setReloadKey] = useState(0);

  const applications = useMemo(
    () => [
      {
        id: "assistant" as const,
        title: t.workspace.assistant.title,
        description: t.workspace.assistant.desc,
        url: QUESTIONNAIRE_ASSISTANT_URL,
        icon: Bot,
      },
      {
        id: "questionnaire" as const,
        title: t.workspace.questionnaire.title,
        description: t.workspace.questionnaire.desc,
        url: WORKSPACE_URL,
        icon: FileCheck2,
      },
    ],
    [t],
  );

  const current = applications.find((application) => application.id === active) ?? applications[0];
  const CurrentIcon = current.icon;

  return (
    <div className="overflow-hidden rounded-[28px] border border-zinc-200 bg-white shadow-[0_24px_70px_-34px_rgba(15,23,42,0.35)]">
      <div className="border-b border-zinc-200 bg-gradient-to-r from-zinc-950 via-[#101d36] to-[#102a54] px-4 py-4 text-white sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-400/15 text-sky-300 ring-1 ring-inset ring-sky-300/20">
              <CurrentIcon className="h-5 w-5" />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-semibold sm:text-lg">{current.title}</h3>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/10 px-2 py-1 text-[11px] font-semibold text-emerald-300 ring-1 ring-inset ring-emerald-300/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                  {t.workspace.live}
                </span>
              </div>
              <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-300">{current.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setReloadKey((key) => key + 1)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-medium text-slate-200 transition hover:bg-white/10 hover:text-white"
              aria-label={t.workspace.reload}
            >
              <RefreshCw className="h-3.5 w-3.5" />
              {t.workspace.reload}
            </button>
            <a
              href={current.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-sky-400 px-3 py-2 text-xs font-semibold text-slate-950 transition hover:bg-sky-300"
            >
              {t.workspace.openNew} <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          {applications.map((application) => {
            const Icon = application.icon;
            const selected = application.id === active;
            return (
              <button
                key={application.id}
                type="button"
                onClick={() => setActive(application.id)}
                className={cn(
                  "flex flex-1 items-center gap-3 rounded-xl border px-4 py-3 text-left transition",
                  selected
                    ? "border-sky-300/40 bg-sky-300/15 text-white"
                    : "border-white/10 bg-white/[0.04] text-slate-300 hover:border-white/20 hover:bg-white/[0.08]",
                )}
                aria-pressed={selected}
              >
                <Icon className={cn("h-5 w-5 shrink-0", selected ? "text-sky-300" : "text-slate-400")} />
                <span>
                  <span className="block text-sm font-semibold">{application.title}</span>
                  <span className="mt-0.5 block text-xs text-slate-400">{application.description}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="relative bg-zinc-100 p-2 sm:p-3">
        <iframe
          key={`${active}-${reloadKey}`}
          src={current.url}
          title={current.title}
          className="h-[680px] w-full rounded-2xl border border-zinc-200 bg-white shadow-inner lg:h-[780px]"
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-downloads allow-modals"
          allow="clipboard-read; clipboard-write; fullscreen"
        />
      </div>

      <div className="flex flex-col gap-2 border-t border-zinc-200 bg-white px-4 py-3 text-xs text-zinc-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <span className="inline-flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          {t.workspace.security}
        </span>
        <span>{t.workspace.fallback}</span>
      </div>
    </div>
  );
}
