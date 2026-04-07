"use client";
import DashboardLayout from "@/components/dashboard-layout";
import LoadingPage from "@/components/loading-page";
import useAuthGuard from "@/hooks/useAuthGuard";
import { useStore } from "@/providers/datastore";
import { userQ } from "@/queries/baseModule";
import { useQuery } from "@tanstack/react-query";
import React from "react";

export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { isHydrated, user, update } = useStore();
  useAuthGuard();

  const getUser = useQuery({
    queryKey: ["user"],
    queryFn: () => userQ.getOne(user?.id || 0),
    enabled: !!user,
  });

  React.useEffect(() => {
    if (getUser.data) {
      update({ user: getUser.data.data });
    }
  }, [getUser.data]);

  if (!isHydrated) {
    return (
      <LoadingPage />
    );
  }
  if (!user) {
    return null;
  }
  return <DashboardLayout>{children}</DashboardLayout>;
}
