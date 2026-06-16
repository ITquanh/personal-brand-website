import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

// 安全解析 JSON 字符串
function safeParseJson(value: any, fallback: any = []): any {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try { return JSON.parse(value); } catch { return fallback; }
  }
  return fallback;
}

// GET /api/posts/[id] - 获取文章详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale') || 'zh';

    // 查询文章（支持ID或slug）
    const post = await prisma.post.findFirst({
      where: {
        OR: [
          { id },
          { slug: id },
        ],
      },
    });

    if (!post) {
      return NextResponse.json(
        { success: false, error: '文章不存在' },
        { status: 404 }
      );
    }

    // 增加阅读次数
    await prisma.post.update({
      where: { id: post.id },
      data: { viewCount: { increment: 1 } },
    });

    // 根据语言返回对应的字段
    const formattedPost = {
      id: post.id,
      slug: post.slug,
      title: locale === 'en' && post.titleEn ? post.titleEn : post.titleZh,
      content: locale === 'en' && post.contentEn ? post.contentEn : post.contentZh,
      summary: locale === 'en' && post.summaryEn ? post.summaryEn : post.summaryZh,
      tags: safeParseJson(post.tags, []),
      imageUrl: post.imageUrl,
      published: post.published,
      readTime: post.readTime,
      viewCount: post.viewCount + 1,
      translationStatus: post.translationStatus,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    };

    return NextResponse.json({
      success: true,
      data: formattedPost,
    });
  } catch (error) {
    console.error('获取文章详情失败:', error);
    return NextResponse.json(
      { success: false, error: '获取文章详情失败' },
      { status: 500 }
    );
  }
}

// PUT /api/posts/[id] - 更新文章
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 验证管理员权限
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: '未授权访问' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    // 检查文章是否存在
    const existingPost = await prisma.post.findFirst({
      where: {
        OR: [
          { id },
          { slug: id },
        ],
      },
    });

    if (!existingPost) {
      return NextResponse.json(
        { success: false, error: '文章不存在' },
        { status: 404 }
      );
    }

    // 如果更新slug，检查是否已存在
    if (body.slug && body.slug !== existingPost.slug) {
      const slugExists = await prisma.post.findUnique({
        where: { slug: body.slug },
      });

      if (slugExists) {
        return NextResponse.json(
          { success: false, error: '文章slug已存在' },
          { status: 400 }
        );
      }
    }

    // 计算阅读时间
    let readTime = existingPost.readTime;
    if (body.contentZh || body.contentEn) {
      const contentLength = body.contentEn && !body.contentZh
        ? body.contentEn.length
        : (body.contentZh || '').length;
      const charsPerMinute = body.contentEn && !body.contentZh ? 1000 : 300;
      readTime = Math.max(1, Math.ceil(contentLength / charsPerMinute));
    }

    // 更新文章
    const post = await prisma.post.update({
      where: { id: existingPost.id },
      data: {
        slug: body.slug,
        titleZh: body.titleZh,
        titleEn: body.titleEn,
        contentZh: body.contentZh,
        contentEn: body.contentEn,
        summaryZh: body.summaryZh,
        summaryEn: body.summaryEn,
        tags: body.tags,
        imageUrl: body.imageUrl,
        published: body.published,
        readTime,
        translationStatus: body.translationStatus,
        translatedAt: body.translationStatus === 'translated' ? new Date() : undefined,
      },
    });

    return NextResponse.json({
      success: true,
      data: post,
    });
  } catch (error) {
    console.error('更新文章失败:', error);
    return NextResponse.json(
      { success: false, error: '更新文章失败' },
      { status: 500 }
    );
  }
}

// DELETE /api/posts/[id] - 删除文章
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 验证管理员权限
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: '未授权访问' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // 检查文章是否存在
    const existingPost = await prisma.post.findFirst({
      where: {
        OR: [
          { id },
          { slug: id },
        ],
      },
    });

    if (!existingPost) {
      return NextResponse.json(
        { success: false, error: '文章不存在' },
        { status: 404 }
      );
    }

    // 删除文章
    await prisma.post.delete({
      where: { id: existingPost.id },
    });

    return NextResponse.json({
      success: true,
      message: '文章删除成功',
    });
  } catch (error) {
    console.error('删除文章失败:', error);
    return NextResponse.json(
      { success: false, error: '删除文章失败' },
      { status: 500 }
    );
  }
}
