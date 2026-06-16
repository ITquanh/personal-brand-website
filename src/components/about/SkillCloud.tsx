'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

interface Skill {
  id: string;
  name: string;
  category: string;
  proficiency: number;
  description?: string;
  projects?: string[];
}

interface SkillCloudProps {
  skills: Skill[];
  viewMode: 'cloud' | 'radar';
}

export default function SkillCloud({ skills, viewMode }: SkillCloudProps) {
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);

  if (viewMode === 'radar') {
    return <RadarChart skills={skills} />;
  }

  return (
    <div className="relative">
      {/* 标签云 */}
      <div className="flex flex-wrap gap-3 justify-center">
        {skills.map((skill, index) => (
          <motion.div
            key={skill.id}
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.1 }}
            onMouseEnter={() => setSelectedSkill(skill)}
            onMouseLeave={() => setSelectedSkill(null)}
            className="relative"
          >
            <div
              className="px-4 py-2 rounded-lg cursor-pointer transition-colors"
              style={{
                fontSize: `${12 + skill.proficiency / 10}px`,
                backgroundColor: getCategoryColor(skill.category),
                color: '#fff',
              }}
            >
              {skill.name}
            </div>

            {/* 悬停详情 */}
            {selectedSkill?.id === skill.id && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-2 p-3 glass-card min-w-[200px]"
              >
                <div className="text-sm font-bold mb-1">{skill.name}</div>
                <div className="text-xs text-foreground/60 mb-2">
                  {skill.category}
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex-1 h-2 bg-card-bg rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent-green rounded-full"
                      style={{ width: `${skill.proficiency}%` }}
                    />
                  </div>
                  <span className="text-xs text-foreground/60">
                    {skill.proficiency}%
                  </span>
                </div>
                {skill.projects && skill.projects.length > 0 && (
                  <div className="text-xs text-foreground/40">
                    相关项目: {skill.projects.join(', ')}
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function RadarChart({ skills }: { skills: Skill[] }) {
  // 按分类分组
  const categories = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  const categoryNames = Object.keys(categories);
  const centerX = 150;
  const centerY = 150;
  const radius = 120;
  const angleStep = (2 * Math.PI) / categoryNames.length;

  // 计算每个分类的平均熟练度
  const categoryProficiencies = categoryNames.map((category) => {
    const categorySkills = categories[category];
    const avgProficiency =
      categorySkills.reduce((sum, s) => sum + s.proficiency, 0) /
      categorySkills.length;
    return avgProficiency;
  });

  // 计算雷达图顶点
  const points = categoryNames.map((_, index) => {
    const angle = index * angleStep - Math.PI / 2;
    const proficiency = categoryProficiencies[index];
    const r = (proficiency / 100) * radius;
    return {
      x: centerX + r * Math.cos(angle),
      y: centerY + r * Math.sin(angle),
    };
  });

  // 生成多边形路径
  const polygonPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';

  return (
    <div className="flex flex-col items-center">
      <svg width="300" height="300" viewBox="0 0 300 300">
        {/* 背景网格 */}
        {[0.2, 0.4, 0.6, 0.8, 1].map((scale) => (
          <polygon
            key={scale}
            points={categoryNames
              .map((_, index) => {
                const angle = index * angleStep - Math.PI / 2;
                const r = scale * radius;
                return `${centerX + r * Math.cos(angle)},${centerY + r * Math.sin(angle)}`;
              })
              .join(' ')}
            fill="none"
            stroke="var(--card-border)"
            strokeWidth="0.5"
          />
        ))}

        {/* 轴线 */}
        {categoryNames.map((_, index) => {
          const angle = index * angleStep - Math.PI / 2;
          return (
            <line
              key={index}
              x1={centerX}
              y1={centerY}
              x2={centerX + radius * Math.cos(angle)}
              y2={centerY + radius * Math.sin(angle)}
              stroke="var(--card-border)"
              strokeWidth="0.5"
            />
          );
        })}

        {/* 数据多边形 */}
        <motion.polygon
          initial={{ opacity: 0, scale: 0 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          points={points.map((p) => `${p.x},${p.y}`).join(' ')}
          fill="var(--accent-green)"
          fillOpacity="0.2"
          stroke="var(--accent-green)"
          strokeWidth="2"
        />

        {/* 数据点 */}
        {points.map((point, index) => (
          <motion.circle
            key={index}
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.8 + index * 0.1 }}
            viewport={{ once: true }}
            cx={point.x}
            cy={point.y}
            r="4"
            fill="var(--accent-green)"
          />
        ))}

        {/* 分类标签 */}
        {categoryNames.map((category, index) => {
          const angle = index * angleStep - Math.PI / 2;
          const labelRadius = radius + 20;
          const x = centerX + labelRadius * Math.cos(angle);
          const y = centerY + labelRadius * Math.sin(angle);
          return (
            <text
              key={index}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-xs fill-foreground/60"
            >
              {category}
            </text>
          );
        })}
      </svg>

      {/* 分类详情 */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-md">
        {categoryNames.map((category, index) => (
          <div key={category} className="text-center">
            <div className="text-sm font-bold text-accent-green">
              {Math.round(categoryProficiencies[index])}%
            </div>
            <div className="text-xs text-foreground/60">{category}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    'AI工具': '#a855f7',
    '后端': '#3b82f6',
    '前端': '#10b981',
    '基础设施': '#f59e0b',
    '数据库': '#ef4444',
    'DevOps': '#06b6d4',
  };
  return colors[category] || '#6b7280';
}
