'use client';

import { useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

function Tracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // 过滤掉后台管理路径 (admin) 和 API 接口，只记录普通用户的访问
    if (
      pathname.startsWith('/admin') ||
      pathname.startsWith('/api') ||
      pathname.includes('/_next')
    ) {
      return;
    }

    const record = async () => {
      try {
        await fetch('/api/analytics', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            path: pathname,
          }),
        });
      } catch (error) {
        console.error('Failed to record page view:', error);
      }
    };

    record();
  }, [pathname, searchParams]);

  return null;
}

export default function AnalyticsTracker() {
  return (
    <Suspense fallback={null}>
      <Tracker />
    </Suspense>
  );
}
