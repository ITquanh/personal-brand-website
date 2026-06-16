// jest-dom matchers - 在测试文件中直接导入
// 这个文件只用于全局 mock

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    prefetch: jest.fn(),
    pathname: '/zh',
  }),
  usePathname: () => '/zh',
  useSearchParams: () => new URLSearchParams(),
}));
