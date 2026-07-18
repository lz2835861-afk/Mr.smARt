/**
 * AR 问卷助手 — 后端搜索聚合服务（本地开发入口）
 *
 * 启动命令: node server/index.js
 * Vercel 部署入口: api/index.js
 */

import app from './app.js';

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`\n  🚀 AR 问卷助手搜索服务已启动`);
  console.log(`  📡 地址: http://localhost:${PORT}`);
  console.log(`  🔍 搜索: http://localhost:${PORT}/api/search?q=CodeBuddy`);
  console.log(`  📊 健康: http://localhost:${PORT}/api/health\n`);
});
