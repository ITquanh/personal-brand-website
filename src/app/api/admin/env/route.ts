import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import * as fs from 'fs';
import * as path from 'path';

const ENV_PATH = path.join(process.cwd(), '.env');

// 支持的环境变量字段
const ENV_FIELDS = [
  'TRANSLATION_API_KEY', 'TRANSLATION_API_URL', 'TRANSLATION_MODEL',
  'DEEPSEEK_API_KEY', 'DEEPL_API_KEY', 'GITHUB_TOKEN',
  'NEXT_PUBLIC_GISCUS_REPO', 'NEXT_PUBLIC_GISCUS_REPO_ID', 'NEXT_PUBLIC_GISCUS_CATEGORY_ID',
  'NEXT_PUBLIC_SITE_URL', 'BLOB_READ_WRITE_TOKEN',
];

function parseEnv(content: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.substring(0, eqIdx).trim();
    let value = trimmed.substring(eqIdx + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    result[key] = value;
  }
  return result;
}

function updateEnvField(content: string, key: string, value: string): string {
  const regex = new RegExp(`^${key}=.*$`, 'm');
  const line = `${key}="${value}"`;
  if (regex.test(content)) {
    return content.replace(regex, line);
  }
  return content.trimEnd() + '\n' + line + '\n';
}

export async function GET() {
  try {
    let session;
    try { session = await auth(); } catch { return NextResponse.json({ success: false, error: '未授权' }, { status: 401 }); }
    if (!session?.user) {
      return NextResponse.json({ success: false, error: '未授权' }, { status: 401 });
    }

    const content = fs.readFileSync(ENV_PATH, 'utf-8');
    const env = parseEnv(content);

    const data: Record<string, string> = {};
    for (const field of ENV_FIELDS) {
      data[field] = env[field] || '';
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    let session;
    try { session = await auth(); } catch { return NextResponse.json({ success: false, error: '未授权' }, { status: 401 }); }
    if (!session?.user) {
      return NextResponse.json({ success: false, error: '未授权' }, { status: 401 });
    }

    const body = await request.json();
    let content = fs.readFileSync(ENV_PATH, 'utf-8');

    for (const field of ENV_FIELDS) {
      if (body[field] !== undefined) {
        content = updateEnvField(content, field, body[field]);
      }
    }

    fs.writeFileSync(ENV_PATH, content, 'utf-8');

    return NextResponse.json({
      success: true,
      message: 'API 配置已保存',
      note: '部分配置需要重启服务器才能生效',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
