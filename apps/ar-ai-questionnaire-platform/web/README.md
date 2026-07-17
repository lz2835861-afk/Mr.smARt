# web · AR 问卷协作台前端

项目总览与功能说明见仓库根目录 [**README.md**](../README.md)。

本目录是 Vite + React 应用，也是 Vercel 部署的 **Root Directory**。

## 本地开发

```bash
cp .env.local.example .env.local   # 填入 HEROUI_AUTH_TOKEN；协作时再加 Supabase
pnpm install
pnpm dev                           # → http://localhost:5173
```

## 进一步阅读

| 文档 | 内容 |
|------|------|
| [SETUP.md](./SETUP.md) | Supabase 建表、Magic Link、Vercel 部署、FAQ |
| [../docs/platform-handoff.md](../docs/platform-handoff.md) | 平台化设计、状态机、skill 导入契约 |
| [.env.example](./.env.example) | 全部环境变量说明 |

## 目录要点

- `src/data/` — 问卷题目与默认值（代码即数据源）
- `src/hooks/useRemoteAnswers.ts` — 云端 + localStorage 双写
- `api/ai.ts` — Kimi 服务端代理（密钥不进前端 bundle）
- `supabase/*.sql` — 按顺序在 Supabase SQL Editor 执行
