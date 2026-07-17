import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { OMDIA_SOVEREIGN_CLOUD_SECTIONS as sections } from "../src/data/omdiaSovereignCloud";
import type { Field, Question, Section } from "../src/data/questionnaire";

const GENERATED_DATE = "2026-07-17";
const GENERATED_AT = `${GENERATED_DATE}T00:00:00.000Z`;
const GENERATED_BY = "build-omdia-sovereign-pipeline";
const OUT_DIR = resolve(import.meta.dirname, "../src/data/generated");

type Severity = "BLOCK" | "ERROR" | "WARN";
type QualityStatus = "BLOCKED" | "NEEDS_REVIEW" | "READY";

type LintFinding = {
  severity: Severity;
  rule: string;
  loc: string;
  message: string;
  suggest: string;
};

type ReviewEntry = {
  reviewer: "product" | "Kevin";
  line: string;
  claim: string;
};

type TaggedBlock = {
  tag: "CITED" | "INFERRED";
  body: string;
};

type FlatField = {
  section: Section;
  question: Question;
  field: Field;
};

const flatFields: FlatField[] = sections.flatMap((section) =>
  section.questions.flatMap((question) =>
    question.groups.flatMap((group) => group.fields.map((field) => ({ section, question, field }))),
  ),
);

function fieldContent(field: Field): { content_zh: string; content_en: string } {
  if (field.kind === "text") {
    return {
      content_zh: field.defaultValue,
      content_en: field.defaultValueEn ?? "",
    };
  }

  const content = field.defaultValue.join(", ");
  return { content_zh: content, content_en: content };
}

function sourceClass(url: string): "first-party" | "partner" | "independent" | "other" {
  let hostname = "";
  try {
    hostname = new URL(url).hostname.toLowerCase();
  } catch {
    return "other";
  }

  const belongsTo = (domain: string) => hostname === domain || hostname.endsWith(`.${domain}`);
  if (["tencentcloud.com", "tencentcloud.com.cn", "cloud.tencent.com", "tencent.com", "tencent.com.cn", "qq.com"].some(belongsTo)) return "first-party";
  if (hostname.includes("trueidc") || hostname.includes("prnasia")) return "partner";
  if (hostname.includes("cloudsecurityalliance") || hostname.includes("cloudnews")) return "independent";
  return "other";
}

function reviewEntries(field: Field): ReviewEntry[] {
  const content = fieldContent(field);
  const reasoning = field.reasoning?.reasoning ?? "";
  const entries = new Map<string, ReviewEntry>();

  for (const text of [content.content_zh, content.content_en, reasoning]) {
    for (const rawLine of text.split(/\r?\n/)) {
      const line = rawLine.trim();
      const match = line.match(/\[REVIEW:\s*(product|Kevin)\]/i);
      if (!match) continue;
      const reviewer = match[1].toLowerCase() === "product" ? "product" : "Kevin";
      const claim = line.replace(/\[REVIEW:\s*(?:product|Kevin)\]\s*/i, "").trim() || line;
      entries.set(line, { reviewer, line, claim });
    }
  }

  return [...entries.values()];
}

function taggedBlocks(reasoning: string): TaggedBlock[] {
  // Only top-level audit markers start a block. Nested "- [CITED]" references
  // inside an INFERRED Based on list must remain part of that INFERRED block.
  const marker = /^\s{0,2}\[(CITED|INFERRED|REVIEW:\s*(?:product|Kevin))\]/gim;
  const matches = [...reasoning.matchAll(marker)];
  const blocks: TaggedBlock[] = [];

  for (let index = 0; index < matches.length; index++) {
    const tag = matches[index][1].toUpperCase();
    if (tag !== "CITED" && tag !== "INFERRED") continue;
    const start = (matches[index].index ?? 0) + matches[index][0].length;
    const end = matches[index + 1]?.index ?? reasoning.length;
    blocks.push({ tag, body: reasoning.slice(start, end).trim() });
  }

  return blocks;
}

function addFinding(findings: LintFinding[], finding: LintFinding): void {
  if (
    !findings.some(
      (item) =>
        item.severity === finding.severity &&
        item.rule === finding.rule &&
        item.loc === finding.loc &&
        item.message === finding.message,
    )
  ) {
    findings.push(finding);
  }
}

function inspectAnswer(text: string, loc: "ZH" | "EN", findings: LintFinding[]): void {
  const markdownRules: { rule: string; pattern: RegExp; message: string }[] = [
    { rule: "markdown-bold", pattern: /\*\*/, message: "答案包含 Markdown 粗体标记 **" },
    { rule: "markdown-code", pattern: /`/, message: "答案包含 Markdown 反引号" },
    { rule: "markdown-link", pattern: /\[[^\]\n]+\]\([^)\n]+\)/, message: "答案包含 Markdown 链接" },
    { rule: "markdown-heading", pattern: /^\s*#{1,6}\s+/m, message: "答案包含 Markdown 标题" },
  ];

  for (const check of markdownRules) {
    if (check.pattern.test(text)) {
      addFinding(findings, {
        severity: "ERROR",
        rule: check.rule,
        loc,
        message: check.message,
        suggest: "改为纯文本表达",
      });
    }
  }

  const fluff = [...text.matchAll(/\b(world-class|industry-leading|best-in-class|empower|transformation journey|holistic)\b/gi)].map(
    (match) => match[0].toLowerCase(),
  );
  for (const phrase of new Set(fluff)) {
    addFinding(findings, {
      severity: "ERROR",
      rule: "fluff",
      loc,
      message: `营销化表述：${phrase}`,
      suggest: "替换为可核验的事实或数字",
    });
  }

  for (const match of text.matchAll(/\[(X|N|TBD|TODO|需补充)\]/gi)) {
    addFinding(findings, {
      severity: "BLOCK",
      rule: "placeholder",
      loc,
      message: `未填占位符 ${match[0]}`,
      suggest: "补充内容或明确删除该占位符",
    });
  }

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    const match = line.match(/\[REVIEW:\s*(product|Kevin)\]/i);
    if (!match) continue;
    addFinding(findings, {
      severity: "WARN",
      rule: "review-hook",
      loc,
      message: line,
      suggest: `交由 ${match[1].toLowerCase() === "product" ? "product" : "Kevin"} 审核`,
    });
  }
}

function qualityForField(field: Field): { status: QualityStatus; findings: LintFinding[] } {
  const findings: LintFinding[] = [];
  if (field.kind !== "text") return { status: "READY", findings };

  const content = fieldContent(field);
  inspectAnswer(content.content_zh, "ZH", findings);
  inspectAnswer(content.content_en, "EN", findings);

  const reasoning = field.reasoning;
  // A verified claim must have a reasoning chain. A needs-confirm field may be
  // intentionally evidence-free when it is only a product/Kevin review hook.
  if (field.status === "verified" && !reasoning?.reasoning.trim()) {
    addFinding(findings, {
      severity: "ERROR",
      rule: "missing-reasoning",
      loc: "reasoning",
      message: "verified 字段缺少 reasoning",
      suggest: "补充可审计的推理链或降级为 needs-confirm",
    });
  }

  if (field.status === "verified" && (!reasoning || reasoning.sources.length === 0)) {
    addFinding(findings, {
      severity: "ERROR",
      rule: "verified-without-source",
      loc: "reasoning",
      message: "verified 字段没有 source",
      suggest: "补充来源或调整字段状态",
    });
  }

  for (const block of taggedBlocks(reasoning?.reasoning ?? "")) {
    if (block.tag === "CITED") {
      const required: { label: string; pattern: RegExp }[] = [
        { label: "Source", pattern: /^\s*Source:\s*\S.+$/im },
        { label: "Quote", pattern: /^\s*Quote:\s*\S.+$/im },
        { label: "Retrieved", pattern: /^\s*Retrieved:\s*\S.+$/im },
      ];
      for (const item of required) {
        if (!item.pattern.test(block.body)) {
          addFinding(findings, {
            severity: "ERROR",
            rule: "invalid-cited-block",
            loc: "reasoning",
            message: `[CITED] 块缺少 ${item.label}`,
            suggest: `为该 [CITED] 块补充 ${item.label}`,
          });
        }
      }
    } else {
      const basedOn = block.body.match(/Based on:\s*([^\n]*(?:\n(?!\s*(?:Reasoning|Decision):)[^\n]*)*)/i)?.[1] ?? "";
      const citedReferences = basedOn.match(/\[CITED[^\]]*\]/gi)?.length ?? 0;
      if (citedReferences < 2) {
        addFinding(findings, {
          severity: "ERROR",
          rule: "invalid-inferred-block",
          loc: "reasoning",
          message: `[INFERRED] 块的 Based on 仅包含 ${citedReferences} 个 [CITED] 引用`,
          suggest: "至少关联两个 [CITED] 引用",
        });
      }
    }
  }

  const status: QualityStatus = findings.some((item) => item.severity === "BLOCK")
    ? "BLOCKED"
    : findings.length > 0
      ? "NEEDS_REVIEW"
      : "READY";
  return { status, findings };
}

const qualityByField = new Map(flatFields.map(({ field }) => [field.id, qualityForField(field)]));

const grounding = Object.fromEntries(
  flatFields.map(({ section, question, field }) => {
    const content = fieldContent(field);
    return [
      field.id,
      {
        section_id: section.id,
        section_title: section.title,
        question_id: question.id,
        question_title: question.title,
        status: field.status,
        ...content,
        sources: (field.reasoning?.sources ?? []).map((source) => ({
          ...source,
          source_class: sourceClass(source.url),
        })),
        quotes: field.reasoning?.quotes ?? [],
        reasoning: field.reasoning?.reasoning ?? "",
        decision: field.reasoning?.decision ?? "",
        generated_at: GENERATED_DATE,
      },
    ];
  }),
);

const readinessQuestions = sections.flatMap((section) =>
  section.questions.map((question) => {
    const fields = question.groups.flatMap((group) => group.fields);
    const reviews = new Map<string, ReviewEntry>();
    for (const field of fields) {
      for (const review of reviewEntries(field)) reviews.set(review.line, review);
    }

    const sourceCount = fields.reduce((total, field) => total + (field.reasoning?.sources.length ?? 0), 0);
    const hasNeedsConfirm = question.status === "needs-confirm" || fields.some((field) => field.status === "needs-confirm");
    const hasReview = reviews.size > 0;
    const allVerifiedWithReasoning = fields.every(
      (field) => field.status === "verified" && Boolean(field.reasoning?.reasoning.trim()),
    );
    const groundability = hasNeedsConfirm || hasReview ? "low" : allVerifiedWithReasoning ? "high" : "medium";
    const action = groundability === "high" ? "ai-draft" : groundability === "low" ? `ai-draft+${sourceCount === 0 ? "ar-supply" : "ar-verify"}` : "ai-draft+ar-verify";

    return {
      section_id: section.id,
      section_title: section.title,
      question_id: question.id,
      question_title: question.title,
      field_count: fields.length,
      source_count: sourceCount,
      review_count: reviews.size,
      groundability,
      action,
      missing_for_ar: [...reviews.keys()],
      note: `${fields.length} fields, ${sourceCount} sources, ${reviews.size} review items; groundability ${groundability}.`,
    };
  }),
);

const readiness = {
  generated: GENERATED_DATE,
  by: GENERATED_BY,
  summary: {
    section_count: sections.length,
    question_count: readinessQuestions.length,
    field_count: flatFields.length,
    source_count: readinessQuestions.reduce((total, question) => total + question.source_count, 0),
    review_count: readinessQuestions.reduce((total, question) => total + question.review_count, 0),
    high: readinessQuestions.filter((question) => question.groundability === "high").length,
    medium: readinessQuestions.filter((question) => question.groundability === "medium").length,
    low: readinessQuestions.filter((question) => question.groundability === "low").length,
  },
  questions: readinessQuestions,
};

const qualityFields = Object.fromEntries(
  flatFields
    .filter(({ field }) => field.kind === "text")
    .map(({ section, question, field }) => {
      const result = qualityByField.get(field.id)!;
      return [
        field.id,
        {
          section_id: section.id,
          question_id: question.id,
          status: result.status,
          findings: result.findings,
        },
      ];
    }),
);
const allQualityFindings = Object.values(qualityFields).flatMap((field) => field.findings);
const qualityStatus: QualityStatus = allQualityFindings.some((item) => item.severity === "BLOCK")
  ? "BLOCKED"
  : allQualityFindings.length > 0
    ? "NEEDS_REVIEW"
    : "READY";
const quality = {
  generated_at: GENERATED_DATE,
  status: qualityStatus,
  summary: {
    total_fields: Object.keys(qualityFields).length,
    total_findings: allQualityFindings.length,
    BLOCK: allQualityFindings.filter((item) => item.severity === "BLOCK").length,
    ERROR: allQualityFindings.filter((item) => item.severity === "ERROR").length,
    WARN: allQualityFindings.filter((item) => item.severity === "WARN").length,
    blocked_fields: Object.values(qualityFields).filter((field) => field.status === "BLOCKED").length,
    needs_review_fields: Object.values(qualityFields).filter((field) => field.status === "NEEDS_REVIEW").length,
    ready_fields: Object.values(qualityFields).filter((field) => field.status === "READY").length,
  },
  fields: qualityFields,
};

function citedEvidence(field: Field): unknown[] {
  const reasoning = field.reasoning;
  if (!reasoning) return [];
  const blocks = taggedBlocks(reasoning.reasoning).filter((block) => block.tag === "CITED");
  const pairCount = Math.min(reasoning.sources.length, reasoning.quotes.length, blocks.length);
  const evidence: unknown[] = [];

  for (let index = 0; index < pairCount; index++) {
    const source = reasoning.sources[index];
    const quote = reasoning.quotes[index];
    if (!source?.url || !quote?.trim()) continue;
    const block = blocks[index];
    const retrieved = block.body.match(/^\s*Retrieved:\s*(\d{4}-\d{2}-\d{2})/im)?.[1] ?? GENERATED_DATE;
    const claim = block.body.split(/\r?\n/, 1)[0].trim() || field.label;
    evidence.push({
      tag: "CITED",
      claim,
      source: source.url,
      quote,
      retrieved,
    });
  }

  return evidence;
}

const platformQuestions = sections.flatMap((section) =>
  section.questions.map((question) => {
    const fields = question.groups.flatMap((group) => group.fields);
    const fieldExports = fields.map((field) => {
      const reviews = reviewEntries(field);
      const lint = qualityByField.get(field.id)?.findings ?? [];
      return {
        field_id: field.id,
        ...fieldContent(field),
        evidence: [
          ...citedEvidence(field),
          ...reviews.map((review) => ({
            tag: "REVIEW",
            reviewer: review.reviewer,
            claim: review.claim,
            reason: review.line,
          })),
        ],
        reviewer_hooks: reviews.map((review) => ({
          reviewer: review.reviewer,
          kind: review.reviewer === "Kevin" ? "thesis" : "placeholder",
          text: review.claim,
          reason: review.line,
        })),
        lint,
        conflicts: [],
      };
    });

    const questionReviews = fields.flatMap(reviewEntries);
    const hasBlock = fieldExports.some((field) => field.lint.some((finding) => finding.severity === "BLOCK"));
    const hasProductReview = questionReviews.some((review) => review.reviewer === "product");
    const hasKevinReview = questionReviews.some((review) => review.reviewer === "Kevin");
    const status = hasBlock ? "BLOCKED" : hasProductReview ? "PRODUCT REVIEW" : hasKevinReview ? "KEVIN REVIEW" : "READY";
    const prompt = [question.promptZh, question.promptEn].filter(Boolean).join("\n");
    const modifiers = /REVIEW/i.test(prompt) || questionReviews.length > 0 ? ["需人审"] : [];

    return {
      question_id: question.id,
      type_tag: { macro: "产品能力", form: "简答", modifiers },
      word_limit: 0,
      status,
      fields: fieldExports,
    };
  }),
);

const platformExport = {
  export_version: "1.0",
  questionnaire_id: "omdia-sovereign-cloud-2026",
  firm: "Omdia",
  generated_at: GENERATED_AT,
  questions: platformQuestions,
};

mkdirSync(OUT_DIR, { recursive: true });
const outputs = {
  "omdia-sovereign-cloud-grounding.json": grounding,
  "omdia-sovereign-cloud-readiness.json": readiness,
  "omdia-sovereign-cloud-quality.json": quality,
  "omdia-sovereign-cloud-platform-export.json": platformExport,
};

for (const [fileName, data] of Object.entries(outputs)) {
  writeFileSync(resolve(OUT_DIR, fileName), `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

console.log(
  `Generated ${Object.keys(outputs).length} files: ${sections.length} sections, ${platformQuestions.length} questions, ${flatFields.length} fields, ${allQualityFindings.length} quality findings (${qualityStatus}).`,
);
