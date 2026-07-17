# AR 问卷 · Provenance 溯源 (Chrome extension)

A Manifest V3 Chrome extension that injects a **provenance sidebar** into
`docs.qq.com`. When a 接口人 opens a questionnaire-answer Tencent Doc directly
(outside our platform), the panel shows that question's evidence:

> **来源** (sources) · **原文引用** (quotes) · **推理** (reasoning) · **最终决策** (decision)

The extension reads only `window.location` — never the (canvas-rendered) doc
body — to resolve which question the open doc maps to, then fetches static
provenance JSON from the platform domain.

---

## How it works

1. The content script runs on every `https://docs.qq.com/*` page.
2. It extracts the **urlId** = the trailing path segment of the URL
   (`/aio/<id>`, `/doc/<id>`, `/doc/p/<id>`, … → `<id>`).
3. It fetches `<BASE>/provenance/index.json` and looks up the urlId.
   - **Not in the index** → renders nothing.
   - **In the index** → fetches `<BASE>/provenance/<urlId>.json` and renders the
     sidebar.
4. The panel is rendered inside its own **shadow DOM** so docs.qq.com styles
   can't leak in and ours can't leak out.
5. docs.qq.com is a SPA: history `pushState`/`replaceState` are patched and
   `popstate`/`hashchange` are watched (plus a 1s backstop poll) to re-evaluate
   when the open doc changes without a full reload.
6. Collapsed state is remembered in `chrome.storage.sync`. The toolbar icon
   toggles the panel.

If the matched doc has empty provenance arrays (evidence not generated yet), the
panel still shows the question + guidance + a **"证据待生成"** placeholder.

### BASE (where the JSON lives)

| Env  | BASE                          |
| ---- | ----------------------------- |
| prod | `https://ai.ar-tencent.cloud` (default) |
| dev  | `http://localhost:5173`       |

Override at runtime without rebuilding by setting a `chrome.storage.sync` key:

```js
// run in the extension's service-worker devtools console:
chrome.storage.sync.set({ provenanceBase: "http://localhost:5173" });
```

Both origins are already declared in `host_permissions`.

---

## Build

The repo ships a prebuilt `dist/` so you can load it unpacked with **no build
step**. To rebuild from source (TypeScript → bundled JS via esbuild):

```bash
cd extension
npm install      # one-time: esbuild + typescript + @types/chrome
npm run icons    # regenerate placeholder PNG icons (only if missing)
npm run build    # → dist/  (content.js, background.js, manifest.json, icons/)
```

Other scripts:

```bash
npm run watch      # rebuild on change (sourcemaps, unminified)
npm run typecheck  # tsc --noEmit
npm test           # unit-test url-id extraction + index lookup (node)
```

---

## Load unpacked

1. `npm run build` (or just use the committed `dist/`).
2. Open `chrome://extensions`.
3. Toggle **Developer mode** (top-right).
4. Click **Load unpacked** and select the **`extension/dist`** directory.
5. Open a questionnaire doc, e.g. <https://docs.qq.com/aio/DQUtpbGZPRG1kZ1dn>.
   The provenance sidebar appears on the right. Click the toolbar icon (or the
   panel's × / the collapsed rail) to toggle it.

> Loading `extension/` itself (not `dist/`) will not work — the manifest expects
> `content.js`/`background.js` next to it, which only exist in `dist/`.

---

## Files

```
extension/
├── manifest.json        # MV3 manifest (copied into dist/ at build)
├── package.json         # esbuild/tsc dev tooling
├── tsconfig.json
├── build.mjs            # minimal esbuild bundler → dist/
├── README.md
├── icons/               # placeholder PNGs (16/48/128), generated
├── scripts/
│   └── gen-icons.mjs    # zero-dep PNG icon generator
├── src/
│   ├── types.ts         # provenance contract (copy of web/src/types/provenance.ts)
│   ├── config.ts        # BASE + chrome.storage helpers
│   ├── urlId.ts         # pure: extractUrlId + lookupUrlId (unit-tested)
│   ├── fetcher.ts       # fetch + cache index.json / <urlId>.json
│   ├── icons.ts         # inline SVG strings + Tencent Cloud mark
│   ├── styles.ts        # shadow-DOM scoped CSS
│   ├── panel.ts         # the sidebar (shadow DOM, timeline sections)
│   ├── content.ts       # entrypoint: resolve URL → render, SPA watching
│   └── background.ts    # service worker: toolbar action → toggle
├── test/
│   └── urlId.test.mjs   # node unit test
└── dist/                # build output — THIS is what you load unpacked
```

## Keeping the data contract in sync

`src/types.ts` is a **hand-maintained copy** of
`web/src/types/provenance.ts`. The extension is a separate build artifact and
intentionally does not import across the `web/` boundary. If the contract
changes in `web/`, mirror it here.
