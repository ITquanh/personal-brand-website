'use client';

import { motion } from 'framer-motion';

interface FileImportStatusProps {
  status: 'pending' | 'parsing' | 'parsed' | 'importing' | 'success' | 'error';
  fileName: string;
  progress?: number;
  error?: string;
}

export default function FileImportStatus({
  status,
  fileName,
  progress = 0,
  error,
}: FileImportStatusProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'pending':
        return {
          icon: '📄',
          text: '等待处理',
          color: 'text-foreground/40',
          bgColor: 'bg-card-bg',
        };
      case 'parsing':
        return {
          icon: '⏳',
          text: '解析中...',
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-400/10',
        };
      case 'parsed':
        return {
          icon: '✅',
          text: '解析完成',
          color: 'text-green-400',
          bgColor: 'bg-green-400/10',
        };
      case 'importing':
        return {
          icon: '🚀',
          text: '导入中...',
          color: 'text-blue-400',
          bgColor: 'bg-blue-400/10',
        };
      case 'success':
        return {
          icon: '🎉',
          text: '导入成功',
          color: 'text-green-400',
          bgColor: 'bg-green-400/10',
        };
      case 'error':
        return {
          icon: '❌',
          text: '导入失败',
          color: 'text-red-400',
          bgColor: 'bg-red-400/10',
        };
      default:
        return {
          icon: '📄',
          text: '未知状态',
          color: 'text-foreground/40',
          bgColor: 'bg-card-bg',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${config.bgColor} rounded-lg p-4`}
    >
      <div className="flex items-center gap-3">
        <span className="text-xl">{config.icon}</span>
        <div className="flex-1">
          <p className="font-medium">{fileName}</p>
          <p className={`text-sm ${config.color}`}>{config.text}</p>

          {/* 进度条 */}
          {(status === 'parsing' || status === 'importing') && (
            <div className="mt-2 w-full h-2 bg-card-bg rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
                className="h-full bg-accent-green rounded-full"
              />
            </div>
          )}

          {/* 错误信息 */}
          {status === 'error' && error && (
            <p className="text-sm text-red-400 mt-1">{error}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
