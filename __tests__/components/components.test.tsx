import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
    polygon: ({ children, ...props }: any) => <polygon {...props}>{children}</polygon>,
    circle: ({ children, ...props }: any) => <circle {...props}>{children}</circle>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>;
});

// Mock next/image
jest.mock('next/image', () => {
  return ({ src, alt, ...props }: any) => <img src={src} alt={alt} {...props} />;
});

import ThemeToggle from '@/components/layout/ThemeToggle';
import HeroTerminal from '@/components/home/HeroTerminal';
import ProjectCard from '@/components/home/ProjectCard';
import Timeline from '@/components/about/Timeline';
import SkillCloud from '@/components/about/SkillCloud';

// ============ ThemeToggle ============
describe('ThemeToggle', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it('CT-TOGGLE-05: 应有无障碍 sr-only 标签', () => {
    // 需要提供 ThemeContext
    const { ThemeProvider } = require('@/contexts/ThemeContext');
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );
    expect(screen.getByText(/切换到亮色模式|切换到暗色模式/)).toBeInTheDocument();
  });
});

// ============ HeroTerminal ============
describe('HeroTerminal', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it('CT-HERO-01: 应渲染终端窗口', () => {
    render(<HeroTerminal onComplete={jest.fn()} />);
    expect(screen.getByText('terminal')).toBeInTheDocument();
  });

  it('CT-HERO-05: 点击跳过应立即调用 onComplete', () => {
    const onComplete = jest.fn();
    render(<HeroTerminal onComplete={onComplete} />);

    // 等待跳过按钮出现（1.5秒后）
    act(() => { jest.advanceTimersByTime(1500); });

    const skipButton = screen.getByText(/跳过动画/);
    expect(skipButton).toBeInTheDocument();

    fireEvent.click(skipButton);
    act(() => { jest.advanceTimersByTime(1000); });
    expect(onComplete).toHaveBeenCalled();
  });

  it('CT-HERO-04: 应在5秒后自动完成', () => {
    const onComplete = jest.fn();
    render(<HeroTerminal onComplete={onComplete} />);

    act(() => { jest.advanceTimersByTime(6000); });
    expect(onComplete).toHaveBeenCalled();
  });

  it('CT-HERO-06: skipable=false 时不应显示跳过按钮', () => {
    render(<HeroTerminal onComplete={jest.fn()} skipable={false} />);
    act(() => { jest.advanceTimersByTime(2000); });
    expect(screen.queryByText(/跳过动画/)).not.toBeInTheDocument();
  });
});

// ============ ProjectCard ============
describe('ProjectCard', () => {
  const mockProject = {
    id: '1',
    slug: 'test-project',
    title: '测试项目',
    summary: '这是一个测试项目',
    techStack: ['Next.js', 'TypeScript', 'Prisma'],
    imageUrl: 'https://example.com/img.jpg',
    quantifiedImpact: '提升效率 60%',
    isFeatured: true,
  };

  it('CT-PCARD-01: 应渲染项目基本信息', () => {
    render(<ProjectCard project={mockProject} locale="zh" index={0} />);
    expect(screen.getByText('测试项目')).toBeInTheDocument();
    expect(screen.getByText('这是一个测试项目')).toBeInTheDocument();
  });

  it('CT-PCARD-02: 应显示技术栈标签', () => {
    render(<ProjectCard project={mockProject} locale="zh" index={0} />);
    expect(screen.getByText('Next.js')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
  });

  it('CT-PCARD-03: 应显示量化指标', () => {
    render(<ProjectCard project={mockProject} locale="zh" index={0} />);
    expect(screen.getByText(/提升效率 60%/)).toBeInTheDocument();
  });

  it('CT-PCARD-04: 精选项目应显示徽章', () => {
    render(<ProjectCard project={mockProject} locale="zh" index={0} />);
    expect(screen.getByText('精选')).toBeInTheDocument();
  });

  it('CT-PCARD-04b: 非精选项目不应显示徽章', () => {
    const nonFeatured = { ...mockProject, isFeatured: false };
    render(<ProjectCard project={nonFeatured} locale="zh" index={0} />);
    expect(screen.queryByText('精选')).not.toBeInTheDocument();
  });

  it('CT-PCARD-05: 应包含指向详情页的链接', () => {
    render(<ProjectCard project={mockProject} locale="zh" index={0} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/zh/projects/test-project');
  });

  it('CT-PCARD-06: 无图片时应显示默认图标', () => {
    const noImage = { ...mockProject, imageUrl: undefined };
    render(<ProjectCard project={noImage} locale="zh" index={0} />);
    expect(screen.getByText('🚀')).toBeInTheDocument();
  });
});

// ============ Timeline ============
describe('Timeline', () => {
  const mockEvents = [
    {
      id: '1',
      date: '2024-01',
      title: '全栈开发工程师',
      company: '某科技公司',
      description: '负责全栈开发工作',
      achievements: ['完成项目A', '优化性能提升50%'],
      type: 'work' as const,
    },
    {
      id: '2',
      date: '2023-06',
      title: '计算机科学学士',
      company: '某大学',
      description: '计算机科学与技术专业',
      type: 'education' as const,
    },
  ];

  const mockDict = {
    about: { timeline: '职业发展' },
  };

  it('CT-TIME-01: 应渲染所有时间轴事件', () => {
    render(<Timeline events={mockEvents} dict={mockDict} />);
    expect(screen.getByText('全栈开发工程师')).toBeInTheDocument();
    expect(screen.getByText('计算机科学学士')).toBeInTheDocument();
  });

  it('CT-TIME-03: 应显示事件类型标签', () => {
    render(<Timeline events={mockEvents} dict={mockDict} />);
    expect(screen.getByText(/工作经历/)).toBeInTheDocument();
    expect(screen.getByText(/教育背景/)).toBeInTheDocument();
  });

  it('CT-TIME-06: 应正确显示日期', () => {
    render(<Timeline events={mockEvents} dict={mockDict} />);
    expect(screen.getByText('2024-01')).toBeInTheDocument();
    expect(screen.getByText('2023-06')).toBeInTheDocument();
  });

  it('CT-TIME-04: 应显示公司名称', () => {
    render(<Timeline events={mockEvents} dict={mockDict} />);
    expect(screen.getByText('某科技公司')).toBeInTheDocument();
    expect(screen.getByText('某大学')).toBeInTheDocument();
  });
});

// ============ SkillCloud ============
describe('SkillCloud', () => {
  const mockSkills = [
    { id: '1', name: 'Python', category: '后端', proficiency: 90, projects: ['proj1'] },
    { id: '2', name: 'Next.js', category: '前端', proficiency: 85 },
    { id: '3', name: 'Docker', category: '基础设施', proficiency: 75 },
  ];

  it('CT-SKILL-01: 标签云模式应渲染技能标签', () => {
    render(<SkillCloud skills={mockSkills} viewMode="cloud" />);
    expect(screen.getByText('Python')).toBeInTheDocument();
    expect(screen.getByText('Next.js')).toBeInTheDocument();
    expect(screen.getByText('Docker')).toBeInTheDocument();
  });

  it('CT-SKILL-02: 雷达图模式应渲染 SVG', () => {
    const { container } = render(<SkillCloud skills={mockSkills} viewMode="radar" />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('CT-SKILL-02b: 雷达图应显示分类名称', () => {
    render(<SkillCloud skills={mockSkills} viewMode="radar" />);
    // 雷达图中分类名出现两次（SVG标签 + 底部统计），用getAllByText
    expect(screen.getAllByText('后端').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('前端').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('基础设施').length).toBeGreaterThanOrEqual(1);
  });
});
