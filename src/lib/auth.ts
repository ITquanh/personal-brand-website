import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { timingSafeEqual } from 'crypto';
import { getServerSession } from 'next-auth/next';

// 管理员凭据 - 从环境变量读取，生产环境必须配置
const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

// 常量时间比较，防止时序攻击
function safeCompare(a: string, b: string): boolean {
  if (!a || !b) return false;
  if (a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: '用户名', type: 'text' },
        password: { label: '密码', type: 'password' },
      },
      async authorize(credentials) {
        if (!ADMIN_USERNAME || !ADMIN_PASSWORD) {
          console.error('管理员凭据未配置，请设置 ADMIN_USERNAME 和 ADMIN_PASSWORD 环境变量');
          return null;
        }

        const username = credentials?.username || '';
        const password = credentials?.password || '';

        if (safeCompare(username, ADMIN_USERNAME) && safeCompare(password, ADMIN_PASSWORD)) {
          return {
            id: 'admin-user-id',
            email: 'admin@local.dev',
            name: '管理员',
          };
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: any; user?: any }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (session.user) {
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
  pages: {
    signIn: '/admin/login',
  },
  session: {
    strategy: 'jwt' as const,
  },
  secret: process.env.NEXTAUTH_SECRET || (() => {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('NEXTAUTH_SECRET 必须在生产环境中配置');
    }
    return 'dev-secret-only-for-development';
  })(),
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

// 使用 getServerSession 代替 v5 的 auth
export async function auth() {
  return await getServerSession(authOptions);
}

export const signIn = undefined as any;
export const signOut = undefined as any;

// 获取当前登录用户
export async function getCurrentUser() {
  const session = await auth();
  return session?.user;
}
