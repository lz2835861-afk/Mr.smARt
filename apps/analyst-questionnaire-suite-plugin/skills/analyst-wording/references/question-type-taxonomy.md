# 题型分类法

> Skill 在 Phase 1 读题打标签时使用。

## 三层标签

### 大类（macro）—— 2 种

| 大类 | 本质 | 触发关键词 |
|---|---|---|
| **产品能力** | 我的产品做了什么 / 能做什么 | "What X does your product...", "What capabilities...", "What features...", "Describe your X capabilities" |
| **Strategy** | 公司怎么想 / 怎么做 / 怎么看 | "What is the vision...", "How do you plan...", "Describe your strategy", "Roadmap", "How will the market evolve" |

### 形式（form）—— 7 种

| 形式 | 触发线索 | 例子 |
|---|---|---|
| **简答** | 开放问题，无明确数量约束 | Forrester 多数能力题 |
| **列举** | "five key features", "three primary", "list X..." | Gartner Q1-20, Q37 |
| **是非** | "Do you...?", "Are you...?", "Has your org...?" | Gartner Q21, Q45, Q46 |
| **选择** | "For which of the following...", "Which apply to..." | Gartner Q29 |
| **数量** | "How many...?", "What percentage..." | Forrester Q28（嵌入式） |
| **对比** | "compared to your top X competitors", "advantages and disadvantages relative to" | Gartner Q37 |
| **时间锚定** | "in the next 12-24 months", "roadmap", "GA dates" | Forrester Q27, Gartner Q48 |

### 修饰符（modifier）—— 可叠加

| 修饰符 | 触发 | 影响 evidence 采集 |
|---|---|---|
| **要量化** | "performance", "scale", "throughput", 几乎所有产品能力题 | 必问具体数字 + SLA |
| **要客户引用** | guidance 提到 "customer references" | 必问 Tencent 可对外引用客户名 |
| **要 URL** | Excel 模板有 URL 列（Gartner 几乎每题） | 必问公开文档链接 |
| **要近 12 个月新增** | guidance 提到 "in the past 12 months" | 必问近期发布 / 升级 |
| **诚实模式** | 题目要自曝弱点 / 投诉 / 失败 | 拒绝 marketing 包装 |
| **NDA 模式** | guidance 标 "subject to NDA" | 允许更直接的事实陈述 |

## 标签输出格式

打完标签后告诉用户：

```
我把这道题打成：
- 大类：[产品能力 / Strategy]
- 形式：[简答 / 列举 / 是非 / ...]
- 修饰符：[量化, 客户引用, 近 12 个月, ...]
- 字数限制：[来源题目模板，如 Forrester EN 1500 char / Gartner Description 500 char]

如果分类错了请告诉我。
```

## 常见组合速查

| 组合 | 例子 | 中文起草要点 |
|---|---|---|
| 产品能力 × 简答 × 量化 + 近 12 个月 | Forrester Q1-24 大部分能力题 | 4-5 段 prose, 结尾必带 differentiation 句 |
| 产品能力 × 列举 × URL + 近 12 个月 + 客户引用 | Gartner Q1-20 | N 个独立 feature, 每个含 Description / URL / Comments |
| 产品能力 × 是非 | Gartner Q21 (deprecation), Q45-46 | 1-3 句直答 + 替代方案/roadmap |
| 产品能力 × 选择 | Gartner Q29 (partner program) | 按类型分组, 每组同 shape |
| Strategy × 简答 × 愿景 | Forrester Q25 Vision, Gartner Q47 | 4 段 thesis, 每段独立判断 + 对应行动 |
| Strategy × 对比 × 诚实模式 | Gartner Q37 (vs top 3 competitors) | N 块, 每块含真优势 + **真劣势** |
| Strategy × 列举 × 诚实模式 | Gartner Q28 (5 partner complaints) | N 项, 每项含真投诉 + 真解决方案 + 真进度 |
| Strategy × 时间锚定 | Forrester Q27, Gartner Q48 | 按时间 / 类别分组的 milestone, 末尾加"未在窗口内" |

## 模糊判定的处理

如果题目同时符合多个形式（常见于 Forrester 复合题），按以下顺序判：

1. 题目里有明确"N 个"约束 → 列举
2. 题目里有 yes/no 问句 → 是非
3. 题目里有 "vs" 或 "competitors" → 对比
4. 题目里有 "next 12-24 months" / "roadmap" → 时间锚定
5. 都没有 → 简答

**复合题**（一个题里嵌多种问法）：取最严的形式。例：Forrester Q1 是「简答」（4 个 sub-question 串联，但无 N 个约束），即使最后问 differentiation 也不算 N 并列。
