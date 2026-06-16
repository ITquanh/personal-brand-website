import { generateWebsiteJsonLd, generatePersonJsonLd, generateArticleJsonLd, generateProjectJsonLd } from '@/lib/seo';

// siteUrl 是模块级常量，取值为 process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com';

describe('seo.ts - JSON-LD 生成', () => {
  describe('generateWebsiteJsonLd', () => {
    it('UT-SEO-01: 应生成正确的 WebSite JSON-LD', () => {
      const result = generateWebsiteJsonLd('zh');
      expect(result['@context']).toBe('https://schema.org');
      expect(result['@type']).toBe('WebSite');
      expect(result.name).toBe('个人技术品牌网站');
      expect(result.url).toBe(SITE_URL);
      expect(result.inLanguage).toBe('zh-CN');
    });

    it('UT-SEO-01b: 英文 locale 应返回 en-US', () => {
      const result = generateWebsiteJsonLd('en');
      expect(result.inLanguage).toBe('en-US');
    });

    it('UT-SEO-01c: 应包含 SearchAction', () => {
      const result = generateWebsiteJsonLd();
      expect(result.potentialAction).toBeDefined();
      expect(result.potentialAction['@type']).toBe('SearchAction');
    });

    it('UT-SEO-01d: 默认 locale 应为 zh', () => {
      const result = generateWebsiteJsonLd();
      expect(result.inLanguage).toBe('zh-CN');
    });
  });

  describe('generatePersonJsonLd', () => {
    it('UT-SEO-02: 应生成正确的 Person JSON-LD', () => {
      const result = generatePersonJsonLd();
      expect(result['@context']).toBe('https://schema.org');
      expect(result['@type']).toBe('Person');
      expect(result.url).toBe(SITE_URL);
      expect(result.jobTitle).toBe('全栈开发者');
      expect(result.sameAs).toBeInstanceOf(Array);
      expect(result.knowsAbout).toBeInstanceOf(Array);
    });

    it('UT-SEO-02b: 应包含 GitHub 和 LinkedIn 链接', () => {
      const result = generatePersonJsonLd();
      expect(result.sameAs.some((url: string) => url.includes('github.com'))).toBe(true);
      expect(result.knowsAbout.length).toBeGreaterThan(0);
    });
  });

  describe('generateArticleJsonLd', () => {
    it('UT-SEO-03: 应生成正确的 Article JSON-LD', () => {
      const article = {
        title: 'AI 编程指南',
        description: '深入探讨 AI 编程',
        publishedTime: '2026-01-01T00:00:00Z',
        author: 'Test Author',
        url: 'https://test.example.com/blog/ai-guide',
      };
      const result = generateArticleJsonLd(article);
      expect(result['@context']).toBe('https://schema.org');
      expect(result['@type']).toBe('Article');
      expect(result.headline).toBe('AI 编程指南');
      expect(result.description).toBe('深入探讨 AI 编程');
      expect(result.datePublished).toBe('2026-01-01T00:00:00Z');
      expect(result.author.name).toBe('Test Author');
    });

    it('UT-SEO-03b: 无 modifiedTime 时应使用 publishedTime', () => {
      const article = {
        title: 'Test',
        description: 'Desc',
        publishedTime: '2026-01-01T00:00:00Z',
        author: 'Author',
        url: 'https://example.com',
      };
      const result = generateArticleJsonLd(article);
      expect(result.dateModified).toBe('2026-01-01T00:00:00Z');
    });

    it('UT-SEO-03c: 有 modifiedTime 时应使用 modifiedTime', () => {
      const article = {
        title: 'Test',
        description: 'Desc',
        publishedTime: '2026-01-01T00:00:00Z',
        modifiedTime: '2026-06-01T00:00:00Z',
        author: 'Author',
        url: 'https://example.com',
      };
      const result = generateArticleJsonLd(article);
      expect(result.dateModified).toBe('2026-06-01T00:00:00Z');
    });

    it('UT-SEO-03d: 应包含 image（如有）', () => {
      const article = {
        title: 'Test',
        description: 'Desc',
        image: 'https://example.com/image.jpg',
        publishedTime: '2026-01-01T00:00:00Z',
        author: 'Author',
        url: 'https://example.com',
      };
      const result = generateArticleJsonLd(article);
      expect(result.image).toBe('https://example.com/image.jpg');
    });
  });

  describe('generateProjectJsonLd', () => {
    it('UT-SEO-04: 应生成正确的 Project JSON-LD', () => {
      const project = {
        name: 'StarMind',
        description: 'AI 思维管理工具',
        technologies: ['Next.js', 'TypeScript'],
      };
      const result = generateProjectJsonLd(project);
      expect(result['@context']).toBe('https://schema.org');
      expect(result['@type']).toBe('SoftwareApplication');
      expect(result.name).toBe('StarMind');
      expect(result.description).toBe('AI 思维管理工具');
      expect(result.programmingLanguage).toEqual(['Next.js', 'TypeScript']);
      expect(result.applicationCategory).toBe('DeveloperApplication');
    });

    it('UT-SEO-04b: 应支持可选的 url 和 image', () => {
      const project = {
        name: 'Test',
        description: 'Desc',
        image: 'https://example.com/img.jpg',
        url: 'https://example.com',
        technologies: ['React'],
      };
      const result = generateProjectJsonLd(project);
      expect(result.image).toBe('https://example.com/img.jpg');
      expect(result.url).toBe('https://example.com');
    });
  });
});
