import { translate, translateBatch } from '@/lib/translate';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('translate.ts - 翻译服务', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockReset();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('无 API 密钥', () => {
    it('UT-TR-07: 无 API 密钥时应返回错误', async () => {
      delete process.env.DEEPSEEK_API_KEY;
      delete process.env.DEEPL_API_KEY;
      const result = await translate({ text: '你好', targetLang: 'en' });
      expect(result.success).toBe(false);
      expect(result.error).toContain('No translation API configured');
    });
  });

  describe('Deepseek 翻译', () => {
    beforeEach(() => {
      process.env.DEEPSEEK_API_KEY = 'test-deepseek-key';
      delete process.env.DEEPL_API_KEY;
    });

    it('UT-TR-01: 应调用 Deepseek API 并返回翻译结果', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: 'Hello World' } }],
        }),
      });

      const result = await translate({ text: '你好世界', targetLang: 'en' });
      expect(result.success).toBe(true);
      expect(result.translated).toBe('Hello World');
      expect(result.provider).toBe('deepseek');
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.deepseek.com/v1/chat/completions',
        expect.objectContaining({ method: 'POST' })
      );
    });

    it('UT-TR-08: Deepseek API 失败时应返回错误', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        text: async () => 'API Error',
      });

      const result = await translate({ text: '你好', targetLang: 'en' });
      expect(result.success).toBe(false);
      expect(result.error).toContain('Deepseek API error');
    });

    it('UT-TR-08b: Deepseek 网络异常时应返回错误', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await translate({ text: '你好', targetLang: 'en' });
      expect(result.success).toBe(false);
      expect(result.error).toContain('Deepseek API request failed');
    });
  });

  describe('DeepL 翻译（回退）', () => {
    beforeEach(() => {
      delete process.env.DEEPSEEK_API_KEY;
      process.env.DEEPL_API_KEY = 'test-deepl-key';
    });

    it('UT-TR-02: Deepseek 不可用时应回退到 DeepL', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          translations: [{ text: 'Hello World' }],
        }),
      });

      const result = await translate({ text: '你好世界', targetLang: 'en' });
      expect(result.success).toBe(true);
      expect(result.translated).toBe('Hello World');
      expect(result.provider).toBe('deepl');
    });

    it('UT-TR-02b: DeepL API 失败时应返回错误', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        text: async () => 'DeepL Error',
      });

      const result = await translate({ text: '你好', targetLang: 'en' });
      expect(result.success).toBe(false);
      expect(result.error).toContain('DeepL API error');
    });
  });

  describe('限流机制', () => {
    beforeEach(() => {
      process.env.DEEPSEEK_API_KEY = 'test-key';
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: 'translated' } }],
        }),
      });
    });

    it('UT-TR-04: 10次/分钟内应正常处理', async () => {
      for (let i = 0; i < 10; i++) {
        const result = await translate({ text: `text ${i}`, targetLang: 'en' }, 'user1');
        expect(result.success).toBe(true);
      }
    });

    it('UT-TR-05: 超过10次/分钟应被限流', async () => {
      // 消耗配额
      for (let i = 0; i < 10; i++) {
        await translate({ text: `text ${i}`, targetLang: 'en' }, 'user2');
      }
      // 第11个请求应被限流
      const result = await translate({ text: 'excess', targetLang: 'en' }, 'user2');
      expect(result.success).toBe(false);
      expect(result.error).toContain('Rate limit');
    });
  });

  describe('translateBatch', () => {
    beforeEach(() => {
      process.env.DEEPSEEK_API_KEY = 'test-key';
    });

    it('UT-TR-03: 批量翻译应返回所有结果', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ choices: [{ message: { content: 'Hello' } }] }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ choices: [{ message: { content: 'World' } }] }),
        });

      const results = await translateBatch(['你好', '世界'], 'en', 'user3');
      expect(results).toHaveLength(2);
      expect(results[0].translated).toBe('Hello');
      expect(results[1].translated).toBe('World');
    });

    it('UT-TR-03b: 批量翻译失败时应停止后续翻译', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        text: async () => 'Error',
      });

      const results = await translateBatch(['你好', '世界'], 'en', 'user4');
      expect(results).toHaveLength(1);
      expect(results[0].success).toBe(false);
    });
  });
});
