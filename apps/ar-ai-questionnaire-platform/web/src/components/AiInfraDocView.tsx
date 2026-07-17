import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "@heroui/react";
import { AppLayout, Sidebar } from "@heroui-pro/react";
import { Icon } from "@iconify/react";
import { cn } from "../lib/utils";
import {
  AI_INFRA_FIRM,
  AI_INFRA_QUESTIONS,
  AI_INFRA_SLUG,
  AI_INFRA_TITLE,
  docFor,
  groupQuestions,
  questionById,
  urlIdFor,
  type AiInfraQuestion,
} from "../data/aiInfra";
import { useProvenance } from "../hooks/useProvenance";
import { ProvenancePanel } from "./ProvenancePanel";

/** First sentence / clause of a question, trimmed for the navigator list. */
function snippet(q: string, max = 38): string {
  const head = q.split(/[？?。\n]/)[0]?.trim() || q.trim();
  return head.length > max ? head.slice(0, max) + "…" : head;
}

function DocBadge({ hasDoc }: { hasDoc: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full px-1.5 py-0.5 text-[9.5px] font-semibold leading-none",
        hasDoc ? "bg-success/10 text-success" : "bg-default-100 text-muted",
      )}
    >
      <span className={cn("size-1.5 rounded-full", hasDoc ? "bg-success" : "bg-default-300")} />
      {hasDoc ? "已建文档" : "无文档"}
    </span>
  );
}

function NavItem({
  q,
  active,
  onSelect,
}: {
  q: AiInfraQuestion;
  active: boolean;
  onSelect: () => void;
}) {
  const hasDoc = !!docFor(q.id);
  return (
    <button
      type="button"
      onClick={onSelect}
      data-current={active || undefined}
      className={cn(
        "block w-full rounded-lg px-2.5 py-2 text-left transition-colors cursor-[var(--cursor-interactive)]",
        active ? "bg-accent/10" : "hover:bg-surface-secondary/60",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className={cn("text-[11px] font-bold tabular-nums", active ? "text-accent" : "text-muted")}>{q.id}</span>
        <DocBadge hasDoc={hasDoc} />
      </div>
      <div className={cn("mt-0.5 text-[12px] leading-snug", active ? "text-foreground" : "text-foreground/80")}>
        {snippet(q.question)}
      </div>
    </button>
  );
}

const DOC_WINDOW_NAME = "ar-questionnaire-tencent-doc";
const OPEN_ON_SELECT_KEY = "ai-infra-open-doc-on-select";

function readOpenOnSelectPreference(): boolean {
  try {
    return window.localStorage.getItem(OPEN_ON_SELECT_KEY) !== "false";
  } catch {
    return true;
  }
}

export function AiInfraDocView() {
  const navigate = useNavigate();
  const { questionId: routeId } = useParams();
  const [openOnSelect, setOpenOnSelect] = useState(readOpenOnSelectPreference);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const dimensions = useMemo(() => groupQuestions(AI_INFRA_QUESTIONS), []);

  const activeId = useMemo(() => {
    if (routeId && questionById(routeId)) return routeId;
    return AI_INFRA_QUESTIONS[0]?.id ?? "";
  }, [routeId]);

  const active = useMemo(() => questionById(activeId), [activeId]);
  const doc = docFor(activeId);
  const urlId = urlIdFor(activeId);
  const { doc: previewDoc, provenance, loading, notFound } = useProvenance(urlId);

  useEffect(() => {
    try {
      window.localStorage.setItem(OPEN_ON_SELECT_KEY, openOnSelect ? "true" : "false");
    } catch {
      // Ignore private-mode or storage-disabled browsers.
    }
  }, [openOnSelect]);

  // Canonicalize a bare or unknown question URL to the first question.
  useEffect(() => {
    if (!AI_INFRA_QUESTIONS.length) return;
    if (!routeId || !questionById(routeId)) {
      navigate(`/${AI_INFRA_SLUG}/${AI_INFRA_QUESTIONS[0].id}`, { replace: true });
    }
  }, [routeId, navigate]);

  const openTencentDoc = useCallback((url: string) => {
    const win = window.open(url, DOC_WINDOW_NAME);
    win?.focus();
  }, []);

  const goTo = useCallback(
    (id: string) => {
      const nextDoc = docFor(id);
      if (openOnSelect && nextDoc) {
        openTencentDoc(nextDoc.url);
      }
      navigate(`/${AI_INFRA_SLUG}/${id}`);
    },
    [navigate, openOnSelect, openTencentDoc],
  );

  const contextLabel = active
    ? [active.dimension, active.section].filter(Boolean).join(" · ")
    : AI_INFRA_FIRM;

  const copyDocUrl = useCallback(async () => {
    if (!doc) return;
    try {
      await navigator.clipboard.writeText(doc.url);
      setCopiedUrl(doc.url);
      return;
    } catch {
      const ta = document.createElement("textarea");
      ta.value = doc.url;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopiedUrl(doc.url);
    }
  }, [doc]);

  const copied = copiedUrl === doc?.url;
  const previewQuestion = previewDoc?.question || active?.question || "";
  const previewGuidance = previewDoc?.guidance || active?.guidance || "";
  const previewDraft = previewDoc?.draft?.trim() ?? "";

  const sidebar = (
    <Sidebar>
      <Sidebar.Header className="px-3 py-4">
        <div className="flex items-center gap-2">
          <Link
            to="/"
            aria-label="返回首页"
            className="inline-flex size-8 items-center justify-center rounded-lg bg-accent/10 text-accent shrink-0 transition-colors hover:bg-accent/20"
          >
            <Icon icon="gravity-ui:cloud" className="size-4" />
          </Link>
          <div className="leading-tight min-w-0 flex-1">
            <div className="truncate text-sm font-semibold text-foreground">AI Infra 2026</div>
            <div className="text-[11px] text-muted truncate">{AI_INFRA_FIRM} · {AI_INFRA_QUESTIONS.length} 题</div>
          </div>
        </div>
      </Sidebar.Header>

      <Sidebar.Content>
        {dimensions.map((dim) => (
          <Sidebar.Group key={dim.dimension}>
            <Sidebar.GroupLabel>
              <span className="inline-flex items-center gap-2">
                <Icon icon="gravity-ui:layers-3-diagonal" className="size-3 text-accent" />
                {dim.dimension}
              </span>
            </Sidebar.GroupLabel>
            <div className="space-y-2">
              {dim.sections.map((sec) => (
                <div key={sec.section}>
                  <div className="px-2 pb-1 text-[11px] font-semibold text-foreground/70">{sec.section}</div>
                  {sec.subgroups.map((sub) => (
                    <div key={sub.subsection || "_"} className="mb-1">
                      {sub.subsection && (
                        <div className="px-2.5 py-0.5 text-[10px] font-medium text-muted">{sub.subsection}</div>
                      )}
                      <Sidebar.Menu>
                        {sub.questions.map((q) => (
                          <NavItem key={q.id} q={q} active={activeId === q.id} onSelect={() => goTo(q.id)} />
                        ))}
                      </Sidebar.Menu>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </Sidebar.Group>
        ))}
      </Sidebar.Content>

      <Sidebar.Footer className="px-3 py-3">
        <div className="flex items-center gap-1.5 text-[11px] text-muted">
          <Icon icon="gravity-ui:file-text" className="size-3.5" />
          腾讯文档原站编辑
        </div>
      </Sidebar.Footer>
    </Sidebar>
  );

  return (
    <Sidebar.Provider defaultOpen>
      <AppLayout
        sidebar={sidebar}
        sidebarResizable
        sidebarCollapsible="none"
        sidebarDefaultSize={20}
        sidebarMinSize={14}
        sidebarMaxSize={32}
        resizableAutoSaveId="ai-infra-sidebar"
      >
        <div className="flex h-dvh min-h-0 w-full min-w-0 flex-1">
          {/* CENTER: platform navigation + original Tencent Docs editing entry */}
          <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col">
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-separator bg-surface px-5 py-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-accent/10 px-1.5 py-0.5 text-[11px] font-bold text-accent tabular-nums">{activeId}</span>
                  <span className="truncate text-[12px] text-muted">{contextLabel}</span>
                </div>
                <p className="mt-1 text-[13px] font-medium leading-snug text-foreground">腾讯文档预览 · 原站编辑</p>
              </div>
              {doc && (
                <Button
                  variant="outline"
                  size="sm"
                  className="shrink-0"
                  onPress={() => openTencentDoc(doc.url)}
                >
                  <Icon icon="gravity-ui:arrow-up-right-from-square" className="size-3.5" />
                  原站编辑
                </Button>
              )}
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto bg-surface-secondary/30">
              {doc ? (
                <div className="mx-auto flex min-h-full w-full max-w-5xl flex-col px-5 py-5 lg:px-8">
                  <div className="mb-3 flex flex-col gap-3 rounded-lg border border-separator bg-surface px-4 py-3 shadow-sm md:flex-row md:items-center md:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold tracking-wider text-muted uppercase">
                        <Icon icon="gravity-ui:file-text" className="size-3.5 text-accent" />
                        Tencent Docs Preview
                        <span className="text-separator">/</span>
                        <span className="normal-case tracking-normal">只读预览 · 编辑在原站完成</span>
                      </div>
                      <label className="mt-2 inline-flex items-center gap-2 text-[12px] text-muted cursor-[var(--cursor-interactive)]">
                        <input
                          type="checkbox"
                          checked={openOnSelect}
                          onChange={(e) => setOpenOnSelect(e.target.checked)}
                          className="size-3.5 accent-[var(--accent)]"
                        />
                        切题时同步切换原站文档窗口
                      </label>
                    </div>

                    <div className="flex shrink-0 flex-wrap gap-2">
                      <Button variant="primary" size="sm" onPress={() => openTencentDoc(doc.url)}>
                        <Icon icon="gravity-ui:arrow-up-right-from-square" className="size-3.5" />
                        在腾讯文档原站编辑
                      </Button>
                      <Button variant="outline" size="sm" onPress={copyDocUrl}>
                        <Icon icon={copied ? "gravity-ui:check" : "gravity-ui:copy"} className="size-3.5" />
                        {copied ? "已复制" : "复制链接"}
                      </Button>
                    </div>
                  </div>

                  <article className="rounded-lg border border-separator bg-surface px-6 py-6 shadow-sm md:px-8 md:py-7">
                    <header className="pb-5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded bg-accent/10 px-2 py-1 text-[12px] font-bold text-accent tabular-nums">{activeId}</span>
                        <span className="text-[12px] text-muted">{contextLabel}</span>
                        {loading && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-warning/10 px-2 py-1 text-[11px] font-medium text-warning">
                            <Icon icon="gravity-ui:arrows-rotate-right" className="size-3 animate-spin" />
                            加载预览
                          </span>
                        )}
                        {notFound && (
                          <span className="rounded-full bg-default-100 px-2 py-1 text-[11px] font-medium text-muted">
                            暂无预览文件
                          </span>
                        )}
                      </div>
                      <h1 className="mt-3 text-2xl font-semibold leading-tight text-foreground">{doc.title}</h1>
                    </header>

                    <section className="border-t border-separator/70 py-5">
                      <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold text-muted">
                        <Icon icon="gravity-ui:circle-question" className="size-3.5 text-accent" />
                        问题
                      </div>
                      <p className="text-[15px] font-medium leading-relaxed text-foreground">{previewQuestion}</p>
                    </section>

                    <section className="border-t border-separator/70 py-5">
                      <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold text-muted">
                        <Icon icon="gravity-ui:text" className="size-3.5 text-accent" />
                        答案草稿
                      </div>
                      {previewDraft ? (
                        <p className="whitespace-pre-wrap text-[14px] leading-7 text-foreground">{previewDraft}</p>
                      ) : (
                        <p className="text-[13px] leading-relaxed text-muted">暂无答案草稿。可先在腾讯文档原站编辑。</p>
                      )}
                    </section>

                    {previewGuidance && (
                      <details className="border-t border-separator/70 pt-5">
                        <summary className="cursor-[var(--cursor-interactive)] text-[12px] font-semibold text-muted">
                          填写指引
                        </summary>
                        <p className="mt-3 whitespace-pre-wrap text-[13px] leading-relaxed text-muted">{previewGuidance}</p>
                      </details>
                    )}
                  </article>
                </div>
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
                  <Icon icon="gravity-ui:file-text" className="size-9 text-muted/60" />
                  <div>
                    <p className="text-sm font-medium text-foreground">该题尚未创建腾讯文档</p>
                    <p className="mt-1 text-[12px] text-muted">右侧仍可查看填写指引与证据（grounding 运行后填充）。</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: provenance panel */}
          <aside className="hidden h-full min-h-0 w-[380px] shrink-0 border-l border-separator lg:block xl:w-[420px]">
            {active && (
              <ProvenancePanel
                questionId={activeId}
                contextLabel={contextLabel}
                guidance={active.guidance}
                provenance={provenance}
                loading={loading}
                notFound={notFound}
              />
            )}
          </aside>
        </div>
      </AppLayout>
    </Sidebar.Provider>
  );
}

export { AI_INFRA_SLUG, AI_INFRA_TITLE };
