'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import TranslateButton from './TranslateButton';
import { useDropzone } from 'react-dropzone';

interface PostEditorProps {
  post?: any;
  isEditing?: boolean;
}

export default function PostEditor({
  post,
  isEditing = false,
}: PostEditorProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const [formData, setFormData] = useState({
    slug: '',
    titleZh: '',
    titleEn: '',
    contentZh: '',
    contentEn: '',
    summaryZh: '',
    summaryEn: '',
    tags: [] as string[],
    imageUrl: '',
    published: false,
    readTime: 0,
    translationStatus: 'untranslated',
  });

  const [tagInput, setTagInput] = useState('');
  const [importMessage, setImportMessage] = useState<string | null>(null);

  // MDX/MD 文件拖拽导入
  const onDropImport = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (!content) return;

      // 解析 Front Matter
      const fmRegex = /^---\s*\r?\n([\s\S]*?)\r?\n---\s*\r?\n([\s\S]*)$/;
      const match = content.match(fmRegex);

      if (match) {
        const fmLines = match[1].split('\n');
        const body = match[2];
        const fm: Record<string, string> = {};

        for (const line of fmLines) {
          const colonIdx = line.indexOf(':');
          if (colonIdx > 0) {
            const key = line.substring(0, colonIdx).trim();
            let val = line.substring(colonIdx + 1).trim();
            if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
              val = val.slice(1, -1);
            }
            fm[key] = val;
          }
        }

        setFormData((prev) => ({
          ...prev,
          titleZh: fm.title || prev.titleZh,
          slug: fm.slug || prev.slug || file.name.replace(/\.(md|mdx)$/, '').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          contentZh: body || prev.contentZh,
          tags: fm.tags ? fm.tags.replace(/[\[\]]/g, '').split(',').map((t: string) => t.trim()) : prev.tags,
        }));
        setImportMessage(`✅ 已导入: ${file.name}`);
      } else {
        // 没有 Front Matter，直接作为内容导入
        setFormData((prev) => ({
          ...prev,
          contentZh: content,
          slug: prev.slug || file.name.replace(/\.(md|mdx)$/, '').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        }));
        setImportMessage(`✅ 已导入内容: ${file.name}`);
      }

      setTimeout(() => setImportMessage(null), 3000);
    };
    reader.readAsText(file);
  };

  const { getRootProps: getImportRootProps, getInputProps: getImportInputProps } = useDropzone({
    onDrop: onDropImport,
    accept: { 'text/markdown': ['.md', '.mdx'] },
    maxFiles: 1,
    noClick: false,
  });

  // 初始化表单数据（使用 post.id 作为依赖，避免对象引用变化导致重复执行）
  const initializedRef = React.useRef(false);
  useEffect(() => {
    if (post && !initializedRef.current) {
      initializedRef.current = true;
      setFormData({
        slug: post.slug || '',
        titleZh: post.titleZh || '',
        titleEn: post.titleEn || '',
        contentZh: post.contentZh || '',
        contentEn: post.contentEn || '',
        summaryZh: post.summaryZh || '',
        summaryEn: post.summaryEn || '',
        tags: post.tags || [],
        imageUrl: post.imageUrl || '',
        published: post.published || false,
        readTime: post.readTime || 0,
        translationStatus: post.translationStatus || 'untranslated',
      });
    }
  }, [post]);

  // 处理输入变化
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? (e.target as HTMLInputElement).checked
          : value,
    }));
  };

  // 计算阅读时间
  useEffect(() => {
    const wordsPerMinute = 300;
    const wordCount = formData.contentZh.length;
    const readTime = Math.ceil(wordCount / wordsPerMinute);
    setFormData((prev) => ({ ...prev, readTime }));
  }, [formData.contentZh]);

  // 添加标签
  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput('');
    }
  };

  // 删除标签
  const handleRemoveTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  // 提交表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // 验证必填字段
      if (!formData.slug || !formData.titleZh || !formData.contentZh) {
        throw new Error('请填写所有必填字段');
      }

      // 验证 slug 格式
      const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
      if (!slugRegex.test(formData.slug)) {
        throw new Error('Slug 只能包含小写字母、数字和连字符（如 my-article）');
      }

      if (isEditing && !post?.id) {
        throw new Error('编辑模式下缺少文章数据');
      }

      const url = isEditing ? `/api/posts/${post!.id}` : '/api/posts';

      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorText = await res.text().catch(() => 'Unknown error');
        throw new Error(`服务器错误 (${res.status}): ${errorText}`);
      }

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || '操作失败');
      }

      setSuccess(true);

      // 如果是创建，跳转到编辑页面
      if (!isEditing) {
        setTimeout(() => {
          router.push(`/admin/posts/${data.data.id}`);
        }, 1500);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 错误提示 */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
          {error}
        </div>
      )}

      {/* 成功提示 */}
      {success && (
        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400">
          {isEditing ? '文章更新成功！' : '文章创建成功！'}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Slug */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Slug <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            name="slug"
            value={formData.slug}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-card-bg border border-card-border rounded-lg focus:outline-none focus:border-accent-green"
            placeholder="my-article"
            required
          />
        </div>

        {/* 发布状态 */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            name="published"
            checked={formData.published}
            onChange={handleChange}
            className="w-4 h-4 rounded border-card-border"
          />
          <label className="text-sm font-medium">
            发布文章
          </label>
          <span className="text-xs text-foreground/40">
            （预计阅读时间：{formData.readTime} 分钟）
          </span>
        </div>

        {/* 中文标题 */}
        <div>
          <label className="block text-sm font-medium mb-2">
            中文标题 <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            name="titleZh"
            value={formData.titleZh}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-card-bg border border-card-border rounded-lg focus:outline-none focus:border-accent-green"
            placeholder="文章中文标题"
            required
          />
          <TranslateButton
            content={formData.titleZh}
            targetField="titleEn"
            onTranslated={(translated) =>
              setFormData((prev) => ({ ...prev, titleEn: translated }))
            }
          />
        </div>

        {/* 英文标题 */}
        <div>
          <label className="block text-sm font-medium mb-2">
            英文标题
          </label>
          <input
            type="text"
            name="titleEn"
            value={formData.titleEn}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-card-bg border border-card-border rounded-lg focus:outline-none focus:border-accent-green"
            placeholder="Article English Title"
          />
        </div>

        {/* 中文摘要 */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-2">
            中文摘要
          </label>
          <textarea
            name="summaryZh"
            value={formData.summaryZh}
            onChange={handleChange}
            rows={2}
            className="w-full px-4 py-2 bg-card-bg border border-card-border rounded-lg focus:outline-none focus:border-accent-green"
            placeholder="文章中文摘要"
          />
          <TranslateButton
            content={formData.summaryZh}
            targetField="summaryEn"
            onTranslated={(translated) =>
              setFormData((prev) => ({ ...prev, summaryEn: translated }))
            }
          />
        </div>

        {/* 英文摘要 */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-2">
            英文摘要
          </label>
          <textarea
            name="summaryEn"
            value={formData.summaryEn}
            onChange={handleChange}
            rows={2}
            className="w-full px-4 py-2 bg-card-bg border border-card-border rounded-lg focus:outline-none focus:border-accent-green"
            placeholder="Article English Summary"
          />
        </div>

        {/* 标签 */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-2">
            标签
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
              className="flex-1 px-4 py-2 bg-card-bg border border-card-border rounded-lg focus:outline-none focus:border-accent-green"
              placeholder="输入标签，按回车添加"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="px-4 py-2 bg-accent-green text-background rounded-lg hover:bg-accent-green/90"
            >
              添加
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.tags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-2 px-3 py-1 bg-card-bg rounded-full text-sm"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="text-red-400 hover:text-red-300"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* 封面图片URL */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-2">
            封面图片URL
          </label>
          <input
            type="url"
            name="imageUrl"
            value={formData.imageUrl}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-card-bg border border-card-border rounded-lg focus:outline-none focus:border-accent-green"
            placeholder="https://example.com/image.jpg"
          />
        </div>

        {/* 翻译状态 */}
        <div>
          <label className="block text-sm font-medium mb-2">
            翻译状态
          </label>
          <select
            name="translationStatus"
            value={formData.translationStatus}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-card-bg border border-card-border rounded-lg focus:outline-none focus:border-accent-green"
          >
            <option value="untranslated">未翻译</option>
            <option value="translated">已翻译</option>
            <option value="reviewed">已审核</option>
          </select>
        </div>
      </div>

      {/* MDX/MD 文件导入 */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium">导入 Markdown/MDX 文件</label>
          <div {...getImportRootProps()} className="cursor-pointer">
            <input {...getImportInputProps()} />
            <span className="text-sm text-accent-green hover:underline">选择文件导入</span>
          </div>
        </div>
        <div {...getImportRootProps()} className="border-2 border-dashed border-card-border rounded-lg p-4 text-center cursor-pointer hover:border-accent-green/50 transition-colors">
          <input {...getImportInputProps()} />
          <p className="text-sm text-foreground/40">拖拽 .md / .mdx 文件到此处，或点击选择</p>
          <p className="text-xs text-foreground/30 mt-1">支持 Front Matter 元数据自动解析</p>
        </div>
        {importMessage && (
          <p className="text-sm text-green-400 mt-2">{importMessage}</p>
        )}
      </div>

      {/* Markdown编辑器 - 中文 */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium">
            中文内容 <span className="text-red-400">*</span>
          </label>
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="text-sm text-accent-green hover:underline"
          >
            {showPreview ? '隐藏预览' : '显示预览'}
          </button>
        </div>

        <div className={`grid ${showPreview ? 'grid-cols-2' : 'grid-cols-1'} gap-4`}>
          {/* 编辑区 */}
          <div>
            <textarea
              name="contentZh"
              value={formData.contentZh}
              onChange={handleChange}
              rows={20}
              className="w-full px-4 py-2 bg-card-bg border border-card-border rounded-lg focus:outline-none focus:border-accent-green font-mono text-sm"
              placeholder="支持Markdown格式"
              required
            />
          </div>

          {/* 预览区 */}
          {showPreview && (
            <div className="glass-card p-4 overflow-auto max-h-[500px]">
              <div className="prose prose-invert max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                  {formData.contentZh || '暂无内容'}
                </ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Markdown编辑器 - 英文 */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium">
            英文内容
          </label>
          <div className="flex gap-3 items-center">
            <TranslateButton
              content={formData.contentZh}
              targetField="contentEn"
              onTranslated={(translated) =>
                setFormData((prev) => ({ ...prev, contentEn: translated }))
              }
            />
          </div>
        </div>

        <div className={`grid ${showPreview ? 'grid-cols-2' : 'grid-cols-1'} gap-4`}>
          {/* 编辑区 */}
          <div>
            <textarea
              name="contentEn"
              value={formData.contentEn}
              onChange={handleChange}
              rows={20}
              className="w-full px-4 py-2 bg-card-bg border border-card-border rounded-lg focus:outline-none focus:border-accent-green font-mono text-sm"
              placeholder="English content (Markdown supported) - or use the Translate button above"
            />
          </div>

          {/* 预览区 */}
          {showPreview && (
            <div className="glass-card p-4 overflow-auto max-h-[500px]">
              <div className="prose prose-invert max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                  {formData.contentEn || 'No English content yet. Use the Translate button or type directly.'}
                </ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 提交按钮 */}
      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 glass-card hover:bg-foreground/10 rounded-lg"
        >
          取消
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-accent-green text-background rounded-lg hover:bg-accent-green/90 disabled:opacity-50"
        >
          {loading
            ? '保存中...'
            : isEditing
            ? '更新文章'
            : '创建文章'}
        </button>
      </div>
    </form>
  );
}
