/**
 * All panel CSS, scoped inside the shadow root so docs.qq.com styles can't leak
 * in and ours can't leak out. Design mirrors web/src/components/ReasoningSheet.tsx
 * (timeline sections, accent blue, brand chips, emphasized decision card).
 */

export const PANEL_CSS = `
:host {
  all: initial;
}
* { box-sizing: border-box; }

.host-root {
  --accent: #2f6bff;
  --accent-weak: rgba(47, 107, 255, 0.10);
  --accent-weak2: rgba(47, 107, 255, 0.05);
  --fg: #1b1f26;
  --muted: #6b7280;
  --surface: #ffffff;
  --surface-2: #f5f6f8;
  --separator: #e4e6eb;
  --wechat: #07c160;

  position: fixed;
  top: 0;
  right: 0;
  height: 100vh;
  z-index: 2147483647;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC",
    "Microsoft YaHei", Roboto, Helvetica, Arial, sans-serif;
  color: var(--fg);
  font-size: 13px;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}

/* ---- collapsed tab (rail) ---- */
.rail {
  position: fixed;
  top: 96px;
  right: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 10px;
  background: var(--surface);
  border: 1px solid var(--separator);
  border-right: none;
  border-radius: 12px 0 0 12px;
  box-shadow: 0 6px 24px rgba(16, 24, 40, 0.12);
  cursor: pointer;
  writing-mode: vertical-rl;
  text-orientation: mixed;
  font-weight: 600;
  letter-spacing: 1px;
  font-size: 11px;
  color: var(--muted);
  user-select: none;
  transition: color 0.15s, box-shadow 0.15s;
}
.rail:hover { color: var(--accent); box-shadow: 0 8px 28px rgba(16, 24, 40, 0.18); }
.rail .dot {
  writing-mode: horizontal-tb;
  width: 7px; height: 7px; border-radius: 50%;
  background: var(--accent);
}

/* ---- panel ---- */
.panel {
  position: fixed;
  top: 0;
  right: 0;
  height: 100vh;
  width: 380px;
  max-width: 92vw;
  background: var(--surface);
  border-left: 1px solid var(--separator);
  box-shadow: -8px 0 30px rgba(16, 24, 40, 0.10);
  display: flex;
  flex-direction: column;
  transform: translateX(0);
  transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);
}
.panel.hidden { transform: translateX(102%); }

.head {
  padding: 18px 18px 14px;
  border-bottom: 1px solid var(--separator);
  flex-shrink: 0;
}
.head .eyebrow {
  display: flex; align-items: center; gap: 8px;
  font-size: 10.5px; font-weight: 700; letter-spacing: 1.4px;
  text-transform: uppercase; color: var(--muted);
}
.head .eyebrow .badge {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 2px 7px; border-radius: 999px;
  background: var(--accent-weak); color: var(--accent);
  letter-spacing: 0.6px;
}
.head .qmeta {
  margin-top: 9px;
  font-size: 11px; color: var(--muted);
  display: flex; gap: 6px; flex-wrap: wrap; align-items: center;
}
.head .qmeta .qid {
  font-weight: 700; color: var(--accent);
  background: var(--accent-weak); padding: 1px 7px; border-radius: 6px;
  font-variant-numeric: tabular-nums;
}
.head .qmeta .crumb { color: var(--muted); }
.head .title {
  margin-top: 8px;
  font-size: 14px; font-weight: 600; line-height: 1.45; color: var(--fg);
}
.head .close {
  position: absolute; top: 14px; right: 14px;
  width: 26px; height: 26px; border-radius: 8px;
  border: none; background: transparent; cursor: pointer;
  color: var(--muted); display: flex; align-items: center; justify-content: center;
  transition: background 0.15s, color 0.15s;
}
.head .close:hover { background: var(--surface-2); color: var(--fg); }
.head .close svg { width: 15px; height: 15px; }

.body {
  flex: 1; overflow-y: auto; padding: 16px 16px 28px;
}

.guidance {
  margin-bottom: 14px;
  border: 1px solid var(--separator);
  background: var(--surface-2);
  border-radius: 11px;
  padding: 10px 12px;
  font-size: 12px; line-height: 1.6; color: var(--muted);
}
.guidance .lbl {
  display: inline-block; margin-right: 7px;
  font-size: 10px; font-weight: 700; letter-spacing: 0.8px;
  color: var(--accent); background: var(--accent-weak);
  border-radius: 5px; padding: 1px 6px; vertical-align: middle;
}

.empty {
  border: 1px dashed var(--separator);
  border-radius: 12px;
  padding: 22px 16px;
  text-align: center;
  color: var(--muted);
  font-size: 12.5px;
}
.empty .em-icon {
  width: 34px; height: 34px; margin: 0 auto 8px;
  border-radius: 11px; background: var(--accent-weak); color: var(--accent);
  display: flex; align-items: center; justify-content: center;
}
.empty .em-icon svg { width: 18px; height: 18px; }
.empty strong { display: block; color: var(--fg); font-size: 13px; margin-bottom: 3px; }

/* ---- timeline sections ---- */
.section { display: flex; gap: 12px; }
.section .rail-col { flex-shrink: 0; display: flex; flex-direction: column; align-items: center; }
.section .rail-icon {
  width: 30px; height: 30px; border-radius: 10px;
  background: var(--accent-weak); color: var(--accent);
  display: flex; align-items: center; justify-content: center;
}
.section .rail-icon svg { width: 16px; height: 16px; }
.section .connector { flex: 1; width: 1px; min-height: 12px; background: var(--separator); margin: 4px 0; }
.section .content { min-width: 0; flex: 1; padding-bottom: 16px; }
.section.last .content { padding-bottom: 4px; }

.sec-head {
  display: flex; align-items: center; gap: 7px;
  width: 100%; padding: 4px 0 0; background: none; border: none;
  cursor: pointer; text-align: left; color: inherit;
}
.sec-head .stitle { font-size: 13px; font-weight: 600; color: var(--fg); }
.sec-head .count {
  font-size: 10.5px; font-weight: 600; color: var(--muted);
  background: var(--surface-2); border-radius: 999px; padding: 1px 7px;
  font-variant-numeric: tabular-nums;
}
.sec-head .chev { margin-left: auto; width: 14px; height: 14px; color: var(--muted); transition: transform 0.2s; }
.sec-head[aria-expanded="true"] .chev { transform: rotate(180deg); }

.sec-body { display: grid; grid-template-rows: 0fr; transition: grid-template-rows 0.28s ease; }
.sec-body.open { grid-template-rows: 1fr; }
.sec-body > .inner { overflow: hidden; }
.sec-body > .inner > .pad { padding-top: 10px; }

/* ---- sources ---- */
.src {
  display: flex; align-items: flex-start; gap: 10px;
  padding: 7px 9px; border-radius: 10px; text-decoration: none;
  color: inherit; transition: background 0.15s;
}
.src:hover { background: var(--surface-2); }
.src:hover .src-label { color: var(--accent); }
.src-label { display: block; font-size: 12.5px; line-height: 1.35; color: var(--fg); }
.src-kind {
  display: inline-block; margin-left: 6px;
  font-size: 9.5px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase;
  color: var(--muted); background: var(--surface-2);
  border: 1px solid var(--separator); border-radius: 5px; padding: 0 5px; vertical-align: middle;
}
.src-url { display: block; margin-top: 2px; font-size: 11px; color: var(--muted); word-break: break-all; }

.chip {
  flex-shrink: 0; width: 26px; height: 26px; border-radius: 8px;
  border: 1px solid var(--separator); background: var(--surface-2);
  display: flex; align-items: center; justify-content: center; overflow: hidden;
}
.chip svg { width: 15px; height: 15px; }
.chip.wechat { background: var(--wechat); border-color: transparent; }
.chip.wechat svg { width: 18px; height: 18px; color: #fff; }
.chip.tcloud { background: var(--surface-2); }

/* ---- quotes ---- */
.quotes-box {
  border: 1px solid var(--separator); border-radius: 12px;
  background: var(--surface-2); padding: 11px;
}
.quotes-box .qhead {
  display: flex; align-items: center; gap: 6px; margin-bottom: 8px;
  font-size: 11px; font-weight: 600; color: var(--muted);
}
.quotes-box .qhead svg { width: 12px; height: 12px; }
.quote {
  display: block; white-space: pre-wrap; text-decoration: none;
  border-left: 2px solid var(--separator);
  padding: 5px 11px; margin-bottom: 7px;
  font-size: 12px; line-height: 1.6; color: var(--fg);
  border-radius: 0 6px 6px 0; transition: border-color 0.15s, background 0.15s;
}
.quote:last-child { margin-bottom: 0; }
a.quote:hover { border-left-color: var(--accent); background: var(--accent-weak); }
.quote .qtag { font-weight: 600; color: var(--accent); }

/* ---- reasoning ---- */
.r-premise {
  margin-bottom: 10px; border: 1px solid var(--separator);
  background: var(--surface-2); border-radius: 10px;
  padding: 8px 11px; font-size: 12px; line-height: 1.6; color: var(--muted);
}
.r-premise .lbl, .r-step .badge {
  display: inline-block; font-size: 10px; font-weight: 700; letter-spacing: 0.8px;
  border-radius: 5px; padding: 1px 6px; vertical-align: middle;
}
.r-premise .lbl { margin-right: 7px; color: var(--accent); background: var(--accent-weak); }
.r-step { display: flex; gap: 10px; }
.r-step .num-col { flex-shrink: 0; display: flex; flex-direction: column; align-items: center; }
.r-step .num {
  width: 20px; height: 20px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 700;
  border: 1px solid var(--accent); color: var(--accent); background: var(--accent-weak);
}
.r-step.caveat .num { border-color: var(--separator); background: var(--surface-2); color: var(--muted); }
.r-step .line { flex: 1; width: 1px; min-height: 8px; background: var(--separator); margin: 3px 0; }
.r-step .txt {
  flex: 1; margin-bottom: 8px;
  border: 1px solid var(--separator); border-left: 2px solid transparent;
  border-radius: 10px; padding: 6px 11px;
  font-size: 12.5px; line-height: 1.6; color: var(--fg);
  transition: border-color 0.15s, background 0.15s;
}
.r-step .txt:hover { border-left-color: var(--accent); background: var(--accent-weak); }
.r-step.caveat .txt {
  border-style: dashed; color: var(--muted);
}
.r-step.caveat .badge { margin-left: 8px; color: var(--muted); background: var(--surface); border: 1px solid var(--separator); }

/* ---- decision ---- */
.decision {
  border: 1px solid rgba(47, 107, 255, 0.25);
  background: var(--accent-weak2);
  border-radius: 12px; padding: 11px 13px;
  font-size: 12.5px; line-height: 1.65; color: var(--fg);
  white-space: pre-wrap;
}

.foot {
  padding: 10px 16px; border-top: 1px solid var(--separator);
  font-size: 10.5px; color: var(--muted); flex-shrink: 0;
  display: flex; justify-content: space-between; align-items: center; gap: 8px;
}
.foot a { color: var(--accent); text-decoration: none; }
.foot a:hover { text-decoration: underline; }
`;
