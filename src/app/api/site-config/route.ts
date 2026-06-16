import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { siteConfig as defaultSiteConfig } from '@/config/site';

/**
 * GET /api/site-config — 读取公开的站点配置和时间线（供前台页面使用）
 */
export async function GET() {
  try {
    const siteConfigDb = await prisma.siteConfig.findUnique({
      where: { id: 'global' },
    });

    const timelineEvents = await prisma.timelineEvent.findMany({
      orderBy: { order: 'asc' },
    });

    const timelineData = timelineEvents.map(event => ({
      id: event.id,
      date: event.date,
      title: event.titleZh,
      titleZh: event.titleZh,
      titleEn: event.titleEn || '',
      company: event.companyZh,
      companyZh: event.companyZh,
      companyEn: event.companyEn || '',
      description: event.descriptionZh,
      descriptionZh: event.descriptionZh,
      descriptionEn: event.descriptionEn || '',
      achievements: JSON.parse(event.achievementsZh || '[]'),
      achievementsZh: JSON.parse(event.achievementsZh || '[]'),
      achievementsEn: JSON.parse(event.achievementsEn || '[]'),
      type: event.type,
    }));

    const configData = {
      siteTitle: siteConfigDb?.siteTitle || defaultSiteConfig.siteTitle || '',
      siteTitleEn: siteConfigDb?.siteTitleEn || defaultSiteConfig.siteTitleEn || '',
      siteDescription: siteConfigDb?.siteDescription || defaultSiteConfig.siteDescription || '',
      siteDescriptionEn: siteConfigDb?.siteDescriptionEn || defaultSiteConfig.siteDescriptionEn || '',
      name: siteConfigDb?.name || defaultSiteConfig.name || '',
      nameEn: siteConfigDb?.nameEn || defaultSiteConfig.nameEn || '',
      jobTitle: siteConfigDb?.jobTitle || defaultSiteConfig.jobTitle || '',
      jobTitleEn: siteConfigDb?.jobTitleEn || defaultSiteConfig.jobTitleEn || '',
      bio: siteConfigDb?.bio || defaultSiteConfig.bio || '',
      bioEn: siteConfigDb?.bioEn || defaultSiteConfig.bioEn || '',
      githubUrl: siteConfigDb?.githubUrl || defaultSiteConfig.github?.url || '',
      email: siteConfigDb?.email || defaultSiteConfig.email || '',
      linkedinUrl: siteConfigDb?.linkedinUrl || (defaultSiteConfig as any).linkedin?.url || '',
      yearsExperience: siteConfigDb?.yearsExperience || defaultSiteConfig.stats.yearsExperience || '5+',
      projectsCompleted: siteConfigDb?.projectsCompleted || defaultSiteConfig.stats.projectsCompleted || '20+',
      clientsServed: siteConfigDb?.clientsServed || defaultSiteConfig.stats.clientsServed || '10+',
      terminalRole: siteConfigDb?.terminalRole || defaultSiteConfig.terminal.role || '',
      terminalSkills: siteConfigDb?.terminalSkills ? JSON.parse(siteConfigDb.terminalSkills) : [...defaultSiteConfig.terminal.skills],
      terminalWelcomeMessage: siteConfigDb?.terminalWelcomeMessage || defaultSiteConfig.terminal.welcomeMessage || '',
      timeline: timelineData,
    };

    return NextResponse.json({
      success: true,
      data: configData,
    });
  } catch (error: any) {
    console.error('SiteConfig GET error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
