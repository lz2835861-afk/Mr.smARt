import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Routes, Route, Navigate, Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Button, Tooltip } from "@heroui/react";
import { AppLayout, Sidebar } from "@heroui-pro/react";
import { Icon } from "@iconify/react";
import { Toaster, toast } from "sonner";
import {
  QUESTIONNAIRES,
  getQuestionnaireBySlug,
  type Questionnaire,
} from "./data/questionnaires";
import { HomePage } from "./components/HomePage";
import { useRemoteAnswers } from "./hooks/useRemoteAnswers";
import { useAnswerMeta, rollupState, type AnswerState } from "./hooks/useAnswerMeta";
import { useComments } from "./hooks/useComments";
import { useAuth } from "./hooks/useAuth";
import { usePresence } from "./hooks/usePresence";
import { roleForName, type Role } from "./lib/supabase";
import { QuestionDetail } from "./components/QuestionDetail";
import { EnglishReview } from "./components/EnglishReview";
import { AiInfraDocView, AI_INFRA_SLUG } from "./components/AiInfraDocView";
import { AuthGate } from "./components/AuthGate";
import { PresenceBar } from "./components/PresenceBar";
import { AiAssistant } from "./components/AiAssistant";
import { ResizableWorkspace } from "./components/ResizableWorkspace";
import { SidebarQuestionItem } from "./components/SidebarQuestionItem";
import {
  parseBilingualTitle,
  sectionLabelZh,
  STATE_LABEL,
  ROLE_LABEL,
} from "./lib/locale";
import { STATE_INDICATOR } from "./lib/workflowStates";
import { useMainColumnSelection } from "./hooks/useMainColumnSelection";

function StateDot({ state }: { state: AnswerState }) {
  return <span className={`size-2 rounded-full ${STATE_INDICATOR[state]}`} />;
}

/** Which workflow states are actionable for each role (drives "我的待办"). */
const ACTIONABLE: Record<Role, AnswerState[]> = {
  product: ["PRODUCT REVIEW"],
  kevin: ["KEVIN REVIEW"],
  ar: ["AI DRAFTED", "READY", "BLOCKED"],
};

type AppView = "fill" | "en";

interface InnerProps {
  auth: ReturnType<typeof useAuth>;
  questionnaire: Questionnaire;
}

function AppInner({ auth, questionnaire }: InnerProps) {
  const navigate = useNavigate();
  const { questionId: routeQuestionId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const remote = auth.status === "signed-in";
  const q = useRemoteAnswers({ remote, questionnaire });
  const meta = useAnswerMeta({ remote, questionnaire });
  const displayName = auth.user?.user_metadata?.display_name as string | undefined;
  const comments = useComments({ remote, questionnaire, authorName: displayName });
  const online = usePresence(auth.user);

  const role = roleForName(displayName);
  const [myTasksOnly, setMyTasksOnly] = useState(false);
  const view: AppView = searchParams.get("view") === "en" ? "en" : "fill";
  const mainColumnRef = useRef<HTMLElement>(null);
  const { selection: textareaSelection, clearSelection } =
    useMainColumnSelection(mainColumnRef);

  const sections = questionnaire.sections;
  // Flat list of (section, question) — for prev/next navigation
  const FLAT = useMemo(
    () => sections.flatMap((s) => s.questions.map((question) => ({ section: s, question }))),
    [sections],
  );

  // Per-question live rollup (state + whether it's in my queue). Empty when meta off.
  const questionMeta = useMemo(() => {
    const map: Record<string, { state: AnswerState; needsAttention: boolean; mine: boolean }> = {};
    if (!meta.enabled) return map;
    FLAT.forEach(({ question }) => {
      const ids = question.groups.flatMap((g) => g.fields.map((f) => f.id));
      const r = rollupState(meta.metaByField, ids);
      const mine = ACTIONABLE[role].includes(r.state) || r.needsAttention;
      map[question.id] = { state: r.state, needsAttention: r.needsAttention, mine };
    });
    return map;
  }, [FLAT, meta.enabled, meta.metaByField, role]);

  const myTaskCount = useMemo(
    () => Object.values(questionMeta).filter((m) => m.mine).length,
    [questionMeta],
  );

  const myTaskByState = useMemo(() => {
    const counts: Partial<Record<AnswerState, number>> = {};
    Object.values(questionMeta).forEach((m) => {
      if (!m.mine) return;
      counts[m.state] = (counts[m.state] ?? 0) + 1;
    });
    return counts;
  }, [questionMeta]);

  const viewSuffix = view === "en" ? "?view=en" : "";

  const setAppView = useCallback(
    (next: AppView) => {
      setSearchParams(
        (prev) => {
          const sp = new URLSearchParams(prev);
          if (next === "en") sp.set("view", "en");
          else sp.delete("view");
          return sp;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  // Active question comes from the URL (/q/:slug/:questionId). Fall back to the
  // first question for a bare /q/:slug or an unknown id.
  const activeId = useMemo(() => {
    if (routeQuestionId && FLAT.some((f) => f.question.id === routeQuestionId)) return routeQuestionId;
    return FLAT[0]?.question.id ?? "";
  }, [routeQuestionId, FLAT]);

  const activeIndex = useMemo(() => FLAT.findIndex((f) => f.question.id === activeId), [FLAT, activeId]);
  const active = FLAT[activeIndex];
  const prev = activeIndex > 0 ? FLAT[activeIndex - 1] : undefined;
  const next = activeIndex >= 0 && activeIndex < FLAT.length - 1 ? FLAT[activeIndex + 1] : undefined;

  const goTo = useCallback(
    (id: string) => {
      navigate(`/q/${questionnaire.slug}/${id}${viewSuffix}`);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [navigate, questionnaire.slug, viewSuffix],
  );

  // Canonicalize a bare or invalid question URL to the first question, so the
  // address bar always reflects the visible question (shareable deep links).
  useEffect(() => {
    if (!FLAT.length) return;
    const valid = routeQuestionId && FLAT.some((f) => f.question.id === routeQuestionId);
    if (!valid) {
      navigate(`/q/${questionnaire.slug}/${FLAT[0].question.id}${viewSuffix}`, { replace: true });
    }
  }, [routeQuestionId, FLAT, navigate, questionnaire.slug, viewSuffix]);

  const syncBadge = (() => {
    switch (q.syncState) {
      case "remote":
        return (
          <span className="inline-flex items-center gap-1 text-success">
            <span className="size-1.5 rounded-full bg-success" />
            云端同步
          </span>
        );
      case "syncing":
        return (
          <span className="inline-flex items-center gap-1 text-warning">
            <span className="size-1.5 rounded-full bg-warning animate-pulse" />
            同步中…
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-muted">
            <span className="size-1.5 rounded-full bg-default-300" />
            本地模式
          </span>
        );
    }
  })();

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
            <select
              value={questionnaire.slug}
              onChange={(e) => navigate(`/q/${e.target.value}`)}
              aria-label="切换问卷"
              className="w-full bg-transparent text-sm font-semibold text-foreground truncate outline-none cursor-[var(--cursor-interactive)] -ml-0.5"
            >
              {QUESTIONNAIRES.map((qq) => (
                <option key={qq.id} value={qq.slug}>
                  {qq.label}
                </option>
              ))}
            </select>
            <div className="text-[11px] text-muted truncate">
              {questionnaire.firm} · {questionnaire.vendor}
            </div>
          </div>
        </div>
      </Sidebar.Header>

      <Sidebar.Content>
        {meta.enabled && (
          <div className="px-2 pt-2 space-y-2">
            <Button
              variant={myTasksOnly ? "primary" : "outline"}
              size="sm"
              fullWidth
              onPress={() => setMyTasksOnly((v) => !v)}
            >
              <Icon icon="gravity-ui:list-check" className="size-3.5" />
              我的待办
              <span className="ml-auto tabular-nums text-[11px] opacity-80">{myTaskCount}</span>
            </Button>
            <div className="rounded-lg border border-border bg-surface-secondary/40 px-2.5 py-2 space-y-1.5">
              <div className="flex items-center justify-between gap-2 text-[10px]">
                <span className="text-muted">角色</span>
                <span className="font-semibold text-foreground">{ROLE_LABEL[role]}</span>
              </div>
              <div className="flex items-center justify-between gap-2 text-[10px]">
                <span className="text-muted">待办题数</span>
                <span className="font-semibold tabular-nums text-foreground">{myTaskCount}</span>
              </div>
              {myTaskCount > 0 ? (
                <div className="flex flex-wrap gap-1 pt-0.5">
                  {(Object.entries(myTaskByState) as [AnswerState, number][]).map(([state, n]) => (
                    <span
                      key={state}
                      className="inline-flex items-center gap-1 rounded-full bg-default-100 px-1.5 py-0.5 text-[10px] text-muted"
                    >
                      <StateDot state={state} />
                      {STATE_LABEL[state]}
                      <span className="tabular-nums font-semibold text-foreground">{n}</span>
                    </span>
                  ))}
                </div>
              ) : (
                <div className="text-[10px] text-muted leading-relaxed">当前没有需要你处理的题目</div>
              )}
            </div>
          </div>
        )}
        {sections.map((sec) => {
          const visibleQuestions = myTasksOnly
            ? sec.questions.filter((qq) => questionMeta[qq.id]?.mine)
            : sec.questions;
          if (visibleQuestions.length === 0) return null;
          return (
            <Sidebar.Group key={sec.id}>
              <Sidebar.GroupLabel>
                <span className="inline-flex items-center gap-2">
                  <span className="text-[10px] font-bold tracking-wider text-accent">
                    {sec.index}
                  </span>
                  <span>{sectionLabelZh(sec.title)}</span>
                </span>
              </Sidebar.GroupLabel>
              <Sidebar.Menu>
                {visibleQuestions.map((qq) => {
                  const isCurrent = activeId === qq.id;
                  const { num, displayZh } = parseBilingualTitle(qq.title);
                  const live = questionMeta[qq.id];
                  return (
                    <SidebarQuestionItem
                      key={qq.id}
                      questionId={qq.id}
                      num={num}
                      displayZh={displayZh}
                      isCurrent={isCurrent}
                      staticStatus={qq.status}
                      live={live}
                      onSelect={() => goTo(qq.id)}
                    />
                  );
                })}
              </Sidebar.Menu>
            </Sidebar.Group>
          );
        })}

        {auth.status === "signed-in" && auth.user && (
          <Sidebar.Group>
            <Sidebar.GroupLabel>Account</Sidebar.GroupLabel>
            <div className="px-3 pb-2 space-y-2">
              <div className="text-[11px] text-muted truncate">
                {(auth.user.user_metadata?.display_name as string | undefined) ??
                  auth.user.email ??
                  "(anonymous)"}
              </div>
              <Button
                variant="ghost"
                size="sm"
                fullWidth
                onPress={() => {
                  auth.signOut();
                  toast.success("已退出");
                }}
              >
                <Icon icon="gravity-ui:arrow-right-from-square" className="size-3.5" />
                退出登录
              </Button>
            </div>
          </Sidebar.Group>
        )}
      </Sidebar.Content>

      <Sidebar.Footer className="px-3 py-3">
        <div className="flex items-center justify-between gap-2 text-[11px]">
          {syncBadge}
          {q.saved && q.syncState === "local" && (
            <span className="inline-flex items-center gap-1 text-success">
              <span className="size-1.5 rounded-full bg-success" />
              本地已存
            </span>
          )}
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
        sidebarDefaultSize={18}
        sidebarMinSize={12}
        sidebarMaxSize={30}
        resizableAutoSaveId="omdia-rfi-sidebar"
      >
        <div className="flex h-dvh min-h-0 w-full min-w-0 flex-1">
        <ResizableWorkspace
          main={
          <main
            ref={mainColumnRef}
            className="main-fill-column relative mx-auto h-full min-w-0 w-full max-w-[920px] px-6 pt-6 pb-32 overflow-y-auto"
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <PresenceBar users={online} selfId={auth.user?.id} />
              <div className="flex items-center gap-2">
                <span className="text-[11px]">{syncBadge}</span>
                {view === "fill" ? (
                  <Button variant="outline" size="sm" onPress={() => setAppView("en")}>
                    <Icon icon="gravity-ui:globe" className="size-3.5" />
                    英文审稿
                  </Button>
                ) : (
                  <Button variant="primary" size="sm" onPress={() => setAppView("fill")}>
                    <Icon icon="gravity-ui:pencil" className="size-3.5" />
                    中文填写
                  </Button>
                )}
              </div>
            </div>

            {active ? (
              view === "en" ? (
                <EnglishReview
                  questionnaire={questionnaire}
                  section={active.section}
                  question={active.question}
                  answers={q.answers}
                  setText={q.setText}
                  toggleCheck={q.toggleCheck}
                  questionIndexInSection={active.section.questions.findIndex(
                    (qq) => qq.id === active.question.id,
                  )}
                  questionsInSection={active.section.questions.length}
                  onBackToFill={() => setAppView("fill")}
                  prev={prev}
                  next={next}
                  onGoTo={goTo}
                  activeIndex={activeIndex}
                  total={FLAT.length}
                />
              ) : (
                <QuestionDetail
                  section={active.section}
                  question={active.question}
                  answers={q.answers}
                  setText={q.setText}
                  toggleCheck={q.toggleCheck}
                  questionIndexInSection={active.section.questions.findIndex(
                    (qq) => qq.id === active.question.id,
                  )}
                  questionsInSection={active.section.questions.length}
                  metaApi={meta}
                  commentsApi={comments}
                  locale="zh"
                />
              )
            ) : (
              <div className="text-muted">No question selected.</div>
            )}

            <Tooltip>
              <Tooltip.Trigger>
                <button
                  type="button"
                  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                  className="fixed bottom-6 right-6 inline-flex size-10 items-center justify-center rounded-full bg-foreground text-background shadow-overlay hover:opacity-90 cursor-[var(--cursor-interactive)]"
                  aria-label="Back to top"
                >
                  <Icon icon="gravity-ui:arrow-up" className="size-4" />
                </button>
              </Tooltip.Trigger>
              <Tooltip.Content>回到顶部</Tooltip.Content>
            </Tooltip>
          </main>
          }
          aside={
            active ? (
              <AiAssistant
                question={active.question}
                answers={q.answers}
                setText={q.setText}
                metaByField={meta.metaByField}
                textareaSelection={textareaSelection}
                onClearSelection={clearSelection}
              />
            ) : null
          }
        />
        </div>
      </AppLayout>
    </Sidebar.Provider>
  );
}

/** Resolves the :slug param to a questionnaire and renders the workspace.
 *  Unknown slug → redirect home. Keyed by slug so switching remounts cleanly. */
function QuestionnaireRoute({ auth }: { auth: ReturnType<typeof useAuth> }) {
  const { slug } = useParams();
  const questionnaire = getQuestionnaireBySlug(slug);
  if (!questionnaire) return <Navigate to="/" replace />;
  return <AppInner key={questionnaire.slug} auth={auth} questionnaire={questionnaire} />;
}

export default function App() {
  return (
    <>
      <AuthGate>
        {(auth) => (
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path={`/${AI_INFRA_SLUG}`} element={<AiInfraDocView />} />
            <Route path={`/${AI_INFRA_SLUG}/:questionId`} element={<AiInfraDocView />} />
            <Route path="/q/:slug" element={<QuestionnaireRoute auth={auth} />} />
            <Route path="/q/:slug/:questionId" element={<QuestionnaireRoute auth={auth} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        )}
      </AuthGate>
      <Toaster richColors position="bottom-center" />
    </>
  );
}
