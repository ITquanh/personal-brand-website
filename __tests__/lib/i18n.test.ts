import { i18n, getDictionary } from '@/lib/i18n';

describe('i18n.ts - 国际化', () => {
  describe('i18n 配置', () => {
    it('UT-I18N-03: 默认 locale 应为 zh', () => {
      expect(i18n.defaultLocale).toBe('zh');
    });

    it('UT-I18N-04: 支持的 locale 列表应包含 zh 和 en', () => {
      expect(i18n.locales).toContain('zh');
      expect(i18n.locales).toContain('en');
      expect(i18n.locales).toHaveLength(2);
    });
  });

  describe('getDictionary', () => {
    it('UT-I18N-01: 应加载中文字典', async () => {
      const dict = await getDictionary('zh');
      expect(dict).toBeDefined();
      expect(dict.common.siteTitle).toBe('个人技术品牌');
      expect(dict.hero.name).toBe('HackBit');
      expect(dict.about.title).toBe('关于我');
    });

    it('UT-I18N-02: 应加载英文字典', async () => {
      const dict = await getDictionary('en');
      expect(dict).toBeDefined();
      expect(dict.common.siteTitle).toBe('Personal Tech Brand');
      expect(dict.hero.name).toBe('HackBit');
      expect(dict.about.title).toBe('About Me');
    });

    it('UT-I18N-05: 无效 locale 应回退到默认字典', async () => {
      const dict = await getDictionary('fr' as any);
      expect(dict).toBeDefined();
      // 应回退到中文
      expect(dict.common.siteTitle).toBe('个人技术品牌');
    });

    it('UT-I18N-05b: 中英文字典应有相同的键结构', async () => {
      const zhDict = await getDictionary('zh');
      const enDict = await getDictionary('en');
      expect(Object.keys(zhDict).sort()).toEqual(Object.keys(enDict).sort());
    });
  });
});
