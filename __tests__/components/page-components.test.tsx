import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
    article: ({ children, ...props }: any) => <article {...props}>{children}</article>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

jest.mock('next/link', () => ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>);
jest.mock('next/image', () => ({ src, alt, ...props }: any) => <img src={src} alt={alt} {...props} />);

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
  usePathname: () => '/zh',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock next-auth/react
jest.mock('next-auth/react', () => ({
  useSession: () => ({ data: { user: { name: 'admin' } }, status: 'authenticated' }),
  signIn: jest.fn(),
  signOut: jest.fn(),
  SessionProvider: ({ children }: any) => <>{children}</>,
}));

// Mock global fetch
global.fetch = jest.fn();

// ============ AdminLayout ============
import AdminLayout from '@/components/admin/AdminLayout';

describe('AdminLayout', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockReset();
  });

  it('CT-ADMIN-02: 应渲染侧边栏导航', () => {
    render(<AdminLayout><div>子内容</div></AdminLayout>);
    expect(screen.getByText('仪表盘')).toBeInTheDocument();
    expect(screen.getByText('项目管理')).toBeInTheDocument();
    expect(screen.getByText('文章管理')).toBeInTheDocument();
  });

  it('CT-ADMIN-03: 应显示用户信息', () => {
    render(<AdminLayout><div>子内容</div></AdminLayout>);
    expect(screen.getByText('admin')).toBeInTheDocument();
  });

  it('CT-ADMIN-04: 应有登出按钮', () => {
    render(<AdminLayout><div>子内容</div></AdminLayout>);
    expect(screen.getByText(/退出/)).toBeInTheDocument();
  });

  it('CT-ADMIN-05: 应渲染子内容', () => {
    render(<AdminLayout><div>测试内容</div></AdminLayout>);
    expect(screen.getByText('测试内容')).toBeInTheDocument();
  });
});

// ============ PostContent ============
jest.mock('react-markdown', () => ({ __esModule: true, default: ({ children }: any) => <div>{children}</div> }));
jest.mock('remark-gfm', () => ({ __esModule: true, default: () => (tree: any) => tree }));
jest.mock('rehype-highlight', () => ({ __esModule: true, default: () => (tree: any) => tree }));
jest.mock('rehype-raw', () => ({ __esModule: true, default: () => (tree: any) => tree }));

describe('PostContent', () => {
  it('CT-PCONT-01: 组件应能被导入', () => {
    const PostContent = require('@/components/blog/PostContent').default;
    expect(PostContent).toBeDefined();
  });
});

// ============ ProjectWall ============
describe('ProjectWall', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockReset();
  });

  it('CT-PWALL-01: 组件应能被导入', () => {
    const ProjectWall = require('@/components/projects/ProjectWall').default;
    expect(ProjectWall).toBeDefined();
  });
});
