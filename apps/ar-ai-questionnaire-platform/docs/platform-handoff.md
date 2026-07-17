# 平台化交接文档 · Analyst Questionnaire Platform

> 把现有「AR 内部问卷工具」演进成「CSIG 产品部门 × AR 协作平台」。主用户 = 产品填写者。
> 本文是上下文压缩后的单点恢复入口。详细设计在 canvases/。

## 1. 现状（被改造对象）

- `web/` — React 19 + Vite + HeroUI Pro + Supabase 的协作填写应用。
- 数据即代码：`web/src/data/questionnaire.ts`(Omdia) + `gartner-container.ts` + 注册表 `questionnaires.ts`。
- 答案模型：每 field 带 `defaultValue(zh)` / `defaultValueEn` / `status` / `reasoning`(证据链)。
- 同步：`hooks/useRemoteAnswers.ts` — Supabase realtime，逐字段 last-write-wins，localStorage 兜底，field_id 命名空间（Gartner 用 `gc_` 前缀）。
- 当前两份问卷：Omdia RFI 2026（7 章 25 题 48 字段）、Gartner Container MQ（2 章 14 题）。

## 2. 已锁定的决定

1. **分派粒度 = 按个人**（多 BU 题靠字段级分派消化）。
2. **身份**：初版 Supabase + 邀请码；鉴权做成可替换适配层（现有 `useAuth`/`AuthGate` 已抽象），后接腾讯 SSO。
3. **AI = 双层**：初版生成（重，本地跑 skill 流水线，灌入默认值，产品碰不到）+ 产品侧修改（轻，应用内，只做润色/翻译/起草，产出只进草稿、必须确认才生效）。
4. **事实库 = 两层**，进 P1：
   - 第一层 = AR 维护的公司级权威事实（AZ 数量、地域覆盖、腾讯云 strategy、认证清单等高频、需口径一致的点）。值更新时，引用它的答案标「可能过期」。
   - 第二层 = 历史答案自动沉淀复用（搜索 + 一键带入）。
5. **产品保有自己思路**：单题视图三路径——接受 AI 初稿 / 我自己写（AI 退到一边）/ 带入自己的材料让 AI 起草。
6. **导航两版并存**：跨问卷「我的待办」收件箱（做什么）+ 角色过滤的左侧栏（在哪）。同一组件，角色决定默认过滤值（产品默认只看自己、可显示全部；AR 默认全部、可按人/状态过滤）。
7. **AI 助手放右侧栏对话框**：三栏布局（左导航/中单题/右 AI 可折叠）。铁律：绑定当前题、产出不自动写入（带「应用到草稿」）、支持带入材料、默认折叠、单一 AI 面。

## 3. 与 skill plugin 的对齐（核心）

- Plugin 仓库 = 单一真相源：`~/Desktop/Ongoing Dev/analyst-questionnaire-suite-plugin/skills/`。
- 4 个 skill：`analyst-questionnaire-runner`(编排+状态机) / `analyst-grounding`(证据链) / `analyst-wording`(题型+reviewer hooks) / `answer-quality-checker`(lint 闸门)。
- **跨工具单一源已落地**：`scripts/install-skills.sh` 把 4 个 skill 软链进 `~/.claude/skills` 与 `~/.codex/skills`；Cursor 透过读 `~/.claude` 覆盖。改仓库一处，三家同时生效（已验证 md5 一致）。
- **天然对接点**：
  - grounding 的 `[CITED]/[INFERRED]/[REVIEW]` 审计链 = 平台 `answer.reasoning` 证据区。
  - wording 的 reviewer hooks `[REVIEW: product]` / `[REVIEW: Kevin]` = 平台任务分派；wrapper 的 master todo = 「我的待办」。
  - quality-checker 的 BLOCK/ERROR/WARN = 平台内嵌 lint + 提交闸门。
  - reviewer 恰好两类（product 技术 / Kevin 战略）→ 平台角色：产品 · Kevin · AR · 管理员。

### 统一状态枚举（skill 与平台共用）

| 统一状态 | = wrapper | 协作语义 | 谁推进 |
|---|---|---|---|
| NOT STARTED | NOT STARTED | 未分派/空 | AR 入库 |
| AI DRAFTED | IN PROGRESS | 本地初版已灌入，待人核 | skill(本地) |
| PRODUCT REVIEW | NEEDS REVIEW(CN) | 待产品核对事实 | 产品 |
| KEVIN REVIEW | NEEDS REVIEW | 待战略 framing 确认 | Kevin |
| READY | READY | 措辞+EN 定稿、lint 全过 | AR |
| SUBMITTED | — | 已提交、冻结 | AR |
| BLOCKED | BLOCKED | lint 有 BLOCK / 冲突未解 | 解阻者 |

## 4. 答案对象重构（平台地基）

每条答案绑定 `(questionnaire_id, field_id)`，三层内容分离：
- `fact_notes`(事实底稿，产品写要点) → `content_zh`(措辞稿) → `content_en`(提交版)
- 加 `state` / `assignee_id` / `reasoning` / `ai_origin` / `updated_by/at`
- 兼容现状：现有 zh→content_zh、en→content_en、reasoning 直接复用。

## 5. skill 导出 → 平台 importer 数据流

本地跑 skill → 导出 JSON bundle → importer 脚本(复用 `web/scripts/sync-defaults.ts` 模式) → Supabase → 平台渲染。

**重导入冲突策略（最关键）**：按答案当前状态守护人工编辑——
- NOT STARTED / AI DRAFTED（人未碰）：可覆盖。
- PRODUCT/KEVIN REVIEW（人已动）：不覆盖，新版作为 suggestion(diff) 挂上。
- READY：不覆盖，仅提示 AR。
- SUBMITTED：锁定跳过 + 审计。
- evidence/lint/conflicts：始终增量合并。

导出契约 JSON schema 见：`analyst-questionnaire-suite-plugin/skills/analyst-questionnaire-runner/references/platform-export-contract.md`

**已落地（平台侧）**：
- `web/supabase/platform-layer.sql` — 附加迁移（不动现有 `answers`）：新表 `answer_meta`（state/assignee/fact_notes/evidence/lint/conflicts/suggestions/needs_attention）+ `import_log`，含统一状态 CHECK、realtime、RLS。**需先在 Supabase SQL Editor 跑一次。**
- `web/scripts/import-skill-output.ts`（`pnpm import-skill -- --file <bundle> [--apply]`）— 读 bundle，按 §5 冲突策略写 `answers`(content_zh→field_id, content_en→field_id__en) + `answer_meta`(始终合并 metadata)，落 `import_log`。默认 dry-run。
- `web/scripts/sample-platform-export.json` — 可直接 dry-run 的样例 bundle（已验证解析正确）。

## 6. canvas 索引（设计细节都在这）

位于 `~/.cursor/projects/Users-luxlu-Desktop-Tencent-AR-Omdia-Cloud-for-China-Enterprise/canvases/`：

1. `project-understanding` — 项目现状理解
2. `platform-evolution` — 平台化策略 + 已锁决定
3. `core-slice-design` — P0 核心切片（答案对象/状态机/待办/单题六区/事实库/协作/实现顺序）
4. `skill-alignment-and-ui` — skill 对接契约 + 统一状态 + 导航两版 + AI 右栏 + 三栏布局
5. `skill-to-platform-importer` — 设计 A：数据流 + schema + 冲突策略 + 落地位置
6. `wireframes` — 设计 B：三栏外壳 + 单题视图 + 待办收件箱 + 过滤侧栏

## 7. 切片内实现顺序（P0）

① 答案对象+状态机（地基，落库 Supabase）→ ② 我的待办队列 → ③ 单题视图改造（六区+确认/退回+自己写）→ ④ 协作最小版（评论+历史）→ ⑤ AI 助手轻层（润色/翻译/起草+带材料）→ ⑥ 事实库（先 AR 权威事实层+一键带入）。

## 8. 下一步（进行中）

- [完成] `analyst-questionnaire-runner` 加 Phase 4.5「平台导出」+ export contract。
- [完成] importer 脚本 `web/scripts/import-skill-output.ts` + 样例 bundle（dry-run 已验证）。
- [完成] Supabase schema 平台层 `web/supabase/platform-layer.sql`（answer_meta + import_log）。
- [待办] 在 Supabase 实际跑一次 `platform-layer.sql`，再用真实 bundle `--apply` 灌一遍验证。
- [待办] 前端读 `answer_meta`：单题视图渲染 state/lint/evidence/suggestions、「我的待办」按 assignee/state 过滤（接 §7 实现顺序 ②③）。
- [注意] plugin 仓库改动（install-skills.sh / README / contract / SKILL.md）尚未 commit & push。
