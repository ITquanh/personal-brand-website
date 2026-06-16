import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyApiKey, generateSlug, errorResponse, successResponse } from '../utils';

/**
 * POST /api/ingest/project
 *
 * AI 友好的项目发布接口
 *
 * 请求示例：
 * curl -X POST http://localhost:3000/api/ingest/project \
 *   -H "Authorization: Bearer YOUR_API_KEY" \
 *   -H "Content-Type: application/json" \
 *   -d '{
 *     "titleZh": "StarMind 思维管理工具",
 *     "summaryZh": "AI驱动的思维导图与知识管理工具",
 *     "techStack": ["Next.js", "TypeScript", "OpenAI API"],
 *     "architectureZh": "## 架构设计\n\n基于 Next.js App Router...",
 *     "quantifiedImpact": "提升知识整理效率 60%",
 *     "githubUrl": "https://github.com/example/starmind",
 *     "isFeatured": true
 *   }'
 *
 * 可选字段：
 *   - titleEn, summaryEn, architectureEn（英文版本）
 *   - demoUrl, imageUrl
 *   - slug（自定义，不传则自动生成）
 *   - isFeatured（默认 false）
 *   - translationStatus（默认 "untranslated"）
 *   - action: "create" | "update"（默认 "create"）
 */
export async function POST(request: NextRequest) {
  if (!verifyApiKey(request)) {
    return errorResponse('无效的 API Key', 401);
  }

  try {
    const body = await request.json();

    if (!body.titleZh) return errorResponse('缺少必填字段: titleZh');
    if (!body.summaryZh) return errorResponse('缺少必填字段: summaryZh');

    const slug = body.slug || generateSlug(body.titleZh);

    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugRegex.test(slug)) {
      return errorResponse(`无效的 slug 格式: "${slug}"`);
    }

    const existing = await prisma.project.findUnique({ where: { slug } });

    if (body.action === 'update' || existing) {
      if (!existing) return errorResponse(`项目不存在: ${slug}`, 404);

      const updated = await prisma.project.update({
        where: { slug },
        data: {
          ...(body.titleZh && { titleZh: body.titleZh }),
          ...(body.titleEn !== undefined && { titleEn: body.titleEn }),
          ...(body.summaryZh && { summaryZh: body.summaryZh }),
          ...(body.summaryEn !== undefined && { summaryEn: body.summaryEn }),
          ...(body.techStack && { techStack: body.techStack }),
          ...(body.architectureZh !== undefined && { architectureZh: body.architectureZh }),
          ...(body.architectureEn !== undefined && { architectureEn: body.architectureEn }),
          ...(body.quantifiedImpact !== undefined && { quantifiedImpact: body.quantifiedImpact }),
          ...(body.githubUrl !== undefined && { githubUrl: body.githubUrl }),
          ...(body.demoUrl !== undefined && { demoUrl: body.demoUrl }),
          ...(body.imageUrl !== undefined && { imageUrl: body.imageUrl }),
          ...(body.isFeatured !== undefined && { isFeatured: body.isFeatured }),
          ...(body.translationStatus && {
            translationStatus: body.translationStatus,
            translatedAt: body.translationStatus === 'translated' ? new Date() : undefined,
          }),
        },
      });

      return successResponse({
        message: `项目已更新: ${updated.slug}`,
        data: { id: updated.id, slug: updated.slug, title: updated.titleZh, url: `/zh/projects/${updated.slug}` },
      });
    }

    const project = await prisma.project.create({
      data: {
        slug,
        titleZh: body.titleZh,
        titleEn: body.titleEn || null,
        summaryZh: body.summaryZh,
        summaryEn: body.summaryEn || null,
        techStack: JSON.stringify(Array.isArray(body.techStack) ? body.techStack : []),
        architectureZh: body.architectureZh || null,
        architectureEn: body.architectureEn || null,
        quantifiedImpact: body.quantifiedImpact || null,
        githubUrl: body.githubUrl || null,
        demoUrl: body.demoUrl || null,
        imageUrl: body.imageUrl || null,
        isFeatured: body.isFeatured || false,
        translationStatus: body.translationStatus || 'untranslated',
      },
    });

    return successResponse({
      message: `项目已创建: ${project.slug}`,
      data: { id: project.id, slug: project.slug, title: project.titleZh, url: `/zh/projects/${project.slug}` },
    }, 201);
  } catch (error: any) {
    console.error('项目发布失败:', error);
    return errorResponse(`发布失败: ${error.message}`, 500);
  }
}

/**
 * GET /api/ingest/project
 *
 * 查询项目列表
 */
export async function GET(request: NextRequest) {
  if (!verifyApiKey(request)) {
    return errorResponse('无效的 API Key', 401);
  }

  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const featured = searchParams.get('featured');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);

    if (slug) {
      const project = await prisma.project.findUnique({ where: { slug } });
      if (!project) return errorResponse('项目不存在', 404);
      return successResponse({ data: project });
    }

    const where: any = {};
    if (featured === 'true') where.isFeatured = true;

    const projects = await prisma.project.findMany({
      where,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: { id: true, slug: true, titleZh: true, titleEn: true, techStack: true, isFeatured: true, createdAt: true },
    });

    return successResponse({ data: projects, count: projects.length });
  } catch (error: any) {
    return errorResponse(`查询失败: ${error.message}`, 500);
  }
}

/**
 * DELETE /api/ingest/project
 */
export async function DELETE(request: NextRequest) {
  if (!verifyApiKey(request)) {
    return errorResponse('无效的 API Key', 401);
  }

  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    if (!slug) return errorResponse('缺少参数: slug');

    const existing = await prisma.project.findUnique({ where: { slug } });
    if (!existing) return errorResponse('项目不存在', 404);

    await prisma.project.delete({ where: { slug } });
    return successResponse({ message: `项目已删除: ${slug}` });
  } catch (error: any) {
    return errorResponse(`删除失败: ${error.message}`, 500);
  }
}
