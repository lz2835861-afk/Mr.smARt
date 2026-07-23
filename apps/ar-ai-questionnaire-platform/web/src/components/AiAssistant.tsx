import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import type { Question, TextField as TextFieldData } from "../data/questionnaire";
import type { Answers } from "../hooks/useQuestionnaire";
import type { AnswerMeta } from "../hooks/useAnswerMeta";
import type { TextareaSelection } from "../hooks/useMainColumnSelection";
import { useAi } from "../hooks/useAi";
import type { AiMode, AiSource, ExtractRequest, ExtractResponse } from "../lib/aiTypes";
import {
  Composer,
  type ComposerContextOption,
  type Tool,
  type UploadedFile,
} from "@/components/ui/composer";
import { WaveSpinner } from "@/components/ui/wave-spinner";
import yunzhiLogo from "@/assets/yunzhi-logo.png";

interface Props {
  question: Question;
  answers: Answers;
  setText: (id: string, value: string) => void;
  metaByField?: Record<string, AnswerMeta>;
  textareaSelection?: TextareaSelection | null;
  onClearSelection?: () => void;
}

const MODE_LABEL: Record<AiMode, string> = {
  polish: "润色",
  translate: "翻译→EN",
  draft: "起草",
  custom: "自定义",
  ask: "提问",
  "batch-rewrite": "专家团批量改写",
};

const AI_TOOLS: Tool[] = [
  { name: "polish", category: "writing", description: "润色当前中文草稿" },
  { name: "draft", category: "writing", description: "根据材料起草中文" },
  { name: "custom", category: "custom", description: "按你的指令处理" },
];

const MODE_BY_TOOL: Record<string, AiMode> = {
  polish: "polish",
  draft: "draft",
  custom: "custom",
};

/** 云知 (Yunzhi) — Tencent CSIG internal AI knowledge chatbot. */
const YUNZHI_URL = "https://csig.lexiangla.com/?company_from=csig";
/** Sentinel the model appends (see api/_kimi.ts SYSTEM) when it judges it lacks
 *  reference material — we strip it and surface a Yunzhi nudge. Tolerant of the
 *  bracket variants the model actually emits: [[need-reference]], [【…】],
 *  【need-reference】, [need_reference], etc. */
const NEED_REFERENCE_RE = /[[【]{1,2}\s*need[-_\s]?reference\s*[\]】]{1,2}/gi;

/** Question topics that the questionnaire corpus can't answer authoritatively —
 *  force the 云知 nudge regardless of whether the (probabilistic) model flagged. */
const LOW_CONFIDENCE_RE =
  /愿景|vision|使命|战略|strateg|roadmap|路线图|蓝图|未来|将来|future|规划|计划|预测|forecast|展望|趋势|长期|多少年|[一二三五十]\s*年|认证清单|市场份额|排名/i;

interface ChatTurn {
  id: string;
  role: "user" | "assistant";
  text: string;
  /** Excerpt that was highlighted when this user message was sent (preview). */
  selectionPreview?: string;
  /** Name of the attached file/material used for this message (shown above it). */
  fileRef?: string;
  /** AI flagged it lacks reference material → show the "ask 云知" nudge. */
  needsReference?: boolean;
  /** The user's question for this turn — copied to clipboard for the 云知 jump. */
  askText?: string;
  /** Server-side sources retrieved from Lexiang and used by Kimi. */
  sources?: AiSource[];
}

/**
 * Nudge to ask 云知 (CSIG internal knowledge AI) when refs are missing.
 * Clicking copies the question to the clipboard (so it can be pasted straight
 * into 云知) and opens 云知 in a new tab.
 */
function YunzhiNudge({ question }: { question?: string }) {
  // Inline "copied" confirmation, self-contained so it doesn't depend on the
  // global toast layer. Shown right on the card the user clicked.
  const [copied, setCopied] = useState(false);
  const onJump = () => {
    const q = (question ?? "").trim();
    if (!q) return;
    try {
      void navigator.clipboard?.writeText(q).catch(() => {});
    } catch {
      /* clipboard unavailable — user can still type the question into 云知 */
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2500);
  };
  return (
    <a
      href={YUNZHI_URL}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onJump}
      className={
        "flex items-center gap-2 rounded-xl border px-3 py-2 text-[11px] leading-snug transition-colors " +
        (copied
          ? "border-success/40 bg-success/10 text-success"
          : "border-[#3b5bff]/25 bg-[#3b5bff]/[0.06] text-foreground/80 hover:bg-[#3b5bff]/10")
      }
    >
      <img src={yunzhiLogo} alt="云知" className="size-5 shrink-0" />
      <span className="flex-1">
        {copied ? (
          "已复制问题 —— 到云知粘贴即可提问"
        ) : (
          <>
            AI 觉得这题缺参考资料 —— 到
            <span className="font-semibold text-[#3b5bff]">云知</span>
            问问（点这里自动复制问题）
          </>
        )}
      </span>
      <Icon
        icon={copied ? "gravity-ui:check" : "gravity-ui:arrow-up-right-from-square"}
        className={"size-3.5 shrink-0 " + (copied ? "text-success" : "text-[#3b5bff]")}
      />
    </a>
  );
}

function LexiangSources({ sources }: { sources: AiSource[] }) {
  if (!sources.length) return null;
  return (
    <div className="rounded-xl border border-border bg-surface-secondary/40 p-2.5">
      <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold text-muted">
        <Icon icon="gravity-ui:database" className="size-3 text-[#3b5bff]" />
        腾讯乐享来源 · 云知优先
      </div>
      <div className="space-y-1">
        {sources.map((source, index) => (
          <a
            key={`${source.url}-${index}`}
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-start gap-2 rounded-lg px-2 py-1.5 hover:bg-surface"
          >
            <span
              className={
                "mt-0.5 shrink-0 rounded px-1.5 py-0.5 text-[9px] font-medium " +
                (source.tier === "yunzhi"
                  ? "bg-[#3b5bff]/10 text-[#3b5bff]"
                  : "bg-[#00bbff]/10 text-[#008ec2]")
              }
            >
              {source.tier === "yunzhi" ? "云知" : "云市场"}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[11px] text-foreground/80 group-hover:text-[#3b5bff]">
                {source.title}
              </span>
              {source.snippet && (
                <span className="mt-0.5 block line-clamp-2 text-[10px] leading-relaxed text-muted">
                  {source.snippet}
                </span>
              )}
            </span>
            <Icon icon="gravity-ui:arrow-up-right-from-square" className="mt-0.5 size-3 shrink-0 text-muted" />
          </a>
        ))}
      </div>
    </div>
  );
}

/** Playful Chinese waiting lines shown next to the spinner while Kimi works. */
const LOADING_LINES = [
  "正在码字，去营销腔、留干货…",
  "Kimi 正在斟酌用词…",
  "让答案更有分析师味儿…",
  "正在打磨这段话，马上好…",
  "动动脑子，给你写得更稳一点…",
];
const SELECTION_LOADING_LINE = "正在改你圈出来的那一段…";
const MATERIAL_FILE_INPUT_ID = "ai-assistant-material-file";

function pickLoadingLine(): string {
  return LOADING_LINES[Math.floor(Math.random() * LOADING_LINES.length)];
}

/**
 * Users often type "改得更详细：<the selected text>" even though the selected
 * text is already sent separately. Strip that duplicate tail so the model sees
 * a clear editing instruction instead of interpreting the excerpt as the task.
 */
function normalizeSelectionInstruction(instruction: string, selection?: string): string {
  const trimmed = instruction.trim();
  const excerpt = selection?.trim();
  if (!trimmed || !excerpt || !trimmed.includes(excerpt)) return trimmed;

  const withoutExcerpt = trimmed
    .replace(excerpt, "")
    .replace(/[：:，,；;\s-]+$/g, "")
    .trim();
  return withoutExcerpt && withoutExcerpt.length <= 80 ? withoutExcerpt : trimmed;
}

export function AiAssistant({
  question,
  answers,
  setText,
  metaByField,
  textareaSelection,
  onClearSelection,
}: Props) {
  const textFields = useMemo(
    () =>
      question.groups
        .flatMap((g) => g.fields)
        .filter((f): f is TextFieldData => f.kind === "text"),
    [question],
  );

  const fieldId = textFields[0]?.id ?? "";
  /** null = no tool chosen yet (tools button stays neutral). */
  const [mode, setMode] = useState<AiMode | null>(null);
  const hasSelection = Boolean(textareaSelection?.text.trim());
  // Default (no tool picked): a highlighted excerpt means "edit it" (custom);
  // otherwise a bare message is a question to answer (ask), not a rewrite.
  const effectiveMode: AiMode = mode ?? (hasSelection ? "custom" : "ask");
  const [material, setMaterial] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<UploadedFile[]>([]);
  /** True while a file is being uploaded + extracted — blocks send until ready. */
  const [extracting, setExtracting] = useState(false);
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [lastResult, setLastResult] = useState("");
  /** Whether the last result is draft text (show apply) vs a chat answer (copy only). */
  const [lastAppliable, setLastAppliable] = useState(false);
  const [loadingLine, setLoadingLine] = useState(LOADING_LINES[0]);
  const [pendingApplySelection, setPendingApplySelection] =
    useState<TextareaSelection | null>(null);
  const { run, loading, error } = useAi();

  const field = textFields.find((f) => f.id === fieldId);
  const zh = (answers[fieldId] as string) ?? "";
  const meta = metaByField?.[fieldId];

  const prevQuestionId = useRef(question.id);
  useEffect(() => {
    if (prevQuestionId.current === question.id) return;
    prevQuestionId.current = question.id;
    onClearSelection?.();
    setPendingApplySelection(null);
    setTurns([]);
    setLastResult("");
    setLastAppliable(false);
    setMaterial("");
    setAttachedFiles([]);
    setExtracting(false);
    setMode(null);
  }, [question.id, onClearSelection]);

  /** Upload a file → server extracts its text (Moonshot Files API) → use as material. */
  const onPickFile = useCallback(async (file: File) => {
    const MAX_MB = 3;
    const id = `up-${file.name}-${file.size}`;
    const baseFile = {
      id,
      name: file.name,
      type: file.type || "application/octet-stream",
      url: "",
    };
    if (file.size > MAX_MB * 1024 * 1024) {
      setMaterial("");
      setAttachedFiles([{ ...baseFile, description: `❌ 文件超过 ${MAX_MB}MB，请换小一点的` }]);
      return;
    }
    setMaterial("");
    setExtracting(true);
    setAttachedFiles([{ ...baseFile, isUploading: true, description: "解析中…" }]);
    try {
      const dataBase64 = await new Promise<string>((resolve, reject) => {
        const fr = new FileReader();
        fr.onload = () => resolve(String(fr.result).split(",")[1] ?? "");
        fr.onerror = () => reject(new Error("读取文件失败"));
        fr.readAsDataURL(file);
      });
      const req: ExtractRequest = { filename: file.name, contentType: file.type, dataBase64 };
      const r = await fetch("/api/extract", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(req),
      });
      const j = (await r.json().catch(() => ({}))) as Partial<ExtractResponse> & { error?: string };
      if (!r.ok || !j.text) throw new Error(j.error || `解析失败 HTTP ${r.status}`);
      setMaterial(j.text);
      setAttachedFiles([
        {
          ...baseFile,
          description: `已解析 ${j.text.length} 字${j.truncated ? "（已截取）" : ""}，将作为材料`,
        },
      ]);
    } catch (e) {
      setMaterial("");
      setAttachedFiles([{ ...baseFile, description: `❌ ${(e as Error).message}` }]);
    } finally {
      setExtracting(false);
    }
  }, []);

  const addMaterialSnippet = useCallback((label: string, body: string) => {
    const trimmed = body.trim();
    if (!trimmed) return;
    setMaterial(trimmed);
    setAttachedFiles([
      {
        id: `snippet-${Date.now()}`,
        name: label,
        type: "text/plain",
        url: "",
        description: trimmed.length > 80 ? `${trimmed.slice(0, 80)}…` : trimmed,
      },
    ]);
  }, []);

  const contextOptions = useMemo((): ComposerContextOption[] => {
    const opts: ComposerContextOption[] = [
      {
        id: "upload-file",
        label: "上传文件",
        description: "PDF / Word / PPT / 文本 — 解析后作为材料",
        icon: <Icon icon="gravity-ui:paperclip" className="size-[18px]" />,
        onClick: () => document.getElementById(MATERIAL_FILE_INPUT_ID)?.click(),
      },
    ];
    if (meta?.fact_notes?.trim()) {
      opts.push({
        id: "fact-notes",
        label: "带入事实底稿",
        description: "使用本题已保存的事实要点",
        icon: <Icon icon="gravity-ui:file-text" className="size-[18px]" />,
        onClick: () => addMaterialSnippet("事实底稿", meta.fact_notes ?? ""),
      });
    }
    opts.push({
      id: "draft-ref",
      label: "引用当前中文草稿",
      description: "把现有中文回答作为参考材料",
      icon: <Icon icon="gravity-ui:copy" className="size-[18px]" />,
      onClick: () => addMaterialSnippet("中文草稿", zh),
    });
    return opts;
  }, [addMaterialSnippet, meta, zh]);

  const onSubmit = async (message: string) => {
    const rawInstruction = message.trim();
    const excerpt = textareaSelection?.text.trim();
    const instruction = normalizeSelectionInstruction(rawInstruction, excerpt);
    if (effectiveMode === "ask" && !instruction) {
      toast.message("写下你的问题，Enter 发送");
      return;
    }
    const needsMaterial = effectiveMode === "draft" || effectiveMode === "custom";
    if (needsMaterial && !instruction && !material && !meta?.fact_notes && !excerpt) {
      toast.message("请先通过 + 带入材料，或在输入框写下指令");
      return;
    }
    if (effectiveMode === "polish" && !instruction && !excerpt && !zh.trim()) {
      toast.message("请先在左侧选中要润色的文字，或填写中文草稿");
      return;
    }

    // Capture the attached material now; it travels with this message and then
    // leaves the composer (the ref shows above the sent message instead).
    const materialNow = material;
    const attached = attachedFiles[0];
    const fileRef =
      materialNow && attached && !attached.description?.startsWith("❌")
        ? attached.name
        : undefined;

    const modeLabel = mode ? MODE_LABEL[mode] : "处理";
    const userLabel = rawInstruction || modeLabel;
    setTurns((prev) => [
      ...prev,
      {
        id: `u-${Date.now()}`,
        role: "user",
        text: userLabel,
        selectionPreview: excerpt || undefined,
        fileRef,
      },
    ]);

    const snap = textareaSelection ?? null;
    // The excerpt + attachment now live on the sent message — clear the
    // composer (selection chip + file/material) so nothing lingers below.
    onClearSelection?.();
    setAttachedFiles([]);
    setMaterial("");
    setLoadingLine(excerpt ? SELECTION_LOADING_LINE : pickLoadingLine());

    const result = await run({
      mode: effectiveMode,
      zh,
      material: materialNow || meta?.fact_notes || undefined,
      instruction,
      selection: excerpt || undefined,
      fieldLabel: field?.label,
      questionTitle: question.title,
      wordLimit: meta?.word_limit ?? undefined,
    });

    if (result !== null) {
      const text = result.text;
      // The model appends a need-reference marker when it judges it lacks facts —
      // strip it (any bracket variant) and surface a Yunzhi nudge instead.
      const stripped = text.replace(NEED_REFERENCE_RE, "");
      // Nudge if the model flagged, OR the question is inherently low-confidence
      // (vision/strategy/future/…) — the model's self-flagging is probabilistic,
      // so this client-side catch guarantees those topics always point to 云知.
      const needsReference = stripped !== text || LOW_CONFIDENCE_RE.test(instruction);
      const cleanText = stripped.trim();
      setLastResult(cleanText);
      // "ask" answers are conversational — not draft text, so no apply button.
      const appliable = effectiveMode !== "ask";
      setLastAppliable(appliable);
      setPendingApplySelection(appliable ? snap : null);
      setTurns((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          text: cleanText,
          needsReference,
          askText: instruction || question.title,
          sources: result.sources,
        },
      ]);
      if (appliable) {
        toast.message(
          snap ? "AI 结果尚未写入：请点击“替换选中片段”" : "AI 结果尚未写入：请点击“应用到中文草稿”",
        );
      }
    }
  };

  const onApply = () => {
    if (!lastResult) return;

    const snap = pendingApplySelection;
    const targetFieldId = snap?.fieldId ?? fieldId;
    const current = (answers[targetFieldId] as string) ?? "";

    // Selection-scoped result: splice it back over the original excerpt only,
    // never overwrite the whole answer with a fragment.
    if (snap?.text && snap.fieldId === targetFieldId) {
      const { start, end, text: original } = snap;
      const replaceAt = (at: number) => {
        setText(
          targetFieldId,
          current.slice(0, at) + lastResult + current.slice(at + original.length),
        );
        toast.success("已替换选中片段");
        onClearSelection?.();
        setPendingApplySelection(null);
        // Result consumed — drop it so the apply/copy buttons disappear and a
        // second click can't overwrite the whole field with this fragment.
        setLastResult("");
      };
      // Preferred: the recorded range still holds the same text.
      if (current.slice(start, end) === original) {
        replaceAt(start);
        return;
      }
      // Drifted (the draft was edited since): locate the excerpt instead.
      const at = current.indexOf(original);
      if (at >= 0) {
        replaceAt(at);
        return;
      }
      toast.error("选中片段已变化，未能定位替换位置，请重新选中");
      return;
    }

    setText(targetFieldId, lastResult);
    toast.success("已写入中文草稿");
    setPendingApplySelection(null);
    setLastResult("");
  };

  const selectedText = textareaSelection?.text;

  return (
    <aside className="flex h-dvh max-h-dvh w-full flex-col overflow-hidden bg-surface">
      <div className="flex items-center border-b border-border px-4 py-3 shrink-0">
        <div className="flex items-center gap-2">
          <span className="inline-flex size-7 items-center justify-center rounded-lg bg-[#00bbff]/10 text-[#00bbff]">
            <Icon icon="gravity-ui:sparkles" className="size-4" />
          </span>
          <div className="leading-tight">
            <div className="text-sm font-semibold text-foreground">AI 助手 · Kimi</div>
            <div className="text-[10px] text-muted">AI 结果仅预览，点击下方应用按钮才保存</div>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3 space-y-3">
        {textFields.length === 0 ? (
          <div className="text-sm text-muted">本题没有可填写的文本字段。</div>
        ) : (
          <>
            {turns.length > 0 && (
              <div className="space-y-2">
                {turns.map((t) =>
                  t.role === "user" ? (
                    <div key={t.id} className="ml-6 space-y-1">
                      {t.selectionPreview && (
                        <div className="rounded-lg border border-[#00bbff]/30 bg-[#00bbff]/5 px-2.5 py-1.5">
                          <span className="mb-0.5 inline-flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wider text-[#00bbff]">
                            <Icon icon="gravity-ui:quote-open" className="size-2.5" />
                            选中片段
                          </span>
                          <p className="line-clamp-3 max-h-16 overflow-y-auto whitespace-pre-wrap text-[11px] leading-[1.5] text-foreground/65">
                            {t.selectionPreview}
                          </p>
                        </div>
                      )}
                      {t.fileRef && (
                        <div className="inline-flex max-w-full items-center gap-1.5 rounded-lg border border-border bg-surface-secondary/50 px-2.5 py-1.5 text-[11px] text-foreground/70">
                          <Icon icon="gravity-ui:paperclip" className="size-3 shrink-0 text-foreground/50" />
                          <span className="truncate">
                            用了 <span className="font-medium text-foreground/90">{t.fileRef}</span>
                          </span>
                        </div>
                      )}
                      <div className="rounded-xl bg-zinc-100 px-3 py-2 text-[12px] leading-relaxed text-foreground/85">
                        {t.text}
                      </div>
                    </div>
                  ) : (
                    <div key={t.id} className="mr-2 space-y-1.5">
                      <div className="rounded-xl border border-[#00bbff]/25 bg-[#00bbff]/5 px-3 py-2 text-[12px] leading-relaxed text-foreground/90 whitespace-pre-wrap">
                        {t.text}
                      </div>
                      {t.sources && t.sources.length > 0 && <LexiangSources sources={t.sources} />}
                      {t.needsReference && <YunzhiNudge question={t.askText} />}
                    </div>
                  ),
                )}
              </div>
            )}

            {loading && (
              <div className="mr-2 flex items-center gap-3 rounded-xl bg-zinc-100 px-4 py-3">
                <WaveSpinner color="#00bbff" size="sm" animation="ripple" />
                <span className="text-[12px] text-muted">{loadingLine}</span>
              </div>
            )}

            {error && (
              <div className="rounded-md border border-danger/30 bg-danger/5 px-2 py-1.5 text-[12px] text-danger">
                {error}
              </div>
            )}

            {lastResult && !loading && lastAppliable && (
              <div className="rounded-xl border border-warning/30 bg-warning/5 p-2.5">
                <div className="mb-2 flex items-center gap-1.5 text-[11px] text-warning">
                  <Icon icon="gravity-ui:circle-exclamation" className="size-3.5" />
                  当前只是 AI 预览，离开本题前请确认是否写入答案
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <Button variant="primary" size="sm" onPress={onApply}>
                    <Icon icon="gravity-ui:check" className="size-3.5" />
                    {pendingApplySelection ? "替换选中片段" : "应用到中文草稿"}
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {textFields.length > 0 && (
        <div className="shrink-0 border-t border-border p-3 bg-surface">
          {selectedText?.trim() && (
            <div className="mb-2.5 rounded-xl border border-[#00bbff]/35 bg-[#00bbff]/8 p-2.5 shadow-sm">
              <div className="mb-1 flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-[#00bbff]">
                  <Icon icon="gravity-ui:quote-open" className="size-3" />
                  已选中片段
                </span>
                <button
                  type="button"
                  onClick={onClearSelection}
                  className="inline-flex size-5 shrink-0 items-center justify-center rounded-md text-muted hover:bg-black/5 hover:text-foreground"
                  aria-label="清除选中片段"
                >
                  <Icon icon="gravity-ui:xmark" className="size-3.5" />
                </button>
              </div>
              <p className="max-h-24 overflow-y-auto text-[11px] leading-[1.6] text-foreground/85 whitespace-pre-wrap">
                {selectedText}
              </p>
            </div>
          )}
          <input
            id={MATERIAL_FILE_INPUT_ID}
            type="file"
            className="hidden"
            accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.md,.csv"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void onPickFile(f);
              e.target.value = "";
            }}
          />
          <Composer
            placeholder={
              selectedText?.trim()
                ? "说明要如何改这段选中文字，Enter 发送…"
                : effectiveMode === "custom"
                  ? "写下你的指令，Enter 发送…"
                  : effectiveMode === "draft"
                    ? "补充起草要求（可选），Enter 发送…"
                    : effectiveMode === "polish"
                      ? "补充说明（可选），Enter 发送…"
                      : "问我任何问题，或选中文字让我帮你改…"
            }
            tools={AI_TOOLS}
            activeTool={mode}
            onToolSelect={(tool) => {
              const next = MODE_BY_TOOL[tool.name];
              if (next) setMode(next);
            }}
            contextOptions={contextOptions}
            attachedFiles={attachedFiles}
            onRemoveFile={(id) => {
              setAttachedFiles((prev) => prev.filter((f) => f.id !== id));
              if (attachedFiles.some((f) => f.id === id)) setMaterial("");
            }}
            onSubmit={(message) => void onSubmit(message)}
            isLoading={loading || extracting}
            maxRows={6}
            showToolsButton
            extraActions={
              <a
                href={YUNZHI_URL}
                target="_blank"
                rel="noopener noreferrer"
                title="到云知提问（腾讯云内部 AI 知识库）"
                aria-label="打开云知"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-200 transition-colors hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600/90"
              >
                <img src={yunzhiLogo} alt="云知" className="size-5" />
              </a>
            }
            submitWhenEmpty={
              effectiveMode === "polish" && (!!selectedText?.trim() || !!zh.trim())
            }
          />
        </div>
      )}
    </aside>
  );
}
