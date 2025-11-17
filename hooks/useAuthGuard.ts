// hooks/useAuthGuard.ts
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/providers/datastore";

export default function useAuthGuard({
  requireAuth = true,
}: { requireAuth?: boolean } = {}) {
  const user = useStore((s) => s.user);
  const isHydrated = useStore((s) => s.isHydrated);
  const router = useRouter();

  useEffect(() => {
    // ⛔ Tant que Zustand n'a pas restauré user → ne rien faire
    if (!isHydrated) return;

    // 🔐 Page protégée mais user absent → redirection vers login
    if (requireAuth && !user) {
      router.replace("/connexion");
    }

    // 🔓 Page publique mais user présent → redirection vers dashboard
    if (!requireAuth && user) {
      router.replace("/tableau-de-bord");
    }
  }, [user, requireAuth, router, isHydrated]);
}
