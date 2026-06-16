import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/timeline — 读取时间线数据
 */
export async function GET() {
  try {
    let session;
    try { session = await auth(); } catch { return NextResponse.json({ success: false, error: '未授权' }, { status: 401 }); }
    if (!session?.user) {
      return NextResponse.json({ success: false, error: '未授权' }, { status: 401 });
    }

    const timelineEvents = await prisma.timelineEvent.findMany({
      orderBy: { order: 'asc' },
    });

    const data = timelineEvents.map(event => ({
      id: event.id,
      date: event.date,
      title: event.titleZh,
      titleZh: event.titleZh,
      titleEn: event.titleEn || '',
      company: event.companyZh,
      companyZh: event.companyZh,
      companyEn: event.companyEn || '',
      description: event.descriptionZh,
      descriptionZh: event.descriptionZh,
      descriptionEn: event.descriptionEn || '',
      achievements: JSON.parse(event.achievementsZh || '[]'),
      achievementsZh: JSON.parse(event.achievementsZh || '[]'),
      achievementsEn: JSON.parse(event.achievementsEn || '[]'),
      type: event.type,
    }));

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error('Timeline GET error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/**
 * POST /api/admin/timeline — 保存时间线数据
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: '未授权' }, { status: 401 });
    }

    const body = await request.json();

    if (!Array.isArray(body)) {
      return NextResponse.json({ success: false, error: '数据格式错误，应为数组' }, { status: 400 });
    }

    // 先删除旧数据
    await prisma.timelineEvent.deleteMany({});

    // 重新插入新数据
    for (let i = 0; i < body.length; i++) {
      const item = body[i];
      await prisma.timelineEvent.create({
        data: {
          date: item.date || '',
          titleZh: item.titleZh || item.title || '',
          titleEn: item.titleEn || '',
          companyZh: item.companyZh || item.company || '',
          companyEn: item.companyEn || '',
          descriptionZh: item.descriptionZh || item.description || '',
          descriptionEn: item.descriptionEn || '',
          achievementsZh: JSON.stringify(item.achievementsZh || item.achievements || []),
          achievementsEn: JSON.stringify(item.achievementsEn || []),
          type: item.type || 'work',
          order: i,
        }
      });
    }

    return NextResponse.json({ success: true, message: '时间线已保存' });
  } catch (error: any) {
    console.error('Timeline POST error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
