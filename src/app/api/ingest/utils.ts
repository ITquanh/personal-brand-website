import { NextRequest, NextResponse } from 'next/server';

// API Key 验证中间件
export function verifyApiKey(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return false;

  const token = authHeader.replace(/^Bearer\s+/i, '');
  const validKey = process.env.INGEST_API_KEY;

  if (!validKey) {
    console.error('INGEST_API_KEY 未配置');
    return false;
  }

  // 常量时间比较，防止时序攻击
  if (token.length !== validKey.length) return false;
  let result = 0;
  for (let i = 0; i < token.length; i++) {
    result |= token.charCodeAt(i) ^ validKey.charCodeAt(i);
  }
  return result === 0;
}

// 生成 URL 友好的 slug
export function generateSlug(title: string): string {
  // 处理中文标题：检测 CJK 字符
  const hasChinese = /[一-鿿㐀-䶿豈-﫿]/.test(title);
  if (hasChinese) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 6);
    return `post-${timestamp}-${random}`;
  }
  // 英文标题：转小写，替换特殊字符
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 80);
  return slug || `post-${Date.now().toString(36)}`;
}

// 计算阅读时间（中文 300 字/分，英文 1000 字符/分）
export function calculateReadTime(content: string): number {
  const hasChinese = /[一-鿿]/.test(content);
  const charsPerMinute = hasChinese ? 300 : 1000;
  return Math.max(1, Math.ceil(content.length / charsPerMinute));
}

// 统一错误响应
export function errorResponse(message: string, status: number = 400) {
  return NextResponse.json({ success: false, error: message }, { status });
}

// 统一成功响应
export function successResponse(data: any, status: number = 200) {
  return NextResponse.json({ success: true, ...data }, { status });
}
