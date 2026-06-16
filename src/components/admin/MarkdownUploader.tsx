'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

interface MarkdownUploaderProps {
  type: 'post' | 'project';
  onImportComplete: (data: any) => void;
  onError?: (error: Error) => void;
}

interface ParsedFile {
  file: File;
  frontmatter: Record<string, any>;
  content: string;
  slug: string;
  status: 'pending' | 'parsing' | 'parsed' | 'error';
  error?: string;
}

export default function MarkdownUploader({
  type,
  onImportComplete,
  onError,
}: MarkdownUploaderProps) {
  const [files, setFiles] = useState<ParsedFile[]>([]);
  const [importing, setImporting] = useState(false);

  // 处理文件拖拽
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setFiles((prevFiles) => {
        const startIndex = prevFiles.length;
        const newFiles: ParsedFile[] = acceptedFiles.map((file) => ({
          file,
          frontmatter: {},
          content: '',
          slug: '',
          status: 'pending' as const,
        }));

        // 使用 setTimeout 确保状态更新后再解析
        setTimeout(() => {
          acceptedFiles.forEach((file, index) => {
            parseFile(file, startIndex + index);
          });
        }, 0);

        return [...prevFiles, ...newFiles];
      });
    },
    [] // 不再依赖 files.length
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/markdown': ['.md'],
      'text/x-markdown': ['.mdx'],
    },
    multiple: true,
  });

  // 解析文件
  const parseFile = async (file: File, index: number) => {
    try {
      setFiles((prev) =>
        prev.map((f, i) =>
          i === index ? { ...f, status: 'parsing' } : f
        )
      );

      const content = await file.text();
      const { frontmatter, content: markdownContent } = parseFrontMatter(content);

      // 生成slug
      const slug =
        frontmatter.slug ||
        generateSlug(frontmatter.title || file.name.replace(/\.(md|mdx)$/, ''));

      setFiles((prev) =>
        prev.map((f, i) =>
          i === index
            ? {
                ...f,
                frontmatter,
                content: markdownContent,
                slug,
                status: 'parsed',
              }
            : f
        )
      );
    } catch (error: any) {
      setFiles((prev) =>
        prev.map((f, i) =>
          i === index
            ? { ...f, status: 'error', error: error.message }
            : f
        )
      );
    }
  };

  // 解析Front Matter
  const parseFrontMatter = (content: string) => {
    const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
    const match = content.match(frontmatterRegex);

    if (!match) {
      return { frontmatter: {}, content };
    }

    const frontmatterStr = match[1];
    const markdownContent = match[2];

    const frontmatter: Record<string, any> = {};
    const lines = frontmatterStr.split('\n');

    for (const line of lines) {
      const colonIndex = line.indexOf(':');
      if (colonIndex === -1) continue;

      const key = line.substring(0, colonIndex).trim();
      let value: any = line.substring(colonIndex + 1).trim();

      if (value.startsWith('[') && value.endsWith(']')) {
        value = value
          .slice(1, -1)
          .split(',')
          .map((v: string) => v.trim());
      } else if (value === 'true') {
        value = true;
      } else if (value === 'false') {
        value = false;
      } else if (/^\d+$/.test(value)) {
        value = parseInt(value);
      } else if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      frontmatter[key] = value;
    }

    return { frontmatter, content: markdownContent };
  };

  // 生成slug
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  // 导入所有文件
  const handleImportAll = async () => {
    setImporting(true);

    try {
      for (const file of files) {
        if (file.status !== 'parsed') continue;

        const formData = new FormData();
        formData.append('file', file.file);
        formData.append('type', type);

        const res = await fetch('/api/upload/markdown', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();

        if (data.success) {
          onImportComplete(data.data);
        } else {
          throw new Error(data.error);
        }
      }
    } catch (error: any) {
      onError?.(error);
    } finally {
      setImporting(false);
    }
  };

  // 删除文件
  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // 清空所有文件
  const handleClearAll = () => {
    setFiles([]);
  };

  return (
    <div className="space-y-6">
      {/* 拖拽区域 */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-accent-green bg-accent-green/10'
            : 'border-card-border hover:border-accent-green/50'
        }`}
      >
        <input {...getInputProps()} />
        <div className="text-4xl mb-4">📄</div>
        {isDragActive ? (
          <p className="text-accent-green">释放文件到此处...</p>
        ) : (
          <div>
            <p className="mb-2">
              拖拽 Markdown/MDX 文件到此处，或点击选择文件
            </p>
            <p className="text-sm text-foreground/40">
              支持 .md 和 .mdx 格式，可批量上传
            </p>
          </div>
        )}
      </div>

      {/* 文件列表 */}
      {files.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold">
              待导入文件 ({files.length})
            </h3>
            <div className="flex gap-2">
              <button
                onClick={handleClearAll}
                className="px-4 py-2 text-sm text-red-400 hover:bg-red-400/10 rounded-lg"
              >
                清空
              </button>
              <button
                onClick={handleImportAll}
                disabled={
                  importing ||
                  files.every((f) => f.status !== 'parsed')
                }
                className="px-4 py-2 text-sm bg-accent-green text-background rounded-lg hover:bg-accent-green/90 disabled:opacity-50"
              >
                {importing ? '导入中...' : '导入全部'}
              </button>
            </div>
          </div>

          {files.map((file, index) => (
            <div
              key={index}
              className="glass-card p-4 flex items-center justify-between"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-lg">
                    {file.status === 'parsed'
                      ? '✅'
                      : file.status === 'parsing'
                      ? '⏳'
                      : file.status === 'error'
                      ? '❌'
                      : '📄'}
                  </span>
                  <span className="font-medium">{file.file.name}</span>
                  <span className="text-xs text-foreground/40">
                    {(file.file.size / 1024).toFixed(1)} KB
                  </span>
                </div>

                {file.status === 'parsed' && (
                  <div className="text-sm text-foreground/60">
                    <p>Slug: {file.slug}</p>
                    {file.frontmatter.title && (
                      <p>标题: {file.frontmatter.title}</p>
                    )}
                    {file.frontmatter.tags && (
                      <p>
                        标签: {file.frontmatter.tags.join(', ')}
                      </p>
                    )}
                  </div>
                )}

                {file.status === 'error' && (
                  <p className="text-sm text-red-400">
                    {file.error}
                  </p>
                )}
              </div>

              <button
                onClick={() => handleRemoveFile(index)}
                className="text-red-400 hover:text-red-300 ml-4"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
