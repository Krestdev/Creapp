"use client";
import { useEffect } from "react";
import { redirect } from "next/navigation";
import useStore from "@/store/useUserStore";

function AuthCheck({
  children,
  logged = true,
}: {
  children: React.ReactNode;
  logged?: boolean;
}) {
  const { user } = useStore();

  useEffect(() => {
    if (logged && !user) {
      redirect("/connexion");
    } else if (!logged && user) {
      redirect("/tableau-de-bord");
    }
  }, [user, logged]);

  return <>{children}</>;
}

export default AuthCheck;
