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

// GET /api/skills - 获取技术栈列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    // 构建查询条件
    const where: any = {};

    if (category) {
      where.category = category;
    }

    // 查询技术栈
    const skills = await prisma.skill.findMany({
      where,
      orderBy: [
        { proficiency: 'desc' },
        { name: 'asc' },
      ],
    });

    return NextResponse.json({
      success: true,
      data: skills,
    });
  } catch (error) {
    console.error('获取技术栈列表失败:', error);
    return NextResponse.json(
      { success: false, error: '获取技术栈列表失败' },
      { status: 500 }
    );
  }
}

// POST /api/skills - 创建技术栈
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
    if (!body.name || !body.category || body.proficiency === undefined) {
      return NextResponse.json(
        { success: false, error: '缺少必填字段' },
        { status: 400 }
      );
    }

    // 验证字段类型
    if (typeof body.name !== 'string' || typeof body.category !== 'string' || typeof body.proficiency !== 'number') {
      return NextResponse.json(
        { success: false, error: '字段类型错误：name(string), category(string), proficiency(number)' },
        { status: 400 }
      );
    }

    // 验证输入长度
    if (body.name.length > 100 || (body.description && body.description.length > 5000)) {
      return NextResponse.json(
        { success: false, error: '输入超出最大长度限制' },
        { status: 400 }
      );
    }

    // 检查技术栈名称是否已存在
    const existingSkill = await prisma.skill.findUnique({
      where: { name: body.name },
    });

    if (existingSkill) {
      return NextResponse.json(
        { success: false, error: '技术栈名称已存在' },
        { status: 400 }
      );
    }

    // 验证熟练度范围
    if (body.proficiency < 1 || body.proficiency > 100) {
      return NextResponse.json(
        { success: false, error: '熟练度必须在1-100之间' },
        { status: 400 }
      );
    }

    // 创建技术栈
    const skill = await prisma.skill.create({
      data: {
        name: body.name,
        category: body.category,
        proficiency: body.proficiency,
        description: body.description,
        projects: Array.isArray(body.projects) ? body.projects : [],
      },
    });

    return NextResponse.json({
      success: true,
      data: skill,
    }, { status: 201 });
  } catch (error) {
    console.error('创建技术栈失败:', error);
    return NextResponse.json(
      { success: false, error: '创建技术栈失败' },
      { status: 500 }
    );
  }
}
