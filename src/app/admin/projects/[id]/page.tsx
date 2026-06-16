'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProjectForm from '@/components/admin/ProjectForm';

export default function EditProjectPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await fetch(`/api/projects/${projectId}`);
        const data = await res.json();

        if (data.success) {
          setProject(data.data);
        } else {
          setError(data.error || '项目不存在');
        }
      } catch (err) {
        console.error('获取项目失败:', err);
        setError('获取项目失败');
      } finally {
        setLoading(false);
      }
    };

    if (projectId && projectId !== 'new') {
      fetchProject();
    } else {
      setLoading(false);
    }
  }, [projectId]);

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
          onClick={() => router.push('/admin/projects')}
          className="text-accent-green hover:underline"
        >
          返回项目列表
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">
        {projectId === 'new' ? '创建新项目' : '编辑项目'}
      </h1>
      <ProjectForm
        project={project}
        isEditing={projectId !== 'new'}
      />
    </div>
  );
}
