"use client";
import { cn } from "@/lib/utils";
import { useStore } from "@/providers/datastore";
import { NavigationItemProps } from "@/types/types";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

function NavigationItem(item: NavigationItemProps & { 
  isOpen?: boolean; 
  onToggle?: () => void;
}) {
  const pathname = usePathname();
  const { user } = useStore();
  const roles = user?.role.map((r) => r.label) || ["USER"];
  
  // Référence pour l'animation du contenu
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Utilisez les props passées depuis AppSidebar
  const isOpen = item.isOpen || false;
  const onToggle = item.onToggle || (() => {});

  const hasItems = item.items && item.items.length > 0;
  
  // Vérifie si un des enfants est actif
  const isAnyChildActive = item.items?.some(subItem => 
    pathname === subItem.href && 
    subItem.authorized.some(role => roles.includes(role))
  ) || false;

  // Animation pour l'ouverture/fermeture
  useEffect(() => {
    if (contentRef.current) {
      if (isOpen) {
        // Animation d'entrée
        contentRef.current.style.maxHeight = `${contentRef.current.scrollHeight}px`;
        contentRef.current.style.opacity = '1';
        contentRef.current.style.transform = 'translateY(0)';
      } else {
        // Animation de sortie
        contentRef.current.style.maxHeight = '0px';
        contentRef.current.style.opacity = '0';
        contentRef.current.style.transform = 'translateY(-10px)';
      }
    }
  }, [isOpen]);

  return (
    <div className="relative">
      {hasItems ? (
        // Section déroulante (parent)
        <div>
          <button
            onClick={onToggle}
            className={cn(
              "inline-flex w-full items-center gap-2 justify-between p-2 h-10 transition-all duration-300 rounded bg-transparent hover:bg-primary/10 text-gray-700 font-mono text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary/50 focus:ring-offset-2 cursor-pointer",
              // Style actif si un enfant est sélectionné
              isAnyChildActive && "bg-primary text-white hover:bg-primary/90",
            )}
          >
            <div className="flex items-center gap-3 transition-all duration-300">
              {item.icon && (
                <item.icon 
                  size={20} 
                  className={cn(
                    "w-4 h-4 transition-transform duration-300",
                    isOpen && "scale-110",
                    isAnyChildActive && "text-white"
                  )} 
                />
              )}
              <span className={cn(
                "transition-all duration-300",
                isAnyChildActive && "font-semibold text-white"
              )}>
                {item.title}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {item.badge && (
                <div className={cn(
                  "flex items-center justify-center w-[29px] h-[26px] p-1 rounded bg-[#FFAF06] text-[#700032] text-xs transition-all duration-300",
                  isOpen && "scale-110",
                  isAnyChildActive && "bg-wtext-white text-black"
                )}>
                  {`${item.badge}`}
                </div>
              )}
              <ChevronRight
                className={cn(
                  "w-4 h-4 transition-all duration-300",
                  isOpen && "rotate-90"
                )}
              />
            </div>
          </button>
          
          {/* Contenu déroulant avec animation */}
          <div
            ref={contentRef}
            className={cn(
              "overflow-hidden transition-all duration-300",
              "space-y-1 ml-3"
            )}
            style={{
              maxHeight: isOpen ? '0px' : '0px',
              opacity: isOpen ? 0 : 0,
              // transform: 'translateY(-10px)',
            }}
          >
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
                      "block items-center justify-between text-sm rounded transition-all duration-300",
                      "inline-flex w-full items-center gap-2 justify-between p-2 h-10 rounded bg-transparent hover:bg-primary/10 text-gray-700 font-mono text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary/50 focus:ring-offset-2",
                      "transform-gpu rounded-md",
                      isSubActive
                        ? "bg-[#9b3e66] text-white hover:bg-[#9b3e66]/90 shadow-sm"
                        : "hover:bg-primary/5"
                    )}
                  >
                    <span className={cn(
                      "transition-all duration-300",
                      isSubActive && "font-semibold pl-1"
                    )}>
                      {subItem.title}
                    </span>
                    {subItem.badge && (
                      <div className={cn(
                        "flex items-center justify-center w-[29px] h-[26px] p-1 rounded bg-[#FFAF06] text-[#700032] text-xs transition-all duration-300"
                      )}>
                        {`${subItem.badge}`}
                      </div>
                    )}
                  </Link>
                );
              })}
          </div>
        </div>
      ) : (
        // Lien simple (sans sous-éléments)
        <Link
          href={item.href}
          className={cn(
            "inline-flex w-full items-center gap-2 justify-between p-2 h-10 transition-all duration-300 rounded bg-transparent hover:bg-primary/10 text-gray-700 font-mono text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary/50 focus:ring-offset-2",
            "transform-gpu",
            pathname === item.href
              ? "bg-primary text-white hover:bg-primary/90 shadow-md"
              : "hover:bg-primary/5"
          )}
        >
          <div className="flex items-center gap-3 transition-all duration-300">
            {item.icon && (
              <item.icon 
                size={20} 
                className={cn(
                  "transition-transform duration-300",
                )} 
              />
            )}
            <span className={cn(
              "transition-all duration-300",
              pathname === item.href && "font-semibold"
            )}>
              {item.title}
            </span>
          </div>
          {item.badge && (
            <div className={cn(
              "flex items-center justify-center w-[29px] h-[26px] p-1 rounded bg-[#FFAF06] text-[#700032] text-xs transition-all duration-300",
              pathname === item.href && "scale-110 bg-white text-primary"
            )}>
              {`${item.badge}`}
            </div>
          )}
        </Link>
      )}
    </div>
  );
}

export default NavigationItem;