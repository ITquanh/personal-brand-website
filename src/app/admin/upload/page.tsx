'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import MarkdownUploader from '@/components/admin/MarkdownUploader';

export default function AdminUploadPage() {
  const router = useRouter();
  const [importType, setImportType] = useState<'post' | 'project'>('post');
  const [successCount, setSuccessCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleImportComplete = (data: any) => {
    setSuccessCount((prev) => prev + 1);
    setError(null);
  };

  const handleError = (err: Error) => {
    setError(err.message);
  };

  return (
    <div>
      {/* 页面标题 */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">文件导入</h1>
        <div className="flex gap-2">
          <button
            onClick={() => router.push('/admin/posts')}
            className="px-4 py-2 text-sm glass-card hover:bg-foreground/10 rounded-lg"
          >
            查看文章
          </button>
          <button
            onClick={() => router.push('/admin/projects')}
            className="px-4 py-2 text-sm glass-card hover:bg-foreground/10 rounded-lg"
          >
            查看项目
          </button>
        </div>
      </div>

      {/* 成功提示 */}
      {successCount > 0 && (
        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 mb-6">
          成功导入 {successCount} 个文件！
        </div>
      )}

      {/* 错误提示 */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 mb-6">
          {error}
        </div>
      )}

      {/* 导入类型选择 */}
      <div className="glass-card p-6 mb-6">
        <h2 className="text-lg font-bold mb-4">选择导入类型</h2>
        <div className="flex gap-4">
          <button
            onClick={() => setImportType('post')}
            className={`flex-1 p-4 rounded-lg transition-colors ${
              importType === 'post'
                ? 'bg-accent-green text-background'
                : 'glass-card hover:bg-foreground/10'
            }`}
          >
            <div className="text-2xl mb-2">📝</div>
            <div className="font-medium">导入文章</div>
            <p className="text-sm opacity-80 mt-1">
              导入 Markdown 文件到博客
            </p>
          </button>

          <button
            onClick={() => setImportType('project')}
            className={`flex-1 p-4 rounded-lg transition-colors ${
              importType === 'project'
                ? 'bg-accent-green text-background'
                : 'glass-card hover:bg-foreground/10'
            }`}
          >
            <div className="text-2xl mb-2">🚀</div>
            <div className="font-medium">导入项目</div>
            <p className="text-sm opacity-80 mt-1">
              导入 Markdown 文件到项目展示
            </p>
          </button>
        </div>
      </div>

      {/* 文件上传组件 */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-bold mb-4">
          {importType === 'post' ? '上传文章文件' : '上传项目文件'}
        </h2>
        <MarkdownUploader
          type={importType}
          onImportComplete={handleImportComplete}
          onError={handleError}
        />
      </div>

      {/* 使用说明 */}
      <div className="glass-card p-6 mt-6">
        <h2 className="text-lg font-bold mb-4">使用说明</h2>
        <div className="space-y-3 text-sm text-foreground/60">
          <p>
            <strong>支持格式：</strong> .md 和 .mdx 文件
          </p>
          <p>
            <strong>Front Matter：</strong>{' '}
            文件头部可包含 YAML 格式的元数据，如：
          </p>
          <pre className="bg-card-bg p-4 rounded-lg overflow-x-auto">
            {`---
title: "文章标题"
slug: "article-slug"
tags: ["AI", "Next.js"]
date: "2024-01-15"
published: false
---

文章内容...`}
          </pre>
          <p>
            <strong>批量上传：</strong>{' '}
            可以同时选择多个文件进行批量导入
          </p>
          <p>
            <strong>自动处理：</strong>{' '}
            系统会自动解析 Front Matter、生成 slug、计算阅读时间
          </p>
        </div>
      </div>
    </div>
  );
}
