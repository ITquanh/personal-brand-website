'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface AboutData {
  // 基本信息
  siteTitle: string;
  siteTitleEn: string;
  siteDescription: string;
  siteDescriptionEn: string;
  name: string;
  nameEn: string;
  jobTitle: string;
  jobTitleEn: string;
  bio: string;
  bioEn: string;

  // 联系方式
  githubUrl: string;
  email: string;
  linkedinUrl: string;

  // 统计数据
  yearsExperience: string;
  projectsCompleted: string;
  clientsServed: string;

  // 终端内容
  terminalRole: string;
  terminalSkills: string[];
  terminalWelcomeMessage: string;
}

export default function AboutAdminPage() {
  const [data, setData] = useState<AboutData>({
    siteTitle: '',
    siteTitleEn: '',
    siteDescription: '',
    siteDescriptionEn: '',
    name: '',
    nameEn: '',
    jobTitle: '',
    jobTitleEn: '',
    bio: '',
    bioEn: '',
    githubUrl: '',
    email: '',
    linkedinUrl: '',
    yearsExperience: '5+',
    projectsCompleted: '20+',
    clientsServed: '10+',
    terminalRole: '',
    terminalSkills: [],
    terminalWelcomeMessage: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [translatingField, setTranslatingField] = useState<string | null>(null);

  // 加载当前配置
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const res = await fetch('/api/admin/about');
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
      const res = await fetch('/api/admin/about', {
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

  // AI 翻译单个字段
  const translateField = async (zhKey: keyof AboutData, enKey: keyof AboutData, fieldName: string) => {
    setTranslatingField(fieldName);
    const text = data[zhKey] as string;
    if (!text?.trim()) {
      setTranslatingField(null);
      return;
    }

    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, targetLang: 'en' }),
      });
      const result = await res.json();
      if (result.success && result.translated) {
        setData(prev => ({ ...prev, [enKey]: result.translated }));
        setSuccess(`"${fieldName}" 翻译完成！`);
      }
    } catch {
      // 翻译失败静默处理
    } finally {
      setTranslatingField(null);
    }
  };

  // 管理 terminal skills
  const updateSkill = (index: number, value: string) => {
    const newSkills = [...data.terminalSkills];
    newSkills[index] = value;
    setData(prev => ({ ...prev, terminalSkills: newSkills }));
  };

  const addSkill = () => {
    setData(prev => ({ ...prev, terminalSkills: [...prev.terminalSkills, ''] }));
  };

  const removeSkill = (index: number) => {
    const newSkills = data.terminalSkills.filter((_, i) => i !== index);
    setData(prev => ({ ...prev, terminalSkills: newSkills }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-green"></div>
      </div>
    );
  }

  // 通用输入框组件
  const InputField = ({
    zhKey, enKey, label, placeholder, multiline = false
  }: {
    zhKey: keyof AboutData; enKey?: keyof AboutData | ''; label: string; placeholder: string; multiline?: boolean
  }) => (
    <div className="glass-card p-6">
      <div className={`grid grid-cols-1 ${enKey ? 'lg:grid-cols-2' : ''} gap-4`}>
        {/* 中文 */}
        <div>
          <label className="block text-sm font-medium mb-2">
            🇨🇳 {label}（中文）
          </label>
          {multiline ? (
            <textarea
              value={data[zhKey] as string}
              onChange={(e) => setData(prev => ({ ...prev, [zhKey]: e.target.value }))}
              className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-lg focus:outline-none focus:border-accent-green resize-none"
              rows={3}
              placeholder={placeholder}
            />
          ) : (
            <input
              type="text"
              value={data[zhKey] as string}
              onChange={(e) => setData(prev => ({ ...prev, [zhKey]: e.target.value }))}
              className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-lg focus:outline-none focus:border-accent-green"
              placeholder={placeholder}
            />
          )}
        </div>

        {/* 英文 */}
        {enKey && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">🇬🇧 {label}（English）</label>
              <button
                onClick={() => translateField(zhKey, enKey, label)}
                disabled={translatingField === label}
                className="text-xs text-accent-purple hover:underline flex items-center gap-1"
              >
                {translatingField === label ? '翻译中...' : '🌐 翻译此项'}
              </button>
            </div>
            {multiline ? (
              <textarea
                value={data[enKey] as string}
                onChange={(e) => setData(prev => ({ ...prev, [enKey]: e.target.value }))}
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-lg focus:outline-none focus:border-accent-green resize-none"
                rows={3}
                placeholder="English version..."
              />
            ) : (
              <input
                type="text"
                value={data[enKey] as string}
                onChange={(e) => setData(prev => ({ ...prev, [enKey]: e.target.value }))}
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-lg focus:outline-none focus:border-accent-green"
                placeholder="English version..."
              />
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">_about_ 管理后台</h1>
          <p className="text-foreground/60">编辑"关于我"页面的所有内容，支持中英双语翻译</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 bg-accent-green text-background rounded-lg font-medium hover:bg-accent-green/90 transition-colors disabled:opacity-50"
          >
            {saving ? '保存中...' : '💾 保存全部配置'}
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

      {/* 网站基本信息 */}
      <div className="space-y-6">
        <div className="glass-card p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span>🌐</span> 网站基本信息
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              zhKey="siteTitle"
              enKey="siteTitleEn"
              label="网站标题"
              placeholder="个人技术品牌"
            />
            <InputField
              zhKey="siteDescription"
              enKey="siteDescriptionEn"
              label="网站描述"
              placeholder="集极客美学与高信息密度于一体的个人全栈数字空间"
              multiline
            />
          </div>
        </div>
      </div>

      {/* 个人信息 */}
      <div className="space-y-6 mt-6">
        <div className="glass-card p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span>👤</span> 个人信息
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              zhKey="name"
              enKey="nameEn"
              label="姓名"
              placeholder="HackBit"
            />
            <InputField
              zhKey="jobTitle"
              enKey="jobTitleEn"
              label="职业头衔"
              placeholder="全栈开发者"
            />
            <InputField
              zhKey="bio"
              enKey="bioEn"
              label="个人简介"
              placeholder="专注于AI辅助开发、系统自动化和全栈工程"
              multiline
            />
          </div>
        </div>
      </div>

      {/* 联系方式 */}
      <div className="space-y-6 mt-6">
        <div className="glass-card p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span>🔗</span> 联系方式
          </h2>
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

      {/* 统计数据 */}
      <div className="space-y-6 mt-6">
        <div className="glass-card p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span>📊</span> 统计数据（首页展示）
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">年经验</label>
              <input
                type="text"
                value={data.yearsExperience}
                onChange={(e) => setData(prev => ({ ...prev, yearsExperience: e.target.value }))}
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-lg focus:outline-none focus:border-accent-green"
                placeholder="5+"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">完成项目</label>
              <input
                type="text"
                value={data.projectsCompleted}
                onChange={(e) => setData(prev => ({ ...prev, projectsCompleted: e.target.value }))}
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-lg focus:outline-none focus:border-accent-green"
                placeholder="20+"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">服务客户</label>
              <input
                type="text"
                value={data.clientsServed}
                onChange={(e) => setData(prev => ({ ...prev, clientsServed: e.target.value }))}
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-lg focus:outline-none focus:border-accent-green"
                placeholder="10+"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 终端内容 */}
      <div className="space-y-6 mt-6">
        <div className="glass-card p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span>💻</span> 终端内容（Command Panel）
          </h2>
          <div className="space-y-4">
            <InputField
              zhKey="terminalRole"
              enKey=""
              label="角色描述"
              placeholder="全栈开发者 | AI辅助开发专家"
            />
            <div>
              <label className="block text-sm font-medium mb-2">技术栈技能（每行一个）</label>
              <div className="space-y-2">
                {data.terminalSkills.map((skill, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={skill}
                      onChange={(e) => updateSkill(index, e.target.value)}
                      className="flex-1 px-4 py-2 bg-card-bg border border-card-border rounded-lg focus:outline-none focus:border-accent-green"
                      placeholder={`技能 ${index + 1}`}
                    />
                    <button
                      onClick={() => removeSkill(index)}
                      className="px-3 py-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={addSkill}
                className="mt-2 px-4 py-2 bg-accent-green/10 text-accent-green rounded-lg hover:bg-accent-green/20 transition-colors"
              >
                + 添加技能
              </button>
            </div>
            <InputField
              zhKey="terminalWelcomeMessage"
              enKey=""
              label="欢迎消息"
              placeholder="✓ 部署成功！欢迎来到我的数字空间"
            />
          </div>
        </div>
      </div>

      {/* 预览提示 */}
      <div className="mt-8 glass-card p-6 rounded-lg">
        <h3 className="font-bold mb-2 flex items-center gap-2">
          <span>📖</span> 使用说明
        </h3>
        <ul className="text-sm text-foreground/60 space-y-2">
          <li>• 在左侧中文栏输入内容，右侧英文栏会自动提示翻译</li>
          <li>• 点击"翻译此项"使用 AI 自动翻译（需要配置翻译 API）</li>
          <li>• 统计数据用于首页展示的数字卡片</li>
          <li>• 终端内容在命令面板（Ctrl+K）中显示</li>
          <li>• 所有修改点击"保存全部配置"后生效</li>
        </ul>
      </div>
    </div>
  );
}
