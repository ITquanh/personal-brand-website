'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Skill {
  id: string;
  name: string;
  category: string;
  proficiency: number;
  description?: string;
  projects?: string[];
}

const CATEGORIES = ['AI工具', '后端', '前端', '基础设施', '数据库', 'DevOps'];

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [formData, setFormData] = useState({ name: '', category: '前端', proficiency: 50, description: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      const res = await fetch('/api/skills');
      const data = await res.json();
      if (data.success) setSkills(data.data);
    } catch (err) {
      console.error('获取技能列表失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const url = editingSkill ? `/api/skills/${editingSkill.id}` : '/api/skills';
      const method = editingSkill ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.error || '操作失败');
        return;
      }

      setSuccess(editingSkill ? '技能更新成功！' : '技能创建成功！');
      setShowForm(false);
      setEditingSkill(null);
      setFormData({ name: '', category: '前端', proficiency: 50, description: '' });
      fetchSkills();
    } catch (err) {
      setError('操作失败，请重试');
    }
  };

  const handleEdit = (skill: Skill) => {
    setEditingSkill(skill);
    setFormData({
      name: skill.name,
      category: skill.category,
      proficiency: skill.proficiency,
      description: skill.description || '',
    });
    setShowForm(true);
    setError('');
    setSuccess('');
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`确定要删除技能"${name}"吗？`)) return;

    try {
      const res = await fetch(`/api/skills/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setSuccess('技能删除成功！');
        fetchSkills();
      } else {
        setError(data.error || '删除失败');
      }
    } catch (err) {
      setError('删除失败，请重试');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingSkill(null);
    setFormData({ name: '', category: '前端', proficiency: 50, description: '' });
    setError('');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">技术栈管理</h1>
          <p className="text-foreground/60">管理你的技术栈和熟练度</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditingSkill(null); setFormData({ name: '', category: '前端', proficiency: 50, description: '' }); }}
          className="bg-accent-green text-background px-4 py-2 rounded-lg font-medium hover:bg-accent-green/90 transition-colors"
        >
          + 添加技能
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

      {/* 创建/编辑表单 */}
      {showForm && (
        <div className="glass-card p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">{editingSkill ? '编辑技能' : '添加技能'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-1">技能名称 *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-foreground/5 border border-foreground/10 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="如：Python"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-1">分类 *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-foreground/5 border border-foreground/10 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1">
                熟练度: {formData.proficiency}%
              </label>
              <input
                type="range"
                min="1"
                max="100"
                value={formData.proficiency}
                onChange={(e) => setFormData({ ...formData, proficiency: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1">描述</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-foreground/5 border border-foreground/10 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                rows={3}
                placeholder="技能描述（可选）"
              />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="bg-accent-green text-background px-6 py-2 rounded-lg font-medium hover:bg-accent-green/90 transition-colors">
                {editingSkill ? '保存修改' : '添加'}
              </button>
              <button type="button" onClick={handleCancel} className="glass-card px-6 py-2 rounded-lg font-medium hover:bg-foreground/10 transition-colors">
                取消
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 技能列表 */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card p-6 animate-pulse">
              <div className="h-4 bg-card-bg rounded w-1/3 mb-2"></div>
              <div className="h-3 bg-card-bg rounded w-1/2 mb-4"></div>
              <div className="h-2 bg-card-bg rounded w-full"></div>
            </div>
          ))}
        </div>
      ) : skills.length === 0 ? (
        <div className="text-center py-16 glass-card">
          <div className="text-4xl mb-4">🛠️</div>
          <p className="text-foreground/60 mb-4">暂无技术栈数据</p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-accent-green text-background px-6 py-2 rounded-lg font-medium hover:bg-accent-green/90 transition-colors"
          >
            添加第一个技能
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {skills.map((skill) => (
            <div key={skill.id} className="glass-card p-6 card-hover">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-lg">{skill.name}</h3>
                  <span className="text-xs px-2 py-1 rounded-full bg-card-bg text-foreground/60">{skill.category}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(skill)} className="text-sm text-accent-blue hover:underline">编辑</button>
                  <button onClick={() => handleDelete(skill.id, skill.name)} className="text-sm text-red-400 hover:underline">删除</button>
                </div>
              </div>
              {skill.description && <p className="text-sm text-foreground/60 mb-3">{skill.description}</p>}
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-card-bg rounded-full overflow-hidden">
                  <div className="h-full bg-accent-green rounded-full" style={{ width: `${skill.proficiency}%` }} />
                </div>
                <span className="text-sm text-foreground/60">{skill.proficiency}%</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
