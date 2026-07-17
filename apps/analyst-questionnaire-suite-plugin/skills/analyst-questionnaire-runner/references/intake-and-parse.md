# Phase 0: 问卷入库 + 解析

> Wrapper 启动时使用。

## 输入形式

| 形式 | 处理方式 |
|---|---|
| xlsx 文件路径（最常见） | 用 xlsx skill / openpyxl 解析 |
| 多个 xlsx（一份问卷分多 sheet）| 按 sheet 拆题，合并 manifest |
| paste 的题目列表 | 接受 markdown / 纯文本 |
| URL（罕见，分析师有时给在线表单）| firecrawl_scrape 抓 |

## 解析输出：Question Manifest

每道题至少包含：

```yaml
question_id: 5
section: "产品或服务"
title:
  en: "What are the five key features in your Security capabilities..."
  cn: "贵公司安全能力中有哪五项关键特性..."
guidance:
  en: "In the comments column, please highlight any capability..."
  cn: "在备注列中，请重点说明..."
char_limit:
  description_per_cell: 500
  comments_per_cell: 500
  total_cells: 5  # Gartner 的 5-feature 表格
type_tag:
  macro: "产品能力"
  form: "列举（强制 5 个）"
  modifiers: ["量化", "客户引用", "URL", "近 12 个月"]
priority: "HIGH"  # 来自 Phase 1 评级
sheet_location:
  sheet: "【1-20】产品或服务"
  start_row: 37
  end_row: 43
```

## 各机构 xlsx 结构差异

| 机构 | sheet 数 | 题目分布 | 字数限制位置 |
|---|---|---|---|
| Gartner Strategic Cloud | 12+ | 按评分维度分 sheet（产品/Strategy/Marketing/...）| 每行 metadata 行（"Maximum character allowed per entry: 500"）|
| Forrester Public Cloud Wave | 1（"问卷应答"）| 单 sheet 30 行 | header 行注明 1500 char |
| IDC MarketScape | 视报告 | 视报告 | 视报告 |
| Omdia Universe | 视报告 | 视报告 | 视报告 |

**入库时识别机构**——按 sheet 名 / header 关键词 / 文件命名 anyone match：

- "Magic Quadrant" / "Critical Capabilities" / "Strategic Cloud" → Gartner
- "Forrester Wave" / "Wave Citation" → Forrester
- "MarketScape" / "IDC" → IDC
- "Omdia Universe" / "Omdia" → Omdia

## 多题 xlsx 解析的关键 trick

每个机构的题目数量、字数限制位置都不同。建议：

1. **先 dump 所有 sheet 的前 20 行**，让 wrapper 识别 schema
2. **再按 schema 提取每题**（题号、题干、guidance、字数）
3. **如果 schema 识别失败**，让用户手动确认机构 + 提供 manual mapping

xlsx 解析详见 wording skill 项目里的 ref/Question Type Analysis/ 实战例子（针对 Forrester Wave 2026 Q3 和 Gartner Strategic Cloud 2026 真题）。

## 入库后的状态文件

每道题创建 `state/question-N.json`：

```json
{
  "question_id": 5,
  "status": "NOT STARTED",
  "priority": "HIGH",
  "type_tag": {...},
  "char_limit": {...},
  "evidence_package_path": null,
  "cn_draft_path": null,
  "en_final_path": null,
  "lint_reports": [],
  "reviewer_signoffs": {
    "product": null,
    "Kevin": null
  },
  "history": []
}
```

`history[]` 数组记录所有 status transition + 触发原因，便于追溯。

`state/` 目录全 .gitignore——含腾讯 internal evidence。

## 入库后的 dashboard 输出

详见主 SKILL.md 的状态机部分。

入库完成时输出一次完整 dashboard 给团队 + PM。

## 错误处理

- xlsx 解析失败 → 报错 + 让用户检查文件
- 题目数 = 0 → 报错（"未识别到任何题目，请确认 sheet 结构"）
- 字数限制识别失败 → 用机构默认值 + 标 [REVIEW: product]（"字数限制 fallback 到默认，请确认"）
- 机构识别失败 → 让用户手动选择
