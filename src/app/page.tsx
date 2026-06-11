'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#030303]">
      <div className="flex flex-col items-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
        <span className="text-sm text-muted">Redirecting to workspace...</span>
      </div>
    </div>
  );
}
