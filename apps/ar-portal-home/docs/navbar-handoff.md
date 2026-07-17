# Navbar hand-off — port the Mr.smARt nav to a Vite + React app

This is everything needed to reproduce the global navigation bar (the floating,
hover-to-open mega-menu) **1:1** in another React app. The source app is
Next.js; the target described here is **Vite + React**. The only framework-specific
pieces are `next/image` and `next/link`, and both have trivial swaps.

The navbar itself is **framework-agnostic React** — no Next APIs inside the
component. You copy 4 files, install 5 deps, and pass your own `sections` /
`logo` / `cta` as props.

---

## 1. What you're getting

`<NavbarWithMenu>` renders:

- a centered, **sticky** pill bar (`max-w-3xl`, `backdrop-blur`),
- desktop nav items (`hidden md:flex`) that are either plain links or **dropdown
  triggers**,
- on hover of a dropdown trigger, a **mega-menu panel** drops down (animated with
  framer-motion) showing a CSS-grid of tiles,
- tiles support: icon, title, description, a **background-image** variant (with a
  readability scrim + text-shadow), `rowSpan`, and a `comingSoon` disabled state,
- slots for a custom **logo** (left) and **cta** (right).

Behavior: the menu opens on `mouseenter` of a trigger and closes on
`mouseleave` of the whole bar. It's **desktop-only** (the nav row is `hidden
md:flex`) — there is no mobile drawer in this component; add one if you need it.

---

## 2. Install dependencies

```bash
npm i framer-motion class-variance-authority clsx tailwind-merge lucide-react
```

- **framer-motion** — dropdown open/close animation
- **class-variance-authority**, **clsx**, **tailwind-merge** — styling utils (`cn`, button variants)
- **lucide-react** — icons (the chevron + whatever icons you put in tiles)

> The source app uses `@hugeicons/react` for the chevron. The port below swaps it
> for lucide's `ChevronDown` so you only need one icon library. If you'd rather
> keep hugeicons, install `@hugeicons/react @hugeicons/core-free-icons` and use
> `<HugeiconsIcon icon={ArrowDown01Icon} size={17} … />` instead.

### Tailwind

This component is **styled entirely with Tailwind utility classes** and assumes
**Tailwind v4** (what the source app uses). In your Vite app's main CSS:

```css
@import "tailwindcss";
```

The component relies on a few newer utilities — all built-in on v4, but if you're
on **Tailwind v3 make sure it's ≥ 3.3**:

- `line-clamp-2`
- gradient color-stop positions: `from-5% via-45% to-80%`
- arbitrary properties: `[text-shadow:0_1px_3px_rgba(0,0,0,0.55)]`
- `min-h-18` (= 4.5rem, default spacing scale)

Colors used are stock Tailwind palette (`zinc-*`, `sky-*`), so no theme config is
required. No special fonts are needed (the source uses Geist, but the navbar
doesn't depend on it).

---

## 3. Files to copy

Create these 4 files. Three are **identical** to the source; only
`navbar-menu.tsx` has the Vite swaps (marked `// PORT:`).

### `src/lib/utils.ts`  (identical)

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### `src/lib/color-utils.ts`  (identical — pure functions)

```ts
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const normalizedHex = hex.charAt(0) === "#" ? hex.substring(1) : hex;
  if (normalizedHex.length === 3) {
    const r = parseInt(normalizedHex.charAt(0) + normalizedHex.charAt(0), 16);
    const g = parseInt(normalizedHex.charAt(1) + normalizedHex.charAt(1), 16);
    const b = parseInt(normalizedHex.charAt(2) + normalizedHex.charAt(2), 16);
    return { r, g, b };
  }
  if (normalizedHex.length === 6) {
    const r = parseInt(normalizedHex.substring(0, 2), 16);
    const g = parseInt(normalizedHex.substring(2, 4), 16);
    const b = parseInt(normalizedHex.substring(4, 6), 16);
    return { r, g, b };
  }
  return null;
}

export function getLuminance(rgb: { r: number; g: number; b: number }): number {
  const { r, g, b } = rgb;
  const sR = r / 255, sG = g / 255, sB = b / 255;
  const R = sR <= 0.03928 ? sR / 12.92 : ((sR + 0.055) / 1.055) ** 2.4;
  const G = sG <= 0.03928 ? sG / 12.92 : ((sG + 0.055) / 1.055) ** 2.4;
  const B = sB <= 0.03928 ? sB / 12.92 : ((sB + 0.055) / 1.055) ** 2.4;
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

export function getContrastColor(luminance: number): string {
  return luminance > 0.5 ? "#000000" : "#ffffff";
}

export function parseColor(color: string): { r: number; g: number; b: number } | null {
  const hexResult = hexToRgb(color);
  if (hexResult) return hexResult;
  // Resolve named/rgb()/hsl() colors via the DOM (browser only — fine in Vite).
  try {
    const el = document.createElement("div");
    el.style.color = color;
    document.body.appendChild(el);
    const computed = window.getComputedStyle(el).color;
    document.body.removeChild(el);
    const m = computed.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
    if (m) return { r: +m[1], g: +m[2], b: +m[3] };
  } catch {
    /* ignore */
  }
  return null;
}
```

### `src/components/raised-button.tsx`  (identical except the `color-utils` import path)

```tsx
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";
import { getContrastColor, getLuminance, parseColor } from "@/lib/color-utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center dark:bg-zinc-500 dark:text-white whitespace-nowrap text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative bg-primary text-primary-foreground hover:bg-primary/90 border border-primary/50 shadow-md before:absolute before:inset-0 before:border-t before:border-white/40 before:bg-gradient-to-b before:from-white/20 before:to-transparent cursor-pointer transition-transform duration-200 active:scale-[0.96] subpixel-antialiased gap-2",
  {
    variants: {
      variant: { default: "" },
      size: {
        default: "h-10 px-4 py-2 rounded-xl before:rounded-xl",
        sm: "h-9 rounded-lg px-3 before:rounded-xl",
        lg: "h-11 rounded-lg px-8 before:rounded-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  color?: string;
}

const RaisedButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, color, style = {}, ...props }, ref) => {
    const dynamicStyles = React.useMemo(() => {
      if (!color) return {};
      try {
        const rgb = parseColor(color);
        if (!rgb) return {};
        const textColor = getContrastColor(getLuminance(rgb));
        return {
          backgroundColor: color,
          color: textColor,
          borderColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.5)`,
          "--hover-bg": `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.9)`,
          "--border": `rgba(255, 255, 255, 0.6)`,
          "--gradient": `rgba(255, 255, 255, 0.3)`,
          "--shadow-color": `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)`,
          boxShadow: `0 4px 5px 0px var(--shadow-color)`,
          transition: "all 0.2s ease-in-out",
        } as React.CSSProperties;
      } catch {
        return {};
      }
    }, [color]);

    return (
      <button
        className={cn(
          buttonVariants({ variant, size, className }),
          color &&
            "hover:bg-[color:var(--hover-bg)] before:border-[color:var(--border)] before:from-[color:var(--gradient)] hover:opacity-80 overflow-hidden",
        )}
        ref={ref}
        style={{ ...style, ...dynamicStyles }}
        {...props}
      />
    );
  },
);
RaisedButton.displayName = "RaisedButton";

export { buttonVariants, RaisedButton };
```

> `RaisedButton` uses `bg-primary` / `text-primary-foreground` as a fallback when
> no `color` prop is given. Since we always pass `color="#00bbff"`, those theme
> tokens never render — but if you want the no-color fallback to work, define
> `--primary` / `--primary-foreground` in your CSS. Otherwise ignore it.

### `src/components/navbar-menu.tsx`  (PORTED — `next/image` → `<img>`, hugeicons → lucide)

```tsx
import { AnimatePresence, motion } from "framer-motion";
import * as React from "react";
import { ChevronDown } from "lucide-react"; // PORT: was @/components/icons (hugeicons)

import { cn } from "@/lib/utils";
import { RaisedButton } from "@/components/raised-button";

export interface NavbarMenuLink {
  label: string;
  href: string;
  icon?: React.ReactNode;
  external?: boolean;
  description?: string;
  backgroundImage?: string;
  rowSpan?: number;
  comingSoon?: boolean;
  comingSoonLabel?: string;
}

export interface NavbarMenuSection {
  id: string;
  links: NavbarMenuLink[];
  gridLayout?: string;
}

export interface NavbarMenuProps {
  activeMenu: string;
  sections: NavbarMenuSection[];
  onClose?: () => void;
}

export interface NavbarWithMenuProps {
  sections: NavbarMenuSection[];
  navItems?: Array<
    | { type: "link"; label: string; href: string }
    | { type: "dropdown"; label: string; menu: string }
  >;
  logo?: React.ReactNode;
  cta?: React.ReactNode;
}

const ListItem = React.forwardRef<
  HTMLAnchorElement,
  React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    title: string;
    children?: React.ReactNode;
    href: string;
    external?: boolean;
    icon?: React.ReactNode;
    backgroundImage?: string;
    rowSpan?: number;
    comingSoon?: boolean;
    comingSoonLabel?: string;
  }
>(
  (
    { className, title, children, href, external, icon, backgroundImage, rowSpan, comingSoon, comingSoonLabel = "Coming soon", ...props },
    ref,
  ) => {
    const sharedClassName = cn(
      "group relative flex h-full min-h-18 w-full flex-col justify-center overflow-hidden rounded-2xl p-3.5 leading-none outline-none transition-all duration-150 select-none",
      comingSoon
        ? "cursor-default opacity-90"
        : "no-underline hover:bg-zinc-100 hover:text-zinc-900 focus:bg-zinc-100 focus:text-zinc-900",
      className,
    );

    const inner = (
      <>
        {backgroundImage && (
          <>
            {/* PORT: next/image <Image fill …/> → plain <img> (same classes already make it fill) */}
            <img
              src={backgroundImage}
              alt={title}
              className="absolute inset-0 z-0 h-full w-full object-cover transition-all group-hover:brightness-110"
            />
            {/* Readability scrim: dark only behind the bottom text, upper image stays bright. */}
            <div className="absolute inset-0 z-[1] bg-gradient-to-t from-black/70 from-5% via-black/25 via-45% to-transparent to-80%" />
          </>
        )}
        <div className={cn("flex items-start gap-3", backgroundImage && "relative z-[2] mt-auto")}>
          {icon && (
            <span
              className={cn(
                "relative flex min-h-10 min-w-10 items-center justify-center rounded-xl p-2 transition",
                backgroundImage
                  ? "bg-white/10 text-white backdrop-blur group-hover:bg-white/20"
                  : "bg-sky-50 text-sky-600 group-hover:bg-sky-100 group-hover:text-sky-700",
              )}
            >
              {icon}
            </span>
          )}
          <div
            className={cn(
              "flex h-full flex-col justify-start gap-1 font-medium leading-none",
              backgroundImage ? "text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.55)]" : "text-zinc-900",
            )}
          >
            {title}
            {(children || comingSoon) && (
              <p
                className={cn(
                  "line-clamp-2 text-sm font-light leading-tight",
                  backgroundImage ? "relative z-[2] text-zinc-100 [text-shadow:0_1px_2px_rgba(0,0,0,0.6)]" : "text-zinc-500",
                )}
              >
                {children}
                {comingSoon && (
                  <>
                    {children ? <span className={backgroundImage ? "text-zinc-300" : "text-zinc-400"}> · </span> : null}
                    <span className={cn("font-medium", backgroundImage ? "text-zinc-200" : "text-zinc-400")}>{comingSoonLabel}</span>
                  </>
                )}
              </p>
            )}
          </div>
        </div>
      </>
    );

    return (
      <li className={cn("list-none", rowSpan === 2 && "row-span-2")}>
        {comingSoon ? (
          <div className={sharedClassName} aria-disabled="true">{inner}</div>
        ) : (
          // PORT: if you use react-router, swap <a> for <Link to={href}> for internal hrefs.
          <a
            ref={ref}
            href={href}
            target={external ? "_blank" : undefined}
            rel={external ? "noopener noreferrer" : undefined}
            className={sharedClassName}
            {...props}
          >
            {inner}
          </a>
        )}
      </li>
    );
  },
);
ListItem.displayName = "ListItem";

export function NavbarMenu({ activeMenu, sections }: NavbarMenuProps) {
  const activeSection = sections.find((s) => s.id === activeMenu);
  if (!activeSection) return null;
  const gridLayout = activeSection.gridLayout || "grid w-full grid-cols-2 gap-3";

  return (
    <motion.div
      initial={{ scaleY: 0.95, opacity: 0 }}
      animate={{ scaleY: 1, opacity: 1 }}
      exit={{ scaleY: 0.95, opacity: 0 }}
      transition={{ ease: [0.19, 1, 0.15, 1.01] }}
      className="absolute top-full left-0 z-40 w-full origin-top overflow-hidden rounded-b-2xl border border-t-0 border-zinc-200 bg-white/95 shadow-xl shadow-zinc-900/5 backdrop-blur-xl outline-none"
    >
      <div className="p-4">
        <ul className={gridLayout}>
          {activeSection.links.map((link) => (
            <ListItem
              key={link.href + link.label}
              href={link.href}
              title={link.label}
              external={link.external}
              icon={link.icon}
              backgroundImage={link.backgroundImage}
              rowSpan={link.rowSpan}
              comingSoon={link.comingSoon}
              comingSoonLabel={link.comingSoonLabel}
            >
              {link.description}
            </ListItem>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}

export function NavbarWithMenu({ sections, navItems, logo, cta }: NavbarWithMenuProps) {
  const [activeDropdown, setActiveDropdown] = React.useState<string | null>(null);
  const [hoveredItem, setHoveredItem] = React.useState<string | null>(null);

  const defaultNavItems = [
    { type: "dropdown", label: "Product", menu: "product" },
    { type: "dropdown", label: "Resources", menu: "resources" },
  ] as const;
  const items = navItems || defaultNavItems;

  return (
    <div className="sticky top-0 z-50 flex w-full justify-center px-4 pt-3">
      <div
        className="relative mx-auto w-full max-w-3xl"
        onMouseLeave={() => {
          setActiveDropdown(null);
          setHoveredItem(null);
        }}
      >
        <div
          className={cn(
            "navbar_content flex h-14 w-full items-center justify-between border px-3 shadow-sm backdrop-blur-md transition-all",
            activeDropdown ? "rounded-t-2xl border-b-0 border-zinc-200 bg-white" : "rounded-2xl border-zinc-200 bg-white/85",
          )}
        >
          <div className="flex items-center gap-2 px-1">
            {logo || <span className="text-base font-semibold text-zinc-900">Mr.smARt</span>}
          </div>

          <div className="hidden items-center gap-1 rounded-lg px-1 py-1 md:flex">
            {items.map((item) =>
              item.type === "link" ? (
                <a
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative flex h-9 cursor-pointer items-center rounded-xl px-4 py-2 text-sm transition-colors hover:bg-zinc-100",
                    hoveredItem === item.label.toLowerCase() ? "text-zinc-900" : "text-zinc-500 hover:text-zinc-900",
                  )}
                  onMouseEnter={() => {
                    setHoveredItem(item.label.toLowerCase());
                    setActiveDropdown(null);
                  }}
                >
                  <span className="relative z-10">{item.label}</span>
                </a>
              ) : (
                <button
                  type="button"
                  key={item.menu}
                  className="relative flex h-9 cursor-pointer items-center rounded-xl px-4 py-2 text-sm text-zinc-500 capitalize transition-colors hover:text-zinc-900"
                  onMouseEnter={() => {
                    setActiveDropdown(item.menu);
                    setHoveredItem(item.menu);
                  }}
                >
                  {hoveredItem === item.menu && (
                    <div className="absolute inset-0 h-full w-full rounded-xl bg-zinc-100 transition-all duration-300 ease-out" />
                  )}
                  <div className="relative z-10 flex items-center gap-2">
                    <span>{item.label.charAt(0).toUpperCase() + item.label.slice(1)}</span>
                    {/* PORT: lucide chevron instead of hugeicons */}
                    <ChevronDown size={17} className={cn("transition duration-200", hoveredItem === item.menu && "rotate-180")} />
                  </div>
                </button>
              ),
            )}
          </div>

          <div className="flex items-center gap-2">
            {cta || <RaisedButton color="#00bbff">Get Started</RaisedButton>}
          </div>
        </div>

        <AnimatePresence>
          {activeDropdown && <NavbarMenu activeMenu={activeDropdown} sections={sections} />}
        </AnimatePresence>
      </div>
    </div>
  );
}
```

---

## 4. Use it (the `SiteNavbar` wrapper)

Build your sections/items once and render `<NavbarWithMenu>`. Mount this in your
**root layout/App** so it's global across routes. Icons are lucide; tiles with a
`backgroundImage` need that image in your `public/`.

```tsx
import {
  Sparkles, Contact, TrendingUp, LineChart,
  Map, Presentation, Clock3, FileText,
} from "lucide-react";
import { NavbarWithMenu, type NavbarMenuSection } from "@/components/navbar-menu";
import { RaisedButton } from "@/components/raised-button";

const WORKSPACE_URL = "https://ai.ar-tencent.cloud/";

const navSections: NavbarMenuSection[] = [
  {
    id: "product",
    gridLayout: "grid w-full grid-cols-3 grid-rows-[5.5rem_5.5rem] gap-3",
    links: [
      { label: "AI questionnaire", href: WORKSPACE_URL, external: true,
        description: "Draft, cite & sign off MQ answers in one flow",
        rowSpan: 2, backgroundImage: "/nav-ai-questionnaire.png", icon: <Sparkles className="h-5 w-5" /> },
      { label: "AR CRM", href: "#", description: "Track firms, contacts, briefings & cycles",
        rowSpan: 2, backgroundImage: "/nav-ar-crm.png", icon: <Contact className="h-5 w-5" /> },
      { label: "Market Insight", href: "#", description: "Analyst coverage & competitive signals",
        icon: <TrendingUp className="h-5 w-5" />, comingSoon: true, comingSoonLabel: "Coming soon" },
      { label: "Ranking monitor", href: "#", description: "Watch Magic Quadrant & Wave moves",
        icon: <LineChart className="h-5 w-5" />, comingSoon: true, comingSoonLabel: "Coming soon" },
    ],
  },
  {
    id: "ar-resources",
    gridLayout: "grid w-full grid-cols-3 grid-rows-[5.5rem_5.5rem] gap-3",
    links: [
      { label: "Roadmap", href: "/roadmap", description: "What we're building next",
        rowSpan: 2, backgroundImage: "/nav-roadmap.png", icon: <Map className="h-5 w-5" /> },
      { label: "Research report archive", href: "https://docs.qq.com/…", external: true,
        description: "Past analyst reports", icon: <Presentation className="h-5 w-5" /> },
      { label: "Reports in progress", href: "#", description: "Currently in flight", icon: <Clock3 className="h-5 w-5" /> },
      { label: "TBD", href: "#", description: "—", icon: <FileText className="h-5 w-5" /> },
      { label: "TBD", href: "#", description: "—", icon: <FileText className="h-5 w-5" /> },
    ],
  },
];

export function SiteNavbar() {
  return (
    <NavbarWithMenu
      sections={navSections}
      navItems={[
        { type: "dropdown", label: "Product", menu: "product" },
        { type: "dropdown", label: "AR resources", menu: "ar-resources" },
      ]}
      logo={
        <a href="/" className="flex items-center gap-2.5">
          <img src="/logo.png" alt="Mr.smARt" className="h-8 w-8 rounded-lg object-cover shadow-md shadow-sky-500/25" />
          <span className="text-base font-semibold text-zinc-900">Mr.smARt</span>
        </a>
      }
      cta={
        <RaisedButton color="#00bbff" onClick={() => window.open(WORKSPACE_URL, "_blank", "noopener,noreferrer")}>
          Request access
        </RaisedButton>
      }
    />
  );
}
```

Then in your app root (e.g. `App.tsx`):

```tsx
export default function App() {
  return (
    <>
      <SiteNavbar />
      {/* ...routes / page content... */}
    </>
  );
}
```

---

## 5. Porting checklist (Next → Vite)

| Source (Next.js) | Port (Vite) | Where |
| --- | --- | --- |
| `import Image from "next/image"` + `<Image fill …/>` | `<img>` (same classes fill it) | `navbar-menu.tsx` tile bg |
| `import Link from "next/link"` + `<Link href>` | `<a href>` (or react-router `<Link to>`) | logo + internal tile links |
| `@hugeicons/react` chevron | `lucide-react` `ChevronDown` | `navbar-menu.tsx` |
| `"use client"` directive | delete it (no RSC in Vite) | top of each file |
| `@/…` path alias | set up the `@` alias in `vite.config` + `tsconfig` (or use relative imports) | all imports |

### `@` alias for Vite (optional but matches the imports above)

`vite.config.ts`:

```ts
import path from "node:path";
export default defineConfig({
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
});
```

`tsconfig.json`:

```json
{ "compilerOptions": { "baseUrl": ".", "paths": { "@/*": ["./src/*"] } } }
```

### Assets

Copy any tile background images + the logo into the Vite app's `public/` and keep
the same paths (`/nav-ai-questionnaire.png`, `/nav-ar-crm.png`, `/nav-roadmap.png`,
`/logo.png`). Available in this repo's `public/`.

---

## 6. Notes & gotchas

- **Internal vs external links.** External tiles set `external: true` →
  `target="_blank" rel="noopener noreferrer"`. For internal SPA routes with
  react-router, swap the `<a>` in `ListItem` (and the `logo`) for `<Link to>` so
  you get client-side navigation instead of a full reload.
- **Desktop-only nav.** The trigger row is `hidden md:flex`. On mobile only the
  logo + cta show. Add your own hamburger/drawer if you need mobile nav.
- **Hover, not click.** Menus open on hover and close when the pointer leaves the
  bar — good for desktop, but consider a click/tap variant for touch devices.
- **Grid sizing.** `grid-rows-[5.5rem_5.5rem]` pins each menu row to a fixed
  height so switching dropdowns doesn't make the panel jump. Big tiles use
  `rowSpan: 2`. Keep both menus on the same `grid-cols-3 grid-rows-[…]` for equal
  panel heights.
- **No i18n required.** The source passes translated strings in via `sections` /
  `navItems` / `logo` / `cta`. The component has zero i18n coupling — feed it
  whatever strings (or your own translation hook) you like.
- **RaisedButton contrast.** It computes black/white text from the `color` prop at
  runtime via the DOM — browser-only, which is fine in Vite.
```
