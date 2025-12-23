"use client";
import DashboardLayout from "@/components/dashboard-layout";
import LoadingPage from "@/components/loading-page";
import useAuthGuard from "@/hooks/useAuthGuard";
import { useStore } from "@/providers/datastore";
import React from "react";

export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { isHydrated, user } = useStore();
  useAuthGuard();

  if (!isHydrated) {
    return (
      <LoadingPage/>
    );
  }
  if(!user){
    return null;
  }
  return <DashboardLayout>{children}</DashboardLayout>;
}
