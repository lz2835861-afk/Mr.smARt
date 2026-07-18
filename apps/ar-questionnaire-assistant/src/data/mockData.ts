import type {
  Product, Report, Questionnaire, Question, Answer,
  KnowledgeEntry, KnowledgeSource,
  QuestionnaireListItem, MeetingNote, ExpertProfile, UserRole,
  ProductTrack, PromotionChannel, PromotionPhase, Audience
} from '../types';

// ===== 产品数据 =====
export const products: Product[] = [
  { id: 'codebuddy', name: 'CodeBuddy', nameEn: 'CodeBuddy', description: 'AI 编程助手', icon: '💻', color: '#4F46E5' },
  { id: 'workbuddy', name: 'WorkBuddy', nameEn: 'WorkBuddy', description: 'AI 办公助手', icon: '🤖', color: '#7C3AED' },
  { id: 'tke', name: 'TKE', nameEn: 'Tencent Kubernetes Engine', description: '容器与 Kubernetes', icon: '☸️', color: '#0891B2' },
  { id: 'tdsql', name: 'TDSQL', nameEn: 'Tencent Distributed SQL', description: '分布式数据库', icon: '🗄️', color: '#D97706' },
  { id: 'hunyuan', name: '混元大模型', nameEn: 'HunYuan LLM', description: '大语言模型', icon: '🧠', color: '#DC2626' },
];

// ===== 报告数据 =====
export const reports: Report[] = [
  { id: 'r1', type: 'MQ', name: 'AI Code', firm: 'Gartner', productId: 'codebuddy', status: '问卷中', deadline: '2026-07-25', progress: 35 },
  { id: 'r2', type: 'Wave', name: 'AI Coding', firm: 'Forrester', productId: 'codebuddy', status: '评审中', deadline: '2026-08-18', progress: 60 },
  { id: 'r3', type: 'Universe', name: 'AI', firm: 'Omdia', productId: 'codebuddy', status: 'Briefing', deadline: '2026-09-05', progress: 15 },
  { id: 'r4', type: 'MQ', name: 'Conv. AI', firm: 'Gartner', productId: 'codebuddy', status: '问卷中', deadline: '2026-08-08', progress: 20 },
  { id: 'r5', type: 'MQ', name: 'GenAI Eng', firm: 'Gartner', productId: 'codebuddy', status: '评审中', deadline: '2026-08-28', progress: 50 },
  { id: 'r6', type: 'Universe', name: 'AI', firm: 'Omdia', productId: 'workbuddy', status: 'Briefing', deadline: '2026-09-05', progress: 10 },
  { id: 'r7', type: 'MQ', name: 'Conv. AI', firm: 'Gartner', productId: 'workbuddy', status: '问卷中', deadline: '2026-08-08', progress: 30 },
  { id: 'r8', type: 'Wave', name: 'Digital Workers', firm: 'Forrester', productId: 'workbuddy', status: 'Briefing', deadline: '2026-09-12', progress: 5 },
  { id: 'r9', type: 'MarketScape', name: 'AI', firm: 'IDC', productId: 'workbuddy', status: '问卷中', deadline: '2026-08-05', progress: 45 },
  { id: 'r10', type: 'MQ', name: 'SCPS', firm: 'Gartner', productId: 'tke', status: '问卷中', deadline: '2026-07-20', progress: 40 },
  { id: 'r11', type: 'MQ', name: 'Container', firm: 'Gartner', productId: 'tke', status: '评审中', deadline: '2026-08-10', progress: 70 },
  { id: 'r12', type: 'Wave', name: 'Public Cloud', firm: 'Forrester', productId: 'tke', status: 'Briefing', deadline: '2026-08-22', progress: 10 },
  { id: 'r13', type: 'MarketScape', name: 'IaaS', firm: 'IDC', productId: 'tke', status: '问卷中', deadline: '2026-07-30', progress: 25 },
];

// ===== 知识源 =====
export const knowledgeSources: KnowledgeSource[] = [
  { id: 'lexiang', name: '腾讯乐享', type: 'lexiang', description: '内部知识库，包含产品文档、技术白皮书、案例研究', icon: '📚', connected: true, docCount: 2341 },
  { id: 'yunzhi', name: '云知', type: 'yunzhi', description: '腾讯云内部知识管理平台，产品技术资料', icon: '☁️', connected: true, docCount: 1856 },
  { id: 'wechat', name: '腾讯云市场部公众号', type: 'wechat', description: '腾讯云官方公众号文章，包含产品发布、客户案例', icon: '📱', connected: true, docCount: 523 },
  { id: 'vb', name: 'VB (VentureBeat)', type: 'vb', description: '海外科技媒体报道，分析师常用参考来源', icon: '🌐', connected: true, docCount: 342 },
  { id: 'official', name: '腾讯云官网', type: 'official', description: 'tencentcloud.com 产品页面与文档', icon: '🏢', connected: true, docCount: 4500 },
];

// ===== 知识库条目 =====
export const knowledgeEntries: KnowledgeEntry[] = [
  { id: 'k1', title: 'CodeBuddy 产品白皮书 v3.2', url: 'https://cloud.tencent.com/product/codebuddy', type: 'lexiang', source: '腾讯乐享', summary: 'CodeBuddy 支持 30+ 编程语言，集成 DeepSeek-V3、混元等主流模型，代码补全采纳率 38%，单元测试生成覆盖率达 85%。', tags: ['CodeBuddy', '产品能力', 'AI编程'], date: '2026-06-15' },
  { id: 'k2', title: 'WorkBuddy 核心能力介绍', url: 'https://cloud.tencent.com/solution/ai', type: 'lexiang', source: '腾讯乐享', summary: 'WorkBuddy 是腾讯推出的 AI 智能办公助手，支持自然语言交互、文档处理、数据分析、代码编写等多场景办公需求。', tags: ['WorkBuddy', '产品能力', 'AI办公'], date: '2026-06-20' },
  { id: 'k3', title: '腾讯云 TI 平台技术架构', url: 'https://cloud.tencent.com/product/ti', type: 'yunzhi', source: '云知', summary: 'TI 平台支持多种深度学习框架，提供一站式 AI 训练和推理服务，支持 AngelHCF 高性能通信框架。', tags: ['TI平台', 'AI训练', '技术架构'], date: '2026-05-28' },
  { id: 'k4', title: '混元大模型海外开放进展', url: 'https://mp.weixin.qq.com/s/hUUB6qnIP_OZMw8FxqBr_A', type: 'wechat', source: '腾讯云市场部公众号', summary: '德国软件公司 Maxon 已在其 Cinema 4D 中集成混元 3D API；混元 3D 已在海外开放使用。', tags: ['混元', '3D', '海外', 'Maxon'], date: '2026-03-03' },
  { id: 'k5', title: 'Tencent HunYuan at NVIDIA GTC 2025', url: 'https://www.nvidia.com/en-us/on-demand/session/gtc25-S71563/', type: 'external', source: 'NVIDIA GTC', summary: '腾讯混元与 NVIDIA 合作构建 AngelHCF 高性能通信框架，优化大规模模型训练效率。', tags: ['混元', 'NVIDIA', 'GTC', '训练'], date: '2025-03-18' },
  { id: 'k6', title: 'TKE 容器服务能力全景', url: 'https://cloud.tencent.com/product/tke', type: 'yunzhi', source: '云知', summary: 'TKE 支持 5 个地域的多集群管理，自动扩缩容响应时间 < 30 秒，支持百万级容器调度。', tags: ['TKE', '容器', 'Kubernetes', '多集群'], date: '2026-06-01' },
  { id: 'k7', title: 'CodeBuddy 获 InfoQ 开发者最受欢迎 AI 编程工具', url: 'https://vb.venturebeat.com/codebuddy-developer-tool', type: 'vb', source: 'VentureBeat', summary: 'CodeBuddy 在开发者社区获得广泛认可，凭借多模型支持和深度代码理解能力，成为亚太区增长最快的 AI 编程工具。', tags: ['CodeBuddy', '开发者', '认可'], date: '2026-06-28' },
  { id: 'k8', title: 'TDSQL 金融级分布式数据库技术白皮书', url: 'https://cloud.tencent.com/product/tdsql', type: 'lexiang', source: '腾讯乐享', summary: 'TDSQL 支持 5 个地域的同步/异步复制，RPO ≈ 0、RTO < 30 秒；已在 50+ 金融客户生产环境验证。', tags: ['TDSQL', '金融', '容灾', '分布式'], date: '2026-05-15' },
];

// ===== 问卷数据 =====
export const questionnaireGartnerMQ_AICode: Questionnaire = {
  id: 'q1', reportId: 'r1', title: 'Gartner MQ — AI Code Assistants 2026', firm: 'Gartner',
  productName: 'CodeBuddy', deadline: '2026-07-25', totalQuestions: 12, answeredQuestions: 4,
  questions: [
    { id: 'q1-1', number: 1, category: '产品能力', question: "Describe your product's core code generation and completion capabilities, including supported languages, accuracy metrics, and developer productivity improvements.", maxWords: 500 },
    { id: 'q1-2', number: 2, category: '产品能力', question: 'What AI/ML models does your product support, and how does the model selection/routing mechanism work? Include details on model customization and fine-tuning capabilities.', maxWords: 500 },
    { id: 'q1-3', number: 3, category: '安全与合规', question: "Describe your product's approach to code security, IP protection, and compliance certifications (SOC 2, ISO 27001, etc.). How do you prevent sensitive code leakage?", maxWords: 400 },
    { id: 'q1-4', number: 4, category: '集成与生态', question: "Detail your product's IDE integrations, CI/CD pipeline support, and API/SDK availability for enterprise customization.", maxWords: 400 },
    { id: 'q1-5', number: 5, category: '客户与市场', question: 'Provide evidence of market traction: number of active users/accounts, revenue growth, key customer logos, and geographic presence.', maxWords: 400 },
    { id: 'q1-6', number: 6, category: '产品路线图', question: 'Outline your 12-18 month product roadmap, including planned features, architectural improvements, and strategic partnerships.', maxWords: 400 },
  ],
};

export const questionnaireForresterWave_AICoding: Questionnaire = {
  id: 'q2', reportId: 'r2', title: 'Forrester Wave — AI Coding Assistants Q3 2026', firm: 'Forrester',
  productName: 'CodeBuddy', deadline: '2026-08-18', totalQuestions: 15, answeredQuestions: 9,
  questions: [
    { id: 'q2-1', number: 1, category: 'Current Offering', question: 'Describe your current product offering including all major features, supported languages and frameworks, and the core value proposition for enterprise developers.', maxWords: 600 },
    { id: 'q2-2', number: 2, category: 'Strategy', question: 'What is your go-to-market strategy for the next 12 months? Include target segments, pricing model evolution, and partner ecosystem expansion plans.', maxWords: 500 },
    { id: 'q2-3', number: 3, category: 'Market Presence', question: 'Provide quantitative evidence of your market presence: revenue, customer count, developer adoption metrics, and any third-party validation (awards, rankings, etc.).', maxWords: 500 },
  ],
};

// ===== 预填答案示例 =====
const q1a1: Answer = {
  id: 'a1', questionId: 'q1-1',
  content: 'CodeBuddy supports 30+ programming languages including Python, JavaScript/TypeScript, Java, Go, C++, Rust, and Kotlin. Code completion achieves 38% adoption rate among active developers, with an average 31% reduction in coding time. The product offers intelligent code generation for functions, classes, and complete modules; context-aware multi-file editing; automated unit test generation with 85% line coverage; and intelligent code review that identifies bugs, security vulnerabilities, and performance bottlenecks. In real-world deployments, CodeBuddy has demonstrated a 2.3x improvement in developer throughput for routine coding tasks.',
  draftContent: '', status: 'approved',
  sources: [
    { id: 's1', title: 'CodeBuddy 产品白皮书 v3.2', url: 'https://cloud.tencent.com/product/codebuddy', type: 'lexiang', excerpt: 'CodeBuddy 支持 30+ 编程语言，代码补全采纳率 38%，单元测试生成覆盖率达 85%', relevance: 95 },
    { id: 's2', title: 'CodeBuddy 获 InfoQ 开发者最受欢迎 AI 编程工具', url: 'https://vb.venturebeat.com/codebuddy-developer-tool', type: 'vb', excerpt: 'CodeBuddy 成为亚太区增长最快的 AI 编程工具，开发者编码时间平均减少 31%', relevance: 85 },
  ],
  provenance: [
    { type: 'premise', content: 'CodeBuddy 白皮书提供基础能力数据：30+ 语言、38% 采纳率、85% 测试覆盖率' },
    { type: 'inference', content: 'VB 报道提供了第三方验证的开发者效率数据：31% 编码时间减少、2.3x 吞吐量提升' },
    { type: 'decision', content: '按"语言范围 → 核心功能 → 量化成果"三层铺陈；Gartner 分析师偏好具体数字 + 客户验证的组合呈现方式' },
  ],
  lastModified: '2026-07-10T14:30:00Z',
  modifications: [
    { id: 'mod1', user: 'AI 助手', action: 'draft', content: 'AI 基于知识库自动生成初稿', timestamp: '2026-07-09T09:15:00Z' },
    { id: 'mod2', user: '张三 (AR组)', action: 'edit', content: '补充了具体的开发者效率数据（31%编码时间减少、2.3x吞吐量提升），添加了单元测试覆盖率85%的数据点', timestamp: '2026-07-09T15:42:00Z', diff: '增加了两个量化数据点，调整了表述结构使其更符合 Gartner 分析师对"具体可量化"的偏好' },
    { id: 'mod3', user: '李四 (产品)', action: 'edit', content: '修正了支持语言数量（从28调整为30+），并补充了Rust和Kotlin的具体提及', timestamp: '2026-07-10T10:20:00Z', diff: '语言数量从28→30+；新增 Kotlin、Rust 显式提及' },
    { id: 'mod4', user: '王五 (AR组)', action: 'approve', content: '审阅通过，确认提交', timestamp: '2026-07-10T14:30:00Z' },
  ],
  notes: [
    { id: 'n1', user: '张三 (AR组)', content: 'Gartner 今年特别关注 AI 代码生成的实际效率数据，建议在答案开头突出 2.3x 吞吐量提升这个数据点', timestamp: '2026-07-09T15:45:00Z' },
    { id: 'n2', user: '李四 (产品)', content: 'CodeBuddy 下个版本会支持更多语言（Rust/Kotlin 已在内测），可以提前在答案中体现，对评分有帮助', timestamp: '2026-07-10T10:22:00Z' },
  ],
};

const q1a2: Answer = {
  id: 'a2', questionId: 'q1-2',
  content: 'CodeBuddy integrates multiple state-of-the-art models through an intelligent routing mechanism. Supported models include DeepSeek-V3 (general-purpose coding), HunYuan-Pro (specialized for Chinese and Asian language contexts), Claude 3.5 Sonnet (complex reasoning and architecture design), and GPT-4o (broad knowledge tasks). The model router dynamically selects the optimal model based on task type, language, and complexity — for example, routing Python ML code to DeepSeek, Chinese documentation to HunYuan, and architectural design to Claude. Enterprise customers can configure custom model preferences and fine-tune on private codebases through CodeBuddy\'s secure fine-tuning pipeline.',
  draftContent: '', status: 'approved',
  sources: [
    { id: 's3', title: 'CodeBuddy 产品白皮书 v3.2', url: 'https://cloud.tencent.com/product/codebuddy', type: 'lexiang', excerpt: '集成 DeepSeek-V3、混元等主流模型，支持智能路由和模型选择', relevance: 90 },
    { id: 's4', title: 'Tencent HunYuan at NVIDIA GTC 2025', url: 'https://www.nvidia.com/en-us/on-demand/session/gtc25-S71563/', type: 'external', excerpt: '腾讯混元与 NVIDIA 合作构建 AngelHCF 高性能通信框架', relevance: 75 },
  ],
  provenance: [
    { type: 'premise', content: '产品白皮书确认多模型集成架构和智能路由机制' },
    { type: 'premise', content: 'NVIDIA GTC 演讲验证了混元模型的技术实力和企业级合作' },
    { type: 'decision', content: '按"模型列表 → 路由机制 → 企业定制"三层展开，突出差异化（多模型智能路由）和安全性（私有化微调）' },
  ],
  lastModified: '2026-07-10T15:00:00Z',
  modifications: [
    { id: 'mod5', user: 'AI 助手', action: 'draft', content: 'AI 基于知识库自动生成初稿', timestamp: '2026-07-09T11:00:00Z' },
    { id: 'mod6', user: '张三 (AR组)', action: 'edit', content: '优化了模型路由机制的描述，增加了具体路由策略举例（Python ML→DeepSeek、中文文档→混元、架构设计→Claude）', timestamp: '2026-07-10T12:30:00Z', diff: '增加了三个具体的路由策略举例，使描述更具说服力' },
    { id: 'mod7', user: '王五 (AR组)', action: 'approve', content: '审阅通过，数据准确', timestamp: '2026-07-10T15:00:00Z' },
  ],
  notes: [
    { id: 'n3', user: '李四 (产品)', content: 'Forrester 对模型安全性非常关注，建议在答案中强调"企业可配置自定义模型偏好"这一能力', timestamp: '2026-07-10T12:35:00Z' },
  ],
};

questionnaireGartnerMQ_AICode.questions[0].answer = q1a1;
questionnaireGartnerMQ_AICode.questions[1].answer = q1a2;

// ===== 资源中心：问卷清单 =====
export const questionnaireList: QuestionnaireListItem[] = [
  { id: 'ql1', index: 1, productTrack: '智能编码', institution: 'Gartner MQ', title: 'AI Code Assistants 2026', createdAt: '2026-07-08', docUrl: '#', status: 'in-progress' },
  { id: 'ql2', index: 2, productTrack: '智能编码', institution: 'Forrester Wave', title: 'AI Coding Assistants Q3 2026', createdAt: '2026-07-10', docUrl: '#', status: 'in-progress' },
  { id: 'ql3', index: 3, productTrack: 'AI云基础设施', institution: 'Omdia Universe', title: 'AI Cloud Platforms 2026', createdAt: '2026-07-12', docUrl: '#', status: 'pending' },
  { id: 'ql4', index: 4, productTrack: 'AI云基础设施', institution: 'Gartner MQ', title: 'AI Code Assistants 2026', createdAt: '2026-07-15', docUrl: '#', status: 'pending' },
  { id: 'ql5', index: 5, productTrack: '容器', institution: 'Gartner MQ', title: 'Container Management 2026', createdAt: '2026-06-25', docUrl: '#', status: 'completed' },
  { id: 'ql6', index: 6, productTrack: '数据库', institution: 'Forrester Wave', title: 'Distributed SQL Databases', createdAt: '2026-06-20', docUrl: '#', status: 'completed' },
  { id: 'ql7', index: 7, productTrack: '云安全', institution: 'IDC MarketScape', title: 'Cloud Security 2026', createdAt: '2026-07-05', docUrl: '#', status: 'in-progress' },
  { id: 'ql8', index: 8, productTrack: '开发者工具', institution: 'Forrester Wave', title: 'AI-Powered Dev Tools 2026', createdAt: '2026-07-11', docUrl: '#', status: 'in-progress' },
];

// ===== 资源中心：会议/沟通纪要 =====
export const meetingNotes: MeetingNote[] = [
  { id: 'm1', index: 1, type: 'meeting', event: '战略云分析师-AR团队沟通', date: '06-15', summary: '讨论了2026年云赛道战略方向', relatedDoc: '《会议纪要》' },
  { id: 'm2', index: 2, type: 'meeting', event: 'Gartner国际云市场-杰出副总裁分析师Ed Anderson对Tencent Cloud加强国际品牌认知的热点建议', date: '05-26', summary: '分享了Gartner分析师对腾讯云国际化的核心建议', relatedDoc: '5.26Gartner国际云市场的杰出建议.docx', relatedUrl: '#' },
  { id: 'm3', index: 3, type: 'communication', event: 'Forrester 分析师Charlie Dai交流 - AI编程赛道', date: '06-22', summary: '了解Forrester对AI Coding的评估维度和最新趋势', relatedDoc: '《沟通纪要-AI编程》' },
  { id: 'm4', index: 4, type: 'communication', event: 'IDC 中国区研究经理Sean 沟通 - 数据库赛道', date: '06-30', summary: '对齐TDSQL在IDC MarketScape中的定位', relatedDoc: '《沟通纪要-数据库》' },
  { id: 'm5', index: 5, type: 'meeting', event: 'Omdia Universe 评审会 - WorkBuddy', date: '07-08', summary: 'WorkBuddy提交材料评审，Omdia分析师提问清单准备', relatedDoc: '《评审会议纪要》' },
  { id: 'm6', index: 6, type: 'communication', event: 'Gartner Jay 反馈 - Container MQ 进度', date: '07-10', summary: 'TKE在Container MQ中的能力项补充要求', relatedDoc: '《反馈清单》' },
];

// ===== 资源中心：专家介绍 =====
export const experts: ExpertProfile[] = [
  { id: 'e1', firm: 'IDC', name: 'Expert 1', focus: '中国云市场、企业级SaaS、数据库', history: '连续3年参与Tencent Cloud IDC MarketScape评估', contact: 'idc-expert1@idc.com' },
  { id: 'e2', firm: 'IDC', name: 'Expert 2', focus: '中国数据库市场、分布式系统', history: '主导2025、2026年IDC分布式数据库报告', contact: 'idc-expert2@idc.com' },
  { id: 'e3', firm: 'IDC', name: 'Expert 3', focus: '云安全、网络安全', history: 'IDC MarketScape云安全首席分析师', contact: 'idc-expert3@idc.com' },
  { id: 'f1', firm: 'Forrester', name: 'Expert 1', focus: 'AI编程、开发者工具、DevOps', history: 'Forrester Wave AI Coding首席分析师；每年参与分析师大会', contact: 'forrester-e1@forrester.com' },
  { id: 'f2', firm: 'Forrester', name: 'Expert 2', focus: '云原生、容器、Kubernetes', history: 'Forrester Wave Public Cloud Container', contact: 'forrester-e2@forrester.com' },
  { id: 'f3', firm: 'Forrester', name: 'Expert 3', focus: 'AI应用、Enterprise AI', history: 'Forrester Wave Enterprise AI Platforms', contact: 'forrester-e3@forrester.com' },
  { id: 'g1', firm: 'Gartner', name: 'Expert 1', focus: 'AI Code Assistants、GenAI Engineering', history: 'Gartner MQ AI Code首席分析师', contact: 'gartner-e1@gartner.com' },
  { id: 'g2', firm: 'Gartner', name: 'Expert 2', focus: 'Container Management、SCPS', history: 'Gartner MQ Container', contact: 'gartner-e2@gartner.com' },
  { id: 'o1', firm: 'Omdia', name: 'Expert 1', focus: 'AI Platforms、Universe', history: 'Omdia Universe AI', contact: 'omdia-e1@omdia.com' },
];

// ===== 目标用户角色 =====
export const userRoles: UserRole[] = [
  {
    id: 'ur1', name: 'AR团队成员', scope: 'teambrain', icon: '🧠',
    needs: ['提高工作效率', '跟踪行业最新趋势', '了解厂商竞争格局', '深入分析市场和竞争对手', '了解分析师研究领域'],
    scenarios: ['日常工作', '团队协作'],
    reportType: '内部资料 + 外部报告',
  },
  {
    id: 'ur2', name: '架构师团队', scope: 'csig-helper', icon: '🏗️',
    needs: ['提高工作效率', '跟踪行业最新趋势', '了解厂商竞争格局', '深入分析市场和竞争对手', '了解分析师研究领域'],
    scenarios: ['日常工作', '团队协作'],
    reportType: '外部报告',
  },
  {
    id: 'ur3', name: '产品团队成员', scope: 'csig-helper', icon: '🎯',
    needs: ['了解行业趋势和市场需求', '了解厂商竞争格局', '深入研究产品的竞争策略和差异化优势', '查找是否有其他可参与的报告'],
    scenarios: ['日常工作', '市场调研', '竞品分析', '新品发布准备'],
    reportType: '外部报告',
  },
  {
    id: 'ur4', name: '商务/销售团队', scope: 'csig-helper', icon: '💼',
    needs: ['了解产品市场需求和趋势', '确定产品的卖点和优势', '研究市场推广渠道和策略', '分析产品在市场中的定位与竞争力', '获取分析师对产品不足的评价', '制定和调整营销方案'],
    scenarios: ['撰写营销方案', '评估品牌定位'],
    reportType: '外部报告',
  },
  {
    id: 'ur5', name: 'IR/战略/商分', scope: 'csig-helper', icon: '📊',
    needs: ['行业洞察', '竞争对标分析', '战略决策支持', '规划落地等等'],
    scenarios: ['战略规划', '投资者问答', '答卷准备等等'],
    reportType: '外部报告',
  },
  {
    id: 'ur6', name: '营销团队成员', scope: 'csig-helper', icon: '📣',
    needs: ['了解产品市场需求和趋势', '确定产品的卖点和优势', '研究市场推广渠道和策略', '分析产品在市场中的定位与竞争力', '获取分析师对产品不足的评价', '制定和调整营销方案'],
    scenarios: ['撰写营销方案', '评估品牌定位'],
    reportType: '外部报告',
  },
  {
    id: 'ur7', name: '公共关系', scope: 'csig-helper', icon: '🤝',
    needs: ['了解自身产品不足的评价', '产品卖点和优势的深入挖掘'],
    scenarios: ['评估品牌定位'],
    reportType: '外部报告',
  },
  {
    id: 'ur8', name: '腾讯云客户', scope: 'cloud-helper', icon: '☁️',
    needs: ['快速了解腾讯云在机构里的排名情况', '了解腾讯云市场份额', '了解腾讯云优势'],
    scenarios: ['客户决策支持', '市场对标'],
    reportType: '对外发布内容',
  },
];

// ===== 产品赛道×关键词矩阵 =====
export const productTracks: ProductTrack[] = [
  { id: 'pt1', name: '云整体', keywords: { cn: ['云计算', '公有云'], en: ['Cloud', 'Public Cloud', 'Cloud Trend', 'Cloud Forecast'], analyst: { gartner: ['Magic Quadrant'], forrester: ['landscape'], idc: ['marketscape'] } } },
  { id: 'pt2', name: 'AI云基础设施', keywords: { cn: ['AI基础设施'], en: ['AI Infrastructure'], analyst: { gartner: ['Magic Quadrant for AI Infrastructure'], forrester: ['Wave AI Infrastructure'], idc: ['MarketScape AI Infrastructure'] } } },
  { id: 'pt3', name: '云安全', keywords: { cn: ['云安全', '网络安全', '计算安全'], en: ['Cloud Security', 'Cloud Network Security', 'Cloud Computing Security'], analyst: { gartner: ['Magic Quadrant for Cloud Security'], forrester: ['Wave Cloud Security'], idc: ['MarketScape Cloud Security'] } } },
  { id: 'pt4', name: '音视频', keywords: { cn: ['实时音视频', '即时通信', '通信PaaS'], en: ['TRTC', 'IM', 'CPaaS', 'Communication'], analyst: { gartner: ['MQ for CPaaS'] } } },
  { id: 'pt5', name: '边缘安全加速', keywords: { cn: ['边缘'], en: ['Edge'], analyst: { gartner: ['Magic Quadrant for Edge'] } } },
  { id: 'pt6', name: '数据库', keywords: { cn: ['数据库'], en: ['Database'], analyst: { gartner: ['Magic Quadrant for Cloud Database'], forrester: ['Wave Database'], idc: ['MarketScape Database'] } } },
  { id: 'pt7', name: '云原生', keywords: { cn: ['云原生'], en: ['Cloud Native'], analyst: { forrester: ['Wave Cloud Native'] } } },
  { id: 'pt8', name: '大数据', keywords: { cn: ['大数据'], en: ['Big Data'], analyst: { forrester: ['Wave Big Data'] } } },
  { id: 'pt9', name: '智能编码', keywords: { cn: ['智能编码', 'AI编程'], en: ['Intelligent Coding', 'AI Coding', 'Coding'], analyst: { gartner: ['MQ AI Code'], forrester: ['Wave AI Coding'] } } },
  { id: 'pt10', name: '开发者工具', keywords: { cn: ['开发者工具'], en: ['Developer Tools', 'AI-Powered Developer Tools'], analyst: { forrester: ['Wave Dev Tools'] } } },
  { id: 'pt11', name: '云智能', keywords: { cn: ['云智能', 'AI'], en: ['Cloud Intelligence', 'AI'], analyst: { gartner: ['MQ AI Engineering'], forrester: ['Wave AI'], idc: ['MarketScape AI'] } } },
  { id: 'pt12', name: '知识引擎/智能体开发平台', keywords: { cn: ['知识引擎', '智能体开发'], en: ['Knowledge Engine', 'Agent Development Platform'], analyst: { gartner: ['MQ for AI Engineering'] } } },
  { id: 'pt13', name: '业务安全/风控', keywords: { cn: ['业务安全', '风控'], en: ['Security', 'Risk Control'], analyst: { gartner: ['MQ for Application Security'] } } },
  { id: 'pt14', name: '企业级地图', keywords: { cn: ['企业级地图'], en: ['Enterprise-Grade Maps', 'mapping'], analyst: {} } },
];

// ===== 搜索关键词库 =====
export const searchKeywordLibrary = {
  evaluation: {
    label: '测评类',
    items: [
      { firm: 'Gartner', keywords: ['Magic Quadrant', 'Emerging Magic Quadrant'] },
      { firm: 'Forrester', keywords: ['Landscape', 'Wave'] },
      { firm: 'IDC', keywords: ['MarketScape'] },
    ],
  },
  trend: {
    label: '趋势类',
    items: [
      { firm: '通用', keywords: ['Trend', 'Forecast'] },
    ],
  },
};

// ===== 宣发推广：受众 =====
export const audiences: Audience[] = [
  { type: 'direct', name: 'AR团队成员', description: 'AR团队的同事', channels: ['CSIG内部平台', 'AR群聊'] },
  { type: 'direct', name: 'CSIG内需要AR团队资源的同事', description: '其他BG中需要参考分析师报告的同事', channels: ['CSIG内部平台', 'CSIG邮件'] },
  { type: 'direct', name: '对外客户', description: '需要了解腾讯云在机构里排名的客户', channels: ['云助手智能体'] },
  { type: 'influencer', name: 'AR团队leader', description: '影响AR团队资源分配的关键决策者', channels: ['一对一沟通', 'AR例会'] },
  { type: 'influencer', name: 'CSIG内协作方leader', description: '协作BG的负责人', channels: ['CSIG例会', '协作群聊'] },
  { type: 'influencer', name: 'Agent Store 技术、产品负责人', description: '该人群关心团队效率、资源利用以及如何更高效进行协作', channels: ['Agent Store 反馈渠道'] },
];

// ===== 宣发推广：多渠道 =====
export const promotionChannels: PromotionChannel[] = [
  {
    id: 'c1', category: 'internal', name: 'CSIG内部平台',
    tactics: ['发布宣发站（清晰阐述智能体定位、核心价值、使用场景、访问地址、FAQ、标题可参考"AR团队AI智能体正式上线：提效神器等你来体验！"）', '由团队leader发送正式邮件（宣发项目上线，上升至战略意义和对CSIG整体的意义）', '附带详细的说明文档和入口链接'],
    output: '宣发站 + 邮件 + 说明文档',
  },
  {
    id: 'c2', category: 'social', name: '社交媒体与社群',
    tactics: ['群聊内可先做预热（分享小贴士：智能体的prompt及使用规范等）', '随后可制造"Wow Moment"打造故事感（如某同事通过智能体快速解决一个历史难题）', '对比聚焦于真实的使用场景，突出带来的价值和提升效率', '群聊内本身是强弱连接人群的聚集地，故事性的说服力更强，但注意脱敏', '对给予开放权限的客户建立"智能体用户交流群"'],
    output: '群聊预热贴 + Wow Moment 故事 + 客户交流群',
  },
  {
    id: 'c3', category: 'experience', name: '体验式活动',
    tactics: ['线上分享/定向邀请关键团队试用', '争取协作团队的背书和口碑传播'],
    output: '试用活动 + 口碑传播',
  },
  {
    id: 'c4', category: 'content', name: '内容营销',
    tactics: ['制作短视频/编写使用教程', '定期发布智能体月报、周报（包括用户增长、热门问题top榜、精彩问答等）'],
    output: '短视频 + 教程 + 月报 + 周报',
  },
];

// ===== 宣发推广：四阶段节奏 =====
export const promotionPhases: PromotionPhase[] = [
  {
    id: 'p1', name: '预热期', period: '上线前 1-2 周', color: '#F59E0B',
    description: '内部邮件、群聊预告制造期待感，定向与协作团队以及可能开放的用户做内测，收集反馈并优化。此时可准备宣发物料（文案、视频、脚本等）',
    actions: ['内部邮件预告', '群聊预热贴', '定向内测', '收集反馈', '准备宣发物料'],
  },
  {
    id: 'p2', name: '爆发期', period: '上线当周', color: '#DC2626',
    description: '本周大概率为使用人数增快的时期，因此本周的宣发尤为重要。包含有正式邮件通知、内部平台以及群聊内的宣发贴、海报等',
    actions: ['正式邮件通知', '内部平台宣发', '群聊宣发贴', '海报发布'],
  },
  {
    id: 'p3', name: '持续期', period: '上线后 1 月内', color: '#0891B2',
    description: '此时积累了一定的用户，但存在有沉默用户和低黏性用户，需要定期激活和召回。此时可在群内分享"成功案例"，持续更新知识库内容，积极响应各方问题并给予回馈和快速迭代',
    actions: ['分享成功案例', '持续更新知识库', '积极响应反馈', '快速迭代'],
  },
  {
    id: 'p4', name: '稳定期', period: '上线 3 个月左右', color: '#059669',
    description: '可以将智能体作为团队标准伙伴融入新员工培训，定期发布月报/周报等，展示本项目的持续价值。关注客户的留存与深度使用，探索更多可能性',
    actions: ['融入新员工培训', '定期月报/周报', '关注客户留存', '探索更多可能'],
  },
];
