---
name: analyst-questionnaire-runner
description: |
  跑问卷 wrapper skill —— 整套分析师问卷流程的编排器。
  从 xlsx 入库到提交打包，调用 analyst-grounding、analyst-wording、answer-quality-checker 三个 sub-skill。
  Phases: 入库 → 分类 → per-question 流水线 → 跨题审计 → 提交打包 → 提交后跟踪。
  覆盖 Gartner / Forrester / IDC / Omdia 各家问卷格式。
  触发词：「跑问卷」「run questionnaire」「问卷流水线」「打包问卷」「Wave 流程」「MQ 流程」「analyst questionnaire workflow」
---

# 跑问卷 · Analyst Questionnaire Runner

> 「30 道题人工编排是 review fatigue 灾难。Wrapper 把每道题的状态、reviewer 待办、submission readiness 全程可视化。」

## 核心理念

1. **wrapper 不重写 sub-skill 逻辑**。grounding / wording / quality-checker 各管各的；wrapper 只编排 + 聚合。
2. **per-question isolation**。每道题独立完成 grounding → wording → checker 流程，evidence / draft 不跨题污染 context（详见 grounding skill 的 cache-and-context.md 规则 4）。
3. **状态可视化**。每道题有 status (NOT STARTED / IN PROGRESS / NEEDS REVIEW / READY / BLOCKED)；全表 dashboard 让 PM 一眼看完。
4. **reviewer 待办聚合**。所有 [REVIEW: product] / [REVIEW: Kevin] 跨 30 道题汇总成一份 master todo list，不让 reviewer 一道道翻。
5. **submission readiness 由 quality-checker 决定**。任意 BLOCK 不解决，wrapper 拒绝输出"提交包"。
6. **post-submission 不撒手**。Forrester 还有 strategy briefing + 3 客户访谈；Gartner 报告发布后还有 voice profile 反馈循环。Phase 5 提示这些未尽事宜（虽然 v0.1 不自动执行）。

## 关键区分

捕捉的是 **流程编排**，不是 **答案内容**。
- Wrapper 不写答案
- Wrapper 不抓事实
- Wrapper 不 lint
- Wrapper 调用 sub-skill 让它们做这些事，然后 **aggregate + status track + report**

捕捉的是 **end-to-end workflow**，不是 **single-question task**。
- 单道题：直接跑 grounding + wording + checker，不需要 wrapper
- 整份问卷（30+ 题）：wrapper 价值最大

---

## Sub-skill 依赖

Wrapper 假设以下 skill 可用。本插件已在 `skills/` 下内置这些 sub-skill；在 Claude Code 中使用时，可运行仓库根目录的 `scripts/install-claude-skills.sh` 链接到 `~/.claude/skills/`：

```
~/.claude/skills/
├── analyst-grounding              ← v0.1+
├── analyst-wording                ← v0.1+
├── answer-quality-checker         ← v0.1+
└── analyst-questionnaire-runner   ← 本 skill
```

如果某个 sub-skill 未 install，wrapper 启动时检测并报错，提示安装命令。

---

## 执行流程

### Phase 0: 问卷入库

详见 [references/intake-and-parse.md](references/intake-and-parse.md)。

接收输入：

- xlsx 文件路径（或 paste 表格内容）
- 机构 + 报告名（Gartner Strategic Cloud / Forrester Public Cloud Wave / IDC MarketScape / Omdia Universe）
- Deadline + 团队分工（可选）

动作：

1. 解析 xlsx，识别 question manifest（题号 + 题干 + 字数限制 + 评分维度）
2. 输出 question manifest 表：

```
Question Manifest
=================

机构: Gartner Strategic Cloud Platform Services 2026
报告 deadline: 2026-05-15
总题数: 48
分工: <如已配置>

#1  | 产品或服务 | What are the five key features in your Public Cloud Architecture...
#2  | 产品或服务 | What are the five key features in your Distributed Cloud Architecture...
...
#48 | 地区策略   | Which new regions and new sovereignty regions are you planning...
```

3. 创建 `state/` 目录跟踪每道题状态（gitignored）

### Phase 1: 题目分类 + 优先级

调用 **analyst-wording** 的 question-type-taxonomy 给每道题打标签（大类 × 形式 × 修饰符）。

然后按以下规则打优先级：

| 优先级 | 触发条件 |
|---|---|
| **HIGH** | 诚实模式题（self-disclosure）/ 愿景类 / 历年权重高的题（如 Gartner Q5 安全、Q11 AI 基础设施） |
| **MEDIUM** | 标准产品能力题 |
| **LOW** | 简单是非题 / 选择题 |

输出 dashboard：

```
Question Status Dashboard
=========================

#  | Type tag                                    | Pri    | Status
-- | ------------------------------------------- | ------ | -----------
1  | 产品能力 × 列举 × URL+12mo                  | MEDIUM | NOT STARTED
2  | 产品能力 × 列举 × URL+12mo                  | MEDIUM | NOT STARTED
5  | 产品能力 × 列举 × URL+12mo + 安全（高权重）| HIGH   | NOT STARTED
...
28 | Strategy × 列举 × 诚实模式                  | HIGH   | NOT STARTED
37 | Strategy × 对比 × 诚实模式                  | HIGH   | NOT STARTED
47 | Strategy × 简答 × NDA                       | HIGH   | NOT STARTED
48 | Strategy × 时间锚定                         | MEDIUM | NOT STARTED
```

建议团队**先攻 HIGH，再 MEDIUM，最后 LOW**——理由是 HIGH 题常需要团队多次 review，留时间。

### Phase 2: Per-question 流水线

详见 [references/orchestration-protocol.md](references/orchestration-protocol.md)。

对每道题（按优先级顺序），跑以下流程：

```
Question N
  ↓
Step 2.1: 调用 analyst-grounding
  - 输入: 题目 + type tag + 字数限制
  - 输出: evidence package（含 audit chain）
  - Status: IN PROGRESS
  ↓
Step 2.2: 调用 answer-quality-checker (evidence-mode)
  - 输入: evidence package
  - 输出: lint report (确保 provenance 完整)
  - 如果 BLOCK: Status → BLOCKED, 中断本题
  ↓
Step 2.3: 调用 analyst-wording
  - 输入: 题目 + evidence package
  - 输出: CN 初稿 + reviewer hooks
  - Status: NEEDS REVIEW (CN)
  ↓
[人工: 团队 review CN]
  ↓
Step 2.4: 调用 analyst-wording (Phase 5 翻译)
  - 输入: CN 已 approved
  - 输出: EN 答案
  - Status: NEEDS REVIEW (EN)
  ↓
Step 2.5: 调用 answer-quality-checker (single-mode)
  - 输入: EN 答案
  - 输出: lint report
  - 如果 BLOCK: Status → BLOCKED
  - 如果 ERROR: Status → NEEDS REVIEW (lint)
  - 如果全 pass: Status → READY
```

每步状态写入 `state/question-N.json`，wrapper 持久化，下次启动可恢复。

**关键：每道题独立 context**——wrapper 在切换到下一道题时**清空**当前题的 evidence / draft / lint report（只保留 status 元数据）。

### Phase 3: 跨题审计

所有题完成 Phase 2 后，调用 **answer-quality-checker (batch-mode)** 跑跨题一致性。

主要检查（详见 quality-checker 的 lint-rules.md）：

- 同一产品 SLA 数字在多题里一致
- 同一客户在多题里描述一致
- 产品名拼写跨题一致
- Roadmap 日期跨题一致

任何 inconsistency 标 WARN，**不是 BLOCK**——团队决定改哪边。

### Phase 4: 提交打包

详见 [references/submission-packaging.md](references/submission-packaging.md)。

前置条件：

- 所有 HIGH + MEDIUM 题状态 = READY
- 跨题 audit 已跑过
- BLOCK 数 = 0（quality-checker 整体 status = READY FOR SUBMIT）

不满足前置条件的输出"why not ready"清单，要求先解决。

满足前置条件的输出**提交包**：

1. **Per-cell ready-to-paste 内容**（按 sheet × row × column 组织）
2. **Reviewer todo master list**（按 product / Kevin 分组的所有未解决 [REVIEW] 项）
3. **Submission checklist**（确认 PO 已签字、Kevin 已 sign-off、字数全检过）

### Phase 4.5: 平台导出（machine-readable bundle）

详见 [references/platform-export-contract.md](references/platform-export-contract.md)。

在 Phase 4 生成 per-cell 内容的同时（或单独触发，用于把跑到一半的草稿先灌进平台让 product/Kevin 介入），
额外写出 `state/platform-export.json`：一份机器可读 JSON，供协作平台 importer 落库。

- 结构：questionnaire_id / firm → questions[]（type_tag, word_limit, status）→ fields[]（content_zh/en, evidence[], reviewer_hooks[], lint[], conflicts[]）。
- evidence = grounding 审计链；reviewer_hooks = wording 的 reviewer hooks；lint = quality-checker findings；status = 统一状态枚举。
- 现有人读输出（state/、submission-package.md）不变，这只是它的孪生。
- 写在 gitignored `state/`，不导出 NDA / 客户引用到会进 git 的位置。

### Phase 5: 提交后跟踪

详见 [references/post-submission-roadmap.md](references/post-submission-roadmap.md)。

提醒（v0.1 不自动执行，只列出 timeline）：

- **Forrester 专用**: 30-min strategy briefing + 2-hour product demo + 3-customer reference interviews
- **Gartner / Forrester 通用**: 报告发布前 5 天 courtesy preview（最多挑 15% 答案 challenge）+ 报告发布后 30 分钟 debrief call
- **报告发布后**: 抓你 + 竞品的 Strengths/Cautions 段落，update wording skill 的 voice profiles（v0.x 后续可自动化）

---

## 状态机

```
NOT STARTED       (Phase 0 入库后默认)
    ↓
IN PROGRESS       (Phase 2.1-2.4 进行中)
    ↓
NEEDS REVIEW      (Phase 2.3 / 2.4 / 2.5 后等人审)
    ↓ (审通过)
READY             (Phase 2.5 全 pass)
    
BLOCKED          (任意一步 quality-checker 报 BLOCK)
    ↓ (团队解 BLOCK)
back to IN PROGRESS
```

任意时刻 dashboard 实时反映 30 题的 status 分布：

```
Dashboard Snapshot @ 2026-04-30
================================

Status      Count
----------  -----
READY        12
NEEDS REVIEW 8 (CN: 3, EN: 4, lint: 1)
IN PROGRESS  5
BLOCKED      2
NOT STARTED  21

Cross-question audit: NOT YET RUN

Submission readiness: NOT READY
  Reason: 21 NOT STARTED + 2 BLOCKED + cross-audit pending

Next action recommendation:
  - 团队 review 8 NEEDS REVIEW (优先 CN 3 道，能解锁后续 EN)
  - 解 BLOCKED 2 道（详见 state/question-{5,11}.json 的 reason）
  - product team 推进 21 NOT STARTED 的 grounding（HIGH 优先）
```

---

## 反模式

1. **不许跨题累计 context**。每道题切换时清空 working memory（仅保留 state metadata）。
2. **不许跳过 quality-checker**。Phase 2.2 + 2.5 的 lint 必须跑，不许 skip。
3. **不许在 BLOCK 未解决时输出提交包**。Phase 4 强制前置条件检查。
4. **不许替团队挑 5 features**（同 grounding skill 边界）。
5. **不许替团队 sign-off**。Phase 4 输出的 submission checklist 必须由 PO + Kevin 实际打勾。
6. **不许 silent ignore sub-skill 输出**。每个 sub-skill 调用都要把输出写入 state/，便于追溯。
7. **不许 emoji**（同 grounding / wording / checker）。

---

## Reference 文件

加载顺序：

1. [references/intake-and-parse.md](references/intake-and-parse.md) — xlsx 解析 + question manifest 生成（Phase 0）
2. [references/orchestration-protocol.md](references/orchestration-protocol.md) — 怎么调 grounding + wording + checker（Phase 2）
3. [references/submission-packaging.md](references/submission-packaging.md) — 提交包格式 + 前置检查（Phase 4）
4. [references/post-submission-roadmap.md](references/post-submission-roadmap.md) — 提交后流程 timeline（Phase 5）
5. [references/platform-export-contract.md](references/platform-export-contract.md) — 机器可读导出 bundle 的 schema（Phase 4.5，对接协作平台 importer）

---

## 边界

1. **不写答案 / 不抓事实 / 不 lint**——这些是 sub-skill 的职责。
2. **不替人决策**——优先级 / 5-feature 选择 / sign-off 都是团队的事。
3. **客户访谈 / strategy briefing 不自动 prep**——Phase 5 只提醒，不执行（roadmap：单独 skill 处理）。
4. **报告发布后的反馈循环不自动化**——v0.1 只输出 "记得做" timeline；v0.x 后续可加 post-submission-extractor sub-skill。
5. **不持久化客户引用 / NDA 数据到 git**——`state/` 目录全 .gitignored。

---

## 配套使用

```
xlsx → questionnaire-runner
        ├─ analyst-grounding (per question)
        ├─ analyst-wording (per question)
        └─ answer-quality-checker (per question + batch)
                ↓
        提交包 + reviewer todo
```

如果只想跑单道题，**直接调 grounding + wording + checker**，不需要 wrapper。Wrapper 价值在 30 道题的全程编排 + 状态追踪。
