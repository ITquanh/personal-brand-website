import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyApiKey, generateSlug, calculateReadTime, errorResponse, successResponse } from '../utils';

/**
 * POST /api/ingest/github
 *
 * 通过 GitHub 仓库 URL 自动导入项目
 *
 * 功能：
 * 1. 解析 GitHub URL 获取仓库信息
 * 2. 获取 README 内容
 * 3. 获取编程语言占比
 * 4. 自动提取 star 数、fork 数
 * 5. 生成项目介绍（基于 README 摘要）
 * 6. 创建或更新项目记录
 *
 * 请求示例：
 * curl -X POST http://localhost:3000/api/ingest/github \
 *   -H "Authorization: Bearer YOUR_API_KEY" \
 *   -H "Content-Type: application/json" \
 *   -d '{"githubUrl": "https://github.com/vercel/next.js", "isFeatured": true}'
 *
 * 可选字段：
 *   - titleZh: 自定义中文标题（不传则用 repo name）
 *   - summaryZh: 自定义中文摘要（不传则自动生成）
 *   - slug: 自定义 slug
 *   - isFeatured: 是否精选
 */
export async function POST(request: NextRequest) {
  if (!verifyApiKey(request)) {
    return errorResponse('无效的 API Key', 401);
  }

  try {
    const body = await request.json();

    if (!body.githubUrl) {
      return errorResponse('缺少必填字段: githubUrl');
    }

    // 解析 GitHub URL
    const urlMatch = body.githubUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!urlMatch) {
      return errorResponse('无效的 GitHub URL 格式，应为 https://github.com/owner/repo');
    }

    const [, owner, repo] = urlMatch;
    const repoName = repo.replace(/\.git$/, '');

    // 1. 获取仓库信息
    const repoResponse = await fetch(`https://api.github.com/repos/${owner}/${repoName}`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        ...(process.env.GITHUB_TOKEN ? { 'Authorization': `token ${process.env.GITHUB_TOKEN}` } : {}),
      },
    });

    if (!repoResponse.ok) {
      if (repoResponse.status === 404) {
        return errorResponse(`仓库不存在: ${owner}/${repoName}`, 404);
      }
      return errorResponse(`GitHub API 错误: ${repoResponse.status}`, 502);
    }

    const repoData = await repoResponse.json();

    // 2. 获取 README
    let readmeContent = '';
    try {
      const readmeResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repoName}/readme`,
        {
          headers: {
            'Accept': 'application/vnd.github.v3.raw',
            ...(process.env.GITHUB_TOKEN ? { 'Authorization': `token ${process.env.GITHUB_TOKEN}` } : {}),
          },
        }
      );
      if (readmeResponse.ok) {
        readmeContent = await readmeResponse.text();
        // 限制 README 长度（取前 3000 字符作为架构说明）
        if (readmeContent.length > 3000) {
          readmeContent = readmeContent.substring(0, 3000) + '\n\n...(内容已截断)';
        }
      }
    } catch {
      // README 获取失败不影响整体流程
    }

    // 3. 获取编程语言
    let languages: string[] = [];
    try {
      const langResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repoName}/languages`,
        {
          headers: {
            'Accept': 'application/vnd.github.v3+json',
            ...(process.env.GITHUB_TOKEN ? { 'Authorization': `token ${process.env.GITHUB_TOKEN}` } : {}),
          },
        }
      );
      if (langResponse.ok) {
        const langData = await langResponse.json();
        // 按使用量排序，取前 5 个
        languages = Object.entries(langData)
          .sort(([, a]: any, [, b]: any) => b - a)
          .slice(0, 5)
          .map(([lang]) => lang);
      }
    } catch {
      // 语言获取失败不影响
    }

    // 4. 生成项目信息
    const title = body.titleZh || repoData.name;
    const slug = body.slug || generateSlug(title);

    // 自动生成摘要
    const summary = body.summaryZh || repoData.description || `${repoData.name} - 一个开源项目`;

    // 构建架构说明
    const architectureParts: string[] = [];
    if (repoData.description) {
      architectureParts.push(`## 项目简介\n\n${repoData.description}`);
    }
    if (languages.length > 0) {
      architectureParts.push(`## 技术栈\n\n${languages.join(', ')}`);
    }
    if (repoData.homepage) {
      architectureParts.push(`## 项目主页\n\n${repoData.homepage}`);
    }
    if (readmeContent) {
      // 提取 README 的前几段作为架构说明
      const lines = readmeContent.split('\n');
      const introLines: string[] = [];
      let lineCount = 0;
      for (const line of lines) {
        if (lineCount > 50) break;
        introLines.push(line);
        if (line.trim() !== '') lineCount++;
      }
      architectureParts.push(`## README 摘要\n\n${introLines.join('\n')}`);
    }

    // 构建量化指标
    const impactParts: string[] = [];
    if (repoData.stargazers_count > 0) {
      impactParts.push(`⭐ ${repoData.stargazers_count} Stars`);
    }
    if (repoData.forks_count > 0) {
      impactParts.push(`🍴 ${repoData.forks_count} Forks`);
    }
    if (repoData.open_issues_count > 0) {
      impactParts.push(`📋 ${repoData.open_issues_count} Open Issues`);
    }
    const quantifiedImpact = impactParts.length > 0 ? impactParts.join(' | ') : null;

    // 5. 创建或更新项目
    const existing = await prisma.project.findUnique({ where: { slug } });

    const projectData = {
      slug,
      titleZh: title,
      titleEn: repoData.name !== title ? repoData.name : null,
      summaryZh: summary,
      summaryEn: repoData.description || null,
      techStack: JSON.stringify(languages),
      architectureZh: architectureParts.join('\n\n'),
      architectureEn: null,
      quantifiedImpact,
      githubUrl: body.githubUrl,
      demoUrl: repoData.homepage || null,
      imageUrl: repoData.owner?.avatar_url || null,
      isFeatured: body.isFeatured || false,
      translationStatus: repoData.description ? 'translated' : 'untranslated',
    };

    let project;
    if (existing) {
      project = await prisma.project.update({
        where: { slug },
        data: projectData,
      });
    } else {
      project = await prisma.project.create({ data: projectData });
    }

    // 6. 同步创建技能（如果仓库有语言数据）
    for (const lang of languages) {
      try {
        const existingSkill = await prisma.skill.findUnique({ where: { name: lang } });
        if (existingSkill) {
          // 更新项目的关联
          const projects = JSON.parse(existingSkill.projects || '[]');
          if (!projects.includes(slug)) {
            projects.push(slug);
            await prisma.skill.update({
              where: { name: lang },
              data: { projects: JSON.stringify(projects) },
            });
          }
        } else {
          // 创建新技能
          await prisma.skill.create({
            data: {
              name: lang,
              category: guessCategory(lang),
              proficiency: 50,
              projects: JSON.stringify([slug]),
            },
          });
        }
      } catch {
        // 技能同步失败不影响主流程
      }
    }

    return successResponse({
      message: existing ? `项目已更新: ${project.slug}` : `项目已创建: ${project.slug}`,
      data: {
        id: project.id,
        slug: project.slug,
        title: project.titleZh,
        url: `/zh/projects/${project.slug}`,
        githubUrl: project.githubUrl,
        techStack: languages,
        stars: repoData.stargazers_count,
        forks: repoData.forks_count,
        description: repoData.description,
        homepage: repoData.homepage,
        languages: languages,
      },
    }, existing ? 200 : 201);
  } catch (error: any) {
    console.error('GitHub 仓库导入失败:', error);
    return errorResponse(`导入失败: ${error.message}`, 500);
  }
}

// 根据编程语言猜测分类
function guessCategory(language: string): string {
  const categoryMap: Record<string, string> = {
    'JavaScript': '前端', 'TypeScript': '前端', 'HTML': '前端', 'CSS': '前端',
    'Vue': '前端', 'Svelte': '前端', 'Astro': '前端',
    'Python': '后端', 'Java': '后端', 'Go': '后端', 'Rust': '后端',
    'C': '后端', 'C++': '后端', 'C#': '后端', 'Ruby': '后端', 'PHP': '后端',
    'Swift': '移动端', 'Kotlin': '移动端', 'Dart': '移动端',
    'Shell': 'DevOps', 'Dockerfile': 'DevOps', 'YAML': 'DevOps',
    'SQL': '数据库', 'PLpgSQL': '数据库',
  };
  return categoryMap[language] || '其他';
}
