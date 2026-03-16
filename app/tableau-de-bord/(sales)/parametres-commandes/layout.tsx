"use client";

import { ReactNode } from "react";
import LoadingPage from "@/components/loading-page";
import { useStore } from "@/providers/datastore";
import ErrorPage from "@/components/error-page";
import { isRole } from "@/lib/utils";

export default function PrivateLayout({ children }: { children: ReactNode }) {
  const { isHydrated, user } = useStore();
  const isAuthorized =
    isRole({ roleList: user?.role ?? [], role: "achat" }) ||
    isRole({ roleList: user?.role ?? [], role: "admin" });

  if (!isHydrated) {
    return <LoadingPage />;
  }

  if (!user || !isAuthorized) {
    return <ErrorPage statusCode={401} />;
  }
  return children;
}
