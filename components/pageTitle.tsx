"use client";

import { cn } from "@/lib/utils";
import { PageTitleProps } from "@/types/types";
import { ArrowBigLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";

const PageTitle = ({ title, subtitle, children, color }: PageTitleProps) => {
  const router = useRouter();


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
        <Button variant={"outline"} size={'lg'} onClick={() => router.back()}>
          <ArrowBigLeft />
          {"Précédent"}
        </Button>
      </div>
      <div className="flex gap-3">
        {children}
      </div>
    </div>
  );
};

export default PageTitle;
