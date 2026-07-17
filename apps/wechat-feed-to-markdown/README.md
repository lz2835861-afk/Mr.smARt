# wechat-feed-to-markdown

> 把自建 [wewe-rss](https://github.com/cooderl/wewe-rss) 实例里的微信公众号文章批量抓回本地，转成干净的 Markdown + 下载好的图片。

[![Python 3.10+](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/downloads/)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

## 这是什么

如果你已经把 [wewe-rss](https://github.com/cooderl/wewe-rss) 部署到了某处（Zeabur / Vercel / 自己的服务器），这个 repo 帮你做：

- **`backfill.py`** —— 一次性批量回灌某个公众号的所有历史文章（断点续传）
- **`daily_sync.py`** —— 每日增量同步，可直接放 cron
- **`sort_into_accounts.py`** —— 把混在一起的输出按 `<公众号>/` 拆分
- **`prefix_by_date.py`** —— 给文章目录加 `YYYY-MM-DD - 标题/` 前缀，按日期稳定排序

每篇文章会变成：

```
output/
└── 2026-04-29 - 腾讯文档 x WorkBuddy ，通了！/
    ├── 腾讯文档 x WorkBuddy ，通了！.md      # 标题 + 公众号 + 发布时间 + 正文
    └── images/
        ├── img_001.gif
        ├── img_002.png
        └── img_003.png
```

## 技术能力

微信公众号文章对爬虫极不友好——反爬验证页、图片 hotlink Referer 校验、自定义代码块 DOM (`code-snippet__fix` + 行号占位符)、数学公式被渲染成 SVG 图片、视频 iframe、懒加载 `data-src` 等等。本项目把这些都处理掉了：

1. **单文章 → Markdown** —— [Camoufox](https://github.com/daijro/camoufox) 反检测 Firefox 抓完整渲染后的 HTML，BeautifulSoup 解析 `#js_content` 正文 / 元数据 / 代码块 / 图片，markdownify 转 MD，图片并发下载到本地并把链接替换成相对路径
2. **批量历史回灌** —— 通过 wewe-rss 的 tRPC API 列出所有文章 ID（绕开 sogou 搜索 / 抓包公众号 token 等灰产路径），分页拉 `/feeds/X.json` 直接拿渲染好的内容
3. **Camoufox 兜底** —— wewe-rss 在某些 ID 上会"静默丢失文章"或返回验证页，pipeline 自动检测并退到 Camoufox 直抓 `mp.weixin.qq.com/s/<id>`
4. **断点续传 + 风控自适应** —— 磁盘上已存在的文章自动跳过；分页 limit 和重试退避都调过实测可工作的值；wewe-rss 502 时优雅重试不丢数据
5. **多公众号拆分 + 日期排序** —— wewe-rss 偶尔返回多公众号混合的文章列表，可按 MD 元数据里的 `> 公众号:` 字段重新归类；目录加 `YYYY-MM-DD - 标题/` 前缀，文件管理器按名称降序就稳定置顶

如果你还没有 wewe-rss，先按它的 [一键部署文档](https://github.com/cooderl/wewe-rss#deploy) 部上 Zeabur/Render。本项目假设你已经有 wewe-rss 在跑。

## 架构

```
┌─────────────────────────────────────────────────────────────┐
│  你的 wewe-rss 实例                                          │
│   ┌──────────────┐         ┌─────────────────────────┐      │
│   │  tRPC API    │         │  /feeds/MP_X.json       │      │
│   │              │         │   (请求时按需现去微信     │      │
│   │ article.list │         │    拉 HTML)             │      │
│   │ feed.refresh │         │                         │      │
│   └──────┬───────┘         └────────────┬────────────┘      │
└──────────┼──────────────────────────────┼───────────────────┘
           │ ID + 元数据                    │ 微信原始 HTML
           ▼                               ▼
   ┌──────────────────────────────────────────────┐
   │  backfill.py (本仓库)                         │
   │                                              │
   │   for each id in target:                     │
   │     先试 /feeds/X.json 分页 ─────┐           │
   │     │                            │           │
   │     │ 没拿到该 id                │           │
   │     ▼                            ▼           │
   │   Camoufox 直抓     ◄──────  BeautifulSoup   │
   │   mp.weixin.qq.com/s/<id>     解析 +         │
   │                               markdownify    │
   │                                       │      │
   │                                       ▼      │
   │   output/<title>/<title>.md + images/        │
   └──────────────────────────────────────────────┘
```

## 5 分钟跑起来

### 1. 前置条件

- macOS 或 Linux（Camoufox 支持 Windows 但本项目没测过）
- Python 3.10+ 和 [uv](https://github.com/astral-sh/uv)
- 一个跑着的 wewe-rss 实例 + 它的 `AUTH_CODE`
- 你已经在 wewe-rss 里订阅好的公众号 `MP_ID`（从后台 URL 看：`…/dash/feeds/MP_WXS_…`）
- `gh` CLI 已登录（仅首次装 Camoufox 用，下面有解释）

### 2. 安装

```bash
git clone https://github.com/<你的用户名>/wechat-feed-to-markdown.git
cd wechat-feed-to-markdown
uv sync                 # 装 Python 依赖（约 30 秒）

# 下载 Camoufox Firefox 二进制（约 300MB，一次性）
# 为啥需要 GH_TOKEN？Camoufox 内部要查 GitHub Releases API 找下载地址，
# 未认证调用每小时只能 60 次，公司/学校共享出口 IP 很容易被限流。
GH_TOKEN="$(gh auth token)" uv run python scripts/fetch_camoufox.py
```

### 3. 配置

```bash
# auth code 写到 600 权限文件里（避开 shell 里 $、\、{} 这类字符的转义坑）
printf '%s' '你的-AUTH_CODE' > .auth && chmod 600 .auth

# 指向你的 wewe-rss 地址（写到 ~/.zshrc / ~/.bashrc 永久生效）
export WEWERSS_BASE_URL=https://你的-wewerss.example.com
```

### 4. 跑起来

**首次回灌（拉过去 365 天历史）**：
```bash
uv run python scripts/backfill.py \
  --mp-id MP_WXS_1234567890 \
  --output output_by_account

# 拆账号 + 加日期前缀
uv run python scripts/sort_into_accounts.py output_by_account output_by_account
uv run python scripts/prefix_by_date.py output_by_account
```

**之后每次同步新文章（最常用）**——一行命令搞定 refresh + 增量抓 + 拆账号 + 加日期前缀：
```bash
uv run python scripts/sync.py \
  --mp-id MP_WXS_1234567890 \
  --output output_by_account
```
全程断点续传 idempotent，没新内容也安全。结尾会列出本次新增的文章名。

预期看到类似输出：

```
📋 listing all articles for MP_WXS_1234567890...
   total: 110; within 365d: 101
   already on disk: 0; to fetch: 101

📄 fetching page 1 (batch=5, remaining todo: 101)
  → bKHJ_17yLqBLleIKGtDNWg | 腾讯文档 x WorkBuddy ，通了！
🖼  下载 4 张图片 (并发 5)...
  ✅ 4/4
      ✅ 1400 chars, 4 imgs
…
🦊 Camoufox fallback for 44 IDs not served via JSON feed...
  [1/44] jepj-IFv3UR9LpZlt-h82w | …
…
📊 done: 101 ok, 0 failed, 0 pre-existing
```

### 5. 设置每日同步 cron

```bash
# crontab -e
0 9 * * * cd /Users/you/wechat-feed-to-markdown && \
  WEWERSS_BASE_URL=https://你的-wewerss.example.com \
  /Users/you/.local/bin/uv run python scripts/sync.py \
    --mp-id MP_WXS_1234567890 --output output_by_account \
  >> ~/wechat_sync.log 2>&1
```

`sync.py` 做四件事：
1. POST `/trpc/feed.refreshArticles` 让 wewe-rss 去微信拉新文章
2. 等 5 秒让异步刷新落库
3. 跑 `backfill.py --since-days 14`（断点续传，只抓新的）
4. 自动拆账号 + 加日期前缀，最后打印本次新增清单

## 实战踩过的坑（lessons learned）

构建过程中实际遇到的问题，知道了能省你几小时。

### Camoufox 安装会撞 GitHub API 限流

Camoufox 的 `fetch` 会用裸 `requests.get(api.github.com)`，没带 Authorization。**未认证 GitHub API 限制 60 req/hr/IP**，公司或共享网络很容易撞上。仓库自带的 `scripts/fetch_camoufox.py` 会 monkey-patch `requests.get` 注入 `$GH_TOKEN`，绕过这个坑。

### wewe-rss `/feeds/X.json?limit=1000` 返 502

一次性拉太多文章会让 Zeabur 网关超时。`backfill.py` 每页 `limit=5`（每个请求已经是 ~15MB 内联 HTML，再大会把 wewe-rss 的 Node 进程打 OOM）。

### wewe-rss `/feeds` 会"静默丢失"部分文章

我们测试时一个有 110 篇文章的 feed，通过 `/feeds/X.json` 分页只能拿到约 57 篇。看 wewe-rss 源码没看出明显问题。**解法**：分页拿不到的 ID，`backfill.py` 自动用 Camoufox 直接抓 `https://mp.weixin.qq.com/s/<id>` 兜底。

### wewe-rss 的 `publishTime` tie-break 跟你客户端不一样

同一天发布的两篇文章，wewe-rss 服务端 Prisma 排序和你 Python 端 `sorted(items, key=publishTime, reverse=True)` 顺序可能不一致。**千万别在客户端预算页号**，要顺序分页拿到啥处理啥。

### wewe-rss `article.list?mpId=X` 可能返回多个公众号混合的结果

我们的部署里发现：传一个 mpId 查询，返回的 items 里 `mpId` 字段是混的。源码看着是对的（`where: mpId ? { mpId } : undefined`），怀疑是 DB 层数据本身有问题。**所以 backfill 之后必须跑 `sort_into_accounts.py`**，按 MD 里的 `> 公众号:` 字段重新归类。

### wewe-rss 在持续重负载下会 502 崩溃

每个 `/feeds/X.json` 调用都触发 wewe-rss 去微信拉每篇文章的全文 HTML，内存吃得很猛。20 分钟连续 backfill 能把 Zeabur 512MB 的实例打 OOM。**遇到 502 等一分钟，从控制台 restart，再继续跑** —— `backfill.py` 完全断点续传，不会重复抓。

### 微信读书账号 session 30 天会过期

到期后 `feed.refreshArticles` 会返 `暂无可用读书账号！`。**必须登录到 wewe-rss 后台重新扫码**，没法绕开（这是 wewe-rss 唯一的 WeChat 文章授权来源）。

### Camoufox 兜底抓的文章有时缺 `公众号` 元数据

当 `process_content` 处理 Camoufox 抓回来的 HTML 时，偶尔 `#js_name` 选择器不存在，提取不到公众号名字。正文还是好的，只是 frontmatter 里 `> 公众号:` 这一行会缺失。这种文章会被 `sort_into_accounts.py` 放到 `_unclassified/` 里供你手动归类。

## 文件清单

| 文件 | 作用 |
|---|---|
| `scripts/wechat_article_to_markdown.py` | 单 URL → MD 核心：Camoufox 抓 HTML → BeautifulSoup 解析正文/元数据/代码块/图片 → markdownify 转 MD + 图片本地化 |
| `scripts/feed_to_markdown.py` | 把 wewe-rss JSON feed 里的一个 item 转成 MD；含验证页检测 + Camoufox 兜底 |
| `scripts/backfill.py` | 列文章 → /feeds 分页 → Camoufox 兜底，断点续传 |
| `scripts/sync.py` | **一键同步**：refresh + backfill + 拆账号 + 日期前缀 + 新增清单（推荐入口） |
| `scripts/daily_sync.py` | `sync.py` 的简化版（只做 refresh + backfill，不带 organize） |
| `scripts/sort_into_accounts.py` | 把混合输出按公众号拆成子文件夹 |
| `scripts/prefix_by_date.py` | 给文章目录加 `YYYY-MM-DD -` 前缀 |
| `scripts/fetch_camoufox.py` | 一次性 Camoufox 安装器（注入 `$GH_TOKEN`） |

## 作为 AI Agent skill 使用

仓库根目录自带 [`SKILL.md`](./SKILL.md)，Claude Code 和其他 [`.agents/skills/`](https://github.com/vercel-labs/skills) 协议的 agent 可以自动发现这个工作流：

```bash
# Skills CLI（推荐）
npx skills add <你的用户名>/wechat-feed-to-markdown

# 或手动安装到 Claude Code 用户级 skills 目录
mkdir -p ~/.claude/skills/wechat-feed-to-markdown
curl -o ~/.claude/skills/wechat-feed-to-markdown/SKILL.md \
  https://raw.githubusercontent.com/<你的用户名>/wechat-feed-to-markdown/main/SKILL.md
```

装好之后重启 Claude Code，试着说一句*"用 wechat-feed-to-markdown 把 MP_WXS_xxx 这个公众号一年内的文章下下来"*，Claude 就会自动用这个 skill 走完整套流程。

## 致谢

- [cooderl/wewe-rss](https://github.com/cooderl/wewe-rss) —— 自建微信公众号聚合，让批量操作成为可能
- [daijro/camoufox](https://github.com/daijro/camoufox) —— 反检测 Firefox 分支

## License

MIT —— 详见 [LICENSE](LICENSE)。
