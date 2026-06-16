import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { siteConfig as defaultSiteConfig } from '@/config/site';

/**
 * GET /api/admin/about — 读取 about 页面配置
 */
export async function GET() {
  try {
    let session;
    try { session = await auth(); } catch { return NextResponse.json({ success: false, error: '未授权' }, { status: 401 }); }
    if (!session?.user) {
      return NextResponse.json({ success: false, error: '未授权' }, { status: 401 });
    }

    const siteConfigDb = await prisma.siteConfig.findUnique({
      where: { id: 'global' },
    });

    return NextResponse.json({
      success: true,
      data: {
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
      },
    });
  } catch (error: any) {
    console.error('About GET error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/**
 * POST /api/admin/about — 保存 about 页面配置
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: '未授权' }, { status: 401 });
    }

    const body = await request.json();

    const updateData = {
      siteTitle: body.siteTitle,
      siteTitleEn: body.siteTitleEn,
      siteDescription: body.siteDescription,
      siteDescriptionEn: body.siteDescriptionEn,
      name: body.name,
      nameEn: body.nameEn,
      jobTitle: body.jobTitle,
      jobTitleEn: body.jobTitleEn,
      bio: body.bio,
      bioEn: body.bioEn,
      githubUrl: body.githubUrl,
      email: body.email,
      linkedinUrl: body.linkedinUrl,
      yearsExperience: String(body.yearsExperience || ''),
      projectsCompleted: String(body.projectsCompleted || ''),
      clientsServed: String(body.clientsServed || ''),
      terminalRole: body.terminalRole,
      terminalWelcomeMessage: body.terminalWelcomeMessage,
      terminalSkills: body.terminalSkills ? JSON.stringify(body.terminalSkills) : undefined,
    };

    await prisma.siteConfig.upsert({
      where: { id: 'global' },
      update: updateData,
      create: {
        id: 'global',
        name: body.name || '',
        nameEn: body.nameEn || '',
        jobTitle: body.jobTitle || '',
        jobTitleEn: body.jobTitleEn || '',
        bio: body.bio || '',
        bioEn: body.bioEn || '',
        siteTitle: body.siteTitle || '',
        siteTitleEn: body.siteTitleEn || '',
        siteDescription: body.siteDescription || '',
        siteDescriptionEn: body.siteDescriptionEn || '',
        githubUrl: body.githubUrl || '',
        email: body.email || '',
        linkedinUrl: body.linkedinUrl || '',
        yearsExperience: String(body.yearsExperience || ''),
        projectsCompleted: String(body.projectsCompleted || ''),
        clientsServed: String(body.clientsServed || ''),
        terminalRole: body.terminalRole || '',
        terminalWelcomeMessage: body.terminalWelcomeMessage || '',
        terminalSkills: body.terminalSkills ? JSON.stringify(body.terminalSkills) : '[]',
      }
    });

    return NextResponse.json({ success: true, message: '配置已保存' });
  } catch (error: any) {
    console.error('About POST error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
