'use client';
import DashboardLayout from "@/components/dashboard-layout";
import useAuthGuard from "@/hooks/useAuthGuard";
import { useStore } from "@/providers/datastore";
import { Loader2 } from "lucide-react";
import React from "react";

export default function Layout({children}:Readonly<{children: React.ReactNode}>){
    const {isHydrated} = useStore();
    useAuthGuard();

    if(!isHydrated){
        return <div className="w-full h-screen grid place-items-center">
            <Loader2 size={20} className="animate-spin"/>
        </div>;
    }
    return (
        <DashboardLayout>
            {children}
        </DashboardLayout>
    );
}