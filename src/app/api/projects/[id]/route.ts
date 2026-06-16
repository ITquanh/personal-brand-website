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

// GET /api/projects/[id] - 获取项目详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale') || 'zh';

    // 查询项目（支持ID或slug）
    const project = await prisma.project.findFirst({
      where: {
        OR: [
          { id },
          { slug: id },
        ],
      },
    });

    if (!project) {
      return NextResponse.json(
        { success: false, error: '项目不存在' },
        { status: 404 }
      );
    }

    // 根据语言返回对应的字段
    const formattedProject = {
      ...project,
      title: locale === 'en' && project.titleEn ? project.titleEn : project.titleZh,
      summary: locale === 'en' && project.summaryEn ? project.summaryEn : project.summaryZh,
      techStack: safeParseJson(project.techStack, []),
      architecture: locale === 'en' && project.architectureEn ? project.architectureEn : project.architectureZh,
    };

    return NextResponse.json({
      success: true,
      data: formattedProject,
    });
  } catch (error) {
    console.error('获取项目详情失败:', error);
    return NextResponse.json(
      { success: false, error: '获取项目详情失败' },
      { status: 500 }
    );
  }
}

// PUT /api/projects/[id] - 更新项目
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

    // 检查项目是否存在
    const existingProject = await prisma.project.findFirst({
      where: {
        OR: [
          { id },
          { slug: id },
        ],
      },
    });

    if (!existingProject) {
      return NextResponse.json(
        { success: false, error: '项目不存在' },
        { status: 404 }
      );
    }

    // 如果更新slug，检查是否已存在
    if (body.slug && body.slug !== existingProject.slug) {
      const slugExists = await prisma.project.findUnique({
        where: { slug: body.slug },
      });

      if (slugExists) {
        return NextResponse.json(
          { success: false, error: '项目slug已存在' },
          { status: 400 }
        );
      }
    }

    // 更新项目
    const project = await prisma.project.update({
      where: { id: existingProject.id },
      data: {
        slug: body.slug,
        titleZh: body.titleZh,
        titleEn: body.titleEn,
        summaryZh: body.summaryZh,
        summaryEn: body.summaryEn,
        techStack: body.techStack ? (Array.isArray(body.techStack) ? JSON.stringify(body.techStack) : body.techStack) : undefined,
        architectureZh: body.architectureZh,
        architectureEn: body.architectureEn,
        quantifiedImpact: body.quantifiedImpact,
        githubUrl: body.githubUrl,
        demoUrl: body.demoUrl,
        imageUrl: body.imageUrl,
        isFeatured: body.isFeatured,
        translationStatus: body.translationStatus,
        translatedAt: body.translationStatus === 'translated' ? new Date() : undefined,
      },
    });

    return NextResponse.json({
      success: true,
      data: project,
    });
  } catch (error) {
    console.error('更新项目失败:', error);
    return NextResponse.json(
      { success: false, error: '更新项目失败' },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[id] - 删除项目
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

    // 检查项目是否存在
    const existingProject = await prisma.project.findFirst({
      where: {
        OR: [
          { id },
          { slug: id },
        ],
      },
    });

    if (!existingProject) {
      return NextResponse.json(
        { success: false, error: '项目不存在' },
        { status: 404 }
      );
    }

    // 删除项目
    await prisma.project.delete({
      where: { id: existingProject.id },
    });

    return NextResponse.json({
      success: true,
      message: '项目删除成功',
    });
  } catch (error) {
    console.error('删除项目失败:', error);
    return NextResponse.json(
      { success: false, error: '删除项目失败' },
      { status: 500 }
    );
  }
}
