# AR 问卷协作台 · Analyst Questionnaire Workspace

腾讯云 AR 团队与 CSIG 产品协作填写分析师问卷（Omdia / Gartner / Forrester / IDC）的 Web 平台。产品侧专注**中文填写**，AR 侧负责**英文审稿与提交**；支持多人实时同步、工作流状态、字段评论与 Kimi AI 助手。

在线演示部署在 Vercel；本地开发默认 `http://localhost:5173`。

---

## 功能概览

| 能力 | 说明 |
|------|------|
| **多问卷** | 内置 Omdia RFI 2026、Gartner Container MQ 2026；注册表扩展新问卷无需改壳层代码 |
| **三栏协作** | 左导航（中文题目标题 + 状态色条 + 负责人头像）· 中单题填写 · 右 AI 助手（可拖拽调宽） |
| **中文填写 / 英文审稿** | 主视图只编辑中文字段；顶栏切换「英文审稿」单独润色 EN 提交稿 |
| **云端同步** | Supabase Postgres + Realtime，字段级 upsert，last-write-wins；未配置时降级 localStorage |
| **工作流状态** | `NOT STARTED` → `AI DRAFTED` → `PRODUCT REVIEW` → `KEVIN REVIEW` → `READY` → `SUBMITTED` / `BLOCKED` |
| **我的待办** | 按角色过滤待处理题目（产品 / Kevin / AR） |
| **评论** | 字段级线程评论，Supabase Realtime 推送 |
| **AI 助手** | Kimi（Moonshot）经 `/api/ai` 服务端代理；润色 / 翻译→EN / 起草 / 自定义；产出只进草稿，需手动「应用」 |
| **证据链** | 每题可展开 Reasoning / sources，对接 analyst-grounding 审计格式 |
| **导入流水线** | `pnpm import-skill` 读取 skill 导出 bundle，按状态守护冲突后写入 Supabase |

---

## 技术栈

- **前端**：React 19 · TypeScript · Vite 8 · Tailwind CSS v4 · HeroUI Pro · GAIA Composer
- **后端 / 数据**：Supabase（Auth · Postgres · Realtime · RLS）
- **AI**：Moonshot Kimi API（Vercel serverless `api/ai.ts`，密钥仅服务端）
- **部署**：Vercel（`web/vercel.json`）

---

## 快速开始

### 1. 克隆与安装

```bash
git clone https://github.com/AOMJ2PMP/omdia-rfi-cloud-for-china-enterprise-2026.git
cd omdia-rfi-cloud-for-china-enterprise-2026/web

cp .env.local.example .env.local
# 编辑 .env.local：至少填入 HEROUI_AUTH_TOKEN（HeroUI Pro 组件拉取）

pnpm install
pnpm dev
```

浏览器打开 **http://localhost:5173**。未配置 Supabase 时以**本地模式**运行（答案存 localStorage）。

### 2. 配置 Supabase（团队协作）

完整步骤见 [`web/SETUP.md`](web/SETUP.md)。摘要：

1. 创建 Supabase 项目（建议 Region：Singapore）
2. 在 SQL Editor 依次执行：
   - [`web/supabase/schema.sql`](web/supabase/schema.sql) — 答案表 + RLS
   - [`web/supabase/platform-layer.sql`](web/supabase/platform-layer.sql) — 工作流元数据 `answer_meta`
   - [`web/supabase/comments.sql`](web/supabase/comments.sql) — 字段评论
3. 将 `VITE_SUPABASE_URL` 与 `VITE_SUPABASE_ANON_KEY` 写入 `web/.env.local`
4. 重启 `pnpm dev`，用团队邀请名登录（见下方环境变量）

### 3. 配置 AI 助手（可选）

在 `web/.env.local` 增加（**不要**加 `VITE_` 前缀）：

```bash
KIMI_API_KEY=sk-...
# KIMI_MODEL=kimi-k2-0905-preview   # 可选，默认 moonshot-v1-8k
```

本地开发时 Vite 中间件会把 `/api/ai` 代理到 Kimi；生产环境走 Vercel Function。

---

## 环境变量

| 变量 | 必填 | 说明 |
|------|------|------|
| `HEROUI_AUTH_TOKEN` | 安装时 | HeroUI Pro 私有组件拉取（`install.sh` / `pnpm install`） |
| `VITE_SUPABASE_URL` | 协作时 | Supabase 项目 URL |
| `VITE_SUPABASE_ANON_KEY` | 协作时 | Supabase anon key（公开，安全靠 RLS） |
| `VITE_INVITE_NAMES` | 否 | 邀请登录白名单，逗号分隔，如 `meen,april,lux,kevin` |
| `VITE_ROLE_MAP` | 否 | 名字→角色，如 `kevin:kevin,lux:ar`（`product` / `kevin` / `ar`） |
| `KIMI_API_KEY` | AI 时 | 服务端 Kimi API 密钥 |
| `KIMI_MODEL` | 否 | 模型覆盖 |

模板文件：[`web/.env.example`](web/.env.example) · [`web/.env.local.example`](web/.env.local.example)

---

## 常用命令

在 `web/` 目录下执行：

```bash
pnpm dev          # 本地开发 http://localhost:5173
pnpm build        # 生产构建
pnpm lint         # ESLint
pnpm sync-defaults    # 将代码内 defaultValue 同步到 Supabase
pnpm import-skill -- --file scripts/sample-platform-export.json   # dry-run 导入
pnpm import-skill -- --file bundle.json --apply                    # 实际写入
```

---

## 项目结构

```
.
├── README.md                 # 本文件
├── docs/
│   └── platform-handoff.md   # 平台化架构与 skill 对齐说明
└── web/                      # Vite 应用（Vercel Root Directory）
    ├── api/                  # Vercel serverless（Kimi 代理）
    ├── src/
    │   ├── App.tsx           # 三栏壳层、问卷切换、路由
    │   ├── data/             # 问卷定义（questionnaire.ts / gartner-container.ts）
    │   ├── components/       # UI（AiAssistant、QuestionDetail、ResizableWorkspace…）
    │   └── hooks/            # useRemoteAnswers、useAnswerMeta、useAi、useComments…
    ├── supabase/             # SQL 迁移脚本
    ├── scripts/              # sync-defaults、import-skill-output
    ├── SETUP.md              # Supabase + Vercel 部署详解
    └── vercel.json
```

### 新增一份问卷

1. 在 `web/src/data/` 新建 `<name>.ts`，导出 `Section[]`
2. 在 `web/src/data/questionnaires.ts` 的 `QUESTIONNAIRES` 注册一项（`id` / `storageKey` / `sections`）
3. 无需修改 `App.tsx`

---

## 部署（Vercel）

1. 连接 GitHub 仓库，**Root Directory** 设为 `web`
2. 环境变量：`VITE_SUPABASE_*`、`HEROUI_AUTH_TOKEN`、`KIMI_API_KEY`（及可选 `KIMI_MODEL`）
3. Supabase → Authentication → URL Configuration：Site URL 与 Redirect URLs 指向 Vercel 域名

详见 [`web/SETUP.md`](web/SETUP.md) 第 5 步。

---

## 与 Analyst Skill 流水线

本地可用 [analyst-questionnaire-suite](https://github.com/) 的 skill 跑 grounding → wording → lint，导出 JSON bundle 后由 `import-skill` 灌入平台。状态机与 `[CITED]` / `[REVIEW: product]` 等审计标记与平台 `answer_meta` / `reasoning` 字段对齐。

架构与冲突策略详见 [`docs/platform-handoff.md`](docs/platform-handoff.md)。

---

## 许可与访问

内部 AR / 产品协作工具。Supabase RLS 默认限制 `@tencent.com` 邮箱（可在 `schema.sql` 修改）。请勿将 `KIMI_API_KEY` 或 `service_role` key 提交到 Git。
