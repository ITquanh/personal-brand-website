import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { translate, translateBatch } from '@/lib/translate';

// POST /api/translate - 翻译文本
export async function POST(request: NextRequest) {
  try {
    // 验证管理员权限
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: '未授权访问' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // 验证必填字段
    if (!body.text || !body.targetLang) {
      return NextResponse.json(
        { success: false, error: '缺少必填字段：text 和 targetLang' },
        { status: 400 }
      );
    }

    // 获取用户ID用于限流
    const userId = session.user.id;

    // 检查是否是批量翻译
    if (Array.isArray(body.text)) {
      // 批量翻译
      const results = await translateBatch(body.text, body.targetLang, userId);

      const allSuccess = results.every((r) => r.success);
      const translations = results.map((r) => r.translated || null);

      return NextResponse.json({
        success: allSuccess,
        data: {
          translations,
          provider: results[0]?.provider,
        },
        errors: allSuccess
          ? undefined
          : results
              .filter((r) => !r.success)
              .map((r) => r.error),
      });
    } else {
      // 单个翻译
      const result = await translate(
        {
          text: body.text,
          sourceLang: body.sourceLang,
          targetLang: body.targetLang,
        },
        userId
      );

      if (!result.success) {
        return NextResponse.json(
          {
            success: false,
            error: result.error,
          },
          { status: result.error?.includes('Rate limit') ? 429 : 500 }
        );
      }

      return NextResponse.json({
        success: true,
        data: {
          translated: result.translated,
          provider: result.provider,
        },
      });
    }
  } catch (error) {
    console.error('翻译失败:', error);
    return NextResponse.json(
      { success: false, error: '翻译失败' },
      { status: 500 }
    );
  }
}

// GET /api/translate - 检查翻译服务状态
export async function GET(request: NextRequest) {
  try {
    const deepseekKey = !!process.env.DEEPSEEK_API_KEY;
    const deepLKey = !!process.env.DEEPL_API_KEY;

    return NextResponse.json({
      success: true,
      data: {
        providers: {
          deepseek: {
            configured: deepseekKey,
            available: deepseekKey,
          },
          deepl: {
            configured: deepLKey,
            available: deepLKey,
          },
        },
        defaultProvider: deepseekKey ? 'deepseek' : deepLKey ? 'deepl' : null,
        rateLimit: {
          maxRequests: 10,
          windowMs: 60000,
        },
      },
    });
  } catch (error) {
    console.error('检查翻译服务状态失败:', error);
    return NextResponse.json(
      { success: false, error: '检查翻译服务状态失败' },
      { status: 500 }
    );
  }
}
