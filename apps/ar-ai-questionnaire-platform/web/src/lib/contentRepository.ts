import type { RealtimeChannel } from "@supabase/supabase-js";
import {
  cacheCloudQuestionnaires,
  deleteImportedQuestionnaire,
  getCloudQuestionnaires,
  type Questionnaire,
} from "../data/questionnaires";
import { isRemoteEnabled, supabase } from "./supabase";

const REPORT_BUCKET = "ar-reports";

interface QuestionnaireCatalogRow {
  id: string;
  slug: string;
  definition: Questionnaire;
  is_published: boolean;
  source_name: string | null;
  storage_path: string | null;
  updated_at: string;
}

export interface ReportRecord {
  id: string;
  title: string;
  fileName: string;
  storagePath: string;
  mimeType: string;
  sizeBytes: number;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

function requireRemote() {
  if (!isRemoteEnabled || !supabase) {
    throw new Error("Supabase 尚未配置，当前只能保存到本机浏览器。");
  }
  return supabase;
}

function safeFileName(name: string): string {
  const cleaned = name.normalize("NFKC").replace(/[^\w.\-\u3400-\u9fff]+/g, "-");
  return cleaned.replace(/^-+|-+$/g, "") || "report";
}

function rowToQuestionnaire(row: QuestionnaireCatalogRow): Questionnaire {
  return {
    ...row.definition,
    id: row.id,
    slug: row.slug,
    published: row.is_published,
    remoteManaged: true,
    sourceName: row.source_name ?? row.definition.sourceName,
    reportPath: row.storage_path ?? undefined,
  };
}

function rowToReport(row: Record<string, unknown>): ReportRecord {
  return {
    id: String(row.id),
    title: String(row.title ?? ""),
    fileName: String(row.file_name ?? ""),
    storagePath: String(row.storage_path ?? ""),
    mimeType: String(row.mime_type ?? "application/octet-stream"),
    sizeBytes: Number(row.size_bytes ?? 0),
    published: Boolean(row.is_published),
    createdAt: String(row.created_at ?? ""),
    updatedAt: String(row.updated_at ?? ""),
  };
}

export async function refreshCloudQuestionnaireCache(): Promise<Questionnaire[]> {
  if (!isRemoteEnabled || !supabase) return getCloudQuestionnaires();
  const { data, error } = await supabase
    .from("questionnaire_catalog")
    .select("id, slug, definition, is_published, source_name, storage_path, updated_at")
    .order("updated_at", { ascending: false });
  if (error) throw new Error(`读取共享问卷失败：${error.message}`);
  const questionnaires = ((data ?? []) as QuestionnaireCatalogRow[]).map(rowToQuestionnaire);
  cacheCloudQuestionnaires(questionnaires);
  return questionnaires;
}

export async function saveQuestionnaireToCloud(
  questionnaire: Questionnaire,
  sourceFile?: File,
): Promise<Questionnaire> {
  const client = requireRemote();
  let storagePath = questionnaire.reportPath;
  if (sourceFile) {
    storagePath = `questionnaires/${questionnaire.id}/${Date.now()}-${safeFileName(sourceFile.name)}`;
    const { error: uploadError } = await client.storage
      .from(REPORT_BUCKET)
      .upload(storagePath, sourceFile, { upsert: true, contentType: sourceFile.type || undefined });
    if (uploadError) throw new Error(`原始报告上传失败：${uploadError.message}`);
  }

  const managed: Questionnaire = {
    ...questionnaire,
    published: questionnaire.published ?? false,
    remoteManaged: true,
    reportPath: storagePath,
  };
  const { error } = await client.from("questionnaire_catalog").upsert(
    {
      id: managed.id,
      slug: managed.slug,
      definition: managed,
      is_published: managed.published,
      source_name: managed.sourceName ?? sourceFile?.name ?? null,
      storage_path: storagePath ?? null,
    },
    { onConflict: "id" },
  );
  if (error) throw new Error(`共享问卷保存失败：${error.message}`);
  await refreshCloudQuestionnaireCache();
  return managed;
}

export async function setQuestionnairePublished(
  questionnaire: Questionnaire,
  published: boolean,
): Promise<Questionnaire> {
  return saveQuestionnaireToCloud({ ...questionnaire, published });
}

export async function deleteCloudQuestionnaire(questionnaire: Questionnaire): Promise<void> {
  const client = requireRemote();
  if (questionnaire.reportPath) {
    await client.storage.from(REPORT_BUCKET).remove([questionnaire.reportPath]);
  }
  const { error } = await client.from("questionnaire_catalog").delete().eq("id", questionnaire.id);
  if (error) throw new Error(`删除共享问卷失败：${error.message}`);
  deleteImportedQuestionnaire(questionnaire.id);
  await refreshCloudQuestionnaireCache();
}

export async function listReports(): Promise<ReportRecord[]> {
  if (!isRemoteEnabled || !supabase) return [];
  const { data, error } = await supabase
    .from("reports")
    .select("id, title, file_name, storage_path, mime_type, size_bytes, is_published, created_at, updated_at")
    .order("updated_at", { ascending: false });
  if (error) throw new Error(`读取报告失败：${error.message}`);
  return (data ?? []).map((row) => rowToReport(row as Record<string, unknown>));
}

export async function uploadReport(
  file: File,
  title: string,
  published: boolean,
): Promise<ReportRecord> {
  const client = requireRemote();
  const id = crypto.randomUUID();
  const storagePath = `reports/${id}/${safeFileName(file.name)}`;
  const { error: uploadError } = await client.storage
    .from(REPORT_BUCKET)
    .upload(storagePath, file, { upsert: false, contentType: file.type || undefined });
  if (uploadError) throw new Error(`报告上传失败：${uploadError.message}`);

  const { data, error } = await client
    .from("reports")
    .insert({
      id,
      title: title.trim() || file.name.replace(/\.[^.]+$/, ""),
      file_name: file.name,
      storage_path: storagePath,
      mime_type: file.type || "application/octet-stream",
      size_bytes: file.size,
      is_published: published,
    })
    .select("id, title, file_name, storage_path, mime_type, size_bytes, is_published, created_at, updated_at")
    .single();
  if (error) {
    await client.storage.from(REPORT_BUCKET).remove([storagePath]);
    throw new Error(`报告登记失败：${error.message}`);
  }
  return rowToReport(data as Record<string, unknown>);
}

export async function setReportPublished(id: string, published: boolean): Promise<void> {
  const client = requireRemote();
  const { error } = await client.from("reports").update({ is_published: published }).eq("id", id);
  if (error) throw new Error(`更新报告展示状态失败：${error.message}`);
}

export async function deleteReport(report: ReportRecord): Promise<void> {
  const client = requireRemote();
  const { error } = await client.from("reports").delete().eq("id", report.id);
  if (error) throw new Error(`删除报告失败：${error.message}`);
  await client.storage.from(REPORT_BUCKET).remove([report.storagePath]);
}

export async function createReportDownloadUrl(report: ReportRecord): Promise<string> {
  const client = requireRemote();
  const { data, error } = await client.storage.from(REPORT_BUCKET).createSignedUrl(report.storagePath, 300);
  if (error) throw new Error(`生成下载链接失败：${error.message}`);
  return data.signedUrl;
}

export function subscribeContentChanges(onChange: () => void): RealtimeChannel | null {
  if (!isRemoteEnabled || !supabase) return null;
  return supabase
    .channel("ar-content-management")
    .on("postgres_changes", { event: "*", schema: "public", table: "questionnaire_catalog" }, onChange)
    .on("postgres_changes", { event: "*", schema: "public", table: "reports" }, onChange)
    .subscribe();
}
