"use client";

import { cn } from "@/lib/utils";
import { useStore } from "@/providers/datastore";
import { NavigationItemProps } from "@/types/types";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

function NavigationItem(item: NavigationItemProps) {
  const pathname = usePathname();
  const { user } = useStore();

  const roles = user?.role.map((r) => r.label) || ["USER"];

  // 🔹 Un seul parent ouvert à la fois
  const [openSection, setOpenSection] = useState<string | null>(
    item.items?.some((subItem) => pathname === subItem.href)
      ? item.title
      : null
  );

  const toggleSection = (title: string) => {
    setOpenSection((prev) => (prev === title ? null : title));
  };

  const hasItems = item.items && item.items.length > 0;

  return (
    <>
      {hasItems ? (
        /* ================= PARENT ================= */
        <div>
          <button
            onClick={() => toggleSection(item.title)}
            className={cn(
              "inline-flex w-full items-center justify-between gap-2 p-2 h-10 rounded transition-colors",
              "text-gray-700 font-mono text-sm font-medium",
              "hover:bg-primary/10 focus:outline-none focus:ring-1 focus:ring-primary/50",
              openSection === item.title &&
                "bg-primary text-white hover:bg-primary/90"
            )}
          >
            <div className="flex items-center gap-3">
              {item.icon && <item.icon size={18} />}
              <span>{item.title}</span>
            </div>

            <ChevronRight
              className={cn(
                "w-4 h-4 transition-transform duration-200",
                openSection === item.title && "rotate-90"
              )}
            />
          </button>

          {/* ================= CHILDREN ================= */}
          {openSection === item.title && (
            <div className="mt-1 ml-7 space-y-1">
              {item.items
                ?.filter((subItem) =>
                  subItem.authorized.some((role) => roles.includes(role))
                )
                .map((subItem) => {
                  const isActive = pathname === subItem.href;

                  return (
                    <Link
                      key={subItem.href}
                      href={subItem.href}
                      className={cn(
                        "inline-flex w-full items-center justify-between gap-2 p-2 h-9 rounded transition-colors",
                        "text-gray-700 text-sm font-mono hover:bg-primary/10",
                        isActive &&
                          "bg-[#F2CFDE] text-black hover:bg-[#F2CFDE]/90"
                      )}
                    >
                      <span>{subItem.title}</span>

                      {subItem.badge && (
                        <span className="flex items-center justify-center w-[29px] h-[26px] rounded bg-[#FFAF06] text-[#700032] text-xs font-semibold">
                          {subItem.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
            </div>
          )}
        </div>
      ) : (
        /* ================= SIMPLE LINK ================= */
        <Link
          href={item.href}
          className={cn(
            "inline-flex w-full items-center justify-between gap-2 p-2 h-10 rounded transition-colors",
            "text-gray-700 font-mono text-sm font-medium hover:bg-primary/10",
            pathname === item.href &&
              "bg-primary text-white hover:bg-primary/90"
          )}
        >
          <div className="flex items-center gap-3">
            {item.icon && <item.icon size={18} />}
            <span>{item.title}</span>
          </div>

          {item.badge && (
            <span className="flex items-center justify-center w-[29px] h-[26px] rounded bg-[#FFAF06] text-[#700032] text-xs font-semibold">
              {item.badge}
            </span>
          )}
        </Link>
      )}
    </>
  );
}

export default NavigationItem;
