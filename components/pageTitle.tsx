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
  actions,
}: PageTitleProps) => {
  const router = useRouter();
  const getBackground = (
    color: PageTitleProps["color"],
  ): HTMLDivElement["className"] => {
    switch (color) {
      case "aurora-lights":
        return "from-[#023E8A]/10 via-[#00B4D8]/6 to-[#CAF0F8]/0";
      case "aurora":
        return "from-[#CB30E0]/10 via-[#0088FF]/6 to-white/0";
      case "cyberpunk":
        return "from-[#AA00FF]/15 via-25-[#FF00AA]/10 via-50-[#FF00FF]/6 to-[#00FFFF]/0";
      default:
        return "from-[#CB30E0]/10 via-[#0088FF]/6 to-white/0";
    }
  };
  return (
    <div className="relative bg-gray-50 rounded-2xl px-8 py-7 gap-4 flex flex-col border">
      <div
        className={cn(
          "flex justify-between z-1",
          actions
            ? // Les actions passent sous le titre quand la largeur manque.
              "flex-wrap items-end gap-x-6 gap-y-4"
            : "flex-col gap-8 @min-[640px]:flex-row @min-[640px]:gap-2",
        )}
      >
        <div
          className={cn(
            "min-w-0",
            actions ? "max-w-full" : "@min-[640px]:flex-1",
          )}
        >
          <h1 className="font-bold [overflow-wrap:anywhere]">{title}</h1>
          <h4 className="font-extralight tracking-wide [overflow-wrap:anywhere]">
            {subtitle}
          </h4>
        </div>
        {actions ? (
          <div className="flex flex-wrap items-center gap-2.5">
            {actions}
          </div>
        ) : (
          <Button
            variant={"outline"}
            size={"lg"}
            className="shrink-0 self-start"
            onClick={() => router.back()}
          >
            <ArrowBigLeft />
            {"Précédent"}
          </Button>
        )}
      </div>
      <div className={cn("flex gap-3 flex-wrap z-1", links.length === 0 && "hidden")}>
        {links
          .filter((x) => (!x.hide ? true : x.hide === true && false))
          .map((link, id) => {
            const isLast = links.length > 1 ? id === links.length - 1 : false;
            return (
              <Link
                key={id}
                href={link.href}
                onClick={(e) => {
                  if (link.disabled) {
                    e.preventDefault();
                  }
                }}
                className={cn(link.disabled && "cursor-not-allowed")}
              >
                <Button
                  variant={isLast ? "outline" : "primary"}
                  disabled={link.disabled}
                >
                  {link.title}
                  {link.badge && link.badge > 0 && (
                    <span
                      className={cn(
                        "h-6 min-w-6 px-2 rounded flex items-center text-center text-sm font-medium",
                        isLast
                          ? "bg-white text-gray-900"
                          : "bg-accent text-white",
                      )}
                    >
                      {link.badge}
                    </span>
                  )}
                </Button>
              </Link>
            );
          })}
      </div>
      <div className="absolute inset-0 overflow-hidden rounded-[inherit] pointer-events-none">
        <div
          className={cn("absolute inset-0 bg-radial", getBackground(color))}
        />
      </div>
    </div>
  );
};

export default PageTitle;
