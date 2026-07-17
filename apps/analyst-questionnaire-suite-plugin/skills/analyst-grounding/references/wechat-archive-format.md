# 公众号本地归档格式 + 消费规范

> Skill 在 Phase 2（Source 抓取）使用。这个文件规定了 grounding skill 期望的本地公众号 markdown 归档结构、frontmatter 格式、解析行为，以及 grep 命中后怎么生成 `[CITED]` 项。

## 为什么用本地归档而不是 RSS / Firecrawl

之前 v0.3 草案要走 WeRSS / RSSHub 自动 discovery。实际工作流里用户已经有自己的 wechat-scraper 工具链，把目标公众号 scrape 成结构化的本地文件夹。skill 直接消费这一层比走 RSS 简单：

| 维度 | 本地归档 | WeRSS / RSSHub |
|---|---|---|
| 第三方依赖 | 0 | RSS 服务 + Firecrawl |
| 离线可用 | ✅ | ❌ |
| ops 维护成本 | 0（用户重新跑 scraper 即可）| 订阅 + cron + manifest |
| 历史 backfill | ✅（用户已经爬好 1 年）| ❌（RSS 只给最新 N 篇）|
| 图片 / 多媒体 | ✅（同存）| Firecrawl 不抓图 |
| 文章 dedupe | 文件夹名做 key | manifest 维护 |

唯一缺点：用户需要在 grounding skill 之外自己爬。这个分工是 skill 的边界——skill 不负责 discover URL，只负责消费已有归档。

## 期望的目录结构

```
$WECHAT_ARCHIVE_PATHS/                              ← env var 指向的根
└── <account>/                                      ← 公众号名（中文，如 "腾讯云出海服务"）
    ├── 2025-03-26 - 腾讯游戏云：进入全球「领导者象限」/
    │   ├── 腾讯游戏云：进入全球「领导者象限」.md
    │   └── images/
    │       ├── img_001.gif
    │       ├── img_002.png
    │       └── ...
    ├── 2025-04-11 - 腾讯游戏云：用量规模+收入增速，双料第一！/
    │   ├── ...
    └── ...
```

约定：

- 文件夹命名 `YYYY-MM-DD - <标题>` —— 前缀提供发布日期 fallback
- 每篇文章一个独立文件夹
- md 文件名 = 文章标题（去掉非法 fs 字符）
- `images/` 子目录用相对路径引用（grounding 不读图）

`WECHAT_ARCHIVE_PATHS` env var 接受多个绝对路径，逗号分隔。每个路径下面就是 `<account>/...` 这一层。

## md 文件 frontmatter 格式

```markdown
# <标题>

> 公众号: 腾讯云出海服务
> 发布时间: 2025-03-26 16:30
> 原文链接: https://mp.weixin.qq.com/s/abc123

---

<正文 markdown>
```

frontmatter 用 markdown blockquote 形式（`> key: value`）。三个字段都是必填的：

- `公众号`：公众号显示名（不是 biz id）
- `发布时间`：`YYYY-MM-DD HH:MM` 格式（grounding 解析时只取日期部分进 `Published`）
- `原文链接`：mp.weixin.qq.com 的完整 URL，作为 `Source` 字段

frontmatter 之后是 `---` 分隔线 + 正文。

## frontmatter 缺失时的 fallback

如果 md 没有 frontmatter（手工放进去的旧文 / 别的工具 scrape 的）：

| 字段 | Fallback |
|---|---|
| `公众号` | 用 md 所在的 `<account>/` 文件夹名 |
| `发布时间` | 用文件夹名前缀 `YYYY-MM-DD`；都没有 → 留空 + `[REVIEW: product]` 提示"无时间戳" |
| `原文链接` | 没有就用本地路径 `wechat-local://<account>/<title>/`（明确标记是本地引用，不能给分析师当公开 URL）|

## skill 解析 & 抓取流程

### Phase 2 进入时

```python
# 伪码
def harvest_wechat_evidence(query_keywords, candidate_products):
    paths = os.environ.get("WECHAT_ARCHIVE_PATHS", "").split(",")
    if not paths or paths == [""]:
        return []  # skip silently（不报错，不强制）

    matches = []
    for root in paths:
        for md_path in walk_md_files(root):
            article = parse_frontmatter(md_path)
            body = read_md_body(md_path)

            # 多关键词 OR 匹配（产品名 / 关键概念 / 客户名 / 区域名）
            hit_paragraphs = grep_paragraphs(body, query_keywords + candidate_products)
            if not hit_paragraphs:
                continue

            for para in hit_paragraphs:
                matches.append({
                    "source_type": "wechat-archive",
                    "source_url": article["原文链接"] or f"wechat-local://{article['公众号']}/{article['title']}",
                    "account": article["公众号"],
                    "title": article["title"],
                    "published": article["发布时间"],
                    "quote": para,  # 段落原文，verbatim
                    "retrieved": now_iso(),
                })

    return matches
```

### Phase 3 抽取时

每条 match 进入候选池，用 `[CITED]` 格式输出：

```
[CITED] <从该段落抽出的 fact>
  Source: https://mp.weixin.qq.com/s/abc123
  Quote: "<命中段落原文>"
  Account: 腾讯云出海服务
  Published: 2025-03-26
  Retrieved: 2026-05-07
```

`Account` 字段是公众号源专有的（文档源没有这个字段）。

### 多 archive 路径同篇文章 dedupe

公众号转载是常见的（"腾讯云"主号与"腾讯云出海服务"子号互相转），多归档路径下可能 walk 到同一原文。**用 `原文链接` 字段去重**——同一 URL 的文章只保留一份（取 frontmatter 时间戳更新的那份）。

如果两个 archive 都抓到同 URL 但 frontmatter 时间戳不同（scrape 时间不同），取较新的那条。

## grep 关键词怎么挑

Phase 1（query 拆解）已经把题目拆成产品名候选池。把这些候选词 + 题目自身的关键概念（如 "海外"、"AI"、"出海"、"compliance" 等）合并成 grep set。

不要用过短的词（"AI"、"云" 这种命中太多无意义段落）—— 至少 2-3 字组合 / 完整产品名。

特殊关键词扩展：

- 题目涉及"全球基础设施" → 加 "Region"、"AZ"、"数据中心"、各海外城市名（Singapore、Frankfurt、利雅得、雅加达 等）
- 题目涉及"AI" → 加 "Hunyuan"、"混元"、"Agent Development Platform"、"TCADP"、"CodeBuddy"
- 题目涉及"客户案例" → 加 "携手"、"联合"、"合作"、"打造"、"上线" 这类 PR 动词

## 不读图

公众号 markdown 里的 `![](images/img_001.png)` 引用一律忽略——grounding 只看文字。产品参数、客户名、量化指标几乎都在文字段落，图主要是封面 / 海报 / 截图，对 fact extraction 价值低。

**例外**：如果未来某场景一定要从图读（如某个客户 logo wall 必须列举），那是 v0.x+ 的工作，需要单独 OCR pipeline，不在当前 skill 范围内。

## 不入 context window 的策略

不要把整个 walk 出来的 md 全文塞进 LLM context。流程：

1. Walk 拿到所有 md 路径 + frontmatter（meta only，少量字符）
2. 用 grep 把段落级匹配抽出来（命中段落 only）
3. 只把命中段落 + frontmatter 进 Phase 3 抽取的 context

跨题 cache：所有 frontmatter 在一次 session 里只解析一次，后续题目复用 in-memory index。

## 待 v0.x+ 改进的事

1. 全文检索引擎（ripgrep + 模糊匹配 / SQLite FTS）替换简单 grep——多关键词权重排序
2. 公众号 PR 口径"分级"：客户案例段落 vs 通用 marketing 段落自动打 tag
3. 公众号转载 dedupe 用文章正文 hash（而不是 URL，应对偶尔的 URL 重定向）
4. 自动 cron：定时 trigger wechat-scraper，新文章自动入归档
5. 跨语言 grep：英文关键词在中文文章里命中的拼音 / 直译 fallback

不在当前 skill 边界内：

- **Discover 新公众号文章**：用户的 wechat-scraper 负责，不是 skill 的事
- **图片 OCR**：如上所述
- **PR 真伪甄别**：公众号 PR 偶尔有夸大（"业内首个"等），skill 只搬段落原文，让 wording skill / Phase 3 抽取时判断
