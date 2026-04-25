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
          <div className="p-6 @container min-h-[calc(100vh-100px)]">
            {children}
          </div>
          <div className="w-full flex justify-center items-center gap-2 h-10 bg-slate-50 text-sm text-slate-600">
            Copyright © 2026 Creapp. Tous droits réservés. Réalisé par{" "}
            <a
              href="https://krestdev.com"
              className="text-primary cursor-pointer hover:underline"
              target="_blank"
            >
              KrestDev
            </a>
          </div>
        </main>
      </section>
    </SidebarProvider>
  );
}

export default DashboardLayout;
