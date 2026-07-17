# Mr.smARt

CSIG AR（Analyst Relations）团队工具集合仓库 —— 由 4 个原本独立维护的项目整合而成，统一收录在本仓库的 `apps/` 目录下，各子项目保持原有目录结构与 Git 历史无关联（历史保留在各自的原始仓库）。

| # | 子项目目录 | 对应线上地址 | 原始仓库 | 作用 |
|---|-----------|-------------|---------|------|
| 1 | [`apps/ar-portal-home`](apps/ar-portal-home) | https://www.ar-tencent.cloud/ | [AOMJ2PMP/ar-portal-home](https://github.com/AOMJ2PMP/ar-portal-home) | Mr.smARt 门户首页（Next.js 落地页），展示产品定位、进行中的分析师报告牌桌、路线图共建投票板 |
| 2 | [`apps/ar-ai-questionnaire-platform`](apps/ar-ai-questionnaire-platform) | http://ai.ar-tencent.cloud/ | [AOMJ2PMP/ar-ai-questionnaire-platform](https://github.com/AOMJ2PMP/ar-ai-questionnaire-platform) | AR 问卷协作台（Vite + React + Supabase），产品/AR 团队协作填写 Omdia / Gartner / Forrester / IDC 等分析师问卷 |
| 3 | [`apps/wechat-feed-to-markdown`](apps/wechat-feed-to-markdown) | — | [AOMJ2PMP/wechat-feed-to-markdown](https://github.com/AOMJ2PMP/wechat-feed-to-markdown) | 公众号文章批量抓取 → Markdown 归档工具（基于自建 wewe-rss + Camoufox 反检测），供 #2 的 `analyst-grounding` 证据链检索本地公众号存档 |
| 4 | [`apps/analyst-questionnaire-suite-plugin`](apps/analyst-questionnaire-suite-plugin) | — | [AOMJ2PMP/analyst-questionnaire-suite-plugin](https://github.com/AOMJ2PMP/analyst-questionnaire-suite-plugin) | AI Agent Skill 插件包：`analyst-questionnaire-runner`（编排状态机）/ `analyst-grounding`（证据链标注 `[CITED]/[INFERRED]/[REVIEW]`）/ `analyst-wording`（分析师措辞与中英转写）/ `answer-quality-checker`（BLOCK/ERROR/WARN 质量闸门），供 #2 的问卷答案生成流程调用 |

---

## 架构关系

```
                         ┌─────────────────────────────┐
                         │   www.ar-tencent.cloud       │
                         │   apps/ar-portal-home        │
                         │   (Next.js 门户首页)          │
                         └──────────────┬───────────────┘
                                        │ 跳转 / 链接
                                        ▼
                         ┌─────────────────────────────┐
                         │   ai.ar-tencent.cloud        │
                         │   apps/ar-ai-questionnaire-  │
                         │   platform/web (Vite+React)  │
                         │   问卷协作台 + Supabase       │
                         └──────────────┬───────────────┘
                                        │ 本地 skill 流水线产出
                                        │ (grounding → wording → lint → bundle.json)
                                        │ 通过 pnpm import-skill 灌入
                         ┌──────────────┴───────────────┐
                         │  apps/analyst-questionnaire-  │
                         │  suite-plugin (AI skills)     │
                         └──────────────┬───────────────┘
                                        │ WECHAT_ARCHIVE_PATHS
                                        ▼
                         ┌─────────────────────────────┐
                         │  apps/wechat-feed-to-markdown │
                         │  (公众号 → Markdown 归档)      │
                         └─────────────────────────────┘
```

- **#1 门户** 是访问入口，`lib/site.ts` 中 `WORKSPACE_URL` 指向 **#2** 的线上地址。
- **#2 问卷协作台** 是核心工作台，前端独立部署（Vercel Root Directory = `apps/ar-ai-questionnaire-platform/web`）。
- **#4 Skill 插件** 不在网站里运行，是开发者本地用 AI Agent（Claude Code / CodeBuddy 等）执行的技能包，产出 `platform-export.json` bundle 后通过 `pnpm import-skill` 写入 **#2** 的 Supabase。
- **#3 公众号抓取工具** 独立运行（Python + wewe-rss + Camoufox），产出的 Markdown 归档供 **#4** 的 `analyst-grounding` skill 作为公众号证据来源。

---

## 目录结构

```
.
├── README.md                              # 本文件
├── apps/
│   ├── ar-portal-home/                    # www.ar-tencent.cloud（Next.js）
│   ├── ar-ai-questionnaire-platform/       # ai.ar-tencent.cloud
│   │   ├── web/                           #   ├─ Vite 应用本体（Vercel Root Directory 指向此处）
│   │   ├── docs/                          #   ├─ 平台化架构说明
│   │   ├── extension/                     #   └─ 浏览器插件（辅助抓取素材）
│   │   └── README.md
│   ├── wechat-feed-to-markdown/            # 公众号 → Markdown 抓取工具（Python）
│   └── analyst-questionnaire-suite-plugin/ # AI Agent Skill 插件包
└── .gitignore
```

---

## 各子项目快速上手

### 1. `apps/ar-portal-home`（门户首页）

```bash
cd apps/ar-portal-home
npm install
npm run dev      # http://localhost:3000
```

技术栈：Next.js 16 + React 19 + Tailwind CSS v4。详见 [`apps/ar-portal-home/README.md`](apps/ar-portal-home/README.md)。

### 2. `apps/ar-ai-questionnaire-platform`（问卷协作台）

```bash
cd apps/ar-ai-questionnaire-platform/web
cp .env.local.example .env.local   # 填入 Supabase / Kimi Key 等
pnpm install
pnpm dev          # http://localhost:5173
```

技术栈：React 19 + Vite 8 + Tailwind v4 + HeroUI Pro + Supabase（Postgres/Realtime）+ Kimi AI（Vercel serverless 代理）。详见 [`apps/ar-ai-questionnaire-platform/README.md`](apps/ar-ai-questionnaire-platform/README.md) 与 [`apps/ar-ai-questionnaire-platform/web/SETUP.md`](apps/ar-ai-questionnaire-platform/web/SETUP.md)。

**新增一份问卷**：
1. 在 `apps/ar-ai-questionnaire-platform/web/src/data/` 新建 `<name>.ts`，导出 `Section[]`
2. 在 `apps/ar-ai-questionnaire-platform/web/src/data/questionnaires.ts` 的 `QUESTIONNAIRES` 数组注册一项（`id` / `storageKey` / `sections`）
3. 无需修改 `App.tsx`

已内置：Omdia RFI 2026、Gartner Container MQ 2026、Omdia Sovereign Cloud 2026（供公共主权云 Market Radar 供应商问卷使用）。

### 3. `apps/wechat-feed-to-markdown`（公众号抓取工具）

```bash
cd apps/wechat-feed-to-markdown
pip install -e .
python scripts/sync.py --help
```

需要自建一套 `wewe-rss` 实例（微信读书账号扫码授权，token 约 30 天过期需续期），详见 [`apps/wechat-feed-to-markdown/README.md`](apps/wechat-feed-to-markdown/README.md)。抓取结果可配置进 `apps/analyst-questionnaire-suite-plugin` 的 `analyst-grounding` skill 的 `WECHAT_ARCHIVE_PATHS` 环境变量。

### 4. `apps/analyst-questionnaire-suite-plugin`（Skill 插件包）

不是 Web 应用，是给 AI Agent（Claude Code / CodeBuddy / Codex 等）安装使用的技能包：

```bash
cd apps/analyst-questionnaire-suite-plugin
bash scripts/install-claude-skills.sh   # 安装到 Claude Code
# 或
bash scripts/install-skills.sh          # 通用安装脚本
```

包含 4 个 skill：
- `analyst-questionnaire-runner` — 编排 + 状态机，驱动整份问卷生成流程
- `analyst-grounding` — 证据链标注，产出 `[CITED]` / `[INFERRED]` / `[REVIEW: product]` / `[REVIEW: Kevin]`
- `analyst-wording` — 分析师措辞规范（如 Omdia/Roy Illsley voice）+ 中英转写
- `answer-quality-checker` — 质量 lint 闸门（BLOCK / ERROR / WARN 三级）

跑完流水线后导出 `platform-export.json`，用 `apps/ar-ai-questionnaire-platform/web` 的 `pnpm import-skill -- --file bundle.json --apply` 灌入 Supabase。

---

## 部署

各子应用仍按各自方式独立部署（本仓库整合的是源码，不是单一构建产物）：

| 子项目 | 部署方式 |
|-------|---------|
| `apps/ar-portal-home` | Vercel，Root Directory = `apps/ar-portal-home` |
| `apps/ar-ai-questionnaire-platform` | Vercel，Root Directory = `apps/ar-ai-questionnaire-platform/web` |
| `apps/wechat-feed-to-markdown` | 本地/内部服务器定时任务（`scripts/daily_sync.py`），非 Web 部署 |
| `apps/analyst-questionnaire-suite-plugin` | 本地安装到 AI Agent，非 Web 部署 |

---

## 注意事项

- `.env*`、`.vercel`、`node_modules`、Python 虚拟环境等已在根 `.gitignore` 中统一忽略，各子项目原有的敏感配置（Supabase Key、Kimi/混元 API Key、微信读书授权 token 等）**不会**被提交，需要在各自部署环境中单独配置。
- 四个子项目原本是独立仓库，各自的 Git 提交历史未随本次整合迁移；如需追溯某个改动的历史，请参考上表中的原始仓库链接。
- 本仓库是"源码集合"，暂未建立跨子项目的统一构建/CI 流程；如需要，可后续在根目录补充 workspace 配置（pnpm workspaces / turborepo 等）。
