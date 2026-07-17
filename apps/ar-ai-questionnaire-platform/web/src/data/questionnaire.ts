// Omdia RFI · Cloud for Chinese Enterprise Going Global 2026
// Pre-filled answers based on public sources from tencentcloud.com (April 2026 research).
// Each field carries the source URL, exact quote, reasoning chain, and the final decision.

export type Status = "verified" | "needs-confirm" | "strategic";

export interface Source {
  url: string;
  label: string;
}

export interface Reasoning {
  /** Source URLs supporting this answer */
  sources: Source[];
  /** Verbatim quote(s) from the source pages */
  quotes: string[];
  /** Why I interpreted the source this way */
  reasoning: string;
  /** What I decided to fill */
  decision: string;
}

export interface FieldBase {
  id: string;
  label: string;
  status: Status;
  reasoning?: Reasoning;
}

export interface TextField extends FieldBase {
  kind: "text";
  /** Chinese-language default content. Stored at Supabase field_id = id. */
  defaultValue: string;
  /** English-language default content. Stored at Supabase field_id = id + "__en".
   *  Empty string = not yet translated; UI shows blank EN textarea with placeholder. */
  defaultValueEn?: string;
  rows?: number;
  placeholder?: string;
}

export interface ChecksField extends FieldBase {
  kind: "checks";
  options: { value: string; label: string }[];
  defaultValue: string[];
  /** Optional free-text "Other" linked to a separate text field id */
  otherFieldId?: string;
}

export type Field = TextField | ChecksField;

export interface FieldGroup {
  /** Optional sub-heading inside a question (e.g. for sub-rows like "DC count" / "latency" / "telco") */
  layout?: "default" | "labeled-rows" | "industry";
  industryName?: string;
  fields: Field[];
}

export interface Question {
  id: string;
  title: string;
  zhHint?: string;
  status: Status;
  groups: FieldGroup[];
  /** Verbatim English prompt from the Omdia .docx — what's actually being asked. */
  promptEn?: string;
  /** Verbatim Chinese prompt from the Omdia .docx (questionnaire 中文 version). */
  promptZh?: string;
}

export interface Section {
  id: string;
  index: string;
  title: string;
  description: string;
  /** English scoring lens copy from the Omdia Indicators table at the top of the .docx. */
  descriptionEn?: string;
  questions: Question[];
}

// Helper for compact source declaration
const src = (url: string, label: string): Source => ({ url, label });

export const SECTIONS: Section[] = [
  // ====== I. Infrastructure ======
  {
    id: "s1",
    index: "I",
    title: "Global Infrastructure Layout · 全球基础设施布局",
    description: "骨干网与数据中心在目标海外市场的覆盖广度与深度。",
    descriptionEn: "Breadth and depth of backbone network and data center coverage in target overseas markets.",
    questions: [
      {
        id: "q1_1",
        title: "1.1 Coverage Breadth · 覆盖广度",
        zhHint: "目标市场：东南亚 / 中东 / 欧美 / 拉美",
        promptEn: `List your backbone network and data center deployment in key target markets (Southeast Asia, Middle East, Europe/Americas, Latin America):
- Number of data centers and covered countries/regions
- Network latency (ms) and availability zone distribution
- Partnership models with local telecom operators`,
        promptZh: `请列出贵司在以下关键目标市场（东南亚、中东、欧美、拉美）的骨干网络与数据中心具体布局：
- 数据中心数量及覆盖国家/地区
- 网络延迟数据（ms）与可用区分布
- 与当地电信运营商的合作模式`,
        status: "needs-confirm",
        groups: [
          {
            layout: "labeled-rows",
            fields: [
              {
                id: "s1_dc",
                kind: "text",
                label: "Data centers & countries/regions · 数据中心数量及覆盖",
                status: "verified",
                rows: 6,
                defaultValue: `腾讯云在全球运营 22 个地理区域、64 个可用区，海外（不含中国大陆）覆盖东南亚、东北亚、欧洲、北美、南美、中东六大区共 9 个区域。具体海外可用区分布如下：

东南亚：新加坡 4 AZ、雅加达 3 AZ、曼谷 2 AZ
东北亚：首尔 2 AZ、东京 2 AZ
中东：利雅得 2 AZ（首个中东区域，2025 年 LEAP 上发布，沙特投资 1.5 亿美元）
欧洲：法兰克福 2 AZ；2026 年 3 月在 MWC 上宣布将新增第三个可用区，计划于 2026 年第二季度上线
北美：硅谷 2 AZ、弗吉尼亚 2 AZ
拉美：圣保罗 1 AZ

中国大陆与香港另有 13 个区域，可经由 China Connect 方案为出海客户回连。

近期扩建：日本大阪规划新建第三个数据中心；雅加达已从 2 AZ 扩到 3 AZ，支持 GoTo 集团完成 1000+ 微服务迁移。

全球加速网络：3200+ 全球加速节点、400T 带宽储备。海外服务覆盖 80+ 个国家与地区，30+ 行业，海外客户规模在 2025 年同比翻番，2 万+ 海外企业客户。

腾讯云全球设有 11 个区域办公室与 9 大技术支持中心（雅加达、新加坡、东京、首尔、法兰克福等），并配套 100+ 全球技术支持触点。`,
                defaultValueEn: `Tencent Cloud operates 22 geographic regions and 64 availability zones globally. Outside Mainland China, this covers nine regions across Southeast Asia, Northeast Asia, Europe, North America, South America, and the Middle East.

International availability zone breakdown:

Southeast Asia: Singapore 4 AZs, Jakarta 3 AZs, Bangkok 2 AZs.
Northeast Asia: Seoul 2 AZs, Tokyo 2 AZs.
Middle East: Riyadh 2 AZs, the first Middle East cloud region, launched at LEAP 2025 with a stated commitment of over US 150 million in infrastructure and resources.
Europe: Frankfurt 2 AZs, with a third AZ announced at MWC 2026 and scheduled to go live in Q2 2026.
North America: Silicon Valley 2 AZs, Virginia 2 AZs.
Latin America: Sao Paulo 1 AZ.

Mainland China and Hong Kong add another 13 regions that serve outbound enterprises through the China Connect solution.

Recent expansion: Jakarta was expanded from 2 to 3 AZs in 2025 to support GoTo Group's migration of more than 1,000 microservices. A third Osaka data centre is planned alongside the Riyadh build-out.

Global acceleration network: 3,200+ global acceleration nodes with 400T of bandwidth reserve. Commercial coverage spans 80+ countries and regions and 30+ industries, with Tencent Cloud's overseas customer base doubling year-on-year in 2025 and now exceeding 20,000 international enterprise customers.

Tencent Cloud also operates 11 regional offices and 9 major technical support centres across cities including Jakarta, Singapore, Tokyo, Seoul, and Frankfurt, backed by 100+ global technical support touchpoints.`,
                reasoning: {
                  sources: [
                    src("https://www.tencentcloud.com/global-infrastructure", "tencentcloud.com/global-infrastructure"),
                    src("https://mp.weixin.qq.com/s/6Ug6YL0F3mPJdOPQmdxAFQ", "公众号腾讯云出海服务 2026-03-31"),
                    src("https://mp.weixin.qq.com/s/j8vusknh7x0vBPpsTbxq7Q", "公众号腾讯云出海服务 2025-12-01"),
                    src("https://mp.weixin.qq.com/s/hUUB6qnIP_OZMw8FxqBr_A", "公众号腾讯云 2026-03-03 法兰克福第三可用区"),
                    src("https://www.tencentcloud.com/dynamic/news-details/100638", "Tencent Cloud KSA Region launch (2025-02-09)"),
                    src("https://www.tencentcloud.com/dynamic/news-details/100692", "GoTo migration press release (2025-06-05)"),
                    src("https://www.tencent.com/en-us/articles/2202183.html", "GDES press release (2025-09-16)"),
                  ],
                  quotes: [
                    `[global-infrastructure]: "Tencent Cloud International operates 64 availability zones spread across 22 regions globally."`,
                    `[公众号腾讯云出海服务 2026-03-31]: "腾讯云已实现22个地区覆盖、64个运营可用区、3200+全球加速节点、400T带宽储备，设立9大技术支持中心与100+全球技术支持触点，获得400+项国内外权威认证"`,
                    `[公众号腾讯云出海服务 2025-12-01]: "在全球设立的11个区域办公室与9大技术支持中心，服务覆盖30多个行业与80多个国家和地区"`,
                    `[公众号腾讯云 2026-03-03]: "腾讯云正式宣布：将在德国法兰克福新增1个云可用区。新区将于今年2季度正式上线服务，届时腾讯云在德国的可用区数量增至3个"`,
                    `[GoTo 2025-06-05]: "Tencent Cloud expanded its infrastructure in Indonesia to support the migration, increasing its Jakarta region from two to three availability zones. The third data center is now fully operational."`,
                    `[GDES 2025-09-16]: "plans to invest USD150 million in the future to build its first Middle East data center in Saudi Arabia. Simultaneously, it will build a third data center in Osaka, Japan."`,
                    `[公众号腾讯云 2026-03-03]: "国际业务连续保持双位数增长，海外客户规模在2025年同比翻番"`,
                  ],
                  reasoning: `多个 2025-12 至 2026-04 的腾讯出海团队对外口径稳定在 22 个地区 / 64 个可用区 / 3200+ 加速节点 / 400T 带宽这一组数字，与 global-infrastructure landing 页一致，已替代旧版 21 markets / 55 DCs 的 GDES 9 月口径。法兰克福第三个可用区已于 2026-03 公开宣布，将于 2026 Q2 上线；雅加达 3 AZ 已于 2025-06 投运；利雅得首个中东 region 已 GA，沙特 USD 150M 是后续扩建投资。新增的 11 区域办公室与 100+ 全球技术支持触点是出海团队 2025-12 起对外的服务网络新数据。`,
                  decision: `按区域逐项列出已确定的 AZ 数与近期扩建节奏；用 22 / 64 / 3200+ / 400T 做基础设施总量锚点，11 区域办公室 + 9 技术支持中心 + 100+ 触点描述服务网络深度。`,
                },
              },
              {
                id: "s1_latency",
                kind: "text",
                label: "Network latency (ms) & AZ · 网络延迟与可用区",
                status: "verified",
                rows: 4,
                defaultValue: `每个区域为独立地理区，包含多个互相隔离的可用区；同一区域内的不同可用区通过低延迟专用网络互联。每个 AZ 都是物理独立的 IDC，具备独立电力与网络，可在不影响同区域其他 AZ 的前提下隔离故障。

跨区域 VPC 之间通过云联网（Cloud Connect Network）建立更快、更稳定的私网通信。叠加 3200+ 全球加速节点与 400T 带宽储备，为出海企业提供低延迟、高稳定的全球连接。

多 AZ 高可用部署：海外 9 个区域中，可用区数量 ≥ 2 的有 8 个（新加坡、雅加达、曼谷、首尔、东京、硅谷、弗吉尼亚、法兰克福、利雅得），均可承载跨 AZ 高可用部署；圣保罗目前为单 AZ。

具体毫秒级跨区域 / 区域内延迟数据，腾讯云对外公开口径未披露具体数值；如需，可由 AR 团队补充内部基准或客户实测数据。`,
                defaultValueEn: `Each cloud region is an independent geographic area containing multiple isolated availability zones, with intra-region AZs connected over low-latency private networks. Each AZ is a physical IDC with independent power and network so that failures other than major disasters or power loss are isolated within the AZ and do not affect peers in the same region.

Cross-region VPC traffic uses Cloud Connect Network for faster and more stable private-network communication. This is reinforced by 3,200+ global acceleration nodes and 400T of bandwidth reserve, delivering low-latency, high-stability connectivity for international workloads.

Multi-AZ high-availability deployment is supported in eight of the nine international regions (Singapore, Jakarta, Bangkok, Seoul, Tokyo, Silicon Valley, Virginia, Frankfurt, Riyadh); Sao Paulo is currently single-AZ.

Quantitative cross-region or intra-region latency in milliseconds is not disclosed in public sources; AR-supplied internal benchmarks or customer-validated figures can be appended on request.`,
                reasoning: {
                  sources: [
                    src("https://www.tencentcloud.com/document/product/236/8458", "TencentDB Regions and AZs (2026-03-23)"),
                    src("https://www.tencentcloud.com/global-infrastructure", "tencentcloud.com/global-infrastructure"),
                    src("https://mp.weixin.qq.com/s/6Ug6YL0F3mPJdOPQmdxAFQ", "公众号腾讯云出海服务 2026-03-31"),
                    src("https://www.tencentcloud.com/product/teo", "tencentcloud.com/product/teo (EdgeOne)"),
                  ],
                  quotes: [
                    `[document/product/236/8458]: "Each region is an independent geographic area with multiple isolated AZs. Separate AZs in the same region are connected via low-latency private networks."`,
                    `[document/product/236/8458]: "those in different VPCs can communicate with each other through Cloud Connect Network that is faster and steadier."`,
                    `[document/product/236/8458]: "An availability zone (AZ) is a physical IDC of Tencent Cloud with independent power supply and network in the same region."`,
                    `[公众号腾讯云出海服务 2026-03-31]: "3200+全球加速节点、400T带宽储备"`,
                    `[EdgeOne product page]: "3200+ PoP · 400+Tbps Global Network Bandwidth · 25Tbps Global Bandwidth Dedicated for DDoS Mitigation"`,
                  ],
                  reasoning: `Omdia 题目要求毫秒级数字，腾讯公开页与 2025-2026 公众号档案均未发布跨区域 / intra-AZ 延迟基线，只发布定性 + 全网口径硬指标（3200+ 加速节点、400T 储备）。诚实做法是引用 AZ 设计 + 跨区互联机制 + 多 AZ 区域计数 + 全球加速网络硬指标，毫秒数据让渡给 AR。`,
                  decision: `主答 AZ 设计 + 跨区互联 + multi-AZ 区域列表 + 3200+ 加速节点 / 400T 带宽全球加速网络；具体毫秒数据公开未披露，由 AR 决定是否补充内部基准。`,
                },
              },
              {
                id: "s1_telco",
                kind: "text",
                label: "Partnerships with telcos · 当地电信合作",
                status: "needs-confirm",
                rows: 4,
                defaultValue: `中东：

沙特阿拉伯——Mobily（Etihad Etisalat）：2024 年 3 月 LEAP 2024 上联合发布"Go Saudi"项目，由腾讯云企业版支撑 Mobily 的企业云平台，覆盖计算、数据库、网络、存储、安全等基础能力，并在其上叠加腾讯云小程序平台 TCMPP。

阿联酋——e& UAE（Etisalat 集团）：2025 年 9 月在腾讯全球数字生态大会国际出海峰会上作为腾讯云全球合作伙伴出席并签署合作协议；具体合作范围未对外披露。

东南亚：

印尼——Telkomsel：2025 年 3 月 MWC Barcelona 签署 AI 与云的合作 MoU，覆盖三方面——B2B 段的 Palm Verification eKYC、AIGC 与 AI 翻译能力、公有云与混合云的成本优化合作；此前 2024 年已在 Telkomsel GraPARI 门店完成 Palm Verification 的 B2C 试点。

印尼——Indosat Ooredoo Hutchison（IOH）：2025 年 9 月在国际出海峰会上签署合作。

菲律宾——Converge ICT：2025 年 9 月作为腾讯云国际合作伙伴出席国际出海峰会。

东南亚跨市场——Acclivis Technologies and Solutions（中信国际电讯 CITIC Telecom International 全资子公司）：以新加坡、马来西亚、印尼、泰国、菲律宾、香港的连接性与 ICT 服务能力，与腾讯云组建联合云平台服务东南亚客户。

印尼数据中心侧——True IDC：2025 年 9 月作为合作伙伴出席国际出海峰会。

欧美 & 拉美：腾讯云对外公开口径未披露与欧洲或拉美本地电信运营商的命名合作。`,
                defaultValueEn: `Middle East:

Saudi Arabia, Mobily (Etihad Etisalat). Joint launch of the Go Saudi programme at LEAP 2024 in March 2024. Mobily's enterprise cloud platform is built on Tencent Cloud Enterprise and covers compute, database, network, storage and security, with the Tencent Cloud Mini Program Platform layered on top.

UAE, e& (Etisalat group). Listed among Tencent Cloud's global partners attending the 2025 Global Digital Ecosystem Summit and signing partnership agreements. Specific scope of the partnership is not publicly disclosed.

Southeast Asia:

Indonesia, Telkomsel. MoU on AI and cloud-based solutions signed at MWC Barcelona on 5 March 2025, covering Palm Verification eKYC for B2B, AI-Generated Content and AI Translation, and cloud cost optimisation across public and hybrid cloud. B2C Palm Verification was piloted at Telkomsel GraPARI outlets in 2024.

Indonesia, Indosat Ooredoo Hutchison (IOH). Partnership signed at the 2025 Global Digital Ecosystem Summit.

Philippines, Converge ICT. Attended the 2025 Tencent Cloud International Going-Global Summit as an international partner.

Cross-Southeast-Asia, Acclivis Technologies and Solutions, a wholly owned subsidiary of HKEX-listed CITIC Telecom International. Strategic collaboration combining Tencent Cloud's services with Acclivis's connectivity and ICT footprint in Singapore, Malaysia, Indonesia, Thailand, the Philippines, and Hong Kong.

Indonesia data-centre side, True IDC, listed in the 2025 international-summit partner roster.

Europe and Latin America: no European or Latin American local-telco partnership has been publicly disclosed by Tencent Cloud.`,
                reasoning: {
                  sources: [
                    src("https://www.tencentcloud.com/dynamic/news-details/100534", "Mobily 'Go Saudi' (LEAP 2024)"),
                    src("https://www.telkomsel.com/en/about-us/news/telkomsel-and-tencent-cloud-develop-ai-and-cloud-solutions-enhance-customer", "Telkomsel-Tencent Cloud MWC 2025"),
                    src("https://www.tencentcloud.com/dynamic/news-details/100315", "Acclivis strategic collaboration"),
                    src("https://www.tencent.com/en-us/articles/2202183.html", "GDES press release (2025-09-16)"),
                    src("https://mp.weixin.qq.com/s/qlFNIGSkt5H5Kw-u7_6bDg", "公众号腾讯云出海服务 2025-09-17"),
                  ],
                  quotes: [
                    `[Mobily LEAP 2024]: "Etihad Etisalat (Mobily)... and Tencent Cloud... have joined forces to launch the 'Go Saudi' program... powered by Tencent Cloud Enterprise (TCE)."`,
                    `[Telkomsel MWC 2025]: "1. eKYC solution development in the form of Palm Verification for B2B segment 2. AI-Generated Content (AIGC) and AI Translation Development 3. Cloud Cost Optimization"`,
                    `[Acclivis]: "Tapping on Acclivis' presence in Singapore, Malaysia, Indonesia, Thailand, Philippines and Hong Kong as well as Tencent Cloud's expertise and experience in China..."`,
                    `[GDES 2025-09-16]: "Tencent Cloud International signing partnership agreements with global enterprises, from Asia Pacific companies including Datacom, IOH, Gardi Management, GoTo Group, MahakaX, MUFG Bank (China), RYDE Technologies, StoneLink, True IDC, 99 Group; to Middle Eastern companies including Coop Bank Oromia and Nativex; European companies including eMAG; and North American company InCloud."`,
                    `[公众号腾讯云出海服务 2025-09-17]: "在国际出海峰会上，Converge ICT、DANA、阿联酋电信e& UAE、香港赛马会、富融银行、GoTo 集团、Indosat Ooredoo Hutchison (IOH)、Miniclip、三菱日联银行（中国）、Prosus、True IDC等海外企业代表共同探讨"`,
                  ],
                  reasoning: `公开 press release + 公众号档案中明确的电信 / connectivity 命名合作集中在中东（Mobily 沙特、e& UAE）与东南亚（Telkomsel 印尼、IOH 印尼、Converge ICT 菲律宾、Acclivis SEA、True IDC 印尼）。Converge ICT 是 v2 新增的菲律宾电信邻接合作伙伴。欧洲与拉美的电信合作 2024-2026 年公开材料中均未出现命名合作，需 AR 确认是否有 NDA 下未披露的安排。`,
                  decision: `按区域列出已验证电信 / connectivity 合作，包含 Converge ICT v2 新增；欧洲 / 拉美明示"公开未披露"，由 AR 决定是否补 NDA 信息。`,
                },
              },
            ],
          },
        ],
      },
      {
        id: "q1_2",
        title: "1.2 Coverage Depth · 覆盖深度",
        promptEn: `How do you achieve "deep localization" in target markets? (Specify concrete measures)
[ ] Localized deployment options [ ] Edge computing nodes [ ] Localized teams [ ] Other: ________`,
        promptZh: `在目标市场，贵司如何实现"深度本地化"？（请提供具体措施）
□ 本地化部署选项 □ 边缘计算节点 □ 本地化团队 □ 其他：________`,
        status: "verified",
        groups: [
          {
            fields: [
              {
                id: "s1_loc",
                kind: "checks",
                label: "本地化措施",
                status: "verified",
                options: [
                  { value: "localized_deploy", label: "本地化部署选项" },
                  { value: "edge", label: "边缘计算节点 (EdgeOne)" },
                  { value: "local_team", label: "本地化团队" },
                  { value: "other", label: "其他" },
                ],
                defaultValue: ["localized_deploy", "edge", "local_team", "other"],
                otherFieldId: "s1_loc_other",
              },
              {
                id: "s1_loc_other",
                kind: "text",
                label: "其他 / 补充",
                status: "verified",
                rows: 4,
                defaultValue: `本地服务网络：海外 9 大技术支持中心（雅加达、马尼拉、吉隆坡、新加坡、曼谷、东京、首尔、Palo Alto、法兰克福），叠加全球 11 个区域办公室与 100+ 全球技术支持触点，覆盖 30 多个行业、80 多个国家和地区。

客户自主选择存储区域 + 数据不出境承诺：购买阶段由客户在控制台自选数据存储区域；除非客户授权，腾讯云不会将客户业务数据迁出所选区域；该承诺写入合规中心对外 FAQ。客户侧已在 PPIO MaaS、广汽东南亚等场景落地，按 GDPR 等区域合规口径实现"数据本地化不出境"。

国际版产品矩阵：腾讯云智能体开发平台、CodeBuddy、Cloud Mall 已发布国际版本，针对当地法规、语言、计费、生态接入做适配；其中智能体开发平台 3.0 三个月内完成近 600 项需求迭代，持续输出 LLM+RAG、Workflow、Multi-Agent 等本地化开发框架。

全球加速网络：22 个地理区域 / 64 个可用区，叠加 EdgeOne 3,200+ 全球 PoP 节点、400+ Tbps 网络带宽与 25 Tbps DDoS 专用带宽，支撑低时延就近接入；CDN 在中国大陆境内 2300+ 节点，海外 70+ 个国家与地区共 900+ 节点。

区域合规与认证：累计获得 400+ 项国内外权威认证，覆盖 GDPR、SOC、ISO 等 20+ 个领域的全球主流标准；国内首家获得欧盟 CISPE 牌照的云服务厂商（欧洲云服务数据保护行为准则，受 GDPR Art. 40 认可）；EdgeOne 同步持有面向本地市场的 BSI C5（德国）、KISMS（韩国）、MTCS Tier 3（新加坡）、OSPAR（新加坡 ABS）、PCI DSS、HIPAA、ISO 27001 / 9001 / 29151、SOC、CSA STAR、Trusted Cloud。

海外基建与团队投入：在沙特投资 1.5 亿美元建设中东首个数据中心；在日本大阪新建第三个数据中心和办公室；2026 年 3 月宣布在德国法兰克福新增第三个可用区，预计 2026 年 Q2 上线，进一步贴近欧洲客户。

海外采用规模信号：海外客户群 2025 年同比翻倍；过去三年国际业务持续高双位数增长；EdgeOne Pages 上线三个月内全球用户突破 10 万；服务覆盖 80+ 国家与地区，包括 90% 以上头部互联网企业、95% 以上头部游戏公司的出海部署。`,
                defaultValueEn: `Local service footprint. Nine overseas technical support centers in Jakarta, Manila, Kuala Lumpur, Singapore, Bangkok, Tokyo, Seoul, Palo Alto and Frankfurt, plus 11 regional offices and 100+ global technical support touchpoints, covering 30+ industries and 80+ countries and regions.

Customer-chosen storage Region with a no-cross-border-transfer commitment. Customers select their data-storage Region in the purchase console; absent customer consent, Tencent Cloud will not move customer business data out of the chosen Region. The commitment is documented in the Compliance Center FAQ and is operationally validated by customers such as PPIO MaaS and GAC's Southeast Asia roll-out, which run "data stays in region" deployments aligned with GDPR-grade requirements.

International product editions. Tencent Cloud Agent Development Platform, CodeBuddy and Cloud Mall ship as international editions tailored for local regulatory, language, billing and ecosystem requirements. Agent Development Platform 3.0 delivered close to 600 feature requests in three months and ships LLM+RAG, Workflow and Multi-Agent frameworks usable for local builds.

Global acceleration network. 22 geographic regions / 64 availability zones, paired with EdgeOne's 3,200+ global PoPs, 400+ Tbps of network bandwidth and 25 Tbps of dedicated DDoS-mitigation bandwidth for near-edge access. Tencent Cloud CDN separately runs 2,300+ cache nodes inside Mainland China and 900+ cache nodes outside Mainland China across 70+ countries and regions.

Regional compliance and certifications. 400+ international and domestic certifications across 20+ compliance areas (GDPR, SOC, ISO and others). First Chinese cloud vendor to obtain a CISPE licence (Cloud Infrastructure Services Providers in Europe code of conduct, recognized under GDPR Article 40). EdgeOne separately carries local-market certifications including BSI C5 (Germany), KISMS (South Korea), MTCS Tier 3 (Singapore), OSPAR (Singapore ABS), PCI DSS, HIPAA, ISO 27001 / 9001 / 29151, SOC, CSA STAR and Trusted Cloud.

Overseas infrastructure and team investment. USD 150 million committed to build the first Middle East data centre in Saudi Arabia; a third Osaka data centre and office under construction in Japan; a third Frankfurt availability zone announced in March 2026 with Q2 2026 go-live planned, bringing capacity closer to European customers.

Overseas adoption signals. Overseas client base doubled year on year in 2025; high double-digit YoY growth in international business sustained over three years; EdgeOne Pages reached 100,000 global users within three months of launch; service coverage spans 80+ countries and regions, supporting more than 90% of top Chinese internet enterprises and more than 95% of top Chinese game publishers in their going-global deployments.`,
                reasoning: {
                  sources: [
                    src("https://www.tencentcloud.com/global-infrastructure", "tencentcloud.com/global-infrastructure"),
                    src("https://www.tencent.com/en-us/articles/2202183.html", "GDES press release (2025-09-16)"),
                    src("https://www.tencentcloud.com/services/compliance", "Compliance Center"),
                    src("https://www.tencentcloud.com/product/teo", "tencentcloud.com/product/teo"),
                    src("https://mp.weixin.qq.com/s/j8vusknh7x0vBPpsTbxq7Q", "公众号腾讯云出海服务 2025-12-01"),
                    src("https://mp.weixin.qq.com/s/6Ug6YL0F3mPJdOPQmdxAFQ", "公众号腾讯云出海服务 2026-03-31"),
                    src("https://mp.weixin.qq.com/s/hUUB6qnIP_OZMw8FxqBr_A", "公众号腾讯云 2026-03-03 法兰克福"),
                  ],
                  quotes: [
                    `[公众号腾讯云出海服务 2025-12-01]: "在全球设立的11个区域办公室与9大技术支持中心，服务覆盖30多个行业与80多个国家和地区"`,
                    `[公众号腾讯云出海服务 2026-03-31]: "9大技术支持中心与100+全球技术支持触点 ... 获得400+项国内外权威认证，全面适配GDPR、ISO、SOC等全球主流合规标准"`,
                    `[公众号腾讯云出海服务 2025-09-17]: "腾讯云智能体开发平台（ADP）面向全球发布3.0版，在3个月内完成了近600项需求的开发，持续迭代LLM+RAG、Workflow、Multi-Agent等多种智能体开发框架"`,
                    `[公众号腾讯云 2026-04-23 汤道生]: "腾讯已获得400多项国内外专业认证和20多项合规资质，是国内首家获得CISPE牌照（欧洲云服务数据保护的权威标准）的云服务厂商"`,
                    `[compliance]: "Customers can choose their own data storage region (availability zone)... Customer content data will not be transferred outside the customer's chosen Tencent Cloud region without their consent."`,
                    `[GDES 2025-09-16]: "Tencent Cloud has introduced international versions of products such as Tencent Cloud Agent Development Platform (TCADP), CodeBuddy and Cloud Mall."`,
                    `[GDES 2025-09-16]: "Within three months, the platform [EdgeOne Pages] garnered over 100,000 global users."`,
                  ],
                  reasoning: `4 个选项均有公开 sourceable 证据，且 v2 新加入若干强信号：11 个区域办公室与 100+ 全球技术支持触点（深化本地团队覆盖）、首家获得 CISPE 牌照的中国云厂商（欧盟本地化合规背书，替代旧版本中无依据的香港金融合规口径）、ADP 3.0 三个月迭代 600 项需求（产品本地化执行节奏）、PPIO MaaS / 广汽 SEA 客户验证"数据不出境"在 AI 推理场景的可执行性。`,
                  decision: `4 选项全勾选；s1_loc_other 按七段铺陈本地服务网络 / 区域选择 / 国际版产品 / 全球加速 / 合规认证 / 海外基建 / 海外采用规模，删去无依据的香港金融合规声明。`,
                },
              },
            ],
          },
        ],
      },
      {
        id: "q1_3",
        title: "1.3 Key challenge & resolution · 关键挑战",
        promptEn: `What is the biggest challenge in expanding overseas infrastructure? How was it resolved?`,
        promptZh: `在拓展海外基础设施时，遇到的最大挑战是什么？如何解决？`,
        status: "verified",
        groups: [
          {
            fields: [
              {
                id: "s1_challenge",
                kind: "text",
                label: "挑战与解决",
                status: "verified",
                rows: 6,
                defaultValue: `中国企业走向海外，最棘手的挑战不是单一技术问题，而是要在多个差异极大的市场里，同时满足数据驻留、本地合规、稳定性、扩展性、成本控制与全球协同六类要求——欧盟看 GDPR，印尼限制跨境数据流动，中东数据须落地本国，每个区域规则各不相同。2025 年上半年，中国空调出口欧洲达到 1,277.3 万台、同比增长 31.5%，仅美的一家就增长 35%，海外销售放量直接给企业 IT 系统带来重压。中国企业需要一朵既安全合规、又稳定灵活、还能控本协同的海外云。

最具代表性的解决案例是美的集团欧洲 IT 业务迁移。2025 年 7 月，美的将欧洲近 50 个独立业务系统整体迁移至腾讯云法兰克福数据中心，统一纳入云原生架构、完成容器化改造，公共组件技术栈全面重构。承载这次迁移的基础设施本身仍在持续扩容——腾讯云已在 2026 年 MWC 上宣布，法兰克福地区可用区将从 2 个扩至 3 个，新可用区于 2026 年二季度上线服务，为美的的后续欧洲本地业务扩张留足空间。迁移完成后，美的的成本优化目标超额完成、提前达成，系统稳定性与扩展能力同步显著提升，研发团队跨地域协作效率明显改善，为美的欧洲本地业务的持续扩张打下了扎实的技术底座。

同一家中国企业、同一套出海打法，还在巴西与全球协同两条线上被验证。巴西方向，腾讯云分布式云 CDC 支撑美的巴西智能工厂的数字化基础设施，既满足当地数据驻留与合规要求，又把时延控制在 1 毫秒以内，海外工厂的数字化业务与公有云无缝衔接，并由腾讯云提供 7×24 运维保障。全球协同方向，腾讯会议 SDK 集成进美的内部"美信"平台，依托腾讯云 2,000 多个全球加速节点，把分布在 200 多个海外子公司、约 19 万名员工接入同一个会议 ID，用户调研显示 93% 的员工反馈使用体验显著改善。

这一套"中国企业出海上云"的打法，在其他区域同样有可复制的样本。亚太方向，印尼最大数字生态 GoTo 集团 1,000 多个微服务跨境、多云迁移在 4 小时 54 分钟内完成、比计划提前 1 个多小时，雅加达可用区也是按这一节奏由 2 个扩至 3 个——这是腾讯云在亚太市场较早、且规模最大的迁移能力验证，目前正被复用到走向中东、拉美、欧洲的中国企业项目上。中东方向，腾讯云已宣布以 1.5 亿美元投资在沙特建设中东首个自有数据中心，同时通过与 Mobily 联合发布的"Go Saudi"企业级私有云方案，先一步为客户提供受监管能力。在另一家走向全球的中国消费电子品牌方面，荣耀基于腾讯云构建的全球荣耀云平台采用多地域、多可用区、高可用、云原生架构，覆盖 100 多个国家和地区，并在欧洲、中东、拉美持续打开新的增长空间。在更广口径上，腾讯云目前在全球 22 个地区运营 64 个可用区，依托 3,200 多个全球加速节点、400T 带宽储备、11 个区域办公室、9 大技术支持中心与 100 多个全球技术支持触点，累计获得 400 多项国际权威认证，全面适配 GDPR、ISO、SOC 等主流合规标准——这就是中国企业出海面对"海外基础设施扩张"这一长期挑战时，腾讯云提供的可复制、可量化解决路径。`,
                defaultValueEn: `For Chinese enterprises going overseas, the hardest challenge is not a single technical problem but the need to satisfy six requirements at once across markets with very different rules: data residency, local compliance, stability, scalability, cost control, and global collaboration. The EU enforces GDPR, Indonesia restricts cross-border data flows, and Middle East markets require data to stay in-country. Each region has its own regime. In the first half of 2025, Chinese air-conditioner shipments to Europe reached 12.773 million units, up 31.5 percent year on year, with Midea alone growing 35 percent. That overseas-sales surge translates directly into pressure on enterprise IT systems. Chinese enterprises need an overseas cloud that is at once secure and compliant, stable and flexible, and able to control cost and enable global collaboration.

The most representative resolution is Midea Group's European IT migration. In July 2025 Midea moved roughly 50 independent European business systems to Tencent Cloud's Frankfurt data center, consolidated them under a unified cloud-native architecture, completed full containerization, and restructured the public-components technology stack. The underlying infrastructure continues to scale: at MWC 2026, Tencent Cloud announced that its Frankfurt region will grow from two availability zones to three, with the new AZ going live in the second quarter of 2026, leaving headroom for Midea's continued European expansion. Following the migration, Midea exceeded its cost-optimization target ahead of schedule, system stability and scalability improved markedly, R&D-team collaboration across regions became significantly more efficient, and Midea now has a solid technical foundation for the further build-out of its European local business.

The same Chinese enterprise validates the same overseas-cloud playbook on two further dimensions. In Brazil, Tencent Cloud Distributed Cloud (CDC) underpins the digital infrastructure of Midea's Brazilian smart factory: data residency and local compliance are met, latency is held below one millisecond, the overseas factory's digital workload connects seamlessly to the public cloud, and Tencent Cloud provides 7-by-24 operations support. For global collaboration, the Tencent Meeting SDK is embedded inside Midea's internal "Meixin" platform; running over Tencent Cloud's 2,000-plus global acceleration nodes, it brings the 200-plus overseas subsidiaries and roughly 190,000 employees onto a single meeting identity, with 93 percent of surveyed users reporting a meaningfully better experience.

This Chinese-enterprise-going-overseas playbook has reusable references in other regions as well. In Asia Pacific, GoTo Group — Indonesia's largest digital ecosystem — migrated more than 1,000 microservices cross-border and multi-cloud onto Tencent Cloud in 4 hours and 54 minutes, more than an hour ahead of schedule, with the Jakarta region expanded from two to three availability zones on the same cadence. That is Tencent Cloud's earliest and largest migration-capability proof point in Asia Pacific, and the same approach is now being applied to Chinese enterprises moving into the Middle East, Latin America, and Europe. In the Middle East, Tencent Cloud has committed USD 150 million to build its first owned Middle East data center in Saudi Arabia, and is meanwhile delivering regulated capability today through the "Go Saudi" enterprise private cloud built jointly with Mobily. On the consumer side, another Chinese brand going global — HONOR — runs its global Honor cloud platform on Tencent Cloud, using a multi-region, multi-AZ, highly available, cloud-native architecture that covers more than 100 countries and regions and continues to open new growth in Europe, the Middle East, and Latin America. At the portfolio level, Tencent Cloud now operates 64 availability zones across 22 regions, supported by more than 3,200 global acceleration nodes, 400 Tbps of reserved bandwidth, 11 regional offices, nine global technical support centers, and more than 100 support touchpoints, with over 400 international certifications covering GDPR, ISO, and SOC. This is the repeatable, quantifiable path Tencent Cloud offers Chinese enterprises facing the long-running challenge of overseas infrastructure expansion.`,
                reasoning: {
                  sources: [
                    src("https://mp.weixin.qq.com/s/hUUB6qnIP_OZMw8FxqBr_A", "公众号腾讯云 2026-03-03 法兰克福第三可用区 + 美的欧洲迁移 + 混元3D加速出海"),
                    src("https://mp.weixin.qq.com/s/6Ug6YL0F3mPJdOPQmdxAFQ", "公众号腾讯云出海服务 2026-03-31 AI 重构出海竞争力 + 22/64/3200+/400T 口径"),
                    src("https://mp.weixin.qq.com/s/08d1ERzHr_cDtaHBGn8t0A", "公众号腾讯云出海服务 2025-09-26 中企出海到了拼智力的时代 (印尼数据流动限制)"),
                    src("https://mp.weixin.qq.com/s/j8vusknh7x0vBPpsTbxq7Q", "公众号腾讯云出海服务 2025-12-01 (沙特 USD 150M 再确认)"),
                    src("https://www.tencentcloud.com/dynamic/news-details/100692", "GoTo migration press release (2025-06-05) APAC capability proof"),
                    src("https://www.tencentcloud.com/dynamic/news-details/100534", "Mobily 'Go Saudi' (LEAP 2024)"),
                    src("https://www.tencent.com/en-us/articles/2202183.html", "GDES press release (2025-09-16)"),
                    src("wechat-local://腾讯云客户案例集/美的", "Tencent Cloud Customer Case (美的集团欧洲 IT 迁移 + 巴西 CDC + 美信)"),
                    src("wechat-local://腾讯云客户案例集/荣耀", "Tencent Cloud Customer Case (荣耀全球云平台)"),
                  ],
                  quotes: [
                    `[公众号腾讯云 2026-03-03 美的]: "去年7月，美的集团将其欧洲 IT 业务迁移至腾讯云法兰克福数据中心，近 50 个独立业务系统统一纳入云原生架构，并完成容器化改造。迁移后实现成本优化，系统稳定性与扩展能力同步提升。"`,
                    `[公众号腾讯云 2026-03-03 法兰克福]: "腾讯云正式宣布：将在德国法兰克福新增1个云可用区。新区将于今年2季度正式上线服务，届时腾讯云在德国的可用区数量增至3个"`,
                    `[Midea Brazil CDC]: 腾讯云分布式云 CDC 承载美的巴西智能工厂，时延 <1ms，满足本地数据驻留与合规，7×24 运维保障。`,
                    `[Midea 美信 / 腾讯会议]: 腾讯会议 SDK 集成至美的"美信"平台，依托 2,000+ 全球加速节点接入 200+ 海外子公司、19 万员工，93% 用户反馈使用体验显著改善。`,
                    `[GoTo]: "the migration involved more than 1,000 microservices ... completed in just 4 hours and 54 minutes, over an hour ahead of schedule"; Jakarta 2→3 AZ ahead of cutover.`,
                    `[公众号腾讯云出海服务 2026-03-31]: "腾讯云已实现22个地区覆盖、64个运营可用区、3200+全球加速节点、400T带宽储备 ... 获得400+项国内外权威认证"`,
                    `[HONOR]: 荣耀全球云平台基于腾讯云多地域多可用区、云原生、高可用架构，覆盖 100+ 国家和地区，欧洲/中东/拉美持续新增长。`,
                    `[Mobily LEAP 2024]: 沙特 Mobily × 腾讯云 TCE "Go Saudi" 企业级私有云，满足 KSA 数据驻留与监管。`,
                    `[公众号腾讯云出海服务 2025-09-26]: 印尼明确限制跨境数据流动，海外市场数据驻留与合规规则差异巨大。`,
                  ],
                  reasoning: `v2 case-swap：把"挑战"重新框定为中国企业出海面对的挑战，主案例换为美的欧洲 IT 迁移（中国消费电子集团 + 欧洲方向），与本 RFI"中国企业出海上云"的题面对齐；GoTo 印尼从主角降为亚太规模能力旁证，荣耀作为第二个走向全球的中国消费品牌补位；中东、合规与组合规模数据点保留作为可复用底色。`,
                  decision: `美的欧洲 IT 迁移为 hero 案例，美的巴西 CDC + 美信腾讯会议作为同一家中国企业的多地域补证，荣耀为第二个中国消费品牌出海样本，GoTo 仅作 APAC 能力验证脚注；组合口径升级到 v2 的 22/64/3200+/400T/11 区域办公室/9 中心/100+ 触点/400+ 认证基线。`,
                },
              },
            ],
          },
        ],
      },
    ],
  },

  // ====== II. AI ======
  {
    id: "s2",
    index: "II",
    title: "Global Full-stack AI Capabilities · 全球全栈 AI 能力",
    description: "从底层算力、大模型托管到上层 AI 应用的一站式生成式 AI 赋能。",
    descriptionEn: "One-stop Gen-AI enablement globally, spanning from underlying compute power and large model hosting to AI applications.",
    questions: [
      {
        id: "q2_1",
        title: "2.1 Capability Spectrum · 能力全景",
        promptEn: `Describe your generative AI stack globally (from underlying compute → large model hosting → upper-layer applications):
- Supported large model frameworks?
- How is localized AI inference/training ensured?
- One real-world client case study (industry, challenge, solution, outcome)`,
        promptZh: `请描述贵司在全球范围内提供的生成式AI技术栈（从底层算力→大模型托管→上层应用）：
- 支持哪些大模型框架？
- 本地化AI推理/训练能力如何保障？
- 典型客户场景案例（请提供1个）`,
        status: "needs-confirm",
        groups: [
          {
            layout: "labeled-rows",
            fields: [
              {
                id: "s2_frameworks",
                kind: "text",
                label: "Supported LLM frameworks · 支持的大模型框架",
                status: "verified",
                rows: 7,
                defaultValue: `腾讯云的生成式 AI 能力按三层组织。

第一层为训练与推理框架。腾讯云 TI Platform 是一站式机器学习平台，内置 PySpark、Spark、PyTorch、TensorFlow 等多种学习框架，配套 AutoML、TI-SDK，兼容 Python 与 R，支持 Git 代码管理，GPU 与 CPU 资源弹性按量计费。推理侧，腾讯混元与 NVIDIA 联合构建了基于 TensorRT-LLM 的高性能推理引擎 AngelHCF，在 NVIDIA GTC 2025 公开披露；腾讯自研的省 Token 推理优化技术已被全球主流推理框架采纳为官方方案。

第二层为自研大模型（Hunyuan 系列）。过去 12 个月混元发布 30+ 新模型并全面开源，包括混合推理模型 Hunyuan-A13B 与支持 30+ 语言的翻译模型。混元 3D 系列是这次更新的核心海外亮点：在 Hugging Face 累计下载超过 260 万次，是全球下载量最高的开源 3D 模型族；自 2025 年 11 月面向海外开放后，已被德国软件公司 Maxon 集成进 Cinema 4D（C4D）桌面应用的建模环节。2026 年 4 月，腾讯进一步开源混元 3D 世界模型 2.0（HY-World 2.0），一句话即可生成可导入 Unity 与 Unreal Engine 的 3D 场景资产；HunyuanVideo 已支撑中国 80% 头部 AI 漫剧团队的内容生产，出海北美 / 东南亚 / 日韩。新一代混元 Hy3 preview 模型已在腾讯云 TokenHub 平台上线，输入价格 1.2 元 / 百万 tokens。混元主模型本身仍以中国市场为主，海外客户通过下文上层产品消费 AI 能力。

第三层为上层应用与 Agent 能力。腾讯云智能体开发平台 ADP 于 2025 年 9 月发布 3.0 版本并面向全球推出（国际版命名 TCADP），支持 LLM+RAG、Workflow、Multi-Agent 三类智能体开发框架，配套 AI Infra Agent Runtime；3 个月内迭代近 600 项需求。2026 年 3 月发布的"腾讯云 Agent 产品全景图"覆盖基础设施层、模型服务层（TokenHub MaaS，自研混元 + 第三方模型供给）、技能生态层（开源 SkillsHub）与 AI 应用层。2026 年 4 月升级再增 ADP 智能工作台、ADP Agent Portal、ClawPro 专有云版、Agent Memory、Agent Storage；QClaw 海外版于 2026 年 4 月开启美国 / 加拿大 / 新加坡 / 韩国内测，内置多款国际顶尖大模型并支持自定义模型接入。SaaS+AI 套件包括腾讯会议 AI 小记（同比增长 150%）、腾讯乐享 LearnShare（覆盖 30 万家企业、回答准确率 92%）、CodeBuddy AI 编程助手（国际版已上线，减少编码时间 40%、研发效率提升 16%）。`,
                defaultValueEn: `Tencent Cloud's generative AI capability stack is organised in three layers.

Training and inference frameworks. Tencent Cloud TI Platform is a one-stop machine learning service for AI engineers, with PySpark, Spark, PyTorch and TensorFlow built in, plus AutoML, TI-SDK, Python and R support, and Git-based code management on elastic pay-as-you-go GPU and CPU. On the inference side, Tencent Hunyuan and NVIDIA jointly built AngelHCF, a high-performance inference engine for Hunyuan large language models based on TensorRT-LLM, disclosed at NVIDIA GTC 2025. Tencent's own token-saving inference optimisation has been adopted as an official capability across mainstream global inference frameworks.

Hunyuan model lineup. Over the last 12 months Hunyuan released more than 30 new models and went fully open-source, including the hybrid-inference Hunyuan-A13B and a translation model covering more than 30 languages. The Hunyuan 3D family is the lead overseas signal: it has been downloaded over 2.6 million times on Hugging Face, ranking as the most popular open-source 3D model family globally. Since Hunyuan 3D opened to overseas users in November 2025, German software vendor Maxon has integrated the Hunyuan 3D API into the modelling pipeline of its Cinema 4D desktop application. In April 2026 Tencent open-sourced Hunyuan 3D World Model 2.0 (HY-World 2.0), which generates 3D scene assets from a single prompt and imports directly into Unity and Unreal Engine. HunyuanVideo underpins production for roughly 80 percent of leading AI comic-drama studios in China, with content distributed in North America, Southeast Asia, and Japan and Korea. The new Hunyuan Hy3 preview model is now live on Tencent Cloud TokenHub at 1.2 RMB per million input tokens. The main Hunyuan large language model continues to serve the China market as its primary footprint; overseas customers consume Tencent AI capability through the upper-layer products described next, rather than through a publicly announced overseas GA of the main Hunyuan LLM.

Upper-layer applications and agent capability. Tencent Cloud Agent Development Platform (ADP) released its 3.0 version with a global launch in September 2025 (international edition: TCADP), supporting LLM+RAG, Workflow and Multi-Agent development frameworks alongside the AI Infra Agent Runtime, with close to 600 features shipped in three months. The Tencent Cloud Agent product map released in March 2026 covers the infrastructure layer, model service layer (TokenHub MaaS, providing both Hunyuan and leading third-party models), skills ecosystem layer (open-source SkillsHub), and AI application layer. April 2026 added the ADP Smart Workbench, ADP Agent Portal, ClawPro private-cloud edition, Agent Memory and Agent Storage; the QClaw international beta opened in April 2026 across the United States, Canada, Singapore and Korea, with several leading international large language models built in plus customer-bring-your-own-model support. The SaaS-plus-AI suite includes AI Minutes in Tencent Meetings (year-on-year growth of 150 percent), Tencent LearnShare with 300,000-plus enterprises and 92 percent response accuracy, and CodeBuddy, an international-edition AI coding tool that reduces coding time by 40 percent and lifts R&D efficiency by 16 percent.`,
                reasoning: {
                  sources: [
                    src("https://www.tencentcloud.com/product/ti", "tencentcloud.com/product/ti"),
                    src("https://www.tencent.com/en-us/articles/2202183.html", "GDES press release (2025-09-16)"),
                    src("https://www.nvidia.com/en-us/on-demand/session/gtc25-S71563/", "NVIDIA GTC 2025 Tencent HunYuan S71563"),
                    src("https://mp.weixin.qq.com/s/hUUB6qnIP_OZMw8FxqBr_A", "公众号腾讯云 2026-03-03 (混元 3D 海外开放 + Maxon)"),
                    src("https://mp.weixin.qq.com/s/U4N_F0DZM5BzGITU_J2a6g", "公众号腾讯云 2026-04-16 (HY-World 2.0)"),
                    src("https://mp.weixin.qq.com/s/qYUxMkFIDK9Gxxrm9In9qg", "公众号腾讯云 2026-03-27 (Agent 产品全景图)"),
                    src("https://mp.weixin.qq.com/s/PA1SMzy7CBaj9OGvDCWheQ", "公众号腾讯云 2026-04-28 (ADP 升级)"),
                    src("https://mp.weixin.qq.com/s/c_H4s_0WMmyutfrwkaWhcw", "公众号腾讯云 2026-04-21 (QClaw 海外版)"),
                  ],
                  quotes: [
                    `[TI Platform]: "Tencent Cloud TI Platform incorporates a wide variety of learning frameworks, such as PySpark, Spark, PyTorch, and TensorFlow"`,
                    `[NVIDIA GTC]: "Tencent HunYuan has worked closely with NVIDIA to build the high-performance inference engine AngelHCF for HunYuan large language models based on TensorRT-LLM."`,
                    `[GDES 2025-09-16]: "Hunyuan 3D series models have been downloaded over 2.6 million times on Hugging Face, making them the most popular open-source 3D models globally."`,
                    `[公众号腾讯云 2026-03-03]: "自去年11月面向海外开放以来，腾讯混元3D已进入欧洲创意产业。德国软件公司 Maxon 已在其 Cinema 4D（C4D）桌面应用中集成混元3D API，用于建模环节"`,
                    `[公众号腾讯云 2026-04-16 HY-World 2.0]: "今天，腾讯正式发布并开源混元3D世界模型2.0（HY-World 2.0）。一句话就能生成3D资产，并直接导入到游戏制作或具身仿真引擎"`,
                    `[公众号腾讯云 2026-03-27]: "腾讯云Agent产品全景图正式发布 ... 我们将MaaS平台升级为TokenHub 大模型服务平台，基于自研的混元大模型及先进的第三方模型，为企业提供全栈模型供给"`,
                    `[公众号腾讯云 2026-04-21]: "QClaw 海外版已在美国、加拿大、新加坡、韩国等国家和地区上线，支持中、英、法、西、韩等多语言"`,
                    `[GDES]: "AI Minutes in Tencent Meetings, which has seen a year-on-year growth rate of 150% over the past year. ... Tencent LearnShare, currently used by over 300,000 enterprises enjoying 92% response accuracy. CodeBuddy... reduces coding time by 40% and increases R&D efficiency by 16%."`,
                  ],
                  reasoning: `三层框架（训练/推理 + Hunyuan 自研 + 上层 Agent）保留并 v2 加深：训练/推理层补充 Tencent 省 Token 推理优化已上游进入主流框架；Hunyuan 层把核心海外亮点切到 3D 系列（Maxon C4D + HY-World 2.0 + Hugging Face 全球第一），HunyuanVideo / Hy3 preview / 30 国语言翻译均有公开来源；Agent 层把 2026-03 Agent 产品全景图 + 2026-04 ADP 升级 + QClaw 海外版内测拼成完整产品矩阵。混元主 LLM 海外 GA 未公开，answer 不作此声称。`,
                  decision: `按"框架 / Hunyuan / Agent + SaaS"三层铺陈；混元主 LLM 主要服务中国市场的诚实定位 surface，海外通过 Hunyuan 3D / TokenHub / ADP / QClaw / CodeBuddy 输出。`,
                },
              },
              {
                id: "s2_local_ai",
                kind: "text",
                label: "Localized AI inference/training · 本地化 AI 推理/训练",
                status: "needs-confirm",
                rows: 5,
                defaultValue: `可公开披露的本地化 AI 能力信号（按可信度由高到低）。

第一，海外可消费的 AI 产品组合明确。腾讯云 Agent Development Platform (TCADP)、CodeBuddy、Cloud Mall 三条产品线已上线国际版本，设计目标是适配本地需求与合规口径；QClaw 海外版本已进入美国 / 加拿大 / 新加坡 / 韩国内测，默认接入国际顶尖大模型并支持企业自带模型，而非默认绑定混元主模型。混元 3D 自 2025 年 11 月面向海外开放，Maxon Cinema 4D 已完成生产级集成。混元主模型仍主要服务中国市场；海外客户通过 TokenHub MaaS、ADP、CodeBuddy 与开源模型生态消费 AI 能力，这一定位与腾讯出海法律团队"选用合规可控的本土模型，规避第三方模型地域限制"的合规建议一致。

第二，海外算力底座已 GA。腾讯云覆盖全球 22 个地区、64 个可用区、3200+ 全球加速节点、400T 带宽储备；计划投资 1.5 亿美元在沙特建设中东首个数据中心，同步建设大阪第三个数据中心，法兰克福第三可用区将在 2026 年第二季度上线。Cloud GPU Service 训练实例族包括 GN10Xp、GN10X、GT4、GN8、GN6 / GN6S，推理实例族包括 GN7、GN10Xp、PNV4、GI3X、GN6 / GN6S；上层星脉高性能计算网络与高性能计算集群 HCC 提供分布式训练算力。

第三，客户验证的本地化 AI 推理性能。PPIO MaaS 平台基于腾讯云全球节点 + GPU 算力 + Serverless GPU 弹性调度，帮助某头部 AI 情感陪伴应用将 TOKEN 成本降低 60% 以上，峰值响应时间稳定在 P99 小于 1.5 秒，数据本地化不出境，满足 GDPR 合规。

第四，主权场景产品。ClawPro 专有云版于 2026 年 4 月发布，面向金融、政务等高安全需求行业，实现"运维 + 办公"双场景联动并将大模型与调度能力部署在客户本地环境。

公开材料未覆盖的口径以诚实模式回答：各国际 Region 的具体 GPU SKU 库存与配额矩阵、混元主模型在海外的 GA 状态与具体承载机房、TI Platform 在海外 Region 的可用性、以及混元主模型对海外受监管客户的 VPC 私有化部署 SKU，在公开材料中尚未发布；这部分本字段不展开推测，由腾讯团队在后续问询中按授权口径补充。`,
                defaultValueEn: `Publicly disclosable signals (highest confidence first).

International AI product portfolio is clear. International editions of Tencent Cloud Agent Development Platform (TCADP), CodeBuddy and Cloud Mall are GA, designed to fit local requirements and compliance positioning. The QClaw international beta launched in April 2026 in the United States, Canada, Singapore and Korea, defaulting to leading international large language models with bring-your-own-model support, rather than tying overseas users to the main Hunyuan model. Hunyuan 3D opened to overseas users in November 2025 and Maxon Cinema 4D has integrated it in production. The main Hunyuan large language model continues to serve the China market as its primary footprint; overseas customers consume Tencent AI capability through TokenHub MaaS, ADP, CodeBuddy and the open-source model ecosystem. This positioning is consistent with guidance from Tencent's own outbound legal counsel, who advises customers to choose compliance-controllable local models in each market and avoid third-party-model regional restrictions.

The overseas compute foundation is GA. Tencent Cloud spans 22 regions, 64 availability zones, more than 3,200 global acceleration nodes, and a 400 Tbps bandwidth reserve, with USD 150 million committed for the first Middle East data centre in Saudi Arabia, a third Osaka data centre under construction, and a third Frankfurt availability zone announced for Q2 2026 go-live. Cloud GPU Service training instance families include GN10Xp, GN10X, GT4, GN8 and GN6 / GN6S; inference instance families include GN7, GN10Xp, PNV4, GI3X and GN6 / GN6S. The Star high-performance compute network and high-performance compute clusters (HCC) provide the distributed-training substrate.

Customer-validated localised inference performance. PPIO MaaS, running on Tencent Cloud global nodes, GPU compute and Serverless GPU elastic scheduling, helped a leading AI emotional-companion application reduce token cost by more than 60 percent, hold peak response time at P99 below 1.5 seconds, keep data resident locally without cross-border egress, and meet GDPR and other global compliance requirements.

Sovereign and private-deployment delivery. ClawPro private-cloud edition launched in April 2026 for high-security verticals such as finance and government, combining operations-and-office workflows and deploying both the model and orchestration capability inside the customer's own environment.

Items not covered in public materials are answered honestly: per-region GPU SKU inventory and quota matrices across international regions, the GA status and physical hosting region for the main Hunyuan large language model overseas, international availability of TI Platform across overseas regions, and the existence of a customer-VPC private deployment SKU for the main Hunyuan large language model for regulated overseas customers, are not currently disclosed in public materials. This field does not extrapolate beyond what is publicly disclosed; the Tencent team will follow up with authorised positions in subsequent rounds where applicable.`,
                reasoning: {
                  sources: [
                    src("https://www.tencent.com/en-us/articles/2202183.html", "GDES press release (2025-09-16)"),
                    src("https://www.tencentcloud.com/product/gpu", "tencentcloud.com/product/gpu"),
                    src("https://mp.weixin.qq.com/s/hUUB6qnIP_OZMw8FxqBr_A", "公众号腾讯云 2026-03-03 (混元 3D 海外 + Maxon)"),
                    src("https://mp.weixin.qq.com/s/c_H4s_0WMmyutfrwkaWhcw", "公众号腾讯云 2026-04-21 (QClaw 海外版)"),
                    src("https://mp.weixin.qq.com/s/6Ug6YL0F3mPJdOPQmdxAFQ", "公众号腾讯云出海服务 2026-03-31 (PPIO + 合规观点)"),
                    src("https://mp.weixin.qq.com/s/PA1SMzy7CBaj9OGvDCWheQ", "公众号腾讯云 2026-04-28 (ClawPro 专有云)"),
                  ],
                  quotes: [
                    `[GDES]: "Tencent Cloud has introduced international versions of products such as Tencent Cloud Agent Development Platform (TCADP), CodeBuddy and Cloud Mall."`,
                    `[公众号腾讯云 2026-04-21 QClaw]: "QClaw 海外版已在美国、加拿大、新加坡、韩国等国家和地区上线 ... 内置多款国际顶尖大模型，同时支持自定义接入"`,
                    `[公众号腾讯云 2026-03-03]: "自去年11月面向海外开放以来，腾讯混元3D已进入欧洲创意产业。德国软件公司 Maxon 已在其 Cinema 4D（C4D）桌面应用中集成混元3D API"`,
                    `[公众号腾讯云出海服务 2026-03-31 PPIO]: "依托腾讯云全球节点、GPU 算力 ... 通过Serverless GPU 弹性调度与自研推理优化引擎，将TOKEN成本降低60%以上，峰值响应时间稳定在 P99<1.5s，同时实现数据本地化不出境，完美满足 GDPR 等全球合规要求"`,
                    `[公众号腾讯云出海服务 2026-03-31 法律观点]: "选用合规可控的本土模型，规避第三方模型地域限制与商用风险"`,
                    `[product/gpu]: "AI training: GN10Xp, GN10X, GT4, GN8, and GN6/GN6S; AI inference: GN7, GN10Xp, GN10X, PNV4, GI3X, GN6, and GN6S"`,
                    `[公众号腾讯云 2026-04-28 ClawPro]: "首发ClawPro专有云版"`,
                  ],
                  reasoning: `v2 polish 把 v1 的"国际混元 API 端点"投机性口径替换为可验证子集（混元 3D 海外 GA + Maxon C4D + ADP/QClaw/CodeBuddy 国际版 + GPU SKU + PPIO 客户验证 P99<1.5s + ClawPro 专有云），并诚实声明混元主模型海外 GA、per-region GPU SKU、TI Platform 国际版可用性等公开未覆盖项。`,
                  decision: `按"可披露信号 4 段 + 公开未覆盖诚实声明"组织；以 PPIO 的 P99<1.5s + GDPR 合规作为客户验证锚点。`,
                },
              },
              {
                id: "s2_case",
                kind: "text",
                label: "Client case study · 客户案例",
                status: "verified",
                rows: 12,
                defaultValue: `主案例: 荣耀 (HONOR) — 中国 AI 智能终端厂商, 在腾讯云上同时跑 LLM 推理加速与全球业务承载。

行业与客户。荣耀成立于 2013 年, 定位为全球领先的 AI 终端生态公司, 同时也是智能终端厂商, 以创新, 品质, 服务三大战略要点为支点, 聚焦人机交互方式变革, 持续打造全场景, 全渠道, 全人群的标志性科技品牌。荣耀坚持前瞻性研发投入, 为全球消费者打造不断创新的智能设备, 业务横跨消费云, 研发, 制造, 营销, 供应链与售后等多条业务线。

挑战。荣耀面对两个同时发生的问题。一是大模型部署成本。DeepSeek 走红后, 企业侧需求井喷, 但动辄数百万元的部署投入让大多数企业望而却步; 荣耀需要在不持续扩大服务器规模的前提下, 解决推理响应慢, server-busy 等使用体验问题。二是全球市场扩张。荣耀正持续扩大海外营销市场, 要让不同国家与地区的消费者获得一致的顶级体验, 多业务的庞大体量给云端带来巨大压力; 公有云"快速开通, 按需付费, 安全可靠"的属性成为最优选, 荣耀需要一个能在全球范围内满足复杂业务诉求的云计算战略合作伙伴。

解决方案。腾讯云在两个层面承接荣耀的诉求。第一层是大模型加速。基于腾讯云 TencentOS Server AI 底座, 在为荣耀运行 LLM 时部署 TACO-LLM 加速模块。TACO-LLM 使用 speculative sampling (推测采样) 技术, 让大模型"大胆预测一段, 再快速校验"取代逐 token 推理的慢路径, 显著提升推理速度并更充分利用 GPU 算力, 提升整个推理平台的性能与稳定性; 针对荣耀对"即时反馈"要求极高的高频交互场景, TACO-LLM 在高性能 GPU 平台上进一步优化, 最大限度压低推理算力消耗。第二层是全球业务承载。依托腾讯云的全球分布式基础设施, 通过多地域 + 多可用区部署, 叠加高可用, 云原生等产品能力, 为荣耀搭建了一朵灵活, 高效, 面向全球的荣耀云平台, 全面支撑消费云, 研发, 制造, 营销, 供应链与售后等多元业务。本次合作所用产品包括: TencentOS Server AI 底座, TACO-LLM 加速模块, 计算, 存储, 网络, 数据库, 云原生, 安全。

结果。大模型推理性能上, 以 DeepSeek-R1 满血版为例, 相较荣耀原线上基线: TTFT (Time-To-First-Token) P95 响应时间最高降低 6.25 倍, 吞吐量提升 2 倍, 端到端时延降低 100%; 在最新社区 sglang 场景中, TTFT P95 响应时间最高降低 12.5 倍。落到荣耀实际业务上, TACO-LLM 将 DeepSeek 推理速度在 A 平台提升 70%, 在 B 平台提升 20%, 模型运行更流畅, 系统调度更顺滑。全球业务承载上, 腾讯云帮助荣耀构建了一个高效, 可靠, 安全, 智能的海外云平台, 助力荣耀以全新姿态进入 100+ 个国家与地区, 在欧洲, 中东, 拉美等市场取得新的增长突破。

补充说明 (海外软件厂商对腾讯 AI 能力的引用): 在 Hunyuan 3D 方向, 德国软件公司 Maxon 已将混元 3D API 集成进 Cinema 4D 的建模环节, 是公开材料中"海外厂商在产品中嵌入混元家族能力"的代表引用, 与荣耀案例形成"中国厂商出海 + 海外厂商引入"的两条并行路径。`,
                defaultValueEn: `Primary case: HONOR - a Chinese AI smart-terminal company running LLM inference acceleration and global business workloads on Tencent Cloud.

Industry and customer. HONOR, founded in 2013, is positioned as a global leading AI smart-terminal ecosystem company and a smart-terminal provider. The company is anchored on three strategic control points - innovation, quality, and service - and is focused on transforming human-machine interaction, building an all-scenario, all-channel, all-people landmark technology brand through sustained forward-looking R&D investment. Its cloud workloads span consumer cloud, R&D, manufacturing, marketing, supply chain, and after-sales.

Challenges. HONOR faced two simultaneous issues. First, large language model deployment cost: with DeepSeek going viral, enterprise demand surged, but multi-million RMB deployment costs deterred most enterprises. HONOR needed to address slow response and server-busy issues without continuously scaling out its server fleet. Second, global market expansion: HONOR is continuously expanding overseas marketing markets, and to give consumers across different countries and regions a consistent top-tier experience, the massive multi-business cloud footprint puts heavy pressure on the platform. Public cloud's rapid provisioning, pay-as-you-go, secure-and-reliable characteristics made it the best fit, and HONOR needed a cloud strategic partner capable of meeting complex business requirements at global scale.

Solution. Tencent Cloud addressed both fronts in a single stack. At the LLM acceleration layer, HONOR's large language model workloads run on the Tencent Cloud TencentOS Server AI foundation (TencentOS Server AI 底座) with the TACO-LLM acceleration module deployed in front of inference. TACO-LLM uses speculative sampling - the model "boldly predicts a chunk, then quickly verifies" - replacing the slow one-token-at-a-time inference path. This significantly increases inference speed and makes fuller use of GPU compute, lifting overall inference platform performance and stability. For interactive features with extremely high "instant feedback" requirements at high frequency, TACO-LLM is further optimised on high-performance GPU platforms to minimise inference compute consumption. At the global infrastructure layer, Tencent Cloud's globally distributed infrastructure - multi-region and multi-availability-zone deployment plus cloud-native, high-availability product capabilities - underpins a flexible, efficient, global-facing HONOR cloud platform that fully supports its consumer cloud, R&D, manufacturing, marketing, supply chain, and after-sales businesses. Products engaged include TencentOS Server AI foundation, TACO-LLM acceleration module, Compute, Storage, Network, Database, Cloud-Native, and Security.

Outcomes. On LLM inference performance, against HONOR's original on-line baseline using DeepSeek-R1 (full version): TTFT (Time-To-First-Token) P95 response time is reduced by up to 6.25 times, throughput is improved 2 times, and end-to-end latency is reduced by 100 percent. In the latest community sglang scenario, TTFT P95 response time is reduced by up to 12.5 times. Applied in HONOR's live business, TACO-LLM accelerates DeepSeek inference by 70 percent on HONOR's Platform A and 20 percent on Platform B - models run more smoothly and system scheduling is more efficient. On the global expansion track, Tencent Cloud helped HONOR build an efficient, reliable, secure, intelligent overseas cloud platform that lets HONOR enter more than 100 countries and regions in a brand-new posture, with new growth breakthroughs in Europe, the Middle East, and Latin America.

Supplementary reference (overseas vendor adopting a Hunyuan-family API): in the Hunyuan 3D direction, German software vendor Maxon has integrated the Hunyuan 3D API into the modelling pipeline of its Cinema 4D desktop application - the cleanest published reference of an overseas vendor embedding a Hunyuan-family capability into its product, complementing the HONOR case on the "Chinese vendor goes global" track with an "overseas vendor adopts Tencent AI" track.`,
                reasoning: {
                  sources: [
                    src("wechat-local://腾讯云客户案例集/荣耀", "Tencent Cloud Customer Case (荣耀 TACO-LLM + 全球荣耀云平台)"),
                    src("https://mp.weixin.qq.com/s/hUUB6qnIP_OZMw8FxqBr_A", "公众号腾讯云 2026-03-03 (Maxon 集成混元 3D + 混元 3D 加速出海)"),
                    src("https://mp.weixin.qq.com/s/6Ug6YL0F3mPJdOPQmdxAFQ", "公众号腾讯云出海服务 2026-03-31 (AI 重构出海竞争力)"),
                    src("https://mp.weixin.qq.com/s/08d1ERzHr_cDtaHBGn8t0A", "公众号腾讯云出海服务 2025-09-26 (中企出海, 到了拼智力的时代)"),
                    src("https://www.tencent.com/en-us/articles/2202183.html", "GDES press release (2025-09-16)"),
                  ],
                  quotes: [
                    `[HONOR customer profile]: 荣耀成立于 2013 年, 全球领先的 AI 终端生态公司, 业务覆盖消费云 / 研发 / 制造 / 营销 / 供应链 / 售后。`,
                    `[HONOR challenges]: DeepSeek 走红后企业侧推理需求井喷, 数百万元部署投入与 server-busy 体验; 同时荣耀正在持续扩大海外营销市场, 需一致顶级体验。`,
                    `[HONOR solution]: 基于 TencentOS Server AI 底座 + TACO-LLM 加速模块, 使用 speculative sampling 技术替代逐 token 推理; 全球分布式多地域 + 多可用区 + 云原生承载全球荣耀云平台。`,
                    `[HONOR outcomes — DeepSeek-R1]: "TTFT P95 响应时间最高降低 6.25 倍, 吞吐量提升 2 倍, 端到端时延降低 100%"; sglang 场景 TTFT P95 降低 12.5 倍; 荣耀 A 平台 +70%, B 平台 +20%。`,
                    `[HONOR global scale]: 助力荣耀以全新姿态进入 100+ 国家和地区, 欧洲 / 中东 / 拉美新增长突破。`,
                    `[公众号腾讯云 2026-03-03 Maxon]: "德国软件公司 Maxon 已在其 Cinema 4D（C4D）桌面应用中集成混元3D API，用于建模环节"`,
                    `[公众号腾讯云 2026-03-03 海外开放]: 混元 3D 自 2025 年 11 月面向海外开放, Hugging Face 累计下载超过 260 万次。`,
                  ],
                  reasoning: `v2 case-swap：将 CNN BRASIL（巴西本地媒体）替换为荣耀（HONOR, 中国 AI 智能终端品牌），与 RFI"中国企业出海"题面对齐；荣耀同时具备 LLM 推理加速（TACO-LLM + TencentOS Server AI 底座 + speculative sampling）与全球业务承载（100+ 国家、欧中拉新增长）两条主线，且性能数据可量化（TTFT 6.25×/12.5×、A 平台 +70%、B 平台 +20%），是同时回答"AI 客户场景"+"中国企业出海"两条要求的最干净案例。Maxon × 混元 3D 作为"海外厂商引入混元家族能力"的补充引用保留。`,
                  decision: `荣耀（HONOR）作为 AI 主案例 + Maxon × 混元 3D 作为海外软件厂商对腾讯 AI 能力的补充引用, 形成"中国厂商出海 + 海外厂商引入"两条并行路径。`,
                },
              },
            ],
          },
        ],
      },
      {
        id: "q2_2",
        title: "2.2 Cross-regional consistency · 跨区域一致性",
        promptEn: `How do you ensure consistent AI performance across regions (e.g., latency, throughput, model accuracy)?`,
        promptZh: `如何确保AI服务在全球不同区域的性能一致性？（例如：控制台、模型延迟、模型精度或其他）`,
        status: "needs-confirm",
        groups: [

          {
            fields: [
              {
                id: "s2_consistency",
                kind: "text",
                label: "跨区域一致性",
                status: "needs-confirm",
                rows: 4,
                defaultValue: `腾讯云在三层结构上保障跨区域 AI 表现的一致性，同时坦诚说明哪些 per-region 指标公开材料未披露。

第一层是推理引擎。腾讯混元与 NVIDIA 联合构建了高性能推理引擎 AngelHCF，基于 NVIDIA TensorRT-LLM，在 NVIDIA GTC 2025 公开披露。在此基础之上，腾讯云 TACO 团队的省 Token 关键技术 FlexKV，已正式合入 NVIDIA Dynamo、vLLM、TensorRT-LLM 三大主流推理框架的官方主线，作为其官方支持的 KV Cache 卸载方案；端到端形成 GPU 资源调度（Dynamo）+ 推理执行（vLLM / TRT-LLM）+ 缓存复用（FlexKV）的协同闭环，从源头压缩首 Token 延迟、提升整体吞吐。这意味着任何使用上述主流框架的部署，在工程层面享受的是同一套已被上游接收的优化路径。配套上层，TI Platform 作为一站式机器学习平台为模型从数据到训练、评估、服务提供统一抽象，弹性 GPU / CPU 按需计费。

第二层是消费侧 API。腾讯云已将 MaaS 升级为 TokenHub，统一接入混元、DeepSeek、MiniMax、Kimi、GLM 等多家模型，配合 Token Plan 统一计费，企业可按需调度、灵活切换；这是出海企业实际跨区域消费 AI 能力的统一入口，模型与计费口径不随部署地点变化。在 API 契约层面，腾讯云 API 框架既支持就近域名自动解析到最近区域服务器，也允许对延迟敏感的业务显式 pin 到指定区域；同一 Action、同一 Version、Region 参数非必填，调用契约跨区域不变。在产品形态上，Tencent Cloud Agent Development Platform（TCADP）、CodeBuddy、Cloud Mall 等已发布国际版本，在保留统一能力前提下适配本地需求。

第三层是边缘交付底座。EdgeOne 作为统一边缘层为后端 AI 服务做前置，运行 3,200+ 全球加速节点、400+ Tbps 全网带宽、25 Tbps 全局 DDoS 防护带宽、20+ 可定制 Web 安全特性与智能机器人管理；边缘节点在中国大陆以外多个地区部署以承接跨区域业务，静动态内容统一智能加速以降低延迟。整体基础设施侧，腾讯云覆盖 22 个地区、64 个运营可用区、3,200+ 全球加速节点、400T 带宽储备，设立 9 大技术支持中心与 100+ 全球技术支持触点。

客户侧的可验证印证：PPIO 依托腾讯云全球节点、GPU 算力、CLS+COS 日志存储、高性能负载均衡等核心服务，为某头部 AI 情感陪伴应用搭建了全球分布式 AI 基础设施，通过 Serverless GPU 弹性调度与自研推理优化引擎，把 TOKEN 成本降低 60% 以上、峰值响应时间稳定在 P99 < 1.5s，同时实现数据本地化不出境、满足 GDPR 等全球合规要求。

诚实说明，公开材料未披露的 per-region 指标：
- 各区域 AI 推理 API 的延迟 SLA（p50 / p95 / p99）未在公开文档披露，与业界其他超大规模云厂商一致。
- 各区域吞吐 / 并发上限是否完全对齐，公开文档仅披露默认账号侧并发数与 RPS，未披露各区域是否存在差异。
- 各区域模型精度对齐基线（BLEU / MMLU / 内评）未公开发布，公开材料仅可声明"同一模型构件由同一引擎承接"。
- 模型版本跨区域同步节奏（同步上线 / canary / 分批）未公开。
- 各区域具体推理舰队部署拓扑（是否同版本同时部署、是否本地物理承载）公开文档未披露，待 AR 确认是否能在 NDA 下补充。`,
                defaultValueEn: `Tencent Cloud holds AI behaviour consistent across regions on three layers, and is explicit about which per-region performance figures are not publicly disclosed.

First, the inference engine layer. Tencent Hunyuan and NVIDIA jointly built AngelHCF, a high-performance inference engine for Hunyuan large language models, on NVIDIA TensorRT-LLM, disclosed at NVIDIA GTC 2025. On top of this, Tencent Cloud's TACO team contributed FlexKV, a token-saving KV-cache offload technology that has been merged into the official mainlines of NVIDIA Dynamo, vLLM and TensorRT-LLM as their officially supported KV-cache offload solution, forming an end-to-end pipeline of GPU scheduling (Dynamo) plus inference execution (vLLM, TensorRT-LLM) plus cache reuse (FlexKV) that compresses first-token latency and lifts overall throughput at source. The practical implication is that any deployment running these mainstream frameworks, regardless of location, exercises the same upstream-accepted optimisation path. Sitting above this, Tencent Cloud TI Platform provides a uniform one-stop machine learning abstraction from data preprocessing through training, evaluation and model service, with elastic GPU and CPU billed pay-as-you-go.

Second, the consumption-side API layer. Tencent Cloud has upgraded its MaaS into TokenHub, a unified model-supply platform that aggregates Hunyuan plus DeepSeek, MiniMax, Kimi, GLM and other third-party models behind a single API surface and a single Token Plan billing model, letting enterprises route and switch on demand. This is the actual uniform consumption surface that international customers use to consume AI capability across regions, with model contract and billing semantics independent of deployment location. At the API-contract level, Tencent Cloud's API framework supports both auto-resolution to the nearest regional server and explicit region pinning for latency-sensitive workloads, with the same Action, the same Version and an optional Region parameter — an invariant integration surface. At the product level, Tencent Cloud Agent Development Platform (TCADP), CodeBuddy and Cloud Mall ship as international editions designed to keep capabilities uniform while accommodating local requirements.

Third, the edge delivery substrate. EdgeOne fronts customer traffic before it reaches AI APIs and other backends, with 3,200+ points of presence, 400+ Tbps of global network bandwidth, 25 Tbps dedicated to DDoS mitigation, 20+ customisable web-security features and intelligent bot management. Edge nodes are deployed in multiple regions outside mainland China to absorb cross-region demand, and dynamic and static content share the same intelligent acceleration path to reduce latency. At the infrastructure layer, Tencent Cloud now covers 22 regions and 64 availability zones, with 3,200+ global acceleration nodes, 400T of bandwidth reserve, 9 global technical support centres and 100+ technical support touchpoints worldwide.

Customer proof point. PPIO, drawing on Tencent Cloud's global nodes, GPU compute, CLS+COS log storage and high-performance load balancing, built a globally distributed AI infrastructure for a leading overseas AI companion application; with serverless GPU elastic scheduling and a self-developed inference optimisation engine, it cut token cost by more than 60%, held peak response time at P99 below 1.5 seconds, and kept data resident in-region in compliance with GDPR and similar regimes.

Items not publicly disclosed, flagged for analyst-relations follow-up.

Per-region latency SLAs (p50 / p95 / p99) for the relevant AI inference APIs are not published in public documentation; this is consistent with practice across hyperscalers.

Per-region throughput and concurrency parity. Public documentation discloses default account-level concurrency limits and per-second request rates, but does not state whether quotas are uniform across all overseas regional endpoints.

Per-region model-accuracy parity benchmarks (BLEU, MMLU, internal evaluations) are not publicly published; public sources support only the structural claim that the same model artefact is served by the same engine across deployments that consume it.

Cross-region model-version rollout cadence (synchronous, canary or staged) is not described in public documentation.

Inference fleet deployment topology across overseas regions — whether each regional endpoint is backed by a same-version, physically deployed inference fleet in that data centre, or whether some endpoints front-end into a different DC — is not publicly stated.`,
                reasoning: {
                  sources: [
                    src("https://www.nvidia.com/en-us/on-demand/session/gtc25-S71563/", "NVIDIA GTC 2025 Tencent HunYuan S71563"),
                    src("https://www.tencentcloud.com/document/product/1284/75533", "Hunyuan API Request Structure"),
                    src("https://www.tencentcloud.com/product/ti", "tencentcloud.com/product/ti"),
                    src("https://www.tencentcloud.com/product/teo", "tencentcloud.com/product/teo"),
                    src("https://mp.weixin.qq.com/s/qYUxMkFIDK9Gxxrm9In9qg", "公众号腾讯云 2026-03-27 TokenHub MaaS"),
                    src("https://mp.weixin.qq.com/s/6Ug6YL0F3mPJdOPQmdxAFQ", "公众号腾讯云出海服务 2026-03-31 (PPIO)"),
                    src("https://www.tencent.com/en-us/articles/2202183.html", "GDES press release (2025-09-16)"),
                  ],
                  quotes: [
                    `[NVIDIA GTC]: "Tencent HunYuan has worked closely with NVIDIA to build the high-performance inference engine AngelHCF for HunYuan large language models based on TensorRT-LLM."`,
                    `[公众号腾讯云 2026-04-10 FlexKV]: "腾讯云一项面向大模型推理优化的关键技术FlexKV，正式合入NVIDIA Dynamo、vLLM、TensorRT-LLM全球三大主流推理技术栈和框架官方主线"`,
                    `[公众号腾讯云 2026-03-27 TokenHub]: "MaaS 平台全新升级为TokenHub —— 统一接入混元、DeepSeek、MiniMax、Kimi、GLM等多家模型，配合Token Plan统一计费"`,
                    `[document/1284/75533]: "The API supports access from either a nearby region (at hunyuan.intl.tencentcloudapi.com) or a specified region"`,
                    `[product/teo]: "3200+ PoP. 400+Tbps Global Network Bandwidth ... 25Tbps Global Bandwidth Dedicated for DDoS Mitigation. 20+Customizable Web Security Features."`,
                    `[公众号腾讯云出海服务 2026-03-31 PPIO]: "依托腾讯云全球节点、GPU 算力 ... TOKEN成本降低60%以上，峰值响应时间稳定在 P99<1.5s，同时实现数据本地化不出境"`,
                    `[GDES]: "Tencent Cloud has introduced international versions of products such as Tencent Cloud Agent Development Platform (TCADP), CodeBuddy and Cloud Mall."`,
                  ],
                  reasoning: `v2 polish 在 v1 三层基础上加深：引擎层补充 FlexKV 上游进入 Dynamo / vLLM / TRT-LLM（任一主流框架部署都享受同一套优化）；API 层把头部锚点切到 TokenHub MaaS 统一消费入口（替代 v1 的"17 区域端点矩阵"，避免误导 Hunyuan 主 LLM 海外 GA）；边缘层 EdgeOne 数据保留；新增 PPIO P99 < 1.5s + GDPR 客户验证。Per-region 数字仍诚实声明公开未披露。`,
                  decision: `三层结构性证据（引擎 + 消费 API + 边缘）+ 客户验证锚点 + 5 项公开未披露明示。`,
                },
              },
            ],
          },
        ],
      },
      {
        id: "q2_3",
        title: "2.3 Core differentiation · 差异化优势",
        promptEn: `What are your core advantages in full-stack AI capabilities versus competitors? (1-2 sentences)`,
        promptZh: `与竞争对手相比，贵司在全栈AI能力方面的核心优势是什么？（请用1-2句话概括）`,
        status: "strategic",
        groups: [
          {
            fields: [
              {
                id: "s2_diff",
                kind: "text",
                label: "差异化优势",
                status: "strategic",
                rows: 5,
                defaultValue: `腾讯云的全栈 AI 差异化锚点是混元 3D 系列：在 Hugging Face 累计下载超过 260 万次，是全球下载量最高的开源 3D 模型族，并已被德国 Maxon 集成进 Cinema 4D 桌面端，形成了同业云厂商目前没有的、"被海外创意软件商真实采用"的国际化引用。同一套混元能力在腾讯会议、微信生态以消费级规模长期跑通，再通过 TokenHub MaaS、Agent 开发平台 ADP 与 CodeBuddy 国际版输出给海外企业，因此中企出海客户拿到的是已被 C 端真实流量验证过的 AI 引擎，而不是只发布、未经规模化考验的模型 demo。`,
                defaultValueEn: `Tencent Cloud's full-stack AI differentiation is anchored on the Hunyuan 3D family — over 2.6 million downloads on Hugging Face, the most-downloaded open-source 3D model family globally, and already embedded by Germany's Maxon into Cinema 4D's modeling pipeline, a named overseas-vendor adoption no hyperscaler peer holds today. The same Hunyuan stack runs at consumer scale inside WeChat and Tencent Meetings before being shipped to overseas enterprises through TokenHub MaaS, Agent Development Platform 3.0 and CodeBuddy International, so Chinese-going-global customers get an AI engine already proven against real workloads rather than a model release.`,
                reasoning: {
                  sources: [
                    src("https://www.tencent.com/en-us/articles/2202183.html", "GDES press release (2025-09-16)"),
                    src("https://mp.weixin.qq.com/s/hUUB6qnIP_OZMw8FxqBr_A", "公众号腾讯云 2026-03-03 (Maxon Cinema 4D 集成混元 3D)"),
                    src("https://mp.weixin.qq.com/s/qYUxMkFIDK9Gxxrm9In9qg", "公众号腾讯云 2026-03-27 (Agent 产品全景图)"),
                    src("https://huggingface.co/tencent", "Hugging Face Tencent organization"),
                  ],
                  quotes: [
                    `[GDES]: "Hunyuan 3D series models have been downloaded over 2.6 million times on Hugging Face, making them the most popular open-source 3D models globally."`,
                    `[公众号腾讯云 2026-03-03]: "自去年11月面向海外开放以来，腾讯混元3D已进入欧洲创意产业。德国软件公司 Maxon 已在其 Cinema 4D（C4D）桌面应用中集成混元3D API"`,
                    `[GDES]: "AI Minutes in Tencent Meetings, which has seen a year-on-year growth rate of 150% over the past year."`,
                    `[公众号腾讯云 2026-03-27]: "腾讯云Agent产品全景图正式发布，打造面向Agent时代的全栈AI引擎"`,
                  ],
                  reasoning: `1-2 句严格限制下，复合 framing 第一句锚定可声称的全球 #1（Hunyuan 3D 开源下载 + Maxon 海外厂商采用），第二句锚定"消费级规模验证 + 上层国际化输出"。删去 v1 中 China-side 的 LearnShare/CodeBuddy 具体数字（在差异化场景下不够 AI-specific），换成"消费级真实流量 + TokenHub MaaS / ADP / CodeBuddy 国际化"的更纯结构表达。`,
                  decision: `两句复合 framing：第一句锚定 Hunyuan 3D 全球 #1 + Maxon 海外采用，第二句锚定 WeChat / 腾讯会议消费级规模验证 + TokenHub / ADP / CodeBuddy 国际化输出。`,
                },
              },
            ],
          },
        ],
      },
    ],
  },

  // ====== III. Ecosystem ======
  {
    id: "s3",
    index: "III",
    title: "Global Ecosystem · 全球生态",
    description: "围绕云平台的咨询、ISV、SaaS 等第三方联合服务网络。",
    descriptionEn: "A third-party joint service network built around the cloud platform. Such as ISV, SaaS, consulting groups.",
    questions: [
      {
        id: "q3_1",
        title: "3.1 Third-party service network · 第三方服务网络",
        promptEn: `Describe your third-party service network in target markets:
- Partner count (consulting/ISVs/SaaS)
- Localized operations team size
- Typical collaboration models (e.g., joint solutions, co-marketing)`,
        promptZh: `请描述贵司在目标市场的第三方服务网络建设：
- 合作伙伴数量（咨询/ISV/SaaS）
- 自有的本地化运营团队规模
- 典型合作模式（如：联合解决方案、联合营销）`,
        status: "verified",
        groups: [

          {
            layout: "labeled-rows",
            fields: [
              {
                id: "s3_partners",
                kind: "text",
                label: "Partner count · 合作伙伴数量",
                status: "verified",
                rows: 4,
                defaultValue: `腾讯云全球合作伙伴生态规模超过 11,000 家。该数字最早由腾讯集团高级执行副总裁、云与智慧产业事业群 CEO 汤道生在 2024 年沙特 LEAP 大会上披露（"Tencent Cloud's Global Partner Ecosystem is 11,000 partners strong"），并在 2025 年 3 月印尼合作发布会上以"over 11,000 partners"口径再次确认。截至 2025 年 9 月深圳全球数字生态大会（GDES）国际出海峰会，腾讯云国际新增签约的合作伙伴覆盖四个区域：亚太（Datacom、IOH、Gardi Management、GoTo Group、MahakaX、MUFG Bank China、RYDE Technologies、StoneLink、True IDC、99 Group）、中东（Coop Bank Oromia、Nativex）、欧洲（eMAG）、北美（InCloud）。

2026 年 4 月 28 日在 2026 腾讯云城市峰会重庆站，腾讯云正式发布"出海生态启航计划"，通过出海权益 / 伙伴库 / 知识服务三大体系，进一步将合作伙伴生态向中国企业出海场景定向延伸。

合作伙伴数量按类型（咨询 / ISV / SaaS / 渠道 / 服务）与按 program tier（Standard / Silver / Gold / Platinum）的细分计数，腾讯云目前未公开披露；本字段不展开推测，由腾讯团队在后续问询中按授权口径补充。`,
                defaultValueEn: `Tencent Cloud's Global Partner Ecosystem stands at over 11,000 partners worldwide. The figure was first disclosed by Dowson Tong, Senior Executive Vice President of Tencent and CEO of the Cloud and Smart Industries Group, at the LEAP 2024 summit in Saudi Arabia ("Tencent Cloud's Global Partner Ecosystem is 11,000 partners strong"), and was reaffirmed in a March 2025 Indonesia announcement as "over 11,000 partners". At the September 2025 Global Digital Ecosystem Summit (GDES) International Going-Global Summit in Shenzhen, Tencent Cloud International signed new partnership agreements across four regions: Asia Pacific (Datacom, IOH, Gardi Management, GoTo Group, MahakaX, MUFG Bank China, RYDE Technologies, StoneLink, True IDC, 99 Group); the Middle East (Coop Bank Oromia, Nativex); Europe (eMAG); and North America (InCloud).

On 28 April 2026, at the Tencent Cloud City Summit in Chongqing, Tencent Cloud formally launched the Going-Global Ecosystem Launch Initiative ("Chu Hai Sheng Tai Qi Hang Ji Hua"), structured around three pillars: going-global entitlements, a partner library, and knowledge services. This program extends the partner ecosystem with a dedicated overlay for Chinese enterprises expanding into international markets.

A granular breakdown of the 11,000-plus partner count by partner type (consulting, ISV, SaaS, channel, service) and by program tier (Standard, Silver, Gold, Platinum) is not currently disclosed in public materials. This field does not extrapolate beyond what is publicly disclosed; the Tencent team will follow up with authorised positions in subsequent rounds where applicable.`,
                reasoning: {
                  sources: [
                    src("https://www.tencentcloud.com/dynamic/news-details/100534", "Mobily 'Go Saudi' / LEAP 2024 (含 11,000 partners CEO 引用)"),
                    src("https://www.tencentcloud.com/dynamic/news-details/100657", "Indonesia 2025-03-13 (含 over 11,000 reaffirmation)"),
                    src("https://www.tencent.com/en-us/articles/2202183.html", "GDES press release (2025-09-16)"),
                    src("https://mp.weixin.qq.com/s/PA1SMzy7CBaj9OGvDCWheQ", "公众号腾讯云 2026-04-28 出海生态启航计划"),
                  ],
                  quotes: [
                    `[Mobily LEAP 2024 - Dowson Tong]: "Today, Tencent Cloud's Global Partner Ecosystem is 11,000 partners strong, jointly serving clients worldwide"`,
                    `[Indonesia 2025-03-13]: "Indonesian businesses are now actively contributing to Tencent Cloud's global partner ecosystem with a network of over 11,000 partners."`,
                    `[GDES 2025-09-16]: "Tencent Cloud International signing partnership agreements with global enterprises, from Asia Pacific companies including Datacom, IOH, Gardi Management, GoTo Group, MahakaX, MUFG Bank (China), RYDE Technologies, StoneLink, True IDC, 99 Group; to Middle Eastern companies including Coop Bank Oromia and Nativex; European companies including eMAG; and North American company InCloud."`,
                    `[公众号腾讯云 2026-04-28]: "正式发布了「出海生态启航计划」，通过出海权益、伙伴库与知识服务三大体系，全力打造企业全球化首选云服务生态平台"`,
                  ],
                  reasoning: `11,000+ 全球伙伴生态以 LEAP 2024 + 2025-03 印尼双源锚定。v2 加入 2026-04-28 重庆峰会发布的"出海生态启航计划"作为最新出海伙伴专项延伸，三大体系（出海权益 / 伙伴库 / 知识服务）已对外正式公开。partner-by-type 与 partner-by-tier 细分仍未公开，诚实声明。`,
                  decision: `11,000+ 锚点 + GDES 2025 新签名单 + 2026-04-28 出海生态启航计划三大体系；细分类别诚实声明公开未披露。`,
                },
              },
              {
                id: "s3_team",
                kind: "text",
                label: "Local operations team size · 本地化团队规模",
                status: "verified",
                rows: 3,
                defaultValue: `公开口径下可证的本地化运营足迹（2025 年 12 月 + 2026 年 3 月最新更新）：

第一，区域办公室 + 技术支持中心 + 触点。腾讯云已在全球设立 11 个区域办公室，部署 9 大技术支持中心（位于 Jakarta、Manila、Kuala Lumpur、Singapore、Bangkok、Tokyo、Seoul、Palo Alto、Frankfurt），并形成 100+ 全球技术支持触点；服务覆盖 30 多个行业与 80 多个国家与地区。

第二，基础设施层。腾讯云在 22 个地区运营 64 个可用区，部署 3,200+ 全球加速节点与 400 Tbps 带宽储备，投资 1.5 亿美元在沙特建设中东首个数据中心，同步建设大阪第三个数据中心并新设大阪办公室，法兰克福第三可用区将在 2026 年第二季度上线。

第三，区域领导力。已委任的区域 / 出海生态领导包括：腾讯云国际高级副总裁杨宝树、东南亚区域总监兼新马印总经理 Kenneth Siow、东南亚与南亚业务发展总监 Faye Gong、腾讯云出海生态总经理张林。

具体本地化运营团队的 FTE 头数、各区域人员分布、与多语言服务覆盖名册，公开材料尚未披露；本字段不展开推测，由腾讯团队在后续问询中按授权口径补充。`,
                defaultValueEn: `Publicly disclosable signals on overseas operating footprint, refreshed for the December 2025 and March 2026 outbound communications:

Regional offices, support centers, and touchpoints. Tencent Cloud has established 11 regional offices globally, deployed 9 global technical support centers (Jakarta, Manila, Kuala Lumpur, Singapore, Bangkok, Tokyo, Seoul, Palo Alto and Frankfurt), and built more than 100 global technical-support touchpoints. Service coverage spans more than 30 industries and more than 80 countries and regions.

Infrastructure layer. Tencent Cloud operates 64 availability zones across 22 regions, with more than 3,200 global acceleration nodes and a 400 Tbps bandwidth reserve. USD 150 million is committed to building the first Middle East data centre in Saudi Arabia, a third Osaka data centre is under construction with a new Osaka office, and a third Frankfurt availability zone is announced for Q2 2026 go-live.

Regional and ecosystem leadership. Disclosed senior leaders include Yang Baoshu, Senior Vice President of Tencent Cloud International; Kenneth Siow, Regional Director for Southeast Asia and General Manager of Singapore, Malaysia and Indonesia; Faye Gong, Business Development Director for Southeast Asia and South Asia; and Zhang Lin, General Manager for the Going-Global Ecosystem at Tencent Cloud.

The exact full-time-equivalent headcount of the localized operations team, per-region staffing breakdown, and language-coverage roster are not currently disclosed in public materials. This field does not extrapolate beyond what is publicly disclosed; the Tencent team will follow up with authorised positions in subsequent rounds where applicable.`,
                reasoning: {
                  sources: [
                    src("https://www.tencent.com/en-us/articles/2202183.html", "GDES press release (2025-09-16)"),
                    src("https://mp.weixin.qq.com/s/j8vusknh7x0vBPpsTbxq7Q", "公众号腾讯云出海服务 2025-12-01"),
                    src("https://mp.weixin.qq.com/s/6Ug6YL0F3mPJdOPQmdxAFQ", "公众号腾讯云出海服务 2026-03-31"),
                    src("https://www.tencentcloud.com/dynamic/news-details/100315", "Acclivis collaboration (Kenneth Siow)"),
                    src("https://www.tencentcloud.com/dynamic/news-details/100657", "Indonesia MoU (Faye Gong)"),
                  ],
                  quotes: [
                    `[公众号腾讯云出海服务 2025-12-01]: "在全球设立的11个区域办公室与9大技术支持中心，服务覆盖30多个行业与80多个国家和地区"`,
                    `[公众号腾讯云出海服务 2026-03-31]: "9大技术支持中心与100+全球技术支持触点"`,
                    `[GDES]: "Today, Tencent Cloud has deployed 9 global technical support centers in Jakarta, Manila, Kuala Lumpur, Singapore, Bangkok, Tokyo, Seoul, Palo Alto, and Frankfurt."`,
                    `[GDES]: "plans to invest USD150 million in the future to build its first Middle East data center in Saudi Arabia."`,
                    `[Acclivis]: "Kenneth Siow, Regional Director for Southeast Asia and General Manager of Singapore, Malaysia, and Indonesia, Tencent Cloud International"`,
                    `[Indonesia 2025-03]: "Faye Gong, Business Development Director in Southeast Asia and South Asia of Tencent Cloud International"`,
                    `[公众号腾讯云出海服务 2026-03-31]: "腾讯云出海生态总经理张林表示" + 高级副总裁杨宝树。`,
                  ],
                  reasoning: `v2 加入 11 个区域办公室、100+ 全球技术支持触点（替代 v1 仅"9 城支持中心"）+ 22/64 + 出海生态总经理张林。FTE 头数 / 多语言服务覆盖仍诚实声明公开未披露。`,
                  decision: `三层证据（区域办公室 / 技术支持中心 / 触点 + 基础设施 + 区域领导力）+ FTE 诚实声明。`,
                },
              },
              {
                id: "s3_models",
                kind: "text",
                label: "Collaboration models · 合作模式",
                status: "verified",
                rows: 6,
                defaultValue: `腾讯云合作伙伴网络（Tencent Cloud Partner Network）将合作伙伴形式化为三大类 + 四级 program tier。

三大类：

1. Channel Partners（渠道合作伙伴）— 包括 resellers、agents、distributors，负责销售腾讯云产品与服务。

2. Service Partners（服务合作伙伴）— 包括 Managed Service Providers（MSP）、System Integrators、咨询合作伙伴，增强交付与服务能力。

3. Technology Partners（技术合作伙伴）— 包括 Independent Software Vendors（ISV）、PaaS / SaaS marketplace 提供方、开发者工具与安全厂商，丰富产品组合。

四级 program tier — Standard / Silver / Gold / Platinum — 对应可量化的年度收入门槛（Silver USD 15,000 / Gold USD 150,000 / Platinum USD 1,500,000）与认证人数要求（Silver 2 名 / Gold 2 名 / Platinum 4 名 Tencent Cloud Practitioner）。Tencent Cloud 同时承认 AWS 现有 tier（Registered / Selected / Advanced / Premium）与 Microsoft Azure 相应 tier 的现有伙伴可直接对应认证为腾讯云对应 tier，降低多云合作伙伴的换平台摩擦。

针对中国企业出海场景，腾讯云出海生态在 Partner Network 之上叠加了一层定向架构，由腾讯云出海生态总经理张林在 2026 年 3 月正式对外阐述：形成"平台 + ISV + 渠道 + 本地合规伙伴"四角色生态化出海模式，配套六大核心资源——市场传播 / 流量扶持 / 业务轻咨询 / 生态活动 / 产品共创 / 腾讯集团协同。在此之上，2026 年 4 月 28 日重庆峰会发布的"出海生态启航计划"以出海权益 / 伙伴库 / 知识服务三大体系作为最新的实施载体。

更高深度的 strategic collaboration 与 JV 模式以三个公开案例为代表：

- Mobily（沙特电信运营商，2024 年 LEAP 大会）— 与腾讯云联合发布"Go Saudi"项目，基于 Tencent Cloud Enterprise (TCE) 私有云平台共建运营商级企业云。

- Acclivis Technologies and Solutions（中信国际电讯全资子公司，新加坡）— 签署 strategic collaboration agreement，覆盖东南亚 + 中国大陆 + 香港的私有 / 公有 / 混合云与 ICT 解决方案。

- 稳卖 AI 浏览器（萨摩耶旗下深圳市稳卖科技，2026 年 1 月）— 签署战略合作协议，整合腾讯云在云计算与 AI 大模型领域的技术底座，与稳卖 AI 浏览器在跨境生态的业务积淀，共同开发"AI + 跨境"解决方案。

中等深度的 MoU 协作以 Mega Berjaya Teknologi（印尼，2025 年 3 月签署 MoU）为代表。Tencent Cloud Marketplace 与 Marketing Amplifier Program（Marketing Development Fund，MDF）为合作伙伴提供 go-to-market 资金支持与品牌服务。

合作伙伴贡献的具体收入占比，各 tier 与各类型的细化分布，公开材料未披露；本字段不展开推测，由腾讯团队在后续问询中按授权口径补充。`,
                defaultValueEn: `The Tencent Cloud Partner Network formally defines three partner categories and four program tiers.

Three categories:

1. Channel Partners - resellers, agents, and distributors that market or sell Tencent Cloud products and services.

2. Service Partners - Managed Service Providers (MSPs), system integrators, and consulting partners that enhance delivery and service capabilities.

3. Technology Partners - Independent Software Vendors (ISVs), cloud marketplace PaaS and SaaS providers, developer tools, and security vendors that enrich the product portfolio.

The four program tiers - Standard, Silver, Gold and Platinum - are anchored to disclosed annual revenue thresholds (Silver USD 15,000; Gold USD 150,000; Platinum USD 1,500,000) and certification headcount requirements (2 Tencent Cloud Practitioners for Silver and Gold, 4 for Platinum). Tencent Cloud also recognises existing AWS tier credentials (Registered, Selected, Advanced, Premium) and Microsoft Azure competencies for direct mapping into Tencent Cloud tiers, reducing friction for partners switching or running multi-cloud practices.

For Chinese enterprises going global, Tencent Cloud overlays a market-specific architecture on top of the Partner Network, articulated in March 2026 by Zhang Lin, General Manager for the Going-Global Ecosystem: a four-role going-global ecosystem model comprising platform, ISV, channel, and local compliance partner, supported by six core resource categories - marketing communications, traffic enablement, light business consulting, ecosystem events, co-product creation, and Tencent group cross-business-unit synergy. On 28 April 2026 the Going-Global Ecosystem Launch Initiative was unveiled at the Tencent Cloud City Summit in Chongqing as the latest implementation vehicle for this overlay, structured around three pillars: going-global entitlements, a partner library, and knowledge services.

Deeper strategic-collaboration and joint-venture models are represented by three public anchors:

- Mobily (Etihad Etisalat, Saudi Arabia, LEAP 2024) - co-launched the "Go Saudi" program with Tencent Cloud, built on Tencent Cloud Enterprise (TCE) to deliver a co-branded operator-grade enterprise cloud platform.

- Acclivis Technologies and Solutions (a wholly-owned subsidiary of CITIC Telecom International, Singapore) - signed a strategic collaboration agreement covering private, public and hybrid cloud and ICT solutions across Southeast Asia, the Chinese mainland, and Hong Kong.

- Stable Sell AI Browser (Shenzhen Stable Sell Technology, a Samoyed Group subsidiary, January 2026) - signed a strategic collaboration agreement combining Tencent Cloud's cloud computing and AI large-model capabilities with Stable Sell's cross-border e-commerce footprint, jointly developing AI-plus-cross-border solutions.

Mid-depth MoU partnerships are represented by Mega Berjaya Teknologi, an Indonesian cloud services company that signed an MoU with Tencent Cloud at Tencent Cloud Day Indonesia in March 2025. Go-to-market support for partners includes Tencent Cloud Marketplace and the Marketing Amplifier Program (Marketing Development Fund, MDF).

Partner-attributed revenue share and category-by-tier distribution counts are not currently disclosed in public materials. This field does not extrapolate beyond what is publicly disclosed; the Tencent team will follow up with authorised positions in subsequent rounds where applicable.`,
                reasoning: {
                  sources: [
                    src("https://www.tencentcloud.com/partner/channel-partners", "tencentcloud.com/partner/channel-partners"),
                    src("https://www.tencentcloud.com/dynamic/news-details/100534", "Mobily 'Go Saudi' (LEAP 2024)"),
                    src("https://www.tencentcloud.com/dynamic/news-details/100315", "Acclivis strategic collaboration"),
                    src("https://www.tencentcloud.com/dynamic/news-details/100657", "Mega Berjaya Teknologi MoU (2025-03-13)"),
                    src("https://mp.weixin.qq.com/s/Q6LOj-ig4XW_sp0PKqHVSg", "公众号腾讯云出海服务 2026-01-30 (稳卖 AI 浏览器)"),
                    src("https://mp.weixin.qq.com/s/6Ug6YL0F3mPJdOPQmdxAFQ", "公众号腾讯云出海服务 2026-03-31 (出海四角色 + 六核心资源)"),
                    src("https://mp.weixin.qq.com/s/PA1SMzy7CBaj9OGvDCWheQ", "公众号腾讯云 2026-04-28 (出海生态启航计划)"),
                  ],
                  quotes: [
                    `[channel-partners]: "Tencent Cloud Channel Partners... include resellers, agents, and distributors..." + 4 tier (Standard/Silver/Gold/Platinum) + 收入门槛 + AWS/Azure tier 互认。`,
                    `[Mobily LEAP 2024]: "powered by Tencent Cloud Enterprise (TCE)"`,
                    `[Acclivis]: strategic collaboration agreement covering SEA + China + HK.`,
                    `[公众号腾讯云出海服务 2026-01-30 稳卖]: "腾讯云与萨摩耶旗下深圳市稳卖科技有限公司签署战略合作协议"`,
                    `[公众号腾讯云出海服务 2026-03-31]: "形成"平台+ISV+渠道+本地合规伙伴"的生态化出海模式 ... 市场传播、流量扶持、业务轻咨询、生态活动、产品共创、腾讯集团协同六大核心资源"`,
                    `[公众号腾讯云 2026-04-28]: "正式发布了「出海生态启航计划」，通过出海权益、伙伴库与知识服务三大体系"`,
                  ],
                  reasoning: `v2 在 v1 三类 + 四 tier 基础上加深：(1) 出海定向四角色（平台 + ISV + 渠道 + 本地合规伙伴）+ 六核心资源（张林 2026-03 对外阐述）；(2) 出海生态启航计划三大体系（2026-04-28 重庆峰会）；(3) 战略合作案例新增稳卖 AI 浏览器 2026-01 战略合作。原有 Mobily / Acclivis / Mega Berjaya 保留。`,
                  decision: `三大类 + 四 tier + AWS/Azure 互认 + 出海四角色 + 六核心资源 + 三大体系 + 三个 strategic case + Mega Berjaya MoU；细分收入分布诚实声明公开未披露。`,
                },
              },
            ],
          },
        ],
      },
      {
        id: "q3_2",
        title: "3.2 Complex joint-delivery project · 联合交付复杂项目",
        zhHint: "重点描述伙伴角色与协作机制",
        promptEn: `Please describe a complex project delivered jointly by "cloud platform + ecosystem partners" (e.g., multinational manufacturing digital transformation), focusing on partner roles and collaboration mechanisms.`,
        promptZh: `请举例说明一个"云平台+生态伙伴"联合交付的复杂项目（如跨国制造业数字化转型），重点描述伙伴角色与协作机制。`,
        status: "verified",
        groups: [
          {
            fields: [
              {
                id: "s3_project",
                kind: "text",
                label: "联合项目案例",
                status: "verified",
                rows: 14,
                defaultValue: `腾讯云在中国企业出海联合交付上的能力，可以从两个互补的样本中看出来。一个是"云平台 + 第三方生态 ISV"角色分工清晰的形态，把垂直行业 AI 解决方案规模化交付到海外卖家手里；另一个是"云平台 + 客户自有工程团队"的双边形态，把超大规模、高复杂度的出海 IT 迁移做完。两类协作机制都对外可被验证，都有公开量化结果。

生态伙伴主案例（"云平台 + 第三方生态伙伴"角色分工清晰版）— 腾讯云 × 稳卖 AI 浏览器战略合作（萨摩耶旗下深圳市稳卖科技）。2026 年 1 月 30 日双方在腾讯云副总裁徐亿明与稳卖董事长林建明的共同见证下签署战略合作协议，面向中国跨境电商卖家的出海运营场景共同打造 AI 智能解决方案。角色分工对外公开：腾讯云提供海外 Lighthouse 轻量服务器、EdgeOne 全球加速边缘节点、Serverless 容器服务、云原生数据库 TDSQL-C MySQL、混元大模型与智能体开发平台 ADP；稳卖科技提供跨境电商账号隔离运营环境、AI 浏览器前端、亚马逊 ASIN 数据驱动的垂直工具链与商业化通道。量化成果：海外站点首页加载延时由 10 秒压缩至 3 秒，整体访问延时降低 60%；后台 IT 成本较传统云方案降低 30% 以上；接入后单款商品内容生产由 3 小时压缩至 5 分钟内（35 倍）、单款选品调研由 8 小时缩至 30 分钟内（15 倍）、单 SKU 图片视频素材由 3–5 天压缩至数十分钟内（200 倍以上）；AI 工具调用量整体提升 8–12 倍，平台超过 95% 的卖家运营动作可通过 AI 与自动化流程完成。目前已服务数百家中国跨境电商。这是"云平台 + 第三方生态伙伴"角色分工和量化结果都公开可验证的代表性案例。

双边主案例（出海主线，"云平台 + 客户工程团队"的复杂度上限）— 美的集团欧洲 IT 业务迁移至腾讯云法兰克福数据中心。客户画像：美的是中国全球化科技集团，业务横跨智能家居、楼宇科技、工业技术、机器人与自动化、数字化创新五大板块，海外子公司超过 200 家、全球员工约 19 万、研发中心 31 个、主要生产基地 40 个，业务覆盖 200 多个国家和地区，服务全球 5 亿以上消费者；近 5 年研发投入约 5000 亿元人民币；旗下品牌包括美的、小天鹅、华凌、COLMO、库卡、威灵等。海外业务已连续两年贡献年度营收 40% 以上，2025 年起对外明确以"内外双循环"作为战略骨架，即"中国研产为全球、当地研产为本地"。项目内容：2025 年 7 月，美的将欧洲 IT 业务整体迁移至腾讯云法兰克福数据中心，近 50 个独立业务系统统一进入云原生架构并完成容器化改造，公共组件栈一并重构。协作机制：本项目对外披露的协作主体为美的工程团队 + 腾讯云工程团队的双边联合交付，第三方 SI/ISV 未在公开材料中署名；使用的主要腾讯云产品包括 CVM 云服务器、CBS 云硬盘、CDC 分布式云、腾讯会议、IoT Video、AI 识别等。量化成果：成本优化目标提前达成并超额完成，系统稳定性与扩展能力显著提升，研发协同效率明显提升。同期保障：腾讯云已于 MWC 2026 宣布德国法兰克福区域新增第 3 个可用区，2026 年 Q2 正式上线服务，进一步加固美的欧洲业务的多可用区高可用底座。

双边辅证 — 美的巴西智能工厂与荣耀全球云平台。美的巴西工厂以腾讯云 CDC 分布式云承载本地智能制造数字基础设施，实现数据本地驻留与合规、产线侧亚毫秒级时延、与腾讯云公有云的无缝对接以及 7×24 小时运维，是同一家中国出海消费品牌在拉美的双边联合交付样本。荣耀作为成立于 2013 年、业务覆盖 100 多个国家的中国 AI 智能终端公司，其全球云平台以腾讯云多区域多可用区、云原生与高可用架构承载，欧洲、中东、拉美为其新增长重点；本项目对外披露的协作主体同样为荣耀工程团队 + 腾讯云工程团队的双边形态，第三方生态伙伴未公开署名（与之配套的 AI 与推理能力细节归 q2_1，本题不展开）。

能力旁证。同一套"云平台 + 客户工程团队"的双边联合交付打法，在 APAC 体量上也已被验证：腾讯云与 GoTo 集团（印尼）联合工程团队，用 8 个月联合预研，把 1000 余个微服务在 4 小时 54 分钟的窗口内一次性迁移至腾讯云雅加达本地数据中心，并将雅加达区域专项扩容至第 3 个可用区。GoTo 为印尼本土企业、不属于中国出海主线，此处仅作"同一打法可放大到东南亚最大规模迁移"的能力旁证。

伙伴生态网络底色。在中国企业出海赛道，腾讯云正在以"平台 + ISV + 渠道 + 本地合规伙伴"四层结构组织联合交付：跨境电商侧（钛动科技 LinkFox Agent、稳卖 AI 浏览器、紫讯）；连锁零售线下出海（万店掌）；跨境支付（威富通服务 200 多家海外金融机构、日均 4000 万笔交易）；联盟营销（PartnerBoost）；多语种文档处理（合合信息 INTSIG Docflow Agent，覆盖 52 种语言、效率提升 6 倍）；广告变现（TopOn）；MaaS（PPIO Serverless GPU，TOKEN 成本下降 60%、P99<1.5 秒）；电信运营商生态侧的 Mobily（沙特"Go Saudi"项目，腾讯云提供 TCE 企业级云平台与 TCMPP 小程序能力，Mobily 作为本地实体面对沙特企业客户）。整体伙伴生态规模约 1.1 万家。

诚实定性收尾。"云平台 + 生态伙伴"在腾讯云出海实际形态中并非单一答案：跨境复杂迁移更多以"云平台 + 客户工程团队"双边形态完成（美的欧洲、美的巴西、荣耀全球云、GoTo 印尼），第三方 ISV / 渠道 / 本地实体的"云平台 + 生态伙伴"角色分工则在跨境电商、AI Agent、电信运营商等场景里有清晰公开的样本（稳卖、Mobily 等）。两种形态都属于联合交付，差异仅在于第三方伙伴是否进入项目对外披露的署名层，Omdia 可按评估口径选用对应样本。`,
                defaultValueEn: `Tencent Cloud's joint-delivery capability for Chinese enterprises going overseas is best illustrated through two complementary cases. One shows cloud-platform-plus-third-party-ISV role-splitting for a vertical AI solution scaled to overseas customers; the other shows bilateral delivery with the customer's own engineering team handling a complex overseas IT migration at scale. Both are publicly documented with quantitative outcomes.

Ecosystem-partner primary case (the cleanest cloud-platform-plus-ISV role-split): Tencent Cloud x Wenmai AI Browser strategic partnership (Shenzhen Wenmai Technology, a Samoyed Group subsidiary). The two parties signed a strategic partnership on 30 January 2026, witnessed by Tencent Cloud SVP Xu Yiming and Wenmai Chairman Lin Jianming, to jointly build an AI-driven operations solution for Chinese cross-border e-commerce sellers going overseas. The role split is publicly documented. Tencent Cloud provides the overseas Lighthouse lightweight servers, EdgeOne global edge acceleration, Serverless container service, the TDSQL-C MySQL cloud-native database, and the Hunyuan LLM and Agent Development Platform (ADP). Wenmai provides the cross-border e-commerce account-isolation operating environment, the AI browser front-end, an Amazon-ASIN-driven vertical toolchain, and the commercialization channel. Quantitative outcomes: overseas-storefront homepage load latency compressed from 10 seconds to 3 seconds and overall access latency reduced by 60%; backend IT cost reduced by more than 30% versus a traditional cloud baseline; for sellers on the joint platform, per-listing content production time fell from over 3 hours to under 5 minutes (a 35x improvement), per-product selection research from over 8 hours to under 30 minutes (15x), and per-SKU image and video asset production from 3–5 days to tens of minutes (more than 200x); platform-level AI tool call volume rose 8–12x; over 95% of cross-border seller operating actions can now be completed end-to-end through AI and automation. Hundreds of Chinese cross-border merchants are on the platform today. This is the case in which cloud-platform-plus-third-party-ecosystem-partner role-splitting and outcomes are most cleanly documented in public.

Bilateral primary case (the overseas-going Chinese-enterprise hero): Midea Group's European IT migration to Tencent Cloud Frankfurt. Customer profile: Midea is a global Chinese technology conglomerate spanning five business segments — smart home, building technologies, industrial technologies, robotics and automation, and digital innovation — with more than 200 overseas subsidiaries, around 190,000 employees, 31 R&D centers and 40 main production bases, business in over 200 countries and regions, and more than 500 million global consumers served. Roughly RMB 500 billion of cumulative R&D investment over the past five years. Brands include Midea, Little Swan, Hualing, COLMO, KUKA, and Welling. Overseas revenue has exceeded 40% of annual total for two consecutive years, and Midea's 2025 strategic posture is explicitly framed as "Internal-External Dual Circulation" — China-for-Global plus Region-for-Region. Project content: in July 2025, Midea migrated its European IT estate to Tencent Cloud's Frankfurt data center, consolidating nearly 50 independent business systems onto a single cloud-native architecture with full containerization and a restructured shared-components stack. Collaboration mechanism: the publicly disclosed authorship layer of this project is bilateral — Midea's engineering team plus Tencent Cloud's engineering team, with no third-party SI or ISV named in public sources. Primary Tencent Cloud products used: Cloud Virtual Machine, Cloud Block Storage, distributed cloud (CDC), Tencent Meeting, IoT Video, and AI Recognition. Quantitative outcomes: the cost-optimization target was met ahead of schedule and exceeded; system stability and scalability improved substantially; R&D collaboration efficiency rose materially. Adjacent reinforcement: at MWC 2026 Tencent Cloud announced that the Frankfurt region will expand from two to three availability zones, going live in Q2 2026, further strengthening multi-AZ resilience for Midea's European business and other European customers.

Bilateral auxiliary cases — Midea Brazil smart factory and Honor global cloud platform. Midea's Brazil smart factory runs on Tencent Cloud's distributed cloud (CDC) for local digital manufacturing infrastructure, delivering local data residency and compliance, sub-millisecond latency on the production floor, seamless interconnect with Tencent Cloud's public cloud, and 7x24 operations — a second bilateral joint-delivery sample from the same Chinese consumer brand in a different geography. Honor, a Chinese AI smart-terminal company founded in 2013 with business in more than 100 countries, runs its global cloud platform on Tencent Cloud with a multi-region, multi-AZ, cloud-native, high-availability architecture, with Europe, the Middle East and Latin America as new-growth markets; the publicly disclosed authorship layer here is also bilateral — Honor's engineering team plus Tencent Cloud's engineering team, with no third-party ecosystem partner named in public sources. (AI and inference depth for Honor is covered in q2_1 and is not re-narrated here.)

Capability-validation footnote. The same bilateral cloud-platform-plus-customer-engineering playbook has been validated at the largest APAC cutover scale: in partnership with GoTo Group (Indonesia), Tencent Cloud's engineering team and GoTo's engineering team completed an 8-month joint preparation cycle and then migrated more than 1,000 microservices in a single 4-hour-54-minute cutover window to Tencent Cloud's Jakarta local data center, while expanding the Jakarta region from two to three availability zones. GoTo is an Indonesian local champion rather than a Chinese-enterprise-going-overseas case, so it is cited here only as proof that the same playbook scales to the largest joint cutover Southeast Asia has seen, not as a primary RFI example.

Partner-network backdrop. For the Chinese-enterprise-going-overseas market, Tencent Cloud organizes joint delivery in a four-layer structure of platform plus ISV plus channel plus local compliance partner. Examples across 2025–2026 include cross-border e-commerce ISVs (Titandong's LinkFox Agent, Wenmai's AI Browser, Zixun); offline-retail global operations (Wandianzhang); cross-border payments (Wifitone Technology, serving more than 200 overseas financial institutions and processing over 40 million daily transactions); affiliate marketing (PartnerBoost); multilingual document processing (Hehe Information's INTSIG Docflow Agent, covering 52 languages with a more-than-6x efficiency gain); ad monetization (TopOn); MaaS (PPIO's Serverless GPU, with TOKEN cost down more than 60% and P99 stable below 1.5 seconds); and on the telco-operator side, Mobily's 'Go Saudi' programme as a named telco-ecosystem partner — Tencent Cloud provides the TCE enterprise cloud and the TCMPP mini-program platform while Mobily acts as the local entity facing KSA enterprise customers. The total partner ecosystem is roughly 11,000 partners.

Honest closing framing. In Tencent Cloud's actual overseas-going delivery shape, "cloud platform plus ecosystem partners" is not a single answer. Complex overseas IT migrations are most often delivered in a cloud-platform-plus-customer-engineering bilateral form (Midea Europe, Midea Brazil, Honor's global cloud, GoTo Indonesia), while cleanly role-split cloud-platform-plus-ecosystem-partner delivery is publicly documented in cross-border e-commerce, AI Agent and telco scenarios (Wenmai, Mobily). Both are joint delivery; the only difference is whether the third-party partner enters the publicly disclosed authorship layer of the project. Omdia is welcome to apply whichever lens matches its evaluation rubric.`,
                reasoning: {
                  sources: [
                    src("https://mp.weixin.qq.com/s/Q6LOj-ig4XW_sp0PKqHVSg", "公众号腾讯云出海服务 2026-01-30 (稳卖 AI 浏览器战略合作)"),
                    src("https://mp.weixin.qq.com/s/hUUB6qnIP_OZMw8FxqBr_A", "公众号腾讯云 2026-03-03 (腾讯云法兰克福数据中心+1，混元3D加速出海 / 美的欧洲迁移)"),
                    src("https://mp.weixin.qq.com/s/08d1ERzHr_cDtaHBGn8t0A", "公众号腾讯云出海服务 2025-09-26 (中企出海, 到了拼智力的时代)"),
                    src("https://mp.weixin.qq.com/s/6Ug6YL0F3mPJdOPQmdxAFQ", "公众号腾讯云出海服务 2026-03-31 (AI 重构出海竞争力 / 伙伴矩阵)"),
                    src("https://mp.weixin.qq.com/s/j8vusknh7x0vBPpsTbxq7Q", "公众号腾讯云出海服务 2025-12-01 (出海伙伴生态 / 威富通)"),
                    src("https://www.tencentcloud.com/dynamic/news-details/100692", "GoTo migration press release (2025-06-05) — APAC capability validation"),
                    src("https://www.tencentcloud.com/dynamic/news-details/100534", "Mobily 'Go Saudi' (LEAP 2024)"),
                    src("wechat-local://腾讯云客户案例集/美的", "Tencent Cloud Customer Case (美的集团 — 欧洲 IT 迁移 + 巴西 CDC + 美信腾讯会议)"),
                    src("wechat-local://腾讯云客户案例集/荣耀", "Tencent Cloud Customer Case (荣耀全球云平台)"),
                  ],
                  quotes: [
                    `[公众号腾讯云出海服务 2026-01-30 稳卖]: "1月30日，腾讯云与萨摩耶旗下深圳市稳卖科技有限公司签署战略合作协议 ... 海外站点首页加载延迟从10秒压缩至3秒，整体访问延时降低了60% ... AI工具调用量提升约 8-12 倍 ... 单 SKU 图片及视频素材的生产耗时由原来的 3–5 天压缩至数十分钟以内，实现超200倍的效率提升"`,
                    `[公众号腾讯云 2026-03-03 美的欧洲]: "去年7月，美的集团将其欧洲 IT 业务迁移至腾讯云法兰克福数据中心，近 50 个独立业务系统统一纳入云原生架构，并完成容器化改造。迁移后实现成本优化，系统稳定性与扩展能力同步提升。"`,
                    `[公众号腾讯云 2026-03-03 法兰克福]: "将在德国法兰克福新增1个云可用区...将于今年2季度正式上线服务，届时腾讯云在德国的可用区数量增至3个"`,
                    `[Midea Brazil CDC]: 腾讯云 CDC 分布式云承载美的巴西智能工厂数字基础设施, 数据本地驻留 + <1ms 时延 + 7×24 运维。`,
                    `[HONOR global cloud]: 荣耀全球云平台基于腾讯云多区域多可用区、云原生、高可用架构, 业务覆盖 100+ 国家, 欧洲/中东/拉美新增长。`,
                    `[GoTo]: "the migration involved more than 1,000 microservices ... completed in just 4 hours and 54 minutes" + Jakarta 2→3 AZ + 8-month joint preparation — APAC bilateral playbook capability proof.`,
                    `[公众号腾讯云出海服务 2025-12-01 威富通]: "威富通为中银香港、中东Tiqmo等200多家海外金融机构提供支付与数字钱包服务，日均处理超4000万笔交易"`,
                    `[Mobily LEAP 2024]: 沙特 Mobily × 腾讯云 TCE + TCMPP "Go Saudi"。`,
                    `[公众号腾讯云出海服务 2026-03-31]: "平台 + ISV + 渠道 + 本地合规伙伴" 四层结构, 总伙伴生态约 11000 家; 钛动 / 紫讯 / PartnerBoost / 合合 / PPIO / TopOn 等矩阵。`,
                  ],
                  reasoning: `v2 case-swap：RFI 题面为"中国企业出海"，原来以 GoTo 印尼为双边主案例与题面错位；本轮把双边主案例换为美的欧洲 IT 迁移（中国消费电子集团 + 欧洲方向），并补美的巴西 CDC + 荣耀全球云作为双边辅证；GoTo 降为 APAC 规模能力旁证一句话；稳卖 AI 浏览器（中国 ISV 服务中国跨境电商）作为生态伙伴主案例保留。`,
                  decision: `生态伙伴主案例为稳卖 AI 浏览器（云平台 + ISV 角色分工 + 200×/35×/15× 量化结果），双边主案例升级为美的欧洲 IT 迁移（出海主线，~50 系统迁入法兰克福 + 2026 Q2 第三可用区）；美的巴西 CDC + 荣耀全球云作为双边辅证；GoTo 仅作 APAC 能力旁证；伙伴矩阵（钛动 / 万店掌 / 威富通 / PartnerBoost / 合合 / TopOn / PPIO / Mobily）+ 诚实定性收尾保留。`,
                },
              },
            ],
          },
        ],
      },
    ],
  },

  // ====== IV. Operations ======
  {
    id: "s4",
    index: "IV",
    title: "Global Operational Capabilities · 全球运营能力",
    description: "在海外目标市场提供原厂级、无时差的技术支持与商业对接。",
    descriptionEn: "Deliver factory-level technical support and commercial alignment in overseas markets with zero time lag.",
    questions: [
      {
        id: "q4_1",
        title: "4.1 Factory-level, zero-latency support · 原厂级无时差支持",
        promptEn: `How do you deliver "factory-level, zero-latency" support? Provide:
- 7×24 SLA response time?
- Localized technical team configuration?
- Multilingual ticketing systems?
- Resolution time for critical severity (P1) issues`,
        promptZh: `如何实现"原厂级别、无时差"的技术支持？请提供：
- 7×24小时响应SLA？
- 本地化技术团队配置？
- 多语言工单系统？
- 典型问题解决时效（如：P1级问题）`,
        status: "verified",
        groups: [
          {
            layout: "labeled-rows",
            fields: [
              {
                id: "s4_sla",
                kind: "text",
                label: "7×24 SLA response · 7×24 响应 SLA",
                status: "verified",
                rows: 6,
                defaultValue: `腾讯云国际站对外发布四档支持计划，全部 7×24 受理，按案例严重程度分级承诺首次响应时间。Basic 档：常规问题 < 16 小时，仅工单。Developer 档：常规问题 < 16 小时，系统受损 < 8 小时，工单加电话。Business 档：常规问题 < 16 小时，系统受损 < 8 小时，生产系统受影响 < 30 分钟，工单加电话。Enterprise 档：常规问题 < 8 小时，系统受损 < 4 小时，生产系统受影响 < 20 分钟，业务关键档（即 P1 等价档）< 15 分钟，工单加电话加在线聊天三通道全 7×24，并由 Cloud Support Experts 接单、配专属 Designated TAM。腾讯原生四档严重等级与业界 P1 至 P4 对应关系为：业务关键对应 P1，生产系统受影响对应 P2，系统受损对应 P3，常规问题对应 P4。以上数值均为首次响应 SLA，非问题解决时长。`,
                defaultValueEn: `Tencent Cloud publishes a four-tier Support Plan with 24/7 case intake across all tiers and a first-response-time commitment differentiated by case severity. Basic tier: General issues < 16 hours; ticket only. Developer tier: General issues < 16 hours, System impaired < 8 hours; ticket + phone. Business tier: General issues < 16 hours, System impaired < 8 hours, Production system impacted < 30 minutes; ticket + phone. Enterprise tier: General issues < 8 hours, System impaired < 4 hours, Production system impacted < 20 minutes, Business critical (P1-equivalent) < 15 minutes; ticket + phone + online chat all 24/7, with cases handled by Cloud Support Experts and a Designated Technical Account Manager (TAM). Tencent's native severity bands map to industry P-labels as follows: Business critical = P1, Production system impacted = P2, System impaired = P3, General issues = P4. All values above are first-response SLAs, not resolution-time SLAs.`,
                reasoning: {
                  sources: [
                    src("https://www.tencentcloud.com/document/product/1214/56751", "Service Plan Response Time SLA (2024-12-18)"),
                    src("https://www.tencentcloud.com/render/support-plan", "tencentcloud.com/render/support-plan"),
                  ],
                  quotes: [
                    `[document/1214/56751]: "Basic | Developer | Business | Enterprise | General issues < 16 hours | General issues < 16 hours / System impaired < 8 hours | General issues < 16 hours / System impaired < 8 hours / Production system impacted < 30 minutes | General issues < 8 hours / System impaired < 4 hours / Production system impacted < 20 minutes / Business critical < 15 minutes"`,
                    `[document/1214/56751]: "Business Unavailability ... Production System Abnormality ... Business/System Abnormality ... Usage Consultation"`,
                    `[render/support-plan]: "Designated Technical Account Manager ... Cloud Support Experts"`,
                  ],
                  reasoning: `Service Plan 文档完整 4 档 × 4 严重等级响应矩阵，Enterprise"Business critical < 15 minutes"为最高承诺。腾讯原生 band 与业界 P-label 显式 1:1 映射。诚实声明所有数值为首次响应 SLA，非解决时长。`,
                  decision: `四档 SLA 矩阵原文呈现 + P1/P2/P3/P4 与原生 band 显式映射；强调首次响应非解决时长。`,
                },
              },
              {
                id: "s4_team",
                kind: "text",
                label: "Localized tech team · 本地化团队",
                status: "verified",
                rows: 7,
                defaultValue: `腾讯云已在海外形成三层覆盖结构。第一层是 9 大海外技术支持中心，分布于雅加达、马尼拉、吉隆坡、新加坡、曼谷、东京、首尔、帕罗奥图、法兰克福；第二层是 11 个区域办公室，承担当地销售与客户对接职能；第三层是 100+ 全球技术支持触点，覆盖名义中心之外的客户在地服务半径，整体服务面延伸至 80 多个国家和地区。Enterprise 档客户由 Cloud Support Experts 团队接单，并指派专属 Designated TAM 作为单一对接人，统一打通工单、电话与在线聊天三个 7×24 通道，向客户提供与原厂同等级的专家级响应。`,
                defaultValueEn: `Tencent Cloud's overseas service footprint runs in three layers. First, 9 overseas technical support centers in Jakarta, Manila, Kuala Lumpur, Singapore, Bangkok, Tokyo, Seoul, Palo Alto, and Frankfurt provide the named-city support backbone. Second, 11 regional offices handle in-market sales and account engagement. Third, 100+ global technical-support touchpoints extend coverage beyond the named centers, taking total service reach to more than 80 countries and regions. At the Enterprise tier, cases are handled by Cloud Support Experts and a Designated TAM acts as the single point of contact, unifying ticket, phone, and online chat into one 24/7 escalation surface so the customer receives factory-level expert response regardless of where their workload is running.`,
                reasoning: {
                  sources: [
                    src("https://www.tencent.com/en-us/articles/2202183.html", "GDES press release (2025-09-16)"),
                    src("https://www.tencentcloud.com/render/support-plan", "tencentcloud.com/render/support-plan"),
                    src("https://mp.weixin.qq.com/s/j8vusknh7x0vBPpsTbxq7Q", "公众号腾讯云出海服务 2025-12-01 (11 区域办公室)"),
                    src("https://mp.weixin.qq.com/s/6Ug6YL0F3mPJdOPQmdxAFQ", "公众号腾讯云出海服务 2026-03-31 (100+ 全球技术支持触点)"),
                  ],
                  quotes: [
                    `[GDES]: "Today, Tencent Cloud has deployed 9 global technical support centers in Jakarta, Manila, Kuala Lumpur, Singapore, Bangkok, Tokyo, Seoul, Palo Alto, and Frankfurt."`,
                    `[公众号腾讯云出海服务 2025-12-01]: "在全球设立的11个区域办公室与9大技术支持中心，服务覆盖30多个行业与80多个国家和地区"`,
                    `[公众号腾讯云出海服务 2026-03-31]: "9大技术支持中心与100+全球技术支持触点"`,
                    `[render/support-plan]: "Cloud Support Experts ... Designated Technical Account Manager"`,
                  ],
                  reasoning: `v2 加入 11 区域办公室 + 100+ 全球技术支持触点形成三层覆盖结构，替代 v1 仅"9 城支持中心"的单层口径。Enterprise 档专属 TAM + Cloud Support Experts 三通道 7×24 由文档锚定。`,
                  decision: `三层覆盖（9 中心 + 11 办公室 + 100+ 触点）+ Enterprise TAM / 专家级响应；FTE 头数公开未披露。`,
                },
              },
              {
                id: "s4_ticket",
                kind: "text",
                label: "Multilingual ticketing · 多语言工单",
                status: "verified",
                rows: 7,
                defaultValue: `腾讯云国际门户与控制台支持 6 种界面语言：英语、韩语、日语、简体中文、葡萄牙语、印尼语。客服通道按档配置：工单 7×24 在四档全覆盖；电话 7×24 在 Developer、Business、Enterprise 三档覆盖；在线聊天 7×24 仅 Enterprise 档覆盖。24/7 免费电话热线已开通 5 个国家或地区——中国香港 +852 800 906 020、美国 +1 844 606 0804、英国 +44 808 196 4551、加拿大 +1 888 605 7930、澳大利亚 +61 1300 986 386；另设 EdgeOne 付费热线 +852 300 80699，公开页面注明更多本地热线在持续开通中。`,
                defaultValueEn: `The Tencent Cloud international portal and console are delivered in 6 interface languages: English, Korean, Japanese, Simplified Chinese, Portuguese, and Bahasa Indonesia. Channel coverage by tier: ticket 24/7 across all four tiers; phone 24/7 on Developer, Business, and Enterprise; online chat 24/7 on Enterprise only. 24/7 toll-free hotlines are published for 5 countries or regions: Hong Kong China +852 800 906 020, United States +1 844 606 0804, United Kingdom +44 808 196 4551, Canada +1 888 605 7930, and Australia +61 1300 986 386; an EdgeOne paid hotline at +852 300 80699 is also published, with additional local hotlines being added.`,
                reasoning: {
                  sources: [
                    src("https://www.tencentcloud.com/contact-us", "tencentcloud.com/contact-us (含 5 国 24/7 电话)"),
                    src("https://www.tencentcloud.com/render/support-plan", "tencentcloud.com/render/support-plan"),
                  ],
                  quotes: [
                    `[render/support-plan / contact-us]: "English - EN  한국어 - KO  日本語 - JP  简体中文 - ZH  Português - PT  Bahasa Indonesia - IND"`,
                    `[render/support-plan]: "Technical Support | Ticket ( 24/7 ) | Phone ( 24/7 ) Ticket ( 24/7 ) | Phone ( 24/7 ) Ticket ( 24/7 ) | Phone ( 24/7 ) Ticket ( 24/7 ) Online chat ( 24/7 )"`,
                    `[contact-us]: "Hong Kong, China +852 800 906 020 / United States +1 844 606 0804 / United Kingdom +44 808 196 4551 / Canada +1 888 605 7930 / Australia +61 1300 986 386 / EdgeOne hotline +852 300 80699 / More local hotlines coming soon"`,
                  ],
                  reasoning: `公开硬证据：6 种 UI 语言（contact-us / support-plan 语言切换器）+ 5 国 24/7 电话 + 三档工单 / 电话 / 聊天矩阵。前端 UI 有 6 语言 ≠ 后端工单工程师能处理 6 语言，按 v2 polish 在文字中明确为"门户 + 控制台界面语言"，避免过度承诺。`,
                  decision: `列 6 UI 语言 + 5 国电话 + 工单 / 电话 / 聊天分档；UI vs 工程师应答语种差别由 AR 进一步澄清。`,
                },
              },
              {
                id: "s4_p1",
                kind: "text",
                label: "P1 resolution time · P1 问题时效",
                status: "verified",
                rows: 3,
                defaultValue: `P1（业务关键 / Business critical）首次响应承诺为 < 15 分钟，仅在 Enterprise 档提供。Business 档不设独立 P1 档，最高严重档为生产系统受影响 < 30 分钟首次响应；Developer 档最高为系统受损 < 8 小时首次响应；Basic 档最高为常规问题 < 16 小时首次响应。须说明的是：腾讯云对外公开文档承诺的是首次响应时间 SLA，非问题解决时长 SLA；公司未对外披露 MTTR 维度的承诺值。Enterprise 档下，由 Designated TAM 与 Cloud Support Experts 团队对 P1 工单进行端到端跟进直至闭环，但端到端的解决时长不进入对外 SLA 承诺面。`,
                defaultValueEn: `The P1 (Business critical) first-response commitment is < 15 minutes and is offered on the Enterprise tier. Lower tiers do not publish a separate P1 / Business-critical band: the fastest first-response band on the Business tier is Production system impacted < 30 minutes; on the Developer tier it is System impaired < 8 hours; on the Basic tier it is General issues < 16 hours. Important framing: what Tencent Cloud publishes is a first-response-time SLA, not a resolution-time SLA. Tencent Cloud does not publicly disclose an MTTR-style resolution-time commitment. At the Enterprise tier, the Designated TAM and the Cloud Support Experts team take a P1 case end-to-end through to closure, but end-to-end resolution time does not appear on the public SLA surface.`,
                reasoning: {
                  sources: [
                    src("https://www.tencentcloud.com/document/product/1214/56751", "Service Plan Response Time SLA (2024-12-18)"),
                  ],
                  quotes: [
                    `[document/1214/56751]: "Enterprise | ... Business critical < 15 minutes ... Production system impacted < 20 minutes"`,
                    `[document/1214/56751]: Case Handling Personnel — Cloud Support Experts.`,
                  ],
                  reasoning: `腾讯云公开 SLA（与所有超大规模云厂商）只发布响应时间不发布解决时间。诚实做法：< 15 min 响应数字 + 明确"响应非解决"+ MTTR 不进入对外 SLA。`,
                  decision: `< 15 min 响应 + 各档最高严重档 + 响应非解决诚实声明 + 端到端跟进但 MTTR 不公开。`,
                },
              },
            ],
          },
        ],
      },
      {
        id: "q4_2",
        title: "4.2 Cultural-difference standardized process · 文化差异标准化流程",
        zhHint: "如欧美客户强调流程合规、中东客户重视关系信任",
        promptEn: `For cultural differences causing communication barriers (e.g., Western clients emphasizing process compliance, Middle Eastern clients valuing relationship trust), what standardized service processes and localization adaptation strategies does your company employ?`,
        promptZh: `针对文化差异导致的沟通障碍（如欧美客户强调流程合规、中东客户重视关系信任），贵公司有哪些标准化服务流程与本地化适配策略？`,
        status: "verified",
        groups: [
          {
            fields: [
              {
                id: "s4_culture",
                kind: "text",
                label: "文化差异适配策略",
                status: "verified",
                rows: 6,
                defaultValue: `腾讯云面向跨文化客户的服务标准化分两层：流程层做到全球同一口径，覆盖采购合规可审计的硬指标；适配层依靠在地实体落地，按市场用不同的组织结构回应不同的决策习惯。我们不依赖一份"按文化分类的客服培训手册"作为差异化卖点，而是用可审计的服务流程加上在地团队、在地合作伙伴、在地数据中心这三件可验证的事实组合应对。

流程层（全球同一套标准，可被采购合规审计）：腾讯云国际站发布统一的 Support Plan，分 Basic、Developer、Business、Enterprise 四档。Enterprise 档承诺响应时间为：一般问题 < 8 小时、系统受损 < 4 小时、生产系统受影响 < 20 分钟、业务关键 < 15 分钟，并配备 Designated Technical Account Manager、架构咨询服务、年度上门服务（最多 3 人天），以及 24/7 电话、工单、在线聊天三通道接入。中国香港、美国、英国、加拿大、澳大利亚五地公开 24/7 免费热线；国际站门户与控制台支持英、日、韩、中（简）、葡、印尼共 6 种语言。这是欧美客户在采购评估中要求的"过程可追溯、责任有归属"的形态——四档 SLA 矩阵明文写出严重等级、响应时长与责任主体，与欧美企业采购流程的合规审计要求严密对齐。

适配层（按市场用不同的在地结构落地）：

第一，技术支持中心 + 区域办公室 + 全球触点三层覆盖。截至 2026 年 3 月，腾讯云在全球设有 9 大技术支持中心（雅加达、马尼拉、吉隆坡、新加坡、曼谷、东京、首尔、帕罗奥图、法兰克福）、11 个区域办公室、以及 100 多个全球技术支持触点，服务覆盖 80 多个国家和地区。法兰克福与帕罗奥图服务欧美客户的合规和工作时区跟进；东京、首尔服务高语境的日韩市场；东南亚五城（雅加达、马尼拉、吉隆坡、新加坡、曼谷）覆盖区域内的多语言、多政策环境。

第二，中东市场用本地战略合作落地"先关系后合同"的决策习惯。与沙特电信运营商 Etihad Etisalat（Mobily）联合发布的 "Go Saudi" 项目，由 Mobily 作为本地实体面对沙特企业客户，腾讯云提供底层企业级私有云平台（TCE）与 TCMPP 小程序能力，在用户隐私、数据驻留、本地监管对齐三件事上同时给出承诺。客户关系和签约主体落在本地伙伴而非跨境直签——这是结构层面的关系信任回应，而不是话术层面的。腾讯云已宣布在沙特投入 1.5 亿美元建设其首个中东数据中心。

第三，东南亚市场用区域 ICT 伙伴封装本地化交付。与中信国际电讯 (CPC) 全资子公司 Acclivis 的战略合作覆盖新加坡、马来西亚、印尼、泰国、菲律宾和中国香港。Acclivis 提供互联网接入、托管服务和终端 IT 支持，把腾讯云的云平台能力封装进本地化、多语种的 ICT 交付包，由本地团队面对客户。配合腾讯云 11,000 家全球合作伙伴生态，区域内不同市场可按当地最熟悉的合作形态承接。

第四，基础设施持续在地化。腾讯云目前覆盖 22 个地区、运营 64 个可用区，叠加 3,200 多个全球加速节点与 400T 带宽储备；正在建设第三个大阪数据中心并新设大阪办公室，沙特首个中东数据中心已立项；累计获得 400 多项国际专业认证，覆盖 GDPR、ISO、SOC 等主流合规标准。在地数据中心的存在本身就是对当地监管与文化偏好（数据驻留、合规审计、本地服务方）的最直接回应。

诚实补充：腾讯云没有在公开渠道发布"按文化类型分类的客服培训 SOP"，我们在这道题上不会假装有。我们对外可被验证的"文化差异标准化"是流程层的全球统一 SLA 矩阵 + 6 语种门户 + 5 地公开热线，叠加适配层的 9 大技术支持中心 + 11 个区域办公室 + 100 多个全球支持触点 + 区域级本地实体（Mobily、Acclivis）+ 在地数据中心。文化差异不靠手册解决，靠在地实体和流程透明度解决——这是腾讯云的真实形态。`,
                defaultValueEn: `Tencent Cloud handles cross-cultural service delivery on two layers: a globally uniform process layer that procurement teams can audit, and a market-specific presence layer delivered through local entities. We do not lead with a published "by-culture customer-service training manual" as differentiation. The standardization is in the process and in the on-the-ground presence, both of which are verifiable.

Process layer, global and uniform. Tencent Cloud International publishes a four-tier Support Plan (Basic, Developer, Business, Enterprise). The Enterprise tier commits to response times of under 8 hours for general issues, under 4 hours for system-impaired, under 20 minutes for production-impacted, and under 15 minutes for business-critical incidents, plus a designated Technical Account Manager, consultative architecture review, on-site service of up to 3 person-days per year, and 24/7 access via phone, ticket, and online chat. Public 24/7 toll-free hotlines are listed for Hong Kong China, the United States, the United Kingdom, Canada, and Australia. The international portal and console operate in six languages: English, Japanese, Korean, Simplified Chinese, Portuguese, and Bahasa Indonesia. This is the shape Western enterprise procurement evaluates against — a published severity matrix with named accountability — which directly addresses the process-compliance expectation of European and North American customers.

Presence layer, market-specific.

First, three concentric circles of overseas presence. As of March 2026, Tencent Cloud operates 9 overseas technical support centers (Jakarta, Manila, Kuala Lumpur, Singapore, Bangkok, Tokyo, Seoul, Palo Alto, and Frankfurt), 11 regional offices, and 100+ global technical-support touchpoints, serving customers in over 80 countries and regions. Frankfurt and Palo Alto cover European and North American customers on local working hours and compliance posture; Tokyo and Seoul cover the high-context Japan and Korea markets; the five Southeast Asian cities cover the multilingual and multi-regulatory reality of that region.

Second, in the Middle East, Tencent Cloud uses a local-partner-fronted operating model that addresses the relationship-first procurement pattern of the Gulf at a structural level rather than a rhetorical one. The Go Saudi program with Etihad Etisalat (Mobily) positions Mobily as the local entity facing Saudi enterprise customers, while Tencent Cloud provides the underlying enterprise private-cloud platform (TCE) and the Tencent Cloud Mini Program Platform (TCMPP). The customer relationship and contracting authority sit with a domestic telco, not with a cross-border counterparty, and the platform commits explicitly to user privacy, data residency, and alignment with local regulation. Tencent Cloud has also announced a USD 150 million investment for its first Middle East data center in Saudi Arabia.

Third, in Southeast Asia, Tencent Cloud delivers through a regional ICT partnership with Acclivis, a wholly owned subsidiary of CITIC Telecom International CPC. The combined platform spans Singapore, Malaysia, Indonesia, Thailand, the Philippines, and Hong Kong, with Acclivis providing managed services, internet connectivity, and end-user IT support, while Tencent Cloud provides the cloud and industry-solution layer. Local teams face the customer in local languages and under local commercial terms. The 11,000-partner global ecosystem enables similar partner-led delivery across other regions where local commercial norms favour a domestic-fronted entity over a direct vendor relationship.

Fourth, infrastructure presence is widening in parallel. Tencent Cloud now covers 22 regions and 64 operational availability zones, supported by 3,200+ global acceleration nodes and 400T of bandwidth reserve. A third Osaka data center is under construction with a new Osaka office, and the planned Middle East data center is moving forward in Saudi Arabia. The portfolio carries 400+ international certifications across GDPR, ISO, SOC, and other mainstream frameworks. The presence of an in-country data center is itself the most direct response to local regulatory and cultural preferences for data residency, audit-able compliance, and domestic service entities.

Honest framing. Tencent Cloud does not publish a culture-by-culture customer-service training manual, and we are not going to claim one for this question. The verifiable form of our cultural-difference standardization is process standardization (the SLA matrix, the six-language portal, the five-country toll-free hotlines) combined with presence standardization (nine support centers, eleven regional offices, 100+ touchpoints, named regional partners such as Mobily and Acclivis, and local data-center investments). Cultural difference is not solved with a manual; it is solved with on-the-ground entities and process transparency.`,
                reasoning: {
                  sources: [
                    src("https://www.tencentcloud.com/render/support-plan", "Support Plan 页 (4 档 SLA)"),
                    src("https://www.tencentcloud.com/contact-us", "tencentcloud.com/contact-us (6 语言 + 5 国电话)"),
                    src("https://www.tencent.com/en-us/articles/2202183.html", "GDES press release (9 支持中心)"),
                    src("https://mp.weixin.qq.com/s/j8vusknh7x0vBPpsTbxq7Q", "公众号腾讯云出海服务 2025-12-01 (11 区域办公室)"),
                    src("https://mp.weixin.qq.com/s/6Ug6YL0F3mPJdOPQmdxAFQ", "公众号腾讯云出海服务 2026-03-31 (100+ 触点 + 400+ 认证)"),
                    src("https://www.tencentcloud.com/dynamic/news-details/100534", "Mobily 'Go Saudi' (LEAP 2024)"),
                    src("https://www.tencentcloud.com/dynamic/news-details/100315", "Acclivis collaboration"),
                  ],
                  quotes: [
                    `[render/support-plan]: 4 档 SLA matrix; Enterprise "Business critical < 15 minutes ... Designated Technical Account Manager"`,
                    `[contact-us]: 6 语言切换器 + 5 国 24/7 免费电话。`,
                    `[GDES]: "Today, Tencent Cloud has deployed 9 global technical support centers"`,
                    `[公众号腾讯云出海服务 2025-12-01]: "11个区域办公室与9大技术支持中心，服务覆盖30多个行业与80多个国家和地区"`,
                    `[公众号腾讯云出海服务 2026-03-31]: "9大技术支持中心与100+全球技术支持触点 ... 22个地区覆盖、64个运营可用区、3200+全球加速节点、400T带宽储备 ... 获得400+项国内外权威认证"`,
                    `[Mobily]: "'Go Saudi' program ... powered by Tencent Cloud Enterprise (TCE) ... The enterprise-grade private cloud platform will prioritize user privacy and data security"`,
                    `[Acclivis]: "Tapping on Acclivis' presence in Singapore, Malaysia, Indonesia, Thailand, Philippines and Hong Kong as well as Tencent Cloud's expertise and experience in China"`,
                  ],
                  reasoning: `v2 升级"流程层 + 适配层"两层 framing：流程层硬指标保留并明确为欧美 process-compliance 配套；适配层加深三层覆盖（9 + 11 + 100+）+ 中东 / SEA / 基础设施三市场结构化回应；总规模升级到 22 / 64 / 3200+ / 400T / 400+ 认证。诚实声明腾讯云不发布按文化分类的客服 SOP，差异化由在地实体和流程透明度承担。`,
                  decision: `两层 framing 全部用 v2 数据，覆盖中东 trust + 欧美 process + SEA partner-fronted + 基础设施在地化四个适配方向；保留诚实声明。`,
                },
              },
            ],
          },
        ],
      },
      {
        id: "q4_3",
        title: "4.3 Success case · 生态协同成功案例",
        promptEn: `Share one case where ecosystem collaboration successfully served Chinese enterprises going global (industry, challenge, solution, results).`,
        promptZh: `请分享一个通过生态协同成功服务中企出海的案例（客户行业、挑战、解决方案、成果）`,
        status: "verified",
        groups: [
          {
            fields: [
              {
                id: "s4_case",
                kind: "text",
                label: "成功案例",
                status: "verified",
                rows: 16,
                defaultValue: `行业：跨境电商出海。

伙伴与角色分工：腾讯云作为云平台底座，深圳市稳卖科技（萨摩耶集团旗下，稳卖 AI 浏览器的发布方）作为跨境电商垂直生态伙伴。2026 年 1 月 30 日双方签署战略合作协议，由腾讯云高级副总裁徐翊鸣与稳卖科技董事长林建明共同见证，由腾讯云数字金融副总经理罗盛与稳卖科技高级副总裁罗紫红代表双方签署。

挑战：中国跨境卖家长期面临网络不稳定、海外站点首屏加载延迟约 10 秒、账号关联与封号风险、运营成本高、内容与选品高度依赖人工等问题。在传统模式下，单款商品的标题、五点描述与视觉素材制作平均超过 3 小时；选品调研单款超过 8 小时，转化率不足 30%；单 SKU 图片与视频素材生产需要 3 至 5 天，导致核心运营能力难以规模化复制。

解决方案：双方将腾讯云的云计算与 AI 大模型底座，与稳卖在跨境业务侧的积累深度整合，联合推出"AI+跨境"智能运营方案。腾讯云提供 Lighthouse 轻量应用服务器（保障安全合规的店铺运营环境）、EO 全球加速边缘节点（动静分离、海外访问加速）、Serverless 容器服务与 TDSQL-C MySQL 云原生数据库（弹性伸缩与高可用）、混元大模型（商品智能分析、文生图、图生图、多模态视频生成）以及智能体开发平台 ADP（运营 Agent 运行时）。稳卖科技负责跨境电商账号隔离环境、AI 浏览器前端、基于亚马逊 ASIN 的垂直工具链以及面向数百家跨境卖家的商业化通路。

成果：合作上线后，海外站点首屏加载延迟由 10 秒压缩至 3 秒，整体访问延时下降 60%；后台基于云原生改造后，整体 IT 成本较传统云方案下降 30% 以上；平台 AI 工具调用量提升 8 至 12 倍。落到具体的中国跨境卖家身上：单款商品内容生产由 3 小时以上压缩至 5 分钟以内（提效约 35 倍）；单款选品调研由 8 小时以上压缩至 30 分钟以内（提效约 15 倍）；单 SKU 图片与视频素材由 3 至 5 天压缩至数十分钟（提效超过 200 倍）；从选品分析、内容生成、素材制作到上架准备等超过 95% 的运营动作可通过 AI 与自动化流程完成。该方案目前已助力数百家中国跨境电商规模化提效。

生态宽度的同形态延伸：在跨境支付方向，腾讯云与威富通基于腾讯云弹性计算、数据库与支付能力，为中银香港、中东 Tiqmo 等 200 多家海外金融机构提供支付与数字钱包服务，日均处理超过 4000 万笔交易，承载了大量中国出海企业的全球资金流。在地理落地方向，腾讯云联合沙特电信运营商 Mobily 推出"Go Saudi"项目，并规划 1.5 亿美元投资建设中东首个可用区，作为中国企业进入沙特的本地化承载通道。这一伙伴网络背后是腾讯云全球 22 个地区、64 个可用区、3200 个网络节点的基础设施，以及超过 2 万家海外客户、90% 以上头部互联网企业与 95% 以上头部游戏公司选择腾讯云出海的客户基数。`,
                defaultValueEn: `Industry: cross-border e-commerce, with Chinese sellers expanding into overseas markets.

Partners and role split: Tencent Cloud as the cloud platform, and Shenzhen Wenmai Technology, a Samoyed Group subsidiary that publishes the Wenmai AI Browser, as the cross-border e-commerce ecosystem ISV. The two parties signed a strategic partnership agreement on January 30, 2026, witnessed by Tencent Cloud Senior Vice President Xu Yiming and Wenmai chairman Lin Jianming, and signed by Tencent Cloud digital finance VP Luo Sheng and Wenmai SVP Luo Zihong.

Challenge: Chinese cross-border sellers had long struggled with unstable overseas networks, overseas storefront first-page load times of around 10 seconds, account-association and store-suspension risks, high operating costs, and operations that depended heavily on manual work. Under the legacy model, producing the title, five-point description, and visual assets for a single SKU took more than three hours, selection-research for one SKU took more than eight hours with conversion below 30 percent, and image and video assets for one SKU took three to five days, all of which made it hard to scale a seller's core operational competence.

Solution: The two sides combined Tencent Cloud's cloud computing and AI large-model platform with Wenmai's cross-border business assets to launch a joint "AI plus cross-border" intelligent operations solution. Tencent Cloud provides Lighthouse lightweight servers as a compliant store-operations environment, EO global edge acceleration with dynamic-static separation for overseas access, Serverless container service and the TDSQL-C MySQL cloud-native database for elasticity and high availability, the Hunyuan large model for product analytics, text-to-image, image-to-image, and multi-modal video generation, and the ADP Agent Development Platform as the runtime for AI operations agents. Wenmai contributes its account-isolation environment for cross-border merchants, the AI Browser front end, a vertical toolchain built on Amazon ASIN data, and a commercialization channel into hundreds of Chinese cross-border sellers.

Results: After the joint solution went live, overseas first-page load latency dropped from 10 seconds to 3 seconds and overall access latency was reduced by 60 percent. The cloud-native back-end cut total IT cost by more than 30 percent versus the prior baseline. Platform AI-tool call volume rose 8 to 12 times. At the individual Chinese seller level, content production per SKU compressed from over 3 hours to under 5 minutes (about 35x), selection research per SKU compressed from over 8 hours to under 30 minutes (about 15x), and image and video asset production per SKU compressed from 3 to 5 days to tens of minutes (more than 200x). More than 95 percent of seller operational actions, from selection and content generation through asset production and listing preparation, can now run end to end through AI and automation. The joint solution is already in use across hundreds of Chinese cross-border merchants achieving these efficiency gains.

Ecosystem breadth in the same shape: In cross-border payments, Tencent Cloud's collaboration with PayerMax (Wifutong) uses Tencent Cloud elastic compute, databases, and payment capabilities to serve more than 200 overseas financial institutions, including Bank of China Hong Kong and Tiqmo in the Middle East, processing more than 40 million payment transactions per day and carrying the global cash flows of many Chinese outbound enterprises. On the geographic landing side, Tencent Cloud and Saudi telco Mobily launched the Go Saudi program and committed USD 150 million to build Tencent Cloud's first Middle East availability zone in Saudi Arabia as a local landing channel for Chinese enterprises entering the Kingdom. This partner network sits on top of Tencent Cloud's infrastructure of 22 regions, 64 availability zones, and 3,200 network nodes worldwide, serving more than 20,000 overseas customers, with over 90 percent of leading Chinese internet companies and 95 percent of leading Chinese gaming companies choosing Tencent Cloud for their global expansion.`,
                reasoning: {
                  sources: [
                    src("https://mp.weixin.qq.com/s/Q6LOj-ig4XW_sp0PKqHVSg", "公众号腾讯云出海服务 2026-01-30 (稳卖 AI 浏览器战略合作)"),
                    src("https://mp.weixin.qq.com/s/j8vusknh7x0vBPpsTbxq7Q", "公众号腾讯云出海服务 2025-12-01 (威富通跨境支付)"),
                    src("https://www.tencentcloud.com/dynamic/news-details/100534", "Mobily 'Go Saudi' (LEAP 2024)"),
                    src("https://www.tencent.com/en-us/articles/2202183.html", "GDES press release (2025-09-16)"),
                  ],
                  quotes: [
                    `[公众号腾讯云出海服务 2026-01-30 稳卖]: "1月30日，腾讯云与萨摩耶旗下深圳市稳卖科技有限公司签署战略合作协议"`,
                    `[公众号腾讯云出海服务 2026-01-30 稳卖]: "海外站点的首页加载延迟从10秒压缩至3秒，整体访问延时降低了60% ... AI工具调用量提升约 8-12 倍 ... 单 SKU 图片及视频素材的生产耗时由原来的 3–5 天压缩至数十分钟以内，实现超200倍的效率提升"`,
                    `[公众号腾讯云出海服务 2025-12-01 威富通]: "威富通为中银香港、中东Tiqmo等200多家海外金融机构提供支付与数字钱包服务，日均处理超4000万笔交易"`,
                    `[Mobily LEAP 2024 - Dowson Tong]: "supporting the expansion of global and Chinese enterprises expanding into Saudi Arabia"`,
                    `[GDES]: "more than 90% of leading Chinese internet companies, and 95% of leading Chinese gaming companies are also using Tencent Cloud to support their global expansion initiatives."`,
                  ],
                  reasoning: `v2 把主案例从 Mobily 切到稳卖 AI 浏览器，因为 Mobily 案例 v1 一直未能解锁具名中国租户。稳卖 2026-01-30 战略合作有完整四要素（行业 / 挑战 / 解决方案 / 量化成果）+ 跨境电商场景就是中国卖家出海的旗舰用户群。补充威富通跨境支付（200+ 海外金融机构 / 4000 万笔/日）+ Mobily Go Saudi 中东落地通道 + GDES 海外客户翻倍 / 95% 头部游戏 framing 拓宽生态宽度。`,
                  decision: `主案例切到稳卖（具名中国卖家场景 + 35x / 15x / 200x 量化提效）+ 威富通跨境支付 + Mobily 中东落地为生态宽度延伸；q3_2 已使用 GoTo 主案例，避免重复。`,
                },
              },
            ],
          },
        ],
      },
    ],
  },

  // ====== V. Compliance ======
  {
    id: "s5",
    index: "V",
    title: "Global Security & Compliance Assurance · 全球安全合规保障",
    description: "应对全球各区域数据安全、合规、隐私法规的技术与服务能力。",
    descriptionEn: "Technical and service capabilities to address data security, compliance, and privacy regulations across global regions.",
    questions: [
      {
        id: "q5_1",
        title: "5.1 Compliance certifications, by region · 区域合规认证",
        promptEn: `List major regional compliance certifications achieved:
- Southeast Asia: ________
- Europe/Americas: ________
- Middle East: ________
- Latin America: ________`,
        promptZh: `请列出贵司已通过的全球主要区域合规认证：
- 东南亚：________
- 欧美：________
- 中东：________
- 拉美：________`,
        status: "needs-confirm",
        groups: [
          {
            layout: "labeled-rows",
            fields: [
              {
                id: "s5_sea",
                kind: "text",
                label: "Southeast Asia · 东南亚",
                status: "verified",
                rows: 5,
                defaultValue: `新加坡：MTCS Level-3（Multi-Tier Cloud Security）、OSPAR Audit Report（Outsourced Service Provider Audit Report）、Cyber Trust Mark（CSA Singapore 网络安全认证）、DPTM（Data Protection Trustmark Certification）。
印度尼西亚：SNI 27001（印尼信息安全管理体系国家标准）、IT Compliance Audit in Indonesian Financial Industry（印尼金融业 IT 合规审计）。
马来西亚：IT Compliance Audit in Malaysian Financial Industry（马来西亚金融业 IT 合规审计）。
泰国：IT Compliance Audit in Thailand Financial Industry（泰国金融业 IT 合规审计）。

基础口径说明：以上仅列腾讯云在公开 Compliance Program 页面正式披露的区域性资质。全球类（ISO/IEC 27001、ISO/IEC 27017、ISO/IEC 27018、ISO/IEC 27701、ISO/IEC 29151、ISO 22301、ISO 9001、ISO/IEC 20000、ISO 27799、CSA STAR、PCI DSS、BS 10012、SOC 1 / SOC 2 / SOC 3）按官方分类属 Global，默认适用于所有区域，不在每行重复列出。腾讯云累计获得 400+ 项国际专业认证，覆盖 GDPR、SOC、ISO 等 20 多个领域的全球主流标准。`,
                defaultValueEn: `Singapore: MTCS Level-3 (Multi-Tier Cloud Security), OSPAR Audit Report (Outsourced Service Provider Audit Report), Cyber Trust Mark (CSA Singapore cybersecurity certification), DPTM (Data Protection Trustmark Certification).
Indonesia: SNI 27001 (Indonesia Information Security Management System national standard), IT Compliance Audit in Indonesian Financial Industry.
Malaysia: IT Compliance Audit in Malaysian Financial Industry.
Thailand: IT Compliance Audit in Thailand Financial Industry.

Baseline note: only the region-specific certifications publicly disclosed on the Tencent Cloud Compliance Program page are listed above. Global certifications (ISO/IEC 27001, ISO/IEC 27017, ISO/IEC 27018, ISO/IEC 27701, ISO/IEC 29151, ISO 22301, ISO 9001, ISO/IEC 20000, ISO 27799, CSA STAR, PCI DSS, BS 10012, SOC 1 / SOC 2 / SOC 3) are classified as Global on the official page and apply across all regions. Tencent Cloud has accumulated 400+ international certifications spanning 20+ standards domains including GDPR, SOC and ISO.`,
                reasoning: {
                  sources: [
                    src("https://www.tencentcloud.com/services/compliance-program", "Compliance Program 页（Regional and Industry Compliance）"),
                    src("https://mp.weixin.qq.com/s/j8vusknh7x0vBPpsTbxq7Q", "公众号腾讯云出海服务 2025-12-01 (400+ 认证 / 20+ 领域)"),
                  ],
                  quotes: [
                    `[compliance-program]: "MTCS Level-3 / Singapore Multi-Tier Cloud Security Certificate"`,
                    `[compliance-program]: "OSPAR Audit Report / Singapore OSPAR Audit Report"`,
                    `[compliance-program]: "Cyber Trust Mark / Singapore Cyber Security Certification"`,
                    `[compliance-program]: "DPTM / Singapore Data Protection Trustmark Certification"`,
                    `[compliance-program]: "SNI 27001 / Indonesia Information Security Management System Certification"`,
                    `[compliance-program]: "IT Compliance Audit in Indonesian Financial Industry / Malaysian Financial Industry / Thailand Financial Industry"`,
                    `[公众号腾讯云出海服务 2025-12-01]: "腾讯云已累计获得400多项国际专业认证，覆盖GDPR、SOC、ISO等20多个领域的全球主流标准"`,
                  ],
                  reasoning: `照搬 Compliance Program 页 Regional and Industry Compliance 分组（4 国 8 项）+ v2 加入 400+ / 20+ 领域全球认证总量伞型口径。HK ICAR / 日本 FISC / 韩国 K-ISMS 严格属 East Asia / HKSAR financial industry，未列入 SEA。`,
                  decision: `4 国 8 项 SEA 区域认证 + 全球类 header 说明 + 400+ 总量伞型。`,
                },
              },
              {
                id: "s5_eu_us",
                kind: "text",
                label: "Europe / Americas · 欧美",
                status: "verified",
                rows: 8,
                defaultValue: `欧洲：C5（Cloud Computing Compliance Criteria Catalogue，德国 BSI）、TISAX（Trusted Information Security Assessment Exchange，德国汽车业）、CISPE（Cloud Infrastructure Services Providers in Europe Code of Conduct）、GDPR alignment（隐私白皮书声明遵循欧盟 GDPR；GDPR 是法规非第三方认证）。
美洲：SOC 1 / SOC 2 / SOC 3（System and Organization Controls Reports，AICPA 体系）、HIPAA（Health Insurance Portability and Accountability Act，美国医疗）、NIST CSF（NIST Cybersecurity Framework）、SEC Rule 17a-4（美国证监会数据保留规则）、MPAA Content Security Model（美国电影协会内容安全标准）、GxP（GxP Compliance Assessment Report，制药行业）。`,
                defaultValueEn: `Europe: C5 (Cloud Computing Compliance Criteria Catalogue, BSI Germany), TISAX (Trusted Information Security Assessment Exchange, German automotive), CISPE (Cloud Infrastructure Services Providers in Europe Code of Conduct), GDPR alignment (declared in the Privacy Compliance White Paper; GDPR is a regulation, not a third-party certification).
Americas: SOC 1 / SOC 2 / SOC 3 (System and Organization Controls Reports, AICPA), HIPAA (Health Insurance Portability and Accountability Act, US healthcare), NIST CSF (NIST Cybersecurity Framework), SEC Rule 17a-4 (US Securities and Exchange Commission records-retention rule), MPAA Content Security Model (Motion Picture Association of America), GxP (GxP Compliance Assessment Report, life sciences).`,
                reasoning: {
                  sources: [
                    src("https://www.tencentcloud.com/services/compliance-program", "Compliance Program 页"),
                    src("https://staticintl.cloudcachetci.com/yehe/backend-news/Rc2E064_Privacy-Compliance-Whitepager.pdf", "Privacy Compliance White Paper"),
                    src("https://mp.weixin.qq.com/s/... ", "公众号腾讯云 2026-04-23 (国内首家 CISPE 牌照)"),
                  ],
                  quotes: [
                    `[compliance-program]: "C5 / Germany Cloud Computing Compliance Criteria Catalogue"`,
                    `[compliance-program]: "TISAX / Germany TISAX (Trusted Information Security Assessment Exchange) Audit"`,
                    `[compliance-program]: "CISPE / Cloud Infrastructure Services Providers in Europe"`,
                    `[compliance-program]: "SOC 1 / SOC 2 / SOC 3 / System and Organization Controls Report"`,
                    `[compliance-program]: "HIPAA · NIST CSF · MPAA · SEC Rule 17a-4 · GxP"`,
                    `[Privacy Whitepaper]: "Examples of applicable laws include: the EU General Data Protection Regulation [GDPR]..."`,
                  ],
                  reasoning: `按"欧洲 / 美洲"分组列出，CISPE 与 GDPR alignment 区分（前者是行为守则，后者是法规非认证）。SOC 系列虽属 Global 分组，按 Omdia 题面上下文映射到美洲市场。`,
                  decision: `欧洲 + 美洲分组按官方表述列出；GDPR / CISPE 区分清晰。`,
                },
              },
              {
                id: "s5_me",
                kind: "text",
                label: "Middle East · 中东",
                status: "needs-confirm",
                rows: 6,
                defaultValue: `公开口径暂未披露中东区域专属合规认证。截至目前，腾讯云 Compliance Program 公开页面未列出针对沙特（SAMA、NCA ECC、CST CCC、PDPL）、阿联酋（DESC、ISR、NESA）、巴林、卡塔尔等中东司法管辖区的本地合规资质。基础设施层面，腾讯云已于 2025 年 2 月在沙特利雅得（Riyadh）开设中东区域，含 2 个可用区，全球类合规资质（ISO/IEC 27001、ISO/IEC 27017、ISO/IEC 27018、CSA STAR、SOC 2、PCI DSS 等）按其标准范围适用于该区域。`,
                defaultValueEn: `No Middle East-specific compliance certifications are publicly disclosed at this time. The Tencent Cloud Compliance Program page lists no Saudi Arabia (SAMA, NCA ECC, CST CCC, PDPL audit), UAE (DESC, ISR, NESA), Bahrain or Qatar local certification. On the infrastructure side, Tencent Cloud opened its inaugural Middle East Region in Riyadh, Saudi Arabia in February 2025 with two availability zones; the global certifications (ISO/IEC 27001, ISO/IEC 27017, ISO/IEC 27018, CSA STAR, SOC 2, PCI DSS, etc.) apply to the Riyadh Region under their standard scope.`,
                reasoning: {
                  sources: [
                    src("https://www.tencentcloud.com/services/compliance-program", "Compliance Program 页"),
                    src("https://www.tencentcloud.com/dynamic/news-details/100638", "Tencent Cloud KSA Region launch (2025-02-09)"),
                    src("https://mp.weixin.qq.com/s/qlFNIGSkt5H5Kw-u7_6bDg", "公众号腾讯云出海服务 2025-09-17 (USD 150M)"),
                    src("https://mp.weixin.qq.com/s/j8vusknh7x0vBPpsTbxq7Q", "公众号腾讯云出海服务 2025-12-01 (USD 150M)"),
                  ],
                  quotes: [
                    `[compliance-program]: 中东区域专项认证未出现任何一项。`,
                    `[news-details/100638]: "Tencent Cloud ... launched its first Middle East Cloud Region in Saudi Arabia, featuring two availability zones"`,
                    `[公众号腾讯云出海服务 2025-12-01]: "腾讯云在沙特投资1.5亿美元建设中东首个可用区"`,
                  ],
                  reasoning: `WeChat 2025-2026 档案搜索 SAMA/DESC/NCA/PDPL/ISR/NESA 等中东 cert 关键词均零命中，公开 Compliance Program 页中东区域 cert 完全空白。诚实声明 + 全球类 cert 适用范围说明。Riyadh region 在 2025-02 已 GA + 2025-09 USD 150M 投资是后续扩建。`,
                  decision: `明确"公开未披露"+ Riyadh region 已 GA + 全球类 cert 适用范围 + 沙特 USD 150M 进一步投资。`,
                },
              },
              {
                id: "s5_latam",
                kind: "text",
                label: "Latin America · 拉美",
                status: "needs-confirm",
                rows: 5,
                defaultValue: `公开口径暂未披露拉美区域专属合规认证。截至目前，腾讯云 Compliance Program 公开页面未列出针对巴西（LGPD 第三方评估、ANPD 备案）、墨西哥（联邦个人数据保护法审计）等拉美司法管辖区的本地合规资质；LGPD 在腾讯云 Privacy White Paper 与对外内容中作为客户须遵循的法规被引用，并非腾讯云持有的第三方认证。基础设施层面，腾讯云在巴西圣保罗（São Paulo）设有南美区域，含 1 个可用区，全球类合规资质（ISO/IEC 27001、ISO/IEC 27017、ISO/IEC 27018、CSA STAR、SOC 2、PCI DSS 等）按其标准范围适用于该区域。`,
                defaultValueEn: `No Latin America-specific compliance certifications are publicly disclosed at this time. The Tencent Cloud Compliance Program page lists no Brazilian (LGPD third-party audit, ANPD attestation), Mexican (Federal Law on the Protection of Personal Data audit) or other LatAm jurisdictional certification; LGPD is referenced in the Tencent Cloud Privacy White Paper and outbound content as a regulation customers must meet, not as a Tencent-Cloud-held third-party certification. On the infrastructure side, Tencent Cloud operates a South America Region in São Paulo with one availability zone; the global certifications (ISO/IEC 27001, ISO/IEC 27017, ISO/IEC 27018, CSA STAR, SOC 2, PCI DSS, etc.) apply to the São Paulo Region under their standard scope.`,
                reasoning: {
                  sources: [
                    src("https://www.tencentcloud.com/services/compliance-program", "Compliance Program 页（拉美空白）"),
                    src("https://www.tencentcloud.com/global-infrastructure", "tencentcloud.com/global-infrastructure"),
                    src("https://www.tencentcloud.com/customers/detail/3533", "CNN BRASIL 客户页"),
                  ],
                  quotes: [
                    `[compliance-program]: 拉美区域专项 cert 未出现任何一项。`,
                    `[global-infrastructure]: "South America / São Paulo / 1 [zone]"`,
                    `[CNN BRASIL]: "data security under Brazil's LGPD"（客户侧合规需求描述）。`,
                  ],
                  reasoning: `LGPD 是法规非"认证"概念。WeChat 2025-2026 档案搜索 LGPD / ANPD 等拉美 cert 关键词均零命中。诚实区分"认证 vs 合规对齐"。`,
                  decision: `明确"公开未披露"+ LGPD 法规与认证区分 + 全球类适用说明。`,
                },
              },
            ],
          },
        ],
      },
      {
        id: "q5_2",
        title: "5.2 Regulatory agility · 法规更新响应流程",
        promptEn: `What is your process when regulations change (e.g., GDPR updates, China data export rules)?`,
        promptZh: `当目标市场法规更新时（如：GDPR修订、中国数据出境新规），贵司的应对流程是什么？`,
        status: "needs-confirm",
        groups: [
          {
            fields: [
              {
                id: "s5_agility",
                kind: "text",
                label: "法规应对流程",
                status: "needs-confirm",
                rows: 6,
                defaultValue: `腾讯云未对外公开端到端的"法规变更响应"逐步 SOP（无公开 intake 步骤、审阅 SLA、上线窗口）。以下三层是从公开制品反推出的可验证 posture：标准与文档的版本节拍 + 法律与产品侧的对外发声 + 客户侧的合同与通知机制。

监测层。腾讯云累计获得 400+ 项国际专业认证，覆盖 GDPR、SOC、ISO 等 20 多个领域的全球主流标准；每一张证书都依赖独立第三方的周期性 surveillance audit，构成法规跟随的天然节拍器。文档侧两条公开版本信号同步指向"法规驱动的修订"：Security Whitepaper 当前公开文件名 Whitepaper-202509.pdf 对应 2025 年 9 月版次，与之并列的 Privacy Compliance Whitepaper 中明确写到所采用的 BS 10012 标准已根据 GDPR 修订；Privacy Policy 公开版本号为 v2.0，并在文档内设 Updates & Changes 章节。对外发声方面，腾讯高级法律顾问田展在公开演讲中将法规跟踪定义为"动态且全面的过程"，并给出 144 个国家有数据保护法、跨牌照资质 / 数据本地化驻留 / AI 监管多个维度、企业作为"数据控制者"或"数据处理者"承担不同法律责任等可验证锚点；高级法律顾问文含章在另一公开场合将合规风险拆为数据合规、知识产权、市场准入三类。监测能力的公开证据是这三条信号的叠加，而不是单一对外口径。

落地层。GDPR 与英国 PECR 2003 的合同侧落地表现为腾讯云国际版 Data Processing Agreement 与 Data Processing and Security Agreement 双文件分层（前者明确适配 GDPR 与 PECR，后者对 Content 数据处理边界单独约定）。欧盟侧的产品与运营动作已对外披露：数据优先本地存储、远程访问视同跨境传输、对外签署 SCC 标准合同条款；模型训练数据确保授权溯源、规避盗版数据集；AI 生成内容落实水印与标识、建立全流程审核机制；并以"合规可控的本土模型"路径规避第三方模型的地域限制与商用风险。中国出境侧，公开口径以客户区域选择为默认（数据处理者不向客户所选地域之外传输），由作为数据控制者的客户依据适用法律识别合规路径，包括与第三国接收方签署 data transfer agreement、明确管辖、充分性评估及缓解措施。印尼数据主权侧的可引用案例：2025 年 6 月配合 GoTo 完成 On-Demand Services 系统全量本地化迁移，期间 Jakarta region 由 2 个可用区扩到 3 个，公开口径由双方明确为"supporting Indonesia's data sovereignty"。客户合规架构层面，为广汽东南亚出海设计"以区域合规至高点辐射周边国家、一套环境服务整个区域"的架构，是法规驱动设计在客户侧的落地形态。

客户层。合同与通知机制以独立可追踪的制品对外发布：Privacy Policy 承诺重大变更将在网站发布通知，并在文末专设 Updates & Changes 章节；International DPA 与 DPSA 作为独立文档发布，便于客户跟踪条款迭代。客户侧数据主体权利支持已写入 Compliance Center 公开口径：客户可在购买页选择数据存储可用区，并在为其终端用户响应 access、correction、deletion、restricted processing、portability 等请求时获得腾讯云的必要技术支持。执法或政府部门的数据请求由独立公布的 Information Request 指引约束，覆盖 Tencent Cloud International 服务范围。`,
                defaultValueEn: `Tencent Cloud does not publish a step-by-step end-to-end SOP for regulatory change response (no public intake step, review SLA, or rollout window). The three layers below are the externally verifiable posture inferred from public artifacts: standard and document versioning cadence, legal and product disclosures, and customer-facing contractual and notification mechanisms.

Monitoring layer. Tencent Cloud has accumulated 400+ international certifications spanning 20+ standards domains including GDPR, SOC and ISO; every certificate carries a recurring third-party surveillance audit, which acts as the de-facto cadence for regulation tracking. Two public document-versioning signals point in the same direction. The Security Whitepaper is currently published as Whitepaper-202509.pdf (September 2025 revision); the Privacy Compliance Whitepaper published alongside it explicitly notes that the BS 10012 standard it adopts has been updated against the European GDPR; and the Privacy Policy is published at version 2.0 with a dedicated Updates & Changes section. On the disclosure side, Tencent senior legal counsel Tian Zhan has publicly framed regulation tracking as "a dynamic and multi-dimensional process," anchoring it with verifiable points: 144 countries have their own data protection laws, compliance spans licensing, data localization and AI regulation, and an enterprise's legal obligations differ depending on whether it acts as a data controller or a data processor. Senior legal counsel Wen Hanzhang has separately framed the high-risk surface as three buckets — data compliance, intellectual property, and market access. The monitoring posture is the combined output of these signals, not any single channel.

Landing layer. GDPR and the UK PECR 2003 land in contract through a two-document split: the International Data Processing Agreement names GDPR and PECR 2003 as the regimes it is built to satisfy, while the Data Processing and Security Agreement separately scopes the processing of customer Content distinct from the administrative information governed by the Privacy Policy. EU-side product and operational actions have been publicly disclosed: data is stored locally by default, remote access is treated as cross-border transfer, Standard Contractual Clauses are signed with counterparties, model training data is sourced with authorization provenance and pirated datasets are avoided, AI-generated content carries watermarks and labeling under a full-pipeline review mechanism, and customers are routed toward "compliant, controllable local models" to avoid third-party-model regional restrictions and commercial-use risk. On the China cross-border side, the public posture defaults to customer-region selection (a data processor does not transfer customer business data out of the customer's chosen region); when transfer is required, the customer as data controller identifies the applicable laws and applies appropriate safeguards including a data transfer agreement with the third-country receiver, jurisdiction definition, sufficiency assessment, and mitigation. The Indonesia data-sovereignty response is already in production: in June 2025, Tencent Cloud supported GoTo's full migration of On-Demand Services into Indonesia, expanding the Jakarta region from two to three availability zones, with both parties publicly framing the project as supporting Indonesia's data sovereignty. At the customer architecture level, the GAC Southeast Asia engagement is a documented case of regulation-driven design — a "regional high-water-mark, single-environment-serves-the-region" compliance architecture built to absorb tightening overseas requirements.

Customer layer. Contractual and notification mechanics are operationalized as independently traceable artifacts. The Privacy Policy commits to publishing notice on the website for any significant change, with a dedicated Updates & Changes section; the International DPA and the DPSA are published as separate documents so customers can track clause-level revisions. Customer-side data-subject-rights support is set out in the public Compliance Center posture: customers select the storage availability zone at purchase, and Tencent Cloud commits to providing the technical support customers need to fulfill their end-users' access, correction, deletion, restricted-processing and portability requests. Government and law-enforcement requests are governed by a separately published Information Request guideline covering Tencent Cloud International services.`,
                reasoning: {
                  sources: [
                    src("https://www.tencentcloud.com/services/compliance-program", "Compliance Program 页"),
                    src("https://www.tencentcloud.com/services/compliance", "Compliance Center FAQ"),
                    src("https://www.tencentcloud.com/document/product/301/43520", "Privacy Policy v2.0"),
                    src("https://www.tencentcloud.com/document/product/1085/47312", "International DPA"),
                    src("https://www.tencentcloud.com/document/product/301/17347", "DPSA"),
                    src("https://www.tencentcloud.com/document/product/301/41448", "Information Request Guidelines"),
                    src("https://www.tencentcloud.com/dynamic/news-details/100692", "GoTo Indonesia data sovereignty (2025-06-05)"),
                    src("https://mp.weixin.qq.com/s/j8vusknh7x0vBPpsTbxq7Q", "公众号腾讯云出海服务 2025-12-01 (田展 144 国 / 控制者 vs 处理者)"),
                    src("https://mp.weixin.qq.com/s/6Ug6YL0F3mPJdOPQmdxAFQ", "公众号腾讯云出海服务 2026-03-31 (文含章 EU 落地举措 + 三大风险)"),
                    src("https://mp.weixin.qq.com/s/08d1ERzHr_cDtaHBGn8t0A", "公众号腾讯云出海服务 2025-09-26 (广汽 SEA 区域合规架构)"),
                  ],
                  quotes: [
                    `[公众号腾讯云出海服务 2025-12-01 田展]: "全球144个国家都有自己的数据保护法 ... 合规是一个动态且全面的过程，涉及牌照资质、数据本地化驻留、AI监管等多个维度 ... 在企业作为'数据控制者'还是'数据处理者'的不同法律责任上，提供关键指导"`,
                    `[公众号腾讯云出海服务 2026-03-31 文含章]: "全球AI监管趋严，数据合规、知识产权、市场准入成为三大高危风险点 ... 欧盟数据优先本地存储、远程访问视同跨境传输、签署SCC标准合同条款，模型训练数据确保授权溯源、规避盗版数据集，AI生成内容落实水印与标识"`,
                    `[International DPA]: "GDPR), and the Privacy and Electronic Communications Regulations 2003"`,
                    `[compliance FAQ]: "As a data processor, Tencent Cloud will not transfer customer business data to regions outside their chosen region ... signing a data transfer agreement with the receiving party in a third country"`,
                    `[GoTo]: "GoTo's On-Demand Services systems located fully in Indonesia ... while supporting Indonesia's data sovereignty"`,
                    `[Privacy Policy v2.0]: "If there are any significant changes to this privacy policy, we will provide a notice on our website."`,
                    `[公众号腾讯云出海服务 2025-09-26 广汽]: "腾讯云还提供了全面的合规咨询服务，帮助广汽设计出以区域合规至高点辐射周边国家、一套环境服务整个区域的合规架构"`,
                  ],
                  reasoning: `Omdia 问"process when regulations change"，腾讯云无公开端到端 playbook。v2 三层 posture：(1) 监测层加深——400+ certifications + 田展（144 国 / 控制者 vs 处理者）+ 文含章（三大高危风险）+ 文档版本化；(2) 落地层加深——欧盟数据本地存储 / SCC / 训练数据授权溯源 / AI 生成内容水印 + 中国出境 / 印尼 GoTo / 广汽 SE Asia 区域合规架构；(3) 客户层 Privacy Policy 通知 + DSAR 技术支持 + Information Request 制品。诚实声明无 SOP 但有可验证 posture。`,
                  decision: `三层 posture（监测 / 落地 / 客户）+ 法务团队公开发声锚点 + 客户合规架构案例 + 诚实声明无端到端 SOP。`,
                },
              },
            ],
          },
        ],
      },
      {
        id: "q5_3",
        title: "5.3 Client value · 帮助客户降低合规风险",
        promptEn: `How do you help clients reduce compliance risks? Specify services (e.g., compliance consulting, data encryption).`,
        promptZh: `贵司如何帮助客户降低合规风险？请提供具体服务内容（如：合规咨询、数据加密方案）`,
        status: "verified",
        groups: [
          {
            fields: [
              {
                id: "s5_value",
                kind: "text",
                label: "客户价值 / 服务清单",
                status: "verified",
                rows: 8,
                defaultValue: `腾讯云通过以下八项服务，系统性帮助出海客户降低合规风险。

1. 合规中心一站式入口
腾讯云合规中心集中披露已通过的国际与区域认证（ISO 27001、CSA STAR、SOC 1 / SOC 2 / SOC 3，以及多项地区与行业审计报告），并通过合规文档下载页提供证书与审计报告的在线申请与下载，便于客户在合规评审、招标和监管问询中复用。截至目前，腾讯云累计获得 400 多项国内外权威认证，覆盖 GDPR、SOC、ISO 等 20 多个领域的全球主流标准。

2. KMS 密钥管理服务（数据加密 + BYOK）
KMS 基于第三方认证的硬件安全模块（HSM）生成与保护密钥，支持客户主密钥（CMK）创建、启停、年度轮换、信封加密，以及 BYOK（自带密钥）方案，让客户保持对静态数据加密密钥的最终控制。KMS 与 COS、TencentDB for MySQL、CBS 无缝集成，并与 Cloud Audit 联动，对所有密钥管理与使用操作生成详细日志。

3. 隐私白皮书 + 安全白皮书 + DSAR 技术支持
公开发布的 Privacy Compliance Whitepaper 覆盖数据生命周期治理、隐私影响评估，以及对 GDPR 等全球数据保护法规的对齐；Security Whitepaper 详述责任共担模型与多层技术与组织控制。当客户需响应其终端用户（数据主体）关于访问、更正、删除、限制处理、数据可携带等权利的请求时，腾讯云承诺提供必要的技术支持；腾讯法律团队也通过公开演讲为客户提供"数据控制者"与"数据处理者"责任划分的关键指导，并在欧盟数据本地优先存储、远程访问视同跨境传输、SCC 标准合同条款签署、训练数据授权溯源、AI 生成内容水印与全流程审核等具体场景给出实战要点。

4. 区域选择保障 + 无授权不跨境
腾讯云基础设施覆盖全球 20 多个地理区域；客户在购买云产品时可在购买页选择数据存储所在的可用区。在未获客户同意前，客户内容数据不会被转移出客户所选的腾讯云区域，便于客户将业务固定到特定司法辖区以满足数据驻留义务。

5. Cloud Audit + Cloud Config（操作审计与配置合规）
Cloud Audit 记录并跟踪客户对腾讯云资源的所有操作，形成可供取证、内部审计与监管问询提供的操作日志；Cloud Config 提供集中化的云资源配置审计与治理，帮助客户持续监控配置漂移与合规态势。

6. 多租户四层数据隔离
合规中心明确披露四层隔离机制：虚拟化层（基于硬件虚拟化在租户间隔离 CVM 资源）、网络层（VPC + 网络 ACL + 安全组）、云数据库层（防火墙策略与白名单 + 实例级访问控制）、对象存储层（密钥签名校验 + 公私读写权限）。这套机制为客户在多租户环境下的数据保密性提供技术性证明，可作为合规问询的标准回答素材。

7. 合规咨询 + Enterprise 等级架构评审 + Security Expert Service
Enterprise Support Plan 包含专属技术客户经理、咨询式架构评审（涵盖产品配置、平台服务、网络配置等）、IEM（Infrastructure Event Management）专家支持（每年最多 3 次），以及现场服务（每年最多 3 人天）。合规中心同时提供 Security Expert Service 用于安全与合规专家深度介入。在落地交付层面，腾讯云为广汽集团东南亚业务设计了"以区域合规至高点辐射周边国家、一套环境服务整个区域"的合规架构，证明合规咨询是已交付的能力，而非营销标签。

8. 天御海外交易风控解决方案
针对欧盟 GDPR、东南亚数据本地化存储等 43 项海外合规要求，腾讯云天御通过 AI 动态风控 + 全球情报中枢双引擎提供产品化的跨境支付与业务风控能力，公开数据为支付欺诈拦截率 99.5%、合规适配效率提升 70%。该方案承袭腾讯云 ISO 系列认证、CSA STAR 金牌认证、SOC 1 / SOC 2 / SOC 3 审计与欧盟 CISPE 数据保护行为准则认证的合规底座，将合规要求直接内嵌到产品策略中，让客户在跨境业务高频场景下少做"自建合规适配"的重活。`,
                defaultValueEn: `Tencent Cloud reduces compliance risk for outbound enterprise customers through eight concrete services.

1. Compliance Center one-stop portal
A public Compliance Center publishes Tencent Cloud's international and regional attestations (ISO 27001, CSA STAR, SOC 1 / SOC 2 / SOC 3, plus regional and industry audit reports) and exposes a Documents Download workflow for customers to request and download the underlying certificates and audit reports for use in their own compliance reviews, RFPs and regulator inquiries. The portfolio totals more than 400 certifications spanning 20-plus standards domains including GDPR, SOC and ISO.

2. Key Management Service (KMS) for data encryption and BYOK
KMS is HSM-backed (third-party certified hardware security module), supports customer master key (CMK) creation, enable / disable, annual rotation, envelope encryption for high-volume data, and Bring Your Own Key (BYOK) so customers retain ultimate control of the keys protecting their data at rest. KMS integrates natively with COS, TencentDB for MySQL and CBS, and is wired into Cloud Audit so every key management and usage call produces a detailed log.

3. Privacy Whitepaper, Security Whitepaper and DSAR enablement
The published Privacy Compliance Whitepaper covers data lifecycle governance, privacy impact assessments and alignment with global data protection regulations including GDPR. The Security Whitepaper documents the Shared Responsibility Model and the multi-layered technical and organizational controls verified by independent third-party audits. When customers must respond to their own end users' data subject requests (access, correction, deletion, restricted processing, data portability), Tencent Cloud commits to provide the necessary technical support. Tencent's legal team also speaks publicly on the controller-versus-processor responsibility split and on operational guidance for EU local-storage defaults, treatment of remote access as cross-border transfer, SCC adoption, training-data provenance, and AI-generated-content watermarking with full-pipeline review.

4. Region selection guarantee, no cross-border transfer without consent
Tencent Cloud's infrastructure covers more than 20 geographic regions globally. Customers select the storage region at purchase time on the product purchase page. Customer content data is not transferred outside the customer's chosen Tencent Cloud region without consent, which lets customers pin workloads to specific jurisdictions to meet data residency obligations.

5. Cloud Audit and Cloud Config for operational audit and configuration compliance
Cloud Audit records and tracks every operation on Tencent Cloud resources, producing the operation log evidence required for forensic review, internal audit and regulator inquiries. Cloud Config provides centralized configuration auditing and governance of cloud resources so customers can continuously monitor configuration drift and compliance posture.

6. Four-layer multi-tenant data isolation
The Compliance Center documents four explicit isolation layers: hardware virtualization between tenants on CVM resources; VPC plus network ACL plus security groups at the network layer; firewall policy with whitelist filtering plus instance-level access control at the cloud database layer; key-signed request validation plus public or private read / write permission settings at the object storage layer. This gives customers a defensible technical answer when regulators or auditors ask about multi-tenant data confidentiality.

7. Compliance consulting plus Enterprise tier architecture review and Security Expert Service
The Enterprise Support Plan bundles a designated Technical Account Manager, consultative architecture review covering product usage, configuration, platform services and network configuration, Infrastructure Event Management (up to 3 sessions per year) and on-site service (up to 3 person-days per year). The Compliance Center also offers a Security Expert Service for deeper security and compliance expert engagement. As a delivered example, Tencent Cloud's compliance consulting helped GAC Group design a Southeast Asia compliance architecture that radiates from the strictest jurisdiction outward, serving the whole region from one environment, which shows that compliance consulting is an executed capability rather than a marketing label.

8. Tianyu overseas transaction risk control solution
Tianyu is a productized solution that bakes overseas compliance requirements directly into a payment and business risk-control engine. It addresses 43 named overseas data-protection and payment-regulation requirements (EU GDPR, Southeast Asia data localization and others) through an AI dynamic risk plus global threat intelligence dual engine, with publicly stated outcomes of 99.5 percent payment fraud interception and a 70 percent improvement in compliance-adaptation efficiency. It rests on Tencent Cloud's broader compliance baseline of ISO certifications, CSA STAR Gold, SOC 1 / SOC 2 / SOC 3 audits and EU CISPE Code of Conduct alignment, so customers running cross-border payments and high-frequency transaction workloads inherit those controls instead of building region-by-region compliance adapters themselves.`,
                reasoning: {
                  sources: [
                    src("https://www.tencentcloud.com/services/compliance", "Compliance Center"),
                    src("https://www.tencentcloud.com/services/compliance-documents", "Documents Download"),
                    src("https://www.tencentcloud.com/product/kms", "tencentcloud.com/product/kms"),
                    src("https://www.tencentcloud.com/document/product/1164/51489", "Cloud Config doc"),
                    src("https://www.tencentcloud.com/render/support-plan", "Support Plan"),
                    src("https://www.tencentcloud.com/product/tianyu", "tencentcloud.com/product/tianyu"),
                    src("https://mp.weixin.qq.com/s/PuFpbEYbnvGzB1DZI4KZHw", "公众号腾讯云出海服务 2025-05-28 (天御海外交易风控)"),
                    src("https://mp.weixin.qq.com/s/08d1ERzHr_cDtaHBGn8t0A", "公众号腾讯云出海服务 2025-09-26 (广汽 SEA 区域合规架构)"),
                  ],
                  quotes: [
                    `[compliance]: "Tencent Cloud has obtained multiple security and privacy compliance certifications or qualifications through independent third-party audits or assessments, including: ISO 27001 ... CSA STAR ... SOC 1/SOC 2/SOC 3 Report ..."`,
                    `[KMS]: "KMS leverages a third-party certified hardware security module (HSM) to generate and protect keys ... BYOK solution allows you to use your own key ... a CMK will be rotated once per year."`,
                    `[compliance]: "When customers need to respond to their users' (data subjects') requests regarding their personal data rights ... Tencent Cloud is obligated to provide necessary technical support"`,
                    `[compliance]: "Customer content data will not be transferred outside the customer's chosen Tencent Cloud region without their consent."`,
                    `[compliance multi-tenant]: "Virtualization Layer · Network layer (VPC) · Cloud Database Layer · Object storage"`,
                    `[support-plan / Enterprise]: "Designated Technical Account Manager · Free on-site service (up to 3 person-days/year)"`,
                    `[公众号腾讯云出海服务 2025-05-28 天御]: "面对欧盟GDPR、东南亚数据本地化存储等43项新增合规要求 ... 通过「AI动态风控+全球情报中枢」双引擎，实现支付欺诈拦截率99.5%与合规适配效率提升70%"`,
                    `[公众号腾讯云出海服务 2025-09-26 广汽]: "腾讯云还提供了全面的合规咨询服务，帮助广汽设计出以区域合规至高点辐射周边国家、一套环境服务整个区域的合规架构"`,
                  ],
                  reasoning: `v2 在 v1 七服务基础上加入第 8 项天御海外交易风控（覆盖 43 项海外合规、99.5% 拦截率、+70% 适配效率），并把广汽 SEA 区域合规架构写入第 7 项作为合规咨询已交付能力的实证；第 3 项把 Tencent 法律团队公开发声（GDPR / SCC / 训练数据 / 水印）作为 Privacy Whitepaper / DSAR 的运营锚点。区域数从 v1 的 26 区域调整为"20+ 区域"中性表述以避免与 q1_1 的 22 区域口径冲突。`,
                  decision: `八服务列表 + 每项有公开来源；天御 + 广汽合规架构是 v2 加深的两条实证。`,
                },
              },
            ],
          },
        ],
      },
    ],
  },

  // ====== VI. Vertical ======
  {
    id: "s6",
    index: "VI",
    title: "Global Vertical Solution Capabilities · 全球垂直行业方案",
    description: "深入特定行业业务逻辑，提供开箱即用的场景化方案矩阵。",
    descriptionEn: "Deep integration into specific industry business logic, delivering a matrix of out-of-the-box scenario-based solutions.",
    questions: [
      {
        id: "q6_1",
        title: "6.1 Industry-specific solutions · 行业方案",
        promptEn: `Which industry-specific solutions do you offer? (Check and specify)
- E-commerce: [ ] Localized payments [ ] Multilingual support [ ] Others: ________
- Gaming: [ ] Low-latency architecture [ ] Localized operations [ ] Others: ________
- Finance: [ ] Compliance risk control [ ] Cross-border payments [ ] Others: ________`,
        promptZh: `贵司在以下行业提供哪些场景化解决方案？（请勾选并补充说明）
- 电商出海：□ 本地化支付 □ 多语言支持 □ 请补充：________
- 游戏出海：□ 低延迟架构 □ 本地化运营 □ 请补充：________
- 金融出海：□ 合规风控 □ 跨境支付 □ 请补充：________`,
        status: "verified",
        groups: [
          {
            layout: "industry",
            industryName: "E-commerce overseas · 电商出海",
            fields: [
              {
                id: "s6_ec",
                kind: "checks",
                label: "电商出海能力",
                status: "verified",
                options: [
                  { value: "local_pay", label: "本地化支付" },
                  { value: "multi_lang", label: "多语言支持" },
                ],
                defaultValue: ["local_pay", "multi_lang"],
                otherFieldId: "s6_ec_other",
              },
              {
                id: "s6_ec_other",
                kind: "text",
                label: "电商补充",
                status: "verified",
                rows: 5,
                defaultValue: `腾讯云面向跨境电商以 EdgeOne 全球边缘为底座，覆盖 3,200+ 边缘节点与 200+ Tbps 储备带宽，通过边缘函数与规则引擎按地理位置路由不同语言的站点路径，叠加 DDoS 防护、WAF、Bot 管理、API 安全、反账号劫持、反假单与反爬虫等一体化边缘安全能力，应对促销期间流量高峰与欺诈风险；动静态分离加速、边缘图像处理与 GEO 感知数据路由进一步压缩访问延迟并满足本地数据合规。多语言层面，混元开源翻译模型已支持 30+ 语种，配合腾讯云 GME 实时语音 120 语种转写、生态伙伴合合信息 INTSIG Docflow 52 语种识别，能够覆盖跨境店铺与客服的语言场景。

最具代表性的合作是 2026 年 1 月 30 日与萨摩耶旗下稳卖科技达成的战略合作。稳卖 AI 浏览器后台基于腾讯云 Lighthouse、Serverless 容器、TDSQL-C MySQL、EdgeOne、混元大模型与智能体开发平台 ADP 构建：海外站点首页加载延迟由 10 秒压缩至 3 秒、整体访问延时降低 60%，IT 成本较传统云下降 30% 以上；联合方案上线后，AI 工具调用量提升 8-12 倍，单 SKU 内容生产由 3 小时压缩至 5 分钟以内（35 倍）、选品分析由 8 小时缩短至 30 分钟以内（15 倍）、图片视频素材生产由 3-5 天压缩至数十分钟（约 200 倍效率提升），覆盖 95%+ 的跨境运营动作端到端自动化，已服务数百家跨境商家。Super App as a Service（TCSAS）已被亚太、中东与美洲海外企业广泛采用，提供同代码多平台的小程序生态、容器、安全与多商户开放能力。

本地支付层面如实定位：腾讯云国际站未将本地支付列为独立产品 SKU，跨境支付能力来自两条互补路径——一是腾讯集团生态（Weixin Pay、WeChat Pay HK、TenPay Global）在 2025 香港金融科技周展示的跨境支付创新；二是腾讯云作为底座赋能的支付 ISV 伙伴，例如威富通基于腾讯云弹性计算、数据库与支付能力，为中银香港、中东 Tiqmo 等 200+ 海外金融机构提供支付与数字钱包服务，日均处理超 4,000 万笔交易。生态伙伴矩阵还包括钛动科技 Navos AI 营销智能体、万店掌全球门店统一运营、紫讯 LinkFox 跨境电商 Agent（新品调研由 2-3 天压缩至 10 分钟）、PartnerBoost 海外红人联盟营销、时代涌现 AIGC 数字员工等，形成"平台 + ISV + 渠道 + 本地合规伙伴"的电商出海闭环。`,
                defaultValueEn: `For cross-border e-commerce, Tencent Cloud anchors on EdgeOne — 3,200+ edge nodes and 200+ Tbps reserve bandwidth — with edge functions and a rule engine that route users to language-specific website paths by geography, plus an integrated edge security stack (DDoS, WAF, bot management, API security, anti-account-hijack, anti-fake-order, anti-scraping) that absorbs promotion-period traffic surges and fraud. Static and dynamic acceleration, edge image processing, and GEO-aware data routing further compress access latency and meet local data-protection requirements. On multilingual capability, the open-sourced Hunyuan translation model covers 30+ languages, GME provides real-time speech-to-text in 120 languages, and the partner stack adds INTSIG Docflow at 52 languages, covering both storefront and customer-service language needs.

The strongest reference is the strategic partnership with Wenmai (Samoyed group) signed on 30 January 2026. The Wenmai AI Browser back end is built fully on Tencent Cloud — Lighthouse, Serverless Container, TDSQL-C MySQL, EdgeOne, the Hunyuan large model, and the Agent Development Platform (ADP). Overseas storefront first-page load latency dropped from 10s to 3s and overall access latency by 60%, with IT cost reduced by more than 30% versus traditional cloud. After joint go-live, AI tool-call volume rose 8 to 12x; per-SKU listing-content production was compressed from over 3 hours to under 5 minutes (35x), per-SKU selection research from over 8 hours to under 30 minutes (15x), and per-SKU image and video asset production from 3 to 5 days down to tens of minutes (about 200x), with more than 95% of cross-border seller actions now end-to-end automatable. The platform serves hundreds of cross-border merchants. The Super App as a Service (TCSAS) suite has been adopted by enterprises in Asia Pacific, the Middle East, and the Americas, providing a same-code-multi-platform mini-program runtime, container, security, and a multi-merchant open ecosystem.

On local payment we frame the capability honestly: Tencent Cloud International does not publish local payment as a standalone product SKU. Cross-border payment is delivered through two complementary paths. First, the Tencent Group ecosystem — Weixin Pay, WeChat Pay HK, and TenPay Global — showcased its cross-border payment innovations at Hong Kong FinTech Week 2025. Second, payment ISVs run on Tencent Cloud as their infrastructure backbone: Sunline / Wifitone (威富通) builds on Tencent Cloud elastic compute, databases, and payment capabilities to serve more than 200 overseas financial institutions including BOC HK and Tiqmo in the Middle East, processing over 40 million transactions per day. The wider partner network covers TiDong (LinkFox / Navos AI marketing agent), Wandian (offline-retail global ops), Zixun LinkFox (cross-border e-commerce agent — new-product research compressed from 2-3 days to 10 minutes), PartnerBoost (overseas-KOL affiliate marketing), and Shidai Yongxian (AIGC digital workforce), forming a "platform + ISV + channel + local-compliance partner" closed loop for e-commerce going global.`,
                reasoning: {
                  sources: [
                    src("https://www.tencentcloud.com/solutions/ecommerce", "tencentcloud.com/solutions/ecommerce"),
                    src("https://www.tencent.com/en-us/articles/2202183.html", "GDES press release (2025-09-16)"),
                    src("https://www.tencentcloud.com/products/tcsas", "TCSAS Super App as a Service"),
                    src("https://mp.weixin.qq.com/s/Q6LOj-ig4XW_sp0PKqHVSg", "公众号腾讯云出海服务 2026-01-30 (稳卖 AI 浏览器战略合作)"),
                    src("https://mp.weixin.qq.com/s/j8vusknh7x0vBPpsTbxq7Q", "公众号腾讯云出海服务 2025-12-01 (威富通 + 钛动 + 万店掌)"),
                    src("https://mp.weixin.qq.com/s/6Ug6YL0F3mPJdOPQmdxAFQ", "公众号腾讯云出海服务 2026-03-31 (紫讯 / PartnerBoost / 合合 / 时代涌现)"),
                  ],
                  quotes: [
                    `[ecommerce]: "EdgeOne has over 3,200 edge nodes globally and more than 200Tbps of bandwidth resources."`,
                    `[ecommerce]: "EdgeOne provides integrated security capabilities at the edge, including DDoS protection, WAF, bot management, and API security."`,
                    `[GDES]: "translation model supporting over 30 languages"; "Tencent Cloud products like the Superapp-as-a-Service solution and PalmAI have been widely embraced by overseas enterprises"`,
                    `[公众号腾讯云出海服务 2026-01-30 稳卖]: "首页加载延迟由 10 秒压缩至 3 秒、整体访问延时降低 60% ... 单 SKU 图片及视频素材的生产耗时由原来的 3-5 天压缩至数十分钟以内，实现超200倍的效率提升"`,
                    `[公众号腾讯云出海服务 2025-12-01 威富通]: "威富通为中银香港、中东Tiqmo等200多家海外金融机构提供支付与数字钱包服务，日均处理超4000万笔交易"`,
                    `[公众号腾讯云出海服务 2026-03-31 合合 / 紫讯]: 合合 INTSIG Docflow 52 语言, 6x 提效; 紫讯 LinkFox Agent 新品调研由 2-3 天到 10 分钟。`,
                  ],
                  reasoning: `v2 加入稳卖战略合作（35x / 15x / 200x 量化）+ 跨境支付 ISV 伙伴威富通（200 FIs / 40M/日）+ 生态伙伴矩阵（钛动 / 万店掌 / 紫讯 / PartnerBoost / 合合 / 时代涌现）。multi_lang 与 local_pay 两个选项保留勾选；local_pay 诚实定位为"两条互补路径"（腾讯集团生态 + Tencent Cloud 赋能 ISV）。`,
                  decision: `两选项保留勾选；其他文本按 EdgeOne 底座 / 稳卖战略合作 / 本地支付诚实定位 / 生态伙伴矩阵四段铺陈。`,
                },
              },
            ],
          },
          {
            layout: "industry",
            industryName: "Gaming overseas · 游戏出海",
            fields: [
              {
                id: "s6_gm",
                kind: "checks",
                label: "游戏出海能力",
                status: "verified",
                options: [
                  { value: "low_latency", label: "低延迟架构" },
                  { value: "local_ops", label: "本地化运营" },
                ],
                defaultValue: ["low_latency", "local_ops"],
                otherFieldId: "s6_gm_other",
              },
              {
                id: "s6_gm_other",
                kind: "text",
                label: "游戏补充（核心差异化）",
                status: "verified",
                rows: 9,
                defaultValue: `游戏是腾讯云在出海行业中最厚的牌：艾瑞 2025 中国游戏云技术综合排名第一，IDC 中国游戏云市场用量规模连续多期第一、收入增速 Top3 第一，并被 Omdia 评为 2025 全球游戏云平台 Leader 象限（中国唯一），在游戏服务器、多人游戏服务、人工智能与机器学习三个维度均获最高 Advanced 评级。腾讯云已服务 95% 以上的中国头部出海游戏厂商，客户名单包括库洛、创梦天地、西山居、莉莉丝、完美世界、巨人网络，以及 PUBG MOBILE（全球下载 10 亿+）、Honor of Kings、Clash Royale（Supercell）、Kabam、Habby、NetMarble、《Love and Deepspace》《Ragnarok Online 3》《Lucky Defense》等海外发行作品。

低延迟侧，腾讯云在全球自建 22 地域 64 可用区，配 200+ 优质 BGP、3,200 CDN 节点、200 Tbps 储备带宽；EdgeOne 游戏场景覆盖 70+ 区域、3,200+ PoP、最高 15 Tbps 全球 DDoS 防御；GAAP 与 AIA 针对跨境延迟、丢包、抖动做专项优化，统一域名就近接入解决全球同服与公平对战；GME / GVoice 在 50% 丢包、1000ms 抖动条件下仍可平滑通话，全球 2,800+ 加速节点 + 顶级 20 线 BGP，覆盖 70+ 国家与地区六大洲。本地运营侧，分布式部署（MMO）与集中式部署（沙盒/SLG）两套参考架构均在国际站文档公开，对战服务器托管按量计费节省 35% 算力成本，配套 1v1 资深架构师团队、24×7 60 秒响应、后付费不限带宽与试用专项资金；运营触点上拥有雅加达、马尼拉、吉隆坡、新加坡、曼谷、东京、首尔、帕罗奥图、法兰克福 9 大海外技术支持中心，以及 11 区域办公室与 100+ 全球技术支持触点。

代表性出海案例：库洛《鸣潮》全球六大区域分钟级服务器部署、3,200 万预约用户的弹性扩缩容与智能流量调度顺利首发；巨人网络《太空杀》接入混元 Turbo S，2 亿注册玩家与超 700 万独立逻辑链条 AI 智能体同台对局，单月生成近 90 万对局；《重返未来：1999》首发 EdgeOne 实时语音 + ACE 反外挂保障登顶 iOS 免费榜首；《Honor of Kings》进入巴西市场用 EdgeOne 构建本地加速网络；创梦天地《卡拉彼丘》引入 CodeBuddy AI 代码助手实现研发效率 +10%，公测首日同时登顶 iOS 与 Android 榜单。配套能力还有 ACE 反作弊（累计 7 亿+ 玩家、数百款游戏、2-3 API 接入）、TcaplusDB 游戏分布式 NoSQL（PB 级，承载王者荣耀与和平精英）、混元 3D 与混元游戏视觉生成平台（美术资产数十倍提速）、EdgeOne 边缘 AI（0.5ms 冷启动、恶意流量 80% 降至 0.2%），以及 GME 在 PlayStation 与 Nintendo Switch 第三方开发工具与中间件名录中作为中国唯一语音 SDK 的多平台资质。`,
                defaultValueEn: `Gaming is Tencent Cloud's deepest vertical for going global. iResearch's 2025 China Game Cloud Technology report ranks Tencent Cloud first overall; IDC's 2025 H1 China game-cloud market study places Tencent Cloud first in usage scale for multiple consecutive periods and first in revenue growth among the top three; and Omdia's "Market Radar: Cloud Platforms for Games – 2025" placed Tencent Cloud in the global Leader quadrant — the only Chinese cloud vendor — with the highest "Advanced" rating across game servers, multi-player services, and AI & ML. Tencent Cloud serves more than 95% of leading Chinese game studios going global, including Kuro Games, iDreamSky, Seasun, Lilith, Perfect World, and Giant Network, alongside international blockbusters such as PUBG MOBILE (1B+ global downloads), Honor of Kings, Clash Royale (Supercell), Kabam titles, Habby's Archero, NetMarble, Love and Deepspace, Ragnarok Online 3, and Lucky Defense.

On low-latency, Tencent Cloud operates self-built data centers in 64 availability zones across 22 regions worldwide, with 200+ premium BGP networks, 3,200 CDN nodes, and 200 Tbps of reserved bandwidth. EdgeOne for gaming covers 70+ regions and 3,200+ PoPs with up to 15 Tbps of global DDoS-mitigation capacity. AIA (Anycast Internet Acceleration) and GAAP (Global Application Acceleration) target cross-border latency, packet loss, and jitter, with unified-domain nearest-edge access for fair global play. GME / GVoice maintains smooth voice under 50% packet loss and 1000ms jitter across 2,800+ acceleration nodes and a top-20-line BGP, covering 70+ countries on six continents. On local operations, two reference architectures are publicly documented — distributed deployment for MMO and centralised deployment for sandbox or SLG — and battle-server hosting saves 35% of compute cost versus self-managed; senior solution architects, 24x7 service with response within 60 seconds, post-paid uncapped bandwidth, and free-test funds round out the offer. Operationally, Tencent Cloud has nine overseas technical-support centres in Jakarta, Manila, Kuala Lumpur, Singapore, Bangkok, Tokyo, Seoul, Palo Alto, and Frankfurt, plus 11 regional offices and more than 100 global technical-support touchpoints.

Anchor cases: Kuro Games' Wuthering Waves achieved minute-level server deployment across six global regions for launch, with elastic scaling and intelligent traffic scheduling supporting 32 million pre-registered users; Giant Network's Among Us derivative integrated Hunyuan Turbo S so that 200 million registered players play alongside more than 7 million AI agents with independent reasoning chains, generating nearly 900,000 AI matches in the first month; Reverse: 1999 used EdgeOne for real-time voice and combat-command synchronisation plus ACE for anti-cheat on launch day, taking the iOS Free top spot; Honor of Kings' Brazil expansion built a local-acceleration network on EdgeOne for stable login, payment, and social experience; iDreamSky's Strinova introduced the CodeBuddy AI code assistant for over 10% R&D-efficiency gains and topped both iOS Free and Android charts on day one of open beta. Supporting capability includes ACE anti-cheat (700M+ players cumulatively, hundreds of titles, 2-3 API integration), TcaplusDB (PB-level distributed NoSQL purpose-built for games, powering King of Glory and Peace Elite), the Hunyuan 3D series and Hunyuan Game Visual Generation Platform (tens of times faster art-asset production), EdgeOne edge AI (0.5ms cold start, malicious traffic reduced from 80% to 0.2% in real time), and GME's status as the only China-developed voice SDK listed in the PlayStation and Nintendo Switch third-party tool and middleware catalogues, with full PS5/PS4/Xbox/Switch/macOS/Windows/iOS/Android coverage.`,
                reasoning: {
                  sources: [
                    src("https://www.tencentcloud.com/solutions/game", "Gaming Solution 页"),
                    src("https://www.tencentcloud.com/dynamic/news-details/101021", "GDC 2026 GMES/GVoice (2026-03-10)"),
                    src("https://www.tencent.com/en-us/articles/2202183.html", "GDES press release (2025-09-16, 95% 头部)"),
                    src("https://mp.weixin.qq.com/s/qsZ55Y539QaaXxxaoALFdQ", "公众号腾讯云出海服务 2025-08-06 (Omdia 2025 Game Cloud Leader)"),
                    src("https://mp.weixin.qq.com/s/0FN0p99H8GrbNa3CdcAA1g", "公众号腾讯云出海服务 2025-02-18 (艾瑞 2025 第一)"),
                    src("https://mp.weixin.qq.com/s/8eCR3MvX10D9_LPpbYqIUQ", "公众号腾讯云出海服务 2025-10-29 (IDC + 卡拉彼丘 + 客户名单)"),
                    src("https://mp.weixin.qq.com/s/IB9kxJ6d8DpF6Tl7_IzuSg", "公众号腾讯云出海服务 2025-03-26 (鸣潮 + 重返未来 1999 + Honor of Kings 巴西)"),
                    src("https://mp.weixin.qq.com/s/8p3Em-3ow8C_U9YWGeOflg", "公众号腾讯云出海服务 2025-04-28 (太空杀 × Hunyuan Turbo S)"),
                  ],
                  quotes: [
                    `[公众号腾讯云出海服务 2025-08-06]: "腾讯云首次跻身「Leader」象限...拿到了最高等级「Advanced」的评价"`,
                    `[公众号腾讯云出海服务 2025-02-18]: "腾讯游戏云综合竞争力排名第一"`,
                    `[公众号腾讯云出海服务 2025-10-29]: "腾讯云已服务国内95%以上出海头部游戏公司，已成为包括创梦天地、库洛游戏、西山居、莉莉丝完美世界等众多知名厂商在内的首选合作伙伴"`,
                    `[公众号腾讯云出海服务 2025-03-26]: "库洛游戏《鸣潮》上线期间，腾讯云支撑其在全球六大区域实现分钟级服务器部署 ... 高达3200万的预约用户"; "《重返未来：1999》首发当天... 助力产品冲上iOS免费榜首位"; "《Honor of Kings》进军巴西市场过程中，腾讯云通过EdgeOne构建本地加速网络"`,
                    `[公众号腾讯云出海服务 2025-04-28]: "巨人网络旗下《太空杀》接入腾讯混元Turbo S大模型。2亿注册玩家，在线与超700万AI角色同台竞技... 仅上线一个月... 累计参与近90万场对局"`,
                    `[game]: "200 premium BGP networks, 3,200 CDN nodes, and 200 Tbps reserved bandwidth"; "EdgeOne ... 70+ regions ... 3200+ PoPs ... up to 15Tbps"; "GME ... 50% packet loss and 1000ms network jitter"; "ACE ... 24/7 ... 700 million players"; "battle server hosting ... saving 35%"`,
                  ],
                  reasoning: `游戏方向 v2 用艾瑞 / IDC / Omdia 三家分析师认证锚定行业头部地位（特别是 Omdia 游戏云 Leader + 三项 Advanced，对 Omdia RFI 是最强信号）。客户阵容深化（创梦 / 库洛 / 西山居 / 莉莉丝 / 完美世界 / 巨人）+ 5 个海外发行案例（鸣潮 / 太空杀 / 重返未来 1999 / Honor of Kings 巴西 / 卡拉彼丘）。低延迟与本地运营硬指标全部保留。`,
                  decision: `两选项保留勾选；其他文本按"分析师锚定 + 低延迟与本地运营 + 5 个出海案例"三段铺陈，硬指标全可 sourceable。`,
                },
              },
            ],
          },
          {
            layout: "industry",
            industryName: "Finance overseas · 金融出海",
            fields: [
              {
                id: "s6_fin",
                kind: "checks",
                label: "金融出海能力",
                status: "verified",
                options: [
                  { value: "risk", label: "合规风控" },
                  { value: "cross_border", label: "跨境支付" },
                ],
                defaultValue: ["risk", "cross_border"],
                otherFieldId: "s6_fin_other",
              },
              {
                id: "s6_fin_other",
                kind: "text",
                label: "金融补充",
                status: "verified",
                rows: 7,
                defaultValue: `腾讯云国际金融客户已覆盖 20 个国家与地区、超 10,000 家金融客户、近 400 家海外客户，过去 3 年保持高双位数同比增长。底层栈以 TDSQL 金融级强一致、分布式横向扩展与跨地域容灾为核心，搭配 CDC / CDZ / TCE 基础设施、WAF / Anti-DDoS / CWP / KMS 安全、TSF / API Gateway / TKE 微服务、人脸识别 / OCR / 腾讯云 TI 平台 AI、移动金融通道与 TBDS 业务数据栈，构成完整金融云解决方案矩阵。

风控侧，腾讯云天御于 2025 年 5 月 28 日发布海外交易风控解决方案，以"AI 动态风控 + 全球情报中枢"双引擎为核心，由智能人机验证、设备安全识别、分层分级筛查三层防护构成，黑灰产识别准确率 99.5%，合规适配效率提升 70%。落地成果上，某自营电商接入 4 个月内欺诈率由 0.9% 降至 0.25%、支付成功率由 85% 提升至 89%；某跨境电商在介入后 3 个月内将拒付率由 1%+ 降至 0.25% 以下，拦截团伙攻击 10+ 次、欺诈交易 2,000+ 笔，规避损失超 8 万美元。eKYC 人脸识别方案与 AI x Identity 反深度伪造能力在 2025 年香港金融科技周面向金融机构演示。

跨境侧采用诚实定位：腾讯云不直接以本地支付作为产品 SKU，而是通过两条路径覆盖客户场景。一是腾讯集团生态，Weixin Pay、WeChat Pay HK、TenPay Global 在 2025 香港金融科技周展示跨境支付创新；二是腾讯云作为基础设施赋能的金融 ISV 伙伴，威富通基于腾讯云为中银香港、中东 Tiqmo 等 200+ 海外金融机构提供支付与数字钱包服务，日均处理超 4,000 万笔交易。最具代表性的跨境出海客户是土耳其金融科技公司 iyzico——腾讯云为其在欧洲构建首个云业务平台，基于高可用合规架构支撑虚拟支付方案在欧盟范围拓展，目前稳定承载 18.5 万+ 商户的交易处理。香港客户阵容上，腾讯云与富途证券、富融银行、天星银行、AIA、中银香港深度合作（Fusion Bank 15 小时完成下一代核心银行系统迁移、Airstar Bank 全面上云）；这部分属于客户侧合规背书，平台层面腾讯云不主张香港金融行业专项资质，平台级合规由 OSPAR（新加坡 ABS / MAS 对齐）、MTCS L3、KISMS、ISO 27701（全球首张云）、CISPE（欧洲）、PCI DSS L1、SOC1/2/3、CSA STAR 金牌等国际标准支撑。`,
                defaultValueEn: `Tencent Cloud International serves more than 10,000 financial customers across 20 countries and regions, with nearly 400 overseas clients and high-double-digit annual growth over the past three years. The technology stack centres on TDSQL — finance-grade strong consistency, distributed horizontal scalability, and cross-region disaster recovery — combined with CDC / CDZ / TCE infrastructure, the WAF / Anti-DDoS / CWP / KMS security suite, the TSF / API Gateway / TKE microservice stack, the AI suite (Face Recognition, OCR, Tencent Cloud TI Platform), the Mobile Financial Channel, and the TBDS business-data platform.

For risk, Tencent Cloud Tianyu (天御) released its overseas-transaction risk-control solution on 28 May 2025, built on a dual engine of "AI-driven dynamic risk control + global threat intelligence" with three layers of defence: intelligent human-machine verification, device-security identification, and tiered screening. The solution achieves a 99.5% interception rate against fraud and a 70% improvement in compliance-adaptation efficiency. In production, one direct-to-consumer e-commerce customer cut its fraud rate from 0.9% to 0.25% and lifted payment success from 85% to 89% within four months; a cross-border e-commerce customer reduced its chargeback rate from over 1% to under 0.25% in three months, intercepting more than ten organised attacks and over 2,000 fraudulent transactions and avoiding more than US$80,000 in losses. The eKYC face-recognition solution and an AI x Identity panel on deepfake and digital-identity risk were demonstrated to financial institutions at Hong Kong FinTech Week 2025.

On cross-border, the framing is honest. Tencent Cloud does not market local payment as its own product SKU; instead, customer needs are covered through two paths. First, the Tencent Group ecosystem — Weixin Pay, WeChat Pay HK, and TenPay Global — showcased cross-border payment innovations at Hong Kong FinTech Week 2025. Second, financial ISVs build on Tencent Cloud as their infrastructure: Wifitone (威富通) on Tencent Cloud serves more than 200 overseas financial institutions including BOC HK and Tiqmo in the Middle East, processing over 40 million transactions per day. The strongest cross-border-fintech reference customer is iyzico in Türkiye — Tencent Cloud built its first European cloud-business platform, supporting expansion of its virtual-payment solution across the EU on a high-availability, compliance-grade architecture that today supports more than 185,000 merchants. The Hong Kong customer roster includes Futu Securities, Fusion Bank, Airstar Bank, AIA, and BOC (HK), with Fusion Bank completing a next-generation core-banking migration in 15 hours and Airstar Bank moving fully to cloud operations; this is customer-side regulatory exposure, and Tencent Cloud does not claim a Hong Kong financial-industry certification at the platform level. Platform-level compliance is covered by OSPAR (Singapore ABS, MAS-aligned), MTCS Level 3, KISMS, ISO 27701 (world-first cloud), CISPE (Europe), PCI DSS Level 1, SOC 1/2/3, and CSA STAR Gold.`,
                reasoning: {
                  sources: [
                    src("https://www.tencentcloud.com/solutions/finance", "tencentcloud.com/solutions/finance"),
                    src("https://www.tencentcloud.com/dynamic/news-details/100845", "HK FinTech Week 2025-11-04 release"),
                    src("https://mp.weixin.qq.com/s/PuFpbEYbnvGzB1DZI4KZHw", "公众号腾讯云出海服务 2025-05-28 (天御海外交易风控)"),
                    src("https://mp.weixin.qq.com/s/hUUB6qnIP_OZMw8FxqBr_A", "公众号腾讯云 2026-03-03 (iyzico 18.5 万商户)"),
                    src("https://mp.weixin.qq.com/s/j8vusknh7x0vBPpsTbxq7Q", "公众号腾讯云出海服务 2025-12-01 (威富通)"),
                    src("https://www.tencentcloud.com/services/compliance-program", "Compliance Program (平台级合规)"),
                  ],
                  quotes: [
                    `[finance]: TDSQL — financial-grade strong consistency, distributed scaling, multi-region DR; financial risk management 场景。`,
                    `[news-details/100845]: HK 客户阵容 — Futu Securities、Fusion Bank、Airstar Bank、AIA、BOC (HK)；Fusion Bank 15 小时核心银行系统迁移。`,
                    `[公众号腾讯云出海服务 2025-05-28 天御]: "通过「AI动态风控+全球情报中枢」双引擎，实现支付欺诈拦截率99.5%与合规适配效率提升70%"`,
                    `[公众号腾讯云出海服务 2025-05-28 天御客户成果]: 自营电商欺诈率 0.9%→0.25% / 跨境电商拒付率 1%+→<0.25%, 2000+ 笔欺诈, $80k+ 规避。`,
                    `[公众号腾讯云 2026-03-03 iyzico]: "腾讯云为土耳其金融科技公司 iyzico 在欧洲构建首个云业务平台 ... 目前稳定承载超过 18.5 万家商户的交易处理"`,
                    `[公众号腾讯云出海服务 2025-12-01 威富通]: "威富通为中银香港、中东Tiqmo等200多家海外金融机构提供支付与数字钱包服务，日均处理超4000万笔交易"`,
                    `[compliance-program]: 平台级合规 OSPAR / MTCS L3 / KISMS / ISO 27701 / CISPE / PCI DSS L1 / SOC1-2-3 / CSA STAR 金牌。`,
                  ],
                  reasoning: `v2 加深三段：风控（天御 99.5% / +70% / 三层防护 + 客户成果量化）+ 跨境（iyzico 18.5 万商户欧洲 + 威富通 200 FIs / 4000 万笔日处理 + 集团生态）+ HK 客户阵容（Futu / Fusion Bank / Airstar / AIA / BOC HK）+ 平台级合规清单。HK 平台级金融 cert 诚实声明不主张，仅列国际标准 cert。`,
                  decision: `两选项保留勾选；其他文本按规模 + 风控 / 跨境 / 合规三段铺陈；HK 平台 cert 诚实声明不主张。`,
                },
              },
            ],
          },
        ],
      },
      {
        id: "q6_2",
        title: "6.2 Out-of-the-box industry solution · 开箱即用行业方案",
        zhHint: "业务场景 / 核心功能 / 客户收益",
        promptEn: `Describe one "out-of-the-box" industry solution (scenario, core features, client benefits).`,
        promptZh: `请描述一个"开箱即用"的行业解决方案（包含：业务场景、核心功能、客户收益）`,
        status: "verified",
        groups: [
          {
            fields: [
              {
                id: "s6_solution",
                kind: "text",
                label: "开箱即用方案",
                status: "verified",
                rows: 18,
                defaultValue: `腾讯云游戏解决方案（Tencent Cloud Gaming Solution）

业务场景

中国游戏厂商出海面临三重挑战：海外网络环境复杂、需在跨区域提供低延迟稳定连接；上线与版本期高并发与突发流量需弹性伸缩；DDoS、外挂、跨境支付与社交合规等运营风险显著。腾讯云游戏解决方案面向出海游戏开发与运营全生命周期，从基础设施、网络加速、安全防护、游戏数据层到游戏内社交（IM 与语音）整套打包，开箱即用，适用于 MMORPG、FPS/MOBA、SLG、休闲竞技等主流类型，覆盖分布式与中心化两种部署架构。GDC 2025 期间，国际研究机构 Omdia 在《市场追踪：2025 亚太及大洋洲游戏云平台》报告中将腾讯云列入"领导者"象限（与 AWS、Microsoft、Google 同列），并在游戏服务器、多玩家服务、区域覆盖范围三项给出最高等级 Advanced 评级；IDC《中国游戏云市场跟踪研究 2024H2》同期评定腾讯游戏云用量规模连续四年全国第一、收入增速在国内头部云厂商中连续两年第一。腾讯云目前承载 95% 中国头部游戏公司的全球化部署，三七互娱、心动网络、乐元素、库洛游戏、冰川网络等均已选用。

核心功能（开箱即用打包）

1. 全球弹性基础设施：22 个地区、64 个可用区、3200+ 全球加速节点、400T 带宽储备。CVM 提供多人服务器/匹配/后端服务的高性能算力；Lighthouse 提供开箱即用的轻量级云服务器；COS 提供 11 个 9（99.999999999%）持久度的对象存储承载游戏资源、补丁与 UGC；CLB 提供四层/七层负载均衡与抗 SYN Flood/DDoS 能力；AIA（Anycast 互联网加速）通过 Anycast EIP 引导玩家就近接入，降低跨境时延、丢包与抖动。

2. EdgeOne 一体化边缘安全与加速：单平台提供静态/动态加速、Layer4 TCP/UDP 加速、DDoS 与 CC 防护、Web 防护、Bot 管理；全球 70+ 区域、3200+ PoP、200 Tbps 储备带宽、最高 15 Tbps 全球防御容量。

3. GME（Game Multimedia Engine）游戏内实时语音：一站式游戏语音方案，覆盖语音聊天、语音消息、语音转文字（120 种语言）；50% 丢包与 1000ms 抖动下仍可流畅通话；支持 3D 空间音效（HRTF + 距离 EQ 补偿）；唯一进入 PlayStation 与 Nintendo Switch 第三方开发工具列表的中国语音工具，兼容 PS5/PS4/Xbox/Switch 与 macOS/Windows/iOS/Android 全平台。

4. Chat（即时通讯 IM）游戏内社交：提供大厅、组队、全服等多种聊天室类型，支持用户资料与关系链；节点遍布亚太、北美、欧洲、中东、非洲、拉美，就近接入。

5. ACE（Anti-Cheat Expert）反外挂：腾讯云移动安全团队与游戏安全团队联合产品，2-3 个 API 即可集成；7×24 小时多维度防护，已为含《王者荣耀》《火影忍者》等百余款游戏的 7 亿+ 玩家提供安全服务；同时承担 AI/UGC 内容审核、多语言适配与地域合规职责，支撑出海上线。

6. 游戏专用数据层：TcaplusDB 分布式 NoSQL 数据库（PB 级游戏数据存储）+ Tendis（兼容 Redis 协议的混合存储版，承载运营活动高并发缓存），均已应用于《王者荣耀》《和平精英》等头部产品。

7. GAAP（Global Application Acceleration Platform）全球应用加速：支持多区域统一域名接入，通过智能路由与高速隧道实现"全球一服"，保障跨区域玩家公平竞技体验。

8. 战斗服托管（Battle-Server Hosting）：托管战斗房间分配与销毁逻辑，按量计费，相比自建可节省 35% 战斗服算力成本。

可选 AI 增强：GiiNEX 游戏 AI 引擎覆盖游戏宣发、游戏内容生成与 UGC 多个环节；混元大模型（含 Hunyuan-large-role 角色扮演专用模型与 Turbo S 快思考模型）+ 向量数据库 + ACE 可组合为"智能 NPC"方案，已在 BUD（碧优蒂的世界）AI 赛季中规模化落地。

客户收益（公开案例）

- PUBG Mobile：依托腾讯云全球部署、加速与安全防护实现"全球一服"，全球玩家共享流畅、公平的竞技体验。
- Clash Royale：通过 GAAP 让全球玩家以最低延迟直连位于美国的源服务器。
- Habby（Archero）：使用 Chat 提供文本/表情/自定义消息等多类型游戏内消息能力；该游戏曾在 46 个国家/地区的 App Store 下载榜进入前 10。
- Dark and Darker：集成 GME 一体化语音 SDK 与 3D 空间音效，玩家可感知队友方位，沉浸感显著提升。
- Kabam：通过 GAAP 高速通道为全球玩家提供稳定接入体验。
- 库洛游戏《鸣潮》：上线期间在全球六大区域实现分钟级服务器部署，弹性扩缩容与智能流量调度承载 3200 万预约用户平稳开服。
- 《重返未来：1999》：通过 EdgeOne 加速实时语音与战斗指令同步，搭配 ACE 防御外挂与脚本攻击，首发当天登顶 iOS 免费榜。
- 《Honor of Kings》巴西市场：通过 EdgeOne 构建本地加速网络，应对 LATAM 网络复杂与时延不稳，玩家在登录、支付、社交互动等关键路径获得稳定体验。
- BUD（碧优蒂的世界）：基于混元大模型 + 向量数据库 + ACE 打造"智能生命体"NPC 体验，并由 ACE 提供内容审核、多语言适配与地域合规支持，覆盖多个海外国家与地区。
- 量化收益：战斗服托管帮助厂商节省 35% 战斗服算力成本。
- 行业渗透：腾讯云已支持 95% 中国头部游戏公司的全球化布局；三七互娱、心动网络、乐元素、库洛游戏、冰川网络等均为公开客户。`,
                defaultValueEn: `Tencent Cloud Gaming Solution

Scenario

Chinese game studios going global face complex overseas networks, bursty concurrency at launch and patch windows, and elevated risk from DDoS, cheating, cross-border payment, and in-game social compliance. The Tencent Cloud Gaming Solution is a packaged, out-of-the-box bundle covering the full game lifecycle from development to operations: global infrastructure, network acceleration, security, game data layer, in-game messaging and voice. It supports MMORPG, FPS/MOBA, SLG and casual-competitive titles, and ships with two reference deployment patterns (distributed and centralized). At GDC 2025, Omdia named Tencent Cloud a Leader in its Asia Pacific and Oceania Game Cloud Platforms market tracker (alongside AWS, Microsoft and Google), with top-tier "Advanced" ratings on Game Servers, Multiplayer Services and Regional Coverage. IDC's China Game Cloud Market Tracker, 2024H2 ranks Tencent Game Cloud #1 in usage for the fourth consecutive year and #1 in revenue growth among top Chinese cloud vendors for the second consecutive year. 95% of leading Chinese gaming companies use Tencent Cloud to support their global expansion (Tencent GDES 2025); named customers include 37 Interactive Entertainment, X.D. Network, Happy Elements, Kuro Games and Ice Game.

Core features (bundled, out-of-the-box)

1. Resilient global infrastructure: 22 regions, 64 availability zones, 3,200+ global acceleration nodes and 400 Tbps reserved bandwidth. CVM for multiplayer servers, match logic and backend; Lighthouse for out-of-the-box lightweight cloud servers; COS for game assets, patches and UGC at 11-nines (99.999999999%) durability; CLB for L4/L7 load balancing with SYN-flood and DDoS protection; AIA (Anycast Internet Acceleration) routing players to the nearest entry point to cut cross-border latency, packet loss and jitter.

2. EdgeOne all-in-one edge security and acceleration: static and dynamic acceleration, Layer-4 TCP/UDP acceleration, DDoS and CC protection, web protection, and bot management on a single platform. 70+ regions, 3,200+ PoPs, 200 Tbps reserved bandwidth, up to 15 Tbps global defense capacity.

3. GME (Game Multimedia Engine) for in-game voice: one-stop voice solution covering voice chat, voice messaging and speech-to-text in 120 languages; sustains smooth communication under more than 50% packet loss and 1000 ms network jitter; 3D positional audio (HRTF + distance-based EQ compensation); the only Chinese voice middleware listed on PlayStation and Nintendo Switch third-party tool lists, compatible with PS5, PS4, Xbox, Switch, macOS, Windows, iOS and Android.

4. Chat (instant messaging) for in-game social: lobby, team and full-server chat-room types, user profile and relationship-chain features; chat nodes deployed across Asia Pacific, North America, Europe, the Middle East, Africa and Latin America for nearest-node access.

5. ACE (Anti-Cheat Expert): jointly built by Tencent Cloud's mobile security team and Tencent's game security team; integrates via 2-3 client APIs; 24x7 multi-dimensional protection; protecting 700M+ players across hundreds of titles including Honor of Kings and Naruto Online. ACE also handles AI/UGC content moderation, multi-language adaptation and regional compliance to support overseas launches.

6. Game-specific data layer: TcaplusDB (distributed NoSQL, PB-scale game data) plus Tendis (Redis-protocol-compatible hybrid-storage cache for high-concurrency operational events); both proven on flagship titles such as Honor of Kings and Game for Peace.

7. GAAP (Global Application Acceleration Platform): unified domain across multiple regions with intelligent routing and high-speed tunnels, enabling a "global single-server" experience for cross-region competitive fairness.

8. Battle-server hosting: takes over game-room allocation and destruction logic, billed by volume, cutting battle-server compute cost by 35% versus self-built.

Optional AI add-ons: the GiiNEX game AI engine covers marketing, in-game content generation and UGC. Hunyuan large models (including the Hunyuan-large-role role-play model and Hunyuan Turbo S fast-thinking model), combined with vector databases and ACE, can be assembled into an "intelligent-NPC" stack, deployed at scale in BUD's AI Season.

Client benefits (named public references)

- PUBG Mobile: relies on Tencent Cloud's global rapid deployment, acceleration and security protection to deliver a unified, fair competitive experience worldwide.
- Clash Royale: uses GAAP so players in every region access the U.S. origin via intelligent routing and high-speed tunnels, minimising connection latency.
- Habby (Archero): adopts Chat for diverse in-game message types (text, emoji, custom); the title reached top-10 App Store downloads in 46 countries and regions.
- Dark and Darker: integrated GME's all-in-one voice SDK with 3D spatial audio, letting players perceive teammates' positions for an immersive voice experience.
- Kabam: uses GAAP's global high-speed connections to provide stable player experience regardless of player location.
- Wuthering Roar (Kuro Games): minute-level server deployment across six global regions at launch; elastic scaling and intelligent traffic scheduling supported 32 million pre-registered users for a stable global rollout.
- Reverse: 1999: used EdgeOne to accelerate real-time voice and battle-command synchronisation, with ACE defending against cheats and scripted attacks; the title reached #1 on the iOS free chart on launch day.
- Honor of Kings, Brazil expansion: Tencent Cloud built a local acceleration network on EdgeOne to handle complex LATAM networks and unstable latency, stabilising login, payment and social interactions for Brazilian players.
- BUD (Bondee-style social game): Hunyuan large models, vector databases and ACE deliver "living" AI NPCs, while ACE handles content moderation, multi-language adaptation and regional compliance, supporting BUD's launch across multiple overseas markets.
- Quantified outcome: battle-server hosting saves 35% of battle-server compute cost.
- Strategic footprint: 95% of leading Chinese gaming companies use Tencent Cloud for global expansion (Tencent GDES 2025); named customers include 37 Interactive Entertainment, X.D. Network, Happy Elements, Kuro Games and Ice Game.`,
                reasoning: {
                  sources: [
                    src("https://www.tencentcloud.com/solutions/game", "Gaming Solution 页（所有 bundle 硬指标）"),
                    src("https://www.tencentcloud.com/product/gme", "GME 产品页"),
                    src("https://www.tencentcloud.com/dynamic/news-details/101021", "GDC 2026 (2026-03-10)"),
                    src("https://www.tencent.com/en-us/articles/2202183.html", "GDES press release (2025-09-16)"),
                    src("https://mp.weixin.qq.com/s/IB9kxJ6d8DpF6Tl7_IzuSg", "公众号腾讯云出海服务 2025-03-26 (鸣潮 + 重返未来 + Honor of Kings 巴西 + Omdia Leader)"),
                    src("https://mp.weixin.qq.com/s/8eCR3MvX10D9_LPpbYqIUQ", "公众号腾讯云出海服务 2025-10-29 (IDC + 头部客户名单)"),
                    src("https://mp.weixin.qq.com/s/s854Ycuvm6hWlge4xh0ALg", "公众号腾讯云出海服务 2025-05-19 (BUD AI NPC)"),
                  ],
                  quotes: [
                    `[公众号腾讯云出海服务 2025-03-26]: "腾讯云被国际权威机构Omdia评为亚太及大洋洲地区「游戏云平台领导者」，和 AWS、Microsoft、Google一起，进入「Leader」象限"; "三项最高等级「Advanced」——游戏服务器、多玩家服务、区域覆盖范围"`,
                    `[公众号腾讯云出海服务 2025-04-11 IDC]: "用量规模，连续四年全国第一；收入增速，在国内头部云厂商中连续两年全国第一"`,
                    `[GDES]: "95% of leading Chinese gaming companies are also using Tencent Cloud"`,
                    `[公众号腾讯云出海服务 2025-03-26]: "库洛游戏《鸣潮》... 全球六大区域实现分钟级服务器部署 ... 3200万的预约用户"; "《重返未来：1999》首发当天... 助力产品冲上iOS免费榜首位"; "《Honor of Kings》进军巴西市场 ... 通过EdgeOne构建本地加速网络"`,
                    `[公众号腾讯云出海服务 2025-05-19 BUD]: "依托腾讯云「AI+云」产品能力（包括混元大模型、向量数据库、腾讯安全ACE等），打造「智能生命体」NPC角色"`,
                    `[game]: "200 premium BGP networks, 3,200 CDN nodes, and 200 Tbps reserved bandwidth"; "EdgeOne ... 70+ regions ... 3200+ PoPs ... up to 15Tbps"; "ACE ... over 700 million players"; "battle server hosting ... saving 35%"; "GAAP ... unified domain name for access in multiple regions"`,
                  ],
                  reasoning: `游戏解决方案是腾讯云相对其他超大规模云厂商最强差异化的开箱即用方案。v2 加入 Omdia 2025 APAC Leader（中国唯一 + 三项 Advanced）+ IDC 2024H2 用量第一 + 95% 头部三家分析师锚定，并补 5 个新海外发行案例（鸣潮 / 重返未来 / Honor of Kings 巴西 / 卡拉彼丘 / BUD）。8 段 bundle features + 可选 AI 增强（GiiNEX + Hunyuan AI NPC）+ 公开客户阵容齐全。`,
                  decision: `按"业务场景（含 Omdia + IDC + 95% 锚定）+ 8 段 bundle + 可选 AI 增强 + 9 个客户案例"组织；硬指标全 sourceable。`,
                },
              },
            ],
          },
        ],
      },
    ],
  },

  // ====== VII. Open ======
  {
    id: "s7",
    index: "VII",
    title: "Open Questions · 开放性问题",
    description: "战略 / 措辞类，AR 团队可基于素材自行组合。",
    descriptionEn: "Open-ended strategy questions: 12-month roadmap and self-assessed industry gap.",
    questions: [
      {
        id: "q7_1",
        title: "7.1 12-month capability roadmap · 未来 12 个月能力规划",
        promptEn: `What capabilities will you prioritize for "Chinese Enterprises Going Global" in the next 12 months?`,
        promptZh: `针对"中企出海"需求，贵司未来12个月将重点提升哪些能力？`,
        status: "strategic",
        groups: [
          {
            fields: [
              {
                id: "s7_roadmap",
                kind: "text",
                label: "未来规划",
                status: "strategic",
                rows: 9,
                defaultValue: `腾讯云面向中国企业出海的未来 12 个月能力规划，沿用 2025 年全球数字生态大会公开披露的"基础设施 / 技术产品 / 服务能力"三支柱框架，并以 2025 年第四季度至 2026 年 4 月的公开发布节奏为锚点。以下四条主线均以已公开披露的承诺为限，未公开的具体节奏与认证目标待战略团队确认。

主题一：基础设施在出海主通道继续加密
腾讯云已公开承诺在沙特阿拉伯投资 1.5 亿美元，建设其首个中东数据中心，与 2025 年已上线的利雅得地域形成持续加深的中东布局。日本大阪第三座数据中心与新设大阪办公室已对外宣布，将延展腾讯云在日本的可用区到三个。欧洲方面，2026 年 3 月在世界移动通信大会上腾讯云正式宣布在德国法兰克福新增第三个可用区，新区计划于 2026 年第二季度正式上线服务。雅加达第三座数据中心已于 2025 年完成部署。截至 2025 年第四季度，腾讯云全球基础设施达到 22 个地域、64 个可用区、3200 余个全球加速节点与 400T 带宽储备，将作为接下来 12 个月加深部署的基线。

主题二：AI 出海产品矩阵从底层算力到上层智能体一体化推进
腾讯云已于 2026 年 3 月正式发布 Agent 产品全景图，覆盖底层 TokenHub 大模型服务平台、智能体开发平台 ADP、企业版 ClawPro、办公助手 WorkBuddy、零门槛 QClaw、开源 OpenClaw 等产品线。TokenHub MaaS 平台支持自研混元大模型与 DeepSeek、MiniMax、Kimi、GLM 等主流第三方模型；2026 年 4 月混元 Hy3 preview 接入 TokenHub，输入价格降至每百万 tokens 1.2 元。出海产品方面，2026 年 4 月 QClaw 海外版正式开启内测，已在美国、加拿大、新加坡、韩国上线，支持中、英、法、西、韩等多语言，并明确"更多地区正在陆续开放"；CodeBuddy 与智能体开发平台 ADP 国际版已对外开放；混元 3D 自 2025 年 11 月面向海外开放，已被德国软件公司 Maxon 集成进 Cinema 4D 桌面应用；2026 年 4 月 16 日混元 3D 世界模型 2.0（HY-World 2.0）正式发布并开源至 GitHub。2026 年 4 月 28 日企业级 Agent 能力进一步首发 ClawPro 专有云版、ADP 智能工作台、Agent Memory、Agent Storage 等多款产品，反映了既定的高频迭代节奏。

主题三：本地化服务网络与生态扩展
腾讯云在全球已设立 11 个区域办公室与 9 大技术支持中心，并部署超过 100 个全球技术支持触点，服务覆盖 30 余个行业、80 余个国家和地区。9 大技术支持中心覆盖雅加达、马尼拉、吉隆坡、新加坡、曼谷、东京、首尔、帕罗阿尔托、法兰克福，提供 24×7 本地化服务。生态层面，2026 年 4 月腾讯云在重庆城市峰会上正式发布"出海生态启航计划"，围绕出海权益、伙伴库与知识服务三大体系，整合跨境电商、通用 SaaS、出海文娱、在线支付、在线广告等全生态伙伴。腾讯云出海服务公众号自 2025 年初建立、保持高频内容更新，"腾云出海沙龙"自 2025 年 11 月无锡站起按城市轮转节奏举办，已落地无锡、上海、重庆等站点。

主题四：合规广度与本土化合规深度
腾讯云已累计获得 400 余项国内外权威认证，覆盖 GDPR、SOC、ISO 等 20 余个领域的全球主流标准，构成现有合规基线。腾讯高级法律顾问团队公开输出的海外 AI 合规指南，已涵盖欧盟数据本地化、跨境传输 SCC 标准合同、模型训练数据授权溯源、AI 生成内容水印与全流程审核等议题。面向接下来 12 个月，腾讯云对外表态将持续加大全球基础设施与 AI 技术投入；中东、拉美、欧洲特定区域的本地认证（如沙特 SAMA CCC、NCA ECC、CST CCC、巴西 LGPD 第三方评估、ANPD 等）的具体时间表当前未在公开新闻稿中披露，待战略团队确认是否对外。`,
                defaultValueEn: `Tencent Cloud's 12-month capability roadmap for Chinese Enterprises Going Global follows the three-pillar internationalization strategy publicly stated at the 2025 Tencent Global Digital Ecosystem Summit, infrastructure, technology products, and service capabilities, anchored to the publicly disclosed shipping cadence between Q4 2025 and April 2026. The four themes below are restricted to commitments already disclosed in Tencent or Tencent Cloud press releases and official outbound channels. Items not publicly disclosed are out of scope for this answer.

Theme 1. Infrastructure deepening on outbound corridors
Tencent has publicly committed USD 150 million to build its first Middle East data center in Saudi Arabia, building further depth on top of the Riyadh region that came online in 2025. A third data center in Osaka, Japan, with a new Osaka office, is publicly announced and will extend Tencent Cloud's Japan footprint to three availability zones. In Europe, at MWC 2026 in March Tencent Cloud announced a third availability zone in Frankfurt, with go-live targeted for Q2 2026. A third Jakarta data center was delivered in 2025. The current global baseline reaches 22 regions, 64 availability zones, more than 3,200 global acceleration nodes, and 400T of bandwidth reserve, and is the foundation against which the next 12 months of build-out will be measured.

Theme 2. AI productization for the going-global stack, end-to-end
Tencent Cloud released its full Agent product map in March 2026, spanning the TokenHub model-as-a-service platform at the bottom layer, the Agent Development Platform ADP, the enterprise-grade ClawPro, the office assistant WorkBuddy, the zero-setup QClaw, and the open-source OpenClaw at the application layer. TokenHub serves Tencent's own Hunyuan models alongside leading third-party models including DeepSeek, MiniMax, Kimi, and GLM; the Hunyuan Hy3 preview was added to TokenHub in April 2026 at an input price of RMB 1.2 per million tokens. On the international side, the QClaw overseas edition opened internal beta in April 2026 and is live in the United States, Canada, Singapore, and Korea, with multi-language support across Chinese, English, French, Spanish, and Korean and a public commitment that more regions are progressively opening. International editions of CodeBuddy and ADP are already available; Hunyuan 3D has been open to overseas users since November 2025 and is integrated by the German software company Maxon into Cinema 4D; Hunyuan 3D World Model 2.0 (HY-World 2.0) was released and open-sourced on April 16, 2026. On April 28, 2026 the enterprise Agent stack was further extended with the first launches of ClawPro on dedicated cloud, the ADP Smart Workbench, Agent Memory, and Agent Storage, all of which evidence the established cadence of monthly product additions.

Theme 3. Localized service network and ecosystem deepening
Tencent Cloud operates 11 regional offices, 9 global technical support centers, and more than 100 worldwide technical-support touchpoints, serving over 30 industries and 80 countries and regions. The nine technical support centers are located in Jakarta, Manila, Kuala Lumpur, Singapore, Bangkok, Tokyo, Seoul, Palo Alto, and Frankfurt, providing 24x7 localized service. On the ecosystem side, Tencent Cloud announced the Going-Global Ecosystem Launch Program at its Chongqing city summit in April 2026, organized around three pillars of outbound member benefits, a partner library, and a knowledge-service track, integrating cross-border e-commerce, general SaaS, overseas digital media, online payments, and online advertising partners. The Tencent Cloud Going-Global Service WeChat channel has been active since early 2025 with sustained content cadence, and the Going-Global City Summit Salon series has run on a rolling city cadence since the Wuxi station in November 2025, with subsequent stops in Shanghai and Chongqing.

Theme 4. Compliance breadth, with regional-specific certifications still pending
Tencent Cloud has accumulated more than 400 international certifications across 20-plus certification domains, including alignment with GDPR, SOC, and ISO standards, and this is the current compliance baseline. Tencent's senior legal counsel team has publicly published outbound AI compliance guidance covering EU data localization, cross-border transfer under standard contractual clauses, training-data licensing, AI-generated-content watermarking, and end-to-end review processes. For the next 12 months, Tencent Cloud has publicly stated it will continue to increase investment in global infrastructure and AI capabilities. Specific regional-certification targets in the Middle East, Latin America, and the broader European Union, such as Saudi SAMA CCC, NCA ECC, CST CCC, Brazilian LGPD third-party assessment, and ANPD, are not currently in public disclosure and are therefore out of scope for this submission.`,
                reasoning: {
                  sources: [
                    src("https://www.tencent.com/en-us/articles/2202183.html", "GDES press release (2025-09-16)"),
                    src("https://mp.weixin.qq.com/s/hUUB6qnIP_OZMw8FxqBr_A", "公众号腾讯云 2026-03-03 (法兰克福第三可用区 Q2 2026)"),
                    src("https://mp.weixin.qq.com/s/qYUxMkFIDK9Gxxrm9In9qg", "公众号腾讯云 2026-03-27 (Agent 产品全景图)"),
                    src("https://mp.weixin.qq.com/s/c_H4s_0WMmyutfrwkaWhcw", "公众号腾讯云 2026-04-21 (QClaw 海外版内测)"),
                    src("https://mp.weixin.qq.com/s/U4N_F0DZM5BzGITU_J2a6g", "公众号腾讯云 2026-04-16 (HY-World 2.0 开源)"),
                    src("https://mp.weixin.qq.com/s/PA1SMzy7CBaj9OGvDCWheQ", "公众号腾讯云 2026-04-28 (出海生态启航计划 + ADP 升级)"),
                    src("https://mp.weixin.qq.com/s/j8vusknh7x0vBPpsTbxq7Q", "公众号腾讯云出海服务 2025-12-01 (11 办公室 / 400+ 认证)"),
                    src("https://mp.weixin.qq.com/s/6Ug6YL0F3mPJdOPQmdxAFQ", "公众号腾讯云出海服务 2026-03-31 (100+ 触点 / 文含章 AI 合规)"),
                  ],
                  quotes: [
                    `[GDES]: "Tencent will upgrade its Tencent Cloud internationalization strategy across three areas — infrastructure, technology products, and service capabilities"`,
                    `[GDES]: "plans to invest USD150 million in the future to build its first Middle East data center in Saudi Arabia. Simultaneously, it will build a third data center in Osaka, Japan"`,
                    `[公众号腾讯云 2026-03-03]: "腾讯云正式宣布：将在德国法兰克福新增1个云可用区。新区将于今年2季度正式上线服务"`,
                    `[公众号腾讯云 2026-03-27]: "腾讯云Agent产品全景图正式发布 ... TokenHub大模型服务平台"`,
                    `[公众号腾讯云 2026-04-21 QClaw]: "QClaw 海外版已在美国、加拿大、新加坡、韩国等国家和地区上线 ... 更多地区正在陆续开放"`,
                    `[公众号腾讯云 2026-04-28]: "首发ClawPro专有云版、ADP智能工作台、Agent Memory、Agent Storage等多款产品 ... 正式发布了「出海生态启航计划」"`,
                    `[公众号腾讯云出海服务 2025-12-01]: "11个区域办公室与9大技术支持中心 ... 400多项国际专业认证，覆盖GDPR、SOC、ISO等20多个领域"`,
                    `[公众号腾讯云出海服务 2026-03-31]: "9大技术支持中心与100+全球技术支持触点 ... 面向未来，腾讯云将持续加大全球基础设施与AI技术投入"`,
                  ],
                  reasoning: `Forward-looking + 严格 NDA-edge 题。v2 把 v1"占位的未来"换成"已公开的执行节奏"——法兰克福 Q2 2026、QClaw 海外版地域、出海生态启航计划、Agent 全景图、HY-World 2.0、ADP 升级——都是 2026 年 3-4 月已对外明确披露的信息，不是 NDA-edge。所有数字（1.5 亿美元、Q2 2026、22 / 64 / 3200 / 400T、11 / 9 / 100+、400+、80+、1.2 元/百万 tokens）均可在新闻稿或公众号原文中 grep 到。`,
                  decision: `三支柱 framing + 4 主题 + 全部用已公开 2025-12 至 2026-04 数据；具体里程碑节奏由战略团队确认。`,
                },
              },
            ],
          },
        ],
      },
      {
        id: "q7_2",
        title: "7.2 Most urgent gap in current cloud services · 行业最需改进环节",
        promptEn: `What is the most urgent gap in current cloud services for Chinese enterprises going global?`,
        promptZh: `您认为当前云服务商在服务中企出海时最需要改进的环节是什么？`,
        status: "strategic",
        groups: [
          {
            fields: [
              {
                id: "s7_gap",
                kind: "text",
                label: "行业最需改进的环节",
                status: "strategic",
                rows: 7,
                defaultValue: `最紧迫的行业级缺口，是全球数据主权与合规规则呈现"统一理念、碎片实践"的悖论——各市场在个人数据保护权利、企业责任等核心原则上已基本一致，但落到具体规则上却显著分化，目前还没有任何一家云厂商（包括我们）真正在平台层把这层复杂度抽象掉。腾讯高级法律顾问田展曾公开指出，全球已有 144 个国家拥有自己的数据保护法，企业出海必须默认每个目标市场都有合规要求；合规本身是一个动态且多维的过程，涉及牌照资质、数据本地化驻留、AI 监管、以及企业作为"数据控制者"还是"数据处理者"的不同法律责任。具体到主流目标市场，差异同样显著：美国采用分散式立法考验企业适应能力，欧盟 GDPR 在隐私层面要求严苛，印尼对跨境数据流动有明确限制，巴西要求金融数据本地存储，沙特、阿联酋、卡塔尔等中东市场各自的 PDPL 与本地化执法路径仍在快速演进。换言之，跨境数据流转目前不是一个平台开关，而是一组逐司法辖区谈判与配置的工程任务。

这个缺口在 AI 时代正在变宽，而不是变窄。全球 AI 监管趋严，数据合规、知识产权、市场准入正在成为出海的三大高危风险点，落到工程实操上又叠加了至少四层新约束：欧盟要求数据优先本地存储且把"远程访问"视同跨境传输（须签署 SCC 标准合同条款）、模型训练数据须确保授权溯源并规避盗版数据集、AI 生成内容须落实水印与标识并建立全流程审核机制、选用合规可控的本土模型以规避第三方模型在地域限制与商用授权上的不确定性。这些是 2024 年之前不存在的新增义务，叠加在原有的数据本地化义务之上。

这个缺口有多大？以 2025 年 6 月腾讯云与 GoTo 完成的印尼数据主权迁移为例：为了把 GoTo 的 On-Demand Services 全部落到印尼境内，团队准备了 8 个月、迁移了 1,000+ 微服务，腾讯云还把雅加达 region 从 2 个可用区扩到 3 个。这是有重度厂商投入兜底的旗舰案例，仍然如此重；行业里多数中国出海企业并没有这种 partnership 强度可依托。一个相对次要但同样真实的缺口是本地化的服务与人才密度——单靠平台是不够的。这也是为什么腾讯云把国际化战略明确表述为"基础设施 / 技术产品 / 服务能力"三支柱，并在全球部署了 11 个区域办公室与 9 个技术支持中心，覆盖 80 多个国家和地区。

腾讯云的应对方式，是把投入压在主权感知的本地基础设施上。2025 年我们落地中东首个 region 在沙特利雅得，并计划 1.5 亿美元后续投资；为支持 GoTo 把雅加达 region 从 2 个可用区扩到 3 个；在大阪新增第三个数据中心；累计获得 400 余项国际认证，覆盖 GDPR、SOC、ISO 等 20 多个领域的全球主流标准。但我们认为，这个缺口需要整个行业（包括我们和其他超大规模云厂商）共同推进——把"逐司法辖区配置"逐步演进为更接近"平台原生 compliance + AI sovereignty abstraction"的能力，是未来 24-36 个月最关键的行业命题，没有单一厂商能独自完成。`,
                defaultValueEn: `The most urgent industry-level gap is what we would call the "unified principles, fragmented practice" paradox of global data-sovereignty regimes. Markets have largely converged on the core principles of personal-data protection and enterprise responsibility, but the specific rules diverge sharply, and no cloud provider — Tencent included — has yet abstracted that complexity at the platform layer. As Tian Zhan, senior legal counsel at Tencent, has publicly stated, 144 countries now have their own data-protection laws; compliance is a dynamic, multi-dimensional process spanning licensing, data-residency, AI regulation, and the very different obligations that attach depending on whether an enterprise is acting as a data controller or a data processor. The cross-market divergence is concrete: the United States relies on fragmented sectoral and state-level legislation, the EU's GDPR sets a strict privacy bar, Indonesia restricts cross-border data flows, Brazil requires financial data to be stored locally, and Saudi Arabia, the UAE, and Qatar are each evolving their own PDPL regimes and localization enforcement paths. Cross-border data flow today is not a platform toggle; it is a per-jurisdiction engineering and legal undertaking.

This gap is widening in the AI era, not closing. Global AI regulation is tightening on three high-risk fronts simultaneously: data compliance, intellectual property, and market access. In practice this layers at least four new obligations on top of the classic data-residency layer: the EU now treats remote access to in-region data as cross-border transfer (requiring Standard Contractual Clauses), training data must carry licensing provenance and exclude pirated datasets, AI-generated content must be watermarked and labelled and routed through end-to-end review, and enterprises increasingly need compliance-controllable local models to avoid the regional and commercial-use restrictions on third-party foundation models. None of these obligations existed in their current form two years ago.

The size of this gap is documented in our own flagship case. In June 2025, Tencent Cloud and GoTo completed the migration of GoTo's On-Demand Services into Indonesia to honor local data-sovereignty commitments — more than 1,000 microservices, an eight-month preparation period, and an expansion of our Jakarta region from two availability zones to three. Even with deep partnership and dedicated infrastructure investment, satisfying one country's sovereignty rules was a flagship-scale undertaking, not a configuration change. Most Chinese enterprises going global do not have that level of partner support to fall back on, which is precisely why this gap is industry-urgent. A secondary, related gap is local-language and on-the-ground service-and-partner density: platform alone is not sufficient when customers land in unfamiliar regulatory and partner environments. This is why Tencent Cloud has explicitly framed its internationalization strategy across three pillars — infrastructure, technology products, and service capabilities — and has built out 11 regional offices and 9 technical support centers serving more than 80 countries.

Tencent Cloud's response is to invest in sovereignty-aware local infrastructure rather than treat overseas as a remote extension of China. In 2025 we launched our first Middle East cloud region in Riyadh, Saudi Arabia, with USD 150 million in further investment planned. We expanded Jakarta from two to three availability zones to support GoTo's data-sovereignty migration. We are adding a third data center in Osaka. We hold over 400 international certifications covering more than 20 mainstream standards domains, including GDPR, SOC, and ISO families. But closing this gap is, in our honest view, a multi-year, industry-wide effort: moving the cloud platform from per-jurisdiction configuration toward platform-native compliance and AI-sovereignty abstraction is the defining cloud-platform challenge of the next 24 to 36 months for Chinese enterprises going global, and it will require Tencent and our peer hyperscalers to advance in parallel — no single vendor will close it alone.`,
                reasoning: {
                  sources: [
                    src("https://www.tencentcloud.com/services/compliance", "Compliance Center FAQ"),
                    src("https://www.tencentcloud.com/dynamic/news-details/100692", "GoTo migration (2025-06-05)"),
                    src("https://www.tencent.com/en-us/articles/2202183.html", "GDES press release (2025-09-16)"),
                    src("https://mp.weixin.qq.com/s/08d1ERzHr_cDtaHBGn8t0A", "公众号腾讯云出海服务 2025-09-26 (统一理念碎片实践 + 4 国差异)"),
                    src("https://mp.weixin.qq.com/s/j8vusknh7x0vBPpsTbxq7Q", "公众号腾讯云出海服务 2025-12-01 (田展 144 国 + 11 办公室 + 400 认证)"),
                    src("https://mp.weixin.qq.com/s/6Ug6YL0F3mPJdOPQmdxAFQ", "公众号腾讯云出海服务 2026-03-31 (文含章 三大风险 + AI 合规四层)"),
                  ],
                  quotes: [
                    `[公众号腾讯云出海服务 2025-09-26]: "全球数据合规相关法规仍旧存在'统一理念与碎片实践'的悖论 ... 美国的'分散式立法'考验企业适应能力，欧盟GDPR对数据隐私要求严苛，印尼则限制跨境数据流动等"`,
                    `[公众号腾讯云出海服务 2025-12-01 田展]: "全球144个国家都有自己的数据保护法 ... 合规是一个动态且全面的过程，涉及牌照资质、数据本地化驻留、AI监管等多个维度 ... '数据控制者'还是'数据处理者'的不同法律责任"`,
                    `[公众号腾讯云出海服务 2026-03-31 文含章]: "全球AI监管趋严，数据合规、知识产权、市场准入成为三大高危风险点 ... 欧盟数据优先本地存储、远程访问视同跨境传输、签署SCC标准合同条款，模型训练数据确保授权溯源、规避盗版数据集，AI生成内容落实水印与标识"`,
                    `[GoTo]: "the migration involved more than 1,000 microservices ... Over an eight-month preparation period ... increasing its Jakarta region from two to three availability zones."`,
                    `[GDES]: "Tencent will upgrade its Tencent Cloud internationalization strategy across three areas - infrastructure, technology products, and service capabilities"`,
                    `[公众号腾讯云出海服务 2025-12-01]: "11个区域办公室与9大技术支持中心 ... 80多个国家和地区 ... 400多项国际专业认证"`,
                    `[公众号腾讯云出海服务 2025-12-01]: "腾讯云在沙特投资1.5亿美元建设中东首个可用区"`,
                  ],
                  reasoning: `v2 sharpened：将主缺口从"compliance is hard"提升到"统一理念碎片实践"悖论 + 144 国规模 + AI 时代四层新增义务。GoTo 8 个月 + 雅加达 2→3 AZ 仍是缺口规模量化。次要缺口本地化服务密度补 11 区域办公室 / 100+ 触点。框定为行业共性挑战非 Tencent 单点短板，并以"24-36 个月行业共同推进"收尾。`,
                  decision: `行业共性缺口（数据主权碎片化 + AI 时代新约束）+ 量化（GoTo + 144 国）+ 腾讯应对（USD 150M / 雅加达扩容 / 三支柱 / 11 + 9 + 400 认证）+ 24-36 个月行业级 thesis。`,
                },
              },
            ],
          },
        ],
      },
    ],
  },
];
