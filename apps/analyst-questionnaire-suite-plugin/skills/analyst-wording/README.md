<div align="center">

# Analyst Wording

**帮你用分析师喜欢的语言写问卷答案**

覆盖 Gartner、Forrester、IDC、Omdia 四家分析师机构

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Claude Code](https://img.shields.io/badge/Claude%20Code-Skill-blueviolet)](https://claude.ai/code)

</div>

---

## 这个 skill 干什么

每年云厂商都要应付分析师问卷——Gartner Magic Quadrant、Forrester Wave、IDC MarketScape、Omdia Universe。问题是：

- **厂商爱写**："我们的产品更稳定、更安全、更智能"——抽象、自夸、无 proof
- **分析师爱看**："99.995% SLA across 21 regions, validated by [客户] in production"——具体、量化、可验证

这两种写法之间的距离就是这个 skill 要桥接的。

**输入**：问卷题目原文 + 你提供的事实（产品名、数字、客户引用）

**输出**：
1. 中文初稿（团队/产品 review 事实和口径）
2. 英文版（用对应分析师 voice 重写，可直接提交）

## 工作流（6 phase）

```
原题 + 你给的事实
        ↓
Phase 1: 题型识别（按题型分，不按机构分）
        ↓
Phase 2: 证据采集（按题型 schema 要料，不许编）
        ↓
Phase 3: 中文起草（shape 决定 format）
        ↓
Phase 4: 团队 review iteration
        ↓
Phase 5: 英文 reframing（不是直译，按机构选 voice）
        ↓
Phase 6: Plain text 输出 + 占位符清单
```

详见 [SKILL.md](SKILL.md)。

## 核心设计原则

1. **按题型分类，不按机构分类**。Gartner / Forrester / IDC / Omdia 都问同样几类题——差别在结构性约束（字数、表格行数），不在题的本质。
2. **格式由答案的 shape 决定，不由模板决定**。Bullet 不是默认——只在真正 N 并列且每项独立 1-2 句完整说清时才用。
3. **不许编**。数字、客户名、产品功能、URL—— input 没给的，output 不许凭空写。
4. **提交是 plain text**。Excel 单元格不渲染 markdown。`**bold**` 会显示成字面字符。Skill 输出永远不用 `#`、`**`、`*`、`` ` ``。
5. **按机构选分析师 voice**：
   - Forrester → Lee Sustar 风格
   - Gartner（产品能力）→ Lydia Leong 风格
   - Gartner（云市场）→ Sid Nag 风格
   - Omdia → Roy Illsley 风格
   - IDC → Dave McCarthy 风格

## 安装

### 方法 A：克隆到 Claude skills 目录（推荐）

```bash
git clone https://github.com/AOMJ2PMP/analyst-wording-skill ~/.claude/skills/analyst-wording
```

### 方法 B：克隆到工作目录 + symlink

如果你想在自己的工作目录 iterate：

```bash
git clone https://github.com/AOMJ2PMP/analyst-wording-skill ~/code/analyst-wording-skill
ln -s ~/code/analyst-wording-skill ~/.claude/skills/analyst-wording
```

安装后在 Claude Code 里粘贴一道分析师问卷题，说「帮我答这道题」就会触发。

## 触发词

- 「答这道题」「问卷答案」
- 「Gartner 回答」「Forrester 答」「Wave 题」「MQ 题」
- 「分析师 wording」「帮我写问卷」
- 「analyst questionnaire」

## 文件结构

```
analyst-wording-skill/
├── SKILL.md                              # 主入口（6-phase 协议）
├── references/                           # Skill 运行时加载
│   ├── question-type-taxonomy.md         # 题型分类法（Phase 1）
│   ├── evidence-by-type.md               # 按题型问什么料（Phase 2）
│   ├── plain-text-rules.md               # Plain text 提交规则（Phase 3, 5）
│   ├── translation-reframing.md          # CN→EN 重写（Phase 5）
│   └── analyst-voice-profiles.md         # 5 位分析师 voice（Phase 5）
├── README.md
└── LICENSE
```

`ref/` 是用户本地的研究语料（方法论文档、分析师博客、历年报告）—— **不在公开仓库里**。Skill 不强依赖 `ref/`，但有的话效果更好。如果你有自己的语料，按需放在本地。

## 后续怎么迭代

这个 skill 设计成可以**只改 references/，不动 SKILL.md**。SKILL.md 是协议（稳定），references/ 是知识（迭代）。

### 1. 加新题型 / 新形式

修改 `references/question-type-taxonomy.md`：

- 在「形式（form）」表里加一行
- 在「常见组合速查」里加一个组合
- 不需要动 SKILL.md

例：如果发现某机构问"在 [行业] 里你们做过哪些案例"是一种新形式，可以加一类 `案例题`。

### 2. 加新分析师 voice

修改 `references/analyst-voice-profiles.md`：

- 加一个新分析师的小节（参照现有 5 个的格式）
- 列：signature vocab / signature framing / 避免词 / 例子
- 在 SKILL.md 的"按机构选 voice"列表里加一行

例：如果 Gartner 换了 Strategic Cloud MQ 主笔，把新的人 voice 加进来，覆盖 Lydia Leong。

### 3. 调 evidence elicitation

修改 `references/evidence-by-type.md`：

- 在对应题型 schema 里加 / 删 evidence 项
- 调整「需要 / 可选」标记

例：如果某机构今年开始要求 carbon footprint 数字，在「产品能力 × 列举」schema 里加上这一项。

### 4. 调 plain text 规则

修改 `references/plain-text-rules.md`：

- 如果发现某种格式在某机构的表格里其实可以用，加进「允许使用」
- 反之加进「绝对禁用」

### 5. 调 CN→EN 重写规则

修改 `references/translation-reframing.md`：

- 在「必做的 5 类 reframing」里加新模式
- 在「反模式」里加新的"不要这么 translate"对照
- 在「字数压缩技巧」里加新的压缩手法

### 6. 改 SKILL.md（少做）

只在以下场景改 SKILL.md：

- 加 / 删 phase
- 改入口分流逻辑
- 改 reviewer hooks 输出格式
- 改边界 / 反模式

### 迭代节奏建议

跑 1 道题 → 标记不顺的地方 → 改对应 reference 文件 → 再跑 1 道题验证。

不要批量先想完所有可能性再改 reference——很多想象的 case 实际不会出现。

## 起源 / 致谢

- 灵感来自 [nuwa-skill](https://github.com/alchaincyf/nuwa-skill) 的 protocol 结构（YAML frontmatter + phases + references/）
- 为腾讯云分析师关系工作流量身设计，但 skill 本身通用，任何 vendor 都可以 fork 后调整

## License

MIT — 见 [LICENSE](LICENSE)
