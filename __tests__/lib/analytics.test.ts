// Mock prisma before importing
const mockPrisma = {
  $queryRaw: jest.fn().mockResolvedValue([]),
  visit: {
    create: jest.fn(),
    count: jest.fn(),
    groupBy: jest.fn(),
  },
};

jest.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}));

import { recordVisit, getAnalyticsStats, getPageViews, getTodayVisits } from '@/lib/analytics';

describe('analytics.ts - 访问统计', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('recordVisit', () => {
    it('UT-AN-01: 应正确记录访问', async () => {
      mockPrisma.visit.create.mockResolvedValueOnce({ id: '1' });
      await recordVisit({ path: '/zh', userAgent: 'Mozilla/5.0' });
      expect(mockPrisma.visit.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ path: '/zh' }),
        })
      );
    });

    it('UT-AN-02: IPv4 地址应被匿名化', async () => {
      mockPrisma.visit.create.mockResolvedValueOnce({ id: '1' });
      await recordVisit({ path: '/zh', ip: '192.168.1.100' });
      expect(mockPrisma.visit.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ ip: '192.168.1.0' }),
        })
      );
    });

    it('UT-AN-03: IPv6 地址应被匿名化', async () => {
      mockPrisma.visit.create.mockResolvedValueOnce({ id: '1' });
      await recordVisit({ path: '/zh', ip: '2001:0db8:85a3:0000:0000:8a2e:0370:7334' });
      expect(mockPrisma.visit.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ ip: '2001:0db8:85a3:0000::' }),
        })
      );
    });

    it('UT-AN-01b: 无 IP 时不应设置 ip 字段', async () => {
      mockPrisma.visit.create.mockResolvedValueOnce({ id: '1' });
      await recordVisit({ path: '/zh' });
      expect(mockPrisma.visit.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ ip: undefined }),
        })
      );
    });

    it('UT-AN-01c: 数据库错误时不应抛出异常', async () => {
      mockPrisma.visit.create.mockRejectedValueOnce(new Error('DB Error'));
      await expect(recordVisit({ path: '/zh' })).resolves.not.toThrow();
    });
  });

  describe('getAnalyticsStats', () => {
    it('UT-AN-04: 应返回完整的统计数据结构', async () => {
      mockPrisma.visit.count.mockResolvedValueOnce(100);
      mockPrisma.$queryRaw.mockResolvedValueOnce([{ date: new Date(), count: BigInt(10) }]);
      mockPrisma.visit.groupBy
        .mockResolvedValueOnce([{ path: '/zh', _count: { id: 50 } }])
        .mockResolvedValueOnce([{ referer: 'https://google.com', _count: { id: 30 } }])
        .mockResolvedValueOnce([{ country: 'CN', _count: { id: 80 } }]);

      const stats = await getAnalyticsStats(30);
      expect(stats).toHaveProperty('totalVisits', 100);
      expect(stats).toHaveProperty('dailyVisits');
      expect(stats.dailyVisits).toEqual([{ date: expect.any(Date), count: 10 }]);
      expect(stats).toHaveProperty('popularPages');
      expect(stats).toHaveProperty('refererStats');
      expect(stats).toHaveProperty('countryStats');
    });

    it('UT-AN-05: 应使用默认30天参数', async () => {
      mockPrisma.visit.count.mockResolvedValue(0);
      mockPrisma.$queryRaw.mockResolvedValue([]);
      mockPrisma.visit.groupBy.mockResolvedValue([]);

      await getAnalyticsStats();
      expect(mockPrisma.visit.count).toHaveBeenCalled();
    });
  });

  describe('getPageViews', () => {
    it('UT-AN-09: 应返回页面浏览量', async () => {
      mockPrisma.visit.count.mockResolvedValueOnce(42);
      const views = await getPageViews('/zh/about');
      expect(views).toBe(42);
      expect(mockPrisma.visit.count).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ path: '/zh/about' }),
        })
      );
    });
  });

  describe('getTodayVisits', () => {
    it('UT-AN-08: 应返回今日访问量', async () => {
      mockPrisma.visit.count.mockResolvedValueOnce(15);
      const visits = await getTodayVisits();
      expect(visits).toBe(15);
    });
  });
});
