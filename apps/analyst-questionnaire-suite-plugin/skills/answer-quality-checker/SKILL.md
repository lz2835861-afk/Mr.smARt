---
name: answer-quality-checker
description: |
  分析师问卷答案的提交前 lint pass。检查 marketing fluff、plain text 违规、字数超限、未填占位符、诚实模式自检、跨题一致性。
  独立可调用，也被 wrapper skill「跑问卷」自动调用。
  v0.1 覆盖单题检查；v0.2 覆盖跨题一致性 + provenance 完整性。
  触发词：「lint」「质检」「check answer」「review my answer」「问卷自检」「答案 review」「answer-quality」
---

# Answer Quality Checker · 问卷答案 lint

> 「写完不等于能交。每一份要交的答案都要先过 lint。」
>
> Skill 不替团队判断"对不对"——只检查机械可验证的违规。

## 核心理念

1. **机械化优先**。所有 lint 规则必须可被 grep / 字符匹配 / 字数计算自动判断。模糊判断（"这段写得好不好"）不在范围内。
2. **零容忍 plain text 违规**。`**bold**` 在 Excel 里显示成字面 `**bold**`——直接丢分。
3. **零容忍 marketing fluff**。"world-class" 等空词分析师瞬间过滤——直接丢分。
4. **未填占位符 = block submission**。`[X]` `[N]` `[客户 A]` `[需补充]` 等等，团队没补完不许提交。
5. **诚实模式题特殊处理**。Q28 partner complaints / Q37 vs 竞品劣势 → 检查是否真自曝（非"假谦虚"）。
6. **跨题一致性**（v0.2+）。同一产品 / 客户 / SLA 在多题里数字应一致。
7. **报告必须 actionable**。每个 finding 必须带 line/column 定位 + 建议替换。

## 关键区分

捕捉的是 **机械违规**，不是 **品质判断**。

- ✅ 检查："`**Differentiation**:` 含 markdown bold" — 机械可证
- ✅ 检查："字数 1547 超过 1500 限制" — 机械可证
- ✅ 检查："含 'world-class'" — blacklist 匹配
- ❌ 不在范围："这段 vision 写得是否打动 Lydia Leong" — 主观判断，归 Kevin review

输出是 **lint report**，不是改写答案。改写是 wording skill 的职责。

---

## 执行流程

### Phase 0: 输入收集

接收三种输入之一：

| 输入 | 模式 |
|---|---|
| 单道题答案（中文 / 英文 / 双语） | single-mode |
| 一份完整问卷的全部答案（多题）| batch-mode |
| 一份 evidence package（grounding skill 的输出）| evidence-mode |

每种 mode 都跑相同的 lint，但 batch-mode 多跑 Phase 4 跨题一致性检查。

### Phase 1: 格式 lint

详见 [references/lint-rules.md](references/lint-rules.md)。

按以下顺序检查：

#### 1a. Markdown 字符违规

grep 检查（每条都标 `[ERROR]`）：

```
- `**` 出现        → markdown bold
- 行首 `#`         → markdown heading
- 字符内 `*`       → markdown italic
- `` ` ``          → markdown code
- `[...](...)`     → markdown link
- 行首 `>`         → markdown blockquote
- 单独成行 `---`   → markdown HR
```

#### 1b. 字数超限

按 mode 检查 char count：

| 题型 | 限制 |
|---|---|
| Forrester 单题 EN | ≤ 1500 char |
| Forrester 单题 CN | ≤ 500 char |
| Gartner Description per cell | ≤ 500 char |
| Gartner Comments per cell | ≤ 500 char |

阈值：

- 95-99% → `[WARN]` "接近上限，建议预留 buffer"
- 100-105% → `[ERROR]` "超限，必须压缩"
- > 105% → `[ERROR]` "严重超限，需要重写"

#### 1c. 未填占位符

grep 所有占位符：

```
- [X]               → 数字占位
- [N]               → 计数占位
- [客户 A] / [Customer A]  → 客户名占位
- [需补充: ...]     → 显式占位
- [需补充]
- [TBD]
- [TODO]
- xxx / XXX         → 编辑残留
```

每个占位符标 `[BLOCK]` 严重度——**有任意 BLOCK 即不许提交**。

### Phase 2: 内容 lint

#### 2a. Marketing fluff blacklist

详见 [references/fluff-blacklist.md](references/fluff-blacklist.md)。

用 word-boundary grep 检查每个 fluff word，找到则 `[ERROR]` 并附建议替换。

例：

```
[ERROR] L12: "world-class" 是 marketing fluff
        Suggested fix: 删除 + 用具体数字代替（如 "99.995% SLA across 21 regions"）
```

#### 2b. 诚实模式自检（self-disclosure 题专用）

仅在题被 wording skill 标 `修饰符: 诚实模式` 时跑。

检查 anti-patterns（详见 lint-rules.md 的 honesty section）：

- "假谦虚"模式：用 marketing 弱点冒充真弱点
  - "我们的 marketing 投入还不够"
  - "我们更专注于质量而非数量"
  - "我们在某些地区还在扩张中"
- 缺失要素：
  - 没有量级 / 占比（"很多 partner 抱怨" 但不说几个）
  - 没有解决进度（投诉 5 类但全部"已解决" → 假）
  - 没有真实 source（"PAB 反馈" 但没说哪次 PAB）

每条触发标 `[WARN]` "诚实模式可能未真自曝，建议 Kevin review"。

#### 2c. Provenance 完整性（仅 evidence-mode）

如果输入是 grounding skill 的 evidence package，验证：

- 每条 fact 都以 `[CITED]` / `[INFERRED]` / `[REVIEW: product]` / `[REVIEW: Kevin]` 开头
- 所有 `[CITED]` 都有 Quote 字段
- 所有 `[INFERRED]` 至少 2 个 Based on
- 所有 `[REVIEW]` 都指定了 reviewer

任意违规标 `[ERROR]`。

### Phase 3: 跨题一致性（仅 batch-mode）

详见 [references/lint-rules.md](references/lint-rules.md) 的 cross-question section。

把所有题的答案 union 起来，提取：

- **数字**（SLA、规模、客户数、region 数）—— 同一产品在多题里数字应一致
- **客户名**——同一客户在多题里描述应一致
- **产品名 / 内部代号**——拼写一致（不要 CFW / 云防火墙 混用）
- **roadmap dates**——同一 milestone 在多题里日期应一致

任何 inconsistency 标 `[WARN]` "跨题不一致，建议团队对齐"。

### Phase 4: Lint report 生成

详见 [references/lint-report-format.md](references/lint-report-format.md)。

输出 plain-text lint report：

```
[Lint Report]
Generated: 2026-04-26T...
Mode: batch-mode (30 questions)
Total findings: 47 (3 BLOCK, 12 ERROR, 32 WARN)

=== BLOCK (must fix before submit) ===

[BLOCK] Q5 EN, Feature 3, Description
  Issue: 未填占位符 "[X] B malicious requests/day"
  Action: 团队补 [X] 或同意省略

[BLOCK] Q11 EN
  Issue: 未填占位符 "[需补充: H200 cluster pricing]"
  ...

=== ERROR (will lose points) ===

[ERROR] Q1 EN, line 14: 含 markdown bold "**Differentiation**:"
  Action: 改成 "Differentiation:" (单独成行 + 冒号 + 下一段空行)

[ERROR] Q1 EN: 字数 1547 / 1500 (105%)
  Action: 删 hedge 词 ("we believe", "actually") 节省 ~30 char
...

=== WARN (consider fixing) ===

[WARN] Q28 EN, Complaint 4: 诚实模式可能未真自曝
  Reason: "MDF 审批慢" 是无关痛痒的小投诉，建议 Kevin review 是否换更实质性的反馈

[WARN] Cross-question (Q5 + Q11): "Hunyuan API" 拼写不一致
  Q5: "Hunyuan API"
  Q11: "Hunyuan API endpoint"
  Action: 统一一种叫法
...

=== Summary ===
- BLOCK: 3 (must fix to submit)
- ERROR: 12 (will hurt score)
- WARN: 32 (improvement opportunities)

Status: NOT READY FOR SUBMIT (3 BLOCK)
```

---

## 反模式

1. **不许猜测内容好坏**。"这段是否打动分析师" 是 Kevin 的事，不是 lint 的事。
2. **不许改写答案**。lint 只报告 + 建议；改写归 wording skill。
3. **不许 silent pass**。即使全 OK，也要输出 "Status: READY" 报告，让团队知道 lint 跑过了。
4. **不许跳 BLOCK**。任何 BLOCK 不解决，整份 report 标 NOT READY。
5. **不许漏诚实模式题**。诚实模式题没跑 honesty self-check 是漏检——主动 grep 题目类型 tag 找出哪些题需要诚实模式 lint。
6. **不许 emoji**（同 grounding / wording）。
7. **不许 markdown 输出**（同上；lint report 自身也 plain text）。

---

## Reference 文件

加载顺序：

1. [references/lint-rules.md](references/lint-rules.md) — 所有 lint 规则的 spec（Phase 1, 2, 3）
2. [references/fluff-blacklist.md](references/fluff-blacklist.md) — Marketing fluff 词典 + 建议替换（Phase 2a）
3. [references/lint-report-format.md](references/lint-report-format.md) — 输出格式规范（Phase 4）

---

## 边界

1. **不做语义级品质判断**。"thesis 强不强 / framing 准不准 / vision 有无说服力" 全归 Kevin。
2. **不做事实核查**。"99.995% SLA 是不是真的" 归 product team，不归 lint。
3. **不做翻译质量检查**。"中文翻成英文是不是地道" 归 wording skill。
4. **不做对外口径合规审查**。PR / 法务 / 合规相关归外部审批流程。
5. **不替团队修改答案**。lint 只 report + suggest，不 patch。

---

## 配套使用

```
原题 → grounding → wording → answer-quality-checker → 提交
                                  ↑
                                  本 skill 的位置
```

也可独立 lint 单题（不经过 grounding / wording）—— 适合手写答案的最后一步检查。

通过 wrapper skill「跑问卷」自动编排（roadmap）。
