// hooks/useAuthGuard.ts
"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useStore } from "@/providers/datastore";

interface UseAuthGuardOptions {
  requireAuth?: boolean;
  authorizedRoles?: string[];
  fallbackPath?: string;
}

export default function useAuthGuard({
  requireAuth = true,
  authorizedRoles = [],
  fallbackPath = "/tableau-de-bord"
}: UseAuthGuardOptions = {}) {
  const user = useStore((s) => s.user);
  const isHydrated = useStore((s) => s.isHydrated);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // ⛔ Tant que Zustand n'a pas restauré user → ne rien faire
    if (!isHydrated) return;

    // 🔐 Page protégée mais user absent → redirection vers login
    if (requireAuth && !user) {
      router.replace("/connexion");
      return;
    }

    // 🔓 Page publique mais user présent → redirection vers dashboard
    if (!requireAuth && user) {
      router.replace("/tableau-de-bord");
      return;
    }

    // 🛡️ Vérification des rôles si user est connecté et roles spécifiés
    if (requireAuth && user && authorizedRoles.length > 0) {
      const userRoles = user.role.map((r) => r.label);
      const hasAccess = authorizedRoles.some(role => userRoles.includes(role));

      if (!hasAccess) {
        // Rediriger vers la page précédente ou fallbackPath
        if (window.history.length > 1) {
          router.back();
        } else {
          router.replace(fallbackPath);
        }
      }
    }
  }, [user, requireAuth, authorizedRoles, router, isHydrated, fallbackPath, pathname]);

  // Retourner l'état d'autorisation pour utilisation dans les composants
  const userRoles = user?.role.map((r) => r.label) || [];
  const hasRoleAccess = authorizedRoles.length === 0 || 
    authorizedRoles.some(role => userRoles.includes(role));

  return {
    isAuthenticated: !!user,
    hasAccess: hasRoleAccess,
    isChecking: !isHydrated,
    user,
    userRoles
  };
}