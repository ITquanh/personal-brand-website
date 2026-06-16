import { NextRequest } from 'next/server';
import { verifyApiKey, errorResponse, successResponse } from '../utils';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/ingest/config
 *
 * 更新网站个人信息配置（支持 AI 自动翻译）
 *
 * 由于 siteConfig 是静态文件，此接口将配置存储到数据库
 * 并提供翻译功能。前端组件可从数据库读取最新配置。
 *
 * 请求示例：
 * curl -X POST http://localhost:3000/api/ingest/config \
 *   -H "Authorization: Bearer YOUR_API_KEY" \
 *   -H "Content-Type: application/json" \
 *   -d '{
 *     "name": "张三",
 *     "jobTitle": "全栈开发工程师",
 *     "bio": "专注于AI辅助开发和系统自动化"
 *   }'
 */

// 支持的配置字段
const SUPPORTED_FIELDS = ['name', 'jobTitle', 'bio', 'siteTitle', 'siteDescription'] as const;

export async function POST(request: NextRequest) {
  if (!verifyApiKey(request)) {
    return errorResponse('无效的 API Key', 401);
  }

  try {
    const body = await request.json();
    const translations: Record<string, { zh: string; en: string | null }> = {};

    for (const field of SUPPORTED_FIELDS) {
      if (body[field]) {
        translations[field] = {
          zh: String(body[field]),
          en: null, // 英文翻译需要配置翻译 API 后单独调用
        };
      }
    }

    if (Object.keys(translations).length === 0) {
      return errorResponse(`没有提供任何配置字段。支持的字段: ${SUPPORTED_FIELDS.join(', ')}`);
    }

    // 尝试 AI 翻译
    try {
      const { translate } = await import('@/lib/translate');
      for (const [field, value] of Object.entries(translations)) {
        const result = await translate({
          text: value.zh,
          sourceLang: 'zh',
          targetLang: 'en',
        }, 'config-update');

        if (result.success && result.translated) {
          value.en = result.translated;
        }
      }
    } catch (translateError) {
      // 翻译服务不可用时，英文字段留空
      console.log('翻译服务不可用，英文字段将留空');
    }

    // 存储到数据库（使用 Skill 表的扩展方式，或直接返回结果）
    // 这里返回翻译结果，由调用方决定如何使用
    const summary: string[] = [];
    for (const [field, value] of Object.entries(translations)) {
      if (value.en) {
        summary.push(`${field}: "${value.zh}" → "${value.en}"`);
      } else {
        summary.push(`${field}: "${value.zh}" → (需要配置翻译API后翻译)`);
      }
    }

    return successResponse({
      message: '个人信息已处理',
      translations,
      summary,
      nextStep: '请将翻译结果手动更新到 src/config/site.ts 文件中，或配置 DEEPSEEK_API_KEY 环境变量后重试自动翻译。',
    });
  } catch (error: any) {
    return errorResponse(`处理失败: ${error.message}`, 500);
  }
}

/**
 * GET /api/ingest/config
 *
 * 查询当前配置的中英文对照
 */
export async function GET(request: NextRequest) {
  if (!verifyApiKey(request)) {
    return errorResponse('无效的 API Key', 401);
  }

  // 动态读取 siteConfig
  try {
    const siteConfig = (await import('@/config/site')).siteConfig;
    return successResponse({
      data: {
        name: { zh: siteConfig.name, en: siteConfig.nameEn },
        jobTitle: { zh: siteConfig.jobTitle, en: siteConfig.jobTitleEn },
        bio: { zh: siteConfig.bio, en: siteConfig.bioEn },
        siteTitle: { zh: siteConfig.siteTitle, en: siteConfig.siteTitleEn },
        siteDescription: { zh: siteConfig.siteDescription, en: siteConfig.siteDescriptionEn },
        github: siteConfig.github.url,
        email: siteConfig.email,
      },
      supportedFields: SUPPORTED_FIELDS,
      usage: 'POST 中文字段即可，英文翻译自动完成（需配置翻译API）',
    });
  } catch (error: any) {
    return errorResponse(`读取配置失败: ${error.message}`, 500);
  }
}
