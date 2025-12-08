"use client";
import DashboardLayout from "@/components/dashboard-layout";
import LoadingPage from "@/components/loading-page";
import useAuthGuard from "@/hooks/useAuthGuard";
import { useStore } from "@/providers/datastore";
import React from "react";

export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { isHydrated } = useStore();
  useAuthGuard();

  if (!isHydrated) {
    return (
      <LoadingPage/>
    );
  }
  return <DashboardLayout>{children}</DashboardLayout>;
}
