// SEO工具函数（服务器端）

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com';

// 生成网站JSON-LD
export function generateWebsiteJsonLd(locale: string = 'zh') {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: '个人技术品牌网站',
    description: '集极客美学与高信息密度于一体的个人全栈数字空间',
    url: siteUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteUrl}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
    inLanguage: locale === 'zh' ? 'zh-CN' : 'en-US',
  };
}

// 生成个人资料JSON-LD
export function generatePersonJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'HackBit',
    url: siteUrl,
    jobTitle: '全栈开发者',
    description: '专注于AI辅助开发、系统自动化和全栈工程',
    sameAs: [
      'https://github.com/HackBit',
      'https://linkedin.com/in/HackBit',
    ],
    knowsAbout: [
      'Next.js',
      'React',
      'TypeScript',
      'Python',
      'AI辅助开发',
      '系统自动化',
    ],
  };
}

// 生成文章JSON-LD
export function generateArticleJsonLd(article: {
  title: string;
  description: string;
  image?: string;
  publishedTime: string;
  modifiedTime?: string;
  author: string;
  url: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    image: article.image,
    datePublished: article.publishedTime,
    dateModified: article.modifiedTime || article.publishedTime,
    author: {
      '@type': 'Person',
      name: article.author,
    },
    publisher: {
      '@type': 'Organization',
      name: '个人技术品牌网站',
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': article.url,
    },
  };
}

// 生成项目JSON-LD
export function generateProjectJsonLd(project: {
  name: string;
  description: string;
  image?: string;
  url?: string;
  technologies: string[];
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: project.name,
    description: project.description,
    image: project.image,
    url: project.url,
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Web',
    author: {
      '@type': 'Person',
      name: 'HackBit',
    },
    programmingLanguage: project.technologies,
  };
}
