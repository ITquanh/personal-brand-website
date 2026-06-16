import { PrismaClient } from '@prisma/client';
import { siteConfig } from '../src/config/site';

const prisma = new PrismaClient();

async function main() {
  console.log('Migrating site.ts config to database...');

  // 1. Migrate SiteConfig
  console.log('Upserting SiteConfig...');
  await prisma.siteConfig.upsert({
    where: { id: 'global' },
    update: {
      name: siteConfig.name || '',
      nameEn: siteConfig.nameEn || '',
      jobTitle: siteConfig.jobTitle || '',
      jobTitleEn: siteConfig.jobTitleEn || '',
      bio: siteConfig.bio || '',
      bioEn: siteConfig.bioEn || '',
      siteTitle: siteConfig.siteTitle || '',
      siteTitleEn: siteConfig.siteTitleEn || '',
      siteDescription: siteConfig.siteDescription || '',
      siteDescriptionEn: siteConfig.siteDescriptionEn || '',
      githubUrl: siteConfig.github?.url || '',
      email: siteConfig.email || '',
      linkedinUrl: (siteConfig as any).linkedin?.url || '',
    },
    create: {
      id: 'global',
      name: siteConfig.name || '',
      nameEn: siteConfig.nameEn || '',
      jobTitle: siteConfig.jobTitle || '',
      jobTitleEn: siteConfig.jobTitleEn || '',
      bio: siteConfig.bio || '',
      bioEn: siteConfig.bioEn || '',
      siteTitle: siteConfig.siteTitle || '',
      siteTitleEn: siteConfig.siteTitleEn || '',
      siteDescription: siteConfig.siteDescription || '',
      siteDescriptionEn: siteConfig.siteDescriptionEn || '',
      githubUrl: siteConfig.github?.url || '',
      email: siteConfig.email || '',
      linkedinUrl: (siteConfig as any).linkedin?.url || '',
    }
  });

  // 2. Migrate Timeline
  if ((siteConfig as any).timeline && Array.isArray((siteConfig as any).timeline)) {
    const timeline = (siteConfig as any).timeline;
    console.log(`Found ${timeline.length} timeline events. Migrating...`);
    
    // Clear existing
    await prisma.timelineEvent.deleteMany({});
    
    for (let i = 0; i < timeline.length; i++) {
      const event = timeline[i];
      await prisma.timelineEvent.create({
        data: {
          date: event.date || '',
          titleZh: event.titleZh || event.title || '',
          titleEn: event.titleEn || '',
          companyZh: event.companyZh || event.company || '',
          companyEn: event.companyEn || '',
          descriptionZh: event.descriptionZh || event.description || '',
          descriptionEn: event.descriptionEn || '',
          achievementsZh: JSON.stringify(event.achievementsZh || event.achievements || []),
          achievementsEn: JSON.stringify(event.achievementsEn || []),
          type: event.type || 'work',
          order: i,
        }
      });
    }
  }

  console.log('Migration completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
