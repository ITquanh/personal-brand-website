'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { useEffect, useRef } from 'react';

interface CommentSectionProps {
  repo: string;
  repoId: string;
  category: string;
  categoryId: string;
  mapping: string;
  reactionsEnabled?: boolean;
  emitMetadata?: boolean;
  inputPosition?: 'top' | 'bottom';
  lang?: string;
}

export default function CommentSection({
  repo,
  repoId,
  category,
  categoryId,
  mapping,
  reactionsEnabled = true,
  emitMetadata = false,
  inputPosition = 'bottom',
  lang = 'zh-CN',
}: CommentSectionProps) {
  const { theme } = useTheme();
  const commentsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!commentsRef.current) return;

    // 清除之前的评论
    commentsRef.current.innerHTML = '';

    // 创建Giscus脚本
    const script = document.createElement('script');
    script.src = 'https://giscus.app/client.js';
    script.setAttribute('data-repo', repo);
    script.setAttribute('data-repo-id', repoId);
    script.setAttribute('data-category', category);
    script.setAttribute('data-category-id', categoryId);
    script.setAttribute('data-mapping', mapping);
    script.setAttribute('data-reactions-enabled', reactionsEnabled ? '1' : '0');
    script.setAttribute('data-emit-metadata', emitMetadata ? '1' : '0');
    script.setAttribute('data-input-position', inputPosition);
    script.setAttribute('data-theme', theme === 'dark' ? 'dark' : 'light');
    script.setAttribute('data-lang', lang);
    script.setAttribute('crossorigin', 'anonymous');
    script.async = true;

    commentsRef.current.appendChild(script);

    // 监听主题变化
    const observer = new MutationObserver(() => {
      const iframe = commentsRef.current?.querySelector('iframe');
      if (iframe) {
        iframe.contentWindow?.postMessage(
          {
            giscus: {
              setConfig: {
                theme: theme === 'dark' ? 'dark' : 'light',
              },
            },
          },
          'https://giscus.app'
        );
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => {
      observer.disconnect();
    };
  }, [repo, repoId, category, categoryId, mapping, reactionsEnabled, emitMetadata, inputPosition, lang, theme]);

  return (
    <div className="mt-12 pt-8 border-t border-card-border">
      <h3 className="text-xl font-bold mb-6">评论</h3>
      <div ref={commentsRef} className="giscus" />
    </div>
  );
}
