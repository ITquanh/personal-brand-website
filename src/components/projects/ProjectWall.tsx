'use client';

import { motion } from 'framer-motion';
import { useState, useEffect, useRef, useCallback } from 'react';
import ProjectCard from '@/components/home/ProjectCard';

interface Project {
  id: string;
  slug: string;
  title: string;
  summary: string;
  techStack: string[];
  imageUrl?: string;
  quantifiedImpact?: string;
  isFeatured?: boolean;
}

interface ProjectWallProps {
  initialProjects?: Project[];
  locale: string;
  dict: any;
  techFilter?: string | null;
}

export default function ProjectWall({
  initialProjects,
  locale,
  dict,
  techFilter = null,
}: ProjectWallProps) {
  const [projects, setProjects] = useState<Project[]>(initialProjects || []);
  const [page, setPage] = useState(initialProjects && initialProjects.length > 0 ? 1 : 0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const retryCountRef = useRef(0);
  const isLoadingRef = useRef(false); // 同步锁，防止竞态条件
  const maxRetries = 2;

  // 加载更多项目
  const loadMore = useCallback(async () => {
    if (isLoadingRef.current || !hasMore || error) return;

    isLoadingRef.current = true;
    setLoading(true);
    setError(false);
    try {
      const techParam = techFilter ? `&techStack=${encodeURIComponent(techFilter)}` : '';
      const res = await fetch(
        `/api/projects?page=${page + 1}&limit=12&locale=${locale}${techParam}`
      );

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();

      if (data.success && data.data && data.data.length > 0) {
        setProjects((prev) => [...prev, ...data.data]);
        setPage((prev) => prev + 1);
        setHasMore(data.data.length === 12);
        retryCountRef.current = 0;
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error('加载项目失败:', err);
      setError(true);
      retryCountRef.current += 1;

      if (retryCountRef.current >= maxRetries) {
        setHasMore(false);
      }
    } finally {
      isLoadingRef.current = false;
      setLoading(false);
    }
  }, [page, hasMore, error, locale, techFilter]);

  // 父组件更新 initialProjects 时同步
  useEffect(() => {
    if (initialProjects) {
      setProjects(initialProjects);
    }
  }, [initialProjects]);

  // 筛选条件变化时重置列表
  useEffect(() => {
    setProjects([]);
    setPage(0);
    setHasMore(true);
    setError(false);
    isLoadingRef.current = false;
  }, [techFilter]);

  // 设置Intersection Observer
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // 如果有错误或没有更多数据，不设置observer
    if (error || !hasMore) {
      return;
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !error) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loadMore, hasMore, loading, error]);

  // 初始加载
  useEffect(() => {
    if ((!initialProjects || initialProjects.length === 0) && !error) {
      loadMore();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 重试函数
  const handleRetry = () => {
    setError(false);
    retryCountRef.current = 0;
    loadMore();
  };

  return (
    <div>
      {/* 项目网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index % 3 * 0.1 }}
            viewport={{ once: true }}
          >
            <ProjectCard
              project={project}
              locale={locale}
              index={index}
            />
          </motion.div>
        ))}
      </div>

      {/* 加载更多触发器 */}
      <div ref={loadMoreRef} className="mt-12">
        {loading && (
          <div className="flex justify-center">
            <div className="flex gap-2">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                  className="w-3 h-3 rounded-full bg-accent-green"
                />
              ))}
            </div>
          </div>
        )}

        {error && !loading && (
          <div className="text-center py-8">
            <p className="text-red-400 mb-4">
              {locale === 'en' ? 'Failed to load projects' : '加载项目失败'}
            </p>
            <button
              onClick={handleRetry}
              className="px-4 py-2 bg-accent-green text-background rounded-lg hover:bg-accent-green/90 transition-colors"
            >
              {locale === 'en' ? 'Retry' : '重试'}
            </button>
          </div>
        )}

        {!hasMore && projects.length > 0 && (
          <div className="text-center text-foreground/40 py-8">
            {dict.projects.allProjects} ({projects.length})
          </div>
        )}

        {!loading && !error && projects.length === 0 && (
          <div className="text-center text-foreground/40 py-16">
            <div className="text-4xl mb-4">🚀</div>
            <p>{dict.common.comingSoon}</p>
          </div>
        )}
      </div>
    </div>
  );
}
