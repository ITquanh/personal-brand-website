import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';
import { i18n } from '@/lib/i18n';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 静态页面
  const staticPages: MetadataRoute.Sitemap = [];

  // 为每个语言生成静态页面
  for (const locale of i18n.locales) {
    const prefix = `/${locale}`;

    staticPages.push(
      {
        url: `${siteUrl}${prefix}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
      {
        url: `${siteUrl}${prefix}/about`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.8,
      },
      {
        url: `${siteUrl}${prefix}/projects`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.9,
      },
      {
        url: `${siteUrl}${prefix}/blog`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      }
    );
  }

  // 动态页面 - 项目
  let projectPages: MetadataRoute.Sitemap = [];
  try {
    const projects = await prisma.project.findMany({
      where: { translationStatus: { not: 'untranslated' } },
      select: {
        slug: true,
        updatedAt: true,
      },
    });

    projectPages = projects.flatMap((project) =>
      i18n.locales.map((locale) => ({
        url: `${siteUrl}/${locale}/projects/${project.slug}`,
        lastModified: project.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }))
    );
  } catch (error) {
    console.error('获取项目数据失败:', error);
  }

  // 动态页面 - 文章
  let postPages: MetadataRoute.Sitemap = [];
  try {
    const posts = await prisma.post.findMany({
      where: {
        published: true,
        translationStatus: { not: 'untranslated' },
      },
      select: {
        slug: true,
        updatedAt: true,
      },
    });

    postPages = posts.flatMap((post) =>
      i18n.locales.map((locale) => ({
        url: `${siteUrl}/${locale}/blog/${post.slug}`,
        lastModified: post.updatedAt,
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      }))
    );
  } catch (error) {
    console.error('获取文章数据失败:', error);
  }

  return [...staticPages, ...projectPages, ...postPages];
}
