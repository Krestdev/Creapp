"use client";

import { ReactNode } from "react";
import LoadingPage from "@/components/loading-page";
import { useStore } from "@/providers/datastore";
import ErrorPage from "@/components/error-page";
import { isRole } from "@/lib/utils";

export default function PrivateLayout({ children }: { children: ReactNode }) {
  const { isHydrated, user } = useStore();
  const auth = isRole({ roleList: user?.role ?? [], role: "achat" });
  const auth2 = isRole({
    roleList: user?.role ?? [],
    role: "Donner d'ordre achat",
  });
  const auth3 = isRole({
    roleList: user?.role ?? [],
    role: "Donneur d'ordre décaissement",
  });

  if (!isHydrated) {
    return <LoadingPage />;
  }

  if (!auth && !auth2 && !auth3) {
    return <ErrorPage statusCode={401} />;
  }
  return children;
}
