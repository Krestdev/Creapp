import React from "react";
import { SidebarProvider, SidebarTrigger } from "./ui/sidebar";
import AppSidebar from "./navigation/app-sidebar";
import NavigationBreadcrumb from "./navigation/breadcrumb-main";

function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <section className="flex-1">
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
              <path
                fill="currentColor"
                d="M0 0h1v16H0z"
                className="text-gray-300"
              ></path>
            </svg>
            <NavigationBreadcrumb />
          </div>
        </div>
        <main className="flex-1">
          <div className="p-6 @container min-h-[calc(100vh-100px)] max-h-[calc(100vh-100px)] overflow-auto">
            {children}
          </div>
          <div className="w-full flex px-3 items-center justify-center min-h-10 py-2 bg-slate-50 text-xs sm:text-sm text-slate-600">
            <p className="max-w-7xl mx-auto">
              {"© 2026 CREAPP. Réalisé par "}
              <a
                href="https://krestdev.com"
                className="text-primary cursor-pointer hover:underline"
                target="_blank"
              >
                KrestDev
              </a>
            </p>
          </div>
        </main>
      </section>
    </SidebarProvider>
  );
}

export default DashboardLayout;
