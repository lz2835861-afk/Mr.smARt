import { useRef, useState } from "react";
import { Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  parseQuestionnaireFile,
  type ParsedQuestionnaire,
  type QuestionnaireImportMetadata,
} from "../lib/importQuestionnaire";
import {
  saveImportedQuestionnaire,
  type Questionnaire,
} from "../data/questionnaires";

const ACCEPTED_FILES = ".xlsx,.xls,.csv";

interface Props {
  onImported?: (questionnaire: Questionnaire) => void;
}

function dateAfterThirtyDays(): string {
  const date = new Date();
  date.setDate(date.getDate() + 30);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function metadataFor(file: File): QuestionnaireImportMetadata {
  const title = file.name.replace(/\.[^.]+$/, "");
  const firm = ["Gartner", "Forrester", "IDC", "Omdia"].find((name) =>
    new RegExp(name, "i").test(file.name),
  );
  return {
    title,
    firm: firm ?? "Other",
    vendor: "Tencent Cloud",
    deadline: dateAfterThirtyDays(),
  };
}

function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function QuestionnaireUpload({ onImported }: Props) {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [parsed, setParsed] = useState<ParsedQuestionnaire | null>(null);
  const [metadata, setMetadata] = useState<QuestionnaireImportMetadata | null>(null);
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);

  const reset = () => {
    setParsed(null);
    setMetadata(null);
    setDragging(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  const parseFile = async (file: File) => {
    const initialMetadata = metadataFor(file);
    setLoading(true);
    try {
      const result = await parseQuestionnaireFile(file, initialMetadata);
      setParsed(result);
      setMetadata(initialMetadata);
      toast.success(`已解析 ${result.questionCount} 道题，请确认问卷信息。`);
    } catch (error) {
      reset();
      toast.error(error instanceof Error ? error.message : "文件解析失败，请重试。");
    } finally {
      setLoading(false);
    }
  };

  const createQuestionnaire = () => {
    if (!parsed || !metadata) return;
    const title = metadata.title.trim();
    const firm = metadata.firm.trim();
    const vendor = metadata.vendor.trim();
    if (!title || !firm || !vendor) {
      toast.error("请填写标题、机构和供应商。");
      return;
    }
    if (!isValidDate(metadata.deadline)) {
      toast.error("请填写合法的截止日期（YYYY-MM-DD）。");
      return;
    }

    const questionnaire: Questionnaire = {
      ...parsed.questionnaire,
      label: title,
      titleZh: title,
      subtitle: `${firm} · 本机导入`,
      firm,
      vendor,
      products: [{ name: vendor, abbr: vendor.slice(0, 12) }],
      nextMilestone: { label: "截止日期", date: metadata.deadline },
      importedAt: new Date().toISOString(),
    };

    try {
      saveImportedQuestionnaire(questionnaire);
      onImported?.(questionnaire);
      toast.success("问卷已保存到本机浏览器。");
      navigate(`/q/${questionnaire.slug}`);
    } catch {
      toast.error("保存失败，浏览器本地存储空间可能不足。");
    }
  };

  return (
    <section
      className={`mb-8 rounded-2xl border bg-surface p-5 transition-colors ${
        dragging ? "border-accent bg-accent/5" : "border-border"
      }`}
      aria-labelledby="questionnaire-upload-title"
      aria-busy={loading}
      onDragEnter={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragOver={(event) => event.preventDefault()}
      onDragLeave={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragging(false);
      }}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        const file = event.dataTransfer.files[0];
        if (file) void parseFile(file);
      }}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex size-8 items-center justify-center rounded-lg bg-accent/10 text-accent">
              <Icon icon="gravity-ui:arrow-up-from-line" className="size-4" />
            </span>
            <div>
              <h2 id="questionnaire-upload-title" className="text-base font-semibold text-foreground">
                上传问卷
              </h2>
              <p className="text-xs text-muted">支持 Excel / CSV，文件仅在当前浏览器中解析</p>
            </div>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-warning">
            本机导入：问卷定义和填写内容不会作为团队共享问卷发布。
          </p>
        </div>
        <div>
          <label htmlFor="questionnaire-file" className="sr-only">
            选择问卷文件
          </label>
          <input
            ref={inputRef}
            id="questionnaire-file"
            type="file"
            accept={ACCEPTED_FILES}
            className="sr-only"
            disabled={loading}
            aria-label="选择要导入的 Excel 或 CSV 问卷文件"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void parseFile(file);
            }}
          />
          <Button
            variant="primary"
            size="sm"
            isPending={loading}
            isDisabled={loading}
            onPress={() => inputRef.current?.click()}
          >
            <Icon icon="gravity-ui:folder-open" className="size-3.5" />
            {loading ? "解析中…" : parsed ? "重新选择文件" : "上传问卷"}
          </Button>
        </div>
      </div>

      {!parsed && !loading && (
        <button
          type="button"
          className="mt-4 w-full rounded-xl border border-dashed border-border px-4 py-5 text-sm text-muted transition-colors hover:border-accent/50 hover:text-foreground"
          onClick={() => inputRef.current?.click()}
          aria-label="点击或拖放问卷文件到这里"
        >
          将 .xlsx、.xls 或 .csv 文件拖到这里，最大 10MB
        </button>
      )}

      {parsed && metadata && (
        <div className="mt-5 border-t border-border pt-5">
          <div className="flex flex-wrap gap-x-5 gap-y-2 rounded-xl bg-surface-secondary/60 px-4 py-3 text-xs text-foreground">
            <span>
              <span className="text-muted">文件：</span>
              {parsed.sourceName}
            </span>
            <span>
              <span className="text-muted">工作表：</span>
              {parsed.sectionCount}
            </span>
            <span>
              <span className="text-muted">题目：</span>
              {parsed.questionCount}
            </span>
          </div>

          {parsed.warnings.length > 0 && (
            <div className="mt-3 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3" role="status">
              <p className="text-xs font-semibold text-warning">解析提示</p>
              <ul className="mt-1 list-disc space-y-1 pl-4 text-xs text-foreground/80">
                {parsed.warnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="text-xs font-medium text-foreground" htmlFor="import-title">
              标题
              <input
                id="import-title"
                type="text"
                required
                value={metadata.title}
                onChange={(event) => setMetadata({ ...metadata, title: event.target.value })}
                className="mt-1.5 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
              />
            </label>
            <label className="text-xs font-medium text-foreground" htmlFor="import-firm">
              机构
              <input
                id="import-firm"
                type="text"
                required
                value={metadata.firm}
                onChange={(event) => setMetadata({ ...metadata, firm: event.target.value })}
                className="mt-1.5 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
              />
            </label>
            <label className="text-xs font-medium text-foreground" htmlFor="import-vendor">
              供应商
              <input
                id="import-vendor"
                type="text"
                required
                value={metadata.vendor}
                onChange={(event) => setMetadata({ ...metadata, vendor: event.target.value })}
                className="mt-1.5 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
              />
            </label>
            <label className="text-xs font-medium text-foreground" htmlFor="import-deadline">
              截止日期
              <input
                id="import-deadline"
                type="date"
                required
                value={metadata.deadline}
                onChange={(event) => setMetadata({ ...metadata, deadline: event.target.value })}
                className="mt-1.5 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
              />
            </label>
          </div>

          <div className="mt-5 flex flex-wrap justify-end gap-2">
            <Button variant="ghost" size="sm" onPress={reset}>
              取消
            </Button>
            <Button variant="outline" size="sm" onPress={() => inputRef.current?.click()}>
              重新选择文件
            </Button>
            <Button variant="primary" size="sm" onPress={createQuestionnaire}>
              创建并进入问卷
              <Icon icon="gravity-ui:arrow-right" className="size-3.5" />
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
