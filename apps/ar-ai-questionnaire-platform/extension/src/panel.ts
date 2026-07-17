/**
 * The injected sidebar panel. Owns a single shadow-DOM host so docs.qq.com
 * styles can't leak in and ours can't leak out. Exposes a small imperative API
 * (mount / renderDoc / renderEmpty / hide / setCollapsed / destroy) that the
 * content script drives.
 *
 * Design mirrors web/src/components/ReasoningSheet.tsx: a PROVENANCE card with a
 * collapsible timeline of 来源 / 原文引用 / 推理 / 最终决策.
 */

import { getCollapsed, setCollapsed } from "./config";
import { ICON, TENCENT_CLOUD_SVG } from "./icons";
import { PANEL_CSS } from "./styles";
import type { ProvenanceDoc, ProvSource } from "./types";

const HOST_ID = "ar-provenance-host";

// ---------------------------------------------------------------------------
// small DOM helpers
// ---------------------------------------------------------------------------
function el(tag: string, cls?: string, html?: string): HTMLElement {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (html != null) n.innerHTML = html;
  return n;
}
function text(s: string): Text {
  return document.createTextNode(s);
}

// ---------------------------------------------------------------------------
// brand chips — same rules as the web app
// ---------------------------------------------------------------------------
type Brand = "wechat" | "tcloud" | "nvidia" | "web";
function brandOf(url: string): Brand {
  let host = "";
  try {
    host = new URL(url).hostname.toLowerCase();
  } catch {
    host = "";
  }
  if (host.includes("weixin.qq.com") || host.includes("mp.weixin")) return "wechat";
  if (host.endsWith("tencentcloud.com") || host.endsWith("cloud.tencent.com")) return "tcloud";
  if (host.includes("nvidia.")) return "nvidia";
  return "web";
}
function sourceChip(url: string): HTMLElement {
  const b = brandOf(url);
  if (b === "wechat") return el("span", "chip wechat", ICON.wechat);
  if (b === "tcloud") return el("span", "chip tcloud", TENCENT_CLOUD_SVG);
  return el("span", "chip", ICON.globe);
}

// ---------------------------------------------------------------------------
// reasoning parsing — ported from ReasoningSheet.parseReasoning
// ---------------------------------------------------------------------------
interface RStep {
  text: string;
  caveat: boolean;
}
function parseReasoning(input: string): { premise: string; steps: RStep[] } {
  let body = input.trim();
  let premise = "";
  const stop = body.search(/。/);
  const colon = body.search(/[：:]/);
  if (colon >= 0 && (stop < 0 || colon < stop)) {
    premise = body.slice(0, colon).trim();
    body = body.slice(colon + 1).trim();
  }
  const caveatRe = /未公开|未披露|不作|不声称|诚实|让渡|未覆盖|REVIEW|by AR/;
  const steps = body
    .split(/[；;。]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => ({ text: s, caveat: caveatRe.test(s) }));
  return { premise, steps };
}

// ---------------------------------------------------------------------------
// quote → source matching — ported from ReasoningSheet.matchQuotes
// ---------------------------------------------------------------------------
function matchSource(quote: string, sources: ProvSource[]): ProvSource | null {
  const m = quote.match(/^\s*\[([^\]]+)\]/);
  if (!m) return null;
  const tag = m[1];
  const date = (tag.match(/\d{4}-\d{2}-\d{2}/) || [])[0];
  const ascii = tag.toLowerCase().match(/[a-z0-9]{2,}/g) || [];
  const cjk = tag.match(/[一-龥]{2,}/g) || [];
  const escRe = (t: string) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  let best: ProvSource | null = null;
  let bestScore = 0;
  let tie = false;
  for (const s of sources) {
    const lab = (s.label + " " + s.url).toLowerCase();
    let score = 0;
    if (date && lab.includes(date)) score += 10;
    for (const t of ascii) if (new RegExp("\\b" + escRe(t) + "\\b").test(lab)) score += t.length >= 4 ? 2 : 1;
    for (const c of cjk) if (s.label.includes(c)) score += 1;
    if (score > bestScore) {
      bestScore = score;
      best = s;
      tie = false;
    } else if (score === bestScore && score > 0) {
      tie = true;
    }
  }
  return bestScore >= 1 && !tie ? best : null;
}
function tagHead(quote: string): string {
  const m = quote.match(/^\s*\[\s*([^\s\]]+)/);
  return m ? m[1].toLowerCase() : "";
}
function matchQuotes(quotes: string[], sources: ProvSource[]): (ProvSource | null)[] {
  const direct = quotes.map((q) => matchSource(q, sources));
  const byHead = new Map<string, ProvSource | null>();
  quotes.forEach((q, i) => {
    const hit = direct[i];
    const head = tagHead(q);
    if (!hit || !head) return;
    if (!byHead.has(head)) byHead.set(head, hit);
    else if (byHead.get(head) !== hit) byHead.set(head, null);
  });
  return quotes.map((q, i) => direct[i] ?? (tagHead(q) ? byHead.get(tagHead(q)) ?? null : null));
}

/** Append a quote's text into `parent`, highlighting a leading [tag]. */
function quoteText(parent: HTMLElement, q: string) {
  const m = q.match(/^(\s*\[[^\]]+\])([\s\S]*)$/);
  if (!m) {
    parent.appendChild(text(q));
    return;
  }
  const tagSpan = el("span", "qtag");
  tagSpan.appendChild(text(m[1]));
  parent.appendChild(tagSpan);
  parent.appendChild(text(m[2]));
}

// ---------------------------------------------------------------------------
// collapsible timeline section
// ---------------------------------------------------------------------------
function section(opts: {
  icon: string;
  title: string;
  count?: number;
  defaultOpen?: boolean;
  last?: boolean;
  build: (inner: HTMLElement) => void;
}): HTMLElement {
  const root = el("div", "section" + (opts.last ? " last" : ""));

  const railCol = el("div", "rail-col");
  railCol.appendChild(el("span", "rail-icon", opts.icon));
  if (!opts.last) railCol.appendChild(el("span", "connector"));
  root.appendChild(railCol);

  const content = el("div", "content");
  const head = el("button", "sec-head") as HTMLButtonElement;
  head.type = "button";
  head.appendChild(el("span", "stitle", opts.title));
  if (opts.count != null) head.appendChild(el("span", "count", String(opts.count)));
  head.appendChild(el("span", "chev", ICON.chevron));
  content.appendChild(head);

  const bodyWrap = el("div", "sec-body");
  const inner = el("div", "inner");
  const pad = el("div", "pad");
  inner.appendChild(pad);
  bodyWrap.appendChild(inner);
  content.appendChild(bodyWrap);
  opts.build(pad);

  const setOpen = (open: boolean) => {
    head.setAttribute("aria-expanded", String(open));
    bodyWrap.classList.toggle("open", open);
  };
  setOpen(!!opts.defaultOpen);
  head.addEventListener("click", () => setOpen(head.getAttribute("aria-expanded") !== "true"));

  root.appendChild(content);
  return root;
}

// ---------------------------------------------------------------------------
// Panel
// ---------------------------------------------------------------------------
export class ProvenancePanel {
  private host: HTMLElement;
  private shadow: ShadowRoot;
  private root: HTMLElement;
  private rail: HTMLElement;
  private panel: HTMLElement | null = null;
  private collapsed = false;

  constructor() {
    const existing = document.getElementById(HOST_ID);
    if (existing) existing.remove();

    this.host = el("div");
    this.host.id = HOST_ID;
    this.shadow = this.host.attachShadow({ mode: "open" });

    const style = document.createElement("style");
    style.textContent = PANEL_CSS;
    this.shadow.appendChild(style);

    this.root = el("div", "host-root");
    this.shadow.appendChild(this.root);

    this.rail = el("div", "rail");
    this.rail.appendChild(el("span", "dot"));
    this.rail.appendChild(text("PROVENANCE"));
    this.rail.style.display = "none";
    this.rail.addEventListener("click", () => this.toggle());
    this.root.appendChild(this.rail);

    document.documentElement.appendChild(this.host);
  }

  async mount() {
    this.collapsed = await getCollapsed();
  }

  /** Flip collapsed state. Public so the toolbar action can drive it. */
  toggle() {
    this.setCollapsed(!this.collapsed);
  }

  /** Whether a panel is currently rendered (a doc matched). */
  hasPanel(): boolean {
    return this.panel != null;
  }

  setCollapsed(collapsed: boolean) {
    this.collapsed = collapsed;
    void setCollapsed(collapsed);
    if (!this.panel) {
      this.rail.style.display = "none";
      return;
    }
    this.panel.classList.toggle("hidden", collapsed);
    this.rail.style.display = collapsed ? "flex" : "none";
  }

  /** Tear down the visible panel (e.g. navigated to a doc with no provenance). */
  hide() {
    if (this.panel) {
      this.panel.remove();
      this.panel = null;
    }
    this.rail.style.display = "none";
  }

  destroy() {
    this.host.remove();
  }

  // -- empty / placeholder state (question known, evidence not yet generated) --
  renderEmpty(doc: ProvenanceDoc) {
    const body = this.beginPanel(doc);
    const empty = el("div", "empty");
    empty.appendChild(el("div", "em-icon", ICON.shield));
    empty.appendChild(el("strong", undefined, "证据待生成"));
    empty.appendChild(
      text("该问题的来源 / 原文引用 / 推理 / 决策尚未生成。请先在平台上运行 grounding，生成后此处会自动展示。"),
    );
    body.appendChild(empty);
    this.finishPanel(doc);
  }

  // -- full provenance --
  renderDoc(doc: ProvenanceDoc) {
    const p = doc.provenance;
    const hasSources = p.sources?.length > 0;
    const hasQuotes = p.quotes?.length > 0;
    const hasReasoning = !!p.reasoning?.trim();
    const hasDecision = !!p.decision?.trim();

    if (!hasSources && !hasQuotes && !hasReasoning && !hasDecision) {
      this.renderEmpty(doc);
      return;
    }

    const body = this.beginPanel(doc);

    const order = (["sources", "quotes", "reasoning", "decision"] as const).filter((k) =>
      k === "sources" ? hasSources : k === "quotes" ? hasQuotes : k === "reasoning" ? hasReasoning : hasDecision,
    );
    const lastKey = order[order.length - 1];

    if (hasSources) {
      body.appendChild(
        section({
          icon: ICON.link,
          title: "来源",
          count: p.sources.length,
          defaultOpen: true,
          last: lastKey === "sources",
          build: (pad) => {
            p.sources.forEach((s) => {
              const a = el("a", "src") as HTMLAnchorElement;
              a.href = s.url;
              a.target = "_blank";
              a.rel = "noreferrer";
              a.appendChild(sourceChip(s.url));
              const meta = el("span");
              const label = el("span", "src-label");
              label.appendChild(text(s.label || s.url));
              if (s.kind) label.appendChild(el("span", "src-kind", s.kind));
              meta.appendChild(label);
              meta.appendChild(el("span", "src-url", s.url));
              a.appendChild(meta);
              pad.appendChild(a);
            });
          },
        }),
      );
    }

    if (hasQuotes) {
      const matched = matchQuotes(p.quotes, p.sources);
      body.appendChild(
        section({
          icon: ICON.quote,
          title: "原文引用",
          count: p.quotes.length,
          last: lastKey === "quotes",
          build: (pad) => {
            const box = el("div", "quotes-box");
            box.appendChild(el("div", "qhead", ICON.quote + "<span>原文 · 逐字引用</span>"));
            p.quotes.forEach((q, i) => {
              const src = matched[i];
              if (src) {
                const a = el("a", "quote") as HTMLAnchorElement;
                a.href = src.url;
                a.target = "_blank";
                a.rel = "noreferrer";
                a.title = src.label;
                quoteText(a, q);
                box.appendChild(a);
              } else {
                const bq = el("blockquote", "quote");
                quoteText(bq, q);
                box.appendChild(bq);
              }
            });
            pad.appendChild(box);
          },
        }),
      );
    }

    if (hasReasoning) {
      body.appendChild(
        section({
          icon: ICON.bulb,
          title: "推理",
          defaultOpen: true,
          last: lastKey === "reasoning",
          build: (pad) => {
            const { premise, steps } = parseReasoning(p.reasoning);
            if (premise) {
              const pre = el("div", "r-premise");
              pre.appendChild(el("span", "lbl", "前提"));
              pre.appendChild(text(premise));
              pad.appendChild(pre);
            }
            let n = 0;
            steps.forEach((st, i) => {
              const row = el("div", "r-step" + (st.caveat ? " caveat" : ""));
              const numCol = el("div", "num-col");
              const num = el("span", "num", st.caveat ? ICON.info : String(++n));
              numCol.appendChild(num);
              if (i !== steps.length - 1) numCol.appendChild(el("span", "line"));
              row.appendChild(numCol);
              const txt = el("div", "txt");
              txt.appendChild(text(st.text));
              if (st.caveat) txt.appendChild(el("span", "badge", "边界"));
              row.appendChild(txt);
              pad.appendChild(row);
            });
          },
        }),
      );
    }

    if (hasDecision) {
      body.appendChild(
        section({
          icon: ICON.check,
          title: "最终决策",
          defaultOpen: true,
          last: lastKey === "decision",
          build: (pad) => {
            const d = el("div", "decision");
            d.appendChild(text(p.decision));
            pad.appendChild(d);
          },
        }),
      );
    }

    this.finishPanel(doc);
  }

  // -- shared panel chrome -------------------------------------------------
  private beginPanel(doc: ProvenanceDoc): HTMLElement {
    if (this.panel) this.panel.remove();
    const panel = el("div", "panel");

    // head
    const head = el("div", "head");
    const eyebrow = el("div", "eyebrow");
    eyebrow.appendChild(el("span", "badge", `${ICON.shield}<span>PROVENANCE</span>`));
    eyebrow.appendChild(text("生成式 AI 能力栈"));
    head.appendChild(eyebrow);

    const close = el("button", "close", ICON.close) as HTMLButtonElement;
    close.type = "button";
    close.title = "收起";
    close.setAttribute("aria-label", "收起面板");
    close.addEventListener("click", () => this.setCollapsed(true));
    head.appendChild(close);

    const qmeta = el("div", "qmeta");
    if (doc.questionId) qmeta.appendChild(el("span", "qid", doc.questionId));
    const crumb = [doc.dimension, doc.section, doc.subsection].filter(Boolean).join(" · ");
    if (crumb) qmeta.appendChild(el("span", "crumb", crumb));
    head.appendChild(qmeta);

    if (doc.question) {
      const title = el("div", "title");
      title.appendChild(text(doc.question));
      head.appendChild(title);
    }
    panel.appendChild(head);

    // body
    const body = el("div", "body");
    if (doc.guidance) {
      const g = el("div", "guidance");
      g.appendChild(el("span", "lbl", "评估指引"));
      g.appendChild(text(doc.guidance));
      body.appendChild(g);
    }
    panel.appendChild(body);

    this.panel = panel;
    return body;
  }

  private finishPanel(doc: ProvenanceDoc) {
    const panel = this.panel;
    if (!panel) return;

    const foot = el("div", "foot");
    const left = el("span");
    const when = doc.generatedAt ? new Date(doc.generatedAt) : null;
    left.appendChild(
      text(when && !isNaN(when.getTime()) ? `生成于 ${when.toLocaleDateString("zh-CN")}` : "AR · Provenance"),
    );
    foot.appendChild(left);
    if (doc.docUrl) {
      const a = el("a") as HTMLAnchorElement;
      a.href = doc.docUrl;
      a.target = "_blank";
      a.rel = "noreferrer";
      a.appendChild(text("打开原文档"));
      foot.appendChild(a);
    }
    panel.appendChild(foot);

    this.root.appendChild(panel);
    // apply current collapsed state
    panel.classList.toggle("hidden", this.collapsed);
    this.rail.style.display = this.collapsed ? "flex" : "none";
  }
}
