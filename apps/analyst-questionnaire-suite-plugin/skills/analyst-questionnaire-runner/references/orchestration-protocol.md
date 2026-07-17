# Phase 2: Per-question 流水线编排

> Wrapper 在 Phase 2 使用。每道题独立跑这个流程。

## 编排前提

调用任何 sub-skill 前确认：

```
[ ] analyst-grounding 已 install      (~/.claude/skills/analyst-grounding)
[ ] analyst-wording 已 install        (~/.claude/skills/analyst-wording)
[ ] answer-quality-checker 已 install (~/.claude/skills/answer-quality-checker)
[ ] state/question-N.json 已生成（Phase 0 出口）
[ ] 当前题的 type_tag + char_limit 已确认
```

任一缺失，wrapper 报错并指引修复。

## 5 步骤详细

### Step 2.1: 调用 analyst-grounding

```
input:
  - 题目原文 (CN + EN)
  - type_tag (来自 Phase 1)
  - char_limit
  - sources searched (默认 v0.1: cloud.tencent.com/document)

action:
  - 调 grounding skill，让它跑完整 5-phase 流程
  - 等待 evidence package 输出

output:
  - evidence_package: 完整 audit-tagged 候选池
  - 写入 state/question-N/evidence-package.md
  - 更新 state/question-N.json:
      status: IN PROGRESS
      evidence_package_path: "state/question-N/evidence-package.md"
      history.append({
        timestamp: now,
        action: "grounding completed",
        summary: "{N} candidates, {M} CITED, {P} REVIEW items"
      })

context cleanup:
  - 不保留 grounding 抓的 raw content 进 wrapper context
  - 仅 state metadata + evidence_package_path
```

### Step 2.2: 调用 answer-quality-checker (evidence-mode)

```
input:
  - evidence_package (state/question-N/evidence-package.md)
  - mode: evidence-mode

action:
  - 调 quality-checker
  - 检查 provenance 完整性（每条 fact 是否有 audit tag, [CITED] 是否有 Quote, 等）

output:
  - lint_report (state/question-N/lint-evidence.txt)
  - 更新 state/question-N.json

decision:
  if lint_report has any [BLOCK]:
    status: BLOCKED
    halt this question; surface BLOCK to dashboard
    user must fix evidence_package before retry
  if lint_report has [ERROR]:
    status: stays IN PROGRESS
    log warnings, continue to 2.3 (但 PM 知道有 ERROR 待处理)
  if all pass:
    continue to 2.3
```

### Step 2.3: 调用 analyst-wording (Phase 1-3 中文起草)

```
input:
  - 题目原文
  - evidence_package
  - char_limit (CN)
  - type_tag

action:
  - 调 wording skill 跑 Phase 1-3
  - 让它选 shape, 起草中文版

output:
  - cn_draft (state/question-N/cn-draft.txt)
  - reviewer_hooks: list of 占位符 / thesis 判断 / 诚实模式风险点
  - 更新 state/question-N.json:
      status: NEEDS REVIEW (CN)

human gate:
  wrapper 暂停本题，输出：
    "Q5 CN draft ready for review."
    "CN draft path: state/question-5/cn-draft.txt"
    "Reviewer hooks: <list>"
    "Reviewers: 团队（事实+口径）+ Kevin（如果有 [REVIEW: Kevin] hook）"
  
  等用户回复 "Q5 CN approved" / 或 修改 cn-draft.txt 后回 "Q5 CN updated"
```

### Step 2.4: 调用 analyst-wording (Phase 5 翻译)

```
prerequisite:
  CN draft 已 approved (用户确认)

input:
  - cn_draft (approved 版本)
  - char_limit (EN)
  - type_tag (决定用哪个分析师 voice)

action:
  - 调 wording skill 跑 Phase 5
  - reframing 不直译 + 用对应 voice
  - 字数压缩到 EN limit 内

output:
  - en_final (state/question-N/en-final.txt)
  - 更新 state/question-N.json:
      status: NEEDS REVIEW (EN)

human gate:
  "Q5 EN draft ready for review."
  "EN draft path: state/question-5/en-final.txt"
  等用户回复 "Q5 EN approved" / 或修改 en-final.txt 后回 "Q5 EN updated"
```

### Step 2.5: 调用 answer-quality-checker (single-mode)

```
prerequisite:
  EN draft 已 approved

input:
  - en_final
  - char_limit (EN)
  - mode: single-mode

action:
  - 调 quality-checker
  - 跑完整 lint (markdown / fluff / 字数 / 占位符 / 诚实模式)

output:
  - lint_report (state/question-N/lint-final.txt)
  - 更新 state/question-N.json

decision:
  if lint_report has any [BLOCK]:
    status: BLOCKED
    surface BLOCK + reason
    回到 2.4 重新生成 EN（如果是占位符未填）
    或回到 2.3 重做 CN（如果是结构性问题）
  if [ERROR] only:
    status: NEEDS REVIEW (lint)
    输出 ERROR 列表，让团队决定 fix or accept
  if all pass:
    status: READY
    completion notification
```

## Per-question 的 context budget

每道题切换时**完全清空** wrapper 的 working memory，仅保留 state/question-N.json 的 metadata（< 1KB）。

切换时 context 应包含：

- 当前 question 的 metadata
- 当前 question 的 cn_draft / en_final 路径（不是内容）
- dashboard snapshot（轻量统计）

切换时 context 不应包含：

- 前面任何 question 的 evidence / draft 全文
- 任何 cache 文件全文
- 任何 lint report 全文

这样跑 30 道题，wrapper 自身 context 不超过 ~30K tokens（30 题 × ~1KB metadata + dashboard）。

## 错误恢复

如果某步 sub-skill 失败（如 grounding 抓不到任何 source）：

```
status: BLOCKED
reason: "grounding skill failed: <error msg>"
suggested_action:
  - 检查 sub-skill 是否 install
  - 检查网络（Firecrawl 需要联网）
  - 检查 source 是否真的存在
```

用户可以选择：

- 重跑 (`retry Q5 from step 2.1`)
- 跳过 (`skip Q5, mark as MANUAL`)
- 退到上一步 (`back to step 2.3 with manual evidence`)

## Sub-skill 输出 vs wrapper 输出

| 谁输出 | 输出什么 |
|---|---|
| analyst-grounding | evidence package（audit-tagged） |
| analyst-wording | CN draft / EN final |
| answer-quality-checker | lint report |
| **wrapper** | **dashboard + status + reviewer todo aggregate** |

Wrapper 不重复 sub-skill 的输出，只**编排 + 索引 + 总览**。
