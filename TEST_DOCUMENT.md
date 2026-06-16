# 个人技术品牌网站 — 完整测试文档（最终版）

> **项目名称**：personal-brand-website
> **版本**：v0.3.0
> **最后更新**：2026-06-06
> **技术栈**：Next.js 16 + React 19 + TypeScript 5 + Prisma 7.8 + Tailwind CSS 4

---

## 目录

1. [测试策略概述](#1-测试策略概述)
2. [测试环境搭建](#2-测试环境搭建)
3. [单元测试（lib/ 工具层）](#3-单元测试lib-工具层)
4. [组件测试](#4-组件测试)
5. [API 集成测试](#5-api-集成测试)
6. [Ingest API 测试（AI 内容发布）](#6-ingest-api-测试)
7. [Admin API 测试（后台管理）](#7-admin-api-测试)
8. [E2E 端到端测试](#8-e2e-端到端测试)
9. [非功能测试](#9-非功能测试)
10. [测试数据 Fixtures](#10-测试数据-fixtures)
11. [测试执行与报告](#11-测试执行与报告)

---

## 1. 测试策略概述

### 1.1 测试金字塔

```
         /  E2E  \          ← Playwright
        /----------\
       / API 集成测试 \       ← 所有 API 路由
      /----------------\
     /   组件测试         \    ← React 组件
    /----------------------\
   /     单元测试             \  ← lib/ 工具函数
  /----------------------------\
```

### 1.2 测试工具链

| 层级 | 工具 | 版本 | 用途 |
|------|------|------|------|
| 单元测试 | Jest | 30.4.2 | 测试 lib/ 下的纯函数 |
| 组件测试 | React Testing Library | 16.3.2 | 测试 React 组件 |
| 类型支持 | ts-jest | 29.4.11 | TypeScript 转换 |
| DOM 环境 | jest-environment-jsdom | 30.4.1 | 模拟浏览器 DOM |

### 1.3 覆盖率目标

| 维度 | 当前 | 目标 |
|------|------|------|
| 语句覆盖率 | 45.7% | ≥ 80% |
| 函数覆盖率 | 42.4% | ≥ 85% |
| lib/ 工具层 | 79.2% | ≥ 90% |

---

## 2. 测试环境搭建

### 2.1 安装命令

```bash
npm install --save-dev jest @jest/globals ts-jest jest-environment-jsdom \
  @testing-library/react @testing-library/jest-dom @testing-library/user-event \
  @types/jest node-mocks-http
```

### 2.2 测试脚本

```bash
npm test              # 运行所有测试
npm run test:watch    # 监听模式
npm run test:coverage # 覆盖率报告
```

### 2.3 Mock 策略

| 依赖 | Mock 方式 |
|------|----------|
| Prisma Client | `jest.mock('@/lib/prisma')` |
| NextAuth | `jest.mock('@/lib/auth')` |
| Vercel Blob | `jest.mock('@/lib/storage')` |
| Next.js Router | `jest.mock('next/navigation')` |
| fetch | `global.fetch = jest.fn()` |
| framer-motion | 替换为原生 HTML 元素 |
| react-markdown | 替换为 `<div>{children}</div>` |

---

## 3. 单元测试（lib/ 工具层）

### 3.1 `seo.ts` — JSON-LD 生成

| 编号 | 测试用例 | 优先级 |
|------|---------|--------|
| UT-SEO-01 | WebSite JSON-LD 包含 @context、@type、name、url | P0 |
| UT-SEO-02 | Person JSON-LD 包含 jobTitle、sameAs | P1 |
| UT-SEO-03 | Article JSON-LD 包含 headline、datePublished | P1 |
| UT-SEO-04 | Project JSON-LD 包含 SoftwareApplication 类型 | P2 |
| UT-SEO-05 | locale 语言映射 zh→zh-CN、en→en-US | P1 |
| UT-SEO-06 | WebSite JSON-LD 包含 SearchAction | P1 |
| UT-SEO-07 | Article JSON-LD 支持 modifiedTime | P1 |
| UT-SEO-08 | Article JSON-LD 支持 image | P2 |
| UT-SEO-09 | Person JSON-LD 包含 GitHub 和 LinkedIn | P1 |
| UT-SEO-10 | Project JSON-LD 支持可选 url 和 image | P2 |

### 3.2 `i18n.ts` — 国际化

| 编号 | 测试用例 | 优先级 |
|------|---------|--------|
| UT-I18N-01 | 中文字典加载成功 | P0 |
| UT-I18N-02 | 英文字典加载成功 | P0 |
| UT-I18N-03 | 默认 locale 为 zh | P1 |
| UT-I18N-04 | 支持的 locale 列表包含 zh 和 en | P1 |
| UT-I18N-05 | 无效 locale 回退到中文 | P2 |
| UT-I18N-06 | 中英文字典键结构一致 | P1 |

### 3.3 `translate.ts` — AI 翻译

| 编号 | 测试用例 | 优先级 |
|------|---------|--------|
| UT-TR-01 | Deepseek API 翻译成功 | P0 |
| UT-TR-02 | DeepL 回退翻译成功 | P1 |
| UT-TR-03 | 批量翻译成功 | P1 |
| UT-TR-04 | 限流 10 次/分钟内正常 | P0 |
| UT-TR-05 | 超过限流返回错误 | P0 |
| UT-TR-06 | 无 userId 仍限流（anonymous key） | P0 |
| UT-TR-07 | 无 API 密钥返回错误 | P1 |
| UT-TR-08 | API 调用失败返回错误 | P1 |
| UT-TR-09 | 限流内存清理（超 1000 条目） | P1 |
| UT-TR-10 | Deepseek 网络异常返回错误 | P1 |
| UT-TR-11 | DeepL API 失败返回错误 | P1 |
| UT-TR-12 | 批量翻译失败时停止后续 | P1 |

### 3.4 `analytics.ts` — 访问统计

| 编号 | 测试用例 | 优先级 |
|------|---------|--------|
| UT-AN-01 | recordVisit 创建记录 | P0 |
| UT-AN-02 | IPv4 匿名化（最后位归零） | P0 |
| UT-AN-03 | IPv6 匿名化（截断前 4 组） | P1 |
| UT-AN-04 | 无 IP 时设为 undefined | P1 |
| UT-AN-05 | 数据库错误不抛异常 | P1 |
| UT-AN-06 | getAnalyticsStats 返回完整结构 | P0 |
| UT-AN-07 | dailyVisits 使用 $queryRaw 按日期分组 | P0 |
| UT-AN-08 | getTodayVisits 返回当天数量 | P1 |
| UT-AN-09 | getPageViews 按路径返回数量 | P1 |

### 3.5 `storage.ts` — 文件存储

| 编号 | 测试用例 | 优先级 |
|------|---------|--------|
| UT-STO-01 | uploadFile 返回 URL | P0 |
| UT-STO-02 | deleteFile 调用 del | P1 |
| UT-STO-03 | listFiles 返回列表 | P1 |
| UT-STO-04 | uploadImage 生成唯一文件名 | P1 |
| UT-STO-05 | uploadMarkdown 生成时间戳文件名 | P1 |
| UT-STO-06 | 上传失败抛出错误 | P1 |

---

## 4. 组件测试

### 4.1 HeroTerminal

| 编号 | 测试用例 | 优先级 |
|------|---------|--------|
| CT-HERO-01 | 渲染 terminal 标题 | P0 |
| CT-HERO-02 | 5 秒后自动完成 | P0 |
| CT-HERO-03 | 点击跳过立即完成 | P0 |
| CT-HERO-04 | skipable=false 不显示跳过按钮 | P1 |
| CT-HERO-05 | 跳过按钮 1.5 秒后出现 | P1 |

### 4.2 BentoGrid

| 编号 | 测试用例 | 优先级 |
|------|---------|--------|
| CT-BENTO-01 | 渲染个人简介/技术栈/项目/文章卡片 | P0 |
| CT-BENTO-02 | 显示精选项目 | P0 |
| CT-BENTO-03 | 显示最新文章 | P1 |
| CT-BENTO-04 | 显示 Ctrl+K 命令面板提示 | P2 |
| CT-BENTO-05 | 空数据显示占位内容 | P1 |

### 4.3 ProjectCard

| 编号 | 测试用例 | 优先级 |
|------|---------|--------|
| CT-PCARD-01 | 渲染标题、摘要 | P0 |
| CT-PCARD-02 | 显示技术栈标签 | P1 |
| CT-PCARD-03 | 显示量化指标 | P1 |
| CT-PCARD-04 | 精选显示徽章 | P1 |
| CT-PCARD-05 | 点击跳转详情页 | P0 |
| CT-PCARD-06 | 无图片显示默认图标 | P2 |

### 4.4 Timeline

| 编号 | 测试用例 | 优先级 |
|------|---------|--------|
| CT-TIME-01 | 渲染所有事件节点 | P0 |
| CT-TIME-02 | 显示事件类型标签 | P1 |
| CT-TIME-03 | 正确显示日期 | P1 |
| CT-TIME-04 | 显示公司名称 | P1 |
| CT-TIME-05 | 无障碍 ARIA 属性 | P1 |

### 4.5 SkillCloud

| 编号 | 测试用例 | 优先级 |
|------|---------|--------|
| CT-SKILL-01 | 标签云模式渲染技能标签 | P0 |
| CT-SKILL-02 | 雷达图模式渲染 SVG | P0 |
| CT-SKILL-03 | 雷达图显示分类名称 | P1 |

### 4.6 CommandPalette

| 编号 | 测试用例 | 优先级 |
|------|---------|--------|
| CT-CMD-01 | isOpen=true 渲染输入框 | P0 |
| CT-CMD-02 | 显示所有 9 个命令 | P0 |
| CT-CMD-03 | 模糊搜索过滤命令 | P1 |
| CT-CMD-04 | ESC 关闭面板 | P0 |
| CT-CMD-05 | 上下箭头移动选中项 | P1 |
| CT-CMD-06 | isOpen=false 不渲染 | P1 |

### 4.7 PostList

| 编号 | 测试用例 | 优先级 |
|------|---------|--------|
| CT-PLIST-01 | 渲染文章列表 | P0 |
| CT-PLIST-02 | 显示阅读时间 | P1 |
| CT-PLIST-03 | 显示标签 | P1 |
| CT-PLIST-04 | 空列表显示提示 | P1 |
| CT-PLIST-05 | 未翻译显示状态标识 | P1 |

### 4.8 ThemeToggle

| 编号 | 测试用例 | 优先级 |
|------|---------|--------|
| CT-TOGGLE-01 | 无障碍 sr-only 标签 | P1 |

### 4.9 Admin 组件

| 编号 | 测试用例 | 优先级 |
|------|---------|--------|
| CT-ADMIN-01 | 侧边栏导航渲染 | P0 |
| CT-ADMIN-02 | 用户信息显示 | P1 |
| CT-ADMIN-03 | 登出按钮存在 | P0 |
| CT-ADMIN-04 | 子内容渲染 | P0 |
| CT-TRBTN-01 | 翻译按钮渲染 | P1 |
| CT-TRBTN-02 | 空内容可点击 | P1 |
| CT-FSTATUS-01 | pending 状态显示文件名 | P1 |
| CT-FSTATUS-02 | error 状态显示错误 | P1 |
| CT-MDUP-01 | 上传区域渲染 | P1 |
| CT-PDETAIL-01 | ProjectDetail 模块可导入 | P1 |
| CT-POSTCONTENT-01 | PostContent 模块可导入 | P1 |
| CT-PWALL-01 | ProjectWall 模块可导入 | P1 |

---

## 5. API 集成测试

### 5.1 `/api/projects`

| 编号 | 方法 | 测试用例 | 优先级 |
|------|------|---------|--------|
| API-PROJ-01 | GET | 返回分页项目列表 | P0 |
| API-PROJ-02 | GET | 分页参数正确传递 | P0 |
| API-PROJ-03 | GET | 分页上限 100 | P0 |
| API-PROJ-04 | GET | featured 筛选 | P1 |
| API-PROJ-05 | GET | locale 切换 | P1 |
| API-PROJ-06 | POST | 管理员创建成功 | P0 |
| API-PROJ-07 | POST | 未认证返回 401 | P0 |
| API-PROJ-08 | POST | 缺少字段返回 400 | P0 |
| API-PROJ-09 | POST | 重复 slug 返回 400 | P1 |
| API-PROJ-10 | GET | 按 slug 获取详情 | P0 |
| API-PROJ-11 | GET | 不存在返回 404 | P1 |
| API-PROJ-12 | DELETE | 管理员删除成功 | P0 |
| API-PROJ-13 | DELETE | 不存在返回 404 | P1 |
| API-PROJ-14 | PUT | 未认证返回 401 | P0 |

### 5.2 `/api/posts`

| 编号 | 方法 | 测试用例 | 优先级 |
|------|------|---------|--------|
| API-POST-01 | GET | 文章列表 | P0 |
| API-POST-02 | GET | 标签筛选 | P1 |
| API-POST-03 | GET | 默认只返回已发布 | P0 |
| API-POST-04 | GET | 草稿需认证 | P0 |
| API-POST-05 | POST | 创建成功 | P0 |
| API-POST-06 | POST | 未认证返回 401 | P0 |
| API-POST-07 | POST | 缺少字段返回 400 | P0 |
| API-POST-08 | GET | viewCount 自增 | P0 |
| API-POST-09 | GET | 不存在返回 404 | P1 |
| API-POST-10 | POST | readTime 计算正确 | P1 |
| API-POST-11 | DELETE | 管理员删除成功 | P0 |

### 5.3 `/api/skills`

| 编号 | 方法 | 测试用例 | 优先级 |
|------|------|---------|--------|
| API-SKILL-01 | GET | 技能列表 | P0 |
| API-SKILL-02 | GET | 分类筛选 | P1 |
| API-SKILL-03 | POST | 创建成功 | P0 |
| API-SKILL-04 | POST | 熟练度验证 1-100 | P1 |
| API-SKILL-05 | POST | 类型验证 | P1 |
| API-SKILL-06 | POST | 长度限制 | P1 |
| API-SKILL-07 | POST | 数组验证 | P1 |
| API-SKILL-08 | POST | 重复名称拒绝 | P1 |
| API-SKILL-09 | POST | 未认证返回 401 | P0 |

### 5.4 `/api/translate`

| 编号 | 方法 | 测试用例 | 优先级 |
|------|------|---------|--------|
| API-TR-01 | GET | 服务状态查询 | P1 |
| API-TR-02 | POST | 未认证返回 401 | P0 |
| API-TR-03 | POST | 缺少字段返回 400 | P1 |
| API-TR-04 | POST | 限流返回 429 | P0 |

### 5.5 `/api/analytics`

| 编号 | 方法 | 测试用例 | 优先级 |
|------|------|---------|--------|
| API-AN-01 | POST | 记录访问 | P0 |
| API-AN-02 | GET | 管理员查询统计 | P0 |
| API-AN-03 | GET | 未认证返回 401 | P0 |

### 5.6 `/api/upload`

| 编号 | 方法 | 测试用例 | 优先级 |
|------|------|---------|------|
| API-UIMG-01 | GET | 上传配置查询 | P1 |
| API-UMD-01 | POST | Front Matter 解析 | P0 |

---

## 6. Ingest API 测试（AI 内容发布）

### 6.1 `/api/ingest/article`

| 编号 | 方法 | 测试用例 | 优先级 |
|------|------|---------|--------|
| ING-ART-01 | POST | 发布文章成功 | P0 |
| ING-ART-02 | POST | 自动生成 slug | P1 |
| ING-ART-03 | POST | 自动计算阅读时间 | P1 |
| ING-ART-04 | POST | 幂等更新（相同 slug） | P1 |
| ING-ART-05 | POST | 缺少 titleZh 返回 400 | P0 |
| ING-ART-06 | POST | 缺少 contentZh 返回 400 | P0 |
| ING-ART-07 | GET | 查询文章列表 | P0 |
| ING-ART-08 | GET | 按 slug 查询 | P1 |
| ING-ART-09 | GET | 按 tag 筛选 | P1 |
| ING-ART-10 | DELETE | 删除文章 | P0 |

### 6.2 `/api/ingest/project`

| 编号 | 方法 | 测试用例 | 优先级 |
|------|------|---------|--------|
| ING-PROJ-01 | POST | 发布项目成功 | P0 |
| ING-PROJ-02 | POST | 自动生成 slug | P1 |
| ING-PROJ-03 | POST | 幂等更新 | P1 |
| ING-PROJ-04 | POST | 缺少必填字段返回 400 | P0 |
| ING-PROJ-05 | GET | 查询项目列表 | P0 |
| ING-PROJ-06 | GET | 按 slug 查询 | P1 |
| ING-PROJ-07 | GET | featured 筛选 | P1 |
| ING-PROJ-08 | DELETE | 删除项目 | P0 |

### 6.3 `/api/ingest/skill`

| 编号 | 方法 | 测试用例 | 优先级 |
|------|------|---------|--------|
| ING-SKILL-01 | POST | 添加技能成功 | P0 |
| ING-SKILL-02 | POST | 幂等更新（同名） | P1 |
| ING-SKILL-03 | POST | 熟练度验证 | P1 |
| ING-SKILL-04 | GET | 查询技能列表 | P0 |
| ING-SKILL-05 | GET | 按分类筛选 | P1 |

### 6.4 `/api/ingest/github`

| 编号 | 方法 | 测试用例 | 优先级 |
|------|------|---------|--------|
| ING-GH-01 | POST | 导入仓库成功 | P0 |
| ING-GH-02 | POST | 自动获取 README | P1 |
| ING-GH-03 | POST | 自动获取编程语言 | P1 |
| ING-GH-04 | POST | 自动获取 star/fork 数 | P1 |
| ING-GH-05 | POST | 自动生成项目摘要 | P1 |
| ING-GH-06 | POST | 同步创建技能记录 | P2 |
| ING-GH-07 | POST | 无效 URL 返回 400 | P0 |
| ING-GH-08 | POST | 不存在的仓库返回 404 | P1 |

### 6.5 `/api/ingest/status`

| 编号 | 方法 | 测试用例 | 优先级 |
|------|------|---------|--------|
| ING-STAT-01 | GET | 返回文章统计 | P0 |
| ING-STAT-02 | GET | 返回项目统计 | P0 |
| ING-STAT-03 | GET | 返回技能统计 | P0 |
| ING-STAT-04 | GET | 返回最近文章/项目 | P1 |

### 6.6 `/api/ingest/config`

| 编号 | 方法 | 测试用例 | 优先级 |
|------|------|---------|--------|
| ING-CONF-01 | GET | 查询当前配置 | P0 |
| ING-CONF-02 | POST | 更新个人信息 | P0 |
| ING-CONF-03 | POST | 自动翻译（API 配置时） | P1 |
| ING-CONF-04 | POST | 翻译降级（API 未配置） | P1 |

### 6.7 Ingest API 认证

| 编号 | 测试用例 | 优先级 |
|------|---------|--------|
| ING-AUTH-01 | 无 API Key 返回 401 | P0 |
| ING-AUTH-02 | 有效 API Key 返回 200 | P0 |
| ING-AUTH-03 | 无效 API Key 返回 401 | P0 |

---

## 7. Admin API 测试（后台管理）

### 7.1 `/api/admin/profile`

| 编号 | 方法 | 测试用例 | 优先级 |
|------|------|---------|--------|
| ADM-PROF-01 | GET | 读取个人信息配置 | P0 |
| ADM-PROF-02 | POST | 保存个人信息 | P0 |
| ADM-PROF-03 | POST | 未认证返回 401 | P0 |

### 7.2 `/api/admin/timeline`

| 编号 | 方法 | 测试用例 | 优先级 |
|------|------|---------|--------|
| ADM-TIME-01 | GET | 读取时间轴数据 | P0 |
| ADM-TIME-02 | POST | 保存时间轴数据 | P0 |
| ADM-TIME-03 | POST | 未认证返回 401 | P0 |

### 7.3 `/api/admin/env`

| 编号 | 方法 | 测试用例 | 优先级 |
|------|------|---------|--------|
| ADM-ENV-01 | GET | 读取环境变量配置 | P0 |
| ADM-ENV-02 | POST | 保存环境变量 | P0 |
| ADM-ENV-03 | POST | 未认证返回 401 | P0 |

---

## 8. E2E 端到端测试

### 8.1 首页

| 编号 | 测试用例 | 优先级 |
|------|---------|--------|
| E2E-HOME-01 | 加载终端动效 | P0 |
| E2E-HOME-02 | 动效完成后展示 Bento Grid | P0 |
| E2E-HOME-03 | 跳过动效 | P1 |
| E2E-HOME-04 | Ctrl+K 打开命令面板 | P1 |

### 8.2 多语言

| 编号 | 测试用例 | 优先级 |
|------|---------|--------|
| E2E-I18N-01 | 中文路由 /zh 正常 | P0 |
| E2E-I18N-02 | 英文路由 /en 正常 | P0 |
| E2E-I18N-03 | 语言切换同步 | P0 |
| E2E-I18N-04 | /about 页面个人信息双语切换 | P0 |

### 8.3 管理后台

| 编号 | 测试用例 | 优先级 |
|------|---------|--------|
| E2E-ADMIN-01 | 登录页可访问 | P0 |
| E2E-ADMIN-02 | 侧边栏显示所有导航项 | P0 |
| E2E-ADMIN-03 | 个人信息编辑页 | P0 |
| E2E-ADMIN-04 | 时间轴编辑页 | P0 |
| E2E-ADMIN-05 | API 配置页 | P0 |
| E2E-ADMIN-06 | 技术栈管理页 | P0 |

---

## 9. 非功能测试

### 9.1 性能

| 编号 | 测试用例 | 指标 |
|------|---------|------|
| PERF-01 | 首屏加载（4G） | LCP < 2.0s |
| PERF-02 | 交互响应 | FID < 100ms |
| PERF-03 | 布局偏移 | CLS < 0.1 |

### 9.2 安全

| 编号 | 测试用例 | 优先级 |
|------|---------|--------|
| SEC-01 | X-Content-Type-Options: nosniff | P0 |
| SEC-02 | X-Frame-Options: DENY | P0 |
| SEC-03 | SVG 上传已禁用 | P0 |
| SEC-04 | 图片魔数验证 | P0 |
| SEC-05 | rehype-raw 已移除（防 XSS） | P0 |
| SEC-06 | JSON-LD XSS 转义 | P0 |
| SEC-07 | 常量时间密码比较 | P0 |
| SEC-08 | 分页上限 100 | P0 |
| SEC-09 | 草稿文章需认证 | P0 |
| SEC-10 | NEXTAUTH_SECRET 生产检查 | P0 |

### 9.3 SEO

| 编号 | 测试用例 | 优先级 |
|------|---------|--------|
| SEO-01 | sitemap.xml 存在 | P0 |
| SEO-02 | robots.txt 存在 | P0 |
| SEO-03 | robots.txt 禁止 /admin/ /api/ | P1 |

---

## 10. 测试数据 Fixtures

### 文章

```typescript
export const mockPosts = [
  { id: '1', slug: 'ai-guide', titleZh: 'AI 编程指南', titleEn: 'AI Programming Guide',
    contentZh: '# AI 编程\n\n正文...', contentEn: '# AI Programming\n\nContent...',
    summaryZh: '深入探讨', summaryEn: 'Deep dive', tags: ['AI', '编程'],
    published: true, readTime: 8, viewCount: 100, translationStatus: 'translated',
    createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-15T00:00:00Z' },
  { id: '2', slug: 'docker-guide', titleZh: 'Docker 实战', titleEn: null,
    contentZh: '# Docker\n\n内容...', contentEn: null,
    summaryZh: 'Docker 教程', summaryEn: null, tags: ['Docker'],
    published: true, readTime: 12, viewCount: 50, translationStatus: 'untranslated',
    createdAt: '2026-04-01T00:00:00Z', updatedAt: '2026-04-01T00:00:00Z' },
];
```

### 项目

```typescript
export const mockProjects = [
  { id: '1', slug: 'starmind', titleZh: 'StarMind', titleEn: 'StarMind',
    summaryZh: 'AI 思维工具', summaryEn: 'AI mind tool',
    techStack: ['Next.js', 'TypeScript'], isFeatured: true,
    quantifiedImpact: '提升效率 60%', translationStatus: 'translated',
    createdAt: new Date('2026-01-01'), updatedAt: new Date('2026-01-15') },
];
```

### 技能

```typescript
export const mockSkills = [
  { id: '1', name: 'Python', category: '后端', proficiency: 90, projects: ['auto-report'] },
  { id: '2', name: 'Next.js', category: '前端', proficiency: 85, projects: ['starmind'] },
  { id: '3', name: 'Docker', category: '基础设施', proficiency: 75, projects: [] },
];
```

---

## 11. 测试执行与报告

### 11.1 执行命令

```bash
npm test                  # 运行所有测试
npm run test:coverage     # 覆盖率报告
npm test -- translate.test.ts   # 运行指定文件
npm test -- -t "UT-TR-05"       # 运行指定用例
```

### 11.2 测试文件结构

```
__tests__/
├── lib/
│   ├── seo.test.ts          (10 用例)
│   ├── i18n.test.ts          (6 用例)
│   ├── translate.test.ts     (12 用例)
│   ├── analytics.test.ts     (9 用例)
│   └── storage.test.ts       (8 用例)
├── components/
│   ├── components.test.tsx   (20 用例)
│   ├── more-components.test.tsx (18 用例)
│   ├── admin-components.test.tsx (9 用例)
│   └── page-components.test.tsx  (5 用例)
└── api/
    ├── projects.test.ts       (14 用例)
    ├── posts-skills.test.ts   (16 用例)
    └── analytics-translate.test.ts (10 用例)
```

### 11.3 当前测试结果

```
Test Suites: 12 passed, 12 total
Tests:       127 passed, 127 total
Time:        ~1.8s
```

### 11.4 项目文件结构

```
personal-brand-website/
├── src/
│   ├── app/
│   │   ├── [locale]/                 # 公开页面（6 个）
│   │   ├── admin/                    # 管理后台（9 个页面）
│   │   │   ├── api-config/page.tsx   # API 配置页面
│   │   │   ├── profile/page.tsx      # 个人信息编辑
│   │   │   ├── timeline/page.tsx     # 时间轴编辑
│   │   │   ├── skills/page.tsx       # 技术栈管理
│   │   │   └── ...
│   │   └── api/
│   │       ├── projects/             # 项目 CRUD
│   │       ├── posts/                # 文章 CRUD
│   │       ├── skills/               # 技能 CRUD
│   │       ├── translate/            # AI 翻译
│   │       ├── upload/               # 文件上传
│   │       ├── analytics/            # 访问统计
│   │       ├── admin/                # 后台管理 API
│   │       │   ├── profile/route.ts  # 个人信息
│   │       │   ├── timeline/route.ts # 时间轴
│   │       │   └── env/route.ts      # 环境变量
│   │       └── ingest/               # AI 内容发布 API
│   │           ├── article/route.ts  # 文章发布
│   │           ├── project/route.ts  # 项目发布
│   │           ├── skill/route.ts    # 技能添加
│   │           ├── github/route.ts   # GitHub 仓库导入
│   │           ├── config/route.ts   # 配置管理
│   │           ├── status/route.ts   # 状态查询
│   │           └── utils.ts          # 共用工具
│   ├── components/                   # React 组件（20 个）
│   ├── config/
│   │   └── site.ts                   # 集中配置文件
│   ├── contexts/                     # ThemeContext
│   ├── dictionaries/                 # i18n 字典
│   └── lib/                          # 工具函数（7 个）
├── __tests__/                        # 测试文件（127 用例）
├── TEST_DOCUMENT.md                  # 本文档
├── BUG_FIX_REPORT.md                 # Bug 修复报告
├── USER_GUIDE.md                     # 功能使用说明
├── INGEST_API.md                     # Ingest API 文档
└── ENV_SETUP.md                      # 环境变量配置指南
```

---

> **最后更新**：2026-06-06
> **测试命令**：`npm test`
> **覆盖率命令**：`npm run test:coverage`
