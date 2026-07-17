---
name: analyst-wording
description: |
  帮腾讯云用分析师喜欢的语言写问卷答案。覆盖 Gartner、Forrester、IDC、Omdia 四家。
  工作流：原题 + 你给的事实 → 中文初稿（团队/产品 review）→ 英文版（提交）。
  按题型识别（不按机构），格式由答案 shape 决定，不预设模板。提交是 plain text，不用 markdown。
  触发词：「答这道题」「问卷答案」「Gartner 回答」「Forrester 答」「分析师 wording」「帮我写问卷」「Wave 题」「MQ 题」「analyst questionnaire」
---

# Analyst Wording · 分析师问卷应答术

> 「Bullet 是厂商在提纲挈领，prose 是厂商真的想清楚了。」
>
> 给厂商的 talking points 看起来像 sales deck；分析师爱看的回答是连贯论证。

## 核心理念

1. **按题型分，不按机构分**。Gartner / Forrester / IDC / Omdia 都问同样几类题——差别在结构性约束（字数、表格行数、必填列），不在题的本质。
2. **格式由答案的 shape 决定，不由模板决定**。Shape = 答案是「一个连贯论证」还是「N 个并列同 shape 的项」。Shape 决定 format，不要反过来。
3. **不许编**。数字、客户名、产品功能、URL —— input 没给的，output 不许凭空写。
4. **中文先行**。中文初稿给团队/产品 review 事实和口径；英文版用分析师语言重写（不是直译），用于提交。
5. **提交是 plain text**。Excel 单元格不渲染 markdown。`**bold**` 会显示成字面 `**bold**`。永远不用 `#`、`**`、`*`、`` ` ``。

## 关键区分

捕捉的是 **HOW 分析师想看**，不是 **WHAT 厂商想说**：

- 厂商爱说："我们的产品更稳定、更安全、更智能" —— 抽象、自夸、无 proof
- 分析师爱看："99.995% SLA across 21 regions, validated by [客户] in production" —— 具体、量化、可验证

捕捉的是 **shape**，不是 **format**：

- Shape：答案的内在结构（连贯论证 / N 并列 / 时间线 / 对比 / 是非 / 等）
- Format：渲染细节（段落 / 列表 / 标签）—— format 服从 shape

---

## 执行流程

### Phase 0: 入口确认

收到用户输入后，先判断是什么场景：

| 用户输入 | 路径 |
|---|---|
| 粘贴了问卷题目原文（中或英） | → Phase 1 |
| 模糊请求（"帮我写段 Gartner 回答介绍我们的安全产品"） | → Phase 0B 反问 |
| 想批量处理多道题 | → 提示一道一道做（context 容易混） |

#### Phase 0B：模糊请求澄清

只追问 1 轮，确认三件事：

1. 哪个分析师机构的问卷？（Gartner / Forrester / IDC / Omdia）
2. 题目原文是什么？（必须有原题，否则盲写）
3. 字数限制是什么？（如 Forrester EN 1500 char / Gartner Description 500 char）

得到这三项后进入 Phase 1。

---

### Phase 1: 题型识别

读题，按 [references/question-type-taxonomy.md](references/question-type-taxonomy.md) 打三层标签：

- **大类**（macro）：产品能力 / Strategy
- **形式**（form）：简答 / 列举 / 是非 / 选择 / 数量 / 对比 / 时间锚定
- **修饰符**（modifier）：要量化 / 要客户引用 / 要 URL / 要近 12 个月 / 诚实模式 / NDA 模式

输出格式：

```
我把这道题打成：
- 大类：[产品能力]
- 形式：[列举（强制 5 个）]
- 修饰符：[量化, 客户引用, URL, 近 12 个月]
- 字数限制：[Gartner Description 500 char × 5]

如果分类错了请告诉我。
```

让用户确认或纠正后再进入 Phase 2。

---

### Phase 2: 证据采集（evidence elicitation）

按题型对应的 schema 向用户要料。详见 [references/evidence-by-type.md](references/evidence-by-type.md)。

**关键规则**：

- 用户不提供的事实，skill 不许编
- 用户拿不准的事实，标 `[需团队确认: xxx]`
- 涉及数字 / 客户名 / 具体功能时，永远复述确认："你说的是 X，对吗？"

**输出格式**：一个清单，每项标 `[需要]` 或 `[可选]`：

```
回答这道题，我需要的料：

[需要] 1. 团队挑出的 top 5 安全 feature 列表（按差异化打分）
[需要] 2. 每个 feature 的 1 段技术描述
[需要] 3. 每个 feature 的公开文档 URL
[可选] 4. 每个 feature 的客户引用（NDA OK，但有公开案例优先）
[可选] 5. 每个 feature 在过去 12 个月的新增点

请你/团队提供这些信息。如果有"需要"项无法提供，告诉我哪一项，我会建议怎么处理。
```

"需要"项缺了就停，不起草。"可选"项缺了就用 `[占位符]` 继续。

---

### Phase 3: 中文起草

#### 3a. 选 shape（不选 format）

读完 evidence 后判断答案 shape：

- **连贯论证型** —— 一个总论点 + 几段支撑。例：愿景题、能力差异化题
- **N 并列型** —— N 个同 shape 的项。例：5 features、3 competitors、5 complaints
- **是非 + substantiation** —— 1-3 句直答 + 替代方案（如果是「否」）
- **时间线型** —— 按时间分组的 milestone

shape 决定后，format 自然产生：

- 连贯论证 → 段落（空行分隔）
- N 并列 → 编号列表（`1.` `2.` `3.`）或 dash 列表（`- `）
- 是非 → 单段或两段
- 时间线 → 按类别分段，每段内可用 dash 列出 milestone

#### 3b. 写中文初稿

Plain text only。**绝对不用 `**bold**` 或 `# heading`**。需要分节就用：

- 段落（空行分隔）
- 标签 + 冒号 + 换行：`差异化：` 然后另起一段
- 编号或 dash 列表

详见 [references/plain-text-rules.md](references/plain-text-rules.md)。

字数控制：

- Forrester CN 500 char —— 严格压
- 给团队 review 用的内部稿 —— 信息密度优先，不强求 500 char

#### 3c. 给输出附 reviewer hooks

中文版输出后，**自动列出三类 reviewer hooks 给团队/产品确认**：

1. **占位符清单** —— 所有 `[X]`、`[N]`、`[客户 A]` 的位置 + 团队需补什么
2. **关键 thesis** —— 这道题我做了什么判断？让团队确认 thesis 对不对
3. **诚实模式风险点**（如果是 self-disclosure 题） —— 哪些自曝点是否能接受

---

### Phase 4: Review iteration

用户拿中文给团队/产品看，回来反馈：

- **事实修改** → 改 evidence input，重跑 Phase 3
- **结构修改** → 改 shape 选择，重跑 Phase 3
- **措辞修改** → 局部微调，无需重跑

直到中文版被团队/产品确认。

---

### Phase 5: 英文翻译（reframing not literal）

详见 [references/translation-reframing.md](references/translation-reframing.md)。

**核心规则**：

- **不是直译，是 reframing**：
  - 中文「我们做了 XX 优化」 → English `reduced p99 latency by 37% across 12 regions`
  - 结构、动词、量化全要换
- **用分析师 vocab**（详见 [references/analyst-voice-profiles.md](references/analyst-voice-profiles.md)）：
  - Forrester 题 → Lee Sustar voice（AI-native / neocloud / commodity-cloud-era / two-races）
  - Gartner 题 → Lydia Leong voice（pragmatic-skeptical / table stakes / actually）
  - Gartner 云市场题 → Sid Nag voice（CIPS / unabatedly / multicloud adoption model）
  - Omdia 题 → Roy Illsley voice（risk management framework / unit economics / "all about X"）
  - IDC 题 → Dave McCarthy voice（digital infrastructure / TCO 优先）
- **字数压缩 20-30%** —— 英文同等信息密度比中文费字符

Plain text 规则同 Phase 3。

---

### Phase 6: 提交格式输出

最终输出三件东西：

1. **可粘贴的 EN 答案**（plain text，无 markdown，字数验证过）
2. **CN 留档**（团队复审版，plain text）
3. **未填占位符清单** —— 团队补完前不要提交

输出前必须自检：

```
[ ] 没有 ** 或 * 或 # 或反引号 或 [link] 等 markdown
[ ] 段落用空行分隔
[ ] 列表用 "1. " 或 "- " 起始
[ ] URL 是明文
[ ] 字数在 limit 内
[ ] 所有数字、客户名都来自 evidence input，不是 skill 编的
[ ] 占位符 [X]、[客户 A] 等已标记给团队
```

---

## 反模式（绝对不能做的事）

1. **不许编数字**。input 没说"99.995% SLA"就不许写。可以写 "high availability" 代替，并标记 `[需补充: 实际 SLA 数字]`。
2. **不许编客户名**。input 没说"工商银行"就不许写。可以写 "a leading [行业] customer"。
3. **不许用 markdown**。`**bold**`、`# heading`、`*italic*`、`` `code` ``、`[link](url)` —— 提交时全是 plain text。
4. **不许 bullet 滥用**。每个 bullet < 1 行 = 浪费字数 = 分析师觉得你在敷衍。Bullet 只用于真正 N 并列且每项需独立 1-2 句完整说清的场景。
5. **不许全篇 marketing 口吻**。"world-class"、"industry-leading"、"best-in-class"、"empower"、"transformation"、"journey"、"holistic" —— 分析师瞬间过滤。换成具体动词 + 具体数字。
6. **不许在自曝题里假谦虚**。"我们的小缺点是 marketing 投入不够" = 装。真劣势必须真。
7. **不许在 NDA 题里写 marketing 话术**。NDA 题就是给你自由说话的——讲真话，省得分析师两面对照发现你装。
8. **不许替团队挑 5 个 feature**。Gartner Q1-20 那种"列 5 个"的题，候选 feature 必须由团队先列 8-10 个候选打分挑 top 5。skill 不替团队挑。

---

## Skill 应该 read 的 reference 文件

启动时按需加载：

1. [references/question-type-taxonomy.md](references/question-type-taxonomy.md) —— 题型分类法（Phase 1）
2. [references/evidence-by-type.md](references/evidence-by-type.md) —— 按题型该问什么料（Phase 2）
3. [references/plain-text-rules.md](references/plain-text-rules.md) —— plain text 提交规则（Phase 3, 5）
4. [references/translation-reframing.md](references/translation-reframing.md) —— CN→EN 重写规则（Phase 5）
5. [references/analyst-voice-profiles.md](references/analyst-voice-profiles.md) —— 分析师 vocab（Phase 5）

用户自有的研究语料（按需查阅，不强制每次加载；本插件不打包这些本地 / 版权语料）：

- `ref/Methodology/` —— 4 家分析师的官方方法论
- `ref/Analyst Blogs/` —— 7 个云分析师的语言风格样本
- `ref/Gartner Reports/` —— 6 份 Gartner Magic Quadrant 报告（学习"被分析师认证过的措辞"）
- `ref/Question Type Analysis/` —— 题型分类的演练 + 8 道真题样本

---

## Worked examples 在哪看

8 道真题（覆盖所有题型形式）的中英对照样本：

- `ref/Question Type Analysis/01 - 题型分类与 8 道真题分析.md`
- `ref/Question Type Analysis/review.html` （HTML 版，左右分屏对照）

注意：这两份样本里的中英文用了 `**bold**` 等 markdown 格式，因为用途是阅读 review，不是提交。**实际提交按本 SKILL.md 的 plain text 规则。**

---

## 边界（skill 做不到的事）

诚实告诉用户：

1. **挑 5 features 做不到**。Gartner Q1-20 这种题，候选 feature 必须由产品/团队先列 8-10 个候选，按"差异化强度 × 12 个月内新发布 × 客户引用"打分挑 top 5。
2. **历史口径 review 做不到**。这道题去年怎么答的、当时拿了什么分、分析师当时怎么反馈——这些是问卷之外的信息。skill 默认从 0 开始。
3. **图表 / 架构图无法生成**。skill 只输出文字。
4. **客户访谈准备做不到**。Forrester Wave 的 3 个 reference customer interview 是另一个 workflow。
5. **机构内部偏好的实时跟踪做不到**。如果某机构今年突然开始扣 X 类回答的分，skill 不会自动知道。

---

## 第一次跑这个 skill 的建议

如果你第一次用：

1. 先从一道**简单的产品能力题**开始（比如某个具体能力的简答），跑完整 Phase 0-6
2. 再试一道**诚实模式题**（如 Gartner Q28 partner complaints），看 evidence elicitation 是否能引出真实弱点
3. 再试一道**愿景/Strategy 题**（如 Forrester Q25 Vision），看分析师 voice 是否到位

如果 3 道都顺，再批量上其他题。
