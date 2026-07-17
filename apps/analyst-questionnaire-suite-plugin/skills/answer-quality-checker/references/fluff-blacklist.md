# Marketing Fluff Blacklist

> 分析师瞬间过滤的空词。每个都触发 `[ERROR]`，附建议替换。
>
> 这个文件是个**活清单**——发现新的 fluff 就加进来。

## 形容词级 fluff（最高频）

| Fluff | 为什么是 fluff | 建议替换 |
|---|---|---|
| world-class | 无可验证含义 | 删掉，用具体数字代替 |
| best-in-class | 同上 | 同上 |
| industry-leading | 无可验证含义 | 用 "X% market share" 或 "ranked #N by [analyst]" |
| state-of-the-art | 无可验证含义 | 用具体技术名称 |
| cutting-edge | 同上 | 同上 |
| revolutionary | 同上 | 删掉 |
| groundbreaking | 同上 | 删掉 |
| game-changing | 同上 | 删掉 |
| unparalleled | 无可验证含义 | 删掉，用具体对比数据 |
| unmatched | 同上 | 同上 |
| comprehensive | 抽象 | 改成 "covering A, B, C, D" |
| robust | 抽象 | 改成具体 SLA / capacity 数字 |
| scalable | 抽象 | 改成 "scales to [specific number]" |
| flexible | 抽象 | 改成 "supports [specific deployment models]" |
| seamless | 抽象 | 改成 "no manual integration" / "single API" |
| holistic | 抽象 | 改成具体 list |
| end-to-end | 抽象 | 改成 "from X to Y" |
| innovative | Lydia Leong 直接过滤 | 改成具体的 innovation 内容 |

## 动词级 fluff

| Fluff | 建议替换 |
|---|---|
| empower | 删掉，用具体动词（"enables", "lets", "supports"）|
| transform | 用具体 outcome（"reduced X by Y%"） |
| revolutionize | 删掉 |
| streamline | 改成具体 efficiency 提升数据 |
| optimize | 改成具体 metric 改进 |
| leverage | 改成 "use" |
| harness | 改成 "use" |
| unlock | 改成 "enable" + 具体 outcome |

## 名词级 fluff

| Fluff | 建议替换 |
|---|---|
| journey | 改成 "migration" / "adoption" / "rollout" |
| transformation | 删掉，用具体 outcome |
| ecosystem | 用具体的 partner 数 / ISV 数 / community size |
| solution | 用具体的产品名 |
| platform | 用具体的产品名 |
| paradigm | 删掉 |
| synergy | 删掉 |
| value proposition | 删掉，直接说 value 是什么 |

## 副词 / 修饰 fluff

| Fluff | 建议处理 |
|---|---|
| highly | 删掉 |
| extensively | 删掉 |
| comprehensively | 删掉 |
| seamlessly | 删掉 |
| robustly | 删掉 |
| effortlessly | 删掉 |
| significantly | 改成具体 percentage |
| dramatically | 改成具体 percentage |
| substantially | 改成具体 percentage |

## Hedge 词（这些是浪费字数 + 显得不自信）

| Hedge | 建议处理 |
|---|---|
| we believe | 删掉（除非真的是观点 + NDA 模式 OK） |
| we think | 删掉 |
| in our view | 删掉 |
| arguably | 删掉 |
| essentially | 删掉 |
| basically | 删掉 |
| generally | 删掉，要么具体要么删 |
| typically | 删掉，用 "in [N]% of cases" |

## 上下文相关 fluff（部分场景不算 fluff）

这些词在特定语境下 OK，但需要 case-by-case 判断：

| Word | OK 的语境 | Fluff 的语境 |
|---|---|---|
| innovative | "innovative use of [specific tech]" | "we are innovative" |
| leading | "leading provider of X in Y region" | "we are leading" |
| advanced | "advanced encryption (AES-256-GCM)" | "we have advanced features" |
| modern | "modern (cloud-native) architecture" | "we have modern technology" |
| smart | "smart routing using [algorithm]" | "we have smart features" |
| intelligent | "intelligent auto-scaling based on [metric]" | "we are intelligent" |
| AI-powered | "AI-powered anomaly detection (specific model)" | "AI-powered everything" |
| next-generation | "next-generation [specific tech]" | "next-generation solution" |

Lint 规则：默认报 ERROR，但如果后接具体描述 / 名词 / 数字（在 5 个 token 内），降级为 WARN（"可能 OK，建议 Kevin review"）。

## 中文 fluff

中文答案里同样要避免：

| Fluff | 建议替换 |
|---|---|
| 行业领先 | 删掉，用市占数据 |
| 业界领先 | 同上 |
| 全面 | 用具体列表 |
| 卓越 | 删掉 |
| 一流 | 删掉 |
| 顶尖 | 删掉 |
| 强大 | 用具体 capacity |
| 灵活 | 用具体 deployment options |
| 全方位 | 用具体 list |
| 端到端 | 用 "从 X 到 Y" |
| 一站式 | 用具体 service list |
| 极致 | 删掉 |
| 全栈 | 改成具体的 stack 描述 |
| 赋能 | 删掉，用具体 outcome |
| 助力 | 删掉，用具体 outcome |
| 打造 | 改成 "build" / "design" |
| 全面提升 | 用具体 percentage |
| 显著优化 | 用具体 percentage |
| 革命性 | 删掉 |
| 颠覆性 | 删掉 |

## 维护这个清单

发现新 fluff 时：

1. 加到对应分类
2. 写明为什么是 fluff
3. 给出建议替换
4. commit + push

Fluff 是 evergreen pattern，但**新词每年会出现**（如近年 "agentic" 滥用、2026 "AI-native everything" 滥用）。

## 输出格式

每个命中输出：

```
[ERROR] Q5 EN, line 8: 含 fluff "world-class"
  Suggested fix: 删除 + 用具体数字代替
  Example: "Maintains 99.995% availability SLA across 21 regions"
```
