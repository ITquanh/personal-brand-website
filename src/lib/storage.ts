import { put, del, list } from '@vercel/blob';

export async function uploadFile(file: File, path: string): Promise<string> {
  const blob = await put(path, file, {
    access: 'public',
  });

  return blob.url;
}

export async function deleteFile(url: string): Promise<void> {
  await del(url);
}

export async function listFiles(prefix?: string) {
  const { blobs } = await list({
    prefix,
  });

  return blobs;
}

export async function uploadImage(file: File): Promise<string> {
  // 生成唯一的文件名
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const extension = file.name.split('.').pop();
  const filename = `images/${timestamp}-${randomString}.${extension}`;

  return uploadFile(file, filename);
}

export async function uploadMarkdown(file: File): Promise<string> {
  // 生成唯一的文件名
  const timestamp = Date.now();
  const filename = `markdown/${timestamp}-${file.name}`;

  return uploadFile(file, filename);
}
