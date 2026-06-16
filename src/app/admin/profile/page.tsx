'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface ProfileData {
  name: string;
  nameEn: string;
  jobTitle: string;
  jobTitleEn: string;
  bio: string;
  bioEn: string;
  siteTitle: string;
  siteTitleEn: string;
  siteDescription: string;
  siteDescriptionEn: string;
  githubUrl: string;
  email: string;
  linkedinUrl: string;
}

export default function ProfilePage() {
  const [data, setData] = useState<ProfileData>({
    name: '', nameEn: '',
    jobTitle: '', jobTitleEn: '',
    bio: '', bioEn: '',
    siteTitle: '', siteTitleEn: '',
    siteDescription: '', siteDescriptionEn: '',
    githubUrl: '', email: '', linkedinUrl: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 加载当前配置
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const res = await fetch('/api/admin/profile');
        const result = await res.json();
        if (result.success) {
          setData(result.data);
        }
      } catch (err) {
        setError('加载配置失败');
      } finally {
        setLoading(false);
      }
    };
    loadConfig();
  }, []);

  // 保存配置
  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/admin/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (result.success) {
        setSuccess('配置已保存！刷新页面后生效。');
      } else {
        setError(result.error || '保存失败');
      }
    } catch (err) {
      setError('保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  // AI 翻译所有中文字段
  const handleTranslateAll = async () => {
    setTranslating(true);
    setError('');
    try {
      const fieldsToTranslate = [
        { key: 'name', zh: data.name },
        { key: 'jobTitle', zh: data.jobTitle },
        { key: 'bio', zh: data.bio },
        { key: 'siteTitle', zh: data.siteTitle },
        { key: 'siteDescription', zh: data.siteDescription },
      ];

      const updates: Partial<ProfileData> = {};

      for (const field of fieldsToTranslate) {
        if (!field.zh.trim()) continue;
        try {
          const res = await fetch('/api/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: field.zh, targetLang: 'en' }),
          });
          const result = await res.json();
          if (result.success && result.translated) {
            const enKey = (field.key + 'En') as keyof ProfileData;
            (updates as any)[enKey] = result.translated;
          }
        } catch {
          // 单个字段翻译失败不影响其他字段
        }
      }

      setData(prev => ({ ...prev, ...updates }));
      setSuccess('翻译完成！请检查英文内容后保存。');
    } catch (err) {
      setError('翻译失败，请重试');
    } finally {
      setTranslating(false);
    }
  };

  // 翻译单个字段
  const translateField = async (zhKey: keyof ProfileData, enKey: keyof ProfileData) => {
    const text = data[zhKey] as string;
    if (!text?.trim()) return;

    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, targetLang: 'en' }),
      });
      const result = await res.json();
      if (result.success && result.translated) {
        setData(prev => ({ ...prev, [enKey]: result.translated }));
      }
    } catch {
      // 翻译失败静默处理
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-green"></div>
      </div>
    );
  }

  const fields = [
    { zhKey: 'name' as const, enKey: 'nameEn' as const, label: '姓名', placeholder: 'HackBit' },
    { zhKey: 'jobTitle' as const, enKey: 'jobTitleEn' as const, label: '职业头衔', placeholder: '全栈开发者' },
    { zhKey: 'bio' as const, enKey: 'bioEn' as const, label: '个人简介', placeholder: '专注于AI辅助开发...', multiline: true },
    { zhKey: 'siteTitle' as const, enKey: 'siteTitleEn' as const, label: '网站标题', placeholder: '个人技术品牌' },
    { zhKey: 'siteDescription' as const, enKey: 'siteDescriptionEn' as const, label: '网站描述', placeholder: '集极客美学与高信息密度...', multiline: true },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">个人信息管理</h1>
          <p className="text-foreground/60">编辑中文内容后，点击"AI翻译"自动生成英文版本</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleTranslateAll}
            disabled={translating}
            className="px-4 py-2 bg-accent-purple text-background rounded-lg font-medium hover:bg-accent-purple/90 transition-colors disabled:opacity-50"
          >
            {translating ? '翻译中...' : '🌐 AI 一键翻译全部'}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-accent-green text-background rounded-lg font-medium hover:bg-accent-green/90 transition-colors disabled:opacity-50"
          >
            {saving ? '保存中...' : '💾 保存配置'}
          </button>
        </div>
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

      {/* 个人信息字段 */}
      <div className="space-y-6">
        {fields.map(({ zhKey, enKey, label, placeholder, multiline }) => (
          <div key={zhKey} className="glass-card p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* 中文 */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  🇨🇳 {label}（中文）
                </label>
                {multiline ? (
                  <textarea
                    value={data[zhKey]}
                    onChange={(e) => setData(prev => ({ ...prev, [zhKey]: e.target.value }))}
                    className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-lg focus:outline-none focus:border-accent-green resize-none"
                    rows={3}
                    placeholder={placeholder}
                  />
                ) : (
                  <input
                    type="text"
                    value={data[zhKey]}
                    onChange={(e) => setData(prev => ({ ...prev, [zhKey]: e.target.value }))}
                    className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-lg focus:outline-none focus:border-accent-green"
                    placeholder={placeholder}
                  />
                )}
              </div>

              {/* 英文 + 翻译按钮 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">🇬🇧 {label}（English）</label>
                  <button
                    onClick={() => translateField(zhKey, enKey)}
                    className="text-xs text-accent-purple hover:underline"
                  >
                    🌐 翻译此项
                  </button>
                </div>
                {multiline ? (
                  <textarea
                    value={data[enKey]}
                    onChange={(e) => setData(prev => ({ ...prev, [enKey]: e.target.value }))}
                    className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-lg focus:outline-none focus:border-accent-green resize-none"
                    rows={3}
                    placeholder="English version..."
                  />
                ) : (
                  <input
                    type="text"
                    value={data[enKey]}
                    onChange={(e) => setData(prev => ({ ...prev, [enKey]: e.target.value }))}
                    className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-lg focus:outline-none focus:border-accent-green"
                    placeholder="English version..."
                  />
                )}
              </div>
            </div>
          </div>
        ))}

        {/* 联系方式 */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-bold mb-4">🔗 联系方式</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">GitHub URL</label>
              <input
                type="url"
                value={data.githubUrl}
                onChange={(e) => setData(prev => ({ ...prev, githubUrl: e.target.value }))}
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-lg focus:outline-none focus:border-accent-green"
                placeholder="https://github.com/username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">邮箱</label>
              <input
                type="email"
                value={data.email}
                onChange={(e) => setData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-lg focus:outline-none focus:border-accent-green"
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">LinkedIn URL</label>
              <input
                type="url"
                value={data.linkedinUrl}
                onChange={(e) => setData(prev => ({ ...prev, linkedinUrl: e.target.value }))}
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-lg focus:outline-none focus:border-accent-green"
                placeholder="https://linkedin.com/in/username"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 使用说明 */}
      <div className="mt-8 glass-card p-6">
        <h3 className="font-bold mb-2">📖 使用说明</h3>
        <ul className="text-sm text-foreground/60 space-y-1">
          <li>• 在左侧中文栏输入内容</li>
          <li>• 点击"翻译此项"自动翻译单个字段，或点击"AI一键翻译全部"批量翻译</li>
          <li>• 英文栏可手动修改翻译结果</li>
          <li>• 修改完成后点击"保存配置"</li>
          <li>• 配置保存后需要刷新页面才能看到效果</li>
          <li>• 翻译功能需要配置 DEEPSEEK_API_KEY 或 DEEPL_API_KEY 环境变量</li>
        </ul>
      </div>
    </div>
  );
}
