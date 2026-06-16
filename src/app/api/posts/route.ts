import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

// 安全解析 JSON 字符串（SQLite 把数组存为 JSON 字符串）
function safeParseJson(value: any, fallback: any = []): any {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try { return JSON.parse(value); } catch { return fallback; }
  }
  return fallback;
}

// GET /api/posts - 获取文章列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    let page = parseInt(searchParams.get('page') || '1', 10);
    let limit = parseInt(searchParams.get('limit') || '10', 10);
    const tag = searchParams.get('tag');
    const published = searchParams.get('published');
    const locale = searchParams.get('locale') || 'zh';

    // 验证分页参数
    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1) limit = 10;
    if (limit > 100) limit = 100;

    // 构建查询条件
    const where: any = {};

    if (tag) {
      where.tags = {
        contains: `"${tag}"`,
      };
    }

    // 草稿文章需要管理员权限
    if (published === 'all') {
      const session = await auth();
      if (!session?.user) {
        return NextResponse.json(
          { success: false, error: '未授权访问草稿文章' },
          { status: 401 }
        );
      }
    } else {
      where.published = true;
    }

    // 计算分页
    const skip = (page - 1) * limit;

    // 查询文章
    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.post.count({ where }),
    ]);

    // 根据语言返回对应的字段
    const formattedPosts = posts.map((post) => ({
      ...post,
      title: locale === 'en' && post.titleEn ? post.titleEn : post.titleZh,
      summary: locale === 'en' && post.summaryEn ? post.summaryEn : post.summaryZh,
      tags: safeParseJson(post.tags, []),
    }));

    return NextResponse.json({
      success: true,
      data: formattedPosts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('获取文章列表失败:', error);
    return NextResponse.json(
      { success: false, error: '获取文章列表失败' },
      { status: 500 }
    );
  }
}

// POST /api/posts - 创建文章
export async function POST(request: NextRequest) {
  try {
    // 验证管理员权限
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: '未授权访问' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // 验证必填字段
    if (!body.titleZh || !body.contentZh || !body.slug) {
      return NextResponse.json(
        { success: false, error: '缺少必填字段' },
        { status: 400 }
      );
    }

    // 检查slug是否已存在
    const existingPost = await prisma.post.findUnique({
      where: { slug: body.slug },
    });

    if (existingPost) {
      return NextResponse.json(
        { success: false, error: '文章slug已存在' },
        { status: 400 }
      );
    }

    // 计算阅读时间（中文每分钟300字，英文每分钟约200词×5字符=1000字符）
    const contentLength = body.contentEn && !body.contentZh
      ? body.contentEn.length
      : body.contentZh.length;
    const charsPerMinute = body.contentEn && !body.contentZh ? 1000 : 300;
    const readTime = Math.max(1, Math.ceil(contentLength / charsPerMinute));

    // 创建文章
    const post = await prisma.post.create({
      data: {
        slug: body.slug,
        titleZh: body.titleZh,
        titleEn: body.titleEn,
        contentZh: body.contentZh,
        contentEn: body.contentEn,
        summaryZh: body.summaryZh,
        summaryEn: body.summaryEn,
        tags: Array.isArray(body.tags) ? JSON.stringify(body.tags) : body.tags || "[]",
        imageUrl: body.imageUrl,
        published: body.published || false,
        readTime,
        translationStatus: body.translationStatus || 'untranslated',
      },
    });

    return NextResponse.json({
      success: true,
      data: post,
    }, { status: 201 });
  } catch (error) {
    console.error('创建文章失败:', error);
    return NextResponse.json(
      { success: false, error: '创建文章失败' },
      { status: 500 }
    );
  }
}
