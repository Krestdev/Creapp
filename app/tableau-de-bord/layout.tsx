import DashboardLayout from "@/components/dashboard-layout";
import React from "react";

export default function Layout({children}:Readonly<{children: React.ReactNode}>){
    return (
        <DashboardLayout>
            {children}
        </DashboardLayout>
    );
}