import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { questionnaireGartnerMQ_AICode, questionnaireForresterWave_AICoding } from '../data/mockData';
import type {
  Questionnaire, Question, Answer, ModificationRecord, Note,
  ChatMessage, ThinkingStep, AnswerSource
} from '../types';
import {
  Wand2, Check, Clock, MessageSquare, Send, Bot, User, X, Sparkles,
  ChevronLeft, ChevronRight, FileText, Copy, Save, Search, Link2,
  Lightbulb, Target, GitBranch, Plus, Pencil, Trash2, History, StickyNote,
  ChevronDown, ChevronUp, ExternalLink, Brain, Database, RefreshCw,
  ArrowRight, Minus, Package, Globe
} from 'lucide-react';
import { agentChat } from '../services/api';

const allQuestionnaires = [questionnaireGartnerMQ_AICode, questionnaireForresterWave_AICoding];

// ===== AI Drafting =====
function simulateAIDraft(question: Question): { content: string; sources: Answer['sources']; provenance: Answer['provenance'] } {
  const drafts: Record<string, { content: string; sources: Answer['sources']; provenance: Answer['provenance'] }> = {
    'q1-3': {
      content: 'CodeBuddy implements a comprehensive security framework aligned with enterprise requirements. The platform is SOC 2 Type II certified and ISO 27001:2022 compliant. For code security, CodeBuddy employs on-premises deployment options with customer-managed encryption keys (CMEK), ensuring code never leaves the customer\'s VPC. All code processing occurs within the customer\'s environment, with end-to-end TLS 1.3 encryption for data in transit and AES-256 for data at rest. The platform features automatic PII/credential detection that redacts sensitive information (API keys, passwords, tokens) before any model inference. Role-based access control (RBAC) with SSO/SAML integration ensures granular permission management.',
      sources: [
        { id: 's5', title: 'CodeBuddy 安全白皮书', url: 'https://cloud.tencent.com/product/codebuddy', type: 'lexiang', excerpt: 'CodeBuddy 已通过 SOC 2 Type II 和 ISO 27001:2022 认证，支持私有化部署和客户管理加密密钥', relevance: 95 },
        { id: 's6', title: '腾讯云安全合规中心', url: 'https://www.tencentcloud.com/security/compliance', type: 'official', excerpt: '腾讯云全线产品遵循 SOC 2、ISO 27001 等国际安全标准', relevance: 85 },
      ],
      provenance: [
        { type: 'premise', content: '安全白皮书提供了 CodeBuddy 的具体认证状态和部署模式' },
        { type: 'inference', content: '结合腾讯云官方合规页面，确认安全认证的完整性和覆盖范围' },
        { type: 'decision', content: '按"认证 → 数据保护 → 访问控制"三层展开；Gartner 对安全合规部分偏好具体认证名称 + 技术细节的组合' },
      ],
    },
    'q1-4': {
      content: 'CodeBuddy offers deep integrations across the development ecosystem. IDE support includes Visual Studio Code, JetBrains全家桶 (IntelliJ IDEA, PyCharm, GoLand, WebStorm), Eclipse, and cloud-based IDEs (GitHub Codespaces, Gitpod). CI/CD integration encompasses GitHub Actions, GitLab CI, Jenkins, and Tencent Cloud CODING DevOps, with automated code review at PR creation. REST API and gRPC SDKs are available for enterprise-grade customization, including programmatic agent triggering, custom model pipeline integration, and webhook-based event notifications.',
      sources: [
        { id: 's7', title: 'CodeBuddy 集成文档', url: 'https://cloud.tencent.com/product/codebuddy', type: 'lexiang', excerpt: '支持 VS Code、JetBrains 全系、Eclipse 等主流 IDE，提供 API/SDK 供企业定制', relevance: 92 },
      ],
      provenance: [
        { type: 'premise', content: '产品集成文档确认 IDE、CI/CD 覆盖范围' },
        { type: 'decision', content: '按"IDE → CI/CD → API/SDK"三层铺陈，每个层面列举具体产品名称以展示覆盖广度' },
      ],
    },
    'q1-5': {
      content: 'CodeBuddy has demonstrated strong market traction with over 500,000 monthly active developers across 10,000+ organizations globally. Annual recurring revenue grew 285% YoY in FY2025. Key enterprise customers include Bank of China (30,000+ developer seats), Meituan (15,000+ seats), Xiaomi (8,000+ seats). Industry recognition includes InfoQ "Most Popular AI Developer Tool 2026".',
      sources: [
        { id: 's8', title: 'CodeBuddy FY2025 年度报告', url: 'https://cloud.tencent.com/product/codebuddy', type: 'lexiang', excerpt: '月活开发者超 50 万，ARR 同比增长 285%，服务超 10,000 家企业', relevance: 95 },
        { id: 's9', title: 'CodeBuddy 获 InfoQ 开发者最受欢迎 AI 编程工具', url: 'https://vb.venturebeat.com/codebuddy-developer-tool', type: 'vb', excerpt: 'CodeBuddy 成为亚太区增长最快的 AI 编程工具', relevance: 88 },
      ],
      provenance: [
        { type: 'premise', content: '年度报告提供核心商业数据（用户数、ARR、客户数）' },
        { type: 'premise', content: 'VB 报道提供第三方验证的市场认可' },
        { type: 'decision', content: '先量化数据（50万月活、285%增长），再列举标杆客户，最后以第三方认可收尾' },
      ],
    },
    'q2-2': {
      content: 'CodeBuddy\'s GTM strategy for the next 12 months focuses on: (1) Enterprise expansion — targeting Fortune 500 companies in financial services, manufacturing, and telecommunications through dedicated enterprise sales; (2) Platform ecosystem — deepening integrations with major cloud platforms (AWS, Azure, GCP); (3) International growth — expanding presence in Southeast Asia, Middle East, and Latin America.',
      sources: [
        { id: 's10', title: 'CodeBuddy 2026 市场战略', url: 'https://cloud.tencent.com/product/codebuddy', type: 'yunzhi', excerpt: '2026年重点拓展金融、制造、电信行业头部客户', relevance: 90 },
      ],
      provenance: [
        { type: 'premise', content: '市场战略文档提供了三大支柱的具体方向' },
        { type: 'decision', content: '结构化呈现三大支柱；Forrester Wave 策略部分偏好清晰的战略框架' },
      ],
    },
  };

  return drafts[question.id] || {
    content: `Based on available documentation and product information, here is a draft response for this question. The draft follows analyst-preferred style: specific, quantifiable, and evidence-backed.\n\n[AI draft would be generated here based on knowledge base search results for "${question.question.substring(0, 80)}..."]`,
    sources: [],
    provenance: [
      { type: 'premise', content: '正在从知识库中检索相关材料...' },
      { type: 'decision', content: '将基于检索结果生成具体、可量化的分析师风格答案' },
    ],
  };
}

// ===== Agent Knowledge Base (with sources) =====
interface AgentKnowledge {
  reply: string;
  thinking: ThinkingStep[];
  sources: AnswerSource[];
}

const agentKnowledgeBase: Record<string, AgentKnowledge> = {
  'codebuddy_data': {
    thinking: [
      { id: 't1', icon: '🔍', label: '检索知识库', status: 'done', detail: '从乐享知识库检索到 CodeBuddy 产品白皮书 v3.2、FY2025 年度报告，共 3 份相关文档' },
      { id: 't2', icon: '📊', label: '分析材料', status: 'done', detail: '交叉比对白皮书中的技术指标和年度报告中的商业数据，提取 5 项核心数据点' },
      { id: 't3', icon: '✍️', label: '生成回答', status: 'done', detail: '按"语言覆盖 → 核心指标 → 商业成果"三层结构组织，确保每个数据点有据可查' },
    ],
    sources: [
      { id: 'as1', title: 'CodeBuddy 产品白皮书 v3.2', url: 'https://cloud.tencent.com/product/codebuddy', type: 'lexiang', excerpt: 'CodeBuddy 已支持 30+ 编程语言，代码补全采纳率 38%，单元测试覆盖率达 85%', relevance: 95 },
      { id: 'as2', title: 'CodeBuddy FY2025 年度报告', url: 'https://cloud.tencent.com/product/codebuddy', type: 'lexiang', excerpt: '月活开发者超 50 万，ARR 同比增长 285%，服务超 10,000 家企业', relevance: 92 },
      { id: 'as3', title: '腾讯云市场部：CodeBuddy 产品发布回顾', url: 'https://mp.weixin.qq.com/s/hUUB6qnIP_OZMw8FxqBr_A', type: 'wechat', excerpt: 'CodeBuddy 开发者编码时间平均减少 31%，代码吞吐量提升 2.3 倍', relevance: 88 },
    ],
    reply: 'CodeBuddy 目前已支持 **30+ 编程语言**，月活开发者超 **50 万**，服务 **10,000+ 家企业**。核心数据：\n\n📊 **技术指标**\n• 代码补全采纳率：**38%**\n• 单元测试覆盖率：**85%**\n\n📈 **商业成果**\n• 开发者编码时间平均减少：**31%**\n• 代码吞吐量提升：**2.3x**\n• ARR 同比增长：**285%**（FY2025）\n\n🏢 **标杆客户**\n• 中国银行：30,000+ 开发者席位\n• 美团：15,000+ 席位\n• 小米：8,000+ 席位\n\n这些数据适合用于 Gartner MQ 和 Forrester Wave 问卷中关于市场表现、客户规模和产品能力的回答。',
  },
  'security': {
    thinking: [
      { id: 't1', icon: '🔍', label: '检索知识库', status: 'done', detail: '从乐享知识库检索到 CodeBuddy 安全白皮书、SOC 2 审计报告摘要，从腾讯云官网获取安全合规页面信息' },
      { id: 't2', icon: '📊', label: '分析材料', status: 'done', detail: '提取认证列表、加密标准、部署模式、访问控制四类信息，构建安全能力矩阵' },
      { id: 't3', icon: '✍️', label: '生成回答', status: 'done', detail: '按"认证 → 数据保护 → 部署安全 → 访问控制"四层结构组织，分析师偏好具体认证名称 + 技术细节' },
    ],
    sources: [
      { id: 'as4', title: 'CodeBuddy 安全白皮书', url: 'https://cloud.tencent.com/product/codebuddy', type: 'lexiang', excerpt: '已通过 SOC 2 Type II 和 ISO 27001:2022 认证，支持 VPC 私有化部署和 CMEK', relevance: 96 },
      { id: 'as5', title: '腾讯云安全合规中心', url: 'https://www.tencentcloud.com/security/compliance', type: 'official', excerpt: '腾讯云全线产品遵循 SOC 2、ISO 27001、CSA STAR 等国际安全标准', relevance: 85 },
    ],
    reply: 'CodeBuddy 安全方面已通过 **SOC 2 Type II** 和 **ISO 27001:2022** 认证。\n\n🔒 **数据保护**\n• 支持 **VPC 私有化部署**，代码不出企业网络\n• **客户管理加密密钥 (CMEK)**\n• TLS 1.3 传输加密 + AES-256 静态加密\n\n🛡️ **隐私与合规**\n• 自动检测并脱敏 PII/凭证（API keys、密码、Token）\n• RBAC + SSO/SAML 细粒度权限控制\n\n这些信息在回答 Gartner 安全和合规相关问题时非常关键。',
  },
  'model': {
    thinking: [
      { id: 't1', icon: '🔍', label: '检索知识库', status: 'done', detail: '从云知检索到 CodeBuddy 多模型架构文档，包含模型列表、路由策略和微调能力说明' },
      { id: 't2', icon: '📊', label: '分析材料', status: 'done', detail: '整理各模型的适用场景、性能基准和客户定制案例' },
      { id: 't3', icon: '✍️', label: '生成回答', status: 'done', detail: '按"模型列表 → 路由机制 → 企业定制"三层展开，突出差异化（多模型智能路由）和安全性（私有化微调）' },
    ],
    sources: [
      { id: 'as6', title: 'CodeBuddy 多模型架构白皮书', url: 'https://cloud.tencent.com/product/hunyuan', type: 'yunzhi', excerpt: '采用多模型智能路由机制，集成 DeepSeek-V3、混元-Pro、Claude 3.5 Sonnet、GPT-4o 等模型', relevance: 94 },
      { id: 'as7', title: 'NVIDIA GTC 2026：腾讯混元模型技术演讲', url: 'https://cloud.tencent.com/product/hunyuan', type: 'wechat', excerpt: '混元模型在企业级代码生成场景的评测中表现优异', relevance: 82 },
    ],
    reply: 'CodeBuddy 采用**多模型智能路由**机制：\n\n🤖 **模型矩阵**\n• **DeepSeek-V3** → 通用编程任务\n• **混元-Pro** → 中文/亚洲语言场景\n• **Claude 3.5 Sonnet** → 复杂推理和架构设计\n• **GPT-4o** → 广泛知识任务\n\n🧠 **智能路由**\n• 根据任务类型自动选择最优模型\n• 支持企业自定义模型偏好配置\n\n🔧 **企业定制**\n• 私有化模型微调管道\n• 支持在客户代码库上训练定制模型',
  },
  'questionnaire_list': {
    thinking: [
      { id: 't1', icon: '🔍', label: '检索知识库', status: 'done', detail: '查询当前活跃的分析师问卷列表，共 2 份待处理' },
      { id: 't2', icon: '📊', label: '分析材料', status: 'done', detail: '计算各问卷的完成进度和截止日期紧迫度' },
      { id: 't3', icon: '✍️', label: '生成回答', status: 'done', detail: '按截止日期排序，标注优先级' },
    ],
    sources: [],
    reply: '当前有 **2 份** 活跃问卷待处理：\n\n📋 **1. Gartner MQ — AI Code Assistants 2026**\n   机构：Gartner | 产品：CodeBuddy\n   截止：**2026-07-25**（还剩 12 天）\n   进度：4/12 题已完成\n\n📋 **2. Forrester Wave — AI Coding Assistants Q3 2026**\n   机构：Forrester | 产品：CodeBuddy\n   截止：**2026-08-18**（还剩 36 天）\n   进度：9/15 题已完成\n\n建议优先完成 Gartner MQ 问卷（截止日期更近）。需要我帮你填写哪份问卷？',
  },
  'default': {
    thinking: [
      { id: 't1', icon: '🔍', label: '检索知识库', status: 'done', detail: '在乐享、云知、公众号三个知识源中搜索相关材料' },
      { id: 't2', icon: '📊', label: '分析理解', status: 'done', detail: '分析问题意图，匹配最相关的知识条目' },
      { id: 't3', icon: '✍️', label: '生成回答', status: 'done', detail: '基于检索结果生成结构化回答，标注信息来源' },
    ],
    sources: [],
    reply: '好的，我理解你的问题。让我从知识库中检索相关信息...\n\n你可以尝试问我：\n• "CodeBuddy 的核心数据是什么？"\n• "CodeBuddy 的安全能力如何？"\n• "CodeBuddy 支持哪些模型？"\n• "当前有哪些问卷需要填写？"\n\n或者直接告诉我你想优化哪个答案，我会帮你处理。',
  },
};

function findAgentReply(input: string): AgentKnowledge {
  const lower = input.toLowerCase();
  if (lower.includes('code') || lower.includes('数据') || lower.includes('能力') || lower.includes('指标')) return agentKnowledgeBase.codebuddy_data;
  if (lower.includes('安全') || lower.includes('合规') || lower.includes('认证')) return agentKnowledgeBase.security;
  if (lower.includes('模型') || lower.includes('model') || lower.includes('路由')) return agentKnowledgeBase.model;
  if (lower.includes('问卷') || lower.includes('哪些') || lower.includes('列表')) return agentKnowledgeBase.questionnaire_list;
  return agentKnowledgeBase.default;
}

// ===== Welcome Message =====
const welcomeMessage: ChatMessage = {
  id: 'w1',
  role: 'agent',
  content: '你好！我是 Mr.smARt，由 **腾讯混元大模型（HY3）** 驱动的分析师问卷助手。我可以帮你：\n\n📋 **查看问卷** — 浏览所有待填写的分析师问卷\n📝 **起草答案** — 基于知识库自动生成符合分析师风格的答案\n🔍 **搜索依据** — 从乐享、云知、公众号检索支撑材料\n💡 **优化答案** — 按你提供的方向修改和完善答案\n\n请告诉我你需要什么帮助？',
  timestamp: new Date().toISOString(),
};

// ===== Component =====
export default function QuestionnairePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const qid = searchParams.get('q');
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState<Questionnaire | null>(
    qid ? (allQuestionnaires.find(q => q.id === qid) || null) : null
  );
  const [activeQuestion, setActiveQuestion] = useState<Question | null>(
    selectedQuestionnaire?.questions[0] || null
  );
  const [editingAnswer, setEditingAnswer] = useState('');
  const [isDrafting, setIsDrafting] = useState(false);
  const [activeTab, setActiveTab] = useState<'answer' | 'sources' | 'provenance'>('answer');
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [newNote, setNewNote] = useState('');

  // Agent chat
  const [showAgentChat, setShowAgentChat] = useState(false);
  const [agentMode, setAgentMode] = useState<'csig' | 'marketing'>('csig');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([welcomeMessage]);
  const [chatInput, setChatInput] = useState('');
  const [isAgentThinking, setIsAgentThinking] = useState(false);
  const [hasUserMessage, setHasUserMessage] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatTextareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Track expanded thinking for each message
  const [expandedThinking, setExpandedThinking] = useState<Record<string, boolean>>({});
  const [expandedSources, setExpandedSources] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (selectedQuestionnaire && activeQuestion) {
      setEditingAnswer(activeQuestion.answer?.content || '');
    }
  }, [activeQuestion, selectedQuestionnaire]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSelectQuestionnaire = (q: Questionnaire) => {
    setSelectedQuestionnaire(q);
    setActiveQuestion(q.questions[0]);
    setSearchParams({ q: q.id });
  };

  const handleBackToCards = () => {
    setSelectedQuestionnaire(null);
    setActiveQuestion(null);
    setSearchParams({});
  };

  const handleSelectQuestion = (q: Question) => {
    setActiveQuestion(q);
  };

  const handleAIDraft = () => {
    if (!activeQuestion) return;
    setIsDrafting(true);
    setTimeout(() => {
      const draft = simulateAIDraft(activeQuestion);
      const answer: Answer = {
        id: `a-${activeQuestion.id}-${Date.now()}`,
        questionId: activeQuestion.id,
        content: draft.content,
        draftContent: draft.content,
        status: 'draft',
        sources: draft.sources,
        provenance: draft.provenance,
        lastModified: new Date().toISOString(),
        modifications: [
          { id: `mod-${Date.now()}`, user: 'AI 助手', action: 'draft', content: 'AI 基于知识库自动生成初稿', timestamp: new Date().toISOString() },
        ],
        notes: [],
      };
      const updatedQuestion = { ...activeQuestion, answer };
      setActiveQuestion(updatedQuestion);
      if (selectedQuestionnaire) {
        setSelectedQuestionnaire({
          ...selectedQuestionnaire,
          questions: selectedQuestionnaire.questions.map(q =>
            q.id === activeQuestion.id ? updatedQuestion : q
          ),
        });
      }
      setEditingAnswer(draft.content);
      setIsDrafting(false);
      setActiveTab('answer');
    }, 1500);
  };

  const handleApprove = () => {
    if (!activeQuestion?.answer || !selectedQuestionnaire) return;
    const newMod: ModificationRecord = {
      id: `mod-${Date.now()}`,
      user: '我 (当前用户)',
      action: 'approve',
      content: '审阅通过，确认提交',
      timestamp: new Date().toISOString(),
    };
    const updated = {
      ...activeQuestion.answer,
      status: 'approved' as const,
      content: editingAnswer,
      lastModified: new Date().toISOString(),
      modifications: [...(activeQuestion.answer.modifications || []), newMod],
    };
    const updatedQuestion = { ...activeQuestion, answer: updated };
    setActiveQuestion(updatedQuestion);
    setSelectedQuestionnaire({
      ...selectedQuestionnaire,
      questions: selectedQuestionnaire.questions.map(q =>
        q.id === activeQuestion.id ? updatedQuestion : q
      ),
      answeredQuestions: selectedQuestionnaire.questions.filter(q =>
        q.id === activeQuestion.id ? true : q.answer?.status === 'approved'
      ).length,
    });
  };

  const handleSaveEdit = () => {
    if (!activeQuestion?.answer || !selectedQuestionnaire) return;
    const newMod: ModificationRecord = {
      id: `mod-${Date.now()}`,
      user: '我 (当前用户)',
      action: 'edit',
      content: '手动编辑修改了答案内容',
      timestamp: new Date().toISOString(),
      diff: '用户手动修改了答案文本',
    };
    const updated = {
      ...activeQuestion.answer,
      content: editingAnswer,
      lastModified: new Date().toISOString(),
      modifications: [...(activeQuestion.answer.modifications || []), newMod],
    };
    setActiveQuestion({ ...activeQuestion, answer: updated });
    setSelectedQuestionnaire({
      ...selectedQuestionnaire,
      questions: selectedQuestionnaire.questions.map(q =>
        q.id === activeQuestion.id ? { ...activeQuestion, answer: updated } : q
      ),
    });
  };

  const handleAddNote = () => {
    if (!newNote.trim() || !activeQuestion?.answer || !selectedQuestionnaire) return;
    const note: Note = {
      id: `note-${Date.now()}`,
      user: '我 (当前用户)',
      content: newNote.trim(),
      timestamp: new Date().toISOString(),
    };
    const updated = {
      ...activeQuestion.answer,
      notes: [...(activeQuestion.answer.notes || []), note],
    };
    setActiveQuestion({ ...activeQuestion, answer: updated });
    setSelectedQuestionnaire({
      ...selectedQuestionnaire,
      questions: selectedQuestionnaire.questions.map(q =>
        q.id === activeQuestion.id ? { ...activeQuestion, answer: updated } : q
      ),
    });
    setNewNote('');
    setShowNoteInput(false);
  };

  // ===== Agent Chat Handlers =====
  const toggleThinking = (msgId: string) => {
    setExpandedThinking(prev => ({ ...prev, [msgId]: !prev[msgId] }));
  };
  const toggleSources = (msgId: string) => {
    setExpandedSources(prev => ({ ...prev, [msgId]: !prev[msgId] }));
  };

  // 快捷话题标签：将提示词注入输入框并自动发送
  const handleQuickPrompt = (topic: string) => {
    const promptMap: Record<string, string> = {
      '产品信息': '请帮我梳理腾讯云 CodeBuddy 的产品信息，包括核心功能、技术架构和关键指标。',
      '资讯视野': '请汇总最近一个月内，腾讯云在 AI、大模型、云计算领域的最新行业资讯和市场动态。',
      '最新精华': '请从知识库中检索最近一周的精华内容，包括重要客户案例、产品发布和技术白皮书。',
    };
    const prompt = promptMap[topic] || `请帮我了解「${topic}」相关的内容。`;
    setChatInput(prompt);
    setHasUserMessage(true);
    // 等 React 完成 state 更新后触发发送
    setTimeout(() => {
      handleSendChat();
    }, 50);
  };

  // 自动调整 textarea 高度
  useEffect(() => {
    const ta = chatTextareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    const max = 160;
    ta.style.height = Math.min(ta.scrollHeight, max) + 'px';
  }, [chatInput, hasUserMessage]);

  const handleSendChat = async () => {
    if (!chatInput.trim() || isAgentThinking) return;
    setHasUserMessage(true);
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: chatInput.trim(),
      timestamp: new Date().toISOString(),
    };
    const queryText = chatInput.trim();
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsAgentThinking(true);

    // 创建思考中的占位消息
    const thinkingId = `thinking-${Date.now()}`;
    const baseThinkingSteps: ThinkingStep[] = [
      { id: 'th1', icon: '🔍', label: '检索知识库', status: 'running', detail: '正在从乐享、云知、公众号三个知识源中搜索相关材料...' },
      { id: 'th2', icon: '🧠', label: '混元大模型推理', status: 'pending', detail: '' },
      { id: 'th3', icon: '✍️', label: '生成结构化回答', status: 'pending', detail: '' },
    ];

    const thinkingMsg: ChatMessage = {
      id: thinkingId,
      role: 'agent',
      content: '',
      timestamp: new Date().toISOString(),
      thinkingSteps: baseThinkingSteps,
      isThinking: true,
      sources: [],
    };
    setChatMessages(prev => [...prev, thinkingMsg]);

    // 构建对话历史（最近10轮）
    const history: { role: 'user' | 'assistant'; content: string }[] = [];
    for (let i = chatMessages.length - 1; i >= 0 && history.length < 20; i--) {
      const m = chatMessages[i];
      if (m.role === 'user') history.unshift({ role: 'user', content: m.content });
      if (m.role === 'agent' && m.content && !m.isThinking) history.unshift({ role: 'assistant', content: m.content });
    }
    history.push({ role: 'user', content: queryText });

    // 第一步：更新思考步骤1为"检索中"
    setChatMessages(prev => prev.map(m => {
      if (m.id === thinkingId) {
        return {
          ...m,
          thinkingSteps: m.thinkingSteps?.map((s, i) =>
            i === 0 ? { ...s, status: 'running' as const } : s
          ),
        };
      }
      return m;
    }));

    try {
      // 使用非流式 API（更可靠，避免 SSE/代理缓冲问题）
      const result = await agentChat(history, agentMode);

      if (result.fallback || result.error) {
        // 降级模式：用本地规则匹配 + 知识库来源
        const apiSources: AnswerSource[] = result.sources.map((s, idx) => ({
          id: `hy-src-${idx}`,
          title: s.title,
          url: s.url,
          type: s.source as AnswerSource['type'],
          excerpt: s.excerpt,
          relevance: s.relevance,
        }));

        const kn = findAgentReply(queryText);

        setChatMessages(prev => prev.map(m => {
          if (m.id === thinkingId) {
            return {
              ...m,
              content: kn.reply,
              thinkingSteps: kn.thinking,
              sources: kn.sources.length > 0 ? kn.sources : apiSources,
              isThinking: false,
            };
          }
          return m;
        }));
        setExpandedThinking(prev => ({ ...prev, [thinkingId]: true }));
      } else {
        // 混元大模型正常返回
        const apiSources: AnswerSource[] = result.sources.map((s, idx) => ({
          id: `hy-src-${idx}`,
          title: s.title,
          url: s.url,
          type: s.source as AnswerSource['type'],
          excerpt: s.excerpt,
          relevance: s.relevance,
        }));

        const hyThinkingSteps: ThinkingStep[] = [
          { id: 'th1', icon: '🔍', label: '检索知识库', status: 'done', detail: `从知识库检索到 ${apiSources.length} 份相关文档` },
          { id: 'th2', icon: '🧠', label: '混元大模型推理', status: 'done', detail: `消耗 ${result.usage?.prompt_tokens || 0} + ${result.usage?.completion_tokens || 0} tokens` },
          { id: 'th3', icon: '✍️', label: '生成结构化回答', status: 'done', detail: `回答生成完成，共 ${(result.content || '').length} 字符` },
        ];

        setChatMessages(prev => prev.map(m => {
          if (m.id === thinkingId) {
            return {
              ...m,
              content: result.content || '',
              thinkingSteps: hyThinkingSteps,
              sources: apiSources,
              isThinking: false,
            };
          }
          return m;
        }));
        setExpandedThinking(prev => ({ ...prev, [thinkingId]: true }));
      }

      // 自动展开引用来源
      setTimeout(() => {
        setChatMessages(prev => {
          const msg = prev.find(m => m.id === thinkingId);
          if (msg?.sources && msg.sources.length > 0) {
            setExpandedSources(prev2 => ({ ...prev2, [thinkingId]: true }));
          }
          return prev;
        });
      }, 300);

    } catch (error: any) {
      // 网络错误：完全降级到本地规则匹配
      console.error('[Agent Chat] 请求失败，使用本地降级:', error.message);
      const kn = findAgentReply(queryText);

      setChatMessages(prev => prev.map(m => {
        if (m.id === thinkingId) {
          return {
            ...m,
            content: kn.reply,
            thinkingSteps: [
              { id: 'th1', icon: '🔍', label: '检索知识库', status: 'done', detail: '后端服务不可达，使用本地知识库' },
              { id: 'th2', icon: '⚠️', label: '网络异常', status: 'done', detail: `请求失败: ${error.message}` },
              { id: 'th3', icon: '✍️', label: '生成回答', status: 'done', detail: '基于本地预置知识生成回答' },
            ],
            sources: kn.sources,
            isThinking: false,
          };
        }
        return m;
      }));
      setExpandedThinking(prev => ({ ...prev, [thinkingId]: true }));
    } finally {
      setIsAgentThinking(false);
    }
  };

  // ===== Helper Functions =====
  const getStatusIcon = (status?: string) => {
    if (status === 'approved') return <Check size={12} />;
    if (status === 'draft') return <Clock size={12} />;
    return null;
  };

  const statusLabel = (status?: string) => {
    const map: Record<string, string> = { draft: '草稿', reviewing: '评审中', approved: '已确认' };
    return status ? map[status] || status : '';
  };

  const actionLabel = (action: string) => {
    const map: Record<string, string> = { draft: 'AI 起草', edit: '编辑修改', approve: '审阅通过' };
    return map[action] || action;
  };

  const sourceIcon = (type: string) => {
    const map: Record<string, string> = { lexiang: '📚', yunzhi: '☁️', wechat: '📱', vb: '🌐', official: '🏢', external: '🔗' };
    return map[type] || '📄';
  };

  const sourceLabel = (type: string) => {
    const map: Record<string, string> = { lexiang: '腾讯乐享', yunzhi: '云知', wechat: '公众号', vb: 'VentureBeat', official: '官网', external: '外部来源' };
    return map[type] || type;
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  // Horizontal scroll
  const scrollLeft = () => { scrollRef.current?.scrollBy({ left: -320, behavior: 'smooth' }); };
  const scrollRight = () => { scrollRef.current?.scrollBy({ left: 320, behavior: 'smooth' }); };

  return (
    <div className="page-container" style={{ maxWidth: '100%', padding: '20px 28px' }}>
      {/* ===== Top: Horizontal Scroll Section ===== */}
      <div style={{ position: 'relative', marginBottom: selectedQuestionnaire ? '24px' : '32px' }}>
        <button className="scroll-arrow scroll-arrow-left" onClick={scrollLeft}>
          <ChevronLeft size={20} />
        </button>
        <div ref={scrollRef} className="horizontal-scroll">
          {/* Agent Entry Card */}
          <div
            className="agent-entry-card"
            onClick={() => { setShowAgentChat(true); setChatMessages([welcomeMessage]); setHasUserMessage(false); setChatInput(''); }}
          >
            <div className="agent-entry-icon">
              <Bot size={28} />
            </div>
            <div className="agent-entry-content">
              <h3>Mr.smARt 智能体</h3>
              <p>AI 问卷助手，随时解答你的问题</p>
              <span className="agent-entry-cta">
                <MessageSquare size={14} /> 点击提问
              </span>
            </div>
            <div className="agent-entry-glow" />
          </div>

          {/* Questionnaire Cards */}
          {allQuestionnaires.map((q, i) => {
            const isActive = selectedQuestionnaire?.id === q.id;
            const answered = q.questions.filter(qq => qq.answer?.status === 'approved').length;
            return (
              <div
                key={q.id}
                className={`questionnaire-card${isActive ? ' active' : ''}`}
                onClick={() => handleSelectQuestionnaire(q)}
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="qcard-firm">
                  <span className={`firm-badge ${q.firm.toLowerCase()}`}>{q.firm}</span>
                  <span className="qcard-deadline">截止 {q.deadline.replace('2026-', '')}</span>
                </div>
                <h4 className="qcard-title">{q.title}</h4>
                <div className="qcard-meta">
                  <span className="qcard-product">{q.productName}</span>
                  <span className="qcard-count">{q.totalQuestions} 题</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div className="progress-bar" style={{ flex: 1, height: '5px' }}>
                    <div className="progress-fill" style={{ width: `${Math.round((answered / q.totalQuestions) * 100)}%` }} />
                  </div>
                  <span style={{ fontSize: '11px', color: '#6B7280', fontWeight: 500 }}>{answered}/{q.totalQuestions}</span>
                </div>
              </div>
            );
          })}
        </div>
        <button className="scroll-arrow scroll-arrow-right" onClick={scrollRight}>
          <ChevronRight size={20} />
        </button>
      </div>

      {/* ===== Questionnaire Detail ===== */}
      {selectedQuestionnaire && activeQuestion ? (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
            <button className="btn btn-sm" onClick={handleBackToCards} style={{ fontSize: '12px' }}>
              <ChevronLeft size={14} /> 返回问卷列表
            </button>
            <span className="firm-badge">{selectedQuestionnaire.firm}</span>
            <span style={{ fontSize: '13px', color: '#6B7280' }}>{selectedQuestionnaire.productName}</span>
            <span style={{ fontSize: '12px', color: '#9CA3AF' }}>· 截止 {selectedQuestionnaire.deadline}</span>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="progress-bar" style={{ width: '160px' }}>
                <div className="progress-fill" style={{ width: `${Math.round((selectedQuestionnaire.answeredQuestions / selectedQuestionnaire.totalQuestions) * 100)}%` }} />
              </div>
              <span style={{ fontSize: '12px', color: '#6B7280' }}>{selectedQuestionnaire.answeredQuestions}/{selectedQuestionnaire.totalQuestions}</span>
            </div>
          </div>

          <div className="questionnaire-layout">
            <div className="question-list-panel">
              <div className="question-list-header">
                <span>题目列表</span>
                <span className="question-list-progress">{selectedQuestionnaire.answeredQuestions}/{selectedQuestionnaire.totalQuestions}</span>
              </div>
              {selectedQuestionnaire.questions.map(q => (
                <div
                  key={q.id}
                  className={`question-list-item${activeQuestion.id === q.id ? ' active' : ''}${q.answer?.status === 'approved' ? ' completed' : ''}`}
                  onClick={() => handleSelectQuestion(q)}
                >
                  <div className="question-num">
                    {q.answer?.status === 'approved' ? <Check size={12} /> : q.number}
                  </div>
                  <div>
                    <div className="question-list-category">{q.category}</div>
                    <div className="question-list-title">{q.question}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="answer-editor">
              <div className="answer-editor-header">
                <div className="answer-question-meta">
                  <span className="answer-category-badge">{activeQuestion.category}</span>
                  {activeQuestion.maxWords && <span className="answer-word-limit">建议 ≤ {activeQuestion.maxWords} 词</span>}
                  {activeQuestion.answer?.status && (
                    <span className={`answer-status ${activeQuestion.answer.status}`}>
                      {getStatusIcon(activeQuestion.answer.status)}{statusLabel(activeQuestion.answer.status)}
                    </span>
                  )}
                </div>
                <div className="answer-question-text">Q{activeQuestion.number}. {activeQuestion.question}</div>
                <div className="answer-toolbar">
                  <button className="btn btn-primary" onClick={handleAIDraft} disabled={isDrafting}>
                    {isDrafting ? (<><Sparkles size={15} className="spin" /> AI 起草中...</>) : (<><Wand2 size={15} /> AI 生成答案</>)}
                  </button>
                  <button className="btn"><Search size={15} /> 搜索知识库</button>
                  <button className="btn"><Copy size={15} /> 复制</button>
                  <button className={`btn ${activeQuestion.answer?.status === 'approved' ? 'btn-success' : ''}`} onClick={handleApprove} disabled={!activeQuestion.answer}>
                    <Check size={15} /> 确认答案
                  </button>
                </div>
              </div>

              <div className="tabs">
                <button className={`tab${activeTab === 'answer' ? ' active' : ''}`} onClick={() => setActiveTab('answer')}>
                  <FileText size={14} style={{ marginRight: '6px', display: 'inline', verticalAlign: '-2px' }} /> 答案
                </button>
                <button className={`tab${activeTab === 'sources' ? ' active' : ''}`} onClick={() => setActiveTab('sources')}>
                  <Link2 size={14} style={{ marginRight: '6px', display: 'inline', verticalAlign: '-2px' }} /> 引用来源
                  {activeQuestion.answer?.sources && activeQuestion.answer.sources.length > 0 && (
                    <span style={{ fontSize: '10px', marginLeft: '4px', background: '#EEF2FF', color: '#4F46E5', padding: '1px 5px', borderRadius: '8px' }}>{activeQuestion.answer.sources.length}</span>
                  )}
                </button>
                <button className={`tab${activeTab === 'provenance' ? ' active' : ''}`} onClick={() => setActiveTab('provenance')}>
                  <GitBranch size={14} style={{ marginRight: '6px', display: 'inline', verticalAlign: '-2px' }} /> 溯源
                </button>
              </div>

              {activeTab === 'answer' && (
                <div>
                  {!activeQuestion.answer?.content && !editingAnswer ? (
                    <div className="empty-state">
                      <div className="empty-state-icon">📝</div>
                      <h3>尚未填写答案</h3>
                      <p>点击"AI 生成答案"，系统将自动从知识库检索相关材料并起草回答</p>
                    </div>
                  ) : (
                    <>
                      <textarea className="answer-textarea" value={editingAnswer} onChange={(e) => setEditingAnswer(e.target.value)} placeholder="在此编辑答案..." />
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', fontSize: '12px', color: '#9CA3AF' }}>
                        <span>{editingAnswer.length} 字符{activeQuestion.maxWords && ` / ${activeQuestion.maxWords * 5} 字符（约 ${activeQuestion.maxWords} 词）`}</span>
                        <button className="btn btn-sm" onClick={handleSaveEdit}><Save size={13} /> 保存修改</button>
                      </div>

                      {/* Modification History */}
                      {activeQuestion.answer?.modifications && activeQuestion.answer.modifications.length > 0 && (
                        <div className="modification-section">
                          <div className="modification-header">
                            <History size={16} /><span>修改记录</span>
                            <span className="modification-count">{activeQuestion.answer.modifications.length}</span>
                          </div>
                          <div className="modification-list">
                            {activeQuestion.answer.modifications.map((mod) => (
                              <div key={mod.id} className="modification-item">
                                <div className="modification-dot">
                                  {mod.action === 'draft' ? <Sparkles size={12} /> : mod.action === 'edit' ? <Pencil size={12} /> : <Check size={12} />}
                                </div>
                                <div className="modification-content">
                                  <div className="modification-meta">
                                    <span className="modification-user">{mod.user}</span>
                                    <span className={`modification-action ${mod.action}`}>{actionLabel(mod.action)}</span>
                                    <span className="modification-time">{formatTime(mod.timestamp)}</span>
                                  </div>
                                  <div className="modification-text">{mod.content}</div>
                                  {mod.diff && <div className="modification-diff">{mod.diff}</div>}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Notes */}
                      <div className="notes-section">
                        <div className="notes-header">
                          <StickyNote size={16} /><span>备注</span>
                          {activeQuestion.answer?.notes && activeQuestion.answer.notes.length > 0 && (
                            <span className="notes-count">{activeQuestion.answer.notes.length}</span>
                          )}
                          <button className="btn btn-sm" style={{ marginLeft: 'auto', fontSize: '11px' }} onClick={() => setShowNoteInput(!showNoteInput)}>
                            <Plus size={12} /> 添加备注
                          </button>
                        </div>
                        {activeQuestion.answer?.notes && activeQuestion.answer.notes.length > 0 && (
                          <div className="notes-list">
                            {activeQuestion.answer.notes.map(note => (
                              <div key={note.id} className="note-item">
                                <div className="note-meta"><span className="note-user">{note.user}</span><span className="note-time">{formatTime(note.timestamp)}</span></div>
                                <div className="note-content">{note.content}</div>
                              </div>
                            ))}
                          </div>
                        )}
                        {showNoteInput && (
                          <div className="note-input-area">
                            <textarea className="note-textarea" value={newNote} onChange={(e) => setNewNote(e.target.value)} placeholder="输入备注内容..." rows={2} />
                            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                              <button className="btn btn-primary btn-sm" onClick={handleAddNote}><Plus size={12} /> 添加</button>
                              <button className="btn btn-sm" onClick={() => { setShowNoteInput(false); setNewNote(''); }}><X size={12} /> 取消</button>
                            </div>
                          </div>
                        )}
                        {(!activeQuestion.answer?.notes || activeQuestion.answer.notes.length === 0) && !showNoteInput && (
                          <div style={{ padding: '12px 0', fontSize: '12px', color: '#9CA3AF', textAlign: 'center' }}>暂无备注，点击"添加备注"记录讨论意见</div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}

              {activeTab === 'sources' && (
                <div className="sources-panel" style={{ marginTop: 0, borderTop: 'none', paddingTop: 0 }}>
                  {activeQuestion.answer?.sources && activeQuestion.answer.sources.length > 0 ? (
                    <div className="source-cards">
                      {activeQuestion.answer.sources.map(source => (
                        <div key={source.id} className="source-card">
                          <div className={`source-card-icon ${source.type}`}>{sourceIcon(source.type)}</div>
                          <div className="source-card-content">
                            <div className="source-card-title"><a href={source.url} target="_blank" rel="noopener noreferrer">{source.title}</a></div>
                            <div className="source-card-excerpt">"{source.excerpt}"</div>
                            <div className="source-card-meta">
                              <span className={`source-type-badge ${source.type}`}>{sourceLabel(source.type)}</span>
                              <span className="source-relevance"><Target size={11} /> 相关性 {source.relevance}%</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-state">
                      <div className="empty-state-icon">🔍</div><h3>暂无引用来源</h3><p>使用 AI 生成答案后，系统会自动关联相关引用来源</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'provenance' && (
                <div className="provenance-panel" style={{ marginTop: 0, borderTop: 'none', paddingTop: 0 }}>
                  {activeQuestion.answer?.provenance && activeQuestion.answer.provenance.length > 0 ? (
                    <div className="provenance-steps">
                      {activeQuestion.answer.provenance.map((step, i) => (
                        <div key={i} className={`provenance-step ${step.type}`}>
                          <div className="provenance-step-icon">{step.type === 'premise' ? '📋' : step.type === 'inference' ? '💡' : '✅'}</div>
                          <div>
                            <div style={{ fontSize: '10px', fontWeight: 600, color: '#9CA3AF', marginBottom: '2px', textTransform: 'uppercase' }}>
                              {step.type === 'premise' ? '前提' : step.type === 'inference' ? '推理' : '最终决策'}
                            </div>
                            <div>{step.content}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-state"><div className="empty-state-icon">🔗</div><h3>暂无溯源记录</h3><p>使用 AI 生成答案后，每条答案的推理过程和依据将在此展示</p></div>
                  )}
                </div>
              )}

              {activeQuestion.answer?.status === 'draft' && (
                <div className="ai-draft-banner" style={{ marginTop: '20px' }}>
                  <div className="ai-draft-banner-icon"><Lightbulb size={18} /></div>
                  <div className="ai-draft-banner-content">
                    <h4>AI 草稿已生成</h4>
                    <p>此答案由 AI 基于 {activeQuestion.answer.sources.length} 个知识源自动起草，遵循"具体可量化、有据可循"的分析师风格。请审阅并修改后确认提交。</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '80px 20px', color: '#9CA3AF', background: '#FAFAFA', borderRadius: '16px', border: '1px dashed #E5E7EB' }}>
          <div style={{ fontSize: '56px', marginBottom: '16px' }}>📋</div>
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#6B7280', marginBottom: '8px' }}>点击上方问卷卡片开始填写</h3>
          <p style={{ fontSize: '14px', maxWidth: '400px', margin: '0 auto', lineHeight: 1.6 }}>
            或点击左侧 <strong>Mr.smARt 智能体</strong> 向 AI 助手提问，获取问卷填写建议和产品数据咨询。
          </p>
        </div>
      )}

      {/* ===== Fullscreen Agent Chat ===== */}
      {showAgentChat && (
        <div className="agent-overlay-fullscreen">
          <div className="agent-chat-fullscreen">
            {/* Header */}
            <div className="agent-fs-header">
              <div className="agent-fs-header-left">
                <div className="agent-fs-avatar">
                  <Bot size={24} color="#fff" />
                </div>
                <div>
                  <h3 className="agent-fs-title">Mr.smARt</h3>
                  <p className="agent-fs-subtitle">
                    {agentMode === 'csig'
                      ? '腾讯混元大模型（HY3）· 面向CSIG的AR Agent · 行业分析师报告知识库'
                      : '腾讯混元大模型（HY3）· 面向市场部的AR Agent · 团队付费资源集中管理'}
                  </p>
                </div>
              </div>
              <div className="agent-fs-mode-switcher">
                <button
                  className={`agent-fs-mode-btn${agentMode === 'csig' ? ' active' : ''}`}
                  onClick={() => setAgentMode('csig')}
                >
                  🏢 面向CSIG
                </button>
                <button
                  className={`agent-fs-mode-btn${agentMode === 'marketing' ? ' active' : ''}`}
                  onClick={() => setAgentMode('marketing')}
                >
                  📣 面向市场部
                </button>
              </div>
              <div className="agent-fs-header-right">
                <button className="agent-fs-action-btn" onClick={() => { setShowAgentChat(false); }}>
                  <Minus size={18} />
                </button>
                <button className="agent-fs-close-btn" onClick={() => { setShowAgentChat(false); }}>
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Body: Welcome state or normal chat */}
            {!hasUserMessage ? (
              <div className="agent-fs-welcome">
                <div className="agent-fs-welcome-inner">
                  <div className="agent-fs-welcome-brand">mr.smARt</div>

                  <p className="agent-fs-welcome-sub">MAKE AR SMART</p>

                  <div className="agent-fs-welcome-chips">
                    <button className="agent-fs-chip" onClick={() => handleQuickPrompt('产品信息')}>
                      <Package size={14} />
                      <span>产品信息</span>
                    </button>
                    <button className="agent-fs-chip" onClick={() => handleQuickPrompt('资讯视野')}>
                      <Globe size={14} />
                      <span>资讯视野</span>
                    </button>
                    <button className="agent-fs-chip" onClick={() => handleQuickPrompt('最新精华')}>
                      <Sparkles size={14} />
                      <span>最新精华</span>
                    </button>
                  </div>

                  {/* Large Input Box (welcome state) */}
                  <div className="agent-fs-welcome-input">
                    <textarea
                      ref={chatTextareaRef}
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendChat();
                        }
                      }}
                      placeholder="向 Mr.smARt 提问，例如：CodeBuddy 的核心数据？"
                      className="agent-fs-welcome-textarea"
                      disabled={isAgentThinking}
                      rows={2}
                    />
                    <button
                      className="agent-fs-welcome-send-btn"
                      onClick={handleSendChat}
                      disabled={!chatInput.trim() || isAgentThinking}
                      aria-label="发送"
                    >
                      <Send size={18} />
                    </button>
                  </div>
                  <div className="agent-fs-welcome-hint">
                    按 Enter 发送 · Shift+Enter 换行 · Mr.smARt 的回答基于乐享知识库、云知和腾讯云公众号
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Messages Area */}
                <div className="agent-fs-messages">
                  {chatMessages.map(msg => (
                    <div key={msg.id} className={`chat-message ${msg.role}`}>
                      <div className={`chat-avatar ${msg.role}`}>
                        {msg.role === 'agent' ? <Bot size={18} /> : <User size={18} />}
                      </div>
                      <div className="chat-bubble-wrapper" style={{ maxWidth: msg.role === 'agent' ? '75%' : '60%' }}>
                        {/* Thinking Process */}
                        {msg.role === 'agent' && msg.thinkingSteps && msg.thinkingSteps.length > 0 && (
                          <div className="thinking-block">
                            <button
                              className="thinking-toggle"
                              onClick={() => toggleThinking(msg.id)}
                            >
                              <Brain size={15} />
                              <span>思考过程</span>
                              {msg.isThinking ? (
                                <RefreshCw size={13} className="spin" style={{ marginLeft: 'auto' }} />
                              ) : (
                                <span style={{ marginLeft: 'auto', fontSize: '11px', color: '#9CA3AF' }}>
                                  {msg.thinkingSteps.filter(s => s.status === 'done').length}/{msg.thinkingSteps.length} 步完成
                                </span>
                              )}
                              {expandedThinking[msg.id] ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                            </button>
                            {expandedThinking[msg.id] && (
                              <div className="thinking-steps">
                                {msg.thinkingSteps.map(step => (
                                  <div key={step.id} className={`thinking-step ${step.status}`}>
                                    <div className="thinking-step-indicator">
                                      {step.status === 'done' ? (
                                        <div className="thinking-check"><Check size={11} /></div>
                                      ) : step.status === 'running' ? (
                                        <div className="thinking-spinner"><RefreshCw size={11} className="spin" /></div>
                                      ) : (
                                        <div className="thinking-dot-pending" />
                                      )}
                                    </div>
                                    <div className="thinking-step-content">
                                      <div className="thinking-step-label">
                                        <span>{step.icon}</span> {step.label}
                                      </div>
                                      {step.detail && (
                                        <div className="thinking-step-detail">{step.detail}</div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Main Content */}
                        {msg.content && (
                          <div className={`chat-bubble ${msg.role}`}>
                            <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{msg.content}</div>
                          </div>
                        )}

                        {/* Source Citations */}
                        {msg.role === 'agent' && msg.sources && msg.sources.length > 0 && !msg.isThinking && (
                          <div className="sources-citation-block">
                            <button
                              className="sources-citation-toggle"
                              onClick={() => toggleSources(msg.id)}
                            >
                              <Database size={14} />
                              <span>引用来源 · {msg.sources.length} 条</span>
                              {expandedSources[msg.id] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </button>
                            {expandedSources[msg.id] && (
                              <div className="sources-citation-list">
                                {msg.sources.map((src, idx) => (
                                  <a
                                    key={src.id}
                                    href={src.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="citation-item"
                                  >
                                    <span className="citation-num">{idx + 1}</span>
                                    <div className="citation-content">
                                      <div className="citation-title">
                                        {src.title}
                                        <ExternalLink size={11} style={{ opacity: 0.5, marginLeft: '4px' }} />
                                      </div>
                                      <div className="citation-excerpt">"{src.excerpt}"</div>
                                      <div className="citation-meta">
                                        <span className={`source-type-badge ${src.type}`}>{sourceLabel(src.type)}</span>
                                        <span className="source-relevance"><Target size={10} /> {src.relevance}%</span>
                                      </div>
                                    </div>
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        <div className="chat-time">{formatTime(msg.timestamp)}</div>
                      </div>
                    </div>
                  ))}

                  {/* Typing Indicator */}
                  {isAgentThinking && chatMessages[chatMessages.length - 1]?.isThinking === false && (
                    <div className="chat-message agent">
                      <div className="chat-avatar agent"><Bot size={18} /></div>
                      <div className="chat-bubble agent typing" style={{ marginTop: '8px' }}>
                        <span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" />
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Input Bar (compact, after first user message) */}
                <div className="agent-fs-input">
                  <div className="agent-fs-input-wrapper">
                    <textarea
                      ref={chatTextareaRef}
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendChat();
                        }
                      }}
                      placeholder="向 Mr.smARt 提问，例如：CodeBuddy 的核心数据？"
                      className="agent-fs-input-field"
                      disabled={isAgentThinking}
                      rows={1}
                    />
                    <button
                      className="agent-fs-send-btn"
                      onClick={handleSendChat}
                      disabled={!chatInput.trim() || isAgentThinking}
                    >
                      <Send size={17} />
                    </button>
                  </div>
                  <div className="agent-fs-input-hint">
                    按 Enter 发送 · Shift+Enter 换行 · Mr.smARt 的回答基于乐享知识库、云知和腾讯云公众号
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
