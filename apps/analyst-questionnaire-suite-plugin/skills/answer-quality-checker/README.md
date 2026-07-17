<div align="center">

# Answer Quality Checker

**分析师问卷答案的提交前 lint pass**

机械化检查 marketing fluff、plain text 违规、字数超限、未填占位符、诚实模式自检、跨题一致性

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Claude Code](https://img.shields.io/badge/Claude%20Code-Skill-blueviolet)](https://claude.ai/code)

</div>

---

## 这个 skill 干什么

[analyst-wording](https://github.com/AOMJ2PMP/analyst-wording-skill) + [analyst-grounding](https://github.com/AOMJ2PMP/analyst-grounding-skill) 帮你**写好答案**。

但写完不等于能交。提交前还要 lint 一遍——确认没有：

- `**Differentiation**:` 这种 markdown bold（在 Excel 里会显示成字面 `**`）
- "world-class", "industry-leading" 这种 marketing fluff（分析师瞬间过滤）
- 1547 char vs 1500 限制（超限丢分）
- `[X]`, `[需补充]` 等未填占位符（漏交了团队应该填的事实）
- 诚实模式题里的"假谦虚"（用 marketing 弱点冒充真弱点）
- 同一产品在 Q5 写 99.99% SLA 在 Q11 写 99.995% SLA（跨题不一致）

这个 skill 就是干这件事——**机械化、可 grep、零 vibe judgment 的 lint pass**。

## 不做什么

- ❌ 不判断 "这段 vision 写得好不好"（归 Kevin review）
- ❌ 不核查 "99.995% SLA 是不是真的"（归 product team）
- ❌ 不替团队改写答案（归 wording skill）
- ❌ 不审 PR / 法务合规（归外部审批流程）

只做**机械可证的违规检测**。

## 工作流（4 phase）

```
答案输入（单题 / 整份 / evidence package）
        ↓
Phase 1: 格式 lint
  - markdown 字符违规（ERROR）
  - 字数超限（WARN / ERROR）
  - 未填占位符（BLOCK）
        ↓
Phase 2: 内容 lint
  - Marketing fluff blacklist（ERROR）
  - 诚实模式自检（WARN，仅诚实模式题）
  - Provenance 完整性（ERROR，仅 evidence-mode）
        ↓
Phase 3: 跨题一致性（仅 batch-mode）
  - 数字 / 客户名 / 产品名 / roadmap 一致性
        ↓
Phase 4: Lint report 生成
```

详见 [SKILL.md](SKILL.md)。

## 4 种 finding 严重度

| Severity | 含义 | 提交决策 |
|---|---|---|
| `[BLOCK]` | 必须解决才能提交（如未填占位符）| 任意 BLOCK 整份 NOT READY |
| `[ERROR]` | 会丢分但不阻止提交（如 markdown / fluff） | 强烈建议修 |
| `[WARN]` | 改善机会（如诚实模式可疑、跨题不一致） | 建议参考 |
| `[INFO]` | 元信息 | 不需要 action |

## 输出示例

```
[Lint Report]
Generated: 2026-04-26T17:30:00
Mode: batch-mode (30 questions)
Total findings: 47 (3 BLOCK, 12 ERROR, 32 WARN)
Status: NOT READY FOR SUBMIT

=== BLOCK ===

[BLOCK] Q5 EN, Feature 3, Description
  Issue: 未填占位符 "[X] B malicious requests/day"
  Action: 团队补 [X] 或同意省略

=== ERROR ===

[ERROR] Q1 EN, line 14: 含 markdown bold "**Differentiation**:"
  Action: 改成 "Differentiation:" 单独成行 + 冒号 + 下一段空行

[ERROR] Q1 EN: 字数 1547 / 1500 (105%)
  Action: 删 hedge 词节省 ~30 char；缩写 "Cloud Workload Protection" → "CWP"

[ERROR] Q5 EN line 8: 含 fluff "world-class"
  Action: 删除 + 用具体数字（如 "99.995% SLA across 21 regions"）

=== WARN ===

[WARN] Q28 EN, Complaint 4: 诚实模式可能未真自曝
  Reason: "MDF 审批慢" 是无关痛痒小投诉
  Action: Kevin review 是否换更实质性的反馈

[WARN] Cross-question (Q5 + Q11): CFW SLA 数字不一致
  Q5: "99.99% SLA"
  Q11: "99.995% SLA"
  Action: 团队对齐口径
```

## 安装

```bash
git clone https://github.com/AOMJ2PMP/answer-quality-checker-skill ~/.claude/skills/answer-quality-checker
```

或与其他 skill 一起：

```bash
git clone https://github.com/AOMJ2PMP/analyst-wording-skill ~/.claude/skills/analyst-wording
git clone https://github.com/AOMJ2PMP/analyst-grounding-skill ~/.claude/skills/analyst-grounding
git clone https://github.com/AOMJ2PMP/answer-quality-checker-skill ~/.claude/skills/answer-quality-checker
```

## 触发词

- 「lint」「质检」
- 「check answer」「review my answer」
- 「问卷自检」「答案 review」
- 「answer-quality」

## 文件结构

```
answer-quality-checker-skill/
├── SKILL.md                          # 主入口（4-phase）
├── references/
│   ├── lint-rules.md                 # 所有规则 spec（Phase 1, 2, 3）
│   ├── fluff-blacklist.md            # Marketing fluff 词典（Phase 2a，活清单）
│   └── lint-report-format.md         # 输出格式（Phase 4）
├── README.md
└── LICENSE
```

## 后续怎么迭代

`fluff-blacklist.md` 是**活清单**——发现新 fluff 词就加：

```bash
# 加新 fluff word
vim references/fluff-blacklist.md
git commit -am "Add fluff word: <word>"
git push
```

其他迭代：

| 想改什么 | 改哪个文件 |
|---|---|
| 加新 lint 类别 | `references/lint-rules.md` 新增类别章节 |
| 调整 severity 阈值 | `references/lint-rules.md` 类别 2（字数）|
| 调诚实模式 anti-pattern | `references/lint-rules.md` 类别 5 |
| 改输出格式 | `references/lint-report-format.md` |

## Roadmap

```
v0.1 (current)
  ✅ Phase 1-4 完整 (格式 / 内容 / 跨题 / 报告)
  ✅ 三种 mode (single / batch / evidence)

v0.2 (next)
  → evidence-mode: candidate pool < 8 时触发 ERROR (现在只是 WARN)
    背景：跑 demo Q5 (Gartner Security) 时 grounding 候选池只有 5 个产品，
         evidence-mode 仅 WARN，团队若 skip 直接进 wording 会硬凑；
         应升级 ERROR，强制 wrapper 回 Phase 2 (grounding) 补候选
  → 跨题一致性扩展：除数字外，加 framing 一致性检测
    (如 Q5 写 "single-pane policy" 与 Q11 写 "real-time threat sharing" 能否兼容)
```

## 配套使用

```
原题 → grounding → wording → answer-quality-checker → 提交
                                    ↑
                                    本 skill 在这里
```

也可独立 lint 单题（不经过 grounding / wording）—— 适合手写答案的最后一步。

通过 wrapper skill「跑问卷」自动编排（roadmap）。

## License

MIT — 见 [LICENSE](LICENSE)
