'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface TranslateButtonProps {
  content: string;
  targetField: string;
  onTranslated: (translated: string) => void;
  onError?: (error: Error) => void;
}

type TranslationStatus = 'idle' | 'translating' | 'success' | 'error';

export default function TranslateButton({
  content,
  targetField,
  onTranslated,
  onError,
}: TranslateButtonProps) {
  const [status, setStatus] = useState<TranslationStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 组件卸载时清理定时器
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleTranslate = async () => {
    if (!content || !content.trim()) {
      setError('没有可翻译的内容');
      return;
    }

    setStatus('translating');
    setError(null);

    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: content,
          targetLang: 'en',
          sourceLang: 'zh',
        }),
      });

      if (!res.ok) {
        const errorText = await res.text().catch(() => '翻译请求失败');
        throw new Error(`服务器错误 (${res.status}): ${errorText}`);
      }

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || '翻译失败');
      }

      setStatus('success');
      onTranslated(data.data.translated);

      // 3秒后重置状态（使用 ref 存储定时器 ID）
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setStatus('idle');
      }, 3000);
    } catch (err: any) {
      setStatus('error');
      setError(err.message);
      onError?.(err);
    }
  };

  const getButtonContent = () => {
    switch (status) {
      case 'translating':
        return (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
            />
            <span>翻译中...</span>
          </>
        );
      case 'success':
        return (
          <>
            <span>✅</span>
            <span>翻译完成</span>
          </>
        );
      case 'error':
        return (
          <>
            <span>❌</span>
            <span>翻译失败</span>
          </>
        );
      default:
        return (
          <>
            <span>🌐</span>
            <span>翻译成英文</span>
          </>
        );
    }
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleTranslate}
        disabled={status === 'translating' || !content}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${
          status === 'success'
            ? 'bg-green-500/20 text-green-400'
            : status === 'error'
            ? 'bg-red-500/20 text-red-400'
            : 'bg-accent-purple/20 text-accent-purple hover:bg-accent-purple/30'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {getButtonContent()}
      </button>

      {/* 错误信息 */}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-red-400"
        >
          {error}
        </motion.p>
      )}

      {/* 提示信息 */}
      {status === 'idle' && (
        <p className="text-xs text-foreground/40">
          将自动翻译 {targetField} 字段的内容
        </p>
      )}
    </div>
  );
}
