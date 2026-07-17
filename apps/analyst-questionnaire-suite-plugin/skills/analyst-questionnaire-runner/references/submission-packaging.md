# Phase 4: 提交打包

> Wrapper 在 Phase 4 使用。所有题完成 + 跨题 audit 跑过后调用。

## 前置检查

调用前 wrapper 必须确认：

```
[ ] 所有 HIGH + MEDIUM 题 status = READY
[ ] LOW 题 status = READY 或 SKIPPED
[ ] Phase 3 跨题 audit 已跑
[ ] BLOCK 数 = 0（quality-checker 整体 status = READY FOR SUBMIT）
[ ] 所有 [REVIEW: product] 已 sign-off (state/question-N.json reviewer_signoffs.product 非 null)
[ ] 所有 [REVIEW: Kevin] 已 sign-off (reviewer_signoffs.Kevin 非 null)
```

任一未满足，输出 "Why not ready" 报告：

```
Submission readiness: NOT READY

Reason:
  - 3 questions in BLOCKED status (Q5, Q11, Q23)
    Q5 reason: 占位符未填 [X] B requests/day
    Q11 reason: ...
    Q23 reason: ...
  - 2 questions still NEEDS REVIEW (Q28 EN pending Kevin signoff)
  - Cross-question audit: 5 inconsistencies pending team alignment

Suggested next actions:
  1. PM track BLOCKED questions, push owners
  2. Notify Kevin for Q28 review
  3. Schedule cross-question alignment meeting
```

## 满足前置后的提交包

### 1. Per-cell ready-to-paste 内容

按 sheet × row × column 组织。每道题输出独立一个 markdown 文件：

`submission/Q-05.md`:

```
# Q5: Security 5 features

## Submission target
- Sheet: 【1-20】产品或服务
- Row: 37 (题目行) / 39-43 (5 个 feature 行)

## Per-cell content (paste-ready)

### Row 39 - Feature 1
Column D (#标识): #1
Column E (Description):
[直接 paste 的 plain-text 内容]

Column F (URL):
https://www.tencentcloud.com/products/cfw

Column G (Comments):
[plain-text 内容]

### Row 40 - Feature 2
...
```

每个字段都已经过 quality-checker，零 markdown / 零 fluff / 字数在限内 / 零未填占位符。

### 2. Reviewer todo master list

聚合所有题的 [REVIEW] 项：

`submission/_reviewer-todo.md`:

```
# Reviewer Todo Master List

Generated: 2026-04-30T17:30:00
Submission readiness: 24 / 48 sign-offs collected

## product team (12 items)

[ ] Q5 Feature 1: 确认 [X] B requests/day 数据
    Source of question: state/question-5/evidence-package.md (line 23)
    Last updated: 2026-04-28

[ ] Q11 Feature 3: 确认 H200 集群定价比 Azure 低 [X]%
    Source: state/question-11/evidence-package.md (line 45)
    Last updated: 2026-04-29

...

## Kevin (AR / ex-Gartner VP) (6 items)

[ ] Q5 Feature 1 framing: "single-pane policy" vs "real-time threat intel"
    Question type: 产品能力 × 列举 × 安全
    Lydia Leong 评分透镜下哪个更打动？
    
[ ] Q25 Vision: thesis "geopatriation as first-class scenario" 是否 too edgy
    Question type: Strategy × 简答 × 愿景
    Forrester Lee Sustar 是否会买账？

...

## All sign-offs collected? Status:
  product: 6/12  ☐ NOT COMPLETE
  Kevin:   3/6   ☐ NOT COMPLETE
```

### 3. Submission checklist

`submission/_checklist.md`:

```
# Submission Checklist

Questionnaire: Gartner Strategic Cloud Platform Services 2026
Deadline: 2026-05-15
Generated: 2026-04-30T17:30:00

## Pre-submit verification

[ ] All 48 questions in READY status
[ ] All product reviewer sign-offs collected
[ ] All Kevin reviewer sign-offs collected
[ ] Cross-question audit run, inconsistencies resolved
[ ] Final lint pass: 0 BLOCK, 0 ERROR
[ ] PO/Comms approval obtained

## Submission steps

[ ] Open submission xlsx
[ ] For each question, paste from submission/Q-NN.md
[ ] Verify Excel cell display matches paste-preview (no markdown leakage)
[ ] Save xlsx
[ ] Sanity check: random sample 5 cells across sheet, confirm content shows correctly
[ ] Send to analyst per submission instructions

## Post-submit reminders

[ ] Forrester only: schedule strategy briefing (2026-05-28)
[ ] Forrester only: confirm 3 reference customer interviews (2026-06-01 to 06-05)
[ ] All firms: track courtesy preview window (~5 days before publish)
[ ] Set calendar reminder: 15% answer challenge window opens after preview
```

## 输出位置

```
submission/                          # gitignored
├── Q-01.md                          # 第 1 题的 paste-ready 内容
├── Q-02.md
├── ...
├── Q-48.md
├── _reviewer-todo.md                # 待 review 项汇总
└── _checklist.md                    # 提交 checklist
```

## 不许做的事

1. **不许在 BLOCK / NOT READY 状态下生成提交包**——前置检查必须 pass
2. **不许在 sign-off 未完成时把 checklist 标 [x]**——sign-off 是人来打勾
3. **不许把 state/ 或 submission/ 入 git**——含 Tencent 内部内容
4. **不许 paste-ready 内容含 markdown**——已经过 quality-checker，但提交包再 verify 一次
5. **不许遗漏 sheet/row/column 信息**——团队 paste 时必须知道贴到哪一格

## 流程后置

提交包生成后：

1. 通知 PM "submission package ready at submission/"
2. PM 走人工提交流程（paste + verify + send）
3. 提交完成后，转入 Phase 5（提交后跟踪）
