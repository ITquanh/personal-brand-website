import { NextRequest, NextResponse } from 'next/server';
import { i18n } from '@/lib/i18n';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 检查是否已经有语言前缀
  const pathnameIsMissingLocale = i18n.locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  // 如果没有语言前缀，重定向到默认语言
  if (pathnameIsMissingLocale) {
    const locale = getLocaleFromCookie(request) || i18n.defaultLocale;

    // 构建新的URL
    const newUrl = new URL(`/${locale}${pathname}`, request.url);

    // 保持查询参数
    newUrl.search = request.nextUrl.search;

    return NextResponse.redirect(newUrl);
  }

  return NextResponse.next();
}

function getLocaleFromCookie(request: NextRequest): string | null {
  const cookie = request.cookies.get('NEXT_LOCALE');
  return cookie?.value || null;
}

export const config = {
  matcher: [
    // 跳过内部路径（_next）、API 路由、后台管理路径（admin）和已知静态文件扩展名
    '/((?!_next|api|admin|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|ttf|eot)$).*)',
  ],
};
