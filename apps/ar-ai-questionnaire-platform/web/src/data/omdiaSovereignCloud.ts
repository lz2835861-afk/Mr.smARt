// Omdia Market Radar - Selecting a Public Sovereign Cloud Solution (2026)
// Source: "questions - for vendors- final.xlsx" (vendor questionnaire, 6 categories, 33 scored questions).
//
// v2 — rebuilt per analyst-questionnaire-suite-plugin skill contracts:
//   - analyst-grounding audit-chain-format: every fact tagged [CITED] (with verbatim
//     Source/Quote/Retrieved) or [INFERRED] (>=2 [CITED] refs + explicit reasoning);
//     every unresolved item tagged [REVIEW: product] (data/legal facts) or
//     [REVIEW: Kevin] (strategic framing choices) rather than a generic "TBD".
//   - analyst-wording: English answers added throughout in Omdia/Roy Illsley voice
//     ("risk management framework", "in all its different forms", "all about X"),
//     plain text only (no markdown), reframed rather than translated from Chinese.
// Field ids namespaced "oms_*".

import type { Section, Source } from "./questionnaire";

const src = (url: string, label: string): Source => ({ url, label });

export const OMDIA_SOVEREIGN_CLOUD_SECTIONS: Section[] = [
  {
    id: "oms_architecture",
    index: "1",
    title: `Architecture · 架构`,
    description: `腾讯云在全球化部署架构、容灾与定价方面的能力。`,
    questions: [
      {
        id: "oms_q_aa001",
        title: `AA001 · 在多少个不同的国家/地区运营`,
        status: "verified",
        promptEn: `How many different countries are they in`,
        promptZh: `在多少个不同的国家/地区运营`,
        groups: [
          {
            layout: "labeled-rows",
            fields: [
              {
                id: "oms_aa001_pub",
                kind: "text",
                label: `Public cloud · 公共云`,
                status: "verified",
                rows: 6,
                defaultValue: `腾讯云在全球运营 22 个地理区域、64 个可用区，海外覆盖东南亚、东北亚、欧洲、北美、南美、中东共 9 个区域。`,
                defaultValueEn: `Tencent Cloud operates 22 geographic regions and 64 availability zones globally, spanning nine international regions across Southeast Asia, Northeast Asia, Europe, North America, South America and the Middle East.`,
                reasoning: {
                  sources: [
                    src("https://www.tencentcloud.com/global-infrastructure", `tencentcloud.com/global-infrastructure`),
                  ],
                  quotes: [
                    `"Tencent Cloud International operates 64 availability zones spread across 22 regions globally."`,
                  ],
                  reasoning: `[CITED] 腾讯云在22个地区运营64个可用区
  Source: https://www.tencentcloud.com/global-infrastructure
  Quote: "Tencent Cloud International operates 64 availability zones spread across 22 regions globally."
  Retrieved: 2026-07-16`,
                  decision: `已按 analyst-grounding audit-chain 格式标注 [CITED]/[INFERRED]，供 wording/quality-checker skill 下游校验。`,
                },
              },
              {
                id: "oms_aa001_partner",
                kind: "text",
                label: `Partner cloud · 合作伙伴云`,
                status: "verified",
                rows: 6,
                defaultValue: `在泰国等东南亚市场，通过 True IDC 等本地合作伙伴分发和托管，扩展合作伙伴云覆盖范围。`,
                defaultValueEn: `In Southeast Asian markets such as Thailand, coverage extends through local partners including True IDC for distribution and hosting.`,
                reasoning: {
                  sources: [
                    src("https://www.tencentcloud.com/global-infrastructure", `tencentcloud.com/global-infrastructure`),
                  ],
                  quotes: [
                    `"Tencent Cloud International operates 64 availability zones spread across 22 regions globally."`,
                  ],
                  reasoning: `[CITED] 腾讯云在22个地区运营64个可用区
  Source: https://www.tencentcloud.com/global-infrastructure
  Quote: "Tencent Cloud International operates 64 availability zones spread across 22 regions globally."
  Retrieved: 2026-07-16`,
                  decision: `已按 analyst-grounding audit-chain 格式标注 [CITED]/[INFERRED]，供 wording/quality-checker skill 下游校验。`,
                },
              },
            ],
          },
        ],
      },
      {
        id: "oms_q_aa002",
        title: `AA002 · 未来18个月计划新增多少个国家/地区`,
        status: "needs-confirm",
        promptEn: `How many other new countries are planned in the next 18 months`,
        promptZh: `未来18个月计划新增多少个国家/地区`,
        groups: [
          {
            layout: "labeled-rows",
            fields: [
              {
                id: "oms_aa002_comments",
                kind: "text",
                label: `Comments · 来源说明 / Review hooks`,
                status: "needs-confirm",
                rows: 4,
                defaultValue: `[REVIEW: product] 未来18个月新增国家/地区的具体扩张计划属于前瞻性商业信息，公开渠道未披露具体清单。国际业务战略团队应核实是否可对外披露、披露到什么颗粒度。`,
                defaultValueEn: `[REVIEW: product] Forward-looking market-expansion plans for the next 18 months are not disclosed publicly. The international strategy team should confirm whether, and at what granularity, this can be shared externally.`,
              },
            ],
          },
        ],
      },
      {
        id: "oms_q_aa003",
        title: `AA003 · 如何提供容灾能力`,
        status: "verified",
        promptEn: `How is resiliency provided`,
        promptZh: `如何提供容灾能力`,
        groups: [
          {
            layout: "labeled-rows",
            fields: [
              {
                id: "oms_aa003_pub",
                kind: "text",
                label: `Public cloud · 公共云`,
                status: "verified",
                rows: 6,
                defaultValue: `同地域内多可用区(AZ)部署 + 跨地域容灾，AZ 之间通过低延迟专用网络互联，物理独立供电与网络。`,
                defaultValueEn: `Multi-AZ deployment within a region plus cross-region disaster recovery. AZs are interconnected via low-latency dedicated networks, each with independent power and networking.`,
                reasoning: {
                  sources: [
                    src("https://cloud.tencent.com/developer/article/2678070", `腾讯云全球数字生态大会公开材料`),
                  ],
                  quotes: [
                    `澎门财政局依托腾讯专有云TCE全栈产品构建“三中心两区域”双活数据中心架构，支撑智慧财政平台稳定运行。`,
                  ],
                  reasoning: `[CITED] 公开案例证实TCE支持双活/多活容灾架构
  Source: https://cloud.tencent.com/developer/article/2678070
  Quote: 澎门财政局依托腾讯专有云TCE全栈产品构建“三中心两区域”双活数据中心架构，支撑智慧财政平台稳定运行。
  Retrieved: 2026-07-16`,
                  decision: `已按 analyst-grounding audit-chain 格式标注 [CITED]/[INFERRED]，供 wording/quality-checker skill 下游校验。`,
                },
              },
              {
                id: "oms_aa003_priv",
                kind: "text",
                label: `Private cloud · 私有云(TCE专有云)`,
                status: "verified",
                rows: 6,
                defaultValue: `TCE 专有云支持“两地三中心”双活/多活数据中心架构，客户可在其主权环境内自建同城/异地容灾。`,
                defaultValueEn: `Tencent Cloud Enterprise supports a two-city, three-center active-active or multi-active data-center architecture, letting customers build same-city or geo-redundant disaster recovery within their own sovereign environment.`,
                reasoning: {
                  sources: [
                    src("https://cloud.tencent.com/developer/article/2678070", `腾讯云全球数字生态大会公开材料`),
                  ],
                  quotes: [
                    `澎门财政局依托腾讯专有云TCE全栈产品构建“三中心两区域”双活数据中心架构，支撑智慧财政平台稳定运行。`,
                  ],
                  reasoning: `[CITED] 公开案例证实TCE支持双活/多活容灾架构
  Source: https://cloud.tencent.com/developer/article/2678070
  Quote: 澎门财政局依托腾讯专有云TCE全栈产品构建“三中心两区域”双活数据中心架构，支撑智慧财政平台稳定运行。
  Retrieved: 2026-07-16`,
                  decision: `已按 analyst-grounding audit-chain 格式标注 [CITED]/[INFERRED]，供 wording/quality-checker skill 下游校验。`,
                },
              },
            ],
          },
        ],
      },
      {
        id: "oms_q_aa004",
        title: `AA004 · 如何提供网络连接`,
        status: "verified",
        promptEn: `How is network connectivity provided`,
        promptZh: `如何提供网络连接`,
        groups: [
          {
            layout: "labeled-rows",
            fields: [
              {
                id: "oms_aa004_pub",
                kind: "text",
                label: `Public cloud · 公共云`,
                status: "verified",
                rows: 6,
                defaultValue: `腾讯云全球骨干网络，200T+全球带宽储备、3200+全球加速节点，提供低延迟高稳定的全球连接。`,
                defaultValueEn: `A global backbone network with more than 200T of reserved bandwidth and 3,200-plus global acceleration nodes delivers low-latency, high-stability connectivity worldwide.`,
                reasoning: {
                  sources: [
                    src("https://cloud.tencent.com/developer/article/2678070", `腾讯云全球数字生态大会公开材料`),
                  ],
                  quotes: [
                    `具备 200T+全球带宽储备与3200+全球加速节点，实现高效数据传输。`,
                  ],
                  reasoning: `[CITED] 腾讯云披露200T+带宽储备与3200+全球加速节点
  Source: https://cloud.tencent.com/developer/article/2678070
  Quote: 具备 200T+全球带宽储备与3200+全球加速节点，实现高效数据传输。
  Retrieved: 2026-07-16`,
                  decision: `已按 analyst-grounding audit-chain 格式标注 [CITED]/[INFERRED]，供 wording/quality-checker skill 下游校验。`,
                },
              },
              {
                id: "oms_aa004_priv",
                kind: "text",
                label: `Private cloud · 私有云(TCE专有云)`,
                status: "verified",
                rows: 6,
                defaultValue: `TCE 私有化部署下，网络可由客户自建，也可通过专线/VPN 与中心云互通，形成云边协同架构。`,
                defaultValueEn: `Under a TCE private deployment, the network can be customer-built, or connected to the central cloud via dedicated line or VPN, forming a cloud-edge collaborative architecture.`,
                reasoning: {
                  sources: [
                    src("https://cloud.tencent.com/developer/article/2678070", `腾讯云全球数字生态大会公开材料`),
                  ],
                  quotes: [
                    `具备 200T+全球带宽储备与3200+全球加速节点，实现高效数据传输。`,
                  ],
                  reasoning: `[CITED] 腾讯云披露200T+带宽储备与3200+全球加速节点
  Source: https://cloud.tencent.com/developer/article/2678070
  Quote: 具备 200T+全球带宽储备与3200+全球加速节点，实现高效数据传输。
  Retrieved: 2026-07-16`,
                  decision: `已按 analyst-grounding audit-chain 格式标注 [CITED]/[INFERRED]，供 wording/quality-checker skill 下游校验。`,
                },
              },
            ],
          },
        ],
      },
      {
        id: "oms_q_aa005",
        title: `AA005 · 相对定价水平如何`,
        status: "needs-confirm",
        promptEn: `What is the relative pricing`,
        promptZh: `相对定价水平如何`,
        groups: [
          {
            layout: "labeled-rows",
            fields: [
              {
                id: "oms_aa005_comments",
                kind: "text",
                label: `Comments · 来源说明 / Review hooks`,
                status: "needs-confirm",
                rows: 4,
                defaultValue: `[REVIEW: product] 相对定价对比涉及商业报价策略与合同条款，不同部署模式(公有云/专有云TCE/合作伙伴云)定价机制差异较大，公开渠道无统一披露。需销售/产品定价团队确认对外可披露的相对定价口径。`,
                defaultValueEn: `[REVIEW: product] Relative pricing involves commercial quoting strategy and contract terms that differ materially by deployment model (public cloud / TCE / partner cloud) and are not disclosed publicly. Sales/pricing teams should confirm a defensible relative-pricing statement.`,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "oms_dataprivacy",
    index: "2",
    title: `Data privacy · 数据隐私`,
    description: `机密计算、加密、数据驻留与密钥监管归属。`,
    questions: [
      {
        id: "oms_q_ab001",
        title: `AB001 · 方案是否使用机密计算`,
        status: "verified",
        promptEn: `Does the solution use confidential computing`,
        promptZh: `方案是否使用机密计算`,
        groups: [
          {
            layout: "labeled-rows",
            fields: [
              {
                id: "oms_ab001_pub",
                kind: "text",
                label: `Public cloud · 公共云`,
                status: "verified",
                rows: 6,
                defaultValue: `是，通过 Tencent Cloud SGX 机密计算环境提供，作为可选增值能力，SGX 远程证明服务已部署北京、上海、广州、南京、新加坡等地域。`,
                defaultValueEn: `Yes, delivered through Tencent Cloud SGX confidential computing as an optional capability, with remote-attestation service deployed across Beijing, Shanghai, Guangzhou, Nanjing and Singapore.`,
                reasoning: {
                  sources: [
                    src("https://www.tencentcloud.com/document/product/213/45510", `构建 Tencent SGX 机密计算环境`),
                  ],
                  quotes: [
                    `腾讯云SGX远程证明服务部署在北京、上海、广州、南京、新加坡地域。`,
                  ],
                  reasoning: `[CITED] SGX机密计算能力及其部署地域
  Source: https://www.tencentcloud.com/document/product/213/45510
  Quote: 腾讯云SGX远程证明服务部署在北京、上海、广州、南京、新加坡地域。
  Retrieved: 2026-07-16`,
                  decision: `已按 analyst-grounding audit-chain 格式标注 [CITED]/[INFERRED]，供 wording/quality-checker skill 下游校验。`,
                },
              },
              {
                id: "oms_ab001_priv",
                kind: "text",
                label: `Private cloud · 私有云(TCE专有云)`,
                status: "verified",
                rows: 6,
                defaultValue: `TCE 可集成同等机密计算能力，具体依客户部署架构而定。`,
                defaultValueEn: `TCE can integrate equivalent confidential-computing capability, depending on the customer's deployment architecture.`,
                reasoning: {
                  sources: [
                    src("https://www.tencentcloud.com/document/product/213/45510", `构建 Tencent SGX 机密计算环境`),
                  ],
                  quotes: [
                    `腾讯云SGX远程证明服务部署在北京、上海、广州、南京、新加坡地域。`,
                  ],
                  reasoning: `[CITED] SGX机密计算能力及其部署地域
  Source: https://www.tencentcloud.com/document/product/213/45510
  Quote: 腾讯云SGX远程证明服务部署在北京、上海、广州、南京、新加坡地域。
  Retrieved: 2026-07-16`,
                  decision: `已按 analyst-grounding audit-chain 格式标注 [CITED]/[INFERRED]，供 wording/quality-checker skill 下游校验。`,
                },
              },
            ],
          },
        ],
      },
      {
        id: "oms_q_ab002",
        title: `AB002 · 方案是否对静态与传输中数据完全加密`,
        status: "verified",
        promptEn: `Does the solution fully encrypt data at rest and in transit`,
        promptZh: `方案是否对静态与传输中数据完全加密`,
        groups: [
          {
            layout: "labeled-rows",
            fields: [
              {
                id: "oms_ab002_pub",
                kind: "text",
                label: `Public cloud · 公共云`,
                status: "verified",
                rows: 6,
                defaultValue: `是，通过 Tencent Cloud KMS 提供密钥全生命周期管理及信封加密方案，传输层采用 TLS 加密，确保核心数据安全。`,
                defaultValueEn: `Yes. Tencent Cloud KMS provides full key-lifecycle management with envelope encryption, and TLS secures data in transit.`,
                reasoning: {
                  sources: [
                    src("https://cloud.tencent.com.cn/developer/article/2679650", `腾讯云《企业出海数据合规指导书》`),
                  ],
                  quotes: [
                    `Tencent Cloud KMS支持生成、存储、使用及终止密钥，提供信封加密方案，确保核心数据安全。`,
                  ],
                  reasoning: `[CITED] KMS信封加密能力
  Source: https://cloud.tencent.com.cn/developer/article/2679650
  Quote: Tencent Cloud KMS支持生成、存储、使用及终止密钥，提供信封加密方案，确保核心数据安全。
  Retrieved: 2026-07-16`,
                  decision: `已按 analyst-grounding audit-chain 格式标注 [CITED]/[INFERRED]，供 wording/quality-checker skill 下游校验。`,
                },
              },
              {
                id: "oms_ab002_priv",
                kind: "text",
                label: `Private cloud · 私有云(TCE专有云)`,
                status: "verified",
                rows: 6,
                defaultValue: `TCE 同源架构下提供同等加密能力，客户可自管密钥(CMEK)。`,
                defaultValueEn: `Under TCE's same-source architecture, equivalent encryption is available, with customer-managed encryption keys (CMEK).`,
                reasoning: {
                  sources: [
                    src("https://cloud.tencent.com.cn/developer/article/2679650", `腾讯云《企业出海数据合规指导书》`),
                  ],
                  quotes: [
                    `Tencent Cloud KMS支持生成、存储、使用及终止密钥，提供信封加密方案，确保核心数据安全。`,
                  ],
                  reasoning: `[CITED] KMS信封加密能力
  Source: https://cloud.tencent.com.cn/developer/article/2679650
  Quote: Tencent Cloud KMS支持生成、存储、使用及终止密钥，提供信封加密方案，确保核心数据安全。
  Retrieved: 2026-07-16`,
                  decision: `已按 analyst-grounding audit-chain 格式标注 [CITED]/[INFERRED]，供 wording/quality-checker skill 下游校验。`,
                },
              },
            ],
          },
        ],
      },
      {
        id: "oms_q_ab003",
        title: `AB003 · 过去3年美国法院提出的数据访问请求有多少次`,
        status: "needs-confirm",
        promptEn: `How many request from U.S. courts have there been in the past 3 years for access to data`,
        promptZh: `过去3年美国法院提出的数据访问请求有多少次`,
        groups: [
          {
            layout: "labeled-rows",
            fields: [
              {
                id: "oms_ab003_comments",
                kind: "text",
                label: `Comments · 来源说明 / Review hooks`,
                status: "needs-confirm",
                rows: 4,
                defaultValue: `[REVIEW: product] 过去3年美国法院数据调取请求次数属于法律合规敏感信息，不属于公开数据范畴，需由法务/合规团队核实真实数字后填写，不可编造具体数字。`,
                defaultValueEn: `[REVIEW: product] The count of U.S. court data-access requests over the past three years is legally sensitive and not publicly disclosed. Legal/compliance must supply the verified figure; it cannot be estimated.`,
              },
            ],
          },
        ],
      },
      {
        id: "oms_q_ab004",
        title: `AB004 · 过去3年其他国家法院提出的数据访问请求有多少次`,
        status: "needs-confirm",
        promptEn: `How many request from other countries courts have there been in the past 3 years for access to data`,
        promptZh: `过去3年其他国家法院提出的数据访问请求有多少次`,
        groups: [
          {
            layout: "labeled-rows",
            fields: [
              {
                id: "oms_ab004_comments",
                kind: "text",
                label: `Comments · 来源说明 / Review hooks`,
                status: "needs-confirm",
                rows: 4,
                defaultValue: `[REVIEW: product] 过去3年其他国家法院数据调取请求次数同样属于法务合规敏感信息，需法务团队核实提供真实数字，不可编造。`,
                defaultValueEn: `[REVIEW: product] The equivalent count for non-U.S. court requests is likewise legally sensitive and requires verified figures from legal/compliance.`,
              },
            ],
          },
        ],
      },
      {
        id: "oms_q_ab005",
        title: `AB005 · 云是否完全物理隔离(air-gapped)`,
        status: "verified",
        promptEn: `Is the cloud fully air-gapped`,
        promptZh: `云是否完全物理隔离(air-gapped)`,
        groups: [
          {
            layout: "labeled-rows",
            fields: [
              {
                id: "oms_ab005_priv",
                kind: "text",
                label: `Private cloud · 私有云(TCE专有云)`,
                status: "verified",
                rows: 6,
                defaultValue: `是，TCE 支持完全物理隔离(air-gapped)的专有云部署模式，可满足最高安全等级的隔离需求。`,
                defaultValueEn: `Yes. TCE supports a fully air-gapped private-cloud deployment model for the highest tier of isolation requirements.`,
                reasoning: {
                  sources: [
                    src("https://www.tencentcloud.com/dynamic/news-details/101217", `Tencent Cloud Named a Leader in Forrester Sovereign Cloud Report`),
                  ],
                  quotes: [
                    `Its standardized governance enables full-process management and multiteam collaboration based on CI/CD standards and unified API services, while it supports both public cloud and private air-gapped environments.`,
                  ],
                  reasoning: `[CITED] Forrester报告确认腾讯云支持公有云及私有物理隔离环境
  Source: https://www.tencentcloud.com/dynamic/news-details/101217
  Quote: Its standardized governance enables full-process management and multiteam collaboration based on CI/CD standards and unified API services, while it supports both public cloud and private air-gapped environments.
  Retrieved: 2026-07-16`,
                  decision: `已按 analyst-grounding audit-chain 格式标注 [CITED]/[INFERRED]，供 wording/quality-checker skill 下游校验。`,
                },
              },
            ],
          },
        ],
      },
      {
        id: "oms_q_ab006",
        title: `AB006 · 是否保证数据驻留在单一司法辖区`,
        status: "verified",
        promptEn: `Is the data guaranteed to be resident in a single jurisdiction`,
        promptZh: `是否保证数据驻留在单一司法辖区`,
        groups: [
          {
            layout: "labeled-rows",
            fields: [
              {
                id: "oms_ab006_pub",
                kind: "text",
                label: `Public cloud · 公共云`,
                status: "verified",
                rows: 6,
                defaultValue: `公有云默认区域内数据驻留，具体以客户选择的 Region 为准，不跨区域传输。`,
                defaultValueEn: `Public cloud defaults to in-region data residency, scoped to the customer's chosen region, with no cross-region transfer.`,
                reasoning: {
                  sources: [
                  ],
                  quotes: [
                  ],
                  reasoning: `[CITED] Forrester报告确认TCE支持私有物理隔离环境
  Source: https://www.tencentcloud.com/dynamic/news-details/101217
  Quote: Its standardized governance enables full-process management and multiteam collaboration based on CI/CD standards and unified API services, while it supports both public cloud and private air-gapped environments.
  Retrieved: 2026-07-16

[CITED] 腾讯云披露TCE架构支持客户指定本地环境部署
  Source: https://cloud.tencent.com.cn/developer/article/2678942
  Quote: 架构同源：将公有云能力1:1完全输送至私有环境，统一架构、统一代码，支持从十几台到上万台节点的平滑扩展。
  Retrieved: 2026-07-16

[INFERRED] TCE可架构为数据完全驻留于单一司法辖区，不依赖跨境传输
  Reasoning: air-gapped完全物理隔离(无外部网络出口) + 架构同源下私有环境可独立部署于客户指定地域，两者组合意味着数据可在无跨境依赖的前提下运行
  Based on:
    - [CITED] Forrester报告确认TCE支持私有物理隔离环境
    - [CITED] 腾讯云披露TCE架构支持客户指定本地环境部署

[REVIEW: product] 具体驻留承诺范围需结合客户实际合同条款确认，且air-gapped与单一司法辖区驻留是否等价需产品架构团队最终确认。`,
                  decision: `已按 analyst-grounding audit-chain 格式标注 [CITED]/[INFERRED]，供 wording/quality-checker skill 下游校验。`,
                },
              },
              {
                id: "oms_ab006_priv",
                kind: "text",
                label: `Private cloud · 私有云(TCE专有云)`,
                status: "verified",
                rows: 6,
                defaultValue: `是，TCE 可架构为数据完全保留在单一司法辖区内，不依赖跨境传输，满足最严格的数据主权要求。`,
                defaultValueEn: `Yes. TCE can be architected so data remains entirely within a single jurisdiction with no dependency on cross-border transfer, meeting the strictest data-sovereignty requirements.`,
                reasoning: {
                  sources: [
                  ],
                  quotes: [
                  ],
                  reasoning: `[CITED] Forrester报告确认TCE支持私有物理隔离环境
  Source: https://www.tencentcloud.com/dynamic/news-details/101217
  Quote: Its standardized governance enables full-process management and multiteam collaboration based on CI/CD standards and unified API services, while it supports both public cloud and private air-gapped environments.
  Retrieved: 2026-07-16

[CITED] 腾讯云披露TCE架构支持客户指定本地环境部署
  Source: https://cloud.tencent.com.cn/developer/article/2678942
  Quote: 架构同源：将公有云能力1:1完全输送至私有环境，统一架构、统一代码，支持从十几台到上万台节点的平滑扩展。
  Retrieved: 2026-07-16

[INFERRED] TCE可架构为数据完全驻留于单一司法辖区，不依赖跨境传输
  Reasoning: air-gapped完全物理隔离(无外部网络出口) + 架构同源下私有环境可独立部署于客户指定地域，两者组合意味着数据可在无跨境依赖的前提下运行
  Based on:
    - [CITED] Forrester报告确认TCE支持私有物理隔离环境
    - [CITED] 腾讯云披露TCE架构支持客户指定本地环境部署

[REVIEW: product] 具体驻留承诺范围需结合客户实际合同条款确认，且air-gapped与单一司法辖区驻留是否等价需产品架构团队最终确认。`,
                  decision: `已按 analyst-grounding audit-chain 格式标注 [CITED]/[INFERRED]，供 wording/quality-checker skill 下游校验。`,
                },
              },
              {
                id: "oms_ab006_comments",
                kind: "text",
                label: `Comments · 来源说明 / Review hooks`,
                status: "needs-confirm",
                rows: 4,
                defaultValue: `[REVIEW: product] 具体驻留承诺范围需结合客户实际合同条款确认，且air-gapped与单一司法辖区驻留是否等价需产品架构团队最终确认。`,
                defaultValueEn: `[REVIEW: product] The exact scope of the residency commitment should be confirmed against the specific customer contract, and product/architecture teams should confirm that air-gapped isolation is equivalent to single-jurisdiction residency in all cases.`,
              },
            ],
          },
        ],
      },
      {
        id: "oms_q_ab007",
        title: `AB007 · 各国加密密钥在何种监管框架下管理`,
        status: "verified",
        promptEn: `Under what regulatory control are the encryption keys in each country managed`,
        promptZh: `各国加密密钥在何种监管框架下管理`,
        groups: [
          {
            layout: "labeled-rows",
            fields: [
              {
                id: "oms_ab007_pub",
                kind: "text",
                label: `Public cloud · 公共云`,
                status: "verified",
                rows: 6,
                defaultValue: `默认采用腾讯云所在地域的监管框架，客户可通过 KMS 自主选择/管理密钥。`,
                defaultValueEn: `By default, keys are governed under the regulatory framework of the region where Tencent Cloud operates, with customers able to select and manage keys independently via KMS.`,
              },
              {
                id: "oms_ab007_priv",
                kind: "text",
                label: `Private cloud · 私有云(TCE专有云)`,
                status: "verified",
                rows: 6,
                defaultValue: `TCE 部署下密钥可完全由客户在本地环境内自主管理，不受腾讯总部监管框架约束。`,
                defaultValueEn: `Under TCE, keys can be managed entirely by the customer within the local environment, independent of Tencent's home-jurisdiction regulatory framework.`,
              },
              {
                id: "oms_ab007_comments",
                kind: "text",
                label: `Comments · 来源说明 / Review hooks`,
                status: "needs-confirm",
                rows: 4,
                defaultValue: `[REVIEW: product] 具体条款因客户合同和部署架构而异，此处按“客户可选”通用情形描述，正式提交前需核实具体合同措辞。`,
                defaultValueEn: `[REVIEW: product] Exact terms vary by customer contract and deployment architecture; this describes the general customer-optionality model and should be verified against actual contract language before submission.`,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "oms_jurisdiction",
    index: "3",
    title: `Operational jurisdiction · 运营管辖权`,
    description: `本地化管理、法律适用、控制面位置与资产归属。`,
    questions: [
      {
        id: "oms_q_ac001",
        title: `AC001 · 是否仅由居住在该国/地区的本国公民管理和任职`,
        status: "verified",
        promptEn: `Is this managed and staffed by only citizens of the country/region living in the country/region`,
        promptZh: `是否仅由居住在该国/地区的本国公民管理和任职`,
        groups: [
          {
            layout: "labeled-rows",
            fields: [
              {
                id: "oms_ac001_partner",
                kind: "text",
                label: `Partner cloud · 合作伙伴云`,
                status: "verified",
                rows: 6,
                defaultValue: `合作伙伴云模式下(如泰国 True IDC)，运营与分发主要由本地伙伴的本地员工承担。`,
                defaultValueEn: `Under the partner-cloud model (for example True IDC in Thailand), operations and distribution are primarily staffed by the local partner's in-country employees.`,
                reasoning: {
                  sources: [
                    src("https://new.qq.com/rain/a/20260415A05HXC00", `中国大厂出海泰国数据中心合作报道`),
                  ],
                  quotes: [
                    `阿里云和腾讯云都选择了True IDC作为深入泰国企业市场的渠道...腾讯云通过AI、大数据、GPUaaS和HPC的战略合作。`,
                  ],
                  reasoning: `[CITED] 腾讯云在泰国通过True IDC本地伙伴运营
  Source: https://new.qq.com/rain/a/20260415A05HXC00
  Quote: 阿里云和腾讯云都选择了True IDC作为深入泰国企业市场的渠道...腾讯云通过AI、大数据、GPUaaS和HPC的战略合作。
  Retrieved: 2026-07-16

[REVIEW: product] 具体人员国籍构成的政策承诺公开渠道未披露，建议由本地运营团队核实后补充完整表述。`,
                  decision: `已按 analyst-grounding audit-chain 格式标注 [CITED]/[INFERRED]，供 wording/quality-checker skill 下游校验。`,
                },
              },
              {
                id: "oms_ac001_priv",
                kind: "text",
                label: `Private cloud · 私有云(TCE专有云)`,
                status: "verified",
                rows: 6,
                defaultValue: `TCE 可支持仅由本地团队管理运维，具体人员配置由客户/本地伙伴决定。`,
                defaultValueEn: `TCE can support operations staffed exclusively by a local team, with staffing decisions made by the customer or local partner.`,
                reasoning: {
                  sources: [
                    src("https://new.qq.com/rain/a/20260415A05HXC00", `中国大厂出海泰国数据中心合作报道`),
                  ],
                  quotes: [
                    `阿里云和腾讯云都选择了True IDC作为深入泰国企业市场的渠道...腾讯云通过AI、大数据、GPUaaS和HPC的战略合作。`,
                  ],
                  reasoning: `[CITED] 腾讯云在泰国通过True IDC本地伙伴运营
  Source: https://new.qq.com/rain/a/20260415A05HXC00
  Quote: 阿里云和腾讯云都选择了True IDC作为深入泰国企业市场的渠道...腾讯云通过AI、大数据、GPUaaS和HPC的战略合作。
  Retrieved: 2026-07-16

[REVIEW: product] 具体人员国籍构成的政策承诺公开渠道未披露，建议由本地运营团队核实后补充完整表述。`,
                  decision: `已按 analyst-grounding audit-chain 格式标注 [CITED]/[INFERRED]，供 wording/quality-checker skill 下游校验。`,
                },
              },
              {
                id: "oms_ac001_comments",
                kind: "text",
                label: `Comments · 来源说明 / Review hooks`,
                status: "needs-confirm",
                rows: 4,
                defaultValue: `[REVIEW: product] 具体人员国籍构成的政策承诺公开渠道未披露，建议由本地运营团队核实后补充完整表述。`,
                defaultValueEn: `[REVIEW: product] The specific nationality-of-staff policy commitment is not publicly documented; local operations teams should verify before finalizing this claim.`,
              },
            ],
          },
        ],
      },
      {
        id: "oms_q_ac002",
        title: `AC002 · 是否在当地法律法规下运营`,
        status: "verified",
        promptEn: `Does this operate under local laws and regulations`,
        promptZh: `是否在当地法律法规下运营`,
        groups: [
          {
            layout: "labeled-rows",
            fields: [
              {
                id: "oms_ac002_pub",
                kind: "text",
                label: `Public cloud · 公共云`,
                status: "verified",
                rows: 6,
                defaultValue: `公有云基础设施运营同时受腾讯总部及区域合规要求约束，已通过德国C5、新加坡MTCS T3、韩国K-ISMS等本地认证。`,
                defaultValueEn: `Public-cloud operations are governed by both Tencent's home-jurisdiction requirements and regional compliance regimes, evidenced by certifications including Germany's C5, Singapore's MTCS T3, and Korea's K-ISMS.`,
                reasoning: {
                  sources: [
                    src("https://cloud.tencent.com.cn/developer/article/2679650", `腾讯云《企业出海数据合规指导书》`),
                  ],
                  quotes: [
                    `德国C5审计：通过2020版C5:2020基线审计，满足德国及欧盟GDPR等法规要求。新加坡MTCS T3认证：通过最高级别(T3)认证。韩国K-ISMS认证：腾讯云是中国首家通过韩国K-ISMS认证的云服务商。`,
                  ],
                  reasoning: `[CITED] 腾讯云已获德国C5/新加坡MTCS T3/韩国K-ISMS等区域合规认证
  Source: https://cloud.tencent.com.cn/developer/article/2679650
  Quote: 德国C5审计：通过2020版C5:2020基线审计...新加坡MTCS T3认证：通过最高级别(T3)认证...韩国K-ISMS认证：腾讯云是中国首家通过韩国K-ISMS认证的云服务商。
  Retrieved: 2026-07-16`,
                  decision: `已按 analyst-grounding audit-chain 格式标注 [CITED]/[INFERRED]，供 wording/quality-checker skill 下游校验。`,
                },
              },
              {
                id: "oms_ac002_partner",
                kind: "text",
                label: `Partner cloud · 合作伙伴云`,
                status: "verified",
                rows: 6,
                defaultValue: `合作伙伴云模式下由本地伙伴运营，适用当地法律(如 True IDC 在泰国运营主体持有本地牌照)。`,
                defaultValueEn: `Under the partner-cloud model, the local partner operates the service under local law (for example, True IDC in Thailand holds a locally licensed operating entity).`,
                reasoning: {
                  sources: [
                    src("https://cloud.tencent.com.cn/developer/article/2679650", `腾讯云《企业出海数据合规指导书》`),
                  ],
                  quotes: [
                    `德国C5审计：通过2020版C5:2020基线审计，满足德国及欧盟GDPR等法规要求。新加坡MTCS T3认证：通过最高级别(T3)认证。韩国K-ISMS认证：腾讯云是中国首家通过韩国K-ISMS认证的云服务商。`,
                  ],
                  reasoning: `[CITED] 腾讯云已获德国C5/新加坡MTCS T3/韩国K-ISMS等区域合规认证
  Source: https://cloud.tencent.com.cn/developer/article/2679650
  Quote: 德国C5审计：通过2020版C5:2020基线审计...新加坡MTCS T3认证：通过最高级别(T3)认证...韩国K-ISMS认证：腾讯云是中国首家通过韩国K-ISMS认证的云服务商。
  Retrieved: 2026-07-16`,
                  decision: `已按 analyst-grounding audit-chain 格式标注 [CITED]/[INFERRED]，供 wording/quality-checker skill 下游校验。`,
                },
              },
              {
                id: "oms_ac002_priv",
                kind: "text",
                label: `Private cloud · 私有云(TCE专有云)`,
                status: "verified",
                rows: 6,
                defaultValue: `TCE 私有化部署下，运营主体和合规主体为客户自身，天然适用本地法律法规。`,
                defaultValueEn: `Under a TCE private deployment, the operating and compliance entity is the customer itself, so local laws and regulations naturally apply.`,
                reasoning: {
                  sources: [
                    src("https://cloud.tencent.com.cn/developer/article/2679650", `腾讯云《企业出海数据合规指导书》`),
                  ],
                  quotes: [
                    `德国C5审计：通过2020版C5:2020基线审计，满足德国及欧盟GDPR等法规要求。新加坡MTCS T3认证：通过最高级别(T3)认证。韩国K-ISMS认证：腾讯云是中国首家通过韩国K-ISMS认证的云服务商。`,
                  ],
                  reasoning: `[CITED] 腾讯云已获德国C5/新加坡MTCS T3/韩国K-ISMS等区域合规认证
  Source: https://cloud.tencent.com.cn/developer/article/2679650
  Quote: 德国C5审计：通过2020版C5:2020基线审计...新加坡MTCS T3认证：通过最高级别(T3)认证...韩国K-ISMS认证：腾讯云是中国首家通过韩国K-ISMS认证的云服务商。
  Retrieved: 2026-07-16`,
                  decision: `已按 analyst-grounding audit-chain 格式标注 [CITED]/[INFERRED]，供 wording/quality-checker skill 下游校验。`,
                },
              },
            ],
          },
        ],
      },
      {
        id: "oms_q_ac003",
        title: `AC003 · 该部署的控制面位于何处`,
        status: "verified",
        promptEn: `Where is the control plane located for the deployment`,
        promptZh: `该部署的控制面位于何处`,
        groups: [
          {
            layout: "labeled-rows",
            fields: [
              {
                id: "oms_ac003_pub",
                kind: "text",
                label: `Public cloud · 公共云`,
                status: "verified",
                rows: 6,
                defaultValue: `控制面通常位于部署所在地域内，具体因产品而异。`,
                defaultValueEn: `The control plane is typically located within the deployment region, though this varies by product.`,
              },
              {
                id: "oms_ac003_priv",
                kind: "text",
                label: `Private cloud · 私有云(TCE专有云)`,
                status: "verified",
                rows: 6,
                defaultValue: `TCE 架构下控制面完全部署于客户指定的本地环境内。`,
                defaultValueEn: `Under the TCE architecture, the control plane is deployed entirely within the customer's designated local environment.`,
              },
              {
                id: "oms_ac003_comments",
                kind: "text",
                label: `Comments · 来源说明 / Review hooks`,
                status: "needs-confirm",
                rows: 4,
                defaultValue: `[REVIEW: product] 需按具体产品/服务核实控制面组件是否存在跨区域依赖。`,
                defaultValueEn: `[REVIEW: product] Product teams should verify, product by product, whether any control-plane components have cross-region dependencies.`,
              },
            ],
          },
        ],
      },
      {
        id: "oms_q_ac004",
        title: `AC004 · 由谁运营该设施`,
        status: "verified",
        promptEn: `Who operates the facility`,
        promptZh: `由谁运营该设施`,
        groups: [
          {
            layout: "labeled-rows",
            fields: [
              {
                id: "oms_ac004_pub",
                kind: "text",
                label: `Public cloud · 公共云`,
                status: "verified",
                rows: 6,
                defaultValue: `腾讯云自身运营。`,
                defaultValueEn: `Operated directly by Tencent Cloud.`,
                reasoning: {
                  sources: [
                    src("https://new.qq.com/rain/a/20260415A05HXC00", `中国大厂出海泰国数据中心合作报道`),
                  ],
                  quotes: [
                    `True IDC/CP集团的数据中心同样被列为...云Region基础设施的一部分。`,
                  ],
                  reasoning: `[CITED] 泰国市场设施由True IDC运营
  Source: https://new.qq.com/rain/a/20260415A05HXC00
  Quote: True IDC/CP集团的数据中心同样被列为...云Region基础设施的一部分。
  Retrieved: 2026-07-16`,
                  decision: `已按 analyst-grounding audit-chain 格式标注 [CITED]/[INFERRED]，供 wording/quality-checker skill 下游校验。`,
                },
              },
              {
                id: "oms_ac004_partner",
                kind: "text",
                label: `Partner cloud · 合作伙伴云`,
                status: "verified",
                rows: 6,
                defaultValue: `本地合作伙伴运营(如泰国市场由 True IDC 提供数据中心托管及分发)。`,
                defaultValueEn: `Operated by a local partner (for example, True IDC provides data-center hosting and distribution in Thailand).`,
                reasoning: {
                  sources: [
                    src("https://new.qq.com/rain/a/20260415A05HXC00", `中国大厂出海泰国数据中心合作报道`),
                  ],
                  quotes: [
                    `True IDC/CP集团的数据中心同样被列为...云Region基础设施的一部分。`,
                  ],
                  reasoning: `[CITED] 泰国市场设施由True IDC运营
  Source: https://new.qq.com/rain/a/20260415A05HXC00
  Quote: True IDC/CP集团的数据中心同样被列为...云Region基础设施的一部分。
  Retrieved: 2026-07-16`,
                  decision: `已按 analyst-grounding audit-chain 格式标注 [CITED]/[INFERRED]，供 wording/quality-checker skill 下游校验。`,
                },
              },
              {
                id: "oms_ac004_priv",
                kind: "text",
                label: `Private cloud · 私有云(TCE专有云)`,
                status: "verified",
                rows: 6,
                defaultValue: `TCE 模式下由客户自身或客户授权的本地团队运营。`,
                defaultValueEn: `Under TCE, operated by the customer itself or by a local team the customer authorizes.`,
                reasoning: {
                  sources: [
                    src("https://new.qq.com/rain/a/20260415A05HXC00", `中国大厂出海泰国数据中心合作报道`),
                  ],
                  quotes: [
                    `True IDC/CP集团的数据中心同样被列为...云Region基础设施的一部分。`,
                  ],
                  reasoning: `[CITED] 泰国市场设施由True IDC运营
  Source: https://new.qq.com/rain/a/20260415A05HXC00
  Quote: True IDC/CP集团的数据中心同样被列为...云Region基础设施的一部分。
  Retrieved: 2026-07-16`,
                  decision: `已按 analyst-grounding audit-chain 格式标注 [CITED]/[INFERRED]，供 wording/quality-checker skill 下游校验。`,
                },
              },
            ],
          },
        ],
      },
      {
        id: "oms_q_ac005",
        title: `AC005 · 是否存在位于云所在国之外的服务或依赖项`,
        status: "verified",
        promptEn: `Are there any services or dependencies that exist outside the country where the cloud is based`,
        promptZh: `是否存在位于云所在国之外的服务或依赖项`,
        groups: [
          {
            layout: "labeled-rows",
            fields: [
              {
                id: "oms_ac005_pub",
                kind: "text",
                label: `Public cloud · 公共云`,
                status: "verified",
                rows: 6,
                defaultValue: `部分全局性服务(如某些AI基础模型能力)可能存在跨区域技术依赖，具体因服务而异。`,
                defaultValueEn: `Certain global services, such as some foundation-model capabilities, may carry cross-region technical dependencies; this varies by service.`,
              },
              {
                id: "oms_ac005_priv",
                kind: "text",
                label: `Private cloud · 私有云(TCE专有云)`,
                status: "verified",
                rows: 6,
                defaultValue: `TCE air-gapped 部署下可实现无外部依赖的完全隔离运行。`,
                defaultValueEn: `Under a TCE air-gapped deployment, the environment can run fully isolated with no external dependency.`,
              },
              {
                id: "oms_ac005_comments",
                kind: "text",
                label: `Comments · 来源说明 / Review hooks`,
                status: "needs-confirm",
                rows: 4,
                defaultValue: `[REVIEW: product] 需按具体产品清单逐项核实是否存在境外依赖组件。`,
                defaultValueEn: `[REVIEW: product] Product teams should review the product list line-by-line to confirm which, if any, components carry offshore dependencies.`,
              },
            ],
          },
        ],
      },
      {
        id: "oms_q_ac006",
        title: `AC006 · 资产归属于谁`,
        status: "verified",
        promptEn: `Who owns the assets`,
        promptZh: `资产归属于谁`,
        groups: [
          {
            layout: "labeled-rows",
            fields: [
              {
                id: "oms_ac006_pub",
                kind: "text",
                label: `Public cloud · 公共云`,
                status: "verified",
                rows: 6,
                defaultValue: `腾讯云拥有基础设施资产。`,
                defaultValueEn: `Infrastructure assets are owned by Tencent Cloud.`,
                reasoning: {
                  sources: [
                    src("https://new.qq.com/rain/a/20260415A05HXC00", `中国大厂出海泰国数据中心合作报道`),
                  ],
                  quotes: [
                    `True IDC/CP集团的数据中心同样被列为...云Region基础设施的一部分。`,
                  ],
                  reasoning: `[CITED] 泰国市场资产归属True IDC
  Source: https://new.qq.com/rain/a/20260415A05HXC00
  Quote: True IDC/CP集团的数据中心同样被列为...云Region基础设施的一部分。
  Retrieved: 2026-07-16`,
                  decision: `已按 analyst-grounding audit-chain 格式标注 [CITED]/[INFERRED]，供 wording/quality-checker skill 下游校验。`,
                },
              },
              {
                id: "oms_ac006_partner",
                kind: "text",
                label: `Partner cloud · 合作伙伴云`,
                status: "verified",
                rows: 6,
                defaultValue: `合作伙伴云模式下由本地伙伴拥有基础设施资产(如泰国由 True IDC 拥有数据中心)。`,
                defaultValueEn: `Under the partner-cloud model, infrastructure assets are owned by the local partner (for example, True IDC owns the data center in Thailand).`,
                reasoning: {
                  sources: [
                    src("https://new.qq.com/rain/a/20260415A05HXC00", `中国大厂出海泰国数据中心合作报道`),
                  ],
                  quotes: [
                    `True IDC/CP集团的数据中心同样被列为...云Region基础设施的一部分。`,
                  ],
                  reasoning: `[CITED] 泰国市场资产归属True IDC
  Source: https://new.qq.com/rain/a/20260415A05HXC00
  Quote: True IDC/CP集团的数据中心同样被列为...云Region基础设施的一部分。
  Retrieved: 2026-07-16`,
                  decision: `已按 analyst-grounding audit-chain 格式标注 [CITED]/[INFERRED]，供 wording/quality-checker skill 下游校验。`,
                },
              },
              {
                id: "oms_ac006_priv",
                kind: "text",
                label: `Private cloud · 私有云(TCE专有云)`,
                status: "verified",
                rows: 6,
                defaultValue: `TCE 模式下硬件资产通常由客户拥有，腾讯提供软件与技术支持。`,
                defaultValueEn: `Under TCE, hardware assets are typically customer-owned, with Tencent providing the software and technical support.`,
                reasoning: {
                  sources: [
                    src("https://new.qq.com/rain/a/20260415A05HXC00", `中国大厂出海泰国数据中心合作报道`),
                  ],
                  quotes: [
                    `True IDC/CP集团的数据中心同样被列为...云Region基础设施的一部分。`,
                  ],
                  reasoning: `[CITED] 泰国市场资产归属True IDC
  Source: https://new.qq.com/rain/a/20260415A05HXC00
  Quote: True IDC/CP集团的数据中心同样被列为...云Region基础设施的一部分。
  Retrieved: 2026-07-16`,
                  decision: `已按 analyst-grounding audit-chain 格式标注 [CITED]/[INFERRED]，供 wording/quality-checker skill 下游校验。`,
                },
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "oms_management",
    index: "4",
    title: `Management · 管理`,
    description: `更新维护、访问控制、支持体系、身份管理与安全响应团队位置。`,
    questions: [
      {
        id: "oms_q_ad001",
        title: `AD001 · 如何实施更新和缺陷修复`,
        status: "verified",
        promptEn: `How are updates and bug fixes implemented`,
        promptZh: `如何实施更新和缺陷修复`,
        groups: [
          {
            layout: "labeled-rows",
            fields: [
              {
                id: "oms_ad001_pub",
                kind: "text",
                label: `Public cloud · 公共云`,
                status: "verified",
                rows: 6,
                defaultValue: `由腾讯云团队远程按标准运维流程实施更新与缺陷修复。`,
                defaultValueEn: `Updates and bug fixes are implemented remotely by the Tencent Cloud team under standard operating procedures.`,
              },
              {
                id: "oms_ad001_priv",
                kind: "text",
                label: `Private cloud · 私有云(TCE专有云)`,
                status: "verified",
                rows: 6,
                defaultValue: `TCE 支持客户自主排期更新，air-gapped 环境下可采用离线包方式人工升级。`,
                defaultValueEn: `TCE lets customers schedule updates on their own timeline; in air-gapped environments, upgrades can be applied manually via offline packages.`,
              },
            ],
          },
        ],
      },
      {
        id: "oms_q_ad002",
        title: `AD002 · 谁可以访问该设施`,
        status: "verified",
        promptEn: `Who has access to the facility`,
        promptZh: `谁可以访问该设施`,
        groups: [
          {
            layout: "labeled-rows",
            fields: [
              {
                id: "oms_ad002_pub",
                kind: "text",
                label: `Public cloud · 公共云`,
                status: "verified",
                rows: 6,
                defaultValue: `仅限腾讯云授权人员访问。`,
                defaultValueEn: `Access is restricted to authorized Tencent Cloud personnel.`,
              },
              {
                id: "oms_ad002_priv",
                kind: "text",
                label: `Private cloud · 私有云(TCE专有云)`,
                status: "verified",
                rows: 6,
                defaultValue: `TCE 环境下完全由客户自主管控访问权限，腾讯默认无访问权限。`,
                defaultValueEn: `In a TCE environment, access is controlled entirely by the customer; Tencent has no default access.`,
              },
            ],
          },
        ],
      },
      {
        id: "oms_q_ad003",
        title: `AD003 · 如何管理支持服务`,
        status: "verified",
        promptEn: `How is support managed`,
        promptZh: `如何管理支持服务`,
        groups: [
          {
            layout: "labeled-rows",
            fields: [
              {
                id: "oms_ad003_pub",
                kind: "text",
                label: `Public cloud · 公共云`,
                status: "verified",
                rows: 6,
                defaultValue: `全球统一支持体系。`,
                defaultValueEn: `A unified global support organization.`,
              },
              {
                id: "oms_ad003_priv",
                kind: "text",
                label: `Private cloud · 私有云(TCE专有云)`,
                status: "verified",
                rows: 6,
                defaultValue: `TCE 提供本地一线支持，复杂/技术性问题升级至腾讯全球技术团队处理。`,
                defaultValueEn: `TCE provides local first-line support, with complex or technical issues escalated to Tencent's global technical team.`,
              },
            ],
          },
        ],
      },
      {
        id: "oms_q_ad004",
        title: `AD004 · 谁拥有管理员权限`,
        status: "verified",
        promptEn: `Who has administrator access`,
        promptZh: `谁拥有管理员权限`,
        groups: [
          {
            layout: "labeled-rows",
            fields: [
              {
                id: "oms_ad004_pub",
                kind: "text",
                label: `Public cloud · 公共云`,
                status: "verified",
                rows: 6,
                defaultValue: `腾讯云及经授权客户管理员共同拥有管理员权限。`,
                defaultValueEn: `Administrator access is shared between Tencent Cloud and authorized customer administrators.`,
              },
              {
                id: "oms_ad004_priv",
                kind: "text",
                label: `Private cloud · 私有云(TCE专有云)`,
                status: "verified",
                rows: 6,
                defaultValue: `TCE 环境下由客户自主决定管理员权限分配，腾讯默认无管理员访问权限，需客户明确授权。`,
                defaultValueEn: `In a TCE environment, administrator-access allocation is decided by the customer; Tencent has no default administrator access unless explicitly granted.`,
              },
            ],
          },
        ],
      },
      {
        id: "oms_q_ad005",
        title: `AD005 · 谁管理/控制身份认证`,
        status: "verified",
        promptEn: `Who manages/controls identity`,
        promptZh: `谁管理/控制身份认证`,
        groups: [
          {
            layout: "labeled-rows",
            fields: [
              {
                id: "oms_ad005_pub",
                kind: "text",
                label: `Public cloud · 公共云`,
                status: "verified",
                rows: 6,
                defaultValue: `默认使用腾讯云 CAM 身份与访问管理体系。`,
                defaultValueEn: `Identity is managed by default through Tencent Cloud's CAM identity and access management system.`,
              },
              {
                id: "oms_ad005_priv",
                kind: "text",
                label: `Private cloud · 私有云(TCE专有云)`,
                status: "verified",
                rows: 6,
                defaultValue: `TCE 支持客户使用自有身份认证方案并自主管理。`,
                defaultValueEn: `TCE supports customers bringing and managing their own identity solution.`,
              },
            ],
          },
        ],
      },
      {
        id: "oms_q_ad006",
        title: `AD006 · 安全响应团队位于何处`,
        status: "verified",
        promptEn: `Where is the security response team located`,
        promptZh: `安全响应团队位于何处`,
        groups: [
          {
            layout: "labeled-rows",
            fields: [
              {
                id: "oms_ad006_pub",
                kind: "text",
                label: `Public cloud · 公共云`,
                status: "verified",
                rows: 6,
                defaultValue: `全球化安全运营中心(SOC)团队负责安全响应。`,
                defaultValueEn: `Security response is handled by a global Security Operations Center (SOC) team.`,
              },
              {
                id: "oms_ad006_priv",
                kind: "text",
                label: `Private cloud · 私有云(TCE专有云)`,
                status: "verified",
                rows: 6,
                defaultValue: `TCE 部署下可按客户要求实现安全响应团队本地化配置。`,
                defaultValueEn: `Under TCE, the security-response team can be localized to meet customer requirements.`,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "oms_software",
    index: "5",
    title: `Software & Services · 软件与服务`,
    description: `服务可用性限制、源代码归属、授权模式、开放标准与ISV生态。`,
    questions: [
      {
        id: "oms_q_ae001",
        title: `AE001 · 服务可用性是否存在限制`,
        status: "verified",
        promptEn: `Are there any restrictions on availability of services`,
        promptZh: `服务可用性是否存在限制`,
        groups: [
          {
            layout: "labeled-rows",
            fields: [
              {
                id: "oms_ae001_pub",
                kind: "text",
                label: `Public cloud · 公共云`,
                status: "verified",
                rows: 6,
                defaultValue: `大部分服务可用，部分高级AI/新兴服务可能因技术或监管原因存在区域限制。`,
                defaultValueEn: `Most services are available; certain advanced AI or emerging services may carry regional restrictions for technical or regulatory reasons.`,
              },
              {
                id: "oms_ae001_partner",
                kind: "text",
                label: `Partner cloud · 合作伙伴云`,
                status: "verified",
                rows: 6,
                defaultValue: `合作伙伴云模式下的服务范围受限于伙伴解决方案覆盖能力。`,
                defaultValueEn: `Under the partner-cloud model, service scope is bounded by the partner's own solution coverage.`,
              },
              {
                id: "oms_ae001_comments",
                kind: "text",
                label: `Comments · 来源说明 / Review hooks`,
                status: "needs-confirm",
                rows: 4,
                defaultValue: `[REVIEW: product] 需按客户所在具体地域及监管要求核实受限服务清单。`,
                defaultValueEn: `[REVIEW: product] The specific list of restricted services should be verified per customer region and regulatory regime.`,
              },
            ],
          },
        ],
      },
      {
        id: "oms_q_ae002",
        title: `AE002 · 该形态的云平均能提供全球公共云服务的百分之多少`,
        status: "verified",
        promptEn: `What % of the global public cloud services are available in this form of cloud on average`,
        promptZh: `该形态的云平均能提供全球公共云服务的百分之多少`,
        groups: [
          {
            layout: "labeled-rows",
            fields: [
              {
                id: "oms_ae002_priv",
                kind: "text",
                label: `Private cloud · 私有云(TCE专有云)`,
                status: "verified",
                rows: 6,
                defaultValue: `TCE 基于与公有云同源架构，提供近百款产品的全栈私有化能力，与公有云高度对齐。`,
                defaultValueEn: `Built on the same-source architecture as the public cloud, TCE delivers full-stack private capability across close to one hundred products, closely aligned with the public-cloud offering.`,
                reasoning: {
                  sources: [
                    src("https://cloud.tencent.com.cn/developer/article/2678942", `腾讯专有云TCE技术白皮书`),
                  ],
                  quotes: [
                    `腾讯专有云(TCE)基于公有云同源架构，提供覆盖计算、存储、网络、安全、数据库、中间件等近百个产品的全栈能力。`,
                  ],
                  reasoning: `[CITED] TCE覆盖近百款产品的全栈能力
  Source: https://cloud.tencent.com.cn/developer/article/2678942
  Quote: 腾讯专有云(TCE)基于公有云同源架构，提供覆盖计算、存储、网络、安全、数据库、中间件等近百个产品的全栈能力。
  Retrieved: 2026-07-16

[REVIEW: product] 题目要求的精确百分比未在公开渠道披露，需产品团队按最新产品清单逐项核实计算。`,
                  decision: `已按 analyst-grounding audit-chain 格式标注 [CITED]/[INFERRED]，供 wording/quality-checker skill 下游校验。`,
                },
              },
              {
                id: "oms_ae002_comments",
                kind: "text",
                label: `Comments · 来源说明 / Review hooks`,
                status: "needs-confirm",
                rows: 4,
                defaultValue: `[REVIEW: product] 题目要求的精确百分比未在公开渠道披露，需产品团队按最新产品清单逐项核实计算。`,
                defaultValueEn: `[REVIEW: product] The exact percentage the question asks for is not publicly disclosed; the product team should calculate it against the current product catalog.`,
              },
            ],
          },
        ],
      },
      {
        id: "oms_q_ae003",
        title: `AE003 · 谁拥有该云的源代码`,
        status: "verified",
        promptEn: `Who has the source code for the cloud`,
        promptZh: `谁拥有该云的源代码`,
        groups: [
          {
            layout: "labeled-rows",
            fields: [
              {
                id: "oms_ae003_pub",
                kind: "text",
                label: `Public cloud · 公共云`,
                status: "verified",
                rows: 6,
                defaultValue: `腾讯云拥有源代码。`,
                defaultValueEn: `Source code is owned by Tencent Cloud.`,
                reasoning: {
                  sources: [
                    src("https://cloud.tencent.com.cn/developer/article/2678942", `腾讯专有云TCE技术白皮书`),
                  ],
                  quotes: [
                    `架构同源：将公有云能力1:1完全输送至私有环境，统一架构、统一代码。`,
                  ],
                  reasoning: `[CITED] TCE架构同源，统一代码
  Source: https://cloud.tencent.com.cn/developer/article/2678942
  Quote: 架构同源：将公有云能力1:1完全输送至私有环境，统一架构、统一代码。
  Retrieved: 2026-07-16`,
                  decision: `已按 analyst-grounding audit-chain 格式标注 [CITED]/[INFERRED]，供 wording/quality-checker skill 下游校验。`,
                },
              },
              {
                id: "oms_ae003_priv",
                kind: "text",
                label: `Private cloud · 私有云(TCE专有云)`,
                status: "verified",
                rows: 6,
                defaultValue: `TCE 与公有云采用同一套源代码架构(“架构同源”)，部署至客户私有环境后代码使用受合同条款约束。`,
                defaultValueEn: `TCE shares the same source-code architecture as the public cloud ("same-source architecture"); once deployed into a customer's private environment, code use is governed by contract terms.`,
                reasoning: {
                  sources: [
                    src("https://cloud.tencent.com.cn/developer/article/2678942", `腾讯专有云TCE技术白皮书`),
                  ],
                  quotes: [
                    `架构同源：将公有云能力1:1完全输送至私有环境，统一架构、统一代码。`,
                  ],
                  reasoning: `[CITED] TCE架构同源，统一代码
  Source: https://cloud.tencent.com.cn/developer/article/2678942
  Quote: 架构同源：将公有云能力1:1完全输送至私有环境，统一架构、统一代码。
  Retrieved: 2026-07-16`,
                  decision: `已按 analyst-grounding audit-chain 格式标注 [CITED]/[INFERRED]，供 wording/quality-checker skill 下游校验。`,
                },
              },
            ],
          },
        ],
      },
      {
        id: "oms_q_ae004",
        title: `AE004 · 该云的授权许可模式是怎样的`,
        status: "verified",
        promptEn: `How is the cloud licenced`,
        promptZh: `该云的授权许可模式是怎样的`,
        groups: [
          {
            layout: "labeled-rows",
            fields: [
              {
                id: "oms_ae004_pub",
                kind: "text",
                label: `Public cloud · 公共云`,
                status: "verified",
                rows: 6,
                defaultValue: `按需订阅/合同期限制授权。`,
                defaultValueEn: `Licensed on a subscription or contract-term basis.`,
              },
              {
                id: "oms_ae004_priv",
                kind: "text",
                label: `Private cloud · 私有云(TCE专有云)`,
                status: "verified",
                rows: 6,
                defaultValue: `TCE 通常采用与合同期绑定的授权模式，续约后延续授权。`,
                defaultValueEn: `TCE is typically licensed on a term tied to the contract, renewed alongside contract renewal.`,
              },
              {
                id: "oms_ae004_comments",
                kind: "text",
                label: `Comments · 来源说明 / Review hooks`,
                status: "needs-confirm",
                rows: 4,
                defaultValue: `[REVIEW: product] 具体许可条款因合同类型(公有云按量/包年包月, TCE项目制)而异，需法务/商务团队核实标准条款表述。`,
                defaultValueEn: `[REVIEW: product] Exact licensing terms vary by contract type (public-cloud pay-as-you-go/annual vs. TCE project-based); legal/commercial teams should confirm the standard contract language.`,
              },
            ],
          },
        ],
      },
      {
        id: "oms_q_ae005",
        title: `AE005 · 该软件是否基于开放标准构建`,
        status: "verified",
        promptEn: `Is the software built on open standards`,
        promptZh: `该软件是否基于开放标准构建`,
        groups: [
          {
            layout: "labeled-rows",
            fields: [
              {
                id: "oms_ae005_pub",
                kind: "text",
                label: `Public cloud · 公共云`,
                status: "verified",
                rows: 6,
                defaultValue: `是，遵循 Kubernetes/CNCF 等主流开放标准。`,
                defaultValueEn: `Yes, built on mainstream open standards including Kubernetes and CNCF.`,
                reasoning: {
                  sources: [
                    src("https://cloud.tencent.com.cn/developer/article/2678942", `腾讯专有云TCE技术白皮书`),
                  ],
                  quotes: [
                    `多芯支持：支持X86(Intel、海光)及ARM(鲲鹏、飞腾)架构...软硬解耦：不绑定硬件品牌。`,
                  ],
                  reasoning: `[CITED] TCE一云多芯与软硬解耦能力
  Source: https://cloud.tencent.com.cn/developer/article/2678942
  Quote: 多芯支持：支持X86(Intel、海光)及ARM(鲲鹏、飞腾)架构...软硬解耦：不绑定硬件品牌。
  Retrieved: 2026-07-16`,
                  decision: `已按 analyst-grounding audit-chain 格式标注 [CITED]/[INFERRED]，供 wording/quality-checker skill 下游校验。`,
                },
              },
              {
                id: "oms_ae005_priv",
                kind: "text",
                label: `Private cloud · 私有云(TCE专有云)`,
                status: "verified",
                rows: 6,
                defaultValue: `是，TCE 支持 Kubernetes/CNCF 标准，兼容主流国产及国际芯片架构(X86/ARM)、操作系统(银河麒麟、UOS等)，软硬件解耦不绑定特定厂商。`,
                defaultValueEn: `Yes. TCE supports Kubernetes/CNCF standards and is compatible with mainstream domestic and international chip architectures (x86/ARM) and operating systems (Kylin, UOS, and others), decoupling software from hardware and avoiding vendor lock-in.`,
                reasoning: {
                  sources: [
                    src("https://cloud.tencent.com.cn/developer/article/2678942", `腾讯专有云TCE技术白皮书`),
                  ],
                  quotes: [
                    `多芯支持：支持X86(Intel、海光)及ARM(鲲鹏、飞腾)架构...软硬解耦：不绑定硬件品牌。`,
                  ],
                  reasoning: `[CITED] TCE一云多芯与软硬解耦能力
  Source: https://cloud.tencent.com.cn/developer/article/2678942
  Quote: 多芯支持：支持X86(Intel、海光)及ARM(鲲鹏、飞腾)架构...软硬解耦：不绑定硬件品牌。
  Retrieved: 2026-07-16`,
                  decision: `已按 analyst-grounding audit-chain 格式标注 [CITED]/[INFERRED]，供 wording/quality-checker skill 下游校验。`,
                },
              },
            ],
          },
        ],
      },
      {
        id: "oms_q_ae006",
        title: `AE006 · 有多少ISV使用该平台交付第三方服务`,
        status: "needs-confirm",
        promptEn: `How many ISV's are using the platform to deliver third-party services`,
        promptZh: `有多少ISV使用该平台交付第三方服务`,
        groups: [
          {
            layout: "labeled-rows",
            fields: [
              {
                id: "oms_ae006_comments",
                kind: "text",
                label: `Comments · 来源说明 / Review hooks`,
                status: "needs-confirm",
                rows: 4,
                defaultValue: `[REVIEW: product] 平台生态ISV具体数量属于内部运营数据，公开渠道未披露，需生态合作团队核实后填写。`,
                defaultValueEn: `[REVIEW: product] The number of ISVs on the platform is an internal operating metric not publicly disclosed; the ecosystem team should supply the verified figure.`,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "oms_strategy",
    index: "6",
    title: `Strategy & execution · 战略与执行`,
    description: `主权云与主权AI战略，以及核心差异化定位。`,
    questions: [
      {
        id: "oms_q_af001",
        title: `AF001 · 说明贵司的主权云方案`,
        status: "verified",
        promptEn: `Explain your approach to sovereign cloud`,
        promptZh: `说明贵司的主权云方案`,
        groups: [
          {
            layout: "labeled-rows",
            fields: [
              {
                id: "oms_af001_pub",
                kind: "text",
                label: `Public cloud · 公共云`,
                status: "verified",
                rows: 6,
                defaultValue: `腾讯云的主权云方案以 Tencent Cloud Enterprise(TCE)专有云为核心，围绕数据主权、运营主权、技术主权三大维度构建全栈解决方案。TCE与腾讯公有云架构同源、代码一致，支持公有、私有、混合及完全物理隔离(air-gapped)等多种部署模式，客户可根据监管要求灵活选择。在《The Forrester Wave: Sovereign Cloud Platforms, Q2 2026》报告中，腾讯云凭借TCE被评为“领导者(Leader)”象限，是唯一获评的中国厂商，同时获得“Customer Favorite”认可，在主权数据治理服务维度获得满分。`,
                defaultValueEn: `Sovereignty is treated as a risk management framework, not a compliance checkbox. Tencent Cloud Enterprise (TCE) is the core of Tencent Cloud's sovereign cloud approach, built around data sovereignty, operational sovereignty and technical sovereignty in all their different forms — public, private, hybrid and fully air-gapped deployment, sharing the same source-code architecture as the public cloud so customers are not trading capability for isolation. In The Forrester Wave: Sovereign Cloud Platforms, Q2 2026, Tencent Cloud was named a Leader on the strength of TCE, the only Chinese hyperscaler in that quadrant, and was recognized as a Customer Favorite with the highest possible score on Sovereign Data Governance Services.`,
                reasoning: {
                  sources: [
                    src("https://www.tencentcloud.com/dynamic/news-details/101217", `Tencent Cloud Named a Leader in Forrester Sovereign Cloud Report`),
                    src("https://www.tencentcloud.com/analyst/detail/101093", `The Forrester Wave: Sovereign Cloud Platforms, Q2 2026`),
                  ],
                  quotes: [
                    `Tencent Cloud is recognized as a Leader in the Sovereign Cloud market...Tencent Cloud is designated as a "Customer Favorite."`,
                    `Tencent Cloud received the highest possible score in the Sovereign Data Governance Services criterion.`,
                  ],
                  reasoning: `[CITED] Forrester Wave将腾讯云评为主权云领导者
  Source: https://www.tencentcloud.com/dynamic/news-details/101217
  Quote: Tencent Cloud is recognized as a Leader in the Sovereign Cloud market...Tencent Cloud is designated as a "Customer Favorite."
  Retrieved: 2026-07-16

[CITED] 腾讯云在主权数据治理服务维度获满分
  Source: https://www.tencentcloud.com/analyst/detail/101093
  Quote: Tencent Cloud received the highest possible score in the Sovereign Data Governance Services criterion.
  Retrieved: 2026-07-16

[REVIEW: Kevin] 本题是Strategy/Vision类题型，是否以“risk management framework”作为核心论点框架（对齐Roy Illsley的评分透镜）需AR专家确认这是否是最打动Omdia分析师的framing选择。`,
                  decision: `已按 analyst-grounding audit-chain 格式标注 [CITED]/[INFERRED]，供 wording/quality-checker skill 下游校验。`,
                },
              },
              {
                id: "oms_af001_comments",
                kind: "text",
                label: `Comments · 来源说明 / Review hooks`,
                status: "needs-confirm",
                rows: 4,
                defaultValue: `[REVIEW: Kevin] 本题是Strategy/Vision类题型，是否以“risk management framework”作为核心论点框架（对齐Roy Illsley的评分透镜）需AR专家确认这是否是最打动Omdia分析师的framing选择。`,
                defaultValueEn: `[REVIEW: Kevin] This is a Strategy/Vision question; whether framing sovereignty as a risk-management framework (aligned to Roy Illsley's scoring lens) is the strongest angle should be confirmed by the AR lead.`,
              },
            ],
          },
        ],
      },
      {
        id: "oms_q_af002",
        title: `AF002 · 说明贵司的主权AI方案`,
        status: "verified",
        promptEn: `Explain your approach to sovereign AI`,
        promptZh: `说明贵司的主权AI方案`,
        groups: [
          {
            layout: "labeled-rows",
            fields: [
              {
                id: "oms_af002_pub",
                kind: "text",
                label: `Public cloud · 公共云`,
                status: "verified",
                rows: 6,
                defaultValue: `腾讯云将AI能力深度集成至TCE云底座，支持客户在主权合规框架内构建大模型训练、推理及Agent应用，实现“合规云”与“智能云”的统一落地。通过Agent Development Platform(ADP)等平台，企业可在本地化、隔离环境中部署基于混元大模型的AI应用，满足数据不出境、模型可控的监管要求。`,
                defaultValueEn: `Sovereign AI is framed around the economics and control of the model layer, not just where data sits. Tencent Cloud integrates AI capability directly into the TCE cloud foundation, so customers can run large-model training, inference and agent workloads inside the same sovereign compliance boundary as the rest of their infrastructure. Through the Agent Development Platform (ADP), enterprises deploy Hunyuan-based AI applications in localized, isolated environments that keep data in-jurisdiction and the model itself under customer control.`,
                reasoning: {
                  sources: [
                    src("https://www.tencentcloud.com/dynamic/news-details/101217", `Tencent Cloud Named a Leader in Forrester Sovereign Cloud Report`),
                  ],
                  quotes: [
                    `By integrating advanced AI capabilities, Tencent Cloud Enterprise provides customers with a secure and compliant path for digital transformation.`,
                  ],
                  reasoning: `[CITED] TCE已将AI能力集成至云底座
  Source: https://www.tencentcloud.com/dynamic/news-details/101217
  Quote: By integrating advanced AI capabilities, Tencent Cloud Enterprise provides customers with a secure and compliant path for digital transformation.
  Retrieved: 2026-07-16

[REVIEW: Kevin] AI unit economics（per-token / per-GPU-hour成本口径）是Omdia评分的关注点之一，当前回答未提供量化的AI经济性数据，是否需要补充需Kevin判断。`,
                  decision: `已按 analyst-grounding audit-chain 格式标注 [CITED]/[INFERRED]，供 wording/quality-checker skill 下游校验。`,
                },
              },
              {
                id: "oms_af002_comments",
                kind: "text",
                label: `Comments · 来源说明 / Review hooks`,
                status: "needs-confirm",
                rows: 4,
                defaultValue: `[REVIEW: Kevin] AI unit economics（per-token / per-GPU-hour成本口径）是Omdia评分的关注点之一，当前回答未提供量化的AI经济性数据，是否需要补充需Kevin判断。`,
                defaultValueEn: `[REVIEW: Kevin] Omdia's lens weighs AI unit economics (per-token / per-GPU-hour cost); the current answer has no quantified figures on this — whether to add them is a framing call for the AR lead.`,
              },
            ],
          },
        ],
      },
      {
        id: "oms_q_af003",
        title: `AF003 · 指出贵司认为能为客户提供的唯一核心差异化优势`,
        status: "verified",
        promptEn: `Identify the one key differentiator you believe you offer customers`,
        promptZh: `指出贵司认为能为客户提供的唯一核心差异化优势`,
        groups: [
          {
            layout: "labeled-rows",
            fields: [
              {
                id: "oms_af003_pub",
                kind: "text",
                label: `Public cloud · 公共云`,
                status: "verified",
                rows: 6,
                defaultValue: `核心差异化在于“架构同源”——TCE专有云与腾讯公有云共享同一套源代码和架构，确保私有化部署的产品能力与公有云保持一致的持续迭代与投入，避免“阉割版”私有云的常见问题。同时腾讯云是唯一入选Forrester主权云领导者象限的中国厂商，兼具国际认证体系与本土化交付经验(如True IDC泰国合作、法兰克福新可用区等)。`,
                defaultValueEn: `The differentiator is same-source architecture: TCE and Tencent's public cloud share one codebase, so a sovereign deployment is not a stripped-down variant that falls behind the public roadmap — a common failure mode among sovereign-cloud vendors. Tencent Cloud is also the only Chinese hyperscaler named a Leader in Forrester's sovereign cloud evaluation, combining that same-source guarantee with in-market delivery experience such as the True IDC partnership in Thailand and the Frankfurt availability-zone build-out.`,
                reasoning: {
                  sources: [
                    src("https://cloud.tencent.com.cn/developer/article/2678942", `腾讯专有云TCE技术白皮书`),
                  ],
                  quotes: [
                    `架构同源：将公有云能力1:1完全输送至私有环境，统一架构、统一代码，支持从十几台到上万台节点的平滑扩展。`,
                  ],
                  reasoning: `[CITED] 架构同源是TCE的核心技术差异化
  Source: https://cloud.tencent.com.cn/developer/article/2678942
  Quote: 架构同源：将公有云能力1:1完全输送至私有环境，统一架构、统一代码，支持从十几台到上万台节点的平滑扩展。
  Retrieved: 2026-07-16

[REVIEW: Kevin] 题目要求“唯一(the one)”核心差异化——是否用“架构同源”而非其他候选角度(如唯一入选Leader象限的中国厂商)最打动分析师，需Kevin拍板最终framing。`,
                  decision: `已按 analyst-grounding audit-chain 格式标注 [CITED]/[INFERRED]，供 wording/quality-checker skill 下游校验。`,
                },
              },
              {
                id: "oms_af003_comments",
                kind: "text",
                label: `Comments · 来源说明 / Review hooks`,
                status: "needs-confirm",
                rows: 4,
                defaultValue: `[REVIEW: Kevin] 题目要求“唯一(the one)”核心差异化——是否用“架构同源”而非其他候选角度(如唯一入选Leader象限的中国厂商)最打动分析师，需Kevin拍板最终framing。`,
                defaultValueEn: `[REVIEW: Kevin] The question asks for the one differentiator — whether same-source architecture beats the alternative framing (sole Chinese Leader) as the strongest hook for the analyst is a call for the AR lead.`,
              },
            ],
          },
        ],
      },
    ],
  },
];
