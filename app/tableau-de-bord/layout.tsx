'use client';
import DashboardLayout from "@/components/dashboard-layout";
import useAuthGuard from "@/hooks/useAuthGuard";
import React from "react";

export default function Layout({children}:Readonly<{children: React.ReactNode}>){
    useAuthGuard();
    return (
        <DashboardLayout>
            {children}
        </DashboardLayout>
    );
}