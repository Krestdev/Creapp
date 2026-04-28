import { cva, VariantProps } from "class-variance-authority";
import Link from "next/link";
import React from "react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

const iconVariants = cva("h-16 w-full bg-linear-to-b", {
  variants: {
    color: {
      primary: "from-primary-100 to-primary-200 text-primary-600",
      secondary: "from-secondary-100 to-secondary-200 text-secondary-600",
      red: "from-red-100 to-red-200 text-red-600",
      blue: "from-blue-100 to-blue-200 text-blue-600",
      yellow: "from-yellow-100 to-yellow-200 text-yellow-600",
      purple: "from-purple-100 to-purple-200 text-purple-600",
      green: "from-green-100 to-green-200 text-green-600",
      emerald: "from-emerald-100 to-emerald-200 text-emerald-600",
      indigo: "from-indigo-100 to-indigo-200 text-indigo-600",
      orange: "from-orange-100 to-orange-200 text-orange-600",
    },
  },
  defaultVariants: {
    color: "purple",
  },
});

export interface SettingGroupProps {
  links: Array<{
    title: string;
    description: string;
    icon: LucideIcon;
    href: string;
    color: VariantProps<typeof iconVariants>["color"];
    auth: Array<string>;
  }>;
}

function SettingsGroup({ links }: SettingGroupProps) {
  //To-Do: Add auth guards

  return (
    <div className="grid grid-cols-1 @min-[640px]:grid-cols-2 @min-[1400px]:grid-cols-3 items-stretch gap-4 @min-[640px]:gap-5">
      {links.map((item, id) => (
        <Link
          key={id}
          href={item.href}
          className="grid rounded-lg border border-gray-200 shadow-sm shadow-gray-100 group"
        >
          <span
            className={cn(
              "relative overflow-hidden",
              iconVariants({ color: item.color }),
            )}
          >
            <item.icon
              size={120}
              className="absolute bottom-0 translate-y-1/3 right-1/5 -translate-x-1/2 -rotate-30 group-hover:scale-110 group-hover:rotate-0 transition-transform duration-300"
            />
          </span>
          <div className="p-4 flex flex-col gap-1">
            <h2 className="text-xl font-semibold text-foreground leading-1.2">
              {item.title}
            </h2>
            <p className="text-sm text-muted-foreground">{item.description}</p>
            <Button className="w-fit mt-auto ml-auto" variant={"outline"}>
              {"Continuer"}
            </Button>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default SettingsGroup;
