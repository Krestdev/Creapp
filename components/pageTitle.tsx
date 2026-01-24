"use client";

import { cn } from "@/lib/utils";
import { PageTitleProps } from "@/types/types";
import { ArrowBigLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import Link from "next/link";

const PageTitle = ({
  title,
  subtitle,
  color,
  links = [],
}: PageTitleProps) => {
  const router = useRouter();
  const getBackground = (
    color: PageTitleProps["color"],
  ): HTMLDivElement["className"] => {
    switch (color) {
      case "blue":
        return "from-[#0F5499] to-[#002244]";
      case "green":
        return "from-[#15803D] to-[#0B411F]";
      case "none":
        return "from-slate-600 to-slate-700";
      default:
        return "from-primary-600 to-primary-700";
    }
  };
  return (
    <div
      className={cn(
        "bg-linear-to-r rounded-[12px] px-6 py-5 gap-4 flex flex-col text-white",
        getBackground(color),
      )}
    >
      <div className="flex flex-col gap-8 @min-[640px]:flex-row @min-[640px]:gap-2 justify-between ">
        <div>
          <h1 className="font-bold">{title}</h1>
          <h4 className="font-extralight tracking-wide">{subtitle}</h4>
        </div>
        <Button variant={"outline"} size={"lg"} onClick={() => router.back()}>
          <ArrowBigLeft />
          {"Précédent"}
        </Button>
      </div>
      <div className="flex gap-3 flex-wrap">
        {links
          .filter((x) => (!x.hide ? true : x.hide === true && false))
          .map((link, id) => {
            const isLast = links.length > 1 ? id === links.length - 1 : false;
            return (
              <Link
                key={id}
                href={link.href}
                onClick={(e) => {
                  link.disabled && e.preventDefault();
                }}
                className={cn(link.disabled && "cursor-not-allowed")}
              >
                <Button
                  size={"lg"}
                  variant={isLast ? "accent" : "ghost"}
                  disabled={link.disabled}
                >
                  {link.title}
                </Button>
              </Link>
            );
          })}
      </div>
    </div>
  );
};

export default PageTitle;
