"use client";
import { cn } from "@/lib/utils";
import { useStore } from "@/providers/datastore";
import { NavigationItemProps } from "@/types/types";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

function NavigationItem(item: NavigationItemProps & { 
  isOpen?: boolean; 
  onToggle?: () => void;
}) {
  const pathname = usePathname();
  const { user } = useStore();
  const roles = user?.role.map((r) => r.label) || ["USER"];
  
  // Utilisez les props passées depuis AppSidebar
  const isOpen = item.isOpen || false;
  const onToggle = item.onToggle || (() => {});

  const hasItems = item.items && item.items.length > 0;

  return (
    <>
      {hasItems ? (
        // Section déroulante (parent)
        <div>
          <button
            onClick={onToggle}
            className={cn(
              "inline-flex w-full items-center gap-2 justify-between p-2 h-10 transition-colors rounded bg-transparent hover:bg-primary/10 text-gray-700 font-mono text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary/50 focus:ring-offset-2 cursor-pointer",
              // Style différent pour les sections ouvertes
              isOpen && 
                "bg-primary text-white hover:bg-primary/90 hover:text-white"
            )}
          >
            <div className="flex items-center gap-3">
              {item.icon && <item.icon size={20} className="w-4 h-4" />}
              <span>{item.title}</span>
            </div>
            <div className="flex items-center gap-2">
              {item.badge && (
                <div className="flex items-center justify-center w-[29px] h-[26px] p-1 rounded bg-[#FFAF06] text-[#700032] text-xs">
                  {`${item.badge}`}
                </div>
              )}
              <ChevronRight
                className={cn(
                  "w-4 h-4 transition-transform duration-200",
                  isOpen && "rotate-90"
                )}
              />
            </div>
          </button>
          
          {isOpen && (
            <div className="mt-1 space-y-1 ml-7">
              {item.items
                ?.filter(subItem => 
                  subItem.authorized.some(role => roles.includes(role))
                )
                .map((subItem) => {
                  const isSubActive = pathname === subItem.href;
                  return (
                    <Link
                      key={subItem.href}
                      href={subItem.href}
                      className={cn(
                        "block items-center justify-between px-3 py-2 text-sm rounded transition-colors",
                        "inline-flex w-full items-center gap-2 justify-between p-2 h-10 transition-colors rounded bg-transparent hover:bg-primary/10 text-gray-700 font-mono text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary/50 focus:ring-offset-2",
                        isSubActive &&
                          "bg-[#F2CFDE]/90 text-black hover:bg-[#F2CFDE]/80 hover:text-black"
                      )}
                    >
                      <span>{subItem.title}</span>
                      {subItem.badge && (
                        <div className="flex items-center justify-center w-[29px] h-[26px] p-1 rounded bg-[#FFAF06] text-[#700032] text-xs">
                          {`${subItem.badge}`}
                        </div>
                      )}
                    </Link>
                  );
                })}
            </div>
          )}
        </div>
      ) : (
        // Lien simple (sans sous-éléments)
        <Link
          href={item.href}
          className={cn(
            "inline-flex w-full items-center gap-2 justify-between p-2 h-10 transition-colors rounded bg-transparent hover:bg-primary/10 text-gray-700 font-mono text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary/50 focus:ring-offset-2",
            pathname === item.href &&
              "bg-primary text-white hover:bg-primary/90 hover:text-white"
          )}
        >
          <div className="flex items-center gap-3">
            {item.icon && <item.icon size={20} />}
            <span>{item.title}</span>
          </div>
          {item.badge && (
            <div className="flex items-center justify-center w-[29px] h-[26px] p-1 rounded bg-[#FFAF06] text-[#700032] text-xs">
              {`${item.badge}`}
            </div>
          )}
        </Link>
      )}
    </>
  );
}

export default NavigationItem;