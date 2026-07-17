/**
 * Local stand-in for `@heroui-pro/react`.
 *
 * The real package is a paid, license-gated component library: its compiled
 * code is fetched at install time from the HeroUI CDN with a UUID license
 * token (`HEROUI_AUTH_TOKEN`). The token / MCP mirror we have only exposes
 * docs + OSS source, not the Pro bundle, so the package cannot be installed.
 *
 * This module reimplements exactly the four Pro components this app imports —
 * `AppLayout`, `Sidebar`, `Sheet`, `CheckboxButtonGroup` — with the same
 * compound API surface and prop names, styled with the app's own Tailwind
 * tokens. Vite aliases `@heroui-pro/react` → this file (see vite.config.ts).
 *
 * Swap back to the real package by removing the two aliases once a license
 * token is available and `pnpm install && ./install.sh` has fetched the bundle.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ AppLayout */

interface AppLayoutProps {
  sidebar: ReactNode;
  children?: ReactNode;
  sidebarResizable?: boolean;
  sidebarCollapsible?: "none" | "offcanvas" | "icon" | boolean;
  sidebarDefaultSize?: number;
  sidebarMinSize?: number;
  sidebarMaxSize?: number;
  resizableAutoSaveId?: string;
}

/**
 * Two-pane app shell: a left sidebar column + a flexible content area.
 * The real component supports drag-to-resize of the sidebar; this shim uses a
 * fixed-percentage column (the right-hand AI panel keeps its own drag resize
 * via ResizableWorkspace, which is unaffected).
 */
export function AppLayout({
  sidebar,
  children,
  sidebarDefaultSize = 18,
  sidebarMinSize = 12,
  sidebarMaxSize = 30,
}: AppLayoutProps) {
  return (
    <div className="flex h-dvh w-full min-h-0 min-w-0">
      <aside
        className="h-full min-h-0 shrink-0 overflow-hidden border-r border-separator"
        style={{
          width: `${sidebarDefaultSize}%`,
          minWidth: `${sidebarMinSize}%`,
          maxWidth: `${sidebarMaxSize}%`,
        }}
      >
        {sidebar}
      </aside>
      <div className="flex h-full min-h-0 min-w-0 flex-1">{children}</div>
    </div>
  );
}

/* -------------------------------------------------------------------- Sidebar */

const SidebarContext = createContext<{ open: boolean; setOpen: (v: boolean) => void }>({
  open: true,
  setOpen: () => {},
});

function SidebarProvider({
  children,
  defaultOpen = true,
}: {
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <SidebarContext.Provider value={{ open, setOpen }}>{children}</SidebarContext.Provider>
  );
}

function SidebarRoot({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <nav className={cn("flex h-full min-h-0 w-full flex-col bg-surface", className)}>
      {children}
    </nav>
  );
}

function SidebarHeader({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("shrink-0", className)}>{children}</div>;
}

function SidebarContent({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("flex-1 min-h-0 overflow-y-auto", className)}>{children}</div>
  );
}

function SidebarFooter({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("shrink-0 border-t border-separator", className)}>{children}</div>
  );
}

function SidebarGroup({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("px-2 py-2", className)}>{children}</div>;
}

function SidebarGroupLabel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted",
        className,
      )}
    >
      {children}
    </div>
  );
}

function SidebarMenu({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("flex flex-col gap-0.5", className)}>{children}</div>;
}

function SidebarMenuItem({
  children,
  className,
  isCurrent,
  onAction,
}: {
  children: ReactNode;
  className?: string;
  isCurrent?: boolean;
  onAction?: () => void;
}) {
  return (
    <button
      type="button"
      data-current={isCurrent || undefined}
      onClick={() => onAction?.()}
      className={cn(
        "block w-full rounded-lg text-left cursor-[var(--cursor-interactive)] transition-colors hover:bg-surface-secondary/60",
        className,
      )}
    >
      {children}
    </button>
  );
}

export const Sidebar = Object.assign(SidebarRoot, {
  Provider: SidebarProvider,
  Header: SidebarHeader,
  Content: SidebarContent,
  Footer: SidebarFooter,
  Group: SidebarGroup,
  GroupLabel: SidebarGroupLabel,
  Menu: SidebarMenu,
  MenuItem: SidebarMenuItem,
});

/* ---------------------------------------------------------------------- Sheet */

const SheetContext = createContext<{
  open: boolean;
  setOpen: (v: boolean) => void;
  placement: "left" | "right";
  isDismissable: boolean;
} | null>(null);

function useSheet() {
  const ctx = useContext(SheetContext);
  if (!ctx) throw new Error("Sheet subcomponents must be used inside <Sheet>");
  return ctx;
}

function Sheet({
  children,
  placement = "right",
  isDismissable = true,
}: {
  children: ReactNode;
  placement?: "left" | "right";
  isDismissable?: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <SheetContext.Provider value={{ open, setOpen, placement, isDismissable }}>
      {children}
    </SheetContext.Provider>
  );
}

function SheetTrigger({ children }: { children: ReactNode }) {
  const { setOpen } = useSheet();
  // `display: contents` keeps the trigger's own layout; the click bubbles up
  // from whatever element (e.g. a HeroUI <Button>) the caller nested inside.
  return (
    <span className="contents" onClick={() => setOpen(true)}>
      {children}
    </span>
  );
}

function SheetBackdrop({
  children,
  variant,
}: {
  children: ReactNode;
  variant?: "blur" | "opaque" | "transparent";
}) {
  const { open, setOpen, placement, isDismissable } = useSheet();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isDismissable) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, isDismissable, setOpen]);

  if (!open) return null;

  return createPortal(
    <div
      className={cn(
        "fixed inset-0 z-50 flex bg-black/40",
        variant === "blur" && "backdrop-blur-sm",
        placement === "right" ? "justify-end" : "justify-start",
      )}
      onClick={() => isDismissable && setOpen(false)}
    >
      {children}
    </div>,
    document.body,
  );
}

function SheetContent({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "relative flex h-full flex-col overflow-hidden bg-overlay shadow-overlay",
        className,
      )}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  );
}

function SheetDialog({ children, className }: { children: ReactNode; className?: string }) {
  const { setOpen } = useSheet();
  return (
    <div className={cn("flex h-full flex-col", className)}>
      <button
        type="button"
        aria-label="Close"
        onClick={() => setOpen(false)}
        className="absolute right-3 top-3 z-10 inline-flex size-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-secondary hover:text-foreground cursor-[var(--cursor-interactive)]"
      >
        <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
        </svg>
      </button>
      {children}
    </div>
  );
}

function SheetHeader({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("shrink-0", className)}>{children}</div>;
}

function SheetHeading({ children, className }: { children: ReactNode; className?: string }) {
  return <h2 className={cn(className)}>{children}</h2>;
}

function SheetBody({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("min-h-0 flex-1", className)}>{children}</div>;
}

const SheetWithParts = Object.assign(Sheet, {
  Trigger: SheetTrigger,
  Backdrop: SheetBackdrop,
  Content: SheetContent,
  Dialog: SheetDialog,
  Header: SheetHeader,
  Heading: SheetHeading,
  Body: SheetBody,
});
export { SheetWithParts as Sheet };

/* ------------------------------------------------------------ CheckboxButtonGroup */

const CheckboxGroupContext = createContext<{
  value: string[];
  toggle: (v: string) => void;
} | null>(null);

function useCheckboxGroup() {
  const ctx = useContext(CheckboxGroupContext);
  if (!ctx)
    throw new Error("CheckboxButtonGroup.Item must be used inside <CheckboxButtonGroup>");
  return ctx;
}

interface CheckboxButtonGroupProps {
  children: ReactNode;
  value: string[];
  onChange: (next: string[]) => void;
  className?: string;
  layout?: "flex" | "grid" | "stack";
  "aria-label"?: string;
}

function CheckboxButtonGroupRoot({
  children,
  value,
  onChange,
  className,
  layout = "flex",
  ...rest
}: CheckboxButtonGroupProps) {
  const toggle = useCallback(
    (v: string) => {
      onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);
    },
    [value, onChange],
  );
  return (
    <div
      role="group"
      className={cn("flex", layout === "flex" && "flex-wrap", className)}
      {...rest}
    >
      <CheckboxGroupContext.Provider value={{ value, toggle }}>
        {children}
      </CheckboxGroupContext.Provider>
    </div>
  );
}

function CheckboxButtonGroupItem({
  children,
  value,
  className,
}: {
  children: ReactNode;
  value: string;
  className?: string;
}) {
  const { value: selected, toggle } = useCheckboxGroup();
  const isSelected = selected.includes(value);
  const id = useId();
  return (
    <button
      type="button"
      id={id}
      role="checkbox"
      aria-checked={isSelected}
      onClick={() => toggle(value)}
      className={cn(
        "inline-flex items-center rounded-lg border px-3 py-1.5 text-sm transition-colors cursor-[var(--cursor-interactive)]",
        isSelected
          ? "border-accent bg-accent/10 text-accent"
          : "border-border bg-surface text-foreground hover:bg-surface-secondary",
        className,
      )}
    >
      {children}
    </button>
  );
}

function CheckboxButtonGroupItemContent({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <span className={cn(className)}>{children}</span>;
}

export const CheckboxButtonGroup = Object.assign(CheckboxButtonGroupRoot, {
  Item: CheckboxButtonGroupItem,
  ItemContent: CheckboxButtonGroupItemContent,
});
