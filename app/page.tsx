"use client";

import useAuthGuard from "@/hooks/useAuthGuard";
import { redirect } from "next/navigation";

export default function Home() {
  useAuthGuard();
  return redirect("/tableau-de-bord");
}
