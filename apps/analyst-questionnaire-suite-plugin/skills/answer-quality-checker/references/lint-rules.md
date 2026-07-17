# Lint 规则 spec

> 所有 lint 规则的 detection method + severity + suggested action。

## Severity 定义

| Severity | 含义 | 提交决策 |
|---|---|---|
| `[BLOCK]` | 必须解决才能提交 | 任意 BLOCK 整份 report 标 NOT READY |
| `[ERROR]` | 会丢分但不阻止提交 | 强烈建议修；不修也能交 |
| `[WARN]` | 改善机会 | 建议参考；可选修 |
| `[INFO]` | 元信息 / 统计 | 不需要 action |

## 类别 1：Plain text 违规（ERROR）

每条都是 grep / regex 可检测。

| 规则 | 检测 | Suggested fix |
|---|---|---|
| markdown bold | `**` 出现 | 改成 `Label:` 单独成行 + 冒号 + 空行后正文 |
| markdown heading | 行首 `#` | 改成段落 + 标签：`Section:` |
| markdown italic（asterisk） | `\b\*\w` 或 `\w\*\b` | 删除强调或换词 |
| markdown italic（underscore） | `\b_\w` 或 `\w_\b` | 同上 |
| markdown code（行内）| `` ` `` | 直接写代码字面 |
| markdown link | `\[.*?\]\(.*?\)` | URL 直接写明文 |
| markdown blockquote | 行首 `>` | 用引号包正文 |
| markdown HR | 单独成行 `---` | 用空行替代分隔 |

注意：

- 中文引号（`「」` `""`) 不是 markdown，不报 error
- 数学表达式里的 `*`（如 `5 * 21 = 105`）按字面，不报 error——区分方法是看前后是否 word-boundary
- LaTeX 风格的 `*` 和 `_`（如 `subscript_1`）罕见在分析师答案里，但若出现，触发 WARN 提醒人工确认

## 类别 2：字数超限（ERROR / WARN）

| 上下文 | 限制 | WARN 阈值 | ERROR 阈值 |
|---|---|---|---|
| Forrester 单题 EN | 1500 char | 1425 (95%) | 1500 (100%) |
| Forrester 单题 CN | 500 char | 475 | 500 |
| Gartner Description per cell | 500 char | 475 | 500 |
| Gartner Comments per cell | 500 char | 475 | 500 |
| Gartner URL per cell | 500 char | 475 | 500 |
| Omdia / IDC 自由文本 | 视题 | 95% | 100% |

字符计数规则：

- 中文按字符 count（不是 byte）—— "腾讯云" = 3 char
- 英文按字符 count（含空格）—— "Tencent Cloud" = 13 char
- 占位符按字面计入（虽然团队会替换）—— `[X]` = 3 char
- 换行符 `\n` 计 1 char（注意 Excel 里 `\r\n` 算 2）

如果输入指明字数限制，按指明的；否则按 source 类型默认。

## 类别 3：未填占位符（BLOCK）

| 模式 | 例子 |
|---|---|
| 方括号占位 | `[X]`, `[N]`, `[X]B`, `[X]%` |
| 中文方括号 | `[客户 A]`, `[需补充]`, `[TBD]` |
| 显式标记 | `[需补充: SLA]`, `[需团队确认]` |
| 编辑残留 | `xxx`, `XXX`, `TODO`, `FIXME` |
| 未替换的 fence | `<placeholder>`, `<value>` |

任意一个出现 → `[BLOCK]`，附"需要团队补 X 或确认省略"。

注意：

- 真实文本里的方括号（如引用论文 `[1]`）罕见，但按 grep 会误报——通过 context 判断（前后是否数字 + 出现频率）
- 如果团队真的想留 `[N]` 表示"some number" 不填具体数字，应改写成"multiple" / "several" / "dozens of" 等英文表达

## 类别 4：Marketing fluff（ERROR）

详见 [fluff-blacklist.md](fluff-blacklist.md)。

每个 fluff word 都是 word-boundary grep。建议替换由 fluff-blacklist 维护。

## 类别 5：诚实模式自检（WARN）

仅在题被标记 `修饰符: 诚实模式` 时跑（如 Gartner Q28、Q37 等）。

检测 anti-pattern：

### 5a. 假谦虚模式

正则匹配以下短语（中英）：

```
中文 anti-pattern:
- 我们的 marketing 投入还不够
- 我们更专注于质量而非数量
- 我们在某些地区还在扩张
- 我们的 brand awareness 还在建设
- 我们更小所以更灵活
- 我们的客户太多以至于...

EN anti-pattern:
- our marketing investment could be stronger
- we focus on quality over quantity
- we are still expanding in some regions
- our brand awareness is still developing
- being smaller allows us more flexibility
- we have so many customers that...
```

任一命中 → `[WARN]` "诚实模式可能未真自曝，建议 Kevin review"。

### 5b. 缺失关键要素

诚实模式题应该有：

- **量化**（"过去 12 个月有 X 个 partner 反馈过"）
- **来源**（"来自 partner advisory board 2025-Q3"）
- **进度混合**（不能全 100% on track —— 全好等于装）

检测：

- 答案中无任何数字 + 题型是诚实模式 → WARN "缺少量化"
- 答案中无 source 关键词（"survey", "advisory board", "QBR", "NPS"，对应中文）→ WARN "缺少投诉来源"
- 答案中所有 plan 都说 "完成" / "on track" → WARN "进度全好可疑"

### 5c. 自曝劣势 ratio 检查（仅 vs 竞品题）

题型："Q37 / vs top N competitors / 优势 + 劣势" 类。

检查每个竞品的"优势" vs "劣势" 段落字数比：

- 如果劣势段 < 优势段 50% → WARN "劣势段过短，可能未真自曝"
- 如果完全没有劣势段 → ERROR "对比题缺自曝劣势"

## 类别 6：Provenance 完整性（仅 evidence-mode，ERROR）

仅在输入是 grounding skill 的 evidence package 时跑。

检查：

- 每条 fact 行首必须以 `[CITED]` / `[INFERRED]` / `[REVIEW: product]` / `[REVIEW: Kevin]` 开头 → 否则 ERROR
- 每个 `[CITED]` 必须有 `Source:` 和 `Quote:` 字段 → 缺失 ERROR
- 每个 `[INFERRED]` 必须有 `Reasoning:` 和至少 2 个 `Based on:` → 缺失 ERROR
- 每个 `[REVIEW]` 必须指定 `product` 或 `Kevin` → 模糊 `[REVIEW]` 报 ERROR
- 所有 `Source:` 字段必须是 URL（不是描述）→ 否则 ERROR
- 所有时间戳格式必须 `YYYY-MM-DD` → 否则 WARN

## 类别 7：跨题一致性（batch-mode，WARN）

仅在 batch-mode 跑。union 所有题答案后检查：

### 7a. 数字一致性

提取所有 "数字 + 单位" pattern（regex `\d+(\.\d+)?\s*(B|M|K|%|TB|GB|MB)`）。

按"产品 + metric"分组（如 "CFW SLA"），如果同 group 多个值 → WARN。

例：

```
[WARN] Cross-question metric inconsistency: CFW SLA
  Q5 EN: "99.99% SLA"
  Q11 EN: "99.995% SLA"
  Action: 团队对齐口径
```

### 7b. 客户名一致性

提取所有 `[Customer X, industry, NDA]` 或类似 pattern。

按客户名分组，如果同一客户在多题里"行业"或"NDA 状态" 描述不一致 → WARN。

### 7c. 产品名一致性

维护内部产品名词典（CFW vs 云防火墙 vs Cloud Firewall）。

同一产品在不同题里用不同写法 → WARN "产品名拼写不一致"。

### 7d. Roadmap 日期一致性

提取所有 `Q[1-4] 202[6-7]` 或 `2026-\d{2}` pattern。

按 milestone 分组，多个日期 → WARN。

---

## Lint 流程伪代码

```
load_input(answer | batch | evidence)
  ↓
detect_mode  (single / batch / evidence)
  ↓
Phase 1: 格式 lint
  - 1a markdown char violations  (ERROR)
  - 1b char count                (WARN / ERROR)
  - 1c placeholders              (BLOCK)
  ↓
Phase 2: 内容 lint
  - 2a fluff                     (ERROR)
  - 2b honesty mode              (WARN, 仅诚实模式题)
  - 2c provenance                (ERROR, 仅 evidence-mode)
  ↓
Phase 3: 跨题（仅 batch-mode）
  - 3a number consistency        (WARN)
  - 3b customer consistency      (WARN)
  - 3c product name consistency  (WARN)
  - 3d roadmap consistency       (WARN)
  ↓
Phase 4: 报告生成
  - sort findings: BLOCK > ERROR > WARN
  - per-finding: location + issue + suggested action
  - summary: counts + READY / NOT READY
```
