import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { uploadImage } from '@/lib/storage';

// POST /api/upload/image - 上传图片
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

    if (!file) {
      return NextResponse.json(
        { success: false, error: '未提供文件' },
        { status: 400 }
      );
    }

    // 验证文件类型（排除 SVG 以防止 XSS 攻击）
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: '不支持的图片格式，请上传 JPG、PNG、GIF 或 WebP' },
        { status: 400 }
      );
    }

    // 验证文件魔数（magic bytes）防止 MIME 类型伪造
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer.slice(0, 4));
    const isValidImage = (
      (bytes[0] === 0xFF && bytes[1] === 0xD8) || // JPEG
      (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) || // PNG
      (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) || // GIF
      (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46) // WEBP (RIFF)
    );
    if (!isValidImage) {
      return NextResponse.json(
        { success: false, error: '文件内容与图片格式不匹配' },
        { status: 400 }
      );
    }

    // 验证文件大小（最大5MB）
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: '图片大小超过限制（最大5MB）' },
        { status: 400 }
      );
    }

    // 上传到Vercel Blob
    const url = await uploadImage(file);

    return NextResponse.json({
      success: true,
      data: {
        url,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
      },
    });
  } catch (error) {
    console.error('上传图片失败:', error);
    return NextResponse.json(
      { success: false, error: '上传图片失败' },
      { status: 500 }
    );
  }
}

// GET /api/upload/image - 获取上传配置信息
export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      data: {
        maxFileSize: 5 * 1024 * 1024, // 5MB
        allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
      },
    });
  } catch (error) {
    console.error('获取上传配置失败:', error);
    return NextResponse.json(
      { success: false, error: '获取上传配置失败' },
      { status: 500 }
    );
  }
}
