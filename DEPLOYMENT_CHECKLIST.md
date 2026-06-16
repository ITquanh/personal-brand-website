# 部署检查清单

在将网站部署到生产环境之前，请完成以下检查清单。

## ✅ 代码质量检查

- [ ] 所有 TypeScript 错误已修复
- [ ] ESLint 检查通过 (`npm run lint`)
- [ ] 代码已格式化
- [ ] 没有 `console.log` 语句（生产环境）
- [ ] 没有硬编码的敏感信息

## ✅ 功能测试

### 首页
- [ ] Hero Terminal 动效正常显示
- [ ] 终端动效自动跳过（5秒）
- [ ] Bento Grid 布局响应式正常
- [ ] 项目卡片点击跳转正常
- [ ] 语言切换正常（/zh、/en）

### 关于我页面
- [ ] 时间轴动画正常
- [ ] 技术栈标签云/雷达图正常
- [ ] 悬停效果正常

### 项目展示
- [ ] 项目列表加载正常
- [ ] 无限滚动/分页正常
- [ ] 项目详情页正常
- [ ] 技术栈筛选正常

### 博客
- [ ] 文章列表加载正常
- [ ] 文章详情页正常
- [ ] Markdown 渲染正常
- [ ] 代码高亮正常
- [ ] 目录导航正常
- [ ] 标签筛选正常

### CMS 后台
- [ ] GitHub OAuth 登录正常
- [ ] 管理员白名单限制正常
- [ ] 项目 CRUD 操作正常
- [ ] 文章 CRUD 操作正常
- [ ] Markdown 实时预览正常
- [ ] AI 翻译功能正常
- [ ] 文件上传功能正常

### 交互功能
- [ ] 命令面板（Ctrl+K）正常
- [ ] 深色/明亮模式切换正常
- [ ] 主题偏好持久化正常
- [ ] 评论系统（Giscus）正常

### SEO
- [ ] sitemap.xml 可访问
- [ ] robots.txt 可访问
- [ ] JSON-LD 结构化数据正确
- [ ] Open Graph 标签正确
- [ ] Twitter Card 标签正确

## ✅ 性能测试

- [ ] 首屏加载时间 < 2秒（4G网络）
- [ ] Core Web Vitals 评分达标
  - [ ] LCP (Largest Contentful Paint) < 2.5s
  - [ ] FID (First Input Delay) < 100ms
  - [ ] CLS (Cumulative Layout Shift) < 0.1
- [ ] 图片懒加载正常
- [ ] 代码分割正常

## ✅ 安全检查

- [ ] 环境变量已配置（不在代码中）
- [ ] API 路由权限验证正常
- [ ] CSP Headers 已配置
- [ ] CORS 配置正确
- [ ] SQL 注入防护（Prisma 自动处理）
- [ ] XSS 防护已配置

## ✅ 部署配置

### GitHub
- [ ] 代码已推送到 GitHub
- [ ] `.gitignore` 包含 `.env*`、`node_modules`、`.next`
- [ ] README.md 已更新

### Vercel
- [ ] Vercel 项目已创建
- [ ] 环境变量已配置
- [ ] 自定义域名已配置（如有）
- [ ] GitHub Actions 已配置

### 数据库
- [ ] Vercel Postgres 已创建
- [ ] Prisma schema 已推送 (`prisma db push`)
- [ ] 数据库连接正常

### 外部服务
- [ ] GitHub OAuth App 已创建
- [ ] AI翻译 API Key 已配置
- [ ] Vercel Blob 存储已配置
- [ ] Giscus 评论系统已配置

## ✅ 最终检查

- [ ] 所有页面在不同设备上显示正常
  - [ ] 桌面（1920x1080）
  - [ ] 笔记本（1366x768）
  - [ ] 平板（768x1024）
  - [ ] 手机（375x667）
- [ ] 所有浏览器兼容性正常
  - [ ] Chrome
  - [ ] Firefox
  - [ ] Safari
  - [ ] Edge
- [ ] 移动端触摸交互正常
- [ ] 无障碍访问基本支持

## ✅ 上线后验证

- [ ] 生产环境 URL 可访问
- [ ] 登录功能正常
- [ ] 数据读写正常
- [ ] 文件上传正常
- [ ] 邮件通知正常（如有）
- [ ] 监控告警已配置

## 📝 上线步骤

1. **代码准备**
   ```bash
   # 确保代码是最新的
   git pull origin main
   
   # 运行 lint 检查
   npm run lint
   
   # 本地构建测试
   npm run build
   ```

2. **提交代码**
   ```bash
   git add .
   git commit -m "feat: 准备生产环境部署"
   git push origin main
   ```

3. **配置 Vercel**
   - 登录 Vercel Dashboard
   - 导入 GitHub 仓库
   - 配置环境变量
   - 触发部署

4. **数据库迁移**
   ```bash
   # 在 Vercel 环境中运行
   npx prisma db push
   ```

5. **验证部署**
   - 访问生产环境 URL
   - 运行所有功能测试
   - 检查性能指标

6. **配置域名（可选）**
   - 在 Vercel 中添加自定义域名
   - 配置 DNS 记录
   - 等待 SSL 证书生成

## 🚨 回滚计划

如果生产环境出现问题：

1. **快速回滚**
   - 在 Vercel Dashboard 中回滚到上一个成功的部署
   - 或者使用 `git revert` 撤销最近的提交

2. **数据库回滚**
   - 如果有数据库迁移问题，恢复数据库备份
   - 使用 Prisma 的迁移历史回滚

3. **紧急联系**
   - 记录问题现象
   - 检查 Vercel 日志
   - 检查数据库日志

## 📊 监控配置

### Vercel Analytics
- [ ] 已启用 Vercel Analytics
- [ ] 配置性能监控
- [ ] 配置错误追踪

### 数据库监控
- [ ] Vercel Postgres 监控已启用
- [ ] 配置连接池监控
- [ ] 配置慢查询告警

### 应用监控
- [ ] 配置错误边界
- [ ] 配置 API 错误日志
- [ ] 配置用户行为分析（可选）

---

**检查人：** ________________
**检查日期：** ________________
**备注：** ________________
