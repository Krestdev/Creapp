"use client";

import { ReactNode } from "react";
import LoadingPage from "@/components/loading-page";
import { useStore } from "@/providers/datastore";
import ErrorPage from "@/components/error-page";

export default function PrivateLayout({ children }: { children: ReactNode }) {
  const { isHydrated, user } = useStore();

  if (!isHydrated) {
    return <LoadingPage/>
  }

  if (!user || !user.role.some(w=>w.label.toLocaleLowerCase() === "sales" || w.label.toLocaleLowerCase() === "sales_manager")) {
    return <ErrorPage statusCode={401}/>;
  }
  return children
}