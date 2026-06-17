'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/projects?limit=100');
      const data = await res.json();

      if (data.success) {
        setProjects(data.data);
      } else {
        setError('获取项目失败');
      }
    } catch (error) {
      console.error('获取项目失败:', error);
      setError('获取项目失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个项目吗？')) {
      return;
    }

    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (data.success) {
        setProjects((prev) => prev.filter((p) => p.id !== id));
      } else {
        alert(data.error || '删除失败');
      }
    } catch (error) {
      console.error('删除项目失败:', error);
      alert('删除项目失败');
    }
  };

  return (
    <div>
      {/* 页面标题 */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">项目管理</h1>
        <Link
          href="/admin/projects/new"
          className="px-6 py-2 bg-accent-green text-background rounded-lg hover:bg-accent-green/90"
        >
          创建新项目
        </Link>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 mb-6">
          {error}
        </div>
      )}

      {/* 加载状态 */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card p-6 animate-pulse">
              <div className="h-6 bg-card-bg rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-card-bg rounded w-2/3"></div>
            </div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <div className="text-4xl mb-4">🚀</div>
          <p className="text-foreground/60 mb-4">还没有项目</p>
          <Link
            href="/admin/projects/new"
            className="text-accent-green hover:underline"
          >
            创建第一个项目
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map((project) => (
            <div
              key={project.id}
              className="glass-card p-6 flex items-center justify-between"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold">{project.titleZh}</h3>
                  {project.isFeatured && (
                    <span className="text-xs px-2 py-1 bg-accent-green/20 text-accent-green rounded-full">
                      精选
                    </span>
                  )}
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      project.translationStatus === 'reviewed'
                        ? 'bg-purple-500/20 text-purple-400'
                        : project.translationStatus === 'translated'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}
                  >
                    {project.translationStatus === 'reviewed'
                      ? '已审核'
                      : project.translationStatus === 'translated'
                      ? '已翻译'
                      : '未翻译'}
                  </span>
                </div>
                <p className="text-sm text-foreground/60 mb-2">
                  {project.summaryZh}
                </p>
                <div className="flex flex-wrap gap-2">
                  {project.techStack.slice(0, 5).map((tech: string) => (
                    <span
                      key={tech}
                      className="text-xs px-2 py-1 bg-card-bg rounded"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 ml-4">
                <Link
                  href={`/admin/projects/${project.id}`}
                  className="px-4 py-2 text-sm glass-card hover:bg-foreground/10 rounded-lg"
                >
                  编辑
                </Link>
                <button
                  onClick={() => handleDelete(project.id)}
                  className="px-4 py-2 text-sm text-red-400 hover:bg-red-400/10 rounded-lg"
                >
                  删除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
