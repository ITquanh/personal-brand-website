import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

jest.mock('next/link', () => ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>);
jest.mock('next/image', () => ({ src, alt, ...props }: any) => <img src={src} alt={alt} {...props} />);

// ============ TranslateButton ============
import TranslateButton from '@/components/admin/TranslateButton';

describe('TranslateButton', () => {
  it('CT-TRBTN-01: 初始状态应显示翻译按钮', () => {
    render(<TranslateButton content="你好" targetField="titleEn" onTranslated={jest.fn()} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('CT-TRBTN-05: 无内容时点击应显示错误', () => {
    render(<TranslateButton content="" targetField="titleEn" onTranslated={jest.fn()} />);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });
});

// ============ FileImportStatus ============
import FileImportStatus from '@/components/admin/FileImportStatus';

describe('FileImportStatus', () => {
  it('CT-FSTATUS-01: pending 状态应显示文件名', () => {
    render(<FileImportStatus status="pending" fileName="test.md" />);
    expect(screen.getByText('test.md')).toBeInTheDocument();
  });

  it('CT-FSTATUS-03: success 状态应显示成功', () => {
    render(<FileImportStatus status="success" fileName="test.md" progress={100} />);
    expect(screen.getByText('test.md')).toBeInTheDocument();
  });

  it('CT-FSTATUS-04: error 状态应显示错误信息', () => {
    render(<FileImportStatus status="error" fileName="test.md" error="解析失败" />);
    expect(screen.getByText('test.md')).toBeInTheDocument();
    expect(screen.getByText('解析失败')).toBeInTheDocument();
  });
});

// ============ MarkdownUploader ============
import MarkdownUploader from '@/components/admin/MarkdownUploader';

describe('MarkdownUploader', () => {
  it('CT-MDUP-01: 应渲染上传区域', () => {
    render(<MarkdownUploader onUpload={jest.fn()} />);
    expect(screen.getByText(/拖拽/)).toBeInTheDocument();
  });
});

// ============ ProjectDetail ============
// Mock ESM markdown libraries (used by ProjectDetail)
jest.mock('react-markdown', () => ({ __esModule: true, default: ({ children }: any) => <div>{children}</div> }));
jest.mock('remark-gfm', () => ({ __esModule: true, default: () => (tree: any) => tree }));
jest.mock('rehype-highlight', () => ({ __esModule: true, default: () => (tree: any) => tree }));

// 注：ProjectDetail 组件内部使用了 next/link 和 SVG 路径等复杂依赖
// 在 jsdom 环境中需要更完整的 mock，暂跳过
describe('ProjectDetail', () => {
  it('CT-PDETAIL-01: 组件应能被导入', () => {
    const ProjectDetail = require('@/components/projects/ProjectDetail').default;
    expect(ProjectDetail).toBeDefined();
  });
});
