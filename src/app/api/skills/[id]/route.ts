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

// GET /api/skills/[id] - 获取技术栈详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 查询技术栈（支持ID或名称）
    const skill = await prisma.skill.findFirst({
      where: {
        OR: [
          { id },
          { name: id },
        ],
      },
    });

    if (!skill) {
      return NextResponse.json(
        { success: false, error: '技术栈不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: skill,
    });
  } catch (error) {
    console.error('获取技术栈详情失败:', error);
    return NextResponse.json(
      { success: false, error: '获取技术栈详情失败' },
      { status: 500 }
    );
  }
}

// PUT /api/skills/[id] - 更新技术栈
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

    // 检查技术栈是否存在
    const existingSkill = await prisma.skill.findFirst({
      where: {
        OR: [
          { id },
          { name: id },
        ],
      },
    });

    if (!existingSkill) {
      return NextResponse.json(
        { success: false, error: '技术栈不存在' },
        { status: 404 }
      );
    }

    // 如果更新名称，检查是否已存在
    if (body.name && body.name !== existingSkill.name) {
      const nameExists = await prisma.skill.findUnique({
        where: { name: body.name },
      });

      if (nameExists) {
        return NextResponse.json(
          { success: false, error: '技术栈名称已存在' },
          { status: 400 }
        );
      }
    }

    // 验证熟练度范围
    if (body.proficiency !== undefined && (body.proficiency < 1 || body.proficiency > 100)) {
      return NextResponse.json(
        { success: false, error: '熟练度必须在1-100之间' },
        { status: 400 }
      );
    }

    // 更新技术栈
    const skill = await prisma.skill.update({
      where: { id: existingSkill.id },
      data: {
        name: body.name,
        category: body.category,
        proficiency: body.proficiency,
        description: body.description,
        projects: body.projects,
      },
    });

    return NextResponse.json({
      success: true,
      data: skill,
    });
  } catch (error) {
    console.error('更新技术栈失败:', error);
    return NextResponse.json(
      { success: false, error: '更新技术栈失败' },
      { status: 500 }
    );
  }
}

// DELETE /api/skills/[id] - 删除技术栈
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

    // 检查技术栈是否存在
    const existingSkill = await prisma.skill.findFirst({
      where: {
        OR: [
          { id },
          { name: id },
        ],
      },
    });

    if (!existingSkill) {
      return NextResponse.json(
        { success: false, error: '技术栈不存在' },
        { status: 404 }
      );
    }

    // 删除技术栈
    await prisma.skill.delete({
      where: { id: existingSkill.id },
    });

    return NextResponse.json({
      success: true,
      message: '技术栈删除成功',
    });
  } catch (error) {
    console.error('删除技术栈失败:', error);
    return NextResponse.json(
      { success: false, error: '删除技术栈失败' },
      { status: 500 }
    );
  }
}
