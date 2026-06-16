import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { siteConfig as defaultSiteConfig } from '@/config/site';

/**
 * GET /api/admin/profile — 读取当前个人信息配置
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
        name: siteConfigDb?.name || defaultSiteConfig.name || '',
        nameEn: siteConfigDb?.nameEn || defaultSiteConfig.nameEn || '',
        jobTitle: siteConfigDb?.jobTitle || defaultSiteConfig.jobTitle || '',
        jobTitleEn: siteConfigDb?.jobTitleEn || defaultSiteConfig.jobTitleEn || '',
        bio: siteConfigDb?.bio || defaultSiteConfig.bio || '',
        bioEn: siteConfigDb?.bioEn || defaultSiteConfig.bioEn || '',
        siteTitle: siteConfigDb?.siteTitle || defaultSiteConfig.siteTitle || '',
        siteTitleEn: siteConfigDb?.siteTitleEn || defaultSiteConfig.siteTitleEn || '',
        siteDescription: siteConfigDb?.siteDescription || defaultSiteConfig.siteDescription || '',
        siteDescriptionEn: siteConfigDb?.siteDescriptionEn || defaultSiteConfig.siteDescriptionEn || '',
        githubUrl: siteConfigDb?.githubUrl || defaultSiteConfig.github?.url || '',
        email: siteConfigDb?.email || defaultSiteConfig.email || '',
        linkedinUrl: siteConfigDb?.linkedinUrl || (defaultSiteConfig as any).linkedin?.url || '',
      },
    });
  } catch (error: any) {
    console.error('Profile GET error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/**
 * POST /api/admin/profile — 保存个人信息配置
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: '未授权' }, { status: 401 });
    }

    const body = await request.json();

    await prisma.siteConfig.upsert({
      where: { id: 'global' },
      update: {
        name: body.name,
        nameEn: body.nameEn,
        jobTitle: body.jobTitle,
        jobTitleEn: body.jobTitleEn,
        bio: body.bio,
        bioEn: body.bioEn,
        siteTitle: body.siteTitle,
        siteTitleEn: body.siteTitleEn,
        siteDescription: body.siteDescription,
        siteDescriptionEn: body.siteDescriptionEn,
        githubUrl: body.githubUrl,
        email: body.email,
        linkedinUrl: body.linkedinUrl,
      },
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
      }
    });

    return NextResponse.json({ success: true, message: '配置已保存' });
  } catch (error: any) {
    console.error('Profile POST error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
