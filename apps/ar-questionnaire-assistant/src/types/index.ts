// ===== 核心类型定义 =====

/** 分析师机构 */
export type AnalystFirm = 'Gartner' | 'Forrester' | 'IDC' | 'Omdia';

/** 报告类型 */
export type ReportType = 'MQ' | 'Wave' | 'MarketScape' | 'Universe';

/** 报告状态 */
export type ReportStatus = '问卷中' | '评审中' | 'Briefing' | '已完成';

/** 智能体模式 */
export type AgentMode = 'csig' | 'marketing';

/** 智能体范围层级 */
export type AgentScope = 'teambrain' | 'csig-helper' | 'cloud-helper';

/** 产品信息 */
export interface Product {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  icon: string;
  color: string;
}

/** 报告信息 */
export interface Report {
  id: string;
  type: ReportType;
  name: string;
  firm: AnalystFirm;
  productId: string;
  status: ReportStatus;
  deadline: string;
  progress: number; // 0-100
}

/** 问卷 */
export interface Questionnaire {
  id: string;
  reportId: string;
  title: string;
  firm: AnalystFirm;
  productName: string;
  deadline: string;
  totalQuestions: number;
  answeredQuestions: number;
  questions: Question[];
}

/** 问题 */
export interface Question {
  id: string;
  number: number;
  category: string;
  question: string;
  maxWords?: number;
  answer?: Answer;
}

/** 修改记录 */
export interface ModificationRecord {
  id: string;
  user: string;
  action: string;
  content: string;
  timestamp: string;
  diff?: string;
}

/** 备注/批注 */
export interface Note {
  id: string;
  user: string;
  content: string;
  timestamp: string;
  color?: string;
}

/** 答案 */
export interface Answer {
  id: string;
  questionId: string;
  content: string;
  draftContent?: string;
  status: 'draft' | 'reviewing' | 'approved';
  sources: AnswerSource[];
  provenance: ProvenanceStep[];
  lastModified: string;
  modifications: ModificationRecord[];
  notes: Note[];
}

/** 答案来源 */
export interface AnswerSource {
  id: string;
  title: string;
  url: string;
  type: 'lexiang' | 'yunzhi' | 'wechat' | 'vb' | 'official' | 'external';
  excerpt: string;
  relevance: number;
}

/** 溯源步骤 */
export interface ProvenanceStep {
  type: 'premise' | 'inference' | 'decision';
  content: string;
}

/** 知识库条目 */
export interface KnowledgeEntry {
  id: string;
  title: string;
  url: string;
  type: AnswerSource['type'];
  source: string;
  summary: string;
  tags: string[];
  date: string;
  content?: string;
  relevance?: number;
}

/** 知识源配置 */
export interface KnowledgeSource {
  id: string;
  name: string;
  type: AnswerSource['type'];
  description: string;
  icon: string;
  connected: boolean;
  docCount: number;
}

/** 智能体思考步骤 */
export interface ThinkingStep {
  id: string;
  icon: string;
  label: string;
  status: 'pending' | 'running' | 'done';
  detail?: string;
}

/** 智能体对话消息 */
export interface ChatMessage {
  id: string;
  role: 'user' | 'agent';
  content: string;
  timestamp: string;
  thinkingSteps?: ThinkingStep[];
  sources?: AnswerSource[];
  isThinking?: boolean;
}

// ===== 资源中心相关 =====

/** 问卷清单条目 */
export interface QuestionnaireListItem {
  id: string;
  index: number;
  productTrack: string;     // 产品赛道
  institution: string;      // 问卷机构
  title: string;
  createdAt: string;
  docUrl: string;
  status: 'in-progress' | 'completed' | 'pending';
}

/** 会议/沟通纪要 */
export interface MeetingNote {
  id: string;
  index: number;
  type: 'meeting' | 'communication';  // 会议 / 沟通
  event: string;          // 会议/沟通事件
  date: string;           // XX-XX
  summary: string;        // 关联摘要
  relatedUrl?: string;    // 关联资料链接
  relatedDoc?: string;    // 关联文档标题
}

/** 专家介绍 */
export interface ExpertProfile {
  id: string;
  firm: AnalystFirm | string;
  name: string;
  focus: string;          // 研究领域
  history?: string;       // 历年报告/活动参与情况
  contact?: string;
}

/** 目标用户角色 */
export interface UserRole {
  id: string;
  name: string;
  scope: AgentScope;
  needs: string[];        // 需求
  scenarios: string[];    // 使用场景
  reportType: string;     // 报告类型
  icon: string;
}

// ===== 关键词矩阵相关 =====

/** 产品赛道 */
export interface ProductTrack {
  id: string;
  name: string;           // 中文名
  keywords: {
    cn: string[];         // 中文关键词
    en: string[];         // 英文关键词
    analyst: {            // 各机构报告类型
      gartner?: string[];
      forrester?: string[];
      idc?: string[];
    };
  };
}

// ===== 宣发推广相关 =====

/** 宣发渠道 */
export interface PromotionChannel {
  id: string;
  category: 'internal' | 'social' | 'experience' | 'content';
  name: string;
  tactics: string[];
  output: string;         // 产出物
}

/** 宣发阶段 */
export interface PromotionPhase {
  id: string;
  name: string;
  period: string;         // 时间段
  description: string;
  actions: string[];
  color: string;
}

/** 受众类型 */
export interface Audience {
  type: 'direct' | 'influencer';
  name: string;
  description: string;
  channels: string[];
}
