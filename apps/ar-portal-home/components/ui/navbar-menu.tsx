"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import * as React from "react";
import { ArrowDown01Icon, HugeiconsIcon } from "@/components/icons";

import { cn } from "@/lib/utils";
import { RaisedButton } from "@/components/ui/raised-button";

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
    {
      className,
      title,
      children,
      href,
      external,
      icon,
      backgroundImage,
      rowSpan,
      comingSoon,
      comingSoonLabel = "Coming soon",
      ...props
    },
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
              <Image
                fill
                src={backgroundImage}
                alt={title}
                className="absolute inset-0 z-0 h-full w-full object-cover transition-all group-hover:brightness-110"
              />
              {/* Readability scrim: keep it dark only behind the bottom text, let the upper image stay bright. */}
              <div className="absolute inset-0 z-[1] bg-gradient-to-t from-black/70 from-5% via-black/25 via-45% to-transparent to-80%" />
            </>
          )}
          <div
            className={cn(
              "flex items-start gap-3",
              backgroundImage && "relative z-[2] mt-auto",
            )}
          >
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
                backgroundImage
                  ? "text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.55)]"
                  : "text-zinc-900",
              )}
            >
              {title}

              {(children || comingSoon) && (
                <p
                  className={cn(
                    "line-clamp-2 text-sm font-light leading-tight",
                    backgroundImage
                      ? "relative z-[2] text-zinc-100 [text-shadow:0_1px_2px_rgba(0,0,0,0.6)]"
                      : "text-zinc-500",
                  )}
                >
                  {children}
                  {comingSoon && (
                    <>
                      {children ? (
                        <span className={backgroundImage ? "text-zinc-300" : "text-zinc-400"}>
                          {" "}
                          ·{" "}
                        </span>
                      ) : null}
                      <span
                        className={cn(
                          "font-medium",
                          backgroundImage ? "text-zinc-200" : "text-zinc-400",
                        )}
                      >
                        {comingSoonLabel}
                      </span>
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
          <div className={sharedClassName} aria-disabled="true">
            {inner}
          </div>
        ) : (
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
  const activeSection = sections.find((section) => section.id === activeMenu);

  if (!activeSection) return null;

  const gridLayout = activeSection.gridLayout || "grid w-full grid-cols-2 gap-3";

  return (
    <motion.div
      initial={{ scaleY: 0.95, opacity: 0 }}
      animate={{ scaleY: 1, opacity: 1 }}
      exit={{ scaleY: 0.95, opacity: 0 }}
      transition={{
        ease: [0.19, 1, 0.15, 1.01],
      }}
      className={cn(
        "absolute top-full left-0 z-40 w-full origin-top overflow-hidden rounded-b-2xl border border-t-0 border-zinc-200 bg-white/95 shadow-xl shadow-zinc-900/5 backdrop-blur-xl outline-none",
      )}
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

export function NavbarWithMenu({
  sections,
  navItems,
  logo,
  cta,
}: NavbarWithMenuProps) {
  const [activeDropdown, setActiveDropdown] = React.useState<string | null>(
    null,
  );
  const [hoveredItem, setHoveredItem] = React.useState<string | null>(null);

  const defaultNavItems = [
    { type: "dropdown", label: "Product", menu: "product" },
    { type: "dropdown", label: "Resources", menu: "resources" },
  ] as const;

  const items = navItems || defaultNavItems;

  const handleNavbarMouseLeave = () => {
    setActiveDropdown(null);
    setHoveredItem(null);
  };

  const handleMouseEnter = (menu: string) => {
    setActiveDropdown(menu);
    setHoveredItem(menu);
  };

  return (
    <div className="sticky top-0 z-50 flex w-full justify-center px-4 pt-3">
      {/* biome-ignore lint/a11y/noStaticElementInteractions: Hover container for menu, not interactive content */}
      <div
        className="relative mx-auto w-full max-w-3xl"
        onMouseLeave={handleNavbarMouseLeave}
      >
        <div
          className={cn(
            "navbar_content flex h-14 w-full items-center justify-between border px-3 shadow-sm backdrop-blur-md transition-all",
            activeDropdown
              ? "rounded-t-2xl border-b-0 border-zinc-200 bg-white"
              : "rounded-2xl border-zinc-200 bg-white/85",
          )}
        >
          <div className="flex items-center gap-2 px-1">
            {logo || (
              <span className="text-base font-semibold text-zinc-900">Mr.smARt</span>
            )}
          </div>

          <div className="hidden items-center gap-1 rounded-lg px-1 py-1 md:flex">
            {items.map((item) =>
              item.type === "link" ? (
                <a
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative flex h-9 cursor-pointer items-center rounded-xl px-4 py-2 text-sm transition-colors hover:bg-zinc-100",
                    hoveredItem === item.label.toLowerCase()
                      ? "text-zinc-900"
                      : "text-zinc-500 hover:text-zinc-900",
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
                  onMouseEnter={() => handleMouseEnter(item.menu)}
                >
                  {hoveredItem === item.menu && (
                    <div className="absolute inset-0 h-full w-full rounded-xl bg-zinc-100 transition-all duration-300 ease-out" />
                  )}
                  <div className="relative z-10 flex items-center gap-2">
                    <span>
                      {item.label.charAt(0).toUpperCase() + item.label.slice(1)}
                    </span>
                    <HugeiconsIcon
                      icon={ArrowDown01Icon}
                      size={17}
                      className={cn(
                        "transition duration-200",
                        hoveredItem === item.menu && "rotate-180",
                      )}
                    />
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
          {activeDropdown && (
            <NavbarMenu activeMenu={activeDropdown} sections={sections} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
