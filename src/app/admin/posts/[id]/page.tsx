'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import PostEditor from '@/components/admin/PostEditor';

export default function EditPostPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params.id as string;

  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(`/api/posts/${postId}`);
        const data = await res.json();

        if (data.success) {
          setPost(data.data);
        } else {
          setError(data.error || '文章不存在');
        }
      } catch (err) {
        console.error('获取文章失败:', err);
        setError('获取文章失败');
      } finally {
        setLoading(false);
      }
    };

    if (postId && postId !== 'new') {
      fetchPost();
    } else {
      setLoading(false);
    }
  }, [postId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-card-bg rounded w-1/4 animate-pulse"></div>
        <div className="h-96 bg-card-bg rounded-lg animate-pulse"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <div className="text-4xl mb-4">😕</div>
        <h2 className="text-2xl font-bold mb-4">{error}</h2>
        <button
          onClick={() => router.push('/admin/posts')}
          className="text-accent-green hover:underline"
        >
          返回文章列表
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">
        {postId === 'new' ? '创建新文章' : '编辑文章'}
      </h1>
      <PostEditor
        post={post}
        isEditing={postId !== 'new'}
      />
    </div>
  );
}
