# CN → EN 翻译重写规则

> Skill 在 Phase 5 用。**不是翻译，是 reframing**。

## 核心规则

中文表达和英文表达**结构不同 + 重心不同 + 动词不同**。直译会把分析师厌恶的中文 marketing 风格带进英文。

## 必做的 5 类 reframing

### 1. 形容词 → 量化

| 中文（直译会写） | 英文（应该写） |
|---|---|
| 我们的稳定性很好 | Maintains 99.995% availability SLA across 21 regions |
| 性能领先 | p99 latency below 30ms cross-region |
| 大规模 | At >10B requests/day |
| 广泛覆盖 | Across 21 commercial regions in 9 jurisdictions |
| 高可用 | 5-region active-active with cross-region strong consistency |
| 性价比突出 | [X]% lower than [competitor] published list price for equivalent SKU |

### 2. 厂商主动 → 客户主动

| 中文（厂商主动） | 英文（客户主动） |
|---|---|
| 我们提供 X 能力 | Customers deploy X to ... |
| 我们让客户能够 Y | Y enables customers to ... |
| 我们帮助客户 Z | Customers achieve Z by ... |
| 我们的 X 服务支持 Y | X supports Y |

例外：自己的 differentiation 论证里可以厂商主动 —— "Tencent Cloud unifies these under one control plane"。

### 3. 抽象优势 → 具体动作

| 中文 | 英文 |
|---|---|
| 我们的安全做得很全面 | Spans VPC perimeter, internet edge, and east-west boundary, with 5-min threat-intel sync |
| 用户体验好 | Setup in under 90 seconds without engineer involvement |
| 运维省心 | >70% of database tickets auto-resolved without engineer escalation |
| 开发者友好 | Single CLI installation; SDK published for 7 languages including Go and Rust |

### 4. "我们" → "Tencent Cloud" 或省略主语

中文里"我们"很自然。英文里：

- 介绍 feature 时：**省略主语**（"Spans VPC perimeter..."）
- 介绍 strategy 时：**用 "Tencent Cloud"** 或 "Tencent Cloud's [thing]"
- **永远不用 "we"** —— 会被分析师视为 vendor talking points

### 5. 中文一段 → 英文可能要拆成 2-3 段

中文一段 200 字 ≈ 英文一段 500 char。但如果中文一段塞了 4 个不同主题，**英文应该拆成 2-3 段**。段落用空行分隔，不要让分析师在一长段里找东西。

## Vocabulary substitution（按机构选）

详见 [analyst-voice-profiles.md](analyst-voice-profiles.md)。简表：

| 机构 | 默认 voice | 关键 vocab |
|---|---|---|
| Forrester | Lee Sustar | AI-native cloud, neocloud, commodity-cloud-era, two races, geopatriation |
| Gartner（产品能力） | Lydia Leong | table stakes, actually, hyperscaler, good enough |
| Gartner（云市场） | Sid Nag | CIPS, unabatedly, multicloud adoption model |
| Omdia | Roy Illsley | risk management framework, unit economics, "all about X" |
| IDC | Dave McCarthy | digital infrastructure, TCO, AI efficiency gap |

## 字数压缩技巧（英文超 1500 char 时按顺序用）

1. **删 hedge 词**：`we believe`, `in our view`, `we think`, `arguably`, `essentially` —— 全删
2. **合并量化**：`21 regions and 12 jurisdictions` → `21 regions across 12 jurisdictions`
3. **缩简称**：`Cloud Workload Protection` → `CWP`（首次全名 + 缩写后用缩写）
4. **删 marketing 副词**：`highly`, `extensively`, `comprehensively`, `seamlessly` —— 全删
5. **改长句为短句**：英文一句超过 30 word 通常可拆
6. **合并并列**：`A, B, C, and D` 4 项可压成 `A through D` 如果它们在同一系列
7. **数字而非文字**：`twenty-one` → `21`（除非句首）

## 反模式 / 不许这么 translate

| 不要这么写（直译） | 应该这么写（reframe） |
|---|---|
| We have built a very comprehensive security solution | Spans VPC perimeter, internet edge, and east-west boundaries, with [specifics] |
| Our cloud platform empowers enterprises to achieve digital transformation | Customers run [workload] at [scale] on Tencent Cloud, including [specifics] |
| In recent years, we have continued to invest in AI capabilities | In the last 12 months: [specific launch], [specific launch], [specific launch] |
| We provide a wide range of products including A, B, C, D, E, F | A and B for [use case]; C-F for [other use case] |
| Our solution is industry-leading | [Specific metric] vs [specific competitor benchmark] |
| We help customers achieve their goals | Customers achieve [specific outcome] |
| Our innovative approach enables seamless integration | Single API; deployed in <30 minutes without code changes |

## Plain text 规则（同 [plain-text-rules.md](plain-text-rules.md)）

英文版同样**不能用 markdown**：

- 不要 `**bold**`
- 不要 `# heading`
- 不要 `[link](url)`
- 标签用 `Differentiation:` 单独成行 + 冒号 + 空行后正文

## 翻译完成后必跑的自检

```
[ ] 没有 "we" 出现（除非 NDA 模式下的 candid 表述）
[ ] 没有 "innovative", "world-class", "industry-leading", "best-in-class" 等空词
[ ] 没有 "transformation", "journey", "empower", "holistic" 等 marketing 词
[ ] 量化 token 出现至少 N 个（数字 + 单位，如 "99.995%", ">10B requests/day"）
[ ] 用了对应分析师 voice 的至少 2 个 signature vocab
[ ] 字数在 limit 内
[ ] 没有 markdown 字符 (`**`, `#`, `*`, `` ` ``, `[..](..)`)
```

## 例：CN → EN 完整 reframing 示例

**中文版**（团队 review 用）：

```
腾讯云的数据库产品组合涵盖常规 SQL 系列（TDSQL for MySQL/PostgreSQL/MariaDB，单集群多 PB 规模）、NoSQL（KV 引擎 KeeWiDB、MongoDB 兼容的 TencentDB）以及分布式缓存（Redis 兼容，多 TB 工作集）。

差异化：大多数超大规模厂商会将这些能力打包成独立产品、独立计费、独立 IAM。腾讯云将它们统一在同一控制平面下，从 MySQL 到向量库到图库共享同一套 RBAC 策略。
```

**英文版**（提交用）：

```
Tencent Cloud's database portfolio spans the conventional SQL set (TDSQL for MySQL/PostgreSQL/MariaDB at multi-PB single-cluster scale), NoSQL (KeeWiDB for KV, MongoDB-compatible TencentDB), and distributed cache (Redis-compatible at multi-TB working set).

Differentiation:

Most hyperscalers package these as separate products with separate billing and IAM. Tencent Cloud unifies them under one control plane, so the same RBAC policy works from MySQL to vector DB to graph.
```

注意 reframing 的 5 处：

1. "我们的" → "Tencent Cloud's"（不是 "Our"）
2. "多 PB 规模" → "at multi-PB single-cluster scale"（量化保留 + 加上 single-cluster 限定）
3. "差异化" → "Differentiation:"（plain text 标签，不是 `**Differentiation**`）
4. "大多数超大规模厂商" → "Most hyperscalers"（用分析师标准称呼）
5. "统一在同一控制平面下" → "unifies them under one control plane"（动词从被动 → 主动）
