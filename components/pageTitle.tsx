import React from "react";
import { Button } from "./ui/button";
import { ArrowBigLeft } from "lucide-react";
import { PageTitleProps } from "@/types/types";
import Link from "next/link";
import { cn } from "@/lib/utils";

// needs parameters to update content with respect to page
// needs button colors
// needs fonts to be set
const PageTitle = ({ title, subtitle, links, color }: PageTitleProps) => {
  // setting background color to "bg-gradient-to-r from-[#9E1349] to-[#700032]
  return (
    <div
      className={cn(
        "bg-gradient-to-r rounded-[12px] px-[24px] py-[20px] gap-4 flex flex-col text-white",
        color === "red" && "from-[#9E1349] to-[#700032]",
        color === "blue" && "from-[#0F5499] to-[#002244]",
        color === "green" && "from-[#15803D] to-[#0B411F]"
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
        {links?.map((linkButton) => {
          return (
            <Link
              key={linkButton.href}
              className="text-white outline px-5 py-2 rounded-md bg-primary"
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
