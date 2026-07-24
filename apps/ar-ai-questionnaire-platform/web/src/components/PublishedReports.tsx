import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import {
  createReportDownloadUrl,
  listReports,
  subscribeContentChanges,
  type ReportRecord,
} from "../lib/contentRepository";
import { isRemoteEnabled, supabase } from "../lib/supabase";

export function PublishedReports() {
  const [reports, setReports] = useState<ReportRecord[]>([]);

  useEffect(() => {
    if (!isRemoteEnabled) return;
    const reload = async () => {
      try {
        setReports((await listReports()).filter((report) => report.published));
      } catch {
        // The workbench remains usable if the optional reports table is not ready.
      }
    };
    void reload();
    const channel = subscribeContentChanges(() => void reload());
    return () => {
      if (channel && supabase) void supabase.removeChannel(channel);
    };
  }, []);

  if (reports.length === 0) return null;

  return (
    <section className="mb-8" aria-labelledby="published-reports-title">
      <div className="mb-3">
        <h2 id="published-reports-title" className="text-base font-semibold text-foreground">共享报告资料</h2>
        <p className="mt-1 text-xs text-muted">管理员已发布、可用于问卷填写和证据核对的报告</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {reports.map((report) => (
          <button
            key={report.id}
            type="button"
            onClick={async () => {
              try {
                window.open(await createReportDownloadUrl(report), "_blank", "noopener,noreferrer");
              } catch (error) {
                toast.error(error instanceof Error ? error.message : "报告打开失败");
              }
            }}
            className="flex items-center gap-3 rounded-xl border border-border bg-surface p-4 text-left transition hover:border-accent/40 hover:shadow-sm"
          >
            <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
              <Icon icon="gravity-ui:file-text" className="size-4" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-foreground">{report.title}</span>
              <span className="mt-0.5 block truncate text-[11px] text-muted">{report.fileName}</span>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
