# Platform Export Contract（机器可读 bundle）

> wrapper 在 Phase 4 提交打包的同时，额外吐一份机器可读 JSON，供协作平台 importer 落库。
> 现有人读输出（state/、submission-package.md）不变；这是它的「孪生」。
> 目的：让本地 skill 生成的初版灌进平台，变成可分派、可协作、可提交的活答案。

## 何时生成

- Phase 4（提交打包）成功生成 per-cell 内容后，同步写出 `state/platform-export.json`。
- 也可单独触发（不强制 READY）：用于把「跑到一半」的草稿 + reviewer 待办先灌进平台让产品/Kevin 介入。
- 写入 `state/` 目录（gitignored），不进 git。

## 顶层结构

```json
{
  "export_version": "1.0",
  "questionnaire_id": "gartner-container-2026",
  "firm": "Gartner",
  "generated_at": "2026-06-07T10:00:00Z",
  "questions": [ /* QuestionExport[] */ ]
}
```

- `questionnaire_id`：必须匹配平台注册表（`web/src/data/questionnaires.ts`）的 id。
- `firm`：Gartner / Forrester / IDC / Omdia。

## QuestionExport

```json
{
  "question_id": "gc_q1_1",
  "type_tag": { "macro": "产品能力", "form": "列举", "modifiers": ["量化", "近12月"] },
  "word_limit": 500,
  "status": "AI DRAFTED",
  "fields": [ /* FieldExport[] */ ]
}
```

- `question_id`：平台题 id（含命名空间，如 `gc_`）。
- `type_tag`：来自 analyst-wording 的题型识别（大类 × 形式 × 修饰符）。
- `word_limit`：来自 wording；驱动平台字数提示 + lint。
- `status`：统一状态枚举（见下）。

## FieldExport

```json
{
  "field_id": "gc_diff1",
  "content_zh": "……wording 的中文初稿……",
  "content_en": "",
  "evidence": [ /* Evidence[] */ ],
  "reviewer_hooks": [ /* ReviewerHook[] */ ],
  "lint": [ /* LintFinding[] */ ],
  "conflicts": [ /* Conflict[] */ ]
}
```

- `field_id`：平台 field id（命名空间贯通，importer 对号入座、免手工映射）。
- 一道题 = 一组 field；question→fields 的拆分由 wrapper 在入库时按平台 manifest 建立。
- `content_en` 允许为 `""`（未译）。

### Evidence（来自 analyst-grounding 审计链）

```json
{ "tag": "CITED",    "claim": "...", "source": "https://...", "quote": "原文片段", "retrieved": "2026-06-01", "page_updated": "2025-11-03" }
{ "tag": "INFERRED", "claim": "...", "reasoning": "显式推理链", "based_on": ["ref1", "ref2"] }
{ "tag": "REVIEW",   "reviewer": "product", "claim": "[X] 节点规模", "reason": "文档未披露" }
{ "tag": "REVIEW",   "reviewer": "Kevin",   "claim": "差异化 framing 选择", "reason": "是否打动分析师" }
```

- `tag` ∈ `CITED | INFERRED | REVIEW`。
- CITED 必带 `quote`；INFERRED 必带 `based_on`(≥2)；REVIEW 必带 `reviewer`(product|Kevin) + `reason`。
- 平台把它渲染成证据区（CITED 绿/带引用、INFERRED 蓝/带推理、REVIEW 待办 chip）。

### ReviewerHook（来自 analyst-wording 的 reviewer hooks）

```json
{ "reviewer": "product", "kind": "placeholder", "text": "[X] B requests/day", "reason": "需补数字" }
{ "reviewer": "Kevin",   "kind": "thesis",      "text": "本题主论点",        "reason": "确认 thesis" }
{ "reviewer": "Kevin",   "kind": "honesty",     "text": "自曝点 X",          "reason": "诚实模式风险" }
```

- `kind` ∈ `placeholder | thesis | honesty`。
- 平台据此：建分派任务（product/Kevin）+ 占位符渲染成待填 chip。

### LintFinding（来自 answer-quality-checker）

```json
{ "severity": "BLOCK", "rule": "placeholder", "loc": "EN", "message": "未填 [X]", "suggest": "补数字或同意省略" }
{ "severity": "ERROR", "rule": "fluff",       "loc": "EN L12", "message": "world-class", "suggest": "改具体数字" }
{ "severity": "WARN",  "rule": "wordlimit",   "loc": "EN", "message": "1547/1500", "suggest": "删 hedge 词" }
```

- `severity` ∈ `BLOCK | ERROR | WARN`。
- 平台：行内提示；存在任意 BLOCK 时该题不可标 SUBMITTED（提交闸门）。

### Conflict（来自 grounding 冲突检测）

```json
{ "topic": "SLA", "values": [ { "value": "99.99%", "source": "文档" }, { "value": "99.995%", "source": "公众号" } ], "needs": "product" }
```

- 平台弹冲突横幅，待 `needs`(product) 仲裁；不 merge。

## 统一状态枚举

`NOT STARTED | AI DRAFTED | PRODUCT REVIEW | KEVIN REVIEW | READY | SUBMITTED | BLOCKED`

映射 wrapper 内部状态机：
- IN PROGRESS（生成中）→ 导出时若已有 CN 初稿则记 `AI DRAFTED`。
- NEEDS REVIEW(CN) → `PRODUCT REVIEW`；NEEDS REVIEW(战略) → `KEVIN REVIEW`。
- READY → `READY`；BLOCKED → `BLOCKED`。

## 平台 importer 的契约（消费侧，供参考）

- 按 `(questionnaire_id, field_id)` upsert。
- evidence/lint/conflicts → 写入 answer 元数据（始终增量合并）。
- reviewer_hooks → 创建/更新分派 + 待办。
- 重导入冲突策略：人未碰（NOT STARTED/AI DRAFTED）可覆盖；人已动（PRODUCT/KEVIN REVIEW）转 suggestion 不覆盖；READY 仅提示；SUBMITTED 锁定。

## 边界

- wrapper 只导出，不负责落库（落库是平台 importer 的事）。
- 不导出 NDA / 客户引用敏感字段到任何会进 git 的位置；export 写在 gitignored `state/`。
