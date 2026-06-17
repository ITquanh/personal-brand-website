import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// 安全解析 JSON 字符串（SQLite 把数组存为 JSON 字符串）
function safeParseJson(value: any, fallback: any = []): any {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try { return JSON.parse(value); } catch { return fallback; }
  }
  return fallback;
}

// GET /api/projects - 获取项目列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    let page = parseInt(searchParams.get('page') || '1', 10);
    let limit = parseInt(searchParams.get('limit') || '10', 10);

    // 验证分页参数
    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1) limit = 10;
    if (limit > 100) limit = 100;
    const techStack = searchParams.get('techStack');
    const featured = searchParams.get('featured');
    const locale = searchParams.get('locale') || 'zh';

    // 构建查询条件
    const where: any = {};

    if (techStack) {
      where.techStack = {
        contains: `"${techStack}"`,
      };
    }

    if (featured === 'true') {
      where.isFeatured = true;
    }

    // 计算分页
    const skip = (page - 1) * limit;

    // 查询项目
    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.project.count({ where }),
    ]);

    // 根据语言返回对应的字段
    const formattedProjects = projects.map((project) => ({
      ...project,
      title: locale === 'en' && project.titleEn ? project.titleEn : project.titleZh,
      summary: locale === 'en' && project.summaryEn ? project.summaryEn : project.summaryZh,
      techStack: safeParseJson(project.techStack, []),
      architecture: locale === 'en' && project.architectureEn ? project.architectureEn : project.architectureZh,
    }));

    return NextResponse.json({
      success: true,
      data: formattedProjects,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('获取项目列表失败:', error);
    return NextResponse.json(
      { success: false, error: '获取项目列表失败' },
      { status: 500 }
    );
  }
}

// POST /api/projects - 创建项目
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
    if (!body.titleZh || !body.summaryZh || !body.slug) {
      return NextResponse.json(
        { success: false, error: '缺少必填字段' },
        { status: 400 }
      );
    }

    // 检查slug是否已存在
    const existingProject = await prisma.project.findUnique({
      where: { slug: body.slug },
    });

    if (existingProject) {
      return NextResponse.json(
        { success: false, error: '项目slug已存在' },
        { status: 400 }
      );
    }

    // 创建项目
    const project = await prisma.project.create({
      data: {
        slug: body.slug,
        titleZh: body.titleZh,
        titleEn: body.titleEn,
        summaryZh: body.summaryZh,
        summaryEn: body.summaryEn,
        techStack: Array.isArray(body.techStack) ? JSON.stringify(body.techStack) : body.techStack || "[]",
        architectureZh: body.architectureZh,
        architectureEn: body.architectureEn,
        quantifiedImpact: body.quantifiedImpact,
        githubUrl: body.githubUrl,
        demoUrl: body.demoUrl,
        imageUrl: body.imageUrl,
        isFeatured: body.isFeatured || false,
        translationStatus: body.translationStatus || 'untranslated',
      },
    });

    return NextResponse.json({
      success: true,
      data: project,
    }, { status: 201 });
  } catch (error) {
    console.error('创建项目失败:', error);
    return NextResponse.json(
      { success: false, error: '创建项目失败' },
      { status: 500 }
    );
  }
}
