import {
  Sparkles, Contact, TrendingUp, LineChart,
  Map, Presentation, Clock3, FileText,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Icon } from "@iconify/react";
import { NavbarWithMenu, type NavbarMenuSection } from "@/components/navbar-menu";
import { RaisedButton } from "@/components/raised-button";

// Ported 1:1 from the Mr.smARt navbar hand-off. Notes on the port:
// - `motion/react` is used instead of `framer-motion` (this app ships `motion`).
// - Tile background images from the source repo are not in this repo, so the
//   tiles render in the icon variant. To enable image tiles, drop the PNGs into
//   web/public/ and add `backgroundImage: "/nav-*.png"` back to a link below.
const WORKSPACE_URL = "https://ai.ar-tencent.cloud/";

const navSections: NavbarMenuSection[] = [
  {
    id: "product",
    gridLayout: "grid w-full grid-cols-3 grid-rows-[5.5rem_5.5rem] gap-3",
    links: [
      { label: "AI questionnaire", href: "/",
        description: "Draft, cite & sign off MQ answers in one flow",
        rowSpan: 2, icon: <Sparkles className="h-5 w-5" /> },
      { label: "AR CRM", href: "#", description: "Track firms, contacts, briefings & cycles",
        rowSpan: 2, icon: <Contact className="h-5 w-5" /> },
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
      { label: "Roadmap", href: "#", description: "What we're building next",
        rowSpan: 2, icon: <Map className="h-5 w-5" /> },
      { label: "Research report archive", href: "#",
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
        <Link to="/" className="flex items-center gap-2.5">
          <span className="inline-flex size-8 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600 shadow-md shadow-sky-500/25">
            <Icon icon="gravity-ui:cloud" className="size-4" />
          </span>
          <span className="text-base font-semibold text-zinc-900">AR 问卷协作台</span>
        </Link>
      }
      cta={
        <RaisedButton color="#00bbff" onClick={() => window.open(WORKSPACE_URL, "_blank", "noopener,noreferrer")}>
          Request access
        </RaisedButton>
      }
    />
  );
}
