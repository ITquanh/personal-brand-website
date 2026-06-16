import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { recordVisit, getAnalyticsStats, getPageViews, getTodayVisits } from '@/lib/analytics';

// POST /api/analytics - 记录访问
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 获取客户端信息
    const userAgent = request.headers.get('user-agent') || undefined;
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : undefined;
    const referer = request.headers.get('referer') || undefined;

    await recordVisit({
      path: body.path,
      userAgent,
      ip,
      referer,
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error('记录访问失败:', error);
    return NextResponse.json(
      { success: false, error: '记录访问失败' },
      { status: 500 }
    );
  }
}

// GET /api/analytics - 获取统计数据
export async function GET(request: NextRequest) {
  try {
    // 验证管理员权限
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: '未授权访问' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');
    const path = searchParams.get('path');

    // 如果指定了path，返回该页面的访问量
    if (path) {
      const views = await getPageViews(path);
      return NextResponse.json({
        success: true,
        data: { views },
      });
    }

    // 返回统计数据
    const stats = await getAnalyticsStats(days);
    const todayVisits = await getTodayVisits();

    return NextResponse.json({
      success: true,
      data: {
        ...stats,
        todayVisits,
      },
    });
  } catch (error) {
    console.error('获取统计数据失败:', error);
    return NextResponse.json(
      { success: false, error: '获取统计数据失败' },
      { status: 500 }
    );
  }
}
