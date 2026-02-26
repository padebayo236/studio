'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function DashboardRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);

  return (
    <div className="flex h-full flex-1 items-center justify-center">
      <Loader2 className="h-16 w-16 animate-spin" />
    </div>
  );
}
