"use client";
import { cn } from "@/lib/utils";
import { NavigationItemProps } from "@/types/types";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";

// { Icon, href, title, badge }

function NavigationItem(item: NavigationItemProps) {
  // This component is used to render a navigation item in the sidebar
  const pathname = usePathname();
  const isActive = pathname === item.href;

  const [openSections, setOpenSections] = useState<string[]>(["Analytics"]);

  const toggleSection = (title: string) => {
    setOpenSections((prev) =>
      prev.includes(title)
        ? prev.filter((item) => item !== title)
        : [...prev, title]
    );
  };

  return (
    <>
      {/* <Link
        href={item.href}
        className={cn(
          "inline-flex items-center gap-2 justify-between p-2 h-10 transition-colors rounded-[8px] bg-transparent hover:bg-primary/10 text-gray-700 font-mono text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary/50 focus:ring-offset-2",
          isActive &&
            "bg-primary text-white hover:bg-primary/90 hover:text-white"
        )}
      >
        <div className="flex gap-4">
          <item.icon size={20} />
          <span>{item.title}</span>
        </div>
        {item.badge && (
          <span
            className={cn(
              "inline-flex items-center justify-center p-1 min-w-7 text-xs text-white bg-red-700 rounded"
            )}
          >
            {String(item.badge)}
          </span>
        )}
      </Link> */}
      {item.items ? (
        // Collapsible section
        <div>
          <Link
            href={item.href}
            onClick={() => toggleSection(item.title)}
            className={cn(
              "inline-flex w-full items-center gap-2 justify-between p-2 h-10 transition-colors rounded-[8px] bg-transparent hover:bg-primary/10 text-gray-700 font-mono text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary/50 focus:ring-offset-2",
              isActive &&
                "bg-primary text-white hover:bg-primary/90 hover:text-white"
            )}
          >
            <div className="flex items-center gap-3">
              {item.icon && <item.icon size={20} className="w-4 h-4" />}
              <span>{item.title}</span>
            </div>
            <ChevronRight
              className={cn(
                "w-4 h-4 transition-transform",
                openSections.includes(item.title) && "rotate-90"
              )}
            />
          </Link>
          {openSections.includes(item.title) && (
            <div className="mt-1 space-y-1 ml-7">
              {item.items.map((subItem) => {
                const isSubActive = pathname === subItem.href;
                return (
                  <Link
                    key={subItem.href}
                    href={subItem.href}
                    className={cn(
                      "block px-3 py-2 text-sm rounded-md transition-colors",
                      "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      "inline-flex w-full items-center gap-2 justify-between p-2 h-10 transition-colors rounded-[8px] bg-transparent hover:bg-primary/10 text-gray-700 font-mono text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary/50 focus:ring-offset-2",
                      isSubActive &&
                        "bg-primary text-white hover:bg-primary/90 hover:text-white"
                    )}
                  >
                    {subItem.title}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        // Single link
        <Link
          href={item.href}
          className={cn(
            "inline-flex w-full items-center gap-2 justify-between p-2 h-10 transition-colors rounded-[8px] bg-transparent hover:bg-primary/10 text-gray-700 font-mono text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary/50 focus:ring-offset-2",
            isActive &&
              "bg-primary text-white hover:bg-primary/90 hover:text-white"
          )}
        >
          <div className="flex gap-4">
            {item.icon && <item.icon size={20} />}
            <span>{item.title}</span>
          </div>
        </Link>
      )}
    </>
  );
}

export default NavigationItem;
