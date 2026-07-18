# Mr.smARt

CSIG AR（Analyst Relations）团队工具集合仓库 —— 现整合 3 个可访问网页与 2 个后台工具，统一收录在本仓库的 `apps/` 目录下。门户的 `/#board` 是统一工作台，可在同一页面切换“问卷智能体”和“AI 填问卷协作台”。

| # | 子项目目录 | 对应线上地址 | 原始仓库 | 作用 |
|---|-----------|-------------|---------|------|
| 1 | [`apps/ar-portal-home`](apps/ar-portal-home) | https://www.ar-tencent.cloud/ | [AOMJ2PMP/ar-portal-home](https://github.com/AOMJ2PMP/ar-portal-home) | Mr.smARt 统一门户（Next.js）；`/#board` 内嵌并切换 #2 与 #3，另含报告牌桌、路线图和资源入口 |
| 2 | [`apps/ar-ai-questionnaire-platform`](apps/ar-ai-questionnaire-platform) | https://ai.ar-tencent.cloud/ | [AOMJ2PMP/ar-ai-questionnaire-platform](https://github.com/AOMJ2PMP/ar-ai-questionnaire-platform) | AR 问卷协作台（Vite + React + Supabase），负责问卷管理、证据审计、产品/AR 评审和提交 |
| 3 | [`apps/ar-questionnaire-assistant`](apps/ar-questionnaire-assistant) | https://ar-questionnaire-assistant.vercel.app/ | [Lyra-stack/mr-smart-ar](https://github.com/Lyra-stack/mr-smart-ar) | 问卷智能体（Vite + React + Vercel API），负责资料检索、知识库、来源发现和答案起草 |
| 4 | [`apps/wechat-feed-to-markdown`](apps/wechat-feed-to-markdown) | — | [AOMJ2PMP/wechat-feed-to-markdown](https://github.com/AOMJ2PMP/wechat-feed-to-markdown) | 公众号文章批量抓取 → Markdown 归档工具，供证据链检索本地公众号存档 |
| 5 | [`apps/analyst-questionnaire-suite-plugin`](apps/analyst-questionnaire-suite-plugin) | — | [AOMJ2PMP/analyst-questionnaire-suite-plugin](https://github.com/AOMJ2PMP/analyst-questionnaire-suite-plugin) | AI Agent Skill 插件包：runner / grounding / wording / quality-checker，供问卷答案生成流程调用 |

---

## 架构关系

```
                     ┌──────────────────────────────────┐
                     │ www.ar-tencent.cloud/#board      │
                     │ apps/ar-portal-home               │
                     │ Next.js 统一门户与嵌入式工作台     │
                     └───────────────┬──────────────────┘
                                     │ iframe 切换
                    ┌────────────────┴────────────────┐
                    ▼                                 ▼
       ┌──────────────────────────┐      ┌──────────────────────────┐
       │ ai.ar-tencent.cloud      │      │ ar-questionnaire-        │
       │ AI 填问卷协作台           │      │ assistant.vercel.app     │
       │ 评审 / 审计 / 提交         │      │ 检索 / 知识库 / 起草       │
       └─────────────┬────────────┘      └─────────────┬────────────┘
                     │ platform-export / API            │
                     └────────────────┬─────────────────┘
                                      ▼
                    ┌──────────────────────────────────┐
                    │ analyst-questionnaire-suite      │
                    │ grounding → wording → lint       │
                    └────────────────┬─────────────────┘
                                      │ WECHAT_ARCHIVE_PATHS
                                      ▼
                    ┌──────────────────────────────────┐
                    │ wechat-feed-to-markdown           │
                    │ 公众号 → Markdown 证据归档         │
                    └──────────────────────────────────┘
```

- **#1 门户** 是统一入口；`lib/site.ts` 集中管理两个嵌入应用地址，`components/landing/workspace-hub.tsx` 提供切换、刷新和新窗口回退。
- **#2 问卷协作台** 负责结构化问卷、证据审计与团队评审，独立部署并在门户中以 iframe 展示。
- **#3 问卷智能体** 负责检索、知识库与答案起草，源码完整收录在本仓库并保留独立 Vercel API。
- **#5 Skill 插件** 产出 `platform-export.json` 后可写入 **#2** 的 Supabase；**#4** 为其提供公众号证据归档。

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
│   ├── ar-questionnaire-assistant/         # ar-questionnaire-assistant.vercel.app
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

### 3. `apps/ar-questionnaire-assistant`（问卷智能体）

```bash
cd apps/ar-questionnaire-assistant
npm install
npm run dev      # http://localhost:5173（API 代理默认指向 localhost:3001）
```

生产环境由 `vercel.json` 构建，前端通过 `/api/*` 调用 Vercel Functions；本地如需完整 API，可另启 `server/` 中的 Express 服务。门户默认直接嵌入线上地址，因此只启动门户也能预览完整工作台。

### 4. `apps/wechat-feed-to-markdown`（公众号抓取工具）

```bash
cd apps/wechat-feed-to-markdown
pip install -e .
python scripts/sync.py --help
```

需要自建一套 `wewe-rss` 实例（微信读书账号扫码授权，token 约 30 天过期需续期），详见 [`apps/wechat-feed-to-markdown/README.md`](apps/wechat-feed-to-markdown/README.md)。抓取结果可配置进 `apps/analyst-questionnaire-suite-plugin` 的 `analyst-grounding` skill 的 `WECHAT_ARCHIVE_PATHS` 环境变量。

### 5. `apps/analyst-questionnaire-suite-plugin`（Skill 插件包）

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
| `apps/ar-portal-home` | Vercel，Root Directory = `apps/ar-portal-home`；统一预览入口为 `/#board` |
| `apps/ar-ai-questionnaire-platform` | Vercel，Root Directory = `apps/ar-ai-questionnaire-platform/web` |
| `apps/ar-questionnaire-assistant` | Vercel，Root Directory = `apps/ar-questionnaire-assistant` |
| `apps/wechat-feed-to-markdown` | 本地/内部服务器定时任务（`scripts/daily_sync.py`），非 Web 部署 |
| `apps/analyst-questionnaire-suite-plugin` | 本地安装到 AI Agent，非 Web 部署 |

---

## 注意事项

- `.env*`、`.vercel`、`node_modules`、Python 虚拟环境等已在根 `.gitignore` 中统一忽略，各子项目原有的敏感配置（Supabase Key、Kimi/混元 API Key、微信读书授权 token 等）**不会**被提交，需要在各自部署环境中单独配置。
- 五个子项目原本独立维护，各自的 Git 提交历史未随本次整合迁移；如需追溯某个改动的历史，请参考上表中的原始仓库链接。
- 本仓库是"源码集合"，暂未建立跨子项目的统一构建/CI 流程；如需要，可后续在根目录补充 workspace 配置（pnpm workspaces / turborepo 等）。
