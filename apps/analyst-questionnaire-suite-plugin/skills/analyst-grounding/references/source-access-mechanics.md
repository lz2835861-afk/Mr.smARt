# Source Access Mechanics

> Skill 在 Phase 2（source 抓取）使用。每个 source 怎么访问、什么 v0.x 上线、有什么限制。

## v0.1（当前）—— 公开文档

### `cloud.tencent.com/document` (中文文档)

工具：**Firecrawl** (`mcp__firecrawl__firecrawl_scrape` / `firecrawl_search` / `firecrawl_map`)

抓取策略：

1. 先用 `firecrawl_map` 给定产品根 URL 列出所有子页：
   ```
   firecrawl_map(url="https://cloud.tencent.com/document/product/1132", search="<keyword>")
   ```
2. 对感兴趣的子页用 `firecrawl_scrape` 抓 markdown：
   ```
   firecrawl_scrape(url="<sub-url>", formats=["markdown"], onlyMainContent=true)
   ```
3. 抓 metadata 时包括 `og:updated_time` / `article:modified_time` / `<meta name="lastmod">` 等任何能拿到的时间戳

注意事项：

- 文档结构有产品总览 → 子模块 → 具体特性 / API 三层
- 抓总览 + 特性页足够 grounding；不需要全站爬
- 同一产品中英两版结构一致，可双抓后比对（中文常更详细，英文常更分析师友好）

### `www.tencentcloud.com/document` (国际版英文文档)

工具：**Firecrawl**（同上）

策略：

- 优先抓 EN 版本（节约 wording skill 的翻译工作）
- 国内独有功能（如等保 2.0 / DSL 合规）回落中文版
- EN 版本如果是某产品 stub（"coming soon" 或 thin description），认为 EN 不可用，用中文版

---

## v0.2（roadmap）—— 云知

### 云知（内部知识库）

工具：**Playwright**（浏览器自动化）

为什么不用 Firecrawl：云知需要登录态 + 可能在企业内网 + 可能不是标准 web 而是 SPA。Playwright 能 handle 这些。

待 v0.2 调研的事项：

1. **Auth 机制**：单点登录？session cookie？需要 VPN？
2. **URL 结构**：是否有稳定 URL pattern 让 skill 直接 navigate？还是只能搜索？
3. **搜索 API**：是否有内部 search endpoint？还是只能模拟 UI 搜索？
4. **页面结构**：内容在 DOM 哪里？SPA 加载需要 wait 多久？
5. **Rate limit**：多频抓会不会被 IT 封？

v0.2 实现前必须确认：

- 用户能否在自己的电脑上登录云知（决定 Playwright 能不能跑）
- Tencent IT 是否允许浏览器自动化工具访问云知（合规问题）

---

## v0.1 —— 公众号本地归档

### 公众号（本地 markdown 目录）

工具：**Node.js / shell filesystem walk**（不需要 Firecrawl 也不需要 RSS 服务）

**前提**：用户在 grounding skill 之外完成 scrape，把公众号文章存成本地 markdown。skill 只负责消费已有归档，不负责发现 URL。

详见 [wechat-archive-format.md](wechat-archive-format.md) 完整规范。

#### 配置（用户一次性）

设环境变量 `WECHAT_ARCHIVE_PATHS`（逗号分隔多绝对路径）：

```bash
export WECHAT_ARCHIVE_PATHS="/path/to/output_by_account/腾讯云出海服务,/path/to/output_by_account/腾讯云"
```

或者写到 shell rc / 项目 `.env` 里。

#### 期望的目录结构

```
$WECHAT_ARCHIVE_PATHS/
└── <account>/                                     ← 公众号名（如 "腾讯云出海服务"）
    └── <YYYY-MM-DD - 标题>/                       ← 单篇文章文件夹
        ├── <标题>.md                              ← 正文
        └── images/                                ← 图片资源（grounding 不读）
```

#### 单篇 md 文件期望的 frontmatter

```markdown
# <标题>

> 公众号: 腾讯云出海服务
> 发布时间: 2025-03-26 16:30
> 原文链接: https://mp.weixin.qq.com/s/abc123

---

<正文 markdown>
```

skill 解析这 3 个 frontmatter 字段拿到完整 provenance。如果 md 缺 frontmatter（手工放进去的旧文），skill 退化用文件夹名前缀 `YYYY-MM-DD` 当 Published，文件名当 title。

#### 抓取策略

```
1. 读 WECHAT_ARCHIVE_PATHS env（未设 → skip 整个公众号源）
2. 对每个路径，递归 walk 找所有 *.md
3. 解析每个 md 的 frontmatter 提取（公众号 / 发布时间 / 原文链接）
4. 用 Phase 1 拆出来的产品名 / 关键词在 md 正文做 grep（多关键词 OR 匹配）
5. 命中段落原文进入 Phase 3 候选池
6. 全部 md 标题 / frontmatter 同步索引一份在 session memory 里，跨题不重复读
```

#### 注意事项

- 公众号 PR 比文档站新——同一事实跨源时按 timestamp 决定优先级（详见 source-priority.md）
- 公众号 markdown 里的图片用 `![](images/img_001.png)` 引用，**grounding 不读图，只读文**——产品事实通常在文字
- 公众号 PR 常含口径偏宣传（"业内首个"、"全球领先"），需要 Phase 3 抽取时判断是 fact 还是 marketing claim
- 同一篇文章可能在多个 account 下重复（公众号转载），dedupe 用 `原文链接` 字段

#### 为什么没用 WeRSS / RSSHub 的 discovery 路径

之前 v0.3 草案用 WeRSS / RSSHub 自动发现新文章。实际跑下来用户已经有自己的 wechat-scraper 工具链，本地归档做得很好（结构规整 + 图片同存）。skill 直接消费本地归档**比走 RSS 简单**：
- 没有 RSS 订阅成本 / ops 维护
- 不依赖第三方 RSS 服务的稳定性
- 用户自己控制更新节奏（重新跑 scraper 即可）
- 离线可用

未来如果团队需要 hands-off 自动新增（不用人工触发 scraper），可以加一个独立的 ingest cron 把 wechat-scraper 跑一次再 walk 归档——但仍走"本地归档"这条路径，不引入 skill 的发现职责。

---

## v0.x 优先级与依赖

```
v0.1 (current)
  ├── cloud.tencent.com/document           (Firecrawl)
  ├── www.tencentcloud.com/document        (Firecrawl)
  └── 公众号本地归档                        (filesystem walk via WECHAT_ARCHIVE_PATHS)
       └── 依赖：用户预先 scrape 好（wechat-scraper 工具链）

v0.2 (next)
  └── 云知                                 (Playwright + auth)
       └── 依赖：用户能登录云知 + IT 允许浏览器自动化
```

每个 v0.x 上线前都跑 1-2 道真题验证 → 修 bug → 再扩。

---

## 通用抓取规则（所有 source 都适用）

1. **每次抓必须带 timestamp**：`Retrieved` 是抓的时间，`Page-updated` / `Published` 是源里的时间
2. **抓回的 raw content 不直接用**：要进 Phase 3 做 audit-tagged 抽取
3. **不缓存 raw content 长期**：抓完就用，过期就丢；下次需要再抓（除非 v0.1 升级到 hybrid pre-index）
4. **rate limit 友好**：批量抓时间隔 ≥ 200ms（避免对腾讯 CDN / 云知 / 微信 触发风控）
5. **失败要记录**：抓失败的 URL 列入 `[REVIEW: product]`（"该 URL 无法抓取，可能权限/网络问题，请人工核查"）

---

## 不在 grounding skill 范围内的 source

- **客户私下分享的资料**（PRD、销售 deck）—— 走人工，不走 skill
- **历年问卷历史答案**—— 历史口径 review 是另一个 workflow（参考 wording skill 边界声明）
- **公开 web 搜索**（除文档/公众号外）—— v0.x 不做，避免引用低质量第三方内容
- **第三方分析师报告（Gartner/Forrester）历史 PDF**—— 这是 evidence target 的一部分，不是 evidence source
