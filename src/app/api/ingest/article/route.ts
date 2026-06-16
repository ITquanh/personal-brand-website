import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyApiKey, generateSlug, calculateReadTime, errorResponse, successResponse } from '../utils';

/**
 * POST /api/ingest/article
 *
 * AI 友好的文章发布接口
 *
 * 请求示例：
 * curl -X POST http://localhost:3000/api/ingest/article \
 *   -H "Authorization: Bearer YOUR_API_KEY" \
 *   -H "Content-Type: application/json" \
 *   -d '{
 *     "titleZh": "AI 结对编程指南",
 *     "contentZh": "# AI 结对编程\n\n正文内容...",
 *     "summaryZh": "深入探讨 AI 编程",
 *     "tags": ["AI", "编程"],
 *     "published": true
 *   }'
 *
 * 可选字段：
 *   - titleEn, contentEn, summaryEn（英文版本）
 *   - imageUrl（封面图）
 *   - slug（自定义，不传则自动生成）
 *   - published（默认 false）
 *   - translationStatus（默认 "untranslated"）
 *   - action: "create" | "update"（默认 "create"，update 时需传 slug）
 */
export async function POST(request: NextRequest) {
  // 验证 API Key
  if (!verifyApiKey(request)) {
    return errorResponse('无效的 API Key', 401);
  }

  try {
    const body = await request.json();

    // 验证必填字段
    if (!body.titleZh) {
      return errorResponse('缺少必填字段: titleZh');
    }
    if (!body.contentZh) {
      return errorResponse('缺少必填字段: contentZh');
    }

    // 生成或使用提供的 slug
    const slug = body.slug || generateSlug(body.titleZh);

    // 验证 slug 格式
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugRegex.test(slug)) {
      return errorResponse(`无效的 slug 格式: "${slug}"，只允许小写字母、数字和连字符`);
    }

    // 计算阅读时间
    const readTime = calculateReadTime(body.contentZh);

    // 检查是否已存在（幂等：存在则更新）
    const existing = await prisma.post.findUnique({ where: { slug } });

    if (body.action === 'update' || existing) {
      // 更新模式
      if (!existing) {
        return errorResponse(`文章不存在: ${slug}`, 404);
      }

      const updated = await prisma.post.update({
        where: { slug },
        data: {
          ...(body.titleZh && { titleZh: body.titleZh }),
          ...(body.titleEn !== undefined && { titleEn: body.titleEn }),
          ...(body.contentZh && { contentZh: body.contentZh, readTime: calculateReadTime(body.contentZh) }),
          ...(body.contentEn !== undefined && { contentEn: body.contentEn }),
          ...(body.summaryZh !== undefined && { summaryZh: body.summaryZh }),
          ...(body.summaryEn !== undefined && { summaryEn: body.summaryEn }),
          ...(body.tags && { tags: body.tags }),
          ...(body.imageUrl !== undefined && { imageUrl: body.imageUrl }),
          ...(body.published !== undefined && { published: body.published }),
          ...(body.translationStatus && {
            translationStatus: body.translationStatus,
            translatedAt: body.translationStatus === 'translated' ? new Date() : undefined,
          }),
        },
      });

      return successResponse({
        message: `文章已更新: ${updated.slug}`,
        data: {
          id: updated.id,
          slug: updated.slug,
          title: updated.titleZh,
          url: `/zh/blog/${updated.slug}`,
          published: updated.published,
          readTime: updated.readTime,
        },
      });
    }

    // 创建模式
    const post = await prisma.post.create({
      data: {
        slug,
        titleZh: body.titleZh,
        titleEn: body.titleEn || null,
        contentZh: body.contentZh,
        contentEn: body.contentEn || null,
        summaryZh: body.summaryZh || null,
        summaryEn: body.summaryEn || null,
        tags: JSON.stringify(Array.isArray(body.tags) ? body.tags : []),
        imageUrl: body.imageUrl || null,
        published: body.published || false,
        readTime,
        translationStatus: body.translationStatus || 'untranslated',
      },
    });

    return successResponse({
      message: `文章已创建: ${post.slug}`,
      data: {
        id: post.id,
        slug: post.slug,
        title: post.titleZh,
        url: `/zh/blog/${post.slug}`,
        published: post.published,
        readTime: post.readTime,
      },
    }, 201);
  } catch (error: any) {
    console.error('文章发布失败:', error);
    return errorResponse(`发布失败: ${error.message}`, 500);
  }
}

/**
 * GET /api/ingest/article
 *
 * 查询文章列表（支持按 slug 或标签筛选）
 *
 * curl http://localhost:3000/api/ingest/article?slug=ai-guide \
 *   -H "Authorization: Bearer YOUR_API_KEY"
 */
export async function GET(request: NextRequest) {
  if (!verifyApiKey(request)) {
    return errorResponse('无效的 API Key', 401);
  }

  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const tag = searchParams.get('tag');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);

    if (slug) {
      const post = await prisma.post.findUnique({ where: { slug } });
      if (!post) return errorResponse('文章不存在', 404);
      return successResponse({ data: post });
    }

    const where: any = {};
    if (tag) where.tags = { contains: `"${tag}"` };

    const posts = await prisma.post.findMany({
      where,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: { id: true, slug: true, titleZh: true, titleEn: true, published: true, tags: true, readTime: true, viewCount: true, createdAt: true },
    });

    return successResponse({ data: posts, count: posts.length });
  } catch (error: any) {
    return errorResponse(`查询失败: ${error.message}`, 500);
  }
}

/**
 * DELETE /api/ingest/article
 *
 * 删除文章（通过 slug）
 *
 * curl -X DELETE "http://localhost:3000/api/ingest/article?slug=ai-guide" \
 *   -H "Authorization: Bearer YOUR_API_KEY"
 */
export async function DELETE(request: NextRequest) {
  if (!verifyApiKey(request)) {
    return errorResponse('无效的 API Key', 401);
  }

  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (!slug) return errorResponse('缺少参数: slug');

    const existing = await prisma.post.findUnique({ where: { slug } });
    if (!existing) return errorResponse('文章不存在', 404);

    await prisma.post.delete({ where: { slug } });

    return successResponse({ message: `文章已删除: ${slug}` });
  } catch (error: any) {
    return errorResponse(`删除失败: ${error.message}`, 500);
  }
}
