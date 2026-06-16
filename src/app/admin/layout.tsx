'use client';

import dynamic from 'next/dynamic';
import { SessionProvider } from 'next-auth/react';

// 动态导入 AdminLayout，禁用 SSR 避免水合不匹配
const AdminLayoutInner = dynamic(
  () => import('@/components/admin/AdminLayout'),
  { ssr: false, loading: () => <div className="min-h-screen flex items-center justify-center bg-background"><p className="text-foreground/60">加载中...</p></div> }
);

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </SessionProvider>
  );
}
