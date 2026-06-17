import { prisma } from './prisma';

interface VisitData {
  path: string;
  userAgent?: string;
  ip?: string;
  country?: string;
  referer?: string;
}

// 记录访问
export async function recordVisit(data: VisitData): Promise<void> {
  try {
    await prisma.visit.create({
      data: {
        path: data.path,
        userAgent: data.userAgent,
        ip: data.ip ? anonymizeIP(data.ip) : undefined,
        country: data.country,
        referer: data.referer,
      },
    });
  } catch (error) {
    console.error('记录访问失败:', error);
    throw error;
  }
}

// IP地址匿名化（隐私保护）
function anonymizeIP(ip: string): string {
  // IPv4: 192.168.1.1 -> 192.168.1.0
  // IPv6: 只保留前64位
  if (ip.includes('.')) {
    const parts = ip.split('.');
    parts[3] = '0';
    return parts.join('.');
  } else if (ip.includes(':')) {
    const parts = ip.split(':');
    return parts.slice(0, 4).join(':') + '::';
  }
  return ip;
}

// 获取统计数据
export async function getAnalyticsStats(days: number = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // 总访问量
  const totalVisits = await prisma.visit.count({
    where: {
      createdAt: {
        gte: startDate,
      },
    },
  });

  // 每日访问量（使用原始查询按日期分组，而非完整时间戳）
  const dailyVisitsRaw = await prisma.$queryRaw<{ date: Date; count: bigint }[]>`
    SELECT DATE("createdAt") as date, COUNT(id) as count
    FROM "Visit"
    WHERE "createdAt" >= ${startDate}
    GROUP BY DATE("createdAt")
    ORDER BY date ASC
  `;

  const dailyVisits = dailyVisitsRaw.map((item) => ({
    date: item.date,
    count: Number(item.count),
  }));

  // 热门页面
  const popularPages = await prisma.visit.groupBy({
    by: ['path'],
    where: {
      createdAt: {
        gte: startDate,
      },
    },
    _count: {
      id: true,
    },
    orderBy: {
      _count: {
        id: 'desc',
      },
    },
    take: 10,
  });

  // 来源统计
  const refererStats = await prisma.visit.groupBy({
    by: ['referer'],
    where: {
      createdAt: {
        gte: startDate,
      },
      referer: {
        not: null,
      },
    },
    _count: {
      id: true,
    },
    orderBy: {
      _count: {
        id: 'desc',
      },
    },
    take: 10,
  });

  // 国家统计
  const countryStats = await prisma.visit.groupBy({
    by: ['country'],
    where: {
      createdAt: {
        gte: startDate,
      },
      country: {
        not: null,
      },
    },
    _count: {
      id: true,
    },
    orderBy: {
      _count: {
        id: 'desc',
      },
    },
    take: 10,
  });

  return {
    totalVisits,
    dailyVisits, // 已经是 { date, count } 格式
    popularPages: popularPages.map((item) => ({
      path: item.path,
      count: item._count.id,
    })),
    refererStats: refererStats.map((item) => ({
      referer: item.referer,
      count: item._count.id,
    })),
    countryStats: countryStats.map((item) => ({
      country: item.country,
      count: item._count.id,
    })),
  };
}

// 获取页面访问量
export async function getPageViews(path: string): Promise<number> {
  const result = await prisma.visit.count({
    where: {
      path,
    },
  });

  return result;
}

// 获取今日访问量
export async function getTodayVisits(): Promise<number> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const result = await prisma.visit.count({
    where: {
      createdAt: {
        gte: today,
      },
    },
  });

  return result;
}
