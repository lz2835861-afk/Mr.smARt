# Phase 5: 提交后跟踪 (roadmap)

> Wrapper v0.1 不自动执行 Phase 5，只输出 timeline 提醒。
>
> v0.x 后续会拆出独立 sub-skill 处理（如 customer-reference-prep, strategy-briefing-prep, post-publish-extractor）。

## Forrester Wave 提交后 timeline

| 时间 | 事项 | 谁负责 |
|---|---|---|
| 提交后立即 | 发送 confirmation email 给 Forrester PM | AR 团队 |
| 提交后 1-2 周 | 准备 strategy briefing deck（30 min） | 战略 + AR |
| 提交后 1-2 周 | 准备 product demo（2 hours） | 产品 + 解决方案架构 |
| 提交后 2-3 周 | 联系 3 个 reference customer 确认参与访谈 | 客户成功 |
| Strategy briefing 当天 | 30 min briefing + 2h demo（英文） | 全员 |
| Customer interview 周 | 3 场 30-min 访谈（英文） | 客户 + AR 陪同 |
| 报告发布前 ~5 天 | 收到 courtesy preview | AR |
| Courtesy preview 期间 | 决定挑哪 ≤15% 答案 challenge | Kevin + 战略 |
| 报告发布日 | 30 min debrief call（如已预约） | AR |
| 报告发布后 | 抓 Strengths/Cautions 段落 + 竞品段落分析 | AR + 产品 |

## Gartner Magic Quadrant 提交后 timeline

| 时间 | 事项 |
|---|---|
| 提交后 1-2 周 | 可能被 Gartner 邀请 vendor briefing（如未在前期已做） |
| 报告发布前 ~5 天 | Courtesy preview |
| Courtesy preview 期间 | factual review 窗口（修正事实错误，但 framing 已定）|
| 报告发布后 | 抓 Strengths/Cautions + 竞品段落 |

## 报告发布后必做（最有价值的反馈循环）

### 抓你的 vendor 段落

报告里你的 "Strengths" 和 "Cautions" 段落是**分析师采纳了你哪些 framing 的实际证据**。

操作（v0.x 后续 automate）：

1. 拿到 published 报告（PDF / 在线）
2. 抓你的 vendor profile 段落
3. 与你提交的答案 diff：
   - 哪些 framing 被原句采纳（高价值，往后年继续用）
   - 哪些 framing 被改写（学习改写方向）
   - 哪些 framing 被忽略（不再用这种说法）
4. 抓所有竞品段落
5. 提炼出"分析师当年评分眼"的 pattern

### Update wording skill 的 voice profiles

把"被采纳的 framing"加进 [analyst-wording](https://github.com/AOMJ2PMP/analyst-wording-skill) 的 `references/analyst-voice-profiles.md`：

例：

如果发现 Lydia Leong 在你的 Strengths 段落里用了 "Tencent Cloud's bet on AI-native data infrastructure is among the most opinionated in the market"——那 "opinionated" 就是她当年的喜爱用词。Update voice profile，下次答题时使用。

### Update grounding skill 的 evidence schema

如果发现某类 evidence（如 "AI training cost per GPU-hour"）被分析师在多个段落引用——意味着这是评分眼。Update grounding skill 的 `references/evidence-by-type.md` 让它强制要这类 evidence。

### Update wrapper 的 priority 评级

如果某些题被分析师在最终评分里给了高权重（可从 Critical Capabilities 报告反推）——下一年把这些题在 Phase 1 priority 标 HIGH。

## 客户访谈准备（Forrester 专用，v0.x 单独 sub-skill）

3 个 reference customer 的访谈是 Wave 评分的关键 input。建议未来做 customer-reference-prep skill：

- 根据问卷答案推荐 best-fit 客户（行业 / 用例 / 公开许可）
- 起草客户可能被问到的问题 + 推荐答案
- 准备客户内部 talking points（让客户说什么、不说什么）

## Strategy briefing 准备（Wave 30 min + Gartner 偶尔）

也可单独做 strategy-briefing-prep skill：

- 基于 Strategy 题答案生成 deck outline
- 准备分析师可能追问的问题 + 推荐答案
- 标记哪些 thesis 必须现场亲口说（vs. 只在文档里）

## v0.1 wrapper 在 Phase 5 做什么

只做这些（不自动执行）：

1. 输出 timeline 提醒（按机构定制）
2. 输出 post-submission checklist
3. 输出 sub-skill roadmap（"建议未来做 X、Y、Z"）

例输出：

```
Phase 5: Post-submission Reminders

You just submitted: Forrester Public Cloud Wave 2026 Q3
Submission date: 2026-05-15

Critical upcoming dates:
- 2026-05-28: Strategy briefing + product demo (英文)
- 2026-06-01 to 06-05: 3 customer interviews
- ~2026-09-15: Courtesy preview (5 days before publish)
- ~2026-09-20: Report publish, debrief call window

Action items NOT automated by v0.1 wrapper:
  [ ] AR: schedule strategy briefing
  [ ] Sales/CSM: confirm 3 reference customers
  [ ] Sol Arch: prepare 2-hour demo aligned with Q1-24 product capability answers
  [ ] Kevin + 战略: pre-bake the 15% challenge candidates from likely Cautions
  [ ] AR: post-publish, extract analyst language for next year voice profile update

Suggested future skills (not yet built):
  - customer-reference-prep
  - strategy-briefing-prep
  - post-publish-extractor (highest ROI for year-over-year improvement)
```

## v0.1 不做的事

- 不自动 schedule briefing
- 不自动联系客户
- 不自动抓 published 报告
- 不自动 update voice profiles

这些都需要专门的 sub-skill 或人工。Phase 5 v0.1 = 提醒 + checklist 而已。
