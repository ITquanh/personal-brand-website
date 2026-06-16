# AI 内容发布 API（Ingest API）

> **接口前缀**：`/api/ingest`
> **认证方式**：Bearer Token（API Key）
> **默认 API Key**：`pbk-ingest-dev-key-change-in-production`
> **最后更新**：2026-06-06

---

## 概述

这是一套专为 AI 工具（如 Claude Code、Cursor 等）设计的内容发布接口。AI 可以直接通过 curl 或 fetch 调用这些接口，将文章、项目、技能等内容发布到个人网站。

### 认证方式

所有接口都需要在请求头中携带 API Key：

```
Authorization: Bearer YOUR_API_KEY
```

### 统一响应格式

**成功：**
```json
{
  "success": true,
  "message": "操作描述",
  "data": { ... }
}
```

**失败：**
```json
{
  "success": false,
  "error": "错误描述"
}
```

---

## 1. 文章接口（Article）

### 1.1 发布文章

**POST** `/api/ingest/article`

```bash
curl -X POST http://localhost:3000/api/ingest/article \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "titleZh": "AI 结对编程完全指南",
    "contentZh": "# AI 结对编程\n\n## 什么是 AI 结对编程\n\n正文内容...",
    "summaryZh": "深入探讨如何使用 AI 进行高效编程",
    "tags": ["AI", "编程", "效率"],
    "published": true
  }'
```

**必填字段：**

| 字段 | 类型 | 说明 |
|------|------|------|
| `titleZh` | string | 中文标题 |
| `contentZh` | string | 中文内容（Markdown 格式） |

**可选字段：**

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `titleEn` | string | null | 英文标题 |
| `contentEn` | string | null | 英文内容 |
| `summaryZh` | string | null | 中文摘要 |
| `summaryEn` | string | null | 英文摘要 |
| `tags` | string[] | [] | 标签数组 |
| `imageUrl` | string | null | 封面图 URL |
| `slug` | string | 自动生成 | URL 标识符 |
| `published` | boolean | false | 是否发布 |
| `translationStatus` | string | "untranslated" | 翻译状态 |
| `action` | string | "create" | "create" 或 "update" |

**响应示例：**
```json
{
  "success": true,
  "message": "文章已创建: ai-pair-programming",
  "data": {
    "id": "5385b1b2-...",
    "slug": "ai-pair-programming",
    "title": "AI 结对编程完全指南",
    "url": "/zh/blog/ai-pair-programming",
    "published": true,
    "readTime": 3
  }
}
```

**Slug 生成规则：**
- 中文标题：自动生成 `post-{timestamp}-{random}` 格式
- 英文标题：自动转小写、替换特殊字符、用连字符连接
- 可通过 `slug` 字段自定义

**更新文章：**
```bash
curl -X POST http://localhost:3000/api/ingest/article \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "slug": "ai-pair-programming",
    "action": "update",
    "titleEn": "Complete Guide to AI Pair Programming",
    "contentEn": "# AI Pair Programming\n\nContent...",
    "translationStatus": "translated"
  }'
```

### 1.2 查询文章

**GET** `/api/ingest/article`

```bash
# 查询所有文章
curl http://localhost:3000/api/ingest/article \
  -H "Authorization: Bearer YOUR_API_KEY"

# 按 slug 查询
curl "http://localhost:3000/api/ingest/article?slug=ai-pair-programming" \
  -H "Authorization: Bearer YOUR_API_KEY"

# 按标签筛选
curl "http://localhost:3000/api/ingest/article?tag=AI&limit=5" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

**查询参数：**

| 参数 | 说明 |
|------|------|
| `slug` | 按 slug 查询单篇文章 |
| `tag` | 按标签筛选 |
| `limit` | 返回数量上限（默认 20，最大 100） |

### 1.3 删除文章

**DELETE** `/api/ingest/article`

```bash
curl -X DELETE "http://localhost:3000/api/ingest/article?slug=ai-pair-programming" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

---

## 2. 项目接口（Project）

### 2.1 发布项目

**POST** `/api/ingest/project`

```bash
curl -X POST http://localhost:3000/api/ingest/project \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "titleZh": "StarMind 思维管理工具",
    "summaryZh": "AI驱动的思维导图与知识管理工具",
    "techStack": ["Next.js", "TypeScript", "OpenAI API"],
    "architectureZh": "## 架构设计\n\n基于 Next.js App Router 的全栈应用...",
    "quantifiedImpact": "提升知识整理效率 60%",
    "githubUrl": "https://github.com/example/starmind",
    "demoUrl": "https://starmind.vercel.app",
    "isFeatured": true
  }'
```

**必填字段：**

| 字段 | 类型 | 说明 |
|------|------|------|
| `titleZh` | string | 中文标题 |
| `summaryZh` | string | 中文摘要 |

**可选字段：**

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `titleEn` | string | null | 英文标题 |
| `summaryEn` | string | null | 英文摘要 |
| `techStack` | string[] | [] | 技术栈数组 |
| `architectureZh` | string | null | 架构说明（Markdown） |
| `architectureEn` | string | null | 英文架构说明 |
| `quantifiedImpact` | string | null | 量化指标 |
| `githubUrl` | string | null | GitHub 仓库地址 |
| `demoUrl` | string | null | 在线演示地址 |
| `imageUrl` | string | null | 封面图 URL |
| `slug` | string | 自动生成 | URL 标识符 |
| `isFeatured` | boolean | false | 是否精选（首页展示） |
| `translationStatus` | string | "untranslated" | 翻译状态 |
| `action` | string | "create" | "create" 或 "update" |

### 2.2 查询项目

**GET** `/api/ingest/project`

```bash
# 查询所有项目
curl http://localhost:3000/api/ingest/project \
  -H "Authorization: Bearer YOUR_API_KEY"

# 只查精选项目
curl "http://localhost:3000/api/ingest/project?featured=true" \
  -H "Authorization: Bearer YOUR_API_KEY"

# 按 slug 查询
curl "http://localhost:3000/api/ingest/project?slug=starmind" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### 2.3 删除项目

**DELETE** `/api/ingest/project`

```bash
curl -X DELETE "http://localhost:3000/api/ingest/project?slug=starmind" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

---

## 3. 技能接口（Skill）

### 3.1 添加技能

**POST** `/api/ingest/skill`

```bash
curl -X POST http://localhost:3000/api/ingest/skill \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Python",
    "category": "后端",
    "proficiency": 90,
    "description": "主要开发语言"
  }'
```

**必填字段：**

| 字段 | 类型 | 说明 |
|------|------|------|
| `name` | string | 技能名称（唯一） |
| `category` | string | 分类（AI工具/后端/前端/基础设施/数据库） |
| `proficiency` | number | 熟练度（1-100） |

**可选字段：**

| 字段 | 类型 | 说明 |
|------|------|------|
| `description` | string | 技能描述 |
| `projects` | string[] | 相关项目 slug |

> 相同名称的技能会自动更新而非重复创建。

### 3.2 查询技能

**GET** `/api/ingest/skill`

```bash
# 查询所有技能
curl http://localhost:3000/api/ingest/skill \
  -H "Authorization: Bearer YOUR_API_KEY"

# 按分类筛选
curl "http://localhost:3000/api/ingest/skill?category=AI工具" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

---

## 4. 状态查询接口

**GET** `/api/ingest/status`

```bash
curl http://localhost:3000/api/ingest/status \
  -H "Authorization: Bearer YOUR_API_KEY"
```

**响应示例：**
```json
{
  "success": true,
  "data": {
    "articles": {
      "total": 5,
      "published": 3,
      "draft": 2,
      "translated": 2,
      "untranslated": 3
    },
    "projects": {
      "total": 10,
      "featured": 3,
      "translated": 5,
      "untranslated": 5
    },
    "skills": {
      "total": 15,
      "categories": ["AI工具", "后端", "前端", "基础设施"],
      "byCategory": { "AI工具": 3, "后端": 5, "前端": 4, "基础设施": 3 }
    },
    "recentArticles": [...],
    "recentProjects": [...],
    "siteUrl": "https://yourdomain.com"
  }
}
```

---

## 5. AI 使用示例

### Claude Code 使用方式

在 Claude Code 中，AI 可以直接执行 shell 命令发布内容：

```
用户：帮我把这篇文章发布到我的网站上

AI 执行：
curl -X POST http://localhost:3000/api/ingest/article \
  -H "Authorization: Bearer pbk-ingest-dev-key-change-in-production" \
  -H "Content-Type: application/json" \
  -d '{"titleZh":"文章标题","contentZh":"文章内容","tags":["标签"],"published":true}'
```

### 批量导入示例

```bash
# 批量发布多篇文章
for file in articles/*.md; do
  title=$(head -1 "$file" | sed 's/^# //')
  content=$(cat "$file")
  curl -X POST http://localhost:3000/api/ingest/article \
    -H "Authorization: Bearer YOUR_API_KEY" \
    -H "Content-Type: application/json" \
    -d "{\"titleZh\":\"$title\",\"contentZh\":\"$(echo "$content" | jq -Rs .)\",\"published\":true}"
done
```

### 更新已有内容

```bash
# 为已有文章添加英文翻译
curl -X POST http://localhost:3000/api/ingest/article \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "slug": "ai-pair-programming",
    "action": "update",
    "titleEn": "Complete Guide to AI Pair Programming",
    "contentEn": "# AI Pair Programming\n\nFull English content here...",
    "translationStatus": "translated"
  }'
```

---

## 6. 环境变量配置

在 `.env` 文件中配置：

```env
# AI 内容发布 API Key
INGEST_API_KEY="your-secure-api-key-here"
```

> ⚠️ **安全提醒**：
> - 生产环境务必使用强随机 API Key
> - 不要将 API Key 提交到 Git 仓库
> - 建议定期轮换 API Key

---

## 7. 错误码说明

| HTTP 状态码 | 说明 |
|-------------|------|
| 200 | 操作成功 |
| 201 | 创建成功 |
| 400 | 请求参数错误（缺少必填字段、格式错误） |
| 401 | API Key 无效或缺失 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |
