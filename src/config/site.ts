/**
 * 网站配置中心 — 所有个人信息在这里统一修改
 *
 * 修改此文件后，网站所有页面会自动同步更新。
 * 包括：首页、关于我、SEO、命令面板、联系方式等。
 *
 * 使用方法：
 * - import { siteConfig, t } from '@/config/site'
 * - t('name', 'zh') → 'HackBit'
 * - t('name', 'en') → 'HackBit'
 */

export const siteConfig = {
  // ========== 基本信息 ==========
  siteTitle: '个人技术品牌',
  siteTitleEn: 'Personal Tech Brand',
  siteDescription: '集极客美学与高信息密度于一体的个人全栈数字空间',
  siteDescriptionEn: 'A personal full-stack digital space combining geek aesthetics with high information density',

  // ========== 个人信息 ==========
  name: 'HackBit',
  nameEn: 'HackBit',
  jobTitle: '全栈开发者',
  jobTitleEn: 'Full Stack Developer',
  bio: '专注于AI辅助开发、系统自动化和全栈工程',
  bioEn: 'Focused on AI-assisted development, system automation, and full-stack engineering',

  // ========== 联系方式 ==========
  github: {
    username: 'HackBit',
    url: 'https://github.com/HackBit',
  },
  email: 'your@email.com',
  linkedin: {
    username: 'HackBit',
    url: 'https://linkedin.com/in/HackBit',
  },

  // ========== 域名 ==========
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com',

  // ========== 统计数据 ==========
  stats: {
    yearsExperience: '5+',
    projectsCompleted: '20+',
    clientsServed: '10+',
  },

  // ========== 终端动效内容 ==========
  terminal: {
    role: '全栈开发者 | AI辅助开发专家',
    skills: [
      '• Next.js / React / TypeScript',
      '• Python / Node.js / Prisma',
      '• Docker / Vercel / AWS',
      '• Claude Code / Cursor / AI Tools',
    ],
    welcomeMessage: '✓ 部署成功！欢迎来到我的数字空间',
  },

  // ========== 职业履历时间轴 ==========
  timeline: [
    {
      id: '1',
      date: '2024 - 至今',
      title: '全栈开发工程师',
      company: '自由职业 / 独立开发者',
      description: '专注于AI辅助开发、系统自动化和全栈工程，为客户提供定制化技术解决方案',
      achievements: [
        '利用 AI 工具链（Claude Code、Cursor）提升开发效率 300%',
        '开发自动化报表系统，为客户节省 80% 工时',
        '独立完成 20+ 个全栈项目，客户满意度 100%',
      ],
      type: 'work' as const,
    },
    {
      id: '2',
      date: '2022 - 2024',
      title: 'ICT 项目管理',
      company: '某科技公司',
      description: '主导 ICT 渠道支撑与项目交付，推动业务流程自动化重构',
      achievements: [
        '管理 10+ 个 ICT 项目，按时交付率 95%',
        '团队从 5 人扩展到 15 人',
        '引入自动化工具，将报表生成时间从 2 天缩短到 2 小时',
      ],
      type: 'work' as const,
    },
    {
      id: '3',
      date: '2020 - 2022',
      title: '网络工程师',
      company: '某电信公司',
      description: '负责企业级网络基础设施维护与优化',
      achievements: [
        '网络故障率降低 60%',
        '获得 CCNP 认证',
        '主导完成 3 个数据中心网络升级项目',
      ],
      type: 'work' as const,
    },
    {
      id: '4',
      date: '2016 - 2020',
      title: '计算机科学学士',
      company: '某大学',
      description: '计算机科学与技术专业',
      achievements: [
        'GPA 3.8/4.0',
        '优秀毕业生',
        '校级编程竞赛一等奖',
      ],
      type: 'education' as const,
    },
  ],
} as const;

// Locale 感知的 helper 函数
export function t(field: string, locale: string = 'zh'): string {
  const enField = field + 'En';
  if (locale === 'en' && (siteConfig as any)[enField]) {
    return (siteConfig as any)[enField];
  }
  return (siteConfig as any)[field] || '';
}

// 批量获取 locale 感知的字典值
export function getSiteDict(locale: string = 'zh') {
  return {
    siteTitle: t('siteTitle', locale),
    siteDescription: t('siteDescription', locale),
    name: t('name', locale),
    jobTitle: t('jobTitle', locale),
    bio: t('bio', locale),
  };
}
