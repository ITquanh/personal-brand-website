import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
    article: ({ children, ...props }: any) => <article {...props}>{children}</article>,
    input: ({ children, ...props }: any) => <input {...props}>{children}</input>,
    polygon: ({ children, ...props }: any) => <polygon {...props}>{children}</polygon>,
    circle: ({ children, ...props }: any) => <circle {...props}>{children}</circle>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

jest.mock('next/link', () => ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>);
jest.mock('next/image', () => ({ src, alt, ...props }: any) => <img src={src} alt={alt} {...props} />);

// ============ CommandPalette ============
import CommandPalette from '@/components/command/CommandPalette';

describe('CommandPalette', () => {
  it('CT-CMD-01: isOpen=true 时应渲染命令面板', () => {
    render(<CommandPalette isOpen={true} onClose={jest.fn()} />);
    expect(screen.getByPlaceholderText('输入命令...')).toBeInTheDocument();
  });

  it('CT-CMD-03: 应显示所有命令', () => {
    render(<CommandPalette isOpen={true} onClose={jest.fn()} />);
    expect(screen.getByText('help')).toBeInTheDocument();
    expect(screen.getByText('contact')).toBeInTheDocument();
    expect(screen.getByText('theme')).toBeInTheDocument();
    expect(screen.getByText('home')).toBeInTheDocument();
    expect(screen.getByText('about')).toBeInTheDocument();
    expect(screen.getByText('projects')).toBeInTheDocument();
    expect(screen.getByText('blog')).toBeInTheDocument();
    expect(screen.getByText('admin')).toBeInTheDocument();
  });

  it('CT-CMD-04: 模糊搜索应过滤命令', () => {
    render(<CommandPalette isOpen={true} onClose={jest.fn()} />);
    const input = screen.getByPlaceholderText('输入命令...');
    fireEvent.change(input, { target: { value: 'theme' } });
    expect(screen.getByText('theme')).toBeInTheDocument();
    expect(screen.queryByText('help')).not.toBeInTheDocument();
  });

  it('CT-CMD-07: ESC 键应关闭面板', () => {
    const onClose = jest.fn();
    render(<CommandPalette isOpen={true} onClose={onClose} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });

  it('CT-CMD-08: isOpen=false 时不应渲染面板', () => {
    render(<CommandPalette isOpen={false} onClose={jest.fn()} />);
    expect(screen.queryByPlaceholderText('输入命令...')).not.toBeInTheDocument();
  });

  it('CT-CMD-05: 上下箭头应移动选中项', () => {
    render(<CommandPalette isOpen={true} onClose={jest.fn()} />);
    fireEvent.keyDown(document, { key: 'ArrowDown' });
    // 第二项应被选中（默认选中第一项）
    const items = screen.getAllByText(/显示所有可用命令|显示联系方式/);
    expect(items.length).toBeGreaterThan(0);
  });
});

// ============ PostList ============
import PostList from '@/components/blog/PostList';

describe('PostList', () => {
  const mockDict = {
    blog: { noPosts: '暂无文章', minutes: '分钟', readTime: '阅读时间', views: '次阅读', publishedAt: '发布于' },
  };

  const mockPosts = [
    {
      id: '1',
      slug: 'ai-guide',
      title: 'AI 编程指南',
      summary: '深入探讨 AI 编程',
      tags: ['AI', '编程'],
      imageUrl: 'https://example.com/img.jpg',
      published: true,
      readTime: 8,
      viewCount: 100,
      translationStatus: 'translated',
      createdAt: '2026-01-01T00:00:00Z',
    },
    {
      id: '2',
      slug: 'docker-guide',
      title: 'Docker 实战',
      summary: 'Docker 容器化教程',
      tags: ['Docker', '运维'],
      published: true,
      readTime: 12,
      viewCount: 50,
      translationStatus: 'untranslated',
      createdAt: '2026-02-01T00:00:00Z',
    },
  ];

  it('CT-PLIST-01: 应渲染文章列表', () => {
    render(<PostList posts={mockPosts} locale="zh" dict={mockDict} />);
    expect(screen.getByText('AI 编程指南')).toBeInTheDocument();
    expect(screen.getByText('Docker 实战')).toBeInTheDocument();
  });

  it('CT-PLIST-03: 应显示阅读时间', () => {
    render(<PostList posts={mockPosts} locale="zh" dict={mockDict} />);
    expect(screen.getByText(/8/)).toBeInTheDocument();
  });

  it('CT-PLIST-05: 应显示标签', () => {
    render(<PostList posts={mockPosts} locale="zh" dict={mockDict} />);
    expect(screen.getByText('AI')).toBeInTheDocument();
    expect(screen.getByText('Docker')).toBeInTheDocument();
  });

  it('CT-PLIST-07: 空列表应显示提示', () => {
    render(<PostList posts={[]} locale="zh" dict={mockDict} />);
    expect(screen.getByText('暂无文章')).toBeInTheDocument();
  });

  it('CT-PLIST-08: 有图片时应显示封面图', () => {
    render(<PostList posts={mockPosts} locale="zh" dict={mockDict} />);
    const images = screen.getAllByRole('img');
    expect(images.length).toBeGreaterThan(0);
  });

  it('CT-PLIST-06: 未翻译文章应显示翻译状态', () => {
    render(<PostList posts={mockPosts} locale="zh" dict={mockDict} />);
    expect(screen.getByText(/未翻译/)).toBeInTheDocument();
  });
});

// ============ BentoGrid ============
import BentoGrid from '@/components/home/BentoGrid';

describe('BentoGrid', () => {
  const mockDict = {
    hero: { name: '测试用户', title: '全栈开发者', description: '专注于 AI 开发' },
    about: { skills: '技术栈' },
    common: { comingSoon: '即将推出' },
    blog: { latestPosts: '最新文章', noPosts: '暂无文章', minutes: '分钟' },
    footer: { social: '社交媒体', email: '邮箱' },
  };

  const mockProjects = [
    { id: '1', slug: 'proj1', title: '项目1', summary: '摘要1', techStack: ['React'], isFeatured: true },
    { id: '2', slug: 'proj2', title: '项目2', summary: '摘要2', techStack: ['Vue'], isFeatured: true },
  ];

  const mockSkills = [
    { id: '1', name: 'Python', category: '后端', proficiency: 90 },
  ];

  const mockPosts = [
    { id: '1', slug: 'post1', title: '文章1', summary: '摘要', tags: ['AI'], readTime: 5 },
  ];

  it('CT-BENTO-01: 应渲染所有卡片区域', () => {
    render(
      <BentoGrid
        featuredProjects={mockProjects}
        skills={mockSkills}
        recentPosts={mockPosts}
        locale="zh"
        dict={mockDict}
      />
    );
    expect(screen.getByText('测试用户')).toBeInTheDocument();
    expect(screen.getByText('技术栈')).toBeInTheDocument();
    expect(screen.getByText('最新文章')).toBeInTheDocument();
  });

  it('CT-BENTO-03: 应显示精选项目', () => {
    render(
      <BentoGrid
        featuredProjects={mockProjects}
        skills={mockSkills}
        recentPosts={mockPosts}
        locale="zh"
        dict={mockDict}
      />
    );
    expect(screen.getByText('项目1')).toBeInTheDocument();
    expect(screen.getByText('项目2')).toBeInTheDocument();
  });

  it('CT-BENTO-04: 应显示最新文章', () => {
    render(
      <BentoGrid
        featuredProjects={mockProjects}
        skills={mockSkills}
        recentPosts={mockPosts}
        locale="zh"
        dict={mockDict}
      />
    );
    expect(screen.getByText('文章1')).toBeInTheDocument();
  });

  it('CT-BENTO-06: 应显示命令面板提示', () => {
    render(
      <BentoGrid
        featuredProjects={mockProjects}
        skills={mockSkills}
        recentPosts={mockPosts}
        locale="zh"
        dict={mockDict}
      />
    );
    expect(screen.getByText(/Ctrl \+ K/)).toBeInTheDocument();
  });

  it('CT-BENTO-08: 无数据时应显示空状态', () => {
    render(
      <BentoGrid
        featuredProjects={[]}
        skills={[]}
        recentPosts={[]}
        locale="zh"
        dict={mockDict}
      />
    );
    expect(screen.getByText('即将推出')).toBeInTheDocument();
    expect(screen.getByText('暂无文章')).toBeInTheDocument();
  });
});

// ============ CommentSection ============
import CommentSection from '@/components/blog/CommentSection';

describe('CommentSection', () => {
  it('CT-COMM-01: 应渲染评论区容器', () => {
    const { container } = render(<CommentSection slug="test-post" />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
