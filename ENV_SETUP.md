# 环境变量配置指南

本文档说明如何配置生产环境所需的环境变量。

## 必需的环境变量

### 1. 数据库配置（Vercel Postgres）

在 [Vercel Dashboard](https://vercel.com/dashboard) 中：
1. 进入你的项目
2. 点击 "Storage" 标签
3. 创建 Postgres 数据库
4. 复制连接字符串

```
POSTGRES_PRISMA_URL="postgresql://username:password@host:5432/database?pgbouncer=true"
POSTGRES_URL_NON_POOLING="postgresql://username:password@host:5432/database"
```

### 2. NextAuth.js 配置

生成 NextAuth 密钥：
```bash
openssl rand -base64 32
```

```
NEXTAUTH_SECRET="your-generated-secret"
NEXTAUTH_URL="https://yourdomain.com"
```

### 3. GitHub OAuth 配置

在 [GitHub Developer Settings](https://github.com/settings/developers) 中：
1. 创建新的 OAuth App
2. 设置 Homepage URL: `https://yourdomain.com`
3. 设置 Authorization callback URL: `https://yourdomain.com/api/auth/callback/github`

```
GITHUB_ID="your-client-id"
GITHUB_SECRET="your-client-secret"
```

### 4. AI翻译 API 配置

**Deepseek（推荐）：**
- 访问 [Deepseek Platform](https://platform.deepseek.com/)
- 创建 API Key

**DeepL（备选）：**
- 访问 [DeepL API](https://www.deepl.com/pro-api)
- 获取 API Key

```
DEEPSEEK_API_KEY="your-deepseek-api-key"
# 或者
DEEPL_API_KEY="your-deepl-api-key"
```

### 5. Vercel Blob 存储配置

在 Vercel Dashboard 中：
1. 进入项目设置
2. 点击 "Storage" 标签
3. 创建 Blob 存储
4. 复制读写令牌

```
BLOB_READ_WRITE_TOKEN="your-vercel-blob-token"
```

### 6. 网站公开 URL

```
NEXT_PUBLIC_SITE_URL="https://yourdomain.com"
```

## 可选的环境变量

### 管理员配置

限制可以登录 CMS 后台的 GitHub 用户：

```
ADMIN_GITHUB_USERNAMES="your-github-username,another-admin"
```

## 在 Vercel 中配置环境变量

### 方法 1：通过 Dashboard

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 选择你的项目
3. 点击 "Settings" 标签
4. 点击 "Environment Variables"
5. 添加每个环境变量

### 方法 2：通过 CLI

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 添加环境变量
vercel env add POSTGRES_PRISMA_URL
vercel env add NEXTAUTH_SECRET
vercel env add GITHUB_ID
vercel env add GITHUB_SECRET
# ... 其他变量
```

## 自定义域名配置

### 在 Vercel 中配置域名

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 选择你的项目
3. 点击 "Settings" 标签
4. 点击 "Domains"
5. 添加你的自定义域名
6. 按照提示配置 DNS 记录

### DNS 配置示例

**对于 apex domain（如 `yourdomain.com`）：**
```
Type: A
Name: @
Value: 76.76.21.21
```

**对于 subdomain（如 `www.yourdomain.com`）：**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

## 安全建议

1. **不要提交 `.env` 文件到 Git**
   - 确保 `.gitignore` 包含 `.env*`
   
2. **定期轮换密钥**
   - 每 3-6 个月更新一次 API 密钥
   
3. **使用最小权限原则**
   - GitHub OAuth 只请求必要的权限
   - 数据库用户只授予必要的权限

4. **监控异常访问**
   - 定期检查 Vercel Analytics
   - 监控 API 调用频率

## 故障排除

### 数据库连接失败
- 检查连接字符串是否正确
- 确认数据库已创建并运行
- 检查网络访问权限

### GitHub OAuth 失败
- 检查 Client ID 和 Secret 是否正确
- 确认 callback URL 配置正确
- 检查 GitHub OAuth App 状态

### AI翻译失败
- 检查 API Key 是否有效
- 确认账户余额充足
- 检查 API 调用限制

### 文件上传失败
- 检查 Vercel Blob 令牌是否正确
- 确认 Blob 存储已创建
- 检查文件大小限制
