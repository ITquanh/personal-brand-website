'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import TranslateButton from './TranslateButton';

interface ProjectFormProps {
  project?: any;
  isEditing?: boolean;
}

export default function ProjectForm({
  project,
  isEditing = false,
}: ProjectFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    slug: '',
    titleZh: '',
    titleEn: '',
    summaryZh: '',
    summaryEn: '',
    techStack: [] as string[],
    architectureZh: '',
    architectureEn: '',
    quantifiedImpact: '',
    githubUrl: '',
    demoUrl: '',
    imageUrl: '',
    isFeatured: false,
    translationStatus: 'untranslated',
  });

  const [techInput, setTechInput] = useState('');

  // 初始化表单数据（使用 ref 避免重复初始化）
  const initializedRef = useRef(false);
  useEffect(() => {
    if (project && !initializedRef.current) {
      initializedRef.current = true;
      setFormData({
        slug: project.slug || '',
        titleZh: project.titleZh || '',
        titleEn: project.titleEn || '',
        summaryZh: project.summaryZh || '',
        summaryEn: project.summaryEn || '',
        techStack: project.techStack || [],
        architectureZh: project.architectureZh || '',
        architectureEn: project.architectureEn || '',
        quantifiedImpact: project.quantifiedImpact || '',
        githubUrl: project.githubUrl || '',
        demoUrl: project.demoUrl || '',
        imageUrl: project.imageUrl || '',
        isFeatured: project.isFeatured || false,
        translationStatus: project.translationStatus || 'untranslated',
      });
    }
  }, [project]);

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

  // 添加技术栈
  const handleAddTech = () => {
    if (techInput.trim() && !formData.techStack.includes(techInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        techStack: [...prev.techStack, techInput.trim()],
      }));
      setTechInput('');
    }
  };

  // 删除技术栈
  const handleRemoveTech = (tech: string) => {
    setFormData((prev) => ({
      ...prev,
      techStack: prev.techStack.filter((t) => t !== tech),
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
      if (!formData.slug || !formData.titleZh || !formData.summaryZh) {
        throw new Error('请填写所有必填字段');
      }

      // 验证 slug 格式
      const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
      if (!slugRegex.test(formData.slug)) {
        throw new Error('Slug 只能包含小写字母、数字和连字符（如 my-project）');
      }

      if (isEditing && !project?.id) {
        throw new Error('编辑模式下缺少项目数据');
      }

      const url = isEditing
        ? `/api/projects/${project!.id}`
        : '/api/projects';

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
          router.push(`/admin/projects/${data.data.id}`);
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
          {isEditing ? '项目更新成功！' : '项目创建成功！'}
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
            placeholder="my-project"
            required
          />
          <p className="text-xs text-foreground/40 mt-1">
            URL友好的标识符，如：my-project
          </p>
        </div>

        {/* 量化指标 */}
        <div>
          <label className="block text-sm font-medium mb-2">
            量化指标
          </label>
          <input
            type="text"
            name="quantifiedImpact"
            value={formData.quantifiedImpact}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-card-bg border border-card-border rounded-lg focus:outline-none focus:border-accent-green"
            placeholder="节约80%报表工时"
          />
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
            placeholder="项目中文标题"
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
            placeholder="Project English Title"
          />
        </div>

        {/* 中文摘要 */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-2">
            中文摘要 <span className="text-red-400">*</span>
          </label>
          <textarea
            name="summaryZh"
            value={formData.summaryZh}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-2 bg-card-bg border border-card-border rounded-lg focus:outline-none focus:border-accent-green"
            placeholder="项目中文摘要"
            required
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
            rows={3}
            className="w-full px-4 py-2 bg-card-bg border border-card-border rounded-lg focus:outline-none focus:border-accent-green"
            placeholder="Project English Summary"
          />
        </div>

        {/* 技术栈 */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-2">
            技术栈
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={techInput}
              onChange={(e) => setTechInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTech();
                }
              }}
              className="flex-1 px-4 py-2 bg-card-bg border border-card-border rounded-lg focus:outline-none focus:border-accent-green"
              placeholder="输入技术栈，按回车添加"
            />
            <button
              type="button"
              onClick={handleAddTech}
              className="px-4 py-2 bg-accent-green text-background rounded-lg hover:bg-accent-green/90"
            >
              添加
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.techStack.map((tech) => (
              <span
                key={tech}
                className="flex items-center gap-2 px-3 py-1 bg-card-bg rounded-full text-sm"
              >
                {tech}
                <button
                  type="button"
                  onClick={() => handleRemoveTech(tech)}
                  className="text-red-400 hover:text-red-300"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* 中文架构解析 */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-2">
            中文架构解析
          </label>
          <textarea
            name="architectureZh"
            value={formData.architectureZh}
            onChange={handleChange}
            rows={6}
            className="w-full px-4 py-2 bg-card-bg border border-card-border rounded-lg focus:outline-none focus:border-accent-green font-mono text-sm"
            placeholder="支持Markdown格式"
          />
          <TranslateButton
            content={formData.architectureZh}
            targetField="architectureEn"
            onTranslated={(translated) =>
              setFormData((prev) => ({ ...prev, architectureEn: translated }))
            }
          />
        </div>

        {/* 英文架构解析 */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-2">
            英文架构解析
          </label>
          <textarea
            name="architectureEn"
            value={formData.architectureEn}
            onChange={handleChange}
            rows={6}
            className="w-full px-4 py-2 bg-card-bg border border-card-border rounded-lg focus:outline-none focus:border-accent-green font-mono text-sm"
            placeholder="Supports Markdown format"
          />
        </div>

        {/* GitHub URL */}
        <div>
          <label className="block text-sm font-medium mb-2">
            GitHub URL
          </label>
          <input
            type="url"
            name="githubUrl"
            value={formData.githubUrl}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-card-bg border border-card-border rounded-lg focus:outline-none focus:border-accent-green"
            placeholder="https://github.com/username/repo"
          />
        </div>

        {/* Demo URL */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Demo URL
          </label>
          <input
            type="url"
            name="demoUrl"
            value={formData.demoUrl}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-card-bg border border-card-border rounded-lg focus:outline-none focus:border-accent-green"
            placeholder="https://demo.example.com"
          />
        </div>

        {/* 图片URL */}
        <div>
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

        {/* 精选项目 */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            name="isFeatured"
            checked={formData.isFeatured}
            onChange={handleChange}
            className="w-4 h-4 rounded border-card-border"
          />
          <label className="text-sm font-medium">
            设为精选项目（首页展示）
          </label>
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
            ? '更新项目'
            : '创建项目'}
        </button>
      </div>
    </form>
  );
}
