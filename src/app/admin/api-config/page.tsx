'use client';

import { useState, useEffect } from 'react';

interface EnvConfig {
  TRANSLATION_API_KEY: string;
  TRANSLATION_API_URL: string;
  TRANSLATION_MODEL: string;
  DEEPSEEK_API_KEY: string;
  DEEPL_API_KEY: string;
  GITHUB_TOKEN: string;
  NEXT_PUBLIC_GISCUS_REPO: string;
  NEXT_PUBLIC_GISCUS_REPO_ID: string;
  NEXT_PUBLIC_GISCUS_CATEGORY_ID: string;
  NEXT_PUBLIC_SITE_URL: string;
  BLOB_READ_WRITE_TOKEN: string;
}

export default function ApiConfigPage() {
  const [config, setConfig] = useState<EnvConfig>({
    TRANSLATION_API_KEY: '',
    TRANSLATION_API_URL: '',
    TRANSLATION_MODEL: '',
    DEEPSEEK_API_KEY: '',
    DEEPL_API_KEY: '',
    GITHUB_TOKEN: '',
    NEXT_PUBLIC_GISCUS_REPO: '',
    NEXT_PUBLIC_GISCUS_REPO_ID: '',
    NEXT_PUBLIC_GISCUS_CATEGORY_ID: '',
    NEXT_PUBLIC_SITE_URL: '',
    BLOB_READ_WRITE_TOKEN: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const res = await fetch('/api/admin/env');
      const data = await res.json();
      if (data.success) setConfig(data.data);
    } catch {
      setError('加载配置失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/admin/env', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess('API 配置已保存！重启服务器后生效。');
      } else {
        setError(data.error || '保存失败');
      }
    } catch {
      setError('保存失败');
    } finally {
      setSaving(false);
    }
  };

  const toggleShow = (key: string) => {
    setShowKeys(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-green"></div>
      </div>
    );
  }

  const sections = [
    {
      title: '🤖 AI 翻译服务',
      description: '配置翻译 API 后，可在文章编辑器和配置页面使用 AI 翻译功能',
      fields: [
        { key: 'TRANSLATION_API_KEY', label: 'Translation API Key', placeholder: 'sk-...', help: '自定义 LLM 或 Deepseek 的 API 密钥' },
        { key: 'TRANSLATION_API_URL', label: 'Translation API URL', placeholder: 'https://apihub.agnes-ai.com/v1', help: '自定义 LLM 的 API 终点（可选，默认 Deepseek）' },
        { key: 'TRANSLATION_MODEL', label: 'Translation Model', placeholder: 'Agnes-2.0-Flash', help: '自定义 LLM 模型名称（可选，默认 deepseek-chat）' },
        { key: 'DEEPSEEK_API_KEY', label: 'Deepseek API Key (Legacy)', placeholder: 'sk-...', help: '旧版 Deepseek 密钥字段' },
        { key: 'DEEPL_API_KEY', label: 'DeepL API Key', placeholder: 'xxx-xxx-xxx', help: '从 deepl.com/pro-api 获取（备选）' },
      ],
    },
    {
      title: '🔗 GitHub 配置',
      description: '用于 AI 导入仓库时获取仓库信息（避免 API 限流）',
      fields: [
        { key: 'GITHUB_TOKEN', label: 'GitHub Token', placeholder: 'ghp_xxxx', help: '从 github.com/settings/tokens 获取，勾选 repo 权限' },
      ],
    },
    {
      title: '💬 Giscus 评论系统',
      description: '配置后，文章底部将显示基于 GitHub Discussions 的评论区',
      fields: [
        { key: 'NEXT_PUBLIC_GISCUS_REPO', label: '仓库名称', placeholder: 'username/repo', help: '你的 GitHub 仓库名' },
        { key: 'NEXT_PUBLIC_GISCUS_REPO_ID', label: '仓库 ID', placeholder: 'R_xxxxxxxx', help: '从 giscus.app 获取' },
        { key: 'NEXT_PUBLIC_GISCUS_CATEGORY_ID', label: '分类 ID', placeholder: 'DIC_xxxxxxxx', help: '从 giscus.app 获取' },
      ],
    },
    {
      title: '🌐 站点配置',
      description: '影响 SEO、OG 标签、Sitemap 等',
      fields: [
        { key: 'NEXT_PUBLIC_SITE_URL', label: '站点 URL', placeholder: 'https://yourdomain.com', help: '不带末尾斜杠' },
      ],
    },
    {
      title: '📁 文件存储',
      description: '用于图片和 Markdown 文件上传',
      fields: [
        { key: 'BLOB_READ_WRITE_TOKEN', label: 'Vercel Blob Token', placeholder: 'vercel_blob_xxxx', help: '从 Vercel Dashboard > Storage 获取' },
      ],
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">API 配置</h1>
          <p className="text-foreground/60">管理所有外部服务的 API 密钥和配置</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-accent-green text-background rounded-lg font-medium hover:bg-accent-green/90 transition-colors disabled:opacity-50"
        >
          {saving ? '保存中...' : '💾 保存全部配置'}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 glass-card bg-red-500/10 border-red-500/20">
          <p className="text-red-400">{error}</p>
        </div>
      )}
      {success && (
        <div className="mb-4 p-4 glass-card bg-green-500/10 border-green-500/20">
          <p className="text-green-400">{success}</p>
        </div>
      )}

      <div className="space-y-6">
        {sections.map((section) => (
          <div key={section.title} className="glass-card p-6">
            <h2 className="text-lg font-bold mb-1">{section.title}</h2>
            <p className="text-sm text-foreground/40 mb-4">{section.description}</p>
            <div className="space-y-4">
              {section.fields.map((field) => (
                <div key={field.key}>
                  <label className="block text-sm font-medium mb-1">{field.label}</label>
                  <div className="relative">
                    <input
                      type={showKeys[field.key] ? 'text' : 'password'}
                      value={config[field.key as keyof EnvConfig] || ''}
                      onChange={(e) => setConfig(prev => ({ ...prev, [field.key]: e.target.value }))}
                      className="w-full px-4 py-3 pr-20 bg-card-bg border border-card-border rounded-lg focus:outline-none focus:border-accent-green font-mono text-sm"
                      placeholder={field.placeholder}
                    />
                    <button
                      type="button"
                      onClick={() => toggleShow(field.key)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-foreground/40 hover:text-foreground/60"
                    >
                      {showKeys[field.key] ? '隐藏' : '显示'}
                    </button>
                  </div>
                  <p className="text-xs text-foreground/30 mt-1">{field.help}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
