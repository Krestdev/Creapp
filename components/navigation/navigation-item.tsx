"use client";
import { cn } from "@/lib/utils";
import { NavigationItemProps } from "@/types/types";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

function NavigationItem({ Icon, href, title, badge }: NavigationItemProps) {
  // This component is used to render a navigation item in the sidebar
  const pathname = usePathname();
  const isActive = pathname === href;
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-2 justify-between p-2 h-10 transition-colors rounded-[8px] bg-transparent hover:bg-primary/10 text-gray-700 font-mono text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary/50 focus:ring-offset-2",
        isActive && "bg-primary text-white hover:bg-primary/90 hover:text-white"
      )}
    >
      <div className="flex gap-4">
        <Icon size={20} />
        <span>{title}</span>
      </div>
      {badge && (
        <span
          className={cn(
            "inline-flex items-center justify-center p-1 min-w-7 text-xs text-white bg-red-700 rounded"
          )}
        >
          {String(badge)}
        </span>
      )}
    </Link>
  );
}

export default NavigationItem;
