# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

个人技术品牌与全栈名片网站，采用 Next.js App Router + Vercel Postgres + Prisma 技术栈，支持中英双语、深色/明亮主题、AI翻译、CMS后台管理。

## 常用命令

```bash
# 开发
npm run dev          # 启动开发服务器 (http://localhost:3000)
npm run build        # 构建生产版本
npm run start        # 启动生产服务器
npm run lint         # ESLint 检查

# 数据库
npx prisma generate  # 生成 Prisma Client
npx prisma db push   # 推送 schema 到数据库
npx prisma studio    # 打开 Prisma Studio（数据库管理界面）
npx prisma migrate dev --name <name>  # 创建迁移

# 部署
vercel               # 部署到 Vercel
vercel --prod        # 部署到生产环境
```

## 技术栈

- **前端**: Next.js 16.2.7 (App Router) + React 19.2.4 + TypeScript 5
- **样式**: Tailwind CSS 4 + Framer Motion 12.40.0
- **数据库**: Vercel Postgres (PostgreSQL) + Prisma 7.8.0
- **认证**: NextAuth.js 4.24.14 (GitHub OAuth)
- **存储**: Vercel Blob（图片和文件）
- **翻译**: Deepseek API 或 DeepL API
- **评论**: Giscus（基于 GitHub Discussions）
- **Markdown**: react-markdown + rehype-highlight + remark-gfm

## 架构设计

### 目录结构

```
src/
├── app/
│   ├── [locale]/          # 多语言路由 (/zh, /en)
│   │   ├── page.tsx       # 首页
│   │   ├── about/         # 关于我
│   │   ├── blog/          # 博客
│   │   └── projects/      # 项目展示
│   ├── admin/             # CMS后台（需要认证）
│   │   ├── page.tsx       # 仪表盘
│   │   ├── posts/         # 文章管理
│   │   ├── projects/      # 项目管理
│   │   └── upload/        # 文件上传
│   └── api/               # API路由
│       ├── auth/          # NextAuth认证
│       ├── posts/         # 文章API
│       ├── projects/      # 项目API
│       ├── skills/        # 技术栈API
│       ├── translate/     # AI翻译API
│       ├── upload/        # 文件上传API
│       └── analytics/     # 访问统计API
├── components/            # React组件
│   ├── home/              # 首页组件
│   ├── about/             # 关于我组件
│   ├── blog/              # 博客组件
│   ├── projects/          # 项目组件
│   ├── admin/             # CMS后台组件
│   ├── command/           # 命令面板
│   └── layout/            # 布局组件
├── lib/                   # 工具库
│   ├── prisma.ts          # Prisma客户端
│   ├── auth.ts            # NextAuth配置
│   ├── i18n.ts            # 国际化
│   ├── translate.ts       # AI翻译服务
│   ├── storage.ts         # Vercel Blob存储
│   └── analytics.ts       # 访问统计
├── contexts/              # React Context
│   └── ThemeContext.tsx    # 主题上下文
├── dictionaries/          # i18n字典
│   ├── zh.json            # 中文
│   └── en.json            # 英文
└── types/                 # TypeScript类型
```

### 核心功能

1. **多语言路由**: 基于 `[locale]` 动态路由，支持 `/zh` 和 `/en`
2. **深色/明亮主题**: 使用 React Context + localStorage 持久化
3. **CMS后台**: 基于 NextAuth.js 的 GitHub OAuth 认证，支持项目和文章的 CRUD
4. **AI翻译**: 集成 Deepseek/DeepL API，支持一键翻译中文内容到英文
5. **文件上传**: 支持 Markdown/MDX 文件上传和图片上传（Vercel Blob）
6. **访问统计**: 记录 PV/UV，支持按页面、来源、国家统计

### 数据库模型

- **Project**: 项目信息（双语字段、技术栈、翻译状态）
- **Post**: 文章信息（双语内容、标签、阅读次数）
- **Skill**: 技术栈（名称、分类、熟练度）
- **Visit**: 访问记录（路径、IP匿名化、来源）
- **User/Account/Session**: NextAuth.js 认证模型

## 关键配置

### 环境变量

必需的环境变量（在 `.env` 或 Vercel Dashboard 中配置）：

```env
# 数据库
POSTGRES_PRISMA_URL="postgresql://..."
POSTGRES_URL_NON_POOLING="postgresql://..."

# NextAuth.js
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="https://yourdomain.com"
GITHUB_ID="your-github-oauth-id"
GITHUB_SECRET="your-github-oauth-secret"

# AI翻译
DEEPSEEK_API_KEY="your-deepseek-key"
# 或 DEEPL_API_KEY="your-deepl-key"

# Vercel Blob
BLOB_READ_WRITE_TOKEN="your-blob-token"

# 网站URL
NEXT_PUBLIC_SITE_URL="https://yourdomain.com"
```

### Prisma 配置

项目使用 Prisma 7.x，配置文件在 `prisma.config.ts`：
- Schema 文件: `prisma/schema.prisma`
- 连接 URL 从环境变量读取

### Next.js 配置

`next.config.ts` 包含：
- 图片优化（AVIF/WebP 格式）
- 安全 Headers（CSP、X-Frame-Options 等）
- 缓存策略（静态资源1年缓存）
- 实验性功能优化

## 开发流程

### 添加新页面

1. 在 `src/app/[locale]/` 下创建页面目录
2. 创建 `page.tsx` 文件
3. 更新 `src/dictionaries/zh.json` 和 `en.json` 添加翻译
4. 如需数据库数据，在 `src/app/api/` 创建对应 API

### 添加新 API

1. 在 `src/app/api/` 下创建路由目录
2. 创建 `route.ts` 文件，导出 `GET/POST/PUT/DELETE` 函数
3. 使用 `src/lib/prisma.ts` 访问数据库
4. 使用 `src/lib/auth.ts` 验证管理员权限

### 添加新组件

1. 在 `src/components/` 下对应目录创建组件
2. 使用 `'use client'` 指令标记客户端组件
3. 使用 Framer Motion 实现动画
4. 使用 Tailwind CSS 样式

### 数据库变更

1. 修改 `prisma/schema.prisma`
2. 运行 `npx prisma db push` 推送变更
3. 运行 `npx prisma generate` 重新生成客户端

## 部署

### Vercel 部署

1. 推送代码到 GitHub
2. 在 Vercel Dashboard 导入项目
3. 配置环境变量
4. 自动部署（GitHub Actions CI/CD）

### GitHub Actions

`.github/workflows/deploy.yml` 配置：
- PR 触发 Preview 部署
- Push to main 触发 Production 部署
- 自动运行 lint 和 build 检查

## 注意事项

1. **翻译状态**: 所有双语字段（titleZh/titleEn, contentZh/contentEn）支持 `translationStatus` 状态
2. **图片上传**: 使用 Vercel Blob，URL 存储在数据库中
3. **访问统计**: Visit 模型的 IP 地址已匿名化处理
4. **评论系统**: 使用 Giscus，需要配置 GitHub Discussions
5. **命令面板**: 按 `Ctrl+K` 打开，支持 help/contact/resume 等命令

## 相关文档

- `ENV_SETUP.md` - 环境变量配置指南
- `DEPLOYMENT_CHECKLIST.md` - 部署检查清单
- `prisma/schema.prisma` - 数据库模型定义
