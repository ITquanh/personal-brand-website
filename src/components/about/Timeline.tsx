'use client';

import { motion } from 'framer-motion';
import { useRef } from 'react';

interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  company?: string;
  description: string;
  achievements?: string[];
  type: 'work' | 'education' | 'project';
}

interface TimelineProps {
  events: TimelineEvent[];
  dict: any;
}

export default function Timeline({ events, dict }: TimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} className="relative" role="list" aria-label={dict.about?.timeline || 'Timeline'}>
      {/* 时间轴线 */}
      <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-card-border transform -translate-x-1/2" aria-hidden="true"></div>

      {/* 事件列表 */}
      <div className="space-y-12">
        {events.map((event, index) => (
          <TimelineItem
            key={event.id}
            event={event}
            index={index}
            isLeft={index % 2 === 0}
            dict={dict}
          />
        ))}
      </div>
    </div>
  );
}

function TimelineItem({
  event,
  index,
  isLeft,
  dict,
}: {
  event: TimelineEvent;
  index: number;
  isLeft: boolean;
  dict: any;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true, margin: '-100px' }}
      role="listitem"
      aria-label={`${event.date} - ${event.title}`}
      className={`relative flex items-start ${
        isLeft ? 'md:flex-row' : 'md:flex-row-reverse'
      }`}
    >
      {/* 时间点 */}
      <div className="absolute left-4 md:left-1/2 w-4 h-4 bg-accent-green rounded-full transform -translate-x-1/2 z-10"></div>

      {/* 内容卡片 */}
      <div
        className={`ml-12 md:ml-0 md:w-5/12 ${
          isLeft ? 'md:pr-12' : 'md:pl-12'
        }`}
      >
        <div className="glass-card p-6 card-hover group">
          {/* 日期 */}
          <div className="text-sm text-accent-green font-mono mb-2">
            {event.date}
          </div>

          {/* 类型标签 */}
          <div className="inline-block text-xs px-2 py-1 rounded-full bg-card-bg text-foreground/60 mb-3">
            {event.type === 'work'
              ? '💼 工作经历'
              : event.type === 'education'
              ? '🎓 教育背景'
              : '🚀 项目经历'}
          </div>

          {/* 标题和公司 */}
          <h3 className="text-lg font-bold mb-1">{event.title}</h3>
          {event.company && (
            <p className="text-foreground/60 text-sm mb-3">{event.company}</p>
          )}

          {/* 描述 */}
          <p className="text-foreground/80 text-sm mb-4">{event.description}</p>

          {/* 成就指标（悬停显示） */}
          {event.achievements && event.achievements.length > 0 && (
            <div className="overflow-hidden">
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                whileHover={{ height: 'auto', opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="space-y-2"
              >
                <p className="text-xs text-foreground/40 font-medium">
                  主要成就：
                </p>
                {event.achievements.map((achievement, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 text-sm text-accent-green"
                  >
                    <span>✓</span>
                    <span>{achievement}</span>
                  </div>
                ))}
              </motion.div>
            </div>
          )}

          {/* 悬停提示 */}
          {event.achievements && event.achievements.length > 0 && (
            <div className="mt-3 text-xs text-foreground/40 group-hover:hidden">
              悬停查看详情 ↓
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
