import { useEffect, useRef, useState } from "react";
import { Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import type { Questionnaire } from "../data/questionnaires";
import {
  createReportDownloadUrl,
  deleteCloudQuestionnaire,
  deleteReport,
  listReports,
  setQuestionnairePublished,
  setReportPublished,
  uploadReport,
  type ReportRecord,
} from "../lib/contentRepository";
import { isRemoteEnabled } from "../lib/supabase";

interface Props {
  questionnaires: Questionnaire[];
  onChanged: () => Promise<void> | void;
}

const REPORT_ACCEPT = ".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.csv,.txt,.md";

function sizeLabel(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function ManagementPanel({ questionnaires, onChanged }: Props) {
  const reportInputRef = useRef<HTMLInputElement>(null);
  const [reports, setReports] = useState<ReportRecord[]>([]);
  const [reportFile, setReportFile] = useState<File | null>(null);
  const [reportTitle, setReportTitle] = useState("");
  const [reportPublished, setReportPublishedState] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  const refreshReports = async () => {
    try {
      setReports(await listReports());
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "报告列表加载失败");
    }
  };

  useEffect(() => {
    if (isRemoteEnabled) void refreshReports();
  }, []);

  const submitReport = async () => {
    if (!reportFile) {
      toast.error("请先选择报告文件。");
      return;
    }
    setBusy("report-upload");
    try {
      await uploadReport(reportFile, reportTitle, reportPublished);
      setReportFile(null);
      setReportTitle("");
      setReportPublishedState(false);
      if (reportInputRef.current) reportInputRef.current.value = "";
      await refreshReports();
      toast.success("报告已上传到共享资料库。");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "报告上传失败");
    } finally {
      setBusy(null);
    }
  };

  const toggleQuestionnaire = async (questionnaire: Questionnaire) => {
    setBusy(`q-${questionnaire.id}`);
    try {
      await setQuestionnairePublished(questionnaire, questionnaire.published === false);
      await onChanged();
      toast.success(questionnaire.published === false ? "问卷已对团队展示。" : "问卷已从工作台列表隐藏。");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "问卷状态更新失败");
    } finally {
      setBusy(null);
    }
  };

  const removeQuestionnaire = async (questionnaire: Questionnaire) => {
    if (!window.confirm(`确定从共享管理系统删除“${questionnaire.titleZh}”吗？`)) return;
    setBusy(`q-delete-${questionnaire.id}`);
    try {
      await deleteCloudQuestionnaire(questionnaire);
      await onChanged();
      toast.success("共享问卷已删除。");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "共享问卷删除失败");
    } finally {
      setBusy(null);
    }
  };

  const toggleReport = async (report: ReportRecord) => {
    setBusy(`r-${report.id}`);
    try {
      await setReportPublished(report.id, !report.published);
      await refreshReports();
      toast.success(!report.published ? "报告已设为对外展示。" : "报告已设为仅内部可见。");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "报告状态更新失败");
    } finally {
      setBusy(null);
    }
  };

  const openReport = async (report: ReportRecord) => {
    setBusy(`r-open-${report.id}`);
    try {
      window.open(await createReportDownloadUrl(report), "_blank", "noopener,noreferrer");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "报告打开失败");
    } finally {
      setBusy(null);
    }
  };

  const removeReport = async (report: ReportRecord) => {
    if (!window.confirm(`确定删除报告“${report.title}”吗？`)) return;
    setBusy(`r-delete-${report.id}`);
    try {
      await deleteReport(report);
      await refreshReports();
      toast.success("报告已删除。");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "报告删除失败");
    } finally {
      setBusy(null);
    }
  };

  return (
    <section className="mb-8 rounded-2xl border border-border bg-surface p-5" aria-labelledby="management-title">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex size-8 items-center justify-center rounded-lg bg-accent/10 text-accent">
              <Icon icon="gravity-ui:gear" className="size-4" />
            </span>
            <div>
              <h2 id="management-title" className="text-base font-semibold text-foreground">内容管理中心</h2>
              <p className="text-xs text-muted">上传报告、管理问卷，并控制是否在共享工作台展示</p>
            </div>
          </div>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${isRemoteEnabled ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>
          {isRemoteEnabled ? "Supabase 动态同步" : "待配置 Supabase"}
        </span>
      </div>

      {!isRemoteEnabled && (
        <div className="mt-4 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-xs leading-relaxed text-foreground">
          当前线上尚未配置 Supabase URL / Anon Key。页面功能已就绪，配置后报告、问卷和答案才会跨设备同步。
        </div>
      )}

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <div className="rounded-xl border border-border p-4">
          <h3 className="text-sm font-semibold text-foreground">上传报告资料</h3>
          <p className="mt-1 text-xs text-muted">支持 PDF、Word、PPT、Excel、CSV、TXT；文件保存到 Supabase Storage。</p>
          <input
            ref={reportInputRef}
            type="file"
            accept={REPORT_ACCEPT}
            className="mt-3 block w-full text-xs text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-accent/10 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-accent"
            disabled={!isRemoteEnabled || busy === "report-upload"}
            onChange={(event) => {
              const file = event.target.files?.[0] ?? null;
              setReportFile(file);
              if (file && !reportTitle) setReportTitle(file.name.replace(/\.[^.]+$/, ""));
            }}
          />
          <input
            value={reportTitle}
            onChange={(event) => setReportTitle(event.target.value)}
            placeholder="报告标题"
            disabled={!isRemoteEnabled}
            className="mt-3 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
          <label className="mt-3 flex items-center gap-2 text-xs text-foreground">
            <input
              type="checkbox"
              checked={reportPublished}
              disabled={!isRemoteEnabled}
              onChange={(event) => setReportPublishedState(event.target.checked)}
            />
            上传后对外展示
          </label>
          <Button
            variant="primary"
            size="sm"
            className="mt-3"
            isDisabled={!isRemoteEnabled || !reportFile}
            isPending={busy === "report-upload"}
            onPress={() => void submitReport()}
          >
            <Icon icon="gravity-ui:cloud-arrow-up-in" className="size-3.5" />
            上传报告
          </Button>

          <div className="mt-4 space-y-2">
            {reports.length === 0 ? (
              <p className="rounded-lg bg-surface-secondary/60 px-3 py-2 text-xs text-muted">暂无共享报告</p>
            ) : reports.map((report) => (
              <div key={report.id} className="flex items-center gap-2 rounded-lg border border-border px-3 py-2">
                <Icon icon="gravity-ui:file-text" className="size-4 shrink-0 text-accent" />
                <button type="button" className="min-w-0 flex-1 text-left" onClick={() => void openReport(report)}>
                  <span className="block truncate text-xs font-semibold text-foreground">{report.title}</span>
                  <span className="block truncate text-[10px] text-muted">{report.fileName} · {sizeLabel(report.sizeBytes)}</span>
                </button>
                <button
                  type="button"
                  disabled={busy === `r-${report.id}`}
                  onClick={() => void toggleReport(report)}
                  className={`rounded-full px-2 py-1 text-[10px] font-semibold ${report.published ? "bg-success/10 text-success" : "bg-default-100 text-muted"}`}
                >
                  {report.published ? "展示中" : "内部"}
                </button>
                <button type="button" aria-label={`删除 ${report.title}`} onClick={() => void removeReport(report)} className="text-muted hover:text-danger">
                  <Icon icon="gravity-ui:trash-bin" className="size-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border p-4">
          <h3 className="text-sm font-semibold text-foreground">问卷展示管理</h3>
          <p className="mt-1 text-xs text-muted">隐藏后不会出现在团队问卷列表；管理员仍可在这里恢复。</p>
          <div className="mt-3 max-h-[360px] space-y-2 overflow-y-auto pr-1">
            {questionnaires.map((questionnaire) => {
              const published = questionnaire.published !== false;
              return (
                <div key={questionnaire.id} className="flex items-center gap-2 rounded-lg border border-border px-3 py-2">
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-xs font-semibold text-foreground">{questionnaire.titleZh}</div>
                    <div className="truncate text-[10px] text-muted">{questionnaire.firm} · {questionnaire.remoteManaged ? "云端管理" : "内置问卷"}</div>
                  </div>
                  <button
                    type="button"
                    disabled={!isRemoteEnabled || busy === `q-${questionnaire.id}`}
                    onClick={() => void toggleQuestionnaire(questionnaire)}
                    className={`rounded-full px-2 py-1 text-[10px] font-semibold ${published ? "bg-success/10 text-success" : "bg-default-100 text-muted"}`}
                  >
                    {published ? "展示中" : "已隐藏"}
                  </button>
                  {questionnaire.remoteManaged && (
                    <button type="button" aria-label={`删除 ${questionnaire.titleZh}`} onClick={() => void removeQuestionnaire(questionnaire)} className="text-muted hover:text-danger">
                      <Icon icon="gravity-ui:trash-bin" className="size-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
