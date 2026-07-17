<div align="center">

# Analyst Questionnaire Runner · 跑问卷

**整套分析师问卷流程的编排 wrapper skill**

调用 grounding + wording + quality-checker 三个 sub-skill，全程 status 追踪 + reviewer todo 聚合 + 提交包打包

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Claude Code](https://img.shields.io/badge/Claude%20Code-Skill-blueviolet)](https://claude.ai/code)

</div>

---

## 这个 skill 干什么

[analyst-grounding](https://github.com/AOMJ2PMP/analyst-grounding-skill) 抓事实。
[analyst-wording](https://github.com/AOMJ2PMP/analyst-wording-skill) 写答案。
[answer-quality-checker](https://github.com/AOMJ2PMP/answer-quality-checker-skill) 提交前 lint。

但 30 道题人工编排是 **review fatigue 灾难**——

- 哪道题谁负责？
- Q5 卡在 product team review 数字数据，多久了？
- Kevin 还有几道战略题没 sign-off？
- 跨题 SLA 数字一致吗？
- 现在能交了吗？

这个 wrapper 就是干这件事——**编排 + status 追踪 + reviewer todo 聚合 + 提交 readiness 检测**。

## 工作流（5 phase）

```
xlsx 问卷文件
        ↓
Phase 0: 入库 (xlsx 解析 → question manifest)
        ↓
Phase 1: 题目分类 + 优先级 (调 wording 的 taxonomy)
        ↓
Phase 2: per-question 流水线 (loop 30 题)
        ├─ 调 grounding → evidence package
        ├─ 调 quality-checker (evidence-mode) → provenance lint
        ├─ 调 wording → CN draft
        ├─ [人工 review CN]
        ├─ 调 wording (Phase 5) → EN final
        ├─ [人工 review EN]
        └─ 调 quality-checker (single-mode) → final lint
        ↓
Phase 3: 跨题审计 (调 quality-checker batch-mode)
        ↓
Phase 4: 提交包打包 (per-cell paste-ready + reviewer todo + checklist)
        ↓
Phase 5: 提交后跟踪 (timeline 提醒：briefing / 客户访谈 / 报告发布)
```

详见 [SKILL.md](SKILL.md)。

## Status dashboard 是核心 UX

跑 30 道题的过程中，PM 任何时刻可以看：

```
Dashboard Snapshot @ 2026-04-30
================================

Status         Count
-------------  -----
READY            12
NEEDS REVIEW      8 (CN: 3, EN: 4, lint: 1)
IN PROGRESS       5
BLOCKED           2
NOT STARTED      21

Cross-question audit: NOT YET RUN
Submission readiness: NOT READY

Next action:
  - 团队 review 8 NEEDS REVIEW (优先 CN 3 道)
  - 解 BLOCKED 2 道 (state/question-{5,11}.json 看 reason)
  - product team 推进 21 NOT STARTED (HIGH 优先)
```

## Per-question context isolation

跑 30 道题的同一 wrapper session 里，**每道题完全独立 context**。切到下一题时清空前一题的 evidence / draft / lint 全文，仅保留 status metadata。

理由（详见 grounding skill 的 cache-and-context.md）：1M context 长 ≠ 全塞。Lost-in-the-middle 性能衰减是真的。

Wrapper 自身 context 跑 30 题应在 ~30K tokens（30 题 × ~1KB metadata + dashboard）。

## 提交包 = 三件事

满足提交前置条件后，wrapper 输出 `submission/` 目录：

```
submission/
├── Q-01.md ... Q-48.md       # 每题的 paste-ready 内容（按 sheet × row × column）
├── _reviewer-todo.md         # 待 sign-off 项 master list (按 product / Kevin 分组)
└── _checklist.md             # 提交 checklist (含 post-submit 提醒)
```

不满足前置（有 BLOCK / 缺 sign-off）时输出 "Why not ready" 报告，不输出提交包。

## 安装

```bash
# 4 个 skill 一起装
git clone https://github.com/AOMJ2PMP/analyst-grounding-skill ~/.claude/skills/analyst-grounding
git clone https://github.com/AOMJ2PMP/analyst-wording-skill ~/.claude/skills/analyst-wording
git clone https://github.com/AOMJ2PMP/answer-quality-checker-skill ~/.claude/skills/answer-quality-checker
git clone https://github.com/AOMJ2PMP/analyst-questionnaire-runner-skill ~/.claude/skills/analyst-questionnaire-runner
```

Wrapper 启动时检测 sub-skill 是否齐全；缺哪个会指引你装哪个。

## 触发词

- 「跑问卷」「run questionnaire」
- 「问卷流水线」「打包问卷」
- 「Wave 流程」「MQ 流程」
- 「analyst questionnaire workflow」

## 文件结构

```
analyst-questionnaire-runner-skill/
├── SKILL.md                              # 主入口（5-phase）
├── references/
│   ├── intake-and-parse.md               # xlsx 解析 + question manifest（Phase 0）
│   ├── orchestration-protocol.md         # per-question 5 步骤编排（Phase 2）
│   ├── submission-packaging.md           # 提交包格式 + 前置检查（Phase 4）
│   └── post-submission-roadmap.md        # 提交后流程 timeline（Phase 5）
├── README.md
└── LICENSE
```

## 后续怎么迭代

| 想改什么 | 改哪个文件 |
|---|---|
| 加新机构（如 Forrester The Total Economic Impact）| `references/intake-and-parse.md` 加机构识别 |
| 改优先级评级 | SKILL.md Phase 1 |
| 改 sub-skill 调用顺序 | `references/orchestration-protocol.md` |
| 改提交包格式 | `references/submission-packaging.md` |
| 加 sub-skill（如 customer-reference-prep）| Phase 5 + 新 sub-skill 项目 |

## v0.x 演进 roadmap

```
v0.1 (current)
  ✅ Phase 0-4 完整 (入库 → 编排 → 提交包)
  ✅ Phase 5 仅提醒 timeline (不自动执行)

v0.2
  → 加 customer-reference-prep sub-skill (Forrester 客户访谈准备)
  → 加 strategy-briefing-prep sub-skill (Wave / MQ briefing 准备)
  → Phase 2 grounding 完成后自动检测候选池充足度
    (题目要 N 个 feature 时候选池应 ≥ N + 3 buffer)
    < 阈值则自动回 Step 2.1 要求人工补，不进 wording
    背景：跑 demo Q5 时 grounding 候选池仅 5 个 = 题目要求 5 个，
         零 buffer 意味着任一候选 [REVIEW: product] 被产品否掉就硬交不合规答案；
         wrapper 应在编排层挡住，不让这种 case 滑到 wording / lint

v0.3
  → 加 post-publish-extractor sub-skill (报告发布后抓段落 + update voice profile)
  → 闭环年复一年的反馈循环
```

## 配套使用

四个 skill 一起跑就是完整的端到端工作流。

也可以**只用 wrapper 之外的 3 个**——单道题直接调 grounding + wording + checker，不需要 wrapper。Wrapper 价值在 30 道题的全程编排 + 状态追踪。

## Sub-skill 矩阵

| Skill | 用途 | Repo |
|---|---|---|
| analyst-wording | 写让分析师喜欢的答案 | [analyst-wording-skill](https://github.com/AOMJ2PMP/analyst-wording-skill) |
| analyst-grounding | 抓 audit-tagged evidence | [analyst-grounding-skill](https://github.com/AOMJ2PMP/analyst-grounding-skill) |
| answer-quality-checker | 提交前 lint pass | [answer-quality-checker-skill](https://github.com/AOMJ2PMP/answer-quality-checker-skill) |
| analyst-questionnaire-runner | 编排 + 状态追踪（本 skill） | [analyst-questionnaire-runner-skill](https://github.com/AOMJ2PMP/analyst-questionnaire-runner-skill) |

## License

MIT — 见 [LICENSE](LICENSE)
