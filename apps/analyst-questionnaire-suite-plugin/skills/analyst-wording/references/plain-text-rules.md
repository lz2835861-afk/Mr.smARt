# Plain Text 提交规则

> 这是 SKILL 的硬规则。Excel 单元格不渲染 markdown。Skill 输出**永远不能**用 markdown 格式。

## 绝对禁用（会显示成字面字符）

| 禁用 | 显示效果 | 替代 |
|---|---|---|
| `**bold**` | 字面 `**bold**` | 单独成行 + 冒号：`Differentiation:` |
| `# heading` | 字面 `# heading` | 段落标题 + 空行 |
| `## heading` | 字面 `## heading` | 同上 |
| `*italic*` | 字面 `*italic*` | 不强调或换词 |
| `_italic_` | 字面 `_italic_` | 同上 |
| `` `code` `` | 字面 `` `code` `` | 直接写代码字面 |
| `[link](url)` | 字面 `[link](url)` | URL 直接写明文 |
| `> quote` | 字面 `> quote` | 改写为正文 |
| `--- divider` | 字面 `--- divider` | 用空行替代 |

## 允许使用

### 段落分隔

用空行：

```
段一文字。段一第二句。

段二文字。段二第二句。
```

### 编号列表（强制 N 个项时）

```
1. 第一项内容写在这里，可以是完整 1-2 句。
2. 第二项内容写在这里。
3. 第三项内容。
```

### Dash 列表（并列同 shape 的项时）

```
- 第一项
- 第二项
- 第三项
```

### 标签 + 冒号（替代小标题）

```
Differentiation:

我们与竞品在 X 维度的差异化体现在...

Roadmap:

- 2026 Q3：[milestone]
- 2026 Q4：[milestone]
```

注意：

- 标签后面**单独成行 + 冒号**
- 下一段**空一行再开始**
- **不要用粗体**——`**Differentiation:**` 会显示成字面 `**Differentiation:**`

### URL 直接写明文

```
https://www.tencentcloud.com/products/cfw

而不是 [Cloud Firewall](https://www.tencentcloud.com/products/cfw)
```

如果有多个 URL，可以用 dash 列出：

```
- https://www.tencentcloud.com/products/cfw
- https://www.tencentcloud.com/products/waf
```

## Bullet 使用准则

bullet 不是默认格式。**只在以下场景使用**：

1. **题目强制 N 个**（"five key features"、"three competitors"）→ 编号列表
2. **真正的并列同 shape 项**（roadmap milestone 列表、partner 类型清单）→ dash 列表
3. **每个 bullet 至少能写完整 1-2 句**（< 1 行 = 浪费字数）

**不应该 bullet 的场景**：

- 简答题的连贯论证
- 是非题的简要说明
- 战略愿景的 thesis 表达
- 任何「4 个 sub-question 但答案能流畅串成 narrative」的题

## 字数控制

英文同等信息密度比中文费 ~1.5-2x 字符。

| 场景 | 中文字符 | 英文字符 |
|---|---|---|
| 1 段段落 | ~150-200 | ~400-500 |
| 1 个 feature 描述 | ~200 | ~480 |
| 完整 4 段答案 | ~500-600 | ~1400-1500 |

英文版起草时**预留 50 char buffer**——容易超。

## 输出 verification

提交前自检（grep-able 的检查）：

```
[ ] 没有 ** （粗体）
[ ] 没有 单独的 * 或 _ （斜体）
[ ] 没有 # （标题）
[ ] 没有 ` （行内代码）
[ ] 没有 [...](...) （markdown 链接）
[ ] 没有 > 在行首（引用块）
[ ] 段落用空行分隔（不是用 ---）
[ ] 列表用 "1. " 或 "- " 起始（不用 "* " 或 "+ "）
[ ] URL 是明文
[ ] 字数在 limit 内（包括占位符的字数）
```

如果是 Forrester 类的 free-text 单格回答：还要再过一遍 spreadsheet preview 看真实换行是否符合预期。

## 替代方案速查表

需要这种表达 → 用这种 plain text：

| 想强调 | 不要 | 应该 |
|---|---|---|
| 关键论点 | `**Key**: xxx` | `Key: xxx`（标签 + 冒号 + 同行） |
| 章节标题 | `## Section` | `Section:` 单独成行，下一行空，再写正文 |
| 列出 5 个 feature | `* Feature 1` | `1. Feature 1` 或 `- Feature 1` |
| 关键术语 | `*term*` | 直接写 `term`，前后不加任何标记 |
| URL 链接 | `[CFW](url)` | URL 单独成行：`https://...` |
| 引用客户原话 | `> "Quote"` | `Customer X said: "Quote"`（用引号即可） |
| 分块（如三个竞品） | `---` | 单独空行 + `vs Competitor X:` 标签 |
