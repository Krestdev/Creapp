import React from "react";
import { AppShell } from "./shell/app-shell";

function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}

export default DashboardLayout;
