import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const project = await prisma.project.create({
      data: {
        slug: 'mypage',
        titleZh: '个人品牌网站',
        titleEn: 'Personal Brand Website',
        summaryZh: '这是一个基于...',
        summaryEn: 'This is a modern...',
        techStack: '[]',
        architectureZh: '',
        architectureEn: '',
        quantifiedImpact: '节约80%报表工时',
        githubUrl: '',
        demoUrl: '',
        imageUrl: '',
        isFeatured: false,
        translationStatus: 'untranslated',
      },
    });
    console.log('Success:', project);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
