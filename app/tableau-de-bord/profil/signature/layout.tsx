"use client";

import ErrorPage from "@/components/error-page";
import LoadingPage from "@/components/loading-page";
import { isRole } from "@/lib/utils";
import { useStore } from "@/providers/datastore";
import { ReactNode } from "react";

export default function PrivateLayout({ children }: { children: ReactNode }) {
  const { isHydrated, user } = useStore();
  const auth =
    isRole({ roleList: user?.role ?? [], role: "Donner d'ordre achat" }) ||
    isRole({ roleList: user?.role ?? [], role: "achat" }) ||
    isRole({
      roleList: user?.role ?? [],
      role: "Donneur d'ordre décaissement",
    });

  if (!isHydrated) {
    return <LoadingPage />;
  }

  if (user && auth) {
    return children;
  }
  return <ErrorPage statusCode={401} />;
}
