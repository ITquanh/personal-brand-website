// 翻译服务工具库
// 支持Deepseek API和DeepL API

interface TranslateOptions {
  text: string;
  sourceLang?: string;
  targetLang: string;
}

interface TranslateResult {
  success: boolean;
  translated?: string;
  error?: string;
  provider?: string;
}

// 简单的内存限流器
const rateLimiter = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(userId: string): boolean {
  const now = Date.now();

  // 定期清理过期条目，防止内存泄漏
  if (rateLimiter.size > 1000) {
    for (const [key, value] of rateLimiter) {
      if (now > value.resetTime) rateLimiter.delete(key);
    }
  }

  const limit = rateLimiter.get(userId);

  if (!limit || now > limit.resetTime) {
    // 重置或创建新的限制
    rateLimiter.set(userId, {
      count: 1,
      resetTime: now + 60 * 1000, // 1分钟重置
    });
    return true;
  }

  if (limit.count >= 60) {
    // 每分钟最多60次
    return false;
  }

  limit.count++;
  return true;
}

// 使用 OpenAI 兼容的 API 翻译 (支持 Deepseek, Agnes 等)
async function translateWithCustomLLM(options: TranslateOptions): Promise<TranslateResult> {
  const apiKey = process.env.TRANSLATION_API_KEY || process.env.DEEPSEEK_API_KEY;
  const baseUrl = process.env.TRANSLATION_API_URL || 'https://api.deepseek.com/v1';
  const model = process.env.TRANSLATION_MODEL || 'deepseek-chat';

  if (!apiKey) {
    return {
      success: false,
      error: 'Translation API key not configured',
    };
  }

  try {
    const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const response = await fetch(`${cleanBaseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: `You are a professional translator. Translate the following text from ${options.sourceLang || 'Chinese'} to ${options.targetLang}. Only return the translated text, nothing else.`,
          },
          {
            role: 'user',
            content: options.text,
          },
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return {
        success: false,
        error: `LLM API error: ${error}`,
      };
    }

    const data = await response.json();
    const translated = data.choices?.[0]?.message?.content?.trim();

    if (!translated) {
      return {
        success: false,
        error: 'No translation returned',
      };
    }

    return {
      success: true,
      translated,
      provider: model,
    };
  } catch (error) {
    return {
      success: false,
      error: `LLM API request failed: ${error}`,
    };
  }
}

// 使用DeepL API翻译
async function translateWithDeepL(options: TranslateOptions): Promise<TranslateResult> {
  const apiKey = process.env.DEEPL_API_KEY;

  if (!apiKey) {
    return {
      success: false,
      error: 'DeepL API key not configured',
    };
  }

  try {
    // DeepL语言代码映射
    const langMap: Record<string, string> = {
      'zh': 'ZH',
      'en': 'EN',
      'ja': 'JA',
      'ko': 'KO',
    };

    const sourceLang = options.sourceLang ? langMap[options.sourceLang] || options.sourceLang.toUpperCase() : undefined;
    const targetLang = langMap[options.targetLang] || options.targetLang.toUpperCase();

    const params = new URLSearchParams({
      text: options.text,
      target_lang: targetLang,
      auth_key: apiKey,
    });

    if (sourceLang) {
      params.append('source_lang', sourceLang);
    }

    const response = await fetch('https://api-free.deepl.com/v2/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const error = await response.text();
      return {
        success: false,
        error: `DeepL API error: ${error}`,
      };
    }

    const data = await response.json();
    const translated = data.translations?.[0]?.text;

    if (!translated) {
      return {
        success: false,
        error: 'No translation returned',
      };
    }

    return {
      success: true,
      translated,
      provider: 'deepl',
    };
  } catch (error) {
    return {
      success: false,
      error: `DeepL API request failed: ${error}`,
    };
  }
}

// 主翻译函数
export async function translate(
  options: TranslateOptions,
  userId?: string,
  skipRateLimit = false
): Promise<TranslateResult> {
  // 检查限流（无 userId 时使用 'anonymous' 作为限流 key）
  if (!skipRateLimit) {
    const rateLimitKey = userId || 'anonymous';
    if (!checkRateLimit(rateLimitKey)) {
      return {
        success: false,
        error: 'Rate limit exceeded. Please try again later.',
      };
    }
  }

  // 优先使用自定义翻译 API 或 Deepseek，如果未配置则使用DeepL
  const customKey = process.env.TRANSLATION_API_KEY || process.env.DEEPSEEK_API_KEY;
  const deepLKey = process.env.DEEPL_API_KEY;

  if (customKey) {
    return translateWithCustomLLM(options);
  } else if (deepLKey) {
    return translateWithDeepL(options);
  } else {
    return {
      success: false,
      error: 'No translation API configured. Please set TRANSLATION_API_KEY, DEEPSEEK_API_KEY or DEEPL_API_KEY in environment variables.',
    };
  }
}

// 批量翻译
export async function translateBatch(
  texts: string[],
  targetLang: string,
  userId?: string
): Promise<TranslateResult[]> {
  const rateLimitKey = userId || 'anonymous';
  if (!checkRateLimit(rateLimitKey)) {
    return [
      {
        success: false,
        error: 'Rate limit exceeded. Please try again later.',
      },
    ];
  }

  // 并行翻译所有文本，提高性能并跳过子项限流检查
  const promises = texts.map((text) =>
    translate({ text, targetLang }, userId, true)
  );
  return Promise.all(promises);
}
