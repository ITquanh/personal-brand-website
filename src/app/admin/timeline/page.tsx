'use client';

import { useState, useEffect } from 'react';

interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  titleEn: string;
  company: string;
  companyEn: string;
  description: string;
  descriptionEn: string;
  achievements: string[];
  achievementsEn: string[];
  type: 'work' | 'education' | 'project';
}

const TYPE_OPTIONS = [
  { value: 'work', label: '工作经历', icon: '💼' },
  { value: 'education', label: '教育背景', icon: '🎓' },
  { value: 'project', label: '项目经历', icon: '🚀' },
];

export default function TimelineEditorPage() {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [translatingId, setTranslatingId] = useState<string | null>(null);

  useEffect(() => {
    loadTimeline();
  }, []);

  const loadTimeline = async () => {
    try {
      const res = await fetch('/api/admin/timeline');
      const data = await res.json();
      if (data.success) setEvents(data.data);
    } catch {
      setError('加载时间轴数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/admin/timeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(events),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess('时间轴数据已保存！');
      } else {
        setError(data.error || '保存失败');
      }
    } catch {
      setError('保存失败');
    } finally {
      setSaving(false);
    }
  };

  const addEvent = () => {
    const newEvent: TimelineEvent = {
      id: Date.now().toString(),
      date: '',
      title: '',
      titleEn: '',
      company: '',
      companyEn: '',
      description: '',
      descriptionEn: '',
      achievements: [''],
      achievementsEn: [''],
      type: 'work',
    };
    setEvents(prev => [newEvent, ...prev]);
  };

  const removeEvent = (id: string) => {
    if (!confirm('确定要删除这条履历吗？')) return;
    setEvents(prev => prev.filter(e => e.id !== id));
  };

  const updateEvent = (id: string, field: string, value: any) => {
    setEvents(prev => prev.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const updateAchievement = (id: string, index: number, value: string, isEn: boolean = false) => {
    const field = isEn ? 'achievementsEn' : 'achievements';
    setEvents(prev => prev.map(e => {
      if (e.id !== id) return e;
      const arr = [...e[field]];
      arr[index] = value;
      return { ...e, [field]: arr };
    }));
  };

  const addAchievement = (id: string, isEn: boolean = false) => {
    const field = isEn ? 'achievementsEn' : 'achievements';
    setEvents(prev => prev.map(e => {
      if (e.id !== id) return e;
      return { ...e, [field]: [...e[field], ''] };
    }));
  };

  const removeAchievement = (id: string, index: number, isEn: boolean = false) => {
    const field = isEn ? 'achievementsEn' : 'achievements';
    setEvents(prev => prev.map(e => {
      if (e.id !== id) return e;
      const arr = [...e[field]];
      arr.splice(index, 1);
      return { ...e, [field]: arr };
    }));
  };

  const moveEvent = (id: string, direction: 'up' | 'down') => {
    setEvents(prev => {
      const idx = prev.findIndex(e => e.id === id);
      if (idx === -1) return prev;
      const newIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (newIdx < 0 || newIdx >= prev.length) return prev;
      const arr = [...prev];
      [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
      return arr;
    });
  };

  // AI 翻译单条履历
  const translateEvent = async (id: string) => {
    const event = events.find(e => e.id === id);
    if (!event) return;

    setTranslatingId(id);
    try {
      const fields = [
        { zh: event.title, setter: (v: string) => updateEvent(id, 'titleEn', v) },
        { zh: event.company, setter: (v: string) => updateEvent(id, 'companyEn', v) },
        { zh: event.description, setter: (v: string) => updateEvent(id, 'descriptionEn', v) },
      ];

      for (const field of fields) {
        if (!field.zh.trim()) continue;
        const res = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: field.zh, targetLang: 'en' }),
        });
        const data = await res.json();
        if (data.success && data.translated) {
          field.setter(data.translated);
        }
      }

      // 翻译成就列表
      for (let i = 0; i < event.achievements.length; i++) {
        const ach = event.achievements[i];
        if (!ach.trim()) continue;
        const res = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: ach, targetLang: 'en' }),
        });
        const data = await res.json();
        if (data.success && data.translated) {
          updateAchievement(id, i, data.translated, true);
        }
      }
    } catch {
      // 翻译失败静默处理
    } finally {
      setTranslatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-green"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">个人履历管理</h1>
          <p className="text-foreground/60">编辑时间轴中的工作经历、教育背景等信息</p>
        </div>
        <div className="flex gap-3">
          <button onClick={addEvent} className="px-4 py-2 bg-accent-blue text-background rounded-lg font-medium hover:bg-accent-blue/90 transition-colors">
            + 添加履历
          </button>
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-accent-green text-background rounded-lg font-medium hover:bg-accent-green/90 transition-colors disabled:opacity-50">
            {saving ? '保存中...' : '💾 保存全部'}
          </button>
        </div>
      </div>

      {error && <div className="mb-4 p-4 glass-card bg-red-500/10 border-red-500/20"><p className="text-red-400">{error}</p></div>}
      {success && <div className="mb-4 p-4 glass-card bg-green-500/10 border-green-500/20"><p className="text-green-400">{success}</p></div>}

      <div className="space-y-6">
        {events.map((event, idx) => (
          <div key={event.id} className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">
                  {event.type === 'work' ? '💼' : event.type === 'education' ? '🎓' : '🚀'}
                </span>
                <span className="font-bold text-lg">履历 #{events.length - idx}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => moveEvent(event.id, 'up')} className="text-sm text-foreground/40 hover:text-foreground px-2 py-1 rounded" disabled={idx === events.length - 1}>↑</button>
                <button onClick={() => moveEvent(event.id, 'down')} className="text-sm text-foreground/40 hover:text-foreground px-2 py-1 rounded" disabled={idx === 0}>↓</button>
                <button onClick={() => translateEvent(event.id)} disabled={translatingId === event.id} className="text-sm text-accent-purple hover:underline px-2 py-1">
                  {translatingId === event.id ? '翻译中...' : '🌐 AI翻译'}
                </button>
                <button onClick={() => removeEvent(event.id)} className="text-sm text-red-400 hover:underline px-2 py-1">🗑️ 删除</button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">类型</label>
                <select value={event.type} onChange={(e) => updateEvent(event.id, 'type', e.target.value)} className="w-full px-3 py-2 bg-card-bg border border-card-border rounded-lg focus:outline-none focus:border-accent-green">
                  {TYPE_OPTIONS.map(t => <option key={t.value} value={t.value}>{t.icon} {t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">日期</label>
                <input type="text" value={event.date} onChange={(e) => updateEvent(event.id, 'date', e.target.value)} className="w-full px-3 py-2 bg-card-bg border border-card-border rounded-lg focus:outline-none focus:border-accent-green" placeholder="2024 - 至今" />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">🇨🇳 职位标题</label>
                <input type="text" value={event.title} onChange={(e) => updateEvent(event.id, 'title', e.target.value)} className="w-full px-3 py-2 bg-card-bg border border-card-border rounded-lg focus:outline-none focus:border-accent-green" placeholder="全栈开发工程师" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">🇬🇧 Job Title</label>
                <input type="text" value={event.titleEn} onChange={(e) => updateEvent(event.id, 'titleEn', e.target.value)} className="w-full px-3 py-2 bg-card-bg border border-card-border rounded-lg focus:outline-none focus:border-accent-green" placeholder="Full Stack Developer" />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">🇨🇳 公司/学校</label>
                <input type="text" value={event.company} onChange={(e) => updateEvent(event.id, 'company', e.target.value)} className="w-full px-3 py-2 bg-card-bg border border-card-border rounded-lg focus:outline-none focus:border-accent-green" placeholder="某科技公司" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">🇬🇧 Company/University</label>
                <input type="text" value={event.companyEn} onChange={(e) => updateEvent(event.id, 'companyEn', e.target.value)} className="w-full px-3 py-2 bg-card-bg border border-card-border rounded-lg focus:outline-none focus:border-accent-green" placeholder="A Tech Company" />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">🇨🇳 描述</label>
                <textarea value={event.description} onChange={(e) => updateEvent(event.id, 'description', e.target.value)} className="w-full px-3 py-2 bg-card-bg border border-card-border rounded-lg focus:outline-none focus:border-accent-green resize-none" rows={2} placeholder="负责全栈开发工作..." />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">🇬🇧 Description</label>
                <textarea value={event.descriptionEn} onChange={(e) => updateEvent(event.id, 'descriptionEn', e.target.value)} className="w-full px-3 py-2 bg-card-bg border border-card-border rounded-lg focus:outline-none focus:border-accent-green resize-none" rows={2} placeholder="Responsible for full-stack development..." />
              </div>
            </div>

            {/* 成就列表 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">🇨🇳 成就/亮点</label>
                {event.achievements.map((ach, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input type="text" value={ach} onChange={(e) => updateAchievement(event.id, i, e.target.value)} className="flex-1 px-3 py-2 bg-card-bg border border-card-border rounded-lg focus:outline-none focus:border-accent-green text-sm" placeholder={`成就 ${i + 1}`} />
                    <button onClick={() => removeAchievement(event.id, i)} className="text-red-400 hover:text-red-300 px-2">×</button>
                  </div>
                ))}
                <button onClick={() => addAchievement(event.id)} className="text-sm text-accent-green hover:underline">+ 添加成就</button>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">🇬🇧 Achievements</label>
                {event.achievementsEn.map((ach, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input type="text" value={ach} onChange={(e) => updateAchievement(event.id, i, e.target.value, true)} className="flex-1 px-3 py-2 bg-card-bg border border-card-border rounded-lg focus:outline-none focus:border-accent-green text-sm" placeholder={`Achievement ${i + 1}`} />
                    <button onClick={() => removeAchievement(event.id, i, true)} className="text-red-400 hover:text-red-300 px-2">×</button>
                  </div>
                ))}
                <button onClick={() => addAchievement(event.id, true)} className="text-sm text-accent-green hover:underline">+ Add Achievement</button>
              </div>
            </div>
          </div>
        ))}

        {events.length === 0 && (
          <div className="text-center py-16 glass-card">
            <div className="text-4xl mb-4">📋</div>
            <p className="text-foreground/60 mb-4">暂无履历数据</p>
            <button onClick={addEvent} className="bg-accent-green text-background px-6 py-2 rounded-lg font-medium hover:bg-accent-green/90 transition-colors">
              添加第一条履历
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
