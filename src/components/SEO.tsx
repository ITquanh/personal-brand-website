'use client';

import { useEffect } from 'react';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  locale?: string;
  jsonLd?: object;
}

export default function SEO({
  title,
  description,
  keywords = [],
  image,
  url,
  type = 'website',
  publishedTime,
  modifiedTime,
  author,
  locale = 'zh_CN',
  jsonLd,
}: SEOProps) {
  const siteTitle = '个人技术品牌网站';
  const fullTitle = title === siteTitle ? title : `${title} | ${siteTitle}`;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com';
  const defaultImage = `${siteUrl}/og-image.jpg`;

  // 安全序列化 JSON-LD（防止 XSS）
  const safeJsonLd = jsonLd
    ? JSON.stringify(jsonLd).replace(/</g, '\\u003c').replace(/>/g, '\\u003e')
    : null;

  useEffect(() => {
    // 设置页面标题
    document.title = fullTitle;

    // 设置或更新 meta 标签
    const setMeta = (name: string, content: string, attr = 'name') => {
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setMeta('description', description);
    if (author) setMeta('author', author);
    if (keywords.length > 0) setMeta('keywords', keywords.join(', '));

    // Open Graph
    const ogImage = image?.startsWith('http') ? image : image ? `${siteUrl}${image}` : defaultImage;
    setMeta('og:type', type, 'property');
    setMeta('og:title', fullTitle, 'property');
    setMeta('og:description', description, 'property');
    setMeta('og:image', ogImage, 'property');
    setMeta('og:url', url || siteUrl, 'property');
    setMeta('og:site_name', siteTitle, 'property');
    setMeta('og:locale', locale, 'property');

    // Twitter Card
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', fullTitle);
    setMeta('twitter:description', description);
    setMeta('twitter:image', ogImage);

    // 文章特定标签
    if (type === 'article') {
      if (publishedTime) setMeta('article:published_time', publishedTime, 'property');
      if (modifiedTime) setMeta('article:modified_time', modifiedTime, 'property');
      if (author) setMeta('article:author', author, 'property');
    }

    // JSON-LD 结构化数据
    let scriptEl = document.querySelector('script[type="application/ld+json"]');
    if (safeJsonLd) {
      if (!scriptEl) {
        scriptEl = document.createElement('script');
        scriptEl.setAttribute('type', 'application/ld+json');
        document.head.appendChild(scriptEl);
      }
      scriptEl.textContent = safeJsonLd;
    } else if (scriptEl) {
      scriptEl.remove();
    }
  }, [fullTitle, description, keywords, image, url, type, publishedTime, modifiedTime, author, locale, safeJsonLd, siteUrl, defaultImage, siteTitle]);

  return null;
}
