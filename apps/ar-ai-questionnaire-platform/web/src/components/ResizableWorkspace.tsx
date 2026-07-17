import type { ReactNode } from "react";
import { useLayoutEffect } from "react";
import {
  Panel,
  Group,
  Separator,
  useDefaultLayout,
  useGroupCallbackRef,
  type Layout,
  type LayoutStorage,
} from "react-resizable-panels";

/** Avoid id collision with HeroUI AppLayout panels (`app-layout-main`, etc.). */
const PANEL_FILL = "workspace-fill";
const PANEL_AI = "workspace-ai";
const GROUP_ID = "omdia-ai-workspace";

const LEGACY_LAYOUT_KEYS = [
  "omdia-main-ai-layout",
  "omdia-main-ai-layout-v2",
  "omdia-main-ai-layout-v3",
];

/** ~64/36 inside app-layout-main ≈ 30% of viewport with an 18% left nav. */
const DEFAULT_LAYOUT: Layout = { [PANEL_FILL]: 64, [PANEL_AI]: 36 };
const MIN_AI_PERCENT = 26;
const MAX_AI_PERCENT = 78;

function isValidLayout(layout: Layout | null | undefined): layout is Layout {
  if (!layout) return false;
  const fill = layout[PANEL_FILL];
  const ai = layout[PANEL_AI];
  if (typeof fill !== "number" || typeof ai !== "number") return false;
  if (!Number.isFinite(fill) || !Number.isFinite(ai)) return false;
  if (ai < MIN_AI_PERCENT || ai > MAX_AI_PERCENT) return false;
  if (fill < 22) return false;
  const sum = fill + ai;
  return sum >= 98 && sum <= 102;
}

const storage: LayoutStorage = {
  getItem(name) {
    if (typeof window === "undefined") return null;
    for (const key of LEGACY_LAYOUT_KEYS) {
      try {
        window.localStorage.removeItem(key);
      } catch {
        /* noop */
      }
    }
    try {
      const raw = window.localStorage.getItem(name);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as Layout;
      // Drop layouts from the old 68% AI default era.
      if (!isValidLayout(parsed) || (parsed[PANEL_AI] ?? 0) >= 60) {
        window.localStorage.removeItem(name);
        return null;
      }
      return raw;
    } catch {
      return null;
    }
  },
  setItem(name, value) {
    try {
      const parsed = JSON.parse(value) as Layout;
      if (!isValidLayout(parsed)) return;
      window.localStorage.setItem(name, value);
    } catch {
      /* noop */
    }
  },
};

interface Props {
  main: ReactNode;
  aside: ReactNode | null;
}

/** Main content + right AI panel with drag resize (layout persisted in localStorage). */
export function ResizableWorkspace({ main, aside }: Props) {
  const { defaultLayout, onLayoutChanged } = useDefaultLayout({
    id: GROUP_ID,
    panelIds: [PANEL_FILL, PANEL_AI],
    storage,
  });

  const [groupApi, setGroupApi] = useGroupCallbackRef();

  const layout = isValidLayout(defaultLayout) ? defaultLayout : DEFAULT_LAYOUT;

  // defaultLayout on Group can miss the first paint; repair once the imperative API is live.
  useLayoutEffect(() => {
    if (!groupApi || !aside) return;
    const applyIfNeeded = () => {
      const current = groupApi.getLayout();
      const fill = current[PANEL_FILL];
      const ai = current[PANEL_AI];
      if (typeof fill !== "number" || typeof ai !== "number") return false;
      if (ai < MIN_AI_PERCENT || ai > MAX_AI_PERCENT || ai >= 60) {
        groupApi.setLayout(DEFAULT_LAYOUT);
      }
      return true;
    };
    if (applyIfNeeded()) return;
    const t = window.setTimeout(applyIfNeeded, 0);
    return () => window.clearTimeout(t);
  }, [groupApi, aside, layout]);

  if (!aside) {
    return <div className="flex h-dvh min-h-0 w-full min-w-0 flex-1">{main}</div>;
  }

  return (
    <Group
      id={GROUP_ID}
      orientation="horizontal"
      className="h-dvh w-full min-h-0 min-w-0 flex-1"
      groupRef={setGroupApi}
      defaultLayout={layout}
      onLayoutChanged={onLayoutChanged}
      resizeTargetMinimumSize={{ coarse: 44, fine: 20 }}
    >
      <Panel id={PANEL_FILL} defaultSize="64%" minSize="22%" className="min-h-0 min-w-0">
        {main}
      </Panel>
      <Separator id="workspace-split" className="workspace-resize-handle">
        <div className="pointer-events-none mx-auto h-16 w-1 rounded-full bg-zinc-300/80" />
      </Separator>
      <Panel
        id={PANEL_AI}
        defaultSize="36%"
        minSize={`${MIN_AI_PERCENT}%`}
        maxSize={`${MAX_AI_PERCENT}%`}
        className="min-h-0 min-w-0 h-full max-h-dvh overflow-hidden"
      >
        {aside}
      </Panel>
    </Group>
  );
}
