# 个人品牌网站 (Personal Brand Website)

[**🇬🇧 English Version**](./README.md)

这是一个基于 Next.js 构建的现代化、高交互性、完全动态的个人品牌与作品集网站。它拥有酷炫的 Bento Grid (便当盒) 网格布局、全局的 Command Palette (命令面板)，以及一个功能完善的管理员后台，可以动态管理您的个人资料、时间线履历、项目展示和技能标签。

## 🚀 核心特性

- **现代技术栈**: 基于最新的 [Next.js 14](https://nextjs.org/) (App Router)、TypeScript 和 Tailwind CSS 构建。
- **动态内容管理**: 配备了基于 **PostgreSQL** 和 **Prisma ORM** 的全功能管理员后台。告别硬编码！直接在网页端修改您的个人资料、履历和项目内容。
- **强交互 UI 设计**:
  - 🎨 首页采用精致极简的 **Bento Grid** 网格布局。
  - ⌨️ 全局集成 **Command Palette** (快捷键 `Ctrl+K` 或 `Cmd+K`)，支持全局搜索与快速导航。
  - 🌧️ “关于我”页面带有酷炫的 **黑客帝国代码雨 (Matrix Digital Rain)** 背景特效。
- **国际化 (i18n)**: 原生支持简体中文与英文无缝切换。
- **主题切换**: 支持无缝切换 深色 (Dark) / 浅色 (Light) 模式。
- **响应式设计**: 完美适配电脑端与手机端浏览。

## 🛠️ 技术栈说明

- **前端框架**: Next.js (App Router)
- **开发语言**: TypeScript
- **样式方案**: Tailwind CSS, Framer Motion (动画)
- **数据库**: PostgreSQL (推荐使用 Neon / Supabase / Vercel Postgres)
- **ORM**: Prisma
- **权限验证**: NextAuth.js
- **推荐部署平台**: Vercel

## 📦 本地运行指南

### 1. 克隆项目

```bash
git clone https://github.com/ITquanh/personal-brand-website.git
cd personal-brand-website
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

在项目根目录下创建一个 `.env` 文件，并填入以下变量：

```env
# 数据库连接 (您的 PostgreSQL 直连链接)
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"

# NextAuth 配置
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="用任何随机字符串替换这里，越长越好"

# 管理员账号密码 (用于登录后台)
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="admin123"
```

### 4. 数据库初始化

将 Prisma 结构推送到您的数据库，以创建所需的表：

```bash
npx prisma db push
npx prisma generate
```

### 5. 启动开发服务器

```bash
npm run dev
```

打开浏览器访问 [http://localhost:3000](http://localhost:3000) 即可查看网站。若要访问管理后台，请访问 `/admin`。

## ☁️ 线上部署

本项目已针对 **Vercel** 部署进行了深度优化。
1. 将本地代码 Push 到您的 GitHub 仓库。
2. 在 Vercel 后台导入该 GitHub 项目。
3. 在 Vercel 的 Environment Variables (环境变量) 设置中添加您的 `DATABASE_URL` 和 `NEXTAUTH_SECRET`。
4. 点击 Deploy 一键部署！

## 📄 开源协议

本项目采用 MIT License 开源协议。
