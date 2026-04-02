"use client";

import ErrorPage from "@/components/error-page";
import LoadingPage from "@/components/loading-page";
import { useStore } from "@/providers/datastore";
import { ReactNode } from "react";

export default function PrivateLayout({ children }: { children: ReactNode }) {
  const { isHydrated, user } = useStore();

  if (!isHydrated) {
    return <LoadingPage />;
  }

  if (
    user &&
    user.role.some((r) => r.label === "SALES" || r.label === "VOLT_MANAGER")
  ) {
    return children;
  }
  return <ErrorPage statusCode={401} />;
}
