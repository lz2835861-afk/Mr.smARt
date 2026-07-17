/**
 * Per-question product owners (mock). Replace with WeCom auth import later.
 * Keys = question.id (e.g. gc_q1_1).
 */
export interface QuestionAssignee {
  id: string;
  name: string;
  role: string;
  avatar: string;
}

/** Unsplash portrait crops — sidebar shows photo only; name/role in tooltip. */
const unsplash = (photoId: string) =>
  `https://images.unsplash.com/${photoId}?w=128&h=128&fit=crop&crop=faces&auto=format`;

export const MOCK_PRODUCT_OWNERS: QuestionAssignee[] = [
  {
    id: "pm-zhang",
    name: "张明",
    role: "TKE 产品经理",
    avatar: unsplash("photo-1507003211169-0a1dd7228f2d"),
  },
  {
    id: "pm-li",
    name: "李薇",
    role: "容器平台 PM",
    avatar: unsplash("photo-1494790108377-be9c29b29330"),
  },
  {
    id: "pm-wang",
    name: "王浩",
    role: "边缘计算 PM",
    avatar: unsplash("photo-1500648767791-00dcc994a43e"),
  },
  {
    id: "pm-chen",
    name: "陈悦",
    role: "安全合规 PM",
    avatar: unsplash("photo-1438761681033-6461ffad8d80"),
  },
  {
    id: "pm-zhao",
    name: "赵磊",
    role: "FinOps PM",
    avatar: unsplash("photo-1506794778202-cad84cf45f1d"),
  },
  {
    id: "pm-sun",
    name: "孙婷",
    role: "开发者体验 PM",
    avatar: unsplash("photo-1573496359142-b8d87734a5a2"),
  },
];

/** Stable mock mapping: section 1 → TKE/platform, section 2 → specialized PMs. */
const ASSIGNMENT: Record<string, string[]> = {
  gc_q1_1: ["pm-zhang", "pm-li"],
  gc_q1_2: ["pm-zhang"],
  gc_q1_3: ["pm-zhang", "pm-li"],
  gc_q1_4: ["pm-zhang"],
  gc_q1_5: ["pm-zhang", "pm-li", "pm-sun"],
  gc_q1_6: ["pm-zhang", "pm-wang"],
  gc_q1_7: ["pm-zhang"],
  gc_q2_1: ["pm-li", "pm-wang"],
  gc_q2_2: ["pm-li"],
  gc_q2_3: ["pm-sun", "pm-li"],
  gc_q2_4: ["pm-wang"],
  gc_q2_5: ["pm-wang", "pm-chen"],
  gc_q2_6: ["pm-zhao", "pm-li"],
  gc_q2_7: ["pm-chen"],
};

const ownerById = Object.fromEntries(MOCK_PRODUCT_OWNERS.map((o) => [o.id, o]));

export function assigneesForQuestion(questionId: string): QuestionAssignee[] {
  const ids = ASSIGNMENT[questionId] ?? ["pm-zhang"];
  return ids.map((id) => ownerById[id]!).filter(Boolean);
}
