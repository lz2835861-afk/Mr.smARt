// Gartner Magic Quadrant for Container Management — Vendor Briefing Script
// Vendor: Tencent Cloud container line (TKE / EKS-Serverless / TCR / TKE-Edge / 容器安全)
// Source PDF: Container Management_Tencent Instructions Product Demo_21-MAY-2026.pdf
//
// Answer status (2026-06-02): submission-grade clean pass over all 14 questions —
// internal review tags / pipeline scaffolding removed, sources moved into the `reasoning`
// component, and genuine gaps (named clients, roadmap, competitive wins) marked with 【】
// boxes for AR to fill rather than fabricated. Field ids are namespaced "gc_*" so they never
// collide with the Omdia answer set in the shared Supabase `answers` table (interim scoping
// until a questionnaire_id column lands).
//
// Evidence + audit chains live in .questionnaire-state-gartner-container/grounding/*.md

import type { Section, Source } from "./questionnaire";

const src = (url: string, label: string): Source => ({ url, label });

export const GARTNER_CONTAINER_SECTIONS: Section[] = [
  // =====================================================================
  // SECTION 1 — BUSINESS
  // =====================================================================
  {
    id: "gc_s1",
    index: "1",
    title: "Business · 业务",
    description: "差异化、竞品、近 12 月公告、未来 3 月 roadmap、6 个用例客户画像、24 月战略与市场判断。",
    descriptionEn:
      "Vendor business: differentiation, competition, last-12-month announcements, next-3-month roadmap, per-use-case client profiles, 24-month strategy, and market outlook.",
    questions: [
      {
        id: "gc_q1_1",
        title: "1.1 Three differentiators · 三大差异化",
        zhHint: "诚实模式题：proof points 可取证，但选哪 3 点 + 所有“业界首/唯一”表述由 AR 拍板。",
        status: "strategic",
        promptEn: "What three things distinguish you from all other vendors in this market?",
        promptZh: "在这个市场里，有哪三点让你区别于所有其他厂商？",
        groups: [
          {
            layout: "default",
            fields: [
              {
                id: "gc_1_1",
                kind: "text",
                label: "Answer · 回答",
                status: "strategic",
                rows: 16,
                reasoning: {
                  sources: [
                    src("https://www.tencentcloud.com/product/tke", "TKE 产品页"),
                    src("https://www.tencentcloud.com/document/product/457/42973", "qGPU 文档"),
                    src("https://www.tencentcloud.com/document/product/457/54483", "Native Node 原生节点"),
                    src("https://www.tencentcloud.com/document/product/457/39759", "Super Node 超级节点"),
                  ],
                  quotes: [
                    "A single cluster control plane can support stable operation of over 50,000 nodes with 10x throughput enhancement.",
                    "Inference acceleration: Tencent Self-developed TACO inference acceleration framework... GPU sharing: Deeply integrated qGPU sharing technology",
                    "SuperEdge ... moved to the Archived maturity level on March 25, 2025.",
                  ],
                  reasoning:
                    "Proof points 充足（超大规模自运营、AI-on-容器、无服务器节点抽象、TCR 全球分发）。但‘哪 3 点最打动 Gartner 容器评分眼’和所有超级表述属战略取舍，标 strategic 交 AR。SuperEdge 已 Archived，不能当 live 差异化讲。",
                  decision:
                    "给候选差异化池 + 证据，AR 选 3 点并核验超级表述；开源角度改为‘历史 CNCF 贡献’或换 active 项目。",
                },
                defaultValue: `Re Section 1 Q1（三大差异化）：

在容器管理市场，腾讯云容器服务（TKE）有三点区别于其他厂商。

1. 超大规模自运营底蕴，不是实验室口径。单集群控制面稳定运行 5 万+ 节点、吞吐提升 10 倍；Native Node 直接沿用腾讯内部千万核容器的运营经验，王者荣耀等高并发自有业务长期在 TKE 生产环境运行。多数托管 K8s 讲规模，少有先以一方租户身份把规模跑出来的。

2. AI 与通用负载共用一个控制面。qGPU 把单张 GPU 切给多个容器共享（显存与算力细粒度隔离、近零吞吐损失、无需改写 CUDA，基于开源 Elastic GPU）；自研 TACO-LLM 推理引擎完全兼容 vLLM、以容器镜像交付；训练侧配 RDMA 互联与 checkpoint 自愈。要点不是另起一套 AI 栈——同一套调度与 RBAC 同时覆盖两者，而多数超大厂在这里恰恰拆成了独立产品。

3. 无服务器节点抽象是默认形态，不是附加项。Super Node 与 TKE Serverless 把节点的选型、供给、打补丁责任从用户手里完全拿走，按 Pod 实际资源计费、秒级弹性、99.95%+ 可用；Crane 调度器与 Native Node 装箱把利用率从自管集群常见的低位拉高。`,
                defaultValueEn: `Re Section 1 Q1 (three differentiators):

1. Hyperscale operations heritage, not a lab claim. A single TKE control plane runs 50,000+ nodes at 10x throughput; Native Nodes inherit Tencent's own ten-million-core container operations, and properties such as Honor of Kings have run on TKE in production for years. Most managed-Kubernetes pitches cite scale; few have operated it as a first-party tenant first.

2. AI and general workloads on one control plane. qGPU partitions a single GPU across containers with fine-grained vRAM and compute isolation, near-zero throughput loss, and no CUDA rewrite (built on the open-source Elastic GPU framework); TACO-LLM, a self-developed inference engine, is vLLM-compatible and ships as a container image; training adds RDMA interconnect and checkpoint self-healing. The point is not a separate AI stack — one scheduler and one RBAC cover both, which is where most hyperscalers actually split into separate products.

3. Serverless node abstraction as default, not an add-on. Super Node and TKE Serverless take node sizing, provisioning, and patching off the customer entirely — billed on actual pod resources, scaling in seconds, at a documented 99.95%+ availability — while the Crane scheduler and Native Node packing push utilization up from the low-teens baseline typical of self-managed clusters.`,
              },
            ],
          },
        ],
      },
      {
        id: "gc_q1_2",
        title: "1.2 Top 3 competitors · 三大竞品",
        zhHint: "竞品识别可外部取证（MQ 参评名单），但“凭何取胜”是定位，需 AR。目前无专门竞品情报源。",
        status: "strategic",
        promptEn: "Who are the 3 top competitors that you compete with and why do you win?",
        promptZh: "你最常竞争的 3 个竞品是谁？你凭什么赢？",
        groups: [
          {
            layout: "default",
            fields: [
              {
                id: "gc_1_2",
                kind: "text",
                label: "Answer · 回答",
                status: "strategic",
                rows: 12,
                reasoning: {
                  sources: [
                    src("https://www.gartner.com/en/documents/6811034", "Gartner MQ Container Mgmt 2025"),
                    src(
                      "https://virtualizationreview.com/articles/2025/08/11/cloud-giants-fend-off-red-hat-in-container-management-research-report.aspx",
                      "MQ 象限独立报道",
                    ),
                  ],
                  quotes: [
                    "In the Leaders quadrant, Google, Microsoft, Amazon Web Services, and Red Hat are joined by Alibaba Cloud, SUSE, and Huawei. The Challengers quadrant includes Broadcom (VMware), Nutanix, Tencent Cloud, Mirantis, Canonical, Oracle, and Spectro Cloud.",
                  ],
                  reasoning:
                    "竞品识别可从 MQ 名单取证(2025-08-06 发布);但选哪 3 个 + 整个“凭何取胜”叙事是定位,公开无腾讯竞争性取胜陈述,只能 [REVIEW: AR]。",
                  decision:
                    "草稿给取证后的竞品集 + 出海口径收敛;选 3 + why-win + 确认腾讯象限 = AR;另见 competitor-profiles plan。",
                },
                defaultValue: `Re Section 1 Q2（三大竞品 / 凭何取胜）：

在中企出海的容器场景里，TKE 最常正面遇到两类对手：
1. 全球超大厂的托管 K8s——AWS EKS、Microsoft Azure AKS、Google GKE（混合云再加 Red Hat OpenShift）。
2. 同样服务出海的中国云——阿里云 ACK、华为云 CCE。

凭何取胜（定位）：

对超大厂：托管 K8s 的功能清单早已是行业门槛，差异不在功能，而在亚太及新兴市场（东南亚、中东）的本地化合规、在地支持与伙伴渠道，叠加消费互联网级的容器运营经验；qGPU 共享、TACO 推理加速、Super Node 无服务器节点等 AI-容器能力以更低的迁移与改造成本交付。

对中国同行：以同源同构复用腾讯自有生产验证过的容器底座，差异集中在 AI 训练/推理调度（qGPU、AIBrix、Crane）与无服务器化。

【待 AR：① 最终点名哪 3 家；② 每家的具体取胜证据——公开渠道无腾讯对具名竞品的取胜陈述，需 AR 提供客户替换案例或竞争数据；③ 对照授权版 MQ 确认腾讯象限。】`,
                defaultValueEn: `Re Section 1 Q2 (top three competitors, and why Tencent Cloud wins):

In a going-global motion, TKE most often meets two groups:
1. The hyperscalers' managed Kubernetes — AWS EKS, Microsoft Azure AKS, Google GKE, plus Red Hat OpenShift in hybrid.
2. The two Chinese clouds also serving outbound enterprises — Alibaba Cloud ACK and Huawei Cloud CCE.

Why Tencent Cloud wins:

Against the hyperscalers, the managed-Kubernetes feature list is table stakes; the difference is localized compliance, in-region support, and partner channels across Asia-Pacific and emerging markets (Southeast Asia, the Middle East), plus consumer-internet-scale operations experience. The AI-container capabilities — qGPU sharing, TACO inference acceleration, serverless Super Nodes — land at lower migration and refactoring cost than re-platforming onto a hyperscaler.

Against the Chinese peers, the difference is a same-source, same-architecture reuse of the container base proven on Tencent's own production, concentrated in AI training and inference scheduling (qGPU, AIBrix, Crane) and serverless provisioning.

【AR to supply: (1) the final three named; (2) concrete win evidence per competitor — no public Tencent competitive-win statement exists, so AR must provide displacement cases or competitive data; (3) confirm Tencent's quadrant against the licensed MQ.】`,
              },
            ],
          },
        ],
      },
      {
        id: "gc_q1_3",
        title: "1.3 Last 12 months — 3 announcements · 近 12 月三项公告",
        zhHint: "候选池可取证；但门面 PR(GDES 2025)非容器主题，且 release notes 缺 2025-07 后，需 AR 补时效。",
        status: "needs-confirm",
        promptEn:
          "What are the 3 most significant announcements you made over the past 12 months related to this market?",
        promptZh: "过去 12 个月，你在这个市场做出的 3 项最重要的公告是什么？",
        groups: [
          {
            layout: "default",
            fields: [
              {
                id: "gc_1_3",
                kind: "text",
                label: "Answer · 回答",
                status: "needs-confirm",
                rows: 12,
                reasoning: {
                  sources: [
                    src("https://www.tencentcloud.com/document/product/457/70471", "TKE 2025 release notes"),
                    src("https://mp.weixin.qq.com/s/RmHorgp3kEWL0RV6K5V_OQ", "Agent Runtime 升级为原生运行平台（腾讯云，2026-05-28）"),
                    src("https://mp.weixin.qq.com/s/mKSTl44Ste3Oxh7REl8WqQ", "开源 TencentDB Agent Memory（腾讯云，2026-05-14）"),
                    src("https://cloud.tencent.com/announce/detail/2254", "TKE 原生节点调价公告"),
                  ],
                  quotes: [
                    "容器服务TKE - 原生节点相关产品服务：上调 5%",
                    "Overload and service outage experiments are supported for control plane components (such as etcd, kube-apiserver, and CoreDNS).",
                  ],
                  reasoning:
                    "窗口(2025-06→2026-06)内公开、带日期、容器专属的公告很薄：唯一明确容器专属的集团级公告是调价(负面信号)，外加 2025-06 release-note GA。GDES 2025 是 AI 主题、未提容器。release-note 页只到 2025-06。",
                  decision: "WeChat 一手补充已加(2026-06 重跑,4 条 2026-05 Agent 基建公告)；选 3 + 判断是否容器专属仍由 AR。",
                },
                defaultValue: `Re Section 1 Q3（近 12 个月三项重大公告）：

1. TKE 平台可靠性升级（2025 年中）：控制面故障演练（覆盖 etcd / kube-apiserver / CoreDNS 的过载与停服）、PlacementPolicy 自定义资源优先级调度、集群误删防护默认开启——把大规模运营经验做成产品行为，而非运维手册。

2. Agent Runtime 升级为原生运行平台（2026-05）：在容器底座之上提供 SandBox、存储、网关、Memory 五件套；Agent SandBox 50ms 唤醒、闲时释放约 70% 算力，国际版已上线。

3. 开源 TencentDB Agent Memory（2026-05）：多 Session 实验最高降 61% Token；数据库产品线面向 Agent 重构。

【待 AR：第 2、3 项是 Agent 基建/云原生公告，非容器产品 GA；若本题须严格限定容器产品（TKE / TCR / 容器安全），请补 2025-07 之后的容器发布（公开 release notes 截至 2025-06）。另：是否纳入「TKE 原生节点刊例价上调 5%，2026-05 生效」由 AR 定——调价对分析师未必算正面公告。】`,
                defaultValueEn: `Re Section 1 Q3 (three most significant announcements in the last 12 months):

1. TKE platform reliability, mid-2025. Control-plane chaos drills (etcd, kube-apiserver, CoreDNS overload and outage), PlacementPolicy resource-priority scheduling, and accidental-deletion protection on by default — large-scale operations experience turned into product behavior, not runbooks.

2. Agent Runtime as a native run platform, May 2026. On the container base: SandBox, storage, gateway, and Memory as one stack; the Agent SandBox wakes in 50 ms and releases ~70% of idle compute when quiet, with an international edition live.

3. Open-sourced TencentDB Agent Memory, May 2026, at up to 61% lower token use in multi-session tests, alongside a database line re-architected for agent workloads.

【AR to supply: items 2 and 3 are Agent-infra / cloud-native announcements, not container-product GAs; if this answer must stay strictly container-product (TKE / TCR / container security), add releases after 2025-07 — public release notes stop at 2025-06. Also AR's call: whether to include the 5% TKE Native Nodes list-price increase (effective May 2026), which an analyst may not read as a positive announcement.】`,
              },
            ],
          },
        ],
      },
      {
        id: "gc_q1_4",
        title: "1.4 Next 3 months — roadmap · 未来 3 月 roadmap",
        zhHint: "BLOCKED：腾讯只在 GA 后发 release notes，无公开前瞻 roadmap。3 项+排序+日期必须 AR/产品给。",
        status: "strategic",
        promptEn:
          "What are the 3 most important items on your roadmap that you plan to deliver in the next 3 months?",
        promptZh: "未来 3 个月，你计划交付的 roadmap 上最重要的 3 件事是什么？",
        groups: [
          {
            layout: "default",
            fields: [
              {
                id: "gc_1_4",
                kind: "text",
                label: "Answer · 回答",
                status: "strategic",
                rows: 7,
                reasoning: {
                  sources: [
                    src("https://www.tencentcloud.com/document/product/457/70471", "TKE release notes（全为已发布）"),
                  ],
                  quotes: [],
                  reasoning:
                    "前瞻、内部/NDA 性质。腾讯所有公开容器渠道（release notes、容器产品技术月报公众号、新闻feed）都是回溯型，无未来日期、无排序。KubeCon/新闻扫到的全是竞品 roadmap。",
                  decision: "BLOCKED — 候选池为空，pipeline 拒绝编造。3 项 + 排序 + 交付日期由 AR/产品提供。",
                },
                defaultValue: `Re Section 1 Q4（未来 3 个月 roadmap）：

【待 AR / 容器产品团队提供：未来 3 个月（约 2026-06 至 2026-09）计划交付的 3 个最重要的容器 roadmap 项、它们的优先级排序与目标交付时间。腾讯仅在 GA 之后发布 release notes，公开渠道没有前瞻性的容器 roadmap、无未来交付日期，故此项须由产品团队提供，本工具不臆测。】`,
                defaultValueEn: `Re Section 1 Q4 (roadmap, next 3 months):

【AR / container product team to supply: the 3 most important container roadmap items planned for delivery in the next 3 months (~2026-06 to 2026-09), their priority ranking, and target delivery dates. Tencent publishes release notes only after GA, so no forward-looking container roadmap, dates, or ranking exist in public channels — this must come from the product team and is not inferred here.】`,
              },
            ],
          },
        ],
      },
      {
        id: "gc_q1_5",
        title: "1.5 Client profile per use case (a–f) · 6 用例客户画像",
        zhHint: "每个用例 1 个具名生产客户：为何选你 / 与谁竞争 / 客户获得的价值。具名+竞品+量化多需 AR + 授权。",
        status: "needs-confirm",
        promptEn:
          "Profile a client for each use case (a separate client for each, 6 total). For each, note the entire lifecycle of why you were selected, who you competed with, and what value they achieved. Named clients and production deployments are preferred.",
        promptZh:
          "为每个用例画像一个客户（每个用例一个，共 6 个）。每个都说明：为何选中你、与谁竞争、客户获得了什么价值。优先具名 + 生产部署。",
        groups: [
          {
            layout: "default",
            fields: [
              {
                id: "gc_1_5a",
                kind: "text",
                label: "a. New Cloud-Native Applications · 云原生新应用",
                status: "needs-confirm",
                rows: 8,
                defaultValue: `示例：腾讯游戏公共数据平台（PDP）采用存算分离的 serverless 数据架构，计算节点容器化运行在 TKE 上以实现快速弹性，支撑 100PB+ 数据、日增 300TB 量级。

【待 AR：本例为腾讯内部部门（captive）、无外部竞品替换、量化为数据平台级而非 TKE 直接归因。Gartner 要的「具名外部生产客户 + 与谁竞争 + 该客户获得的价值」三件套需 AR 提供并取得引用授权。】`,
                defaultValueEn: `Example: Tencent Games' Public Data Platform (PDP) uses a storage/compute-separated serverless data architecture whose compute nodes are containerized on TKE for rapid elasticity, supporting 100PB+ of data and ~300TB/day growth.

【AR to supply: this example is an internal Tencent department (captive), with no external competitor displaced and metrics at the data-platform level rather than directly attributable to TKE. The named external production client + who was competed with + the value that client achieved must come from AR, with citation authorization.】`,
              },
              {
                id: "gc_1_5b",
                kind: "text",
                label: "b. Containerize Existing Apps (incl. COTS) · 存量应用容器化",
                status: "needs-confirm",
                rows: 10,
                defaultValue: `示例：江苏银行将 X86/OpenShift 上的存量应用迁移至基于国产 ARM 的 TKE 容器云，是本问卷中最具说服力的竞品替换线索（OpenShift 为其多年存量平台）；水滴保核心业务 100% 容器化于 TKE 原生节点；微众银行在强监管金融环境下过半实例容器化。

【待 AR：江苏银行 TKE 阶段的量化结果待确认；水滴保的资源利用率/可用性数字为厂商自述，宜补第三方或客户侧佐证；微众为腾讯关联银行、生产以自建 K8s 为主，措辞需精确。竞品替换目前仅江苏银行（OpenShift）有公开线索——选定具名客户 + 量化价值 + 引用授权由 AR 定。】`,
                defaultValueEn: `Examples: Bank of Jiangsu migrated existing apps from X86/OpenShift to a domestic-ARM TKE container cloud — the strongest competitor-displacement lead in this response (OpenShift had been its incumbent platform for years); Waterdrop Insurance containerized its core business 100% on TKE native nodes; WeBank, in a heavily regulated finance environment, containerized over half of its instances.

【AR to supply: Bank of Jiangsu's TKE-phase quantified outcome is to be confirmed; Waterdrop's utilization/availability figures are vendor-asserted and should be corroborated by a third-party or customer source; WeBank is a Tencent-affiliated bank running mostly self-built K8s in production, so wording must be precise. Competitor displacement is publicly evidenced only for Bank of Jiangsu (OpenShift) — the named client + quantified value + citation authorization are AR's call.】`,
              },
              {
                id: "gc_1_5c",
                kind: "text",
                label: "c. AI Training Workloads · AI 训练负载",
                status: "needs-confirm",
                rows: 9,
                defaultValue: `示例：大模型独角兽 MiniMax 的训练运行在腾讯云 HCC GPU 集群上，由 TKE 统一调度异构云服务器、把各类应用收敛到同一套基础设施以提升利用率；公开口径为千卡级规模、可用性 99.9%、整体用云成本约 -20%、任务 5 分钟 / 基础设施 10 分钟级恢复。

【待 AR：公开无竞品替换信息；量化为整栈（HCC/星脉）口径，TKE 是其中的调度/容器化组件而非唯一驱动；「万亿参数 50→4 天」「千卡扩展比 96%」等为腾讯自有算力基准、非客户成果，勿混用。具名客户 + 竞品 + 客户量化 + 引用授权由 AR 提供。】`,
                defaultValueEn: `Example: LLM unicorn MiniMax runs training on Tencent Cloud HCC GPU clusters, with TKE unifying the scheduling of heterogeneous cloud servers and consolidating workloads onto one infrastructure to raise utilization; public figures cite 1,000+ GPU scale, 99.9% availability, ~20% lower overall cloud cost, and 5-minute task / 10-minute infrastructure recovery.

【AR to supply: no public competitor-displacement information; metrics are whole-stack (HCC), with TKE the scheduling/containerization component rather than the sole driver; figures such as "trillion-parameter 50->4 days" or "1,000-GPU 96% scaling" are Tencent's own compute benchmarks, not customer outcomes — do not conflate. Named client + competitor + client-attributed metrics + citation authorization come from AR.】`,
              },
              {
                id: "gc_1_5d",
                kind: "text",
                label: "d. AI Inferencing Workloads · AI 推理负载  ← AI 草稿样本",
                status: "needs-confirm",
                rows: 12,
                reasoning: {
                  sources: [
                    src("https://www.tencentcloud.com/document/product/457/69508", "AIBrix on TKE 分布式推理"),
                    src("https://cloud.tencent.com/developer/article/2666671", "TKE&qGPU 推理成本（平台级，2026-05-09）"),
                    src("https://www.tencentcloud.com/customers/detail/3533", "CNN BRASIL 客户页"),
                  ],
                  quotes: [
                    "AIBrix... the first full-stack Kubernetes solution deeply integrated with vLLM... distributed inference on a TKE cluster.",
                    "云原生调度编排（TKE & qGPU）使GPU卡使用率提升60%+；... 推理成本节省50%+。",
                  ],
                  reasoning:
                    "能力（TKE+qGPU+AIBrix/vLLM+TACO）强可取证；但 Gartner 要的‘具名外部客户(容器上跑推理) + 竞品 + 该客户量化值’三件套 ~0-20% 公开。平台级 60%/50% 数字不能安到具名客户头上(=造假)。",
                  decision: "草稿给能力 + 候选案例 + 明确 AR 待补三件套；具名/竞品/量化 + 授权交 AR。",
                },
                defaultValue: `能力底座：TKE 文档化 AIBrix（与 vLLM 深度集成的 K8s 分布式推理方案）；qGPU 单卡多容器共享；自研 TACO-LLM 推理加速。平台级数字：GPU 利用率 +60%、推理成本 -50%、扩容拉起从 10 分钟降至 34 秒（约 17 倍）。

候选具名线索：CNN BRASIL（用腾讯云 AI，但公开页面未提容器/推理/量化）；艾欧智能 AGILE-X、敦煌导览机器人（有 TKE & qGPU 数字，但 60%/50% 为平台级、未归属到该客户）。

【待 AR：① 选一个在容器上跑推理/agentic 负载的具名生产客户；② 与谁竞争 / 替换了谁（公开为 0）；③ 该客户自身的量化值——平台级数字不可冒充单客户成果；④ 引用授权（NDA / PR）。】`,
                defaultValueEn: `Capability base: TKE documents AIBrix (a Kubernetes inference stack deeply integrated with vLLM) for multi-node distributed inference; qGPU card sharing across containers; the self-developed TACO-LLM inference accelerator. Platform-level figures: GPU utilization +60%, inference cost -50%, scale-up from 10 minutes to 34 seconds (~17x).

Named leads: CNN BRASIL (uses Tencent Cloud AI, but the public page mentions no container/inference/metric); AGILE-X robotics and the Dunhuang guide robot (TKE and qGPU figures exist, but the 60%/50% numbers are platform-level, not attributed to those clients).

【AR to supply: (1) one named production client running inference/agentic workloads on containers; (2) who was competed with / displaced (0% public); (3) that client's own quantified value — platform-level figures must not be passed off as a single client's result; (4) citation authorization (NDA / PR).】`,
              },
              {
                id: "gc_1_5e",
                kind: "text",
                label: "e. Edge Applications · 边缘应用",
                status: "needs-confirm",
                rows: 8,
                defaultValue: `示例：腾讯 WeMake 工业互联网平台采用 TKE Edge + TCR，实现边缘自治、数据就近落到制造商机房、低时延；TCR P2P 镜像加速把公网镜像流量降为 1/N、下载耗时约 -50%。

【待 AR：WeMake 为腾讯自有平台（captive，底层制造商未具名）、无竞品替换；富士康/工业富联是具名线索但容器用法未确认。需要具名外部制造商 + 竞品 + 价值。注：边缘产品形态请以「注册节点（公网版）」等在售形态对外表述（见 2.5）。】`,
                defaultValueEn: `Example: Tencent's WeMake Industrial Internet Platform uses TKE Edge + TCR for edge autonomy, data localized to the manufacturer's premises, and low latency; TCR P2P image acceleration cuts public-network image traffic to 1/N and download time by ~50%.

【AR to supply: WeMake is Tencent's own platform (captive; underlying manufacturers unnamed) with no competitor displaced; Foxconn/FII is a named lead but container usage is unconfirmed. A named external manufacturer + competitor + value is needed. Note: present the edge product in its currently-offered form (e.g. Registered Nodes, public-network edition) — see 2.5.】`,
              },
              {
                id: "gc_1_5f",
                kind: "text",
                label: "f. Hybrid Applications (on-prem + ≥1 public cloud) · 混合应用",
                status: "needs-confirm",
                rows: 10,
                defaultValue: `示例：微众银行以私有云（自有 IDC，生产）+ 腾讯公有云弹性突发（开发测试）构成混合拓扑，公有云用 VPC、私有云用自建 underlay 打通——最贴近「本地 + 公有云」形态；南方电网（CSG）、中国太平洋保险（CPIC）基于腾讯 TCS 在异构/三方 IaaS 上构建云原生平台，定位为 OpenShift（OCP）/PCF 的替代（CSG 总部 170+ 业务系统、2 万+ 微服务实例；CPIC 释放 80%+ 闲置资源、版本迭代效率 +30%）。

【待 AR：微众为半 captive 且混合云价值未量化；CSG/CPIC 的严格「本地 + 公有云」拓扑为间接（TCS 多为本地/三方 IaaS 私有/分布式）；OCP/PCF 替换为产品级、未确认到具体客户。使能产品：TDCC / 本地专用集群 CDC。选定具名客户 + 量化 + 授权由 AR 定。】`,
                defaultValueEn: `Example: WeBank forms a hybrid topology with private cloud (own IDC, production) plus Tencent public-cloud elastic burst (dev/test), connected via VPC on the public side and a self-built underlay on the private side — the closest fit to an on-prem + public-cloud shape; China Southern Power Grid (CSG) and China Pacific Insurance (CPIC) build cloud-native platforms on heterogeneous/third-party IaaS using Tencent TCS, positioned as an OpenShift (OCP)/PCF alternative (CSG: 170+ business systems, 20,000+ microservice instances at HQ; CPIC: 80%+ idle-resource release, +30% version-iteration efficiency).

【AR to supply: WeBank is semi-captive and its hybrid value is unquantified; the strict on-prem + public-cloud topology for CSG/CPIC is indirect (TCS is mostly on-prem/third-party-IaaS private/distributed); OCP/PCF displacement is product-level, not confirmed for these specific clients. Enabling products: TDCC / local dedicated cluster CDC. Named client + metrics + authorization are AR's call.】`,
              },
            ],
          },
        ],
      },
      {
        id: "gc_q1_6",
        title: "1.6 24-month strategy to lead · 24 月领跑战略",
        zhHint: "战略愿景，部分公开锚点；选点与表态需 AR。",
        status: "strategic",
        promptEn:
          "Please describe how you plan to steer your strategy in the next 24 months to lead the Container Management market.",
        promptZh: "请描述未来 24 个月你将如何引导战略，以领跑容器管理市场。",
        groups: [
          {
            layout: "default",
            fields: [
              {
                id: "gc_1_6",
                kind: "text",
                label: "Answer · 回答",
                status: "strategic",
                rows: 12,
                reasoning: {
                  sources: [
                    src("https://www.tencentcloud.com/product/tke", "TKE = Agentic-AI 容器底座"),
                    src("https://www.tencent.com/zh-cn/articles/2202183.html", "GDES 2025 双引擎战略"),
                    src("https://mp.weixin.qq.com/s/RmHorgp3kEWL0RV6K5V_OQ", "Agent 优先 / 加速全球化（腾讯云，2026-05-28）"),
                  ],
                  quotes: [
                    "comprehensive scenario-based solutions around Agentic AI application deployment and ultimate resource efficiency, releasing infinite computing power for users in the AI era.",
                    "腾讯云公布2026年AI演进路线：首次发布涵盖基础设施、模型、生态到应用的Agent产品全景图，将MaaS平台升级为TokenHub...底层平台Cube全面开源。",
                  ],
                  reasoning:
                    "公开锚点充足(TKE=Agentic-AI 容器底座、集团智能化+全球化双引擎、Agent Runtime 从实验室到生产、2026 AI 路线/Harness/Cube 开源、全球化扩张);但具体 24 月 TKE 计划与排序是内部。",
                  decision:
                    "草稿给方向锚点;具体计划/排序、二手媒体引用升级为一手渠道标 [REVIEW: AR]。",
                },
                defaultValue: `Re Section 1 Q6（未来 24 个月领跑战略）：

四条主线：

1. 把 TKE 做成 Agentic-AI 时代的容器底座——以智能体应用部署与资源效率为设计中心，Agent SandBox 毫秒级启动，TACO、qGPU、Crane、Super Node 同在一套底座上，而非各自独立产品。

2. 集团「智能化 + 全球化」双引擎，把容器底座作为两者共同的承载层。

3. Agent Runtime 推动 Agentic AI 从实验走向生产，复用同源同构的容器底座；2026 路线把 MaaS 升级为 TokenHub、加入企业级 Agent 治理、并开源底层平台 Cube。判断是：随模型能力收敛，胜负取决于模型外的工程（Harness），而非模型本身。

4. 出海扩张：海外客户规模翻番，覆盖 55 个数据中心 / 21 个市场 / 80+ 国家，法兰克福新增可用区，海外版降低 Agent 部署门槛。

【待 AR：TKE 专属的 24 个月计划与优先级排序属内部，需产品团队确认；以上方向锚点为公开信息。】`,
                defaultValueEn: `Re Section 1 Q6 (how Tencent Cloud will steer strategy over the next 24 months to lead):

Four threads:

1. TKE as the container base for the agentic-AI era — agent-application deployment and resource efficiency as the design center, with millisecond Agent SandBox startup and TACO, qGPU, Crane, and Super Node on one base rather than as separate products.

2. A corporate twin-engine strategy, intelligence plus globalization, with the container base as the shared substrate for both.

3. Agent Runtime moving agentic AI from experiment to production on the same-source, same-architecture container base; the 2026 roadmap upgrades MaaS to TokenHub, adds enterprise agent governance, and open-sources the underlying Cube platform. The bet is that, as model capability converges, engineering — the harness around the model — decides the winner, not the model itself.

4. Going-global expansion: the overseas customer base doubled, now spanning 55 data centers across 21 markets and 80+ countries, a new Frankfurt availability zone, and overseas editions that lower the agent-deployment barrier.

【AR to supply: the TKE-specific 24-month plan and its priority ranking are internal and must be confirmed by the product team; the directional anchors above are public.】`,
              },
            ],
          },
        ],
      },
      {
        id: "gc_q1_7",
        title: "1.7 Market evolution 12–24 mo · 市场演进判断",
        zhHint: "行业观点 + 腾讯公开表态可取证；属 opinion。",
        status: "needs-confirm",
        promptEn: "Please describe how you believe the market is going to evolve in the next 12 to 24 months.",
        promptZh: "请描述你认为未来 12–24 个月这个市场将如何演进。",
        groups: [
          {
            layout: "default",
            fields: [
              {
                id: "gc_1_7",
                kind: "text",
                label: "Answer · 回答",
                status: "needs-confirm",
                rows: 12,
                reasoning: {
                  sources: [
                    src("https://mp.weixin.qq.com/s/hLr_iERh2lFhbsm4tPeAZg", "基础设施是 Agent 能力天花板（腾讯云，2026-03-17）"),
                    src("https://mp.weixin.qq.com/s/m1QxY4jWNbWI5Sd3J0gOQg", "数据库面向 Agent 全面升级 / 3.0（腾讯云，2026-05-29）"),
                  ],
                  quotes: [
                    "AI落地不只是一道算法题，更是一道工程题——随着主流大模型能力差距逐步缩小，企业比拼的不再是谁的模型更强，而是谁能通过工程化手段把模型用好。",
                    "随着 Agent 数量爆发式增长，企业对云计算基础设施的需求，将会快速从「资源供给」升级为「业务价值」。",
                  ],
                  reasoning:
                    "腾讯公开观点在 AI-Infra/云层面可取证(Chatbot→Agent、工程化/Harness 成胜负手、需求从资源供给→业务价值、云从资源时代→智能服务时代);容器细分市场读出为推断。",
                  decision:
                    "草稿给观点锚点;是否以此作为“容器管理市场”判断、192% 数字出处归属标 [REVIEW: AR]。",
                },
                defaultValue: `Re Section 1 Q7（未来 12–24 个月市场演进）：

腾讯云对未来 12–24 个月的判断（AI 基础设施 / 云层面，向容器细分映射）：

应用范式从 Chatbot 转向 AI Agent。随主流大模型能力收敛，企业比拼从谁的模型更强，转向谁能把模型用好——工具调用、分层上下文、长记忆、工作流。组织要的不是更强的模型，而是围绕模型的生产级可靠性，且随 Agent 数量增长，这一需求持续走高。

基础设施需求从资源供给升级为业务价值：更快的推理、更灵活的工具集成、更可靠的保障、更自动化的运维。今天的负载并不简单——单次 Agent 调用常跨推理、检索与有状态服务。

容器与 Kubernetes 成为生产级 Agentic-AI 负载的汇聚点——训练结果验证沙箱、推理加速、多模型服务向统一容器底座收敛，而非散落到各自定制栈。

【待 AR：① 是否把该 AI 基础设施层判断直接作为容器管理市场判断对外（容器细分为映射推断）；② 未来两年部署 Agent 的企业翻倍、GenAI 相关 IaaS 支出增速 192% 等外部量化，需确认底层出处再引用。】`,
                defaultValueEn: `Re Section 1 Q7 (how the market evolves over the next 12-24 months):

The application pattern shifts from chatbot to AI agent. As mainstream model capability converges, the contest moves from whose model is stronger to who operationalizes it — tool calling, layered context, long-lived memory, workflow. Organizations are not asking for a stronger model; they are asking for production reliability around it, and that demand grows unabatedly as agent count rises.

Demand on infrastructure moves from resource supply to business value: faster inference, flexible tool integration, stronger assurance, automated operations. The workloads of today are complex — a single agent invocation routinely spans inference, retrieval, and stateful services.

Containers and Kubernetes become the consolidation point for production agentic-AI workloads — training-result sandboxes, inference acceleration, and multi-model serving converge onto one container base rather than fragmenting across bespoke stacks.

【AR to supply: (1) whether to present this AI-infrastructure-level view directly as a Container Management market view (the container read-through is a mapped inference); (2) external figures — enterprises deploying agents doubling in two years, or 192% GenAI-related IaaS spend growth — need their underlying source confirmed before citation.】`,
              },
            ],
          },
        ],
      },
    ],
  },

  // =====================================================================
  // SECTION 2 — TECHNOLOGY
  // =====================================================================
  {
    id: "gc_s2",
    index: "2",
    title: "Technology · 技术",
    description: "容器基础设施、运营、平台、分布式 K8s、边缘、FinOps、安全等差异化能力（整体高可取证）。",
    descriptionEn:
      "Differentiating capabilities across container infrastructure, operations, platform, distributed Kubernetes, edge, FinOps, and security (high groundability overall).",
    questions: [
      {
        id: "gc_q2_1",
        title: "2.1 Container infrastructure (AI-weighted) · 容器基础设施（AI 加权）",
        zhHint: "最强技术差异化题，约 75% 可自动成稿；AI 深度细节需 AR。",
        status: "needs-confirm",
        promptEn:
          "Please highlight key differentiating capabilities related to container infrastructure (provisioning and updating compute on-premises and in the cloud, supporting various hardware environments, integrating storage and networking, and enabling backup and disaster recovery for containerized workloads). Please focus particularly on capabilities to enable the deployment of AI infrastructure enabled for containers.",
        promptZh:
          "请重点说明容器基础设施方面的关键差异化能力（本地与云上的算力供给与更新、多硬件环境支持、存储与网络集成、容器化负载的备份与容灾）。请特别聚焦于支撑容器化 AI 基础设施部署的能力。",
        groups: [
          {
            layout: "default",
            fields: [
              {
                id: "gc_2_1",
                kind: "text",
                label: "Answer · 回答",
                status: "needs-confirm",
                rows: 18,
                reasoning: {
                  sources: [
                    src("https://www.tencentcloud.com/document/product/457/51208", "TKE 集群类型总览"),
                    src("https://www.tencentcloud.com/document/product/457/54483", "Native Node"),
                    src("https://www.tencentcloud.com/document/product/457/42973", "qGPU"),
                    src("https://www.tencentcloud.com/document/product/457/69509", "TACO-LLM / AIBrix"),
                    src("https://www.tencentcloud.com/document/product/457/55042", "TKE Backup Center"),
                  ],
                  quotes: [
                    "In a single cluster, super nodes, native nodes, general CVM nodes, and IDC nodes can be added and managed at the same time...",
                    "Provide the declarative infrastructure API for users to manage nodes in the same way as workload management.",
                    "TACO-LLM... fully compatible with the open-source LLM inference framework vLLM...",
                  ],
                  reasoning:
                    "公开文档覆盖充分：供给/更新(Native Node 声明式 API、Super Node、节点池)、本地/混合(注册节点 DC+公网、边缘、分布式云中心)、硬件(NVIDIA Volta/Turing/Ampere、BM、RDMA/THCC)、存储(CBS/CFS Turbo/COS/GooseFS)、网络(GlobalRouter/VPC-CNI/Cilium-Overlay)、备份(Backup Center)、容器-AI(qGPU/TACO-LLM/AIBrix)。",
                  decision: "约 75% 自动成稿；AI 深度(Hunyuan/TI-on-TKE)、国产卡、有状态容灾 RPO/RTO、本地 AI 平价缺口、营销大数口径标 [REVIEW: AR]。",
                },
                defaultValue: `Re Section 2 Q1（容器基础设施差异化，AI 加权）：

算力供给、多硬件支持、存储与网络集成、备份容灾本身是行业门槛；差异在于 AI 基建与其他负载跑在同一套底座上。

一个控制面、多种节点：一个 general cluster 同时纳管 super node（无服务器）、native node、CVM、注册的 IDC 节点，AI 与通用负载共用一个控制面、一套 RBAC；四种集群类型（general、serverless、edge、registered）覆盖云、无服务器、边缘、本地/多云。

供给与更新：Native Node 提供声明式节点 API（像管 workload 一样管节点），OS / 运行时 / K8s 故障自愈 + 自动升级，动态调度把装箱率提升至 100% 以上，沉淀自腾讯千万核容器运营；Super Node 秒级弹性 + CVM 级隔离；TKE Serverless 99.95%+ 可用。

AI 基建（加权重点）：qGPU 单卡多容器共享、显存 + 算力细粒度隔离、近零吞吐损失、免改 CUDA（开源 Elastic GPU）；自研 TACO-LLM 完全兼容 vLLM、以容器镜像交付；TKE 文档化 AIBrix 多机分布式推理 + RDMA（THCC）训练 + checkpoint 自愈。

存储 / 网络 / 备份容灾：CBS / CFS Turbo / COS / GooseFS 走 CSI；GlobalRouter / VPC-CNI / 为混合云自研的 Cilium-Overlay（CVM 与 IDC pod 同一 overlay 平面）；TKE Backup Center 定时/即时备份至 COS、跨 AZ 调度、注册集群多云高可用/容灾。

【待 AR：本地 AI 平价缺口（qGPU / CBS 暂不支持 IDC 节点、K8s 升级仅部分）· 国产（非 NVIDIA）加速卡支持 · Hunyuan-on-TKE / TI-on-TKE 部署与量化 · 有状态容灾深度（PV 快照 vs 元数据、RPO/RTO）· 「5 万节点 / 利用率」类头部数字的方法学口径。】`,
                defaultValueEn: `Re Section 2 Q1 (differentiating container infrastructure, AI-weighted):

Provisioning compute, supporting mixed hardware, integrating storage and networking, and backup/DR are table stakes; the differentiation is that AI infrastructure runs on the same base as everything else.

One control plane, mixed node types. A single TKE general cluster runs super nodes (serverless), native nodes, standard CVM, and registered IDC nodes together, so AI and general workloads share one control plane and one RBAC; four cluster types — general, serverless, edge, registered — span cloud, serverless, edge, and on-prem/multi-cloud.

Provisioning and updating. Native Nodes expose a declarative node API — nodes managed the same way as workloads — with OS/runtime/Kubernetes fault self-healing and automatic upgrade, and dynamic scheduling that pushes packing rate above 100%, drawn from Tencent's ten-million-core container operations. Super Nodes scale out in seconds at CVM-grade isolation; TKE Serverless runs at a documented 99.95%+ availability.

AI infrastructure, the weighted part. qGPU partitions one GPU card across containers with fine-grained vRAM and compute isolation, near-zero throughput loss, and no CUDA rewrite (open-source Elastic GPU). TACO-LLM, a self-developed inference engine, is vLLM-compatible and ships as a container image. TKE documents multi-node distributed inference via AIBrix and RDMA-interconnect (THCC) training with checkpoint self-healing.

Storage, networking, backup/DR. CBS, CFS Turbo, COS, and GooseFS via CSI; GlobalRouter, VPC-CNI, and a purpose-built Cilium-Overlay where CVM and IDC pods share one overlay plane; TKE Backup Center for scheduled/instant backup to COS, cross-AZ scheduling, and registered-cluster multi-cloud HA/DR.

【AR to supply: on-prem AI parity (qGPU/CBS not yet on IDC nodes; partial K8s upgrade) · domestic (non-NVIDIA) accelerator support · Hunyuan-on-TKE / TI-on-TKE deployment and metrics · stateful DR depth (PV snapshot vs metadata; RPO/RTO) · the methodology behind headline numbers like 50,000 nodes / utilization.】`,
              },
            ],
          },
        ],
      },
      {
        id: "gc_q2_2",
        title: "2.2 Container operations (observability/SRE/AI ops) · 容器运营",
        zhHint: "高可取证（TKE 运维/监控）；草稿待补跑。",
        status: "needs-confirm",
        promptEn:
          "Please highlight key differentiating capabilities related to container operations (automating lifecycle management of orchestration clusters, resource allocation, workload scheduling, monitoring, and optimizing performance and reliability). Please focus particularly on observability, site reliability engineering (SRE), and AI-driven operations.",
        promptZh:
          "请重点说明容器运营方面的关键差异化能力（编排集群生命周期自动化、资源分配、负载调度、监控、性能与可靠性优化），尤其聚焦可观测性、SRE 与 AI 驱动运维。",
        groups: [
          {
            layout: "default",
            fields: [
              {
                id: "gc_2_2",
                kind: "text",
                label: "Answer · 回答",
                status: "needs-confirm",
                rows: 15,
                reasoning: {
                  sources: [
                    src("https://www.tencentcloud.com/document/product/457/54488", "Native Node 自愈"),
                    src("https://www.tencentcloud.com/document/product/457/60288", "EHPA 预测式弹性"),
                    src("https://www.tencentcloud.com/document/product/248/62992", "托管 Prometheus TMP"),
                    src("https://github.com/tkestack/tke-chaos-playbook", "控制面混沌工程"),
                  ],
                  quotes: [
                    "EHPA uses DSP algorithms to predict future time series data of applications.",
                    "Overload and service outage experiments are supported for control plane components (such as etcd, kube-apiserver, and CoreDNS).",
                  ],
                  reasoning:
                    "可观测/SRE/AIOps 公开覆盖约 80%：Native Node 自愈、EHPA DSP 预测式弹性、Crane 调度器、托管 Prometheus(TMP)、控制面混沌工程。",
                  decision:
                    "草稿给四类能力 + 证据；AIOps 产品英文名、营销大数、是否打“vs 托管黑盒”对比 framing 标 [REVIEW: AR]。",
                },
                defaultValue: `Re Section 2 Q2（容器运营：可观测 / SRE / AI 运维）：

生命周期自动化、调度、监控是行业门槛；三点更突出。

节点自愈：Native Node 实时检测 OS / 运行时 / K8s 数十个检查项并最小化自动修复（如 RestartRuntime / RestartKubelet），通过声明式 HealthCheckPolicy + MachineSet autoRepair 开启，底层由自研智能运维能力驱动。

预测式而非仅被动的弹性：EHPA（源自开源 Crane）用 DSP 预测负载、在高峰前预扩容，叠加 HPA / VPA / CronHPA；Crane 调度器以调度 + 运行时水位线放大节点容量、配 descheduler 再平衡利用率。

可观测：托管 Prometheus（TMP）+ Grafana + 云监控告警，与 TKE 集成，覆盖系统 / 中间件 / 应用 / 业务四层，日志、指标、告警贯穿应用到容器到集群。

可演练的控制面，不是黑盒：TKE 开源 tke-chaos-playbook，对 etcd / kube-apiserver / CoreDNS 做过载与停服演练——多数托管 K8s 把控制面当黑盒，这里把故障模式按计划演练，而不是出事时才发现。

【待 AR：智能运维产品对外英文名（文档中 Cloud Explorer / 云顾问 Cloud Advisor 口径不一，需统一）· 是否主打「可自验证控制面 vs 托管黑盒」竞品定位 · 「利用率 / 5 万节点」类头部数字的方法学口径。】`,
                defaultValueEn: `Re Section 2 Q2 (container operations: observability, SRE, AI-driven ops):

Lifecycle automation, scheduling, and monitoring are table stakes; three things stand out.

Node self-healing. Native Nodes detect OS/runtime/Kubernetes faults across dozens of checks and auto-repair (for example RestartRuntime, RestartKubelet) via a declarative HealthCheckPolicy plus MachineSet autoRepair, driven by a self-developed intelligent-ops capability.

Predictive, not just reactive, elasticity. EHPA (from the open-source Crane project) uses DSP forecasting to scale ahead of traffic peaks, on top of HPA/VPA/CronHPA; the Crane scheduler amplifies node capacity with scheduling and runtime watermarks, with a descheduler rebalancing utilization.

Observability. Managed Prometheus (TMP), Grafana, and Cloud Monitor alarms integrated with TKE across system, middleware, application, and business layers — logs, metrics, and alarms from app to container to cluster.

A control plane you can drill, not a black box. TKE open-sourced tke-chaos-playbook to run overload and outage drills against etcd, kube-apiserver, and CoreDNS. Most managed Kubernetes treats the control plane as opaque; here the failure modes are exercised on a schedule rather than discovered in an incident.

【AR to supply: the canonical English name of the intelligent-ops product (docs disagree — "Cloud Explorer" vs "Cloud Advisor / 云顾问" — needs to be unified) · whether to lead with the "self-verifiable control plane vs black-box managed K8s" competitive framing · methodology behind "utilization / 50,000-node" headline metrics.】`,
              },
            ],
          },
        ],
      },
      {
        id: "gc_q2_3",
        title: "2.3 Platform & developer experience · 平台与开发者体验",
        zhHint: "中-高可取证（CODING/TKE DevOps/平台工程）；草稿待补跑。",
        status: "needs-confirm",
        promptEn:
          "Please highlight key differentiating platform capabilities for containers (developer tools, application delivery, CI/CD integration, supporting various languages and frameworks, and abstractions to simplify deployment). Please focus both on providing an optimal developer experience directly and on enabling customers to practice platform engineering.",
        promptZh:
          "请重点说明容器平台能力（开发者工具、应用交付、CI/CD 集成、多语言多框架支持、简化部署的抽象），既包括直接提供最佳开发者体验，也包括让客户实践平台工程。",
        groups: [
          {
            layout: "default",
            fields: [
              {
                id: "gc_2_3",
                kind: "text",
                label: "Answer · 回答",
                status: "needs-confirm",
                rows: 15,
                reasoning: {
                  sources: [
                    src("https://www.tencentcloud.com/document/product/457/6763", "TKE 平台抽象"),
                    src("https://www.tencentcloud.com/document/product/457/52081", "应用市场 / Helm 3.0 / 插件"),
                    src("https://www.tencentcloud.com/products/cnb", "Cloud Native Build 开发者链"),
                    src("https://www.tencentcloud.com/product/tcr", "TCR + CODING DevOps"),
                  ],
                  quotes: [
                    "TKE provides cluster management, application management, CI/CD, and other advanced capabilities on the upper layer of Kubernetes.",
                    "TCR is integrated with CODING DevOps to automatically trigger image building, repository pushing, and service deployment upon source code update.",
                  ],
                  reasoning:
                    "平台/开发者体验覆盖好：TKE 平台抽象层、应用市场(Helm 3.0+插件三层)、CNB 端到端开发者链(CodeBuddy AI 编码)、TCR+CODING DevOps CI/CD、多语言+GitOps、TCM 网格抽象。",
                  decision:
                    "草稿给六类能力；CODING vs CNB 命名、Argo CD GitOps、OAM、CodeBuddy 深度标 [REVIEW: AR]。",
                },
                defaultValue: `Re Section 2 Q3（平台能力 / 开发者体验 / 平台工程）：

平台抽象：TKE 在原生 K8s 之上提供集群管理、应用管理、CI/CD，控制台 / kubectl / API 多入口，兼容原生 K8s API、无厂商锁定。

自助目录，平台工程的基本单元：应用市场把 Helm 3.0（Chart + 镜像 + 软件服务）与系统 / 增强 / 应用市场三层插件结合，平台团队维护一份受管目录、开发者自助取用，而非提工单。

开发者工具链：Cloud Native Build（CNB）覆盖代码托管、声明式 CI/CD 构建、一键云原生工作空间、制品库、CodeBuddy AI 编码助手。

应用交付：TCR 与 CODING DevOps 集成，源码变更触发构建→推送→部署，托管 Helm Chart、P2P 分发镜像。多语言多框架，配 GitOps / CI-CD 流水线与 Argo Workflows。

流量治理：TCM（兼容 Istio 的服务网格）在不改服务代码下做灰度发布与流量调度。

【待 AR：CODING 与 CNB 的当前正式命名关系 · GitOps-CD（Argo CD）能力未证实（公开仅见 Argo Workflows）· OAM / KubeVela 类应用模型未找到 · CodeBuddy 深度（语言、IDE 集成）。】`,
                defaultValueEn: `Re Section 2 Q3 (platform capabilities, developer experience, platform engineering):

Platform abstraction. TKE layers cluster management, application management, and CI/CD above native Kubernetes, reachable from console, kubectl, or API, with native-Kubernetes-API compatibility and no lock-in.

Self-service catalog, the platform-engineering primitive. The Application Market combines Helm 3.0 (charts plus images plus software services) with a three-tier add-on model (system, enhanced, marketplace), so a platform team curates a managed catalog its developers self-serve from rather than filing tickets.

Developer toolchain. Cloud Native Build (CNB) covers Git hosting, declarative CI/CD build, one-click cloud-native workspaces, an artifact registry, and the CodeBuddy AI coding assistant.

Application delivery. TCR integrates with CODING DevOps to trigger build, push, and deploy on source-code change, hosts Helm charts, and distributes images peer-to-peer. Multi-language and multi-framework, with GitOps/CI-CD pipelines and Argo Workflows.

Traffic governance. TCM, an Istio-compatible mesh, handles canary release and traffic shaping without touching service code.

【AR to supply: the current canonical naming/relationship of CODING vs CNB · GitOps-CD (Argo CD) capability is unconfirmed (only Argo Workflows is public) · an OAM/KubeVela-style app model was not found · CodeBuddy depth (languages, IDE integrations).】`,
              },
            ],
          },
        ],
      },
      {
        id: "gc_q2_4",
        title: "2.4 Distributed Kubernetes · 分布式 K8s",
        zhHint: "中-高可取证（分布式云中心/多集群/注册集群）；草稿待补跑。",
        status: "needs-confirm",
        promptEn:
          "Please highlight key differentiating capabilities for managing distributed Kubernetes clusters, including unified provisioning, upgrading, monitoring, governance, and workload placement across both homogeneous and heterogeneous Kubernetes distributions.",
        promptZh:
          "请重点说明管理分布式 Kubernetes 集群的差异化能力，包括跨同构与异构 K8s 发行版的统一供给、升级、监控、治理与负载放置。",
        groups: [
          {
            layout: "default",
            fields: [
              {
                id: "gc_2_4",
                kind: "text",
                label: "Answer · 回答",
                status: "needs-confirm",
                rows: 15,
                reasoning: {
                  sources: [
                    src("https://www.tencentcloud.com/document/product/1144/45536", "TDCC 总览 / Clusternet"),
                    src("https://www.tencentcloud.com/document/product/457/60285", "注册集群"),
                    src("https://www.tencentcloud.com/document/product/1144/45548", "差异化策略"),
                  ],
                  quotes: [
                    "register their Kubernetes clusters from local infrastructure or other cloud providers with TKE for unified management",
                    "Clusternet supports managing clusters in both Pull and Push modes. Even if a cluster operates within a VPC intranet, at the edge, or behind a firewall...",
                  ],
                  reasoning:
                    "5 大支柱里 4 个强：统一供给/管理(TDCC+注册集群+Clusternet)、监控、治理(统一鉴权+TCM)、负载放置(分发+差异化策略)。引擎是 Clusternet 不是 Karmada。",
                  decision:
                    "草稿给能力 + 证据；跨异构发行版的集群级“升级”无公开文档(缺口)、注册集群 GA/版本上限(1.18-1.24.5,2024-05)需现状确认、量化规模均标 [REVIEW: AR]。",
                },
                defaultValue: `Re Section 2 Q4（分布式 / 异构多集群管理）：

统一管理：TKE 分布式云中心（TDCC）在公有云 / 私有云 / 边缘云之上呈现一个控制面；注册集群把本地或其他云厂商的 K8s 纳管。引擎是腾讯自研开源的 Clusternet（不是 Karmada），支持 Pull / Push，可穿透 VPC / 防火墙 / 边缘建立隧道。

负载放置：分发策略按目标集群或 LabelSelector 下发；Globalization / Localization 差异化策略逐集群覆盖副本数与镜像，配灰度发布与回滚。

治理：跨集群统一鉴权授权、凭证轮转 / 吊销、TCM 跨异构集群流量治理。

异构 + 反锁定：全程原生 K8s API（Deployment / StatefulSet / CRD）；从单集群到多集群只是配置变更，核心已开源为 Clusternet。一处实话：跨发行版的集群级版本升级不是已文档化的能力——放置与回滚是应用级。

【待 AR：跨同构 / 异构发行版的集群级「升级」无公开文档（仅有应用级灰度 / 回滚，是真实缺口）· 注册集群当前 GA 状态与支持的 K8s 版本上限（文档为 1.18.x–1.24.5、内测、2024-05 口径，需确认现状）· 引擎是 Clusternet 而非 Karmada · TDCC 量化规模 / 客户。】`,
                defaultValueEn: `Re Section 2 Q4 (distributed and heterogeneous multi-cluster management):

Unified management. TKE Distributed Cloud Center (TDCC) presents one control plane across public, private, and edge clouds; Registered Clusters onboard Kubernetes from on-prem or another cloud provider. The engine is Clusternet, Tencent's own open-source project — not Karmada — supporting pull and push modes and tunnelling into clusters that sit behind a VPC, firewall, or at the edge.

Workload placement. A distribution policy targets clusters explicitly or by LabelSelector; a Globalization/Localization differentiation policy overrides replica count and image per cluster, with gray release and rollback.

Governance. Cross-cluster authentication and authorization, credential rotation and revocation, and TCM traffic governance across heterogeneous clusters.

Heterogeneity and anti-lock-in. Native Kubernetes APIs throughout (Deployment, StatefulSet, CRDs); single-to-multi-cluster is a config change, and the core is open-sourced as Clusternet. One honest gap: cluster-level version upgrade across distributions is not a documented capability — placement and rollback are application-level.

【AR to supply: cluster-level UPGRADE across homogeneous/heterogeneous distributions is not documented (only application-level gray/rollback — a genuine gap) · current GA status and supported Kubernetes version ceiling for registered clusters (docs say 1.18.x-1.24.5, beta, dated 2024-05 — confirm current) · the engine is Clusternet, not Karmada · TDCC quantified scale / customers.】`,
              },
            ],
          },
        ],
      },
      {
        id: "gc_q2_5",
        title: "2.5 Edge computing with containers · 边缘容器",
        zhHint: "中-高可取证（TKE Edge/SuperEdge，注意 SuperEdge 已 Archived）；草稿待补跑。",
        status: "needs-confirm",
        promptEn:
          "Please highlight key differentiating capabilities for implementing edge computing with containers, focusing on deployment, operations, and support for containers on diverse edge hardware and environments with limited connectivity.",
        promptZh:
          "请重点说明用容器实现边缘计算的差异化能力，聚焦在多样边缘硬件与弱连接环境下的部署、运营与支持。",
        groups: [
          {
            layout: "default",
            fields: [
              {
                id: "gc_2_5",
                kind: "text",
                label: "Answer · 回答",
                status: "strategic",
                rows: 15,
                reasoning: {
                  sources: [
                    src("https://www.tencentcloud.com/document/product/457/51208", "TKE 边缘集群"),
                    src("https://cloud.tencent.com/developer/techpedia/1480", "边缘容器能力(异构/隧道/弱网)"),
                    src("https://cloud.tencent.com/document/product/457/108732", "TKE-Edge 下线迁移注册节点"),
                    src("https://www.cncf.io/projects/superedge/", "SuperEdge CNCF Archived"),
                  ],
                  quotes: [
                    "支持 X86、ARM64 以及 ARM 体系架构，支持应用在不同类型资源上混合部署。",
                    "我们计划于2024年8月28日下线 TKE-Edge 边缘容器服务... 相应的产品能力已经迁移至注册节点公网版。",
                  ],
                  reasoning:
                    "能力强(弱网自治 L3-L5、分布式健康检查、异构硬件 X86/ARM、云边隧道、闭环流量)，但产品状态有冲突:CN 站 TKE-Edge 已 2024-08-28 下线并迁移注册节点公网版，国际站仍呈现 Edge cluster;SuperEdge 已 CNCF Archived。标 strategic。",
                  decision:
                    "草稿给能力 + 明确产品状态冲突;呈现哪种产品形态、SuperEdge 如何措辞 = AR/product 拍板。",
                },
                defaultValue: `Re Section 2 Q5（边缘容器 / 弱网 / 异构硬件）：

边缘的难点在于与云的链路中断时会怎样。TKE 边缘节点在断网时继续运行并自治（L3–L5，含 Kins 离线 K3s），分布式健康检查靠节点间探测 + 云边协同判定，避免弱上行触发误驱逐。

硬件层面：X86 / ARM64 / ARM，CVM / ECM / IDC / PC / IoT 混部。云边隧道可登录无公网 IP 的边缘容器；内外网证书分离 + TLS；多地域节点池保持闭环流量；监控 / 日志 / 应用市场与云上 TKE 一致。腾讯会议 20 分钟部署 50 个边缘节点、成本降约 90%。

【待 AR（提交前须产品团队拍板）：边缘产品形态存在命名冲突——CN 站独立「TKE-Edge 边缘容器服务」已于 2024-08-28 下线、能力迁移至「注册节点（公网版）」，而国际站仍将「Edge cluster」作为在用集群类型呈现，须确定对外统一表述哪种形态。另：SuperEdge 已于 2025-03-25 进入 CNCF Archived，宜表述为「已验证的开源血统，能力现存于商用 TKE 产品内」，勿当 live 项目宣传。】`,
                defaultValueEn: `Re Section 2 Q5 (edge containers, weak connectivity, heterogeneous hardware):

The hard part of edge is what happens when the link to the cloud drops. TKE edge nodes keep running and self-govern (L3-L5 autonomy, including Kins offline K3s), and a distributed health check uses node-to-node probing plus cloud-edge co-judgement so a flaky uplink does not trigger false pod eviction.

Across hardware: X86, ARM64, and ARM, mixing CVM, ECM, IDC, PC, and IoT in one deployment. A cloud-edge tunnel reaches into edge containers that have no public IP; certificates are separated for intranet and extranet over TLS; multi-region node pools keep traffic closed-loop; and monitoring, logging, and the app market are the same as in-cloud TKE. Tencent Meeting deployed 50 edge nodes in 20 minutes at about 90% lower cost.

【AR to supply (product team must resolve before submission): the edge product form has a naming conflict — the standalone CN "TKE-Edge edge container service" was retired on 2024-08-28 and its capability moved to Registered Nodes (public-network edition), while the international site still presents "Edge cluster" as a live cluster type; pick one external story. Also: SuperEdge entered CNCF Archived status on 2025-03-25 — present it as proven open-source lineage now inside the commercial TKE product, not as a live project.】`,
              },
            ],
          },
        ],
      },
      {
        id: "gc_q2_6",
        title: "2.6 FinOps & serverless containers · FinOps 与无服务器容器",
        zhHint: "中-高可取证（EKS-Serverless/超级节点/Crane）；草稿待补跑。",
        status: "needs-confirm",
        promptEn:
          "Please highlight key differentiating capabilities for FinOps and sustainability, including optimizing resource utilization and costs for containerized workloads while supporting efficient and sustainable operations. Please focus particularly on capabilities enabling serverless provisioning of container infrastructure (offloading the responsibility for sizing, provisioning, and updates of container hosts).",
        promptZh:
          "请重点说明 FinOps 与可持续性的差异化能力，包括在保障高效可持续运营的同时优化容器化负载的资源利用与成本，尤其聚焦无服务器化的容器基础设施供给（卸载容器主机的规格、供给与更新责任）。",
        groups: [
          {
            layout: "default",
            fields: [
              {
                id: "gc_2_6",
                kind: "text",
                label: "Answer · 回答",
                status: "needs-confirm",
                rows: 15,
                reasoning: {
                  sources: [
                    src("https://www.tencentcloud.com/document/product/457/39759", "Super Node 无服务器"),
                    src("https://github.com/gocrane/crane", "Crane FinOps(FinOps 基金会认证)"),
                    src("https://www.tencentcloud.com/document/product/457/56138", "节点平均利用率~14% 基线"),
                    src("https://www.tencentcloud.com/document/product/457/67310", "装箱率 >100% / 零侵入放大"),
                  ],
                  quotes: [
                    "Fees are not charged for super nodes, but charged based on the Pod resources scheduled to the super nodes.",
                    "The average resource utilization of a TKE node is merely about 14% according to the previous statistics by the TKE team.",
                  ],
                  reasoning:
                    "正中题眼:Super Node/TKE Serverless 把节点选型/供给/更新责任卸载(按 Pod 计费、秒级、99.95%+);Crane(FinOps 基金会认证、开源)+Native Node 装箱率>100% 把~14% 基线利用率拉向 50%CPU/90%内存;qGPU 在离线混部。",
                  decision:
                    "草稿给能力 + 用 14%→目标机制替代裸“300%”;可持续/碳公开仅集团/数据中心级(容器级缺口)、Super Node vs 旧“TKE Serverless 集群”命名标 [REVIEW: AR]。",
                },
                defaultValue: `Re Section 2 Q6（FinOps 与可持续 / 无服务器容器供给）：

无服务器供给是 FinOps 的杠杆。Super Node / TKE Serverless 把节点的购买、选型、初始化、更新从用户手里拿走，按 Pod 实际资源计费、秒级弹性、99.95%+ 可用，按需分配避免闲置碎片。

FinOps 工具：Crane 是腾讯自研、FinOps 基金会认证的开源调度器，提供成本可视化、闲置资源推荐、预测式 HPA、负载感知调度、混部 QoS。

诚实的利用率数字：按腾讯自测，自管 TKE 节点平均利用率约 14%；Native Node 装箱率 >100%、HouseKeeper 大盘与 Request 推荐，在不改应用代码的前提下把它拉向 50% CPU / 90% 内存。AI 成本随 qGPU 单卡共享与在离线混部下降。

【待 AR：可持续 / 碳——容器级公开无数据（仅集团碳中和 / 数据中心能效级），是本题最大缺口，需定对外 framing（以「利用率↑→节点↓→能耗↓」为代理，或引用集团碳中和承诺）· Super Node 与旧称「TKE Serverless 集群」的命名口径 · Crane 为开源多厂商共用，「差异化」宜落在深度产品化（Native Node 装箱、qGPU 混部）。】`,
                defaultValueEn: `Re Section 2 Q6 (FinOps, sustainability, and serverless container provisioning):

Serverless provisioning is the FinOps lever. Super Node and TKE Serverless take node purchase, sizing, initialization, and updates off the user — billing is on actual pod resources, scale is in seconds at 99.95%+ availability, and on-demand allocation avoids stranded capacity.

FinOps tooling. Crane, Tencent's self-developed and FinOps-Foundation-certified open-source scheduler, provides cost visibility, idle-resource recommendations, predictive HPA, load-aware scheduling, and co-location QoS.

The honest utilization number. Self-managed TKE nodes average about 14% utilization on Tencent's own measurement; Native Node packing above 100%, the HouseKeeper dashboard, and request recommendations move that toward 50% CPU and 90% memory without changing application code. AI cost follows from qGPU card sharing and online/offline co-location.

【AR to supply: SUSTAINABILITY/carbon — no container-level public figure exists (only corporate carbon-neutrality / datacenter-efficiency level), the biggest gap here; decide the external framing (a "utilization-up → fewer nodes → less power" proxy, or cite the corporate carbon-neutrality program) · Super Node vs the legacy "TKE Serverless cluster" naming · Crane is open-source/multi-vendor, so anchor differentiation on the deep in-TKE productization (Native Node packing, qGPU co-location).】`,
              },
            ],
          },
        ],
      },
      {
        id: "gc_q2_7",
        title: "2.7 Container security (supply chain) · 容器安全（供应链）",
        zhHint: "高可取证（TCR 扫描/容器安全 TCSS）；但镜像签名/content-trust 公开未证实，需 AR。草稿待补跑。",
        status: "needs-confirm",
        promptEn:
          "Please highlight key differentiating capabilities for container security, including policy enforcement, vulnerability detection, compliance, runtime protection, integration of identity and access management, and integration with secret management for containerized environments. Please focus particularly on capabilities for maintaining container software supply chain integrity.",
        promptZh:
          "请重点说明容器安全的差异化能力，包括策略实施、漏洞检测、合规、运行时保护、身份与访问管理集成、密钥管理集成，尤其聚焦维护容器软件供应链完整性的能力。",
        groups: [
          {
            layout: "default",
            fields: [
              {
                id: "gc_2_7",
                kind: "text",
                label: "Answer · 回答",
                status: "needs-confirm",
                rows: 16,
                reasoning: {
                  sources: [
                    src("https://www.tencentcloud.com/document/product/1163/50868", "TCSS 容器安全"),
                    src("https://www.tencentcloud.com/document/product/1051/52645", "TCR 镜像签名(KMS)"),
                    src("https://www.tencentcloud.com/document/product/457/60172", "TKE 策略管理(OPA Gatekeeper)"),
                    src("https://www.tencentcloud.com/product/ssm", "Secrets Manager"),
                  ],
                  quotes: [
                    "TCSS scans images and image repositories for vulnerabilities, trojans, viruses, sensitive information, and more.",
                    "TCR Enterprise supports namespace-level automatic image signing... ensuring image consistency across the entire linkage ranging from distribution to deployment.",
                  ],
                  reasoning:
                    "七个子维度覆盖好:TCSS(扫描/运行时/CIS 合规)、TCR 镜像签名(KMS RSA_2048,供应链核心)+扫描+部署阻断、TKE 策略管理(OPA Gatekeeper,require-digest/allowed-repos)、SSM 密钥、统一 CAM。",
                  decision:
                    "草稿给六组能力;SBOM 公开未找到、签名标准(Notary/cosign)未命名、签名→准入强制端到端未证实、SSM→TKE 注入未证实均标 [REVIEW: AR]。",
                },
                defaultValue: `Re Section 2 Q7（容器安全 / 软件供应链完整性）：

供应链完整性是加权重点。TCR 在命名空间级推送即自动签名、拉取时验签，密钥用 KMS RSA-2048 非对称密钥、经 CAM 角色授权——镜像从仓库到部署可追溯、可验篡改。

扫描与策略：TCSS 扫描镜像漏洞 / 木马 / 病毒 / 敏感信息并维护可信镜像白名单；漏洞扫描基于 Clair、CVE 同步，按漏洞等级阻断部署、Tag 不可变。TKE 策略管理以 OPA Gatekeeper 准入控制替代 PSP——强制镜像 digest、限制拉取源、ServiceAccount 最小权限。

运行时与密钥：TCSS 提供运行时入侵检测、容器逃逸防护、进程黑白名单、文件访问控制、CIS Benchmark 基线。Secrets Manager（SSM）以 KMS 加密 + HSM 保护 + 轮转管理密钥；CAM 是贯穿仓库、签名、密钥的统一身份面。

【待 AR：SBOM 原生生成公开文档未找到（决定省略或列入 roadmap）· 镜像签名标准（Notary / cosign）未命名——宜表述为「KMS 非对称签名与验签」· 「仅签名镜像可运行」的签名→准入强制链路未见文档，勿过度宣称 · SSM→TKE 原生密钥注入（CSI driver）未见一手文档 · TCSS 文档为 2024-01 口径，可能滞后。】`,
                defaultValueEn: `Re Section 2 Q7 (container security, with software supply-chain integrity):

Supply-chain integrity is the weighted part. TCR signs images automatically on push at namespace scope and verifies signatures on pull, using KMS RSA-2048 asymmetric keys authorized through a CAM role — so an image is traceable and tamper-evident from registry to deployment.

Scanning and policy. TCSS scans images for vulnerabilities, trojans, viruses, and sensitive data and keeps a trusted-image allowlist; vulnerability scanning is Clair-based and CVE-synced, with deploy blocking by severity and immutable tags. TKE Policy Management uses OPA Gatekeeper admission control as the PSP replacement — require an image digest, restrict pull sources, enforce ServiceAccount least privilege.

Runtime and secrets. TCSS adds runtime intrusion detection, container-escape protection, process allow/blocklists, file access control, and CIS-Benchmark baselines. Secrets Manager (SSM) holds secrets KMS-encrypted and HSM-protected with rotation, and CAM is the single identity plane across registry, signing, and secrets.

【AR to supply: native SBOM generation is not found in public docs (decide omit or roadmap) · the signing standard (Notary/cosign) is not named — describe as KMS-backed asymmetric signing and verification · a signing-to-admission enforcement chain ("only signed images run") is not documented, so do not overclaim · a native SSM-to-TKE secret injection (CSI driver) path is not in first-party docs · TCSS docs are dated 2024-01 and may lag.】`,
              },
            ],
          },
        ],
      },
    ],
  },
];
