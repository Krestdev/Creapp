"use client";

import React from "react";
import { Button } from "./ui/button";
import { ArrowBigLeft } from "lucide-react";
import { PageTitleProps } from "@/types/types";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useStore } from "@/providers/datastore";

// needs parameters to update content with respect to page
// needs button colors
// needs fonts to be set
const PageTitle = ({ title, subtitle, links, color }: PageTitleProps) => {
  // setting background color to "bg-gradient-to-r from-[#9E1349] to-[#700032]
  const { user } = useStore();

  // Fonction pour filtrer les liens selon le rôle de l'utilisateur
  const filteredLinks = React.useMemo(() => {
    if (!user || !links) return links || [];

    const userRoles = user.role.map((r) => r.label);
    
    return links.filter(linkButton => {
      // Si le lien s'appelle "Approbation" et l'utilisateur est USER, on le cache
      if (linkButton.title === "Approbation" && userRoles.includes("USER") && user.role.length === 1) {
        return false;
      }
      
      return true;
    });
  }, [links, user]);

  return (
    <div
      className={cn(
        "bg-gradient-to-r rounded-[12px] px-[24px] py-[20px] gap-4 flex flex-col text-white",
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
        <Button>
          <ArrowBigLeft size={20} />
          Precedent
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