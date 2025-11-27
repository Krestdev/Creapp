"use client";

import React from "react";
import { Button } from "./ui/button";
import { ArrowBigLeft } from "lucide-react";
import { PageTitleProps } from "@/types/types";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useStore } from "@/providers/datastore";
import { useRouter } from "next/navigation";

const PageTitle = ({ title, subtitle, links, color }: PageTitleProps) => {
  const router = useRouter();
  const { user } = useStore();

  const filteredLinks = React.useMemo(() => {
    if (!user || !links) return links || [];

    const userRoles = user.role.map((r) => r.label);

    return links.filter((linkButton) => {
      if (
        linkButton.title === "Approbation" &&
        userRoles.includes("USER") &&
        user.role.length === 1
      ) {
        return false;
      }

      return true;
    });
  }, [links, user]);

  return (
    <div
      className={cn(
        "bg-linear-to-r rounded-[12px] px-6 py-5 gap-4 flex flex-col text-white",
        color === "red" && "from-[#9E1349] to-[#700032]",
        color === "blue" && "from-[#0F5499] to-[#002244]",
        color === "green" && "from-[#15803D] to-[#0B411F]",
        color === "none" && "from-[#606160] to-[#242424]"
      )}
    >
      <div className="flex justify-between">
        <div>
          <h1 className="font-bold">{title}</h1>
          <h4 className="font-extralight tracking-wide">{subtitle}</h4>
        </div>
        <Button onClick={() => router.back()}>
          <ArrowBigLeft size={20} />
          {"Précédent"}
        </Button>
      </div>
      <div className="flex gap-3">
        {filteredLinks?.map((linkButton) => {
          return (
            <Link
              key={linkButton.href}
              className="text-primary outline px-5 py-2 rounded-md bg-white"
              href={linkButton.href}
            >
              {linkButton.title}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default PageTitle;
