import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { uploadMarkdown } from '@/lib/storage';

// POST /api/upload/markdown - 上传Markdown/MDX文件
export async function POST(request: NextRequest) {
  try {
    // 验证管理员权限
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: '未授权访问' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const rawType = formData.get('type') as string || 'post';
    const type = ['post', 'project'].includes(rawType) ? rawType : 'post';

    if (!file) {
      return NextResponse.json(
        { success: false, error: '未提供文件' },
        { status: 400 }
      );
    }

    // 验证文件类型
    const validExtensions = ['.md', '.mdx'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();

    if (!validExtensions.includes(fileExtension)) {
      return NextResponse.json(
        { success: false, error: '不支持的文件格式，请上传 .md 或 .mdx 文件' },
        { status: 400 }
      );
    }

    // 验证文件大小（最大10MB）
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: '文件大小超过限制（最大10MB）' },
        { status: 400 }
      );
    }

    // 读取文件内容
    const content = await file.text();

    // 解析Front Matter
    const parsed = parseFrontMatter(content);

    // 上传到Vercel Blob
    const url = await uploadMarkdown(file);

    // 生成slug（如果没有提供）
    const slug = parsed.frontmatter.slug ||
      generateSlug(parsed.frontmatter.title || file.name.replace(/\.(md|mdx)$/, ''));

    return NextResponse.json({
      success: true,
      data: {
        url,
        slug,
        frontmatter: parsed.frontmatter,
        content: parsed.content,
        rawContent: content,
        fileName: file.name,
        fileSize: file.size,
        type,
      },
    });
  } catch (error) {
    console.error('上传Markdown文件失败:', error);
    return NextResponse.json(
      { success: false, error: '上传Markdown文件失败' },
      { status: 500 }
    );
  }
}

// 解析Front Matter
function parseFrontMatter(content: string): {
  frontmatter: Record<string, any>;
  content: string;
} {
  const frontmatterRegex = /^---\s*\r?\n([\s\S]*?)\r?\n---\s*\r?\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    return {
      frontmatter: {},
      content,
    };
  }

  const frontmatterStr = match[1];
  const markdownContent = match[2];

  // 简单的YAML解析（支持基本的键值对）
  const frontmatter: Record<string, any> = {};
  const lines = frontmatterStr.split('\n');

  for (const line of lines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) continue;

    const key = line.substring(0, colonIndex).trim();
    let value: any = line.substring(colonIndex + 1).trim();

    // 处理数组（如 tags: [AI, Next.js]）
    if (value.startsWith('[') && value.endsWith(']')) {
      value = value.slice(1, -1).split(',').map((v: string) => v.trim());
    }
    // 处理布尔值
    else if (value === 'true') {
      value = true;
    } else if (value === 'false') {
      value = false;
    }
    // 处理数字
    else if (/^\d+$/.test(value)) {
      value = parseInt(value);
    }
    // 处理引号包裹的字符串
    else if ((value.startsWith('"') && value.endsWith('"')) ||
             (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    frontmatter[key] = value;
  }

  return {
    frontmatter,
    content: markdownContent,
  };
}

// 生成URL友好的slug
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // 移除特殊字符
    .replace(/\s+/g, '-') // 空格替换为连字符
    .replace(/-+/g, '-') // 多个连字符合并
    .trim();
}
