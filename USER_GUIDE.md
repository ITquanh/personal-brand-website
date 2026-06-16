# 个人技术品牌网站 — 详细使用说明

> **项目名称**：personal-brand-website
> **版本**：v0.2.0（含安全修复 + 功能补全）
> **最后更新**：2026-06-05
> **技术栈**：Next.js 16 + React 19 + TypeScript 5 + Tailwind CSS 4 + Prisma 7.8

---

## 目录

1. [项目概述](#1-项目概述)
2. [快速启动](#2-快速启动)
3. [访客端功能](#3-访客端功能)
4. [管理后台功能](#4-管理后台功能)
5. [API 接口文档](#5-api-接口文档)
6. [环境变量配置](#6-环境变量配置)
7. [部署指南](#7-部署指南)
8. [测试说明](#8-测试说明)
9. [常见问题](#9-常见问题)

---

## 1. 项目概述

### 1.1 项目定位

集"极客美学"与"高信息密度"于一体的个人全栈数字空间，用于：
- **跨国求学与求职名片**：系统性展示跨界技术实力
- **独立开发者大本营**：沉淀 AI 工具链开发、系统自动化及全栈工程经验

### 1.2 核心功能清单

| # | 功能 | 状态 | 说明 |
|---|------|------|------|
| 1 | 终端动效首页 | ✅ | 打字机效果 + Bento Grid 卡片布局 |
| 2 | 关于我页面 | ✅ | 职业时间轴 + 技术栈标签云/雷达图 |
| 3 | 项目展示 | ✅ | 无限滚动项目墙 + 详情页（Markdown 架构渲染） |
| 4 | 博客系统 | ✅ | 文章列表 + Markdown 渲染 + 目录导航 + 代码高亮 |
| 5 | 管理后台 | ✅ | 用户名密码登录 + 仪表盘 + 统计图表 |
| 6 | AI 翻译 | ✅ | Deepseek/DeepL 双引擎 + 限流 + 批量翻译 |
| 7 | 多语言 | ✅ | 中英文路由 `/zh` `/en` + 全站 UI 翻译 |
| 8 | 深色/明亮模式 | ✅ | 默认深色 + localStorage 持久化 |
| 9 | 命令面板 | ✅ | Ctrl+K 唤起 + 模糊搜索 + 键盘导航 |
| 10 | 文件上传 | ✅ | Markdown 拖拽上传 + 图片魔数验证 |
| 11 | 访问统计 | ✅ | PV/UV + IP 匿名化 + 管理员图表 |
| 12 | 评论系统 | ✅ | Giscus（GitHub Discussions）|
| 13 | SEO 优化 | ✅ | JSON-LD + Open Graph + Sitemap + Robots.txt |

### 1.3 技术架构

```
┌─────────────────────────────────────────────┐
│                   前端                        │
│  Next.js 16 (App Router) + React 19          │
│  Tailwind CSS 4 + Framer Motion 12           │
│  react-markdown + rehype-highlight            │
├─────────────────────────────────────────────┤
│                   后端                        │
│  Next.js API Routes (Serverless Functions)    │
│  NextAuth.js (Credentials Provider)           │
│  Deepseek/DeepL 翻译服务                      │
├─────────────────────────────────────────────┤
│                   数据层                      │
│  Vercel Postgres (PostgreSQL) + Prisma 7.8    │
│  Vercel Blob（文件存储）                       │
├─────────────────────────────────────────────┤
│                   部署                        │
│  Vercel 一键托管 + GitHub Actions CI/CD       │
│  边缘 CDN + Serverless Functions              │
└─────────────────────────────────────────────┘
```

---

## 2. 快速启动

### 2.1 环境要求

| 工具 | 最低版本 | 说明 |
|------|----------|------|
| Node.js | 18+ | 推荐 20 LTS |
| npm | 9+ | 或 yarn/pnpm |
| Git | 任意 | 版本控制 |

### 2.2 首次启动

```bash
# 1. 进入项目目录
cd personal-brand-website

# 2. 安装依赖
npm install

# 3. 生成 Prisma 客户端
npx prisma generate

# 4. 初始化数据库（首次运行）
npx prisma db push

# 5. 启动开发服务器
npm run dev
```

启动后访问：`http://localhost:3000`

> ⚠️ 首次访问会自动跳转到 `/zh`（中文版）

### 2.3 所有可用命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器（热重载） |
| `npm run build` | 构建生产版本 |
| `npm start` | 启动生产服务器 |
| `npm run lint` | ESLint 代码检查 |
| `npm test` | 运行自动化测试（127 个用例） |
| `npm run test:watch` | 监听模式运行测试 |
| `npm run test:coverage` | 运行测试并生成覆盖率报告 |
| `npx prisma generate` | 生成 Prisma 客户端 |
| `npx prisma db push` | 推送 schema 到数据库 |
| `npx prisma studio` | 打开数据库管理界面 |

### 2.4 默认管理员凭据

| 字段 | 值 |
|------|-----|
| 用户名 | `admin` |
| 密码 | `admin123` |

> ⚠️ **生产环境务必修改**：通过 `.env` 文件中的 `ADMIN_USERNAME` 和 `ADMIN_PASSWORD` 设置强密码。

---

## 3. 访客端功能

### 3.1 首页（`/zh` 或 `/en`）

#### 终端打字机动效

首次加载时展示极客风格终端窗口，依次执行：

```
$ whoami
全栈开发者 | AI辅助开发专家

$ cat skills.txt
• Next.js / React / TypeScript
• Python / Node.js / Prisma
• Docker / Vercel / AWS
• Claude Code / Cursor / AI Tools

$ ./deploy_future.sh
✓ 部署成功！欢迎来到我的数字空间
```

**交互方式**：
- 等待 5 秒自动完成
- 1.5 秒后点击"跳过动画 →"立即跳过
- 动效结束后平滑过渡到 Bento Grid

#### Bento Grid 卡片布局

| 卡片 | 内容 | 交互 |
|------|------|------|
| 👨‍💻 个人简介 | 头像、姓名、职业描述 | — |
| 📊 技术栈雷达 | SVG 雷达图展示技能分布 | — |
| 🚀 精选项目 ×2 | 封面、标题、摘要、技术栈 | 点击跳转详情 |
| 📝 最新文章 | 最近 3 篇已发布文章 | 点击跳转详情 |
| 📧 联系方式 | GitHub、邮箱链接 | 点击打开链接 |
| ⌨️ 命令面板 | Ctrl+K 快捷键提示 | — |

---

### 3.2 关于我页面（`/zh/about`）

#### 个人简介区
- 头像和个人介绍
- 关键数据统计（工作年限、项目数量、客户数量）

#### 职业时间轴
- **左右交替布局**，事件节点依次出现（滚动触发动画）
- **三种事件类型**：💼 工作经历 / 🎓 教育背景 / 🚀 项目经历
- **悬停查看成就**：鼠标悬停展开详细成就列表
- **无障碍支持**：`role="list"` + `aria-label` 属性

#### 技术栈标签云
- 技能标签按熟练度动态调整大小
- 分类颜色区分：AI 工具（紫）、后端（蓝）、前端（绿）、基础设施（橙）
- 悬停显示熟练度百分比和相关项目

---

### 3.3 项目展示（`/zh/projects`）

#### 项目列表
- **响应式网格**：手机 1 列 / 平板 2 列 / 桌面 3 列
- **无限滚动**：滚动到底自动加载下一页（每页 12 个）
- **技术栈筛选**：顶部标签按钮，点击筛选对应项目
- **加载动画**：弹跳圆点动画
- **竞态保护**：防止并发请求导致数据重复

#### 项目详情页（`/zh/projects/{slug}`）
- 项目标题、摘要、量化影响指标
- 技术栈标签、GitHub/Demo 链接
- **架构设计**（Markdown 渲染 + 代码高亮）
- 项目元数据（创建时间、更新时间、翻译状态）

---

### 3.4 博客页面（`/zh/blog`）

#### 文章列表
- 标签筛选（最多 10 个标签按钮）
- 文章卡片：标题、摘要、标签、阅读时间、浏览次数、发布日期
- 翻译状态标识

#### 文章详情页（`/zh/blog/{slug}`）
- **Markdown 渲染**：完整 GFM 语法支持
- **代码高亮**：自动语法高亮，右上角显示语言标签
- **悬浮目录**：桌面端左侧显示，自动提取标题生成
- **目录高亮**：滚动时高亮当前可见标题
- **锚点跳转**：点击目录项跳转到对应段落
- **评论系统**：底部集成 Giscus 评论

#### 未翻译文章处理
当英文版尚未翻译时，显示"Coming Soon"提示：
- 中英文双语提示文字
- "阅读中文版本"链接跳转到 `/zh/blog/{slug}`

---

### 3.5 多语言切换

| 操作 | 说明 |
|------|------|
| 点击右上角 `EN` | 从中文切换到英文 |
| 点击右上角 `中` | 从英文切换到中文 |
| URL 变化 | `/zh/...` ↔ `/en/...` |

**支持范围**：
- 所有 UI 文案（导航、按钮、提示文字）
- 数据库内容（优先当前语言，回退中文）
- SEO 元标签（OG locale、hreflang）

---

### 3.6 深色/明亮模式

- 默认**深色模式**（极客风格）
- 右上角圆形滑块按钮切换
- 偏好保存到 `localStorage`，刷新后保持
- 所有页面实时同步切换
- `localStorage` 不可用时（隐私模式）自动回退到深色

---

### 3.7 命令面板

**唤起方式**：`Ctrl + K`（Windows/Linux）或 `Cmd + K`（Mac）

| 命令 | 图标 | 功能 |
|------|------|------|
| `help` | ❓ | 显示所有可用命令 |
| `contact` | 📧 | 显示联系方式 |
| `resume` | 📄 | 下载简历（开发中） |
| `theme` | 🎨 | 切换深色/明亮模式 |
| `home` | 🏠 | 跳转首页 |
| `about` | 👤 | 跳转关于我 |
| `projects` | 🚀 | 跳转项目展示 |
| `blog` | 📝 | 跳转博客 |
| `admin` | ⚙️ | 跳转管理后台 |

**交互**：模糊搜索 / ↑↓ 键盘导航 / Enter 执行 / ESC 关闭

---

### 3.8 SEO 与分享

每个页面自动配置：
- 页面标题：`页面名 | 个人技术品牌网站`
- Meta 描述 + Open Graph + Twitter Card
- JSON-LD 结构化数据（WebSite / Person / Article / SoftwareApplication）
- Sitemap：`/sitemap.xml`（包含所有中英文页面）
- Robots.txt：`/robots.txt`（允许公开页面，禁止 `/admin/` `/api/`）

---

## 4. 管理后台功能

### 4.1 登录

**访问地址**：`/admin`

1. 访问 `/admin` 自动跳转到 `/admin/login`
2. 输入管理员用户名和密码
3. 点击"登录"按钮
4. 登录成功后跳转到仪表盘

**安全机制**：
- 密码使用 `crypto.timingSafeEqual` 常量时间比较（防时序攻击）
- 凭据从环境变量读取，不硬编码
- 非认证用户无法访问管理页面
- 会话过期后自动跳转到登录页

---

### 4.2 仪表盘（`/admin`）

| 区域 | 内容 |
|------|------|
| 统计卡片 | 项目总数、文章总数、技术栈数量（可点击跳转管理页） |
| 访问统计 | 总访问量、今日访问、热门页面 Top 5、7 天趋势图 |
| 快速操作 | 创建新项目、创建新文章 |
| 系统信息 | 登录账号、站点链接 |

---

### 4.3 项目管理（`/admin/projects`）

#### 项目列表
- 显示所有项目（含未发布）
- 操作按钮：编辑 / 删除（需确认）

#### 创建/编辑项目

| 字段 | 必填 | 说明 |
|------|------|------|
| Slug | ✅ | URL 标识符，仅小写字母+数字+连字符 |
| 中文标题 | ✅ | 项目中文名称 |
| 英文标题 | — | 可点击"翻译"自动生成 |
| 中文摘要 | ✅ | 业务价值一句话摘要 |
| 英文摘要 | — | 可点击"翻译"自动生成 |
| 技术栈 | — | 动态添加/删除标签 |
| 架构说明 | — | 支持 Markdown 格式 |
| 量化影响 | — | 如"节约 80% 报表工时" |
| GitHub URL | — | 仓库地址 |
| Demo URL | — | 在线演示地址 |
| 封面图 URL | — | 图片地址 |
| 翻译状态 | — | 未翻译 / 已翻译 / 已审阅 |
| 精选项目 | — | 勾选后在首页展示 |

---

### 4.4 文章管理（`/admin/posts`）

#### 文章列表
- 显示所有文章（含草稿）
- 操作按钮：编辑 / 删除

#### 创建/编辑文章

| 字段 | 必填 | 说明 |
|------|------|------|
| Slug | ✅ | URL 标识符 |
| 中文标题 | ✅ | 文章标题 |
| 英文标题 | — | 可 AI 翻译 |
| 中文摘要 | — | 文章摘要 |
| 英文摘要 | — | 可 AI 翻译 |
| 标签 | — | 动态添加/删除 |
| Markdown 内容 | ✅ | 支持实时预览 |
| 发布状态 | — | 勾选发布，取消为草稿 |
| 阅读时间 | 自动 | 根据内容长度自动计算 |

---

### 4.5 AI 翻译功能

**使用方式**：
1. 在编辑器中输入中文内容
2. 点击标题/摘要旁的"翻译"按钮
3. 系统自动调用 AI API 翻译为英文
4. 翻译结果自动填充到英文字段

**翻译引擎优先级**：Deepseek → DeepL（自动降级）

**限流规则**：每用户每分钟最多 10 次请求

---

### 4.6 文件上传（`/admin/upload`）

- 支持 `.md` 和 `.mdx` 格式
- **拖拽上传**或**点击选择**
- 支持**批量上传**多个文件
- 自动解析 Front Matter 元数据
- 自动生成 URL 友好的 slug

**Front Matter 格式**：

```yaml
---
title: 文章标题
slug: article-slug
tags: [AI, 编程, Next.js]
published: true
---

正文内容（Markdown 格式）...
```

---

## 5. API 接口文档

### 5.1 项目 API

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/api/projects` | 项目列表 | 否 |
| POST | `/api/projects` | 创建项目 | ✅ |
| GET | `/api/projects/[id]` | 项目详情 | 否 |
| PUT | `/api/projects/[id]` | 更新项目 | ✅ |
| DELETE | `/api/projects/[id]` | 删除项目 | ✅ |

**GET 参数**：`page`（页码）、`limit`（每页数量，最大 100）、`techStack`（技术栈筛选）、`featured`（精选筛选）、`locale`（语言）

### 5.2 文章 API

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/api/posts` | 文章列表 | 否（仅已发布） |
| POST | `/api/posts` | 创建文章 | ✅ |
| GET | `/api/posts/[id]` | 文章详情 | 否 |
| PUT | `/api/posts/[id]` | 更新文章 | ✅ |
| DELETE | `/api/posts/[id]` | 删除文章 | ✅ |

**GET 参数**：`page`、`limit`、`tag`（标签筛选）、`published`（`all` 需认证）、`locale`

> GET `/api/posts/[id]` 每次访问自动增加 viewCount

### 5.3 技术栈 API

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/api/skills` | 技能列表 | 否 |
| POST | `/api/skills` | 创建技能 | ✅ |
| GET | `/api/skills/[id]` | 技能详情 | 否 |
| PUT | `/api/skills/[id]` | 更新技能 | ✅ |
| DELETE | `/api/skills/[id]` | 删除技能 | ✅ |

**验证规则**：name 唯一且 ≤100 字符、category 字符串、proficiency 1-100 数字

### 5.4 翻译 API

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/api/translate` | 服务状态 | 否 |
| POST | `/api/translate` | 翻译文本 | ✅ |

**限流**：每用户每分钟 10 次，超出返回 429

### 5.5 文件上传 API

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | `/api/upload/image` | 上传图片 | ✅ |
| GET | `/api/upload/image` | 上传配置 | 否 |
| POST | `/api/upload/markdown` | 上传 Markdown | ✅ |

**图片限制**：JPEG/PNG/GIF/WebP，最大 5MB，验证魔数（防 MIME 伪造）
**Markdown 限制**：.md/.mdx，最大 10MB

### 5.6 访问统计 API

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | `/api/analytics` | 记录访问 | 否 |
| GET | `/api/analytics` | 统计数据 | ✅ |

### 5.7 统一响应格式

```json
{
  "success": true,
  "data": { ... },
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

错误响应：
```json
{
  "success": false,
  "error": "错误描述"
}
```

---

## 6. 环境变量配置

### 6.1 完整列表

| 变量名 | 必需 | 说明 | 示例 |
|--------|------|------|------|
| `DATABASE_URL` | ✅ | 数据库连接 | `file:./dev.db`（开发） |
| `NEXTAUTH_SECRET` | ✅ | 加密密钥 | `openssl rand -base64 32` 生成 |
| `NEXTAUTH_URL` | ✅ | 站点 URL | `https://yourdomain.com` |
| `ADMIN_USERNAME` | ✅ | 管理员用户名 | `admin` |
| `ADMIN_PASSWORD` | ✅ | 管理员密码 | 强密码 |
| `NEXT_PUBLIC_SITE_URL` | ✅ | 公开站点 URL | `https://yourdomain.com` |
| `DEEPSEEK_API_KEY` | 可选 | Deepseek 密钥 | 从 platform.deepseek.com 获取 |
| `DEEPL_API_KEY` | 可选 | DeepL 密钥 | 从 deepl.com/pro-api 获取 |
| `BLOB_READ_WRITE_TOKEN` | 可选 | Vercel Blob 令牌 | 从 Vercel Dashboard 获取 |
| `NEXT_PUBLIC_GISCUS_REPO` | 可选 | Giscus 仓库 | `username/repo` |
| `NEXT_PUBLIC_GISCUS_REPO_ID` | 可选 | Giscus 仓库 ID | `R_xxxxxxxx` |
| `NEXT_PUBLIC_GISCUS_CATEGORY_ID` | 可选 | Giscus 分类 ID | `DIC_xxxxxxxx` |

### 6.2 翻译 API 配置

**Deepseek（推荐）**：
1. 访问 [platform.deepseek.com](https://platform.deepseek.com/)
2. 注册并创建 API Key
3. 设置 `DEEPSEEK_API_KEY`

**DeepL（备选）**：
1. 访问 [deepl.com/pro-api](https://www.deepl.com/pro-api)
2. 获取 API Key
3. 设置 `DEEPL_API_KEY`

> 两者配置其一即可，优先 Deepseek，不可用时自动降级 DeepL。

---

## 7. 部署指南

### 7.1 Vercel 一键部署

1. 推送代码到 GitHub
2. 登录 [Vercel Dashboard](https://vercel.com/)
3. 点击 "Import Project" 导入仓库
4. 配置环境变量
5. 点击 "Deploy"

### 7.2 数据库迁移

```bash
# 本地开发
npx prisma db push

# 生产环境（Vercel Postgres）
# 在 Vercel Dashboard 绑定 Postgres 后自动配置
```

### 7.3 CI/CD

`.github/workflows/deploy.yml`：
- PR → 自动 lint + build + 预览部署
- Push to main → 自动生产部署

---

## 8. 测试说明

### 8.1 运行测试

```bash
# 运行所有测试（127 个用例）
npm test

# 监听模式（开发时使用）
npm run test:watch

# 生成覆盖率报告
npm run test:coverage
```

### 8.2 测试覆盖

| 测试套件 | 用例数 | 覆盖模块 |
|----------|--------|----------|
| seo.test.ts | 10 | JSON-LD 生成 |
| i18n.test.ts | 5 | 国际化字典加载 |
| translate.test.ts | 12 | 翻译服务 + 限流 |
| analytics.test.ts | 8 | 访问统计 + IP 匿名化 |
| storage.test.ts | 8 | 文件存储 CRUD |
| components.test.tsx | 20 | HeroTerminal、ProjectCard、Timeline、SkillCloud |
| more-components.test.tsx | 18 | CommandPalette、PostList、BentoGrid |
| admin-components.test.tsx | 8 | TranslateButton、FileImportStatus |
| page-components.test.tsx | 5 | AdminLayout、PostContent |
| projects.test.ts | 10 | 项目 API CRUD |
| posts-skills.test.ts | 16 | 文章/技能 API |
| analytics-translate.test.ts | 7 | 统计/翻译/上传 API |
| **总计** | **127** | **全部通过 ✅** |

### 8.3 测试文件结构

```
__tests__/
├── lib/                    # 单元测试
│   ├── seo.test.ts
│   ├── i18n.test.ts
│   ├── translate.test.ts
│   ├── analytics.test.ts
│   └── storage.test.ts
├── components/             # 组件测试
│   ├── components.test.tsx
│   ├── more-components.test.tsx
│   ├── admin-components.test.tsx
│   └── page-components.test.tsx
└── api/                    # API 集成测试
    ├── projects.test.ts
    ├── posts-skills.test.ts
    └── analytics-translate.test.ts
```

---

## 9. 常见问题

### Q1: 首页终端动效太慢怎么办？
**A**：1.5 秒后点击右下角"跳过动画 →"，或等待 5 秒自动完成。

### Q2: 如何切换语言？
**A**：点击页面右上角 `EN`（中文下）或 `中`（英文下）。

### Q3: 忘记管理员密码？
**A**：修改 `.env` 中的 `ADMIN_USERNAME` 和 `ADMIN_PASSWORD`，重启服务。

### Q4: AI 翻译不工作？
**A**：检查：
1. `.env` 中配置了 `DEEPSEEK_API_KEY` 或 `DEEPL_API_KEY`
2. API Key 有效且有余额
3. 未触发限流（每分钟 10 次）

### Q5: 图片上传失败？
**A**：检查：
1. 格式为 JPEG/PNG/GIF/WebP（不支持 SVG）
2. 大小不超过 5MB
3. 配置了 `BLOB_READ_WRITE_TOKEN`

### Q6: 文章英文版显示"Coming Soon"？
**A**：正常行为。在管理后台编辑文章，使用 AI 翻译生成英文版本即可。

### Q7: 命令面板怎么用？
**A**：按 `Ctrl+K` 唤起，输入命令关键词，↑↓ 选择，Enter 执行，ESC 关闭。

### Q8: 如何查看访问数据？
**A**：登录管理后台 `/admin`，仪表盘显示近 7 天访问统计。

### Q9: 评论系统如何配置？
**A**：在 GitHub 仓库启用 Discussions，访问 [giscus.app](https://giscus.app/) 生成配置，填入 `.env`。

### Q10: 如何在本地测试生产环境？
**A**：
```bash
npm run build
npm start
# 访问 http://localhost:3000
```

---

## 附录：项目文件结构

```
personal-brand-website/
├── .env                              # 环境变量
├── .github/workflows/deploy.yml      # CI/CD
├── middleware.ts                      # i18n 路由中间件
├── next.config.ts                    # Next.js 配置
├── prisma/schema.prisma              # 数据库模型
├── src/
│   ├── app/
│   │   ├── [locale]/                 # 公开页面
│   │   │   ├── page.tsx              # 首页
│   │   │   ├── about/page.tsx        # 关于我
│   │   │   ├── projects/             # 项目展示
│   │   │   └── blog/                 # 博客
│   │   ├── admin/                    # 管理后台
│   │   │   ├── login/page.tsx        # 登录页
│   │   │   ├── page.tsx              # 仪表盘
│   │   │   ├── projects/             # 项目管理
│   │   │   ├── posts/                # 文章管理
│   │   │   └── upload/page.tsx       # 文件上传
│   │   └── api/                      # API 路由
│   ├── components/                   # React 组件（20 个）
│   ├── contexts/                     # ThemeContext
│   ├── dictionaries/                 # i18n 字典
│   └── lib/                          # 工具函数（7 个）
├── __tests__/                        # 测试文件（127 个用例）
├── TEST_DOCUMENT.md                  # 测试文档
├── BUG_FIX_REPORT.md                 # Bug 修复报告
├── USER_GUIDE.md                     # 本使用说明
├── ENV_SETUP.md                      # 环境变量配置指南
└── DEPLOYMENT_CHECKLIST.md           # 部署检查清单
```

---

> **文档维护**：当项目功能变化时，应及时更新本指南。
> **最后更新**：2026-06-05
