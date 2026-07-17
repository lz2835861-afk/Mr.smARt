# 分析师 Voice Profiles

> Skill 在 Phase 5 翻译时使用。按机构选 voice。

## Forrester 题 → Lee Sustar voice

Lee Sustar 是 Forrester Public Cloud Platforms Wave 主笔。

### Signature vocab

- AI-native cloud
- neocloud / neoclouds
- commodity cloud era is over
- the AI-native cloud is the new substrate
- two races（hyperscaler race + enterprise AI race）
- geopatriation
- sovereign AI / sovereign cloud
- agentic（用形容词形式，不用 "agent" 当形容词）
- composable
- private AI on private clouds
- the riches-to-RAGs shift
- "follow the money"

### Signature framing

- **Duality / two-races**：把市场动态 frame 成两个并行的 race（"X race AND Y race"）
- **否定常识**："the X era is over" / "Y is no longer the question"
- **拒绝 hype**："Follow the money. The numbers tell the story."
- **战略 thesis 框架**：把 Tencent 的选择 frame 成有意识的判断（"Tencent's bet is..."、"deliberately heterogeneous"）

### 避免

- 不要 `transformation`、`journey`、`empower` —— 标准 marketing 词
- 不要 `best-in-class`、`world-class` —— Lee 直接过滤

### 例（套用 Lee 的 voice）

```
The commodity-cloud era is over; the AI-native cloud is the new substrate. By "AI-native" we mean GPU economics, model serving and agentic orchestration as platform primitives — not bolt-ons.
```

---

## Gartner 题 → Lydia Leong voice

Lydia Leong 是 Gartner Strategic Cloud Platform Services MQ 主笔（cloudpundit.com 上的博客）。

### Signature vocab

- table stakes（基础门槛）
- actually（让步语气）
- good enough
- no-go
- hyperscaler（不带连字符）
- "the [X] question"

### Signature framing

- **务实怀疑论**：把 vendor 的话当 marketing 默认拆解
- **直说弱点 → "however, ..."**
- **反讽**：用 "of course"、"naturally"、"as one might expect" 暗示讽刺
- **量化优先于形容**：用百分比、数字、SLA 替代形容词
- **挑战常识**：用 "actually" 引导反 conventional wisdom 的判断

### 避免

- 不要 `innovative` —— 她讨厌这个词，认为它 = 没说明白
- 不要 `ecosystem` 抽象用 —— 必须具体到 partner 数量、ISV 数量
- 不要承诺还没 GA 的能力当作现有能力 —— 她会 cross-check 公开 roadmap

### 例（套用 Lydia 的 voice）

```
Most hyperscalers package these as separate products with separate billing and IAM. Tencent Cloud unifies them under one control plane, so the same RBAC policy works from MySQL to vector DB. This matters for AI-native applications where a single agent invocation may touch transactional data, vectors, and a graph in one request.
```

---

## Gartner 云市场 / 预测题 → Sid Nag voice

Sid Nag 主导过 Gartner 云市场预测系列。即使他离开了，他的 vocab 仍是 Gartner 内部默认。

### Signature vocab

- **CIPS**（Cloud Infrastructure and Platform Services —— 把 IaaS+PaaS 合并为一个市场）
- **unabatedly**（"continues unabatedly", "growing unabatedly"）
- **multicloud adoption model**（不要说 "multi-cloud strategy"）
- **workloads of today are complex**（永远不假设 workload 简单）
- repatriation 作为话题（但默认 frame 成 myth）

### Signature framing

- **绝对副词代替 hedge**：用 "unabatedly" 替代 "continues to grow"
- **trend frame 成不可逆**
- **customer-active 视角**："organizations are deploying X" 而非 "we provide X"

### 例（套用 Sid 的 voice）

```
Organizations deploying a multicloud adoption model continue to drive CIPS spend unabatedly. The use of AI technologies in IT and business operations is unabatedly accelerating the role of cloud computing in supporting business operations and outcomes.
```

---

## Omdia 题 → Roy Illsley voice

Roy Illsley 是 Omdia 主分析师（写 AIOps Universe、CloudOps Universe 等）。

### Signature vocab

- "in all its different forms"（cloud 绝不单数化 —— 必拆 private/hybrid/public/SaaS）
- "risk management framework"
- "the economics of [tech]"
- "all about [X]"（"sovereignty is all about risk management"）

### Signature framing

- **用 framework 视角而非功能视角**
- **主权 = risk management，不是 compliance**
- **AI 必谈 unit economics**（per token / per inference / per GPU-hour）
- **数据必引 Omdia 自家 survey 数字**（Omdia ICT Enterprise Insights Survey）

### 例（套用 Roy 的 voice）

```
Sovereignty is becoming a risk management framework, not a compliance feature. Customers in EU, ASEAN and MENA increasingly need verifiable operational sovereignty plus technological sovereignty. Tencent Cloud Sovereign provides both, with operations independently licensed in jurisdiction.
```

---

## IDC 题 → Dave McCarthy voice

Dave McCarthy 是 IDC 云与边缘基础设施 VP。

### Signature vocab

- **digital infrastructure**（覆盖 cloud + edge + colo + interconnect 的伞概念）
- **TCO**（total cost of ownership）
- **AI efficiency gap**
- "Including X in your strategy"

### Signature framing

- **TCO 优先于 capability**
- **"Including X in your strategy" 句式**
- **跨 deployment model 连贯叙述**（cloud + edge + on-prem 是一个连续谱）

### 例（套用 Dave 的 voice）

```
Including private AI in your digital infrastructure strategy requires evaluating TCO across cloud, edge and on-premises deployment models. Tencent Cloud Edge Solutions provides a single management plane covering all three, eliminating the operational tax of stitching separate stacks.
```

---

## 通用反 marketing 词典（不管哪个分析师都不要用）

| 厂商爱说 | 替换为 |
|---|---|
| best-in-class | 删掉，用具体数字代替 |
| world-class | 删掉 |
| industry-leading | 删掉 |
| seamless | 用具体的 "no manual integration" / "single API" |
| transformation | 用具体的 outcome（"reduced X by Y%"） |
| empower | 删掉，改用具体动词 |
| journey | 改成 "migration"、"adoption" |
| holistic | 用具体的 "covering A, B, C, D" |
| innovative | 改成具体的 innovation 内容 |
| state-of-the-art | 删掉 |
| revolutionary | 删掉 |
| game-changing | 删掉 |
| unparalleled | 删掉 |
| cutting-edge | 删掉 |
| comprehensive | 用具体的列表代替 |
| robust | 用具体的 SLA 代替 |
| scalable | 用 "scales to [specific number]" |
| flexible | 用 "supports [specific deployment models]" |

## 何时混用多个 voice

如果一道题跨 macro（如 Gartner 既问产品能力又问 vision），按段落切换 voice：

- 产品能力段：Lydia Leong
- vision 段：Sid Nag（如果是云市场判断）或保持 Lydia Leong（如果是产品愿景）

如果 conflict，**优先选 Lydia Leong**（她是 Strategic Cloud MQ 主笔，权重最高）。
