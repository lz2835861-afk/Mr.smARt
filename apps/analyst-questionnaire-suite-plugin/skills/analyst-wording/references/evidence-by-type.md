# 按题型该问什么料（Evidence Schema）

> Skill 在 Phase 2 采集证据时使用。每个组合对应一个 evidence schema。

## 横切（所有题都要的基础料）

不论什么题型都先问：

1. **题目原文**（中英对照最好；如果只有一种就只用一种）
2. **字数限制**（EN char limit / CN 字符限制）
3. **机构 + 报告名**（Gartner Strategic Cloud / Forrester Public Cloud Wave / IDC MarketScape / Omdia Universe / 等）
4. **提交格式**（Excel 表格的列结构 / 自由文本 / 等）

---

## 按 (大类 × 形式) 列具体 schema

### 产品能力 × 简答（如 Forrester 能力题）

需要：

1. **题目里 sub-question 数量**（拆开数）—— 通常 3-5 个
2. **每个 sub-question 对应的 Tencent 产品名 + 主要能力**
3. **至少 1 个量化指标**（规模 / SLA / QPS / TB / region 数）
4. **至少 1 个 production case**（客户名 + 量级，NDA OK）
5. **差异化论点** —— 你比 hyperscaler 强在哪一个具体点上（这是评分眼）

可选：

6. 近 12 个月新增的能力
7. 第三方 benchmark 数据

**问的话术示例**：

```
回答这道题需要的料（按 sub-question 拆开问）：

[需要] sub-q 1 (SQL/NoSQL): 你们提供哪些 SQL/NoSQL 服务？最大单集群规模？
[需要] sub-q 2 (HTAP): 是否有 HTAP 产品在产？哪个客户在用？workload 量级？
[需要] sub-q 3 (AI-native): 向量库规模？图库应用场景？
[需要] sub-q 4 (AIOps): 自动化运维的具体能力？工单自动闭环率？
[需要] differentiation: 这一块你比 AWS / Alibaba 强在哪一个具体点上？
[可选] 近 12 个月有什么新发布？
```

---

### 产品能力 × 列举（如 Gartner 5-feature 题）

**关键：features 必须由团队先挑，skill 不挑。**

需要：

1. **团队挑出的 top N feature 列表**（按"差异化强度 × 近 12 个月新发布 × 客户引用"打分）
2. **每个 feature**：
   - 产品名 / 内部代号
   - 1 段技术描述（≤500 char）
   - 公开文档 URL
   - 近 12 个月新增点
   - 客户引用（NDA OK，但有公开案例优先）

**如果团队没挑**：拒绝起草，要求团队先做 prioritization。话术：

```
这道题是 N 选 N，不是开放问答。我不能替你挑 N 个 feature，因为：

1. 选错 feature 直接被扣分
2. 候选 feature 池只有团队/产品自己知道
3. 优先级排序需要"是否近 12 个月新发布"和"是否有客户愿意做 reference"——这两件 skill 都不知道

请团队先做这一步：
- 列 8-10 个候选 feature
- 每个打分：差异化强度（1-5）× 近 12 个月新发布（有/无）× 客户引用（有/无/NDA）
- 挑 top N

然后把 top N 的清单 + 每个的细节给我，我再起草。
```

---

### 产品能力 × 是非

需要：

1. **真实答案**（是 / 否）
2. 如果是：URL + 范围 + 提前通知期 / SLA / 等
3. 如果否：现有的部分替代机制 + 是否在 roadmap

**关键提醒**：是非题的隐藏评分点是「你是否承认这件事重要」。"否"的回答如果加 roadmap 反而比简单"是"分高。

---

### 产品能力 × 选择（如 partner program）

需要：

1. **可选项的全集**（题目通常给了 checkbox 列表）
2. 每个被选项的补充信息（tier / fee / 资格门槛 / 等）
3. 没被选项的明确说明（"我们不维护独立 program for X，因为..."）

---

### 产品能力 × 数量（如 partner 数量）

需要：

1. **当前实际数字**（不是估算）
2. **统计口径**（哪一年的、覆盖哪些区域）
3. **可分子类的细节**（如"AI-domain partners 多少" vs "总 partners 多少"）

**关键**：数字必须可对外公开。如果是 NDA-only 数字，明确告诉 skill 这是 NDA。

---

### Strategy × 简答（愿景）

需要：

1. **公司 official thesis**（如有）
2. **这道题对应的 N 个角度上各 1 段判断 + 1 个对应行动**
3. **用什么 vocabulary**（默认按机构选；详见 [analyst-voice-profiles.md](analyst-voice-profiles.md)）：
   - Forrester → Lee Sustar
   - Gartner → Lydia Leong / Sid Nag
   - Omdia → Roy Illsley
   - IDC → Dave McCarthy

**关键**：愿景题不能 vague。"我们看好云的未来"不算判断，"the AI-native cloud is the new substrate; commodity cloud era is over"才算。

---

### Strategy × 对比 × 诚实模式（如 vs 三大竞品）

需要：

1. **Top N 直接竞品**（Tencent 自己判断的，不是分析师觉得应该是谁）
2. 每个竞品：3 个我们更强 + **3 个对方更强**
3. 每条优势 / 劣势必须有 proof（数字 / 客户 / benchmark / 公开 fact）
4. **拒绝 vague 优势**（"more flexible"、"better ecosystem" 都不行——分析师瞬间过滤）

**如果团队不愿意自曝劣势**：拒绝起草。话术：

```
这道题是诚实模式。Gartner 这道题就是在测你的自我认知——分析师有自己对你 vs 竞品的判断，他们要看你说的劣势是否和他们看到的一致。

如果你写的劣势全是"我们 marketing 投入不够"这种无关痛痒的，等于告诉分析师"我们没有自我认知"——直接扣分。

请团队回去问：vs AWS, Azure, 阿里云，我们最 honest 的弱点是什么？至少 3 个/家。

没有这部分 input 我不起草。
```

---

### Strategy × 列举 × 诚实模式（如投诉题）

需要：

1. **真实来源**（partner advisory board / NPS / QBR）+ 时间
2. **N 条投诉 / 问题**，每条：
   - 来源（partner 类型）
   - 内容
   - 量级（多久 / 多少 partner 提过）
3. **每条解决方案**：
   - 开始时间
   - 当前进度
   - 衡量指标
4. **进度必须混合**：on track / in progress / partial / pilot / 计划中——全 100% 完成 = 装

---

### Strategy × 时间锚定（roadmap）

需要：

1. **已确定 GA 的项目清单 + 季度**
2. 每项的范围（多 AZ? 全 IaaS/PaaS? 仅 GPU?）
3. 主权 / 行业 / GPU 等特殊属性
4. **明确 NOT 在窗口内的** —— 主动告知 trade-off（这是 strategy 题的隐藏评分点）

---

## evidence 完整性检查（起草前必跑）

```
检查 evidence 是否齐全：
[ ] 所有"需要"项已提供
[ ] 所有数字 / 客户名是 evidence 里有的，不是 skill 自动生成
[ ] 如果是诚实模式题，自曝点已确认可接受
[ ] 如果是列举题，N 个 candidate 已挑选完毕
[ ] 字数限制已知

如果有"需要"项缺失，停止起草，告诉用户停在哪。
```

---

## 何时该问"团队不知道"是真的不知道，还是 skill 不应该编

如果用户回 "你随便填一个" 或 "你按惯例填"——**拒绝**。话术：

```
这一项我不能编。
- 如果是数字 / 客户名 / 具体功能：我会写错，分析师会扣分
- 如果你团队真的不知道（如 SLA 数字），我会用占位符 [需补充: 具体 SLA] 写完，团队补上即可
- 如果你团队不愿意提供（如客户名是 NDA），告诉我，我用 "a leading [行业] customer" 代替

哪种情况？
```
