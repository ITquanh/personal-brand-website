// Mock next/server
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
  $queryRaw: jest.fn().mockResolvedValue([]),
  visit: { create: jest.fn(), count: jest.fn(), groupBy: jest.fn() },
};

jest.mock('@/lib/prisma', () => ({ prisma: mockPrisma }));
jest.mock('@/lib/auth', () => ({ auth: jest.fn() }));
jest.mock('@/lib/storage', () => ({
  uploadImage: jest.fn().mockResolvedValue('https://blob.example.com/img.jpg'),
  uploadMarkdown: jest.fn().mockResolvedValue('https://blob.example.com/md/test.md'),
  uploadFile: jest.fn().mockResolvedValue('https://blob.example.com/file.txt'),
  deleteFile: jest.fn().mockResolvedValue(undefined),
  listFiles: jest.fn().mockResolvedValue([]),
}));

import { auth } from '@/lib/auth';

function createRequest(url: string, init?: { method?: string; body?: string }) {
  const { NextRequest } = require('next/server');
  return new NextRequest(url, init);
}

describe('API /api/analytics - 访问统计', () => {
  beforeEach(() => jest.clearAllMocks());

  it('API-AN-01: POST 应记录访问', async () => {
    mockPrisma.visit.create.mockResolvedValueOnce({ id: '1' });
    const { POST } = await import('@/app/api/analytics/route');
    const req = createRequest('http://localhost/api/analytics', {
      method: 'POST',
      body: JSON.stringify({ path: '/zh' }),
    });
    const res = await POST(req);
    const data = await res.json();
    expect(data.success).toBe(true);
  });

  it('API-AN-03: 未认证 GET 应返回 401', async () => {
    (auth as jest.Mock).mockResolvedValueOnce(null);
    const { GET } = await import('@/app/api/analytics/route');
    const req = createRequest('http://localhost/api/analytics');
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it('API-AN-02: 管理员 GET 应返回统计数据', async () => {
    (auth as jest.Mock).mockResolvedValueOnce({ user: { id: '1' } });
    mockPrisma.visit.count.mockResolvedValue(100);
    mockPrisma.$queryRaw.mockResolvedValue([]);
    mockPrisma.visit.groupBy.mockResolvedValue([]);
    const { GET } = await import('@/app/api/analytics/route');
    const req = createRequest('http://localhost/api/analytics?days=7');
    const res = await GET(req);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.data).toHaveProperty('totalVisits');
    expect(data.data).toHaveProperty('todayVisits');
  });
});

describe('API /api/translate - 翻译服务', () => {
  beforeEach(() => jest.clearAllMocks());

  it('API-TR-06: GET 应返回服务状态', async () => {
    const { GET } = await import('@/app/api/translate/route');
    const req = createRequest('http://localhost/api/translate');
    const res = await GET(req);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.data).toHaveProperty('providers');
    expect(data.data).toHaveProperty('rateLimit');
  });

  it('API-TR-04: 未认证 POST 应返回 401', async () => {
    (auth as jest.Mock).mockResolvedValueOnce(null);
    const { POST } = await import('@/app/api/translate/route');
    const req = createRequest('http://localhost/api/translate', {
      method: 'POST',
      body: JSON.stringify({ text: '你好', targetLang: 'en' }),
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('API-TR-05: 缺少必填字段应返回 400', async () => {
    (auth as jest.Mock).mockResolvedValueOnce({ user: { id: '1' } });
    const { POST } = await import('@/app/api/translate/route');
    const req = createRequest('http://localhost/api/translate', {
      method: 'POST',
      body: JSON.stringify({ text: '你好' }),
    });
    const res = await POST(req);
    const data = await res.json();
    expect(res.status).toBe(400);
  });
});

describe('API /api/upload/image - 图片上传', () => {
  beforeEach(() => jest.clearAllMocks());

  it('API-UIMG-05: GET 应返回上传配置', async () => {
    const { GET } = await import('@/app/api/upload/image/route');
    const req = createRequest('http://localhost/api/upload/image');
    const res = await GET(req);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.data.maxFileSize).toBe(5 * 1024 * 1024);
    expect(data.data.allowedTypes).toContain('image/jpeg');
  });
});
