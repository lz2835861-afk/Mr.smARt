# Omdia RFI 2026 — 团队协作版部署指南

让 AR 团队多人在线协作填写答卷。技术栈：**Vite + React + HeroUI Pro + Supabase（Postgres + Auth + Realtime）+ Vercel**。

---

## 整体流程（5 步）

1. 建 Supabase 项目（5 分钟，免费）
2. 跑一个 SQL 脚本建表 + 配权限
3. 把 Supabase URL & key 写到 `.env.local`
4. 本地 `pnpm dev` 试一下
5. 推到 Vercel，团队访问

---

## 第 1 步 · 建 Supabase 项目

1. 打开 [supabase.com](https://supabase.com)，登录（用 GitHub 或邮箱皆可）
2. 点 **New Project**：
   - Name：`omdia-rfi-2026`（随意）
   - Database Password：随便设一个强密码（**记下来**，备份用，但日常用不到）
   - Region：选离团队近的（**Singapore** 最快，给中国用户访问体验好）
   - Plan：Free（够用）
3. 等 1-2 分钟，项目就绪

---

## 第 2 步 · 建表 + 权限

1. 在 Supabase 项目左侧栏找 **SQL Editor** → **New query**
2. 把 `supabase/schema.sql` 的全部内容复制粘贴进去
3. 点 **Run**（右下角绿按钮）
4. 看到 "Success. No rows returned" 就 OK

如果你的团队邮箱不是 `@tencent.com`，编辑 `schema.sql` 里两处 `'%@tencent.com'`，改成你们的域名（如 `'%@yourcompany.com'`）后再 Run。

---

## 第 3 步 · 配置邮件登录（Magic Link）

默认 Supabase 用自己的邮件服务发登录链接，但**生产环境强烈建议**配自己的 SMTP，否则可能被收件方判垃圾邮件。

1. Supabase Dashboard → **Authentication** → **Providers** → **Email**
   - 确认 **Enable Email Provider** 开着
   - **Confirm email** 关掉（Magic Link 不需要二次确认）
2. **可选但推荐**：Authentication → **Email Templates** → **Magic Link** — 把模板改成中文
3. **可选但推荐**：Authentication → **Email Auth** → 配 Custom SMTP（用 SendGrid / Resend / 阿里云邮件推送 等）

> Supabase 内置邮件服务**有每小时 3-4 封的限额**，团队人多会触发。Resend 免费给 100 封/天，足够内测。

---

## 第 4 步 · 本地配置 + 试跑

1. 拷贝模板：
   ```bash
   cd web
   cp .env.local.example .env.local
   ```
2. 打开 Supabase Dashboard → **Project Settings** → **API**
3. 把这两个值填到 `.env.local`：
   - `Project URL` → `VITE_SUPABASE_URL`
   - `Project API keys` → `anon public` → `VITE_SUPABASE_ANON_KEY`
4. 跑：
   ```bash
   pnpm dev
   ```
5. 浏览器打开 http://localhost:5173
   - 看到登录页 → 输你的 `@tencent.com` 邮箱 → 收邮件 → 点链接 → 进入应用
   - 进去后右上角应该显示「云端同步」绿点，sidebar footer 也显示「云端同步」
6. **多人测试**：开个无痕窗口、用另一个 `@tencent.com` 邮箱登录，两边各改一个字段，看是否实时同步 + 头像出现在右上 PresenceBar

---

## 第 5 步 · 部署到 Vercel

1. 把 `web/` 推到一个 GitHub repo（私有）
2. 打开 [vercel.com](https://vercel.com) → **Add New Project** → 选这个 repo
3. **Framework Preset**：Vite ✓
4. **Root Directory**：`web`（如果你把整个 `Omdia Cloud for China Enterprise` 文件夹推上去；否则留空）
5. **Environment Variables** 加两条：
   - `VITE_SUPABASE_URL` = （和本地一样）
   - `VITE_SUPABASE_ANON_KEY` = （和本地一样）
6. 点 **Deploy**

部署完会拿到一个 `xxx.vercel.app` 的 URL。
**重要**：回到 Supabase Dashboard → **Authentication** → **URL Configuration** → **Site URL** 填 `https://xxx.vercel.app`，**Redirect URLs** 加 `https://xxx.vercel.app/**`，否则 Magic Link 会跳到 localhost。

---

## 数据架构

```
public.answers
├── field_id   text   PK   ← 来自代码 (e.g. "s1_dc")
├── value      jsonb       ← 字符串 (text) 或数组 (checkboxes)
├── updated_by uuid        ← auth.users.id
└── updated_at timestamptz
```

- **共享单一工作区**：全队改同一份答卷
- **字段级 upsert**：A 改 1.1、B 改 2.3 不冲突（最后写入获胜，但不同字段互不覆盖）
- **Realtime 订阅**：A 改完 1 秒内 B 看到变化
- **Presence**：用 Supabase Realtime presence channel，无 schema 占用

---

## 安全 / 权限

- **RLS（Row Level Security）已开启**：只有邮箱匹配 `%@tencent.com` 的登录用户才能读/写 `answers` 表
- **Anon key 是公开的**：可以放前端 / 推 GitHub。真正的安全靠 RLS policy
- **Service role key 不要泄露**：在 Project Settings → API 里有一个 `service_role` key，**永远不要放前端**，它会绕过所有 RLS。我们这个项目不需要它

---

## 常见问题

**Q：登录链接邮件没收到？**
A：① 检查垃圾箱；② Supabase 内置邮件有限额，多人测试时容易触发；③ 配自定义 SMTP（见第 3 步）

**Q：登录后还是显示「本地模式」？**
A：检查浏览器 console 有没有 supabase 的报错。可能 `VITE_SUPABASE_URL` 或 `VITE_SUPABASE_ANON_KEY` 没配对。改完 `.env.local` 后**重启 dev server**

**Q：拿到 `permission denied for table answers`？**
A：你的邮箱不在白名单里。SQL Editor 跑 `select auth.jwt() ->> 'email';` 看实际邮箱是什么，然后调整 `schema.sql` 里的 ILIKE 模式

**Q：「恢复预填」会覆盖其他人的编辑吗？**
A：会。云端模式下"恢复预填"= 把所有字段重置为代码里的默认值，全员都看到这个变化。按钮已经加了 confirm，但 AR 团队需注意

**Q：可以把数据自托管在中国吗？**
A：可以。Supabase 是开源的（[supabase.com/docs/guides/self-hosting](https://supabase.com/docs/guides/self-hosting)），可以部署到腾讯云 Lighthouse / TKE。如果合规需求严，可以走方案 B（CloudBase）

---

## 文件清单

```
web/
├── .env.local              ← 你的 Supabase 配置（gitignored）
├── .env.local.example      ← 模板
├── supabase/
│   └── schema.sql          ← DB 建表脚本
└── src/
    ├── lib/supabase.ts     ← Supabase client + 邮箱白名单
    ├── hooks/
    │   ├── useAuth.ts      ← Magic Link 登录状态
    │   ├── useRemoteAnswers.ts ← 云端 + localStorage 双写
    │   └── usePresence.ts  ← 在线用户追踪
    └── components/
        ├── AuthGate.tsx    ← 登录拦截
        └── PresenceBar.tsx ← 在线头像
```
