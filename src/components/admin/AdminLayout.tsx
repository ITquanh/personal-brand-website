'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const NAV_ITEMS = [
  { label: '仪表盘', href: '/admin', icon: '📊' },
  { label: '关于我管理', href: '/admin/about', icon: '👤' },
  { label: '个人信息', href: '/admin/profile', icon: '👤' },
  { label: '个人履历', href: '/admin/timeline', icon: '📋' },
  { label: '项目管理', href: '/admin/projects', icon: '🚀' },
  { label: '文章管理', href: '/admin/posts', icon: '📝' },
  { label: '技术栈管理', href: '/admin/skills', icon: '🛠️' },
  { label: '文件上传', href: '/admin/upload', icon: '📁' },
  { label: 'API 配置', href: '/admin/api-config', icon: '🔑' },
];

// 管理后台侧边栏（仅在已认证时渲染）
function AdminShell({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* 移动端菜单按钮 */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 glass-card">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {sidebarOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* 侧边栏 */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-card-bg border-r border-card-border transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-card-border">
            <Link href="/admin" className="text-xl font-bold">管理后台</Link>
          </div>
          <nav className="flex-1 p-4 space-y-2">
            {NAV_ITEMS.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${pathname === item.href ? 'bg-accent-green text-background' : 'text-foreground/60 hover:bg-foreground/10'}`}>
                <span>{item.icon}</span><span>{item.label}</span>
              </Link>
            ))}
          </nav>
          <div className="p-4 border-t border-card-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{session?.user?.name}</p>
                <p className="text-xs text-foreground/40 truncate">{session?.user?.email}</p>
              </div>
            </div>
            <button onClick={() => signOut({ callbackUrl: '/' })} className="w-full px-4 py-2 text-sm text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
              退出登录
            </button>
          </div>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <main className="lg:ml-64 min-h-screen">
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}

// 认证守卫组件
function AuthGuard({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-green mx-auto mb-4"></div>
        <p className="text-foreground/60">加载中...</p>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-foreground/60">正在跳转到登录页...</p>
      </div>
    );
  }

  return <>{children}</>;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();

  // 登录页：直接渲染，不需要认证和侧边栏
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // 其他管理页面：需要认证 + 侧边栏
  return (
    <AuthGuard>
      <AdminShell>{children}</AdminShell>
    </AuthGuard>
  );
}
