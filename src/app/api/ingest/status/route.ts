import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyApiKey, errorResponse, successResponse } from '../utils';

/**
 * GET /api/ingest/status
 *
 * 查询网站内容状态概览（AI 可用此接口了解当前网站内容情况）
 *
 * curl http://localhost:3000/api/ingest/status \
 *   -H "Authorization: Bearer YOUR_API_KEY"
 *
 * 响应示例：
 * {
 *   "success": true,
 *   "data": {
 *     "articles": { "total": 5, "published": 3, "draft": 2, "translated": 2 },
 *     "projects": { "total": 10, "featured": 3, "translated": 5 },
 *     "skills": { "total": 15, "categories": ["AI工具","后端","前端"] },
 *     "recentArticles": [...],
 *     "recentProjects": [...]
 *   }
 * }
 */
export async function GET(request: NextRequest) {
  if (!verifyApiKey(request)) {
    return errorResponse('无效的 API Key', 401);
  }

  try {
    const [totalPosts, publishedPosts, translatedPosts, totalProjects, featuredProjects, translatedProjects, skills, recentPosts, recentProjects] = await Promise.all([
      prisma.post.count(),
      prisma.post.count({ where: { published: true } }),
      prisma.post.count({ where: { translationStatus: 'translated' } }),
      prisma.project.count(),
      prisma.project.count({ where: { isFeatured: true } }),
      prisma.project.count({ where: { translationStatus: 'translated' } }),
      prisma.skill.findMany({ orderBy: { proficiency: 'desc' } }),
      prisma.post.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { slug: true, titleZh: true, published: true, createdAt: true },
      }),
      prisma.project.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { slug: true, titleZh: true, isFeatured: true, createdAt: true },
      }),
    ]);

    const categories = [...new Set(skills.map(s => s.category))];

    return successResponse({
      data: {
        articles: {
          total: totalPosts,
          published: publishedPosts,
          draft: totalPosts - publishedPosts,
          translated: translatedPosts,
          untranslated: totalPosts - translatedPosts,
        },
        projects: {
          total: totalProjects,
          featured: featuredProjects,
          translated: translatedProjects,
          untranslated: totalProjects - translatedProjects,
        },
        skills: {
          total: skills.length,
          categories,
          byCategory: categories.reduce((acc, cat) => {
            acc[cat] = skills.filter(s => s.category === cat).length;
            return acc;
          }, {} as Record<string, number>),
        },
        recentArticles: recentPosts,
        recentProjects: recentProjects,
        siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
      },
    });
  } catch (error: any) {
    return errorResponse(`查询失败: ${error.message}`, 500);
  }
}
