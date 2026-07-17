# Lint Report 输出格式

> Phase 4 用。

## 总骨架

```
[Lint Report]
Generated: YYYY-MM-DDThh:mm:ss
Mode: <single-mode | batch-mode | evidence-mode>
Input scope: <题数 / 答案规模>
Total findings: N (X BLOCK, Y ERROR, Z WARN)
Status: <READY FOR SUBMIT | NOT READY FOR SUBMIT>

=== BLOCK (must fix before submit) ===

[BLOCK] <location>
  Issue: <描述>
  Action: <建议>

[BLOCK] <location>
  Issue: ...
  Action: ...

=== ERROR (will lose points) ===

[ERROR] <location>
  Issue: <描述>
  Action: <建议>
  ...

=== WARN (consider fixing) ===

[WARN] <location>
  Issue: <描述>
  Reason: <为什么 warn 不是 error>
  Action: <建议>
  ...

=== Summary ===
- Plain text violations: N
- Char limit: N over, N approaching
- Placeholders unfilled: N
- Marketing fluff: N
- Honesty mode issues: N
- Cross-question inconsistencies: N (batch-mode only)
- Provenance issues: N (evidence-mode only)

Status: <READY | NOT READY>
<如果 NOT READY: 列出 BLOCK 数 + 一句话 explain>
```

## Location 格式

每个 finding 必须能定位到具体位置：

| Mode | Location 格式 |
|---|---|
| single-mode | `line N` 或 `line N, col M` |
| batch-mode | `Q<N> <CN/EN>, line N` |
| evidence-mode | `Q<N> Candidate <N>, <field>, line N` |

例：

```
[ERROR] Q5 EN, Feature 3, Description, line 4
[ERROR] Q1 CN, line 12
[BLOCK] Q11 EN, line 8 col 23
```

## Action 字段必须 actionable

每个 Action 字段必须告诉团队**具体做什么**，不能只说"修一下"：

❌ 错误：
```
Action: 改进 wording
```

✅ 正确：
```
Action: 把 "world-class security" 改成 "ISO 27001 + SOC 2 Type II certified"
```

❌ 错误：
```
Action: 字数超了，需压缩
```

✅ 正确：
```
Action: 字数超 47 char。删 hedge 词 ("we believe", "actually") 节省 ~30 char；
        将 "Cloud Workload Protection" 缩写为 "CWP"（首次全名后用缩写）节省 ~20 char。
```

## Suggested fix 必须有具体例子

特别是 fluff / format 类 finding，附 before/after 例子：

```
[ERROR] Q1 EN, line 14: markdown bold "**Differentiation**:"
  Action: 改成 plain text 标签格式
  Before: "**Differentiation**: Most hyperscalers package..."
  After:  "Differentiation:\n\nMost hyperscalers package..."
         （注意：Label + 冒号单独成行，下一段空一行后正文）
```

## Cross-question finding 的特殊格式

batch-mode 的跨题 WARN 必须列出所有冲突点：

```
[WARN] Cross-question metric inconsistency: CFW SLA number
  Locations:
    - Q5 EN, Feature 1: "99.99% SLA"
    - Q11 EN, line 6:   "99.995% SLA"
    - Q23 EN, line 12:  "99.99% SLA"
  Action: 团队对齐当前对外口径，统一一个数字
  Reason: Q11 与其他题不一致；可能反映新版升级未同步
```

## Provenance finding 的特殊格式

evidence-mode 的 provenance ERROR 必须引用问题行：

```
[ERROR] Q5 Candidate 3, Provenance line 8: [CITED] 缺少 Quote 字段
  Found:
    [CITED] WAF blocks SQL injection
      Source: cloud.tencent.com/document/product/627/...
      Retrieved: 2026-04-26
  
  Required fields per audit-chain-format.md:
    - Source: ✓
    - Quote: ✗ (missing)
    - Retrieved: ✓
    - Page-updated: ✗ (optional but recommended)
  
  Action: 补 Quote 字段，从 source 摘 1-3 句原文
```

## Summary 部分

末尾 summary 用 plain text 表格：

```
=== Summary ===

Findings by category:
  Plain text violations:        2  (all ERROR)
  Char limit:                   1  (1 over)
  Placeholders unfilled:        3  (all BLOCK)
  Marketing fluff:              5  (all ERROR)
  Honesty mode:                 1  (WARN)
  Cross-question:               2  (WARN)
  Provenance:                   0
  -----
  Total:                       14

Status by question:
  Q1:  READY      (no issues)
  Q5:  NOT READY  (1 BLOCK + 2 ERROR)
  Q11: NOT READY  (2 BLOCK + 1 ERROR)
  ...

Overall status: NOT READY FOR SUBMIT
Reason: 3 BLOCK findings (unfilled placeholders in Q5, Q11)
```

## 输出本身的 plain text 规则

Lint report **自己也是 plain text**——不允许用 markdown：

- 用 `===` 做章节分隔（这是 plain text，不是 markdown HR）
- 用 `[BLOCK]` `[ERROR]` `[WARN]` 等方括号 tag（grep-friendly）
- 不用 `**bold**` / `*italic*` / `# heading`
- 缩进用空格，不用 tab

理由：lint report 经常 paste 到内部 tracking 系统 / 邮件 / 群聊里，markdown 在这些地方都不渲染。

## 输出后自检 checklist

```
[ ] 所有 BLOCK 在 BLOCK 段
[ ] 所有 ERROR 在 ERROR 段
[ ] 所有 WARN 在 WARN 段
[ ] 每个 finding 都有 Location + Issue + Action
[ ] Action 都是具体可执行的，不是 vague advice
[ ] Summary 数字准确
[ ] Status 与 BLOCK 数量一致（任意 BLOCK = NOT READY）
[ ] 没有 markdown 字符
```
