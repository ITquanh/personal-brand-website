// Mock NextRequest - 在 Jest jsdom 环境中 next/server 不可用
jest.mock('next/server', () => {
  class MockNextRequest {
    url: string;
    method: string;
    _body: string | null;
    headers: Map<string, string>;

    constructor(url: string, init?: { method?: string; body?: string }) {
      this.url = url;
      this.method = init?.method || 'GET';
      this._body = init?.body || null;
      this.headers = new Map();
    }

    async json() {
      return this._body ? JSON.parse(this._body) : {};
    }
  }

  class MockNextResponse {
    _body: any;
    _status: number;

    constructor(body: any, init?: { status?: number }) {
      this._body = body;
      this._status = init?.status || 200;
    }

    get status() { return this._status; }

    async json() { return this._body; }

    static json(body: any, init?: { status?: number }) {
      return new MockNextResponse(body, init);
    }
  }

  return {
    NextRequest: MockNextRequest,
    NextResponse: MockNextResponse,
  };
});

// Mock prisma
const mockPrisma = {
  project: {
    findMany: jest.fn(),
    count: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

jest.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}));

// Mock auth
jest.mock('@/lib/auth', () => ({
  auth: jest.fn(),
}));

import { auth } from '@/lib/auth';

describe('API /api/projects - 项目 CRUD', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('GET /api/projects', () => {
    it('API-PROJ-01: 应返回分页的项目列表', async () => {
      const mockProjects = [
        { id: '1', slug: 'proj1', titleZh: '项目1', titleEn: 'Project 1', summaryZh: '摘要', summaryEn: null, techStack: ['React'], architectureZh: null, architectureEn: null, quantifiedImpact: null, githubUrl: null, demoUrl: null, imageUrl: null, isFeatured: false, translationStatus: 'translated', createdAt: new Date(), updatedAt: new Date() },
      ];
      mockPrisma.project.findMany.mockResolvedValueOnce(mockProjects);
      mockPrisma.project.count.mockResolvedValueOnce(1);

      const { GET } = await import('@/app/api/projects/route');
      const req = new (require('next/server').NextRequest)('http://localhost/api/projects?page=1&limit=10');
      const res = await GET(req);
      const data = await res.json();

      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(1);
      expect(data.pagination.total).toBe(1);
    });

    it('API-PROJ-04: featured=true 应筛选精选项目', async () => {
      mockPrisma.project.findMany.mockResolvedValueOnce([]);
      mockPrisma.project.count.mockResolvedValueOnce(0);

      const { GET } = await import('@/app/api/projects/route');
      const req = new (require('next/server').NextRequest)('http://localhost/api/projects?featured=true');
      await GET(req);

      expect(mockPrisma.project.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ isFeatured: true }),
        })
      );
    });

    it('API-PROJ-05: locale=en 应返回英文字段', async () => {
      mockPrisma.project.findMany.mockResolvedValueOnce([
        { id: '1', slug: 'p1', titleZh: '中文', titleEn: 'English', summaryZh: '摘要', summaryEn: 'Summary', techStack: [], architectureZh: null, architectureEn: null, quantifiedImpact: null, githubUrl: null, demoUrl: null, imageUrl: null, isFeatured: false, translationStatus: 'translated', createdAt: new Date(), updatedAt: new Date() },
      ]);
      mockPrisma.project.count.mockResolvedValueOnce(1);

      const { GET } = await import('@/app/api/projects/route');
      const req = new (require('next/server').NextRequest)('http://localhost/api/projects?locale=en');
      const res = await GET(req);
      const data = await res.json();

      expect(data.data[0].title).toBe('English');
    });
  });

  describe('POST /api/projects', () => {
    it('API-PROJ-08: 未认证应返回 401', async () => {
      (auth as jest.Mock).mockResolvedValueOnce(null);

      const { POST } = await import('@/app/api/projects/route');
      const req = new (require('next/server').NextRequest)('http://localhost/api/projects', {
        method: 'POST',
        body: JSON.stringify({ titleZh: '测试', summaryZh: '摘要', slug: 'test' }),
      });
      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(401);
    });

    it('API-PROJ-10: 缺少必填字段应返回 400', async () => {
      (auth as jest.Mock).mockResolvedValueOnce({ user: { id: '1' } });

      const { POST } = await import('@/app/api/projects/route');
      const req = new (require('next/server').NextRequest)('http://localhost/api/projects', {
        method: 'POST',
        body: JSON.stringify({ titleZh: '测试' }),
      });
      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error).toBe('缺少必填字段');
    });

    it('API-PROJ-07: 管理员创建项目应成功', async () => {
      (auth as jest.Mock).mockResolvedValueOnce({ user: { id: '1' } });
      mockPrisma.project.findUnique.mockResolvedValueOnce(null);
      mockPrisma.project.create.mockResolvedValueOnce({
        id: '1', slug: 'new-project', titleZh: '新项目',
      });

      const { POST } = await import('@/app/api/projects/route');
      const req = new (require('next/server').NextRequest)('http://localhost/api/projects', {
        method: 'POST',
        body: JSON.stringify({ titleZh: '新项目', summaryZh: '摘要', slug: 'new-project' }),
      });
      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(201);
      expect(data.success).toBe(true);
    });

    it('API-PROJ-11: 重复 slug 应返回 400', async () => {
      (auth as jest.Mock).mockResolvedValueOnce({ user: { id: '1' } });
      mockPrisma.project.findUnique.mockResolvedValueOnce({ id: 'existing' });

      const { POST } = await import('@/app/api/projects/route');
      const req = new (require('next/server').NextRequest)('http://localhost/api/projects', {
        method: 'POST',
        body: JSON.stringify({ titleZh: '测试', summaryZh: '摘要', slug: 'existing' }),
      });
      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/projects/[id]', () => {
    it('API-PROJ-14: 不存在的项目应返回 404', async () => {
      mockPrisma.project.findFirst.mockResolvedValueOnce(null);

      const { GET } = await import('@/app/api/projects/[id]/route');
      const req = new (require('next/server').NextRequest)('http://localhost/api/projects/999');
      const res = await GET(req, { params: Promise.resolve({ id: '999' }) });
      const data = await res.json();

      expect(res.status).toBe(404);
      expect(data.error).toBe('项目不存在');
    });

    it('API-PROJ-12: 按 slug 获取项目详情', async () => {
      mockPrisma.project.findFirst.mockResolvedValueOnce({
        id: '1', slug: 'proj1', titleZh: '项目1', titleEn: null,
        summaryZh: '摘要', summaryEn: null, techStack: ['React'],
        architectureZh: null, architectureEn: null, quantifiedImpact: null,
        githubUrl: null, demoUrl: null, imageUrl: null, isFeatured: false,
        translationStatus: 'translated', createdAt: new Date(), updatedAt: new Date(),
      });

      const { GET } = await import('@/app/api/projects/[id]/route');
      const req = new (require('next/server').NextRequest)('http://localhost/api/projects/proj1');
      const res = await GET(req, { params: Promise.resolve({ id: 'proj1' }) });
      const data = await res.json();

      expect(data.success).toBe(true);
      expect(data.data.title).toBe('项目1');
    });
  });

  describe('DELETE /api/projects/[id]', () => {
    it('API-PROJ-18: 管理员删除项目应成功', async () => {
      (auth as jest.Mock).mockResolvedValueOnce({ user: { id: '1' } });
      mockPrisma.project.findFirst.mockResolvedValueOnce({ id: '1' });
      mockPrisma.project.delete.mockResolvedValueOnce({});

      const { DELETE } = await import('@/app/api/projects/[id]/route');
      const req = new (require('next/server').NextRequest)('http://localhost/api/projects/1', { method: 'DELETE' });
      const res = await DELETE(req, { params: Promise.resolve({ id: '1' }) });
      const data = await res.json();

      expect(data.success).toBe(true);
    });

    it('API-PROJ-20: 删除不存在的项目应返回 404', async () => {
      (auth as jest.Mock).mockResolvedValueOnce({ user: { id: '1' } });
      mockPrisma.project.findFirst.mockResolvedValueOnce(null);

      const { DELETE } = await import('@/app/api/projects/[id]/route');
      const req = new (require('next/server').NextRequest)('http://localhost/api/projects/999', { method: 'DELETE' });
      const res = await DELETE(req, { params: Promise.resolve({ id: '999' }) });
      const data = await res.json();

      expect(res.status).toBe(404);
    });
  });
});
