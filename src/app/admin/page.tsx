'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState({
    projects: 0,
    posts: 0,
    skills: 0,
  });
  const [analytics, setAnalytics] = useState({
    totalVisits: 0,
    todayVisits: 0,
    popularPages: [] as { path: string; count: number }[],
    dailyVisits: [] as { date: string; count: number }[],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [projectsRes, postsRes, skillsRes, analyticsRes] = await Promise.all([
          fetch('/api/projects?limit=1'),
          fetch('/api/posts?limit=1'),
          fetch('/api/skills'),
          fetch('/api/analytics?days=7'),
        ]);

        const [projectsData, postsData, skillsData, analyticsData] = await Promise.all([
          projectsRes.json(),
          postsRes.json(),
          skillsRes.json(),
          analyticsRes.json(),
        ]);

        setStats({
          projects: projectsData.pagination?.total || 0,
          posts: postsData.pagination?.total || 0,
          skills: skillsData.data?.length || 0,
        });

        if (analyticsData.success) {
          setAnalytics({
            totalVisits: analyticsData.data?.totalVisits || 0,
            todayVisits: analyticsData.data?.todayVisits || 0,
            popularPages: analyticsData.data?.popularPages || [],
            dailyVisits: analyticsData.data?.dailyVisits || [],
          });
        }
      } catch (error) {
        console.error('获取统计数据失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div>
      {/* 欢迎信息 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          欢迎回来，{session?.user?.name}！
        </h1>
        <p className="text-foreground/60">
          这是你的管理后台，可以在这里管理项目、文章和技术栈。
        </p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link
          href="/admin/projects"
          className="glass-card p-6 card-hover"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-foreground/40 mb-1">项目总数</p>
              <p className="text-3xl font-bold text-accent-green">
                {loading ? '...' : stats.projects}
              </p>
            </div>
            <div className="text-4xl">🚀</div>
          </div>
        </Link>

        <Link
          href="/admin/posts"
          className="glass-card p-6 card-hover"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-foreground/40 mb-1">文章总数</p>
              <p className="text-3xl font-bold text-accent-blue">
                {loading ? '...' : stats.posts}
              </p>
            </div>
            <div className="text-4xl">📝</div>
          </div>
        </Link>

        <Link
          href="/admin/skills"
          className="glass-card p-6 card-hover"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-foreground/40 mb-1">技术栈</p>
              <p className="text-3xl font-bold text-accent-purple">
                {loading ? '...' : stats.skills}
              </p>
            </div>
            <div className="text-4xl">🛠️</div>
          </div>
        </Link>
      </div>

      {/* 快速操作 */}
      <div className="glass-card p-6">
        <h2 className="text-xl font-bold mb-4">快速操作</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/admin/projects/new"
            className="flex items-center gap-3 p-4 rounded-lg bg-accent-green/10 hover:bg-accent-green/20 transition-colors"
          >
            <span className="text-2xl">➕</span>
            <div>
              <p className="font-medium">创建新项目</p>
              <p className="text-sm text-foreground/40">添加一个新的项目到展示墙</p>
            </div>
          </Link>

          <Link
            href="/admin/posts/new"
            className="flex items-center gap-3 p-4 rounded-lg bg-accent-blue/10 hover:bg-accent-blue/20 transition-colors"
          >
            <span className="text-2xl">➕</span>
            <div>
              <p className="font-medium">创建新文章</p>
              <p className="text-sm text-foreground/40">撰写一篇新的博客文章</p>
            </div>
          </Link>
        </div>
      </div>

      {/* 访问统计 */}
      <div className="glass-card p-6 mt-6">
        <h2 className="text-xl font-bold mb-4">📊 访问统计（近7天）</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 总访问量 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-card-bg">
              <div>
                <p className="text-sm text-foreground/40">总访问量</p>
                <p className="text-2xl font-bold text-accent-green">{analytics.totalVisits}</p>
              </div>
              <div className="text-3xl">📈</div>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-card-bg">
              <div>
                <p className="text-sm text-foreground/40">今日访问</p>
                <p className="text-2xl font-bold text-accent-blue">{analytics.todayVisits}</p>
              </div>
              <div className="text-3xl">👥</div>
            </div>
          </div>

          {/* 热门页面 */}
          <div>
            <h3 className="text-sm font-medium text-foreground/60 mb-3">热门页面</h3>
            {analytics.popularPages.length > 0 ? (
              <div className="space-y-2">
                {analytics.popularPages.slice(0, 5).map((page, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-card-bg">
                    <span className="text-sm truncate flex-1 mr-4">{page.path}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-foreground/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-accent-green rounded-full"
                          style={{ width: `${Math.min(100, (page.count / (analytics.popularPages[0]?.count || 1)) * 100)}%` }}
                        />
                      </div>
                      <span className="text-sm text-foreground/40 w-12 text-right">{page.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-foreground/40">暂无数据</p>
            )}
          </div>
        </div>

        {/* 每日趋势 */}
        {analytics.dailyVisits.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-foreground/60 mb-3">每日趋势</h3>
            <div className="flex items-end gap-1 h-32">
              {analytics.dailyVisits.map((day, i) => {
                const maxCount = Math.max(...analytics.dailyVisits.map(d => d.count), 1);
                const height = (day.count / maxCount) * 100;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs text-foreground/40">{day.count}</span>
                    <div
                      className="w-full bg-accent-green/80 rounded-t"
                      style={{ height: `${Math.max(4, height)}%` }}
                    />
                    <span className="text-xs text-foreground/40 truncate w-full text-center">
                      {new Date(day.date).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 最近活动 */}
      <div className="glass-card p-6 mt-6">
        <h2 className="text-xl font-bold mb-4">系统信息</h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-foreground/40">登录账号</span>
            <span>{session?.user?.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-foreground/40">GitHub用户名</span>
            <span>{session?.user?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-foreground/40">访问链接</span>
            <a
              href="/"
              target="_blank"
              className="text-accent-green hover:underline"
            >
              查看网站 →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
