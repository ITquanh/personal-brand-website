// Mock NextRequest/NextResponse
jest.mock('next/server', () => {
  class MockNextRequest {
    url: string; method: string; _body: string | null; headers: Map<string, string>;
    constructor(url: string, init?: { method?: string; body?: string }) {
      this.url = url; this.method = init?.method || 'GET'; this._body = init?.body || null; this.headers = new Map();
    }
    async json() { return this._body ? JSON.parse(this._body) : {}; }
  }
  class MockNextResponse {
    _body: any; _status: number;
    constructor(body: any, init?: { status?: number }) { this._body = body; this._status = init?.status || 200; }
    get status() { return this._status; }
    async json() { return this._body; }
    static json(body: any, init?: { status?: number }) { return new MockNextResponse(body, init); }
  }
  return { NextRequest: MockNextRequest, NextResponse: MockNextResponse };
});

const mockPrisma = {
  post: { findMany: jest.fn(), count: jest.fn(), findUnique: jest.fn(), findFirst: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
  skill: { findMany: jest.fn(), findUnique: jest.fn(), findFirst: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
};

jest.mock('@/lib/prisma', () => ({ prisma: mockPrisma }));
jest.mock('@/lib/auth', () => ({ auth: jest.fn() }));

import { auth } from '@/lib/auth';

// Helper to create mock requests
function createRequest(url: string, init?: { method?: string; body?: string }) {
  const { NextRequest } = require('next/server');
  return new NextRequest(url, init);
}

// ============ Posts API ============
describe('API /api/posts - 文章 CRUD', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('GET /api/posts', () => {
    it('API-POST-01: 应返回文章列表', async () => {
      mockPrisma.post.findMany.mockResolvedValueOnce([
        { id: '1', slug: 'post1', titleZh: '文章1', titleEn: null, summaryZh: '摘要', summaryEn: null, tags: ['AI'], imageUrl: null, published: true, readTime: 5, viewCount: 10, translationStatus: 'translated', createdAt: new Date(), updatedAt: new Date() },
      ]);
      mockPrisma.post.count.mockResolvedValueOnce(1);

      const { GET } = await import('@/app/api/posts/route');
      const req = createRequest('http://localhost/api/posts');
      const res = await GET(req);
      const data = await res.json();

      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(1);
    });

    it('API-POST-04: 默认应只返回已发布文章', async () => {
      mockPrisma.post.findMany.mockResolvedValueOnce([]);
      mockPrisma.post.count.mockResolvedValueOnce(0);

      const { GET } = await import('@/app/api/posts/route');
      const req = createRequest('http://localhost/api/posts');
      await GET(req);

      expect(mockPrisma.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ published: true }),
        })
      );
    });

    it('API-POST-02: tag 筛选应正确传递', async () => {
      mockPrisma.post.findMany.mockResolvedValueOnce([]);
      mockPrisma.post.count.mockResolvedValueOnce(0);

      const { GET } = await import('@/app/api/posts/route');
      const req = createRequest('http://localhost/api/posts?tag=AI');
      await GET(req);

      expect(mockPrisma.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ tags: { contains: '"AI"' } }),
        })
      );
    });
  });

  describe('POST /api/posts', () => {
    it('API-POST-06: 未认证应返回 401', async () => {
      (auth as jest.Mock).mockResolvedValueOnce(null);
      const { POST } = await import('@/app/api/posts/route');
      const req = createRequest('http://localhost/api/posts', { method: 'POST', body: JSON.stringify({}) });
      const res = await POST(req);
      expect(res.status).toBe(401);
    });

    it('API-POST-07: 缺少必填字段应返回 400', async () => {
      (auth as jest.Mock).mockResolvedValueOnce({ user: { id: '1' } });
      const { POST } = await import('@/app/api/posts/route');
      const req = createRequest('http://localhost/api/posts', { method: 'POST', body: JSON.stringify({ titleZh: '测试' }) });
      const res = await POST(req);
      expect(res.status).toBe(400);
    });

    it('API-POST-05: 管理员创建文章应成功', async () => {
      (auth as jest.Mock).mockResolvedValueOnce({ user: { id: '1' } });
      mockPrisma.post.findUnique.mockResolvedValueOnce(null);
      mockPrisma.post.create.mockResolvedValueOnce({ id: '1', slug: 'new-post', titleZh: '新文章' });
      const { POST } = await import('@/app/api/posts/route');
      const req = createRequest('http://localhost/api/posts', {
        method: 'POST',
        body: JSON.stringify({ titleZh: '新文章', contentZh: '内容'.repeat(100), slug: 'new-post' }),
      });
      const res = await POST(req);
      const data = await res.json();
      expect(res.status).toBe(201);
      expect(data.success).toBe(true);
    });
  });

  describe('GET /api/posts/[id]', () => {
    it('API-POST-09: 按 slug 获取文章并增加 viewCount', async () => {
      mockPrisma.post.findFirst.mockResolvedValueOnce({
        id: '1', slug: 'post1', titleZh: '文章1', titleEn: null,
        contentZh: '内容', contentEn: null, summaryZh: '摘要', summaryEn: null,
        tags: [], imageUrl: null, published: true, readTime: 5, viewCount: 10,
        translationStatus: 'translated', createdAt: new Date(), updatedAt: new Date(),
      });
      mockPrisma.post.update.mockResolvedValueOnce({});
      const { GET } = await import('@/app/api/posts/[id]/route');
      const req = createRequest('http://localhost/api/posts/post1');
      const res = await GET(req, { params: Promise.resolve({ id: 'post1' }) });
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.data.viewCount).toBe(11); // 10 + 1
      expect(mockPrisma.post.update).toHaveBeenCalled();
    });

    it('API-POST-11: 不存在的文章应返回 404', async () => {
      mockPrisma.post.findFirst.mockResolvedValueOnce(null);
      const { GET } = await import('@/app/api/posts/[id]/route');
      const req = createRequest('http://localhost/api/posts/999');
      const res = await GET(req, { params: Promise.resolve({ id: '999' }) });
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/posts/[id]', () => {
    it('API-POST-14: 管理员删除文章应成功', async () => {
      (auth as jest.Mock).mockResolvedValueOnce({ user: { id: '1' } });
      mockPrisma.post.findFirst.mockResolvedValueOnce({ id: '1' });
      mockPrisma.post.delete.mockResolvedValueOnce({});
      const { DELETE } = await import('@/app/api/posts/[id]/route');
      const req = createRequest('http://localhost/api/posts/1', { method: 'DELETE' });
      const res = await DELETE(req, { params: Promise.resolve({ id: '1' }) });
      const data = await res.json();
      expect(data.success).toBe(true);
    });
  });
});

// ============ Skills API ============
describe('API /api/skills - 技术栈 CRUD', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('GET /api/skills', () => {
    it('API-SKILL-01: 应返回技能列表', async () => {
      mockPrisma.skill.findMany.mockResolvedValueOnce([
        { id: '1', name: 'Python', category: '后端', proficiency: 90 },
      ]);
      const { GET } = await import('@/app/api/skills/route');
      const req = createRequest('http://localhost/api/skills');
      const res = await GET(req);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(1);
    });

    it('API-SKILL-02: category 筛选应正确传递', async () => {
      mockPrisma.skill.findMany.mockResolvedValueOnce([]);
      const { GET } = await import('@/app/api/skills/route');
      const req = createRequest('http://localhost/api/skills?category=AI工具');
      await GET(req);
      expect(mockPrisma.skill.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ category: 'AI工具' }),
        })
      );
    });
  });

  describe('POST /api/skills', () => {
    it('API-SKILL-09: 未认证应返回 401', async () => {
      (auth as jest.Mock).mockResolvedValueOnce(null);
      const { POST } = await import('@/app/api/skills/route');
      const req = createRequest('http://localhost/api/skills', { method: 'POST', body: JSON.stringify({}) });
      const res = await POST(req);
      expect(res.status).toBe(401);
    });

    it('API-SKILL-03: 管理员创建技能应成功', async () => {
      (auth as jest.Mock).mockResolvedValueOnce({ user: { id: '1' } });
      mockPrisma.skill.findUnique.mockResolvedValueOnce(null);
      mockPrisma.skill.create.mockResolvedValueOnce({ id: '1', name: 'Rust', category: '后端', proficiency: 60 });
      const { POST } = await import('@/app/api/skills/route');
      const req = createRequest('http://localhost/api/skills', {
        method: 'POST',
        body: JSON.stringify({ name: 'Rust', category: '后端', proficiency: 60 }),
      });
      const res = await POST(req);
      const data = await res.json();
      expect(res.status).toBe(201);
      expect(data.success).toBe(true);
    });

    it('API-SKILL-04: 熟练度超出范围应返回 400', async () => {
      (auth as jest.Mock).mockResolvedValueOnce({ user: { id: '1' } });
      mockPrisma.skill.findUnique.mockResolvedValueOnce(null);
      const { POST } = await import('@/app/api/skills/route');
      const req = createRequest('http://localhost/api/skills', {
        method: 'POST',
        body: JSON.stringify({ name: 'Test', category: '后端', proficiency: 150 }),
      });
      const res = await POST(req);
      const data = await res.json();
      expect(res.status).toBe(400);
      expect(data.error).toContain('1-100');
    });

    it('API-SKILL-05: 重复名称应返回 400', async () => {
      (auth as jest.Mock).mockResolvedValueOnce({ user: { id: '1' } });
      mockPrisma.skill.findUnique.mockResolvedValueOnce({ id: 'existing' });
      const { POST } = await import('@/app/api/skills/route');
      const req = createRequest('http://localhost/api/skills', {
        method: 'POST',
        body: JSON.stringify({ name: 'Python', category: '后端', proficiency: 90 }),
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
    });
  });
});
