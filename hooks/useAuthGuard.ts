// hooks/useAuthGuard.ts
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useUserStore from '@/store/useUserStore';

export default function useAuthGuard({ requireAuth = true }: { requireAuth?: boolean } = {}) {
  const user = useUserStore((state) => state.user);
  const router = useRouter();

  useEffect(() => {
    if (requireAuth && !user) {
      router.push('/connexion');
    } else if (!requireAuth && user) {
      router.push('/tableau-de-bord');
    }
  }, [user, requireAuth, router]);
}
