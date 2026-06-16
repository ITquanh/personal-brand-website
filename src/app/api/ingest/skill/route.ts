import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyApiKey, errorResponse, successResponse } from '../utils';

/**
 * POST /api/ingest/skill — 添加或更新技能
 *
 * curl -X POST http://localhost:3000/api/ingest/skill \
 *   -H "Authorization: Bearer YOUR_API_KEY" \
 *   -H "Content-Type: application/json" \
 *   -d '{"name":"Rust","category":"后端","proficiency":70,"description":"系统编程语言"}'
 */
export async function POST(request: NextRequest) {
  if (!verifyApiKey(request)) return errorResponse('无效的 API Key', 401);

  try {
    const body = await request.json();
    if (!body.name) return errorResponse('缺少必填字段: name');
    if (!body.category) return errorResponse('缺少必填字段: category');
    if (body.proficiency === undefined) return errorResponse('缺少必填字段: proficiency');
    if (typeof body.proficiency !== 'number' || body.proficiency < 1 || body.proficiency > 100) {
      return errorResponse('proficiency 必须是 1-100 之间的数字');
    }

    const existing = await prisma.skill.findUnique({ where: { name: body.name } });

    if (existing) {
      const updated = await prisma.skill.update({
        where: { name: body.name },
        data: {
          category: body.category,
          proficiency: body.proficiency,
          description: body.description ?? existing.description,
          projects: JSON.stringify(Array.isArray(body.projects) ? body.projects : JSON.parse(existing.projects || '[]')),
        },
      });
      return successResponse({ message: `技能已更新: ${updated.name}`, data: updated });
    }

    const skill = await prisma.skill.create({
      data: {
        name: body.name,
        category: body.category,
        proficiency: body.proficiency,
        description: body.description || null,
        projects: JSON.stringify(Array.isArray(body.projects) ? body.projects : []),
      },
    });

    return successResponse({ message: `技能已创建: ${skill.name}`, data: skill }, 201);
  } catch (error: any) {
    return errorResponse(`操作失败: ${error.message}`, 500);
  }
}

/**
 * GET /api/ingest/skill — 查询技能列表
 */
export async function GET(request: NextRequest) {
  if (!verifyApiKey(request)) return errorResponse('无效的 API Key', 401);

  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    const where: any = {};
    if (category) where.category = category;

    const skills = await prisma.skill.findMany({
      where,
      orderBy: [{ proficiency: 'desc' }, { name: 'asc' }],
    });

    return successResponse({ data: skills, count: skills.length });
  } catch (error: any) {
    return errorResponse(`查询失败: ${error.message}`, 500);
  }
}
