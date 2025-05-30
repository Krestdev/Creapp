import React from "react";
import { SidebarProvider, SidebarTrigger } from "./ui/sidebar";
import AppSidebar from "./app-sidebar";
import NavigationBreadcrumb from "./breadcrumb-main";

function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <section className="w-full">
        <div className="w-full px-6 inline-flex gap-3 items-center justity-between min-h-[60px] bg-white border-b border-gray-300">
          <div className="inline-flex gap-4 items-center">
            <SidebarTrigger />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="1"
              height="16"
              fill="none"
              viewBox="0 0 1 16"
            >
              <path fill="currentColor" d="M0 0h1v16H0z" className="text-gray-300"></path>
            </svg>
            <NavigationBreadcrumb/>
          </div>
        </div>
        <main className="p-6">
          {children}
        </main>
      </section>
    </SidebarProvider>
  );
}

export default DashboardLayout;
