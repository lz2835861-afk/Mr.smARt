"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Clock3,
  Contact,
  FileText,
  LineChart,
  Map,
  Presentation,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import { useT } from "@/lib/i18n";
import { WORKSPACE_URL } from "@/lib/site";
import { LocaleToggle } from "@/components/locale-toggle";
import { RaisedButton } from "@/components/ui/raised-button";
import { NavbarWithMenu, type NavbarMenuSection } from "@/components/ui/navbar-menu";

/**
 * Global site navigation. Rendered once in app/layout.tsx so every route shares
 * the same bar. All copy comes from the i18n dictionary via useT().
 */
export function SiteNavbar() {
  const t = useT();
  const soon = t.nav.comingSoon;

  const navSections: NavbarMenuSection[] = [
    {
      id: "product",
      gridLayout: "grid w-full grid-cols-3 grid-rows-[5.5rem_5.5rem] gap-3",
      links: [
        {
          label: t.nav.productLinks.workspace.label,
          href: WORKSPACE_URL,
          external: true,
          description: t.nav.productLinks.workspace.desc,
          rowSpan: 2,
          backgroundImage: "/nav-ai-questionnaire.png",
          icon: <Sparkles className="h-5 w-5" />,
        },
        {
          label: t.nav.productLinks.features.label,
          href: "#",
          description: t.nav.productLinks.features.desc,
          rowSpan: 2,
          backgroundImage: "/nav-ar-crm.png",
          icon: <Contact className="h-5 w-5" />,
        },
        {
          label: t.nav.productLinks.marketInsight.label,
          href: "#",
          description: t.nav.productLinks.marketInsight.desc,
          icon: <TrendingUp className="h-5 w-5" />,
          comingSoon: true,
          comingSoonLabel: soon,
        },
        {
          label: t.nav.productLinks.rankingMonitor.label,
          href: "#",
          description: t.nav.productLinks.rankingMonitor.desc,
          icon: <LineChart className="h-5 w-5" />,
          comingSoon: true,
          comingSoonLabel: soon,
        },
      ],
    },
    {
      id: "ar-resources",
      gridLayout: "grid w-full grid-cols-3 grid-rows-[5.5rem_5.5rem] gap-3",
      links: [
        {
          label: t.nav.arResourceLinks.roadmap.label,
          href: "/roadmap",
          description: t.nav.arResourceLinks.roadmap.desc,
          rowSpan: 2,
          backgroundImage: "/nav-roadmap.png",
          icon: <Map className="h-5 w-5" />,
        },
        {
          label: t.nav.arResourceLinks.reportArchive.label,
          href: "https://docs.qq.com/slide/DY2NMbG9aQXBzY0VV?nlc=1",
          description: t.nav.arResourceLinks.reportArchive.desc,
          external: true,
          icon: <Presentation className="h-5 w-5" />,
        },
        {
          label: t.nav.arResourceLinks.inProgress.label,
          href: "/reports-in-progress",
          description: t.nav.arResourceLinks.inProgress.desc,
          icon: <Clock3 className="h-5 w-5" />,
        },
        {
          label: t.nav.arResourceLinks.placeholder3.label,
          href: "#",
          description: t.nav.arResourceLinks.placeholder3.desc,
          icon: <FileText className="h-5 w-5" />,
        },
        {
          label: t.nav.arResourceLinks.placeholder4.label,
          href: "#",
          description: t.nav.arResourceLinks.placeholder4.desc,
          icon: <FileText className="h-5 w-5" />,
        },
      ],
    },
  ];

  return (
    <NavbarWithMenu
      sections={navSections}
      navItems={[
        { type: "dropdown", label: t.nav.product, menu: "product" },
        { type: "dropdown", label: t.nav.arResources, menu: "ar-resources" },
      ]}
      logo={
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/logo.png"
            alt="AR Portal"
            width={32}
            height={32}
            priority
            className="h-8 w-8 rounded-lg object-cover shadow-md shadow-sky-500/25"
          />
          <span className="text-base font-semibold text-zinc-900">AR Portal</span>
        </Link>
      }
      cta={
        <div className="flex items-center gap-2 sm:gap-3">
          <LocaleToggle />
          <RaisedButton
            color="#00bbff"
            onClick={() => window.open(WORKSPACE_URL, "_blank", "noopener,noreferrer")}
          >
            {t.nav.requestAccess}
          </RaisedButton>
        </div>
      }
    />
  );
}
