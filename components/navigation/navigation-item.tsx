"use client";
import { cn } from "@/lib/utils";
import { NavigationItemProps, NavigationLinkProps } from "@/types/types";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";

function NavigationItem(
  item: NavigationItemProps & {
    isOpen?: boolean;
    onToggle?: () => void;
  }
) {
  const pathname = usePathname();
  const isActive = pathname.includes(item.href);

  return item.items && item.items.length > 0 ? (
    <Accordion type="single" collapsible>
      <AccordionItem value={item.title} className="space-y-1">
        <AccordionTrigger
          className={cn(
            "h-10 w-full rounded transition-all ease-out duration-300 px-2 inline-flex items-center font-medium text-foreground font-mono hover:bg-gray-100 cursor-pointer",
            isActive && "bg-primary-100 hover:bg-primary-100"
          )}
        >
          <span className="inline-flex items-center gap-2">
            {item.icon && (
              <item.icon
                size={20}
                className={cn(
                  "text-foreground",
                  isActive && "text-primary-700"
                )}
              />
            )}
            {item.title}
            {!!item.items && item.items.some(i=> !!i.badgeValue && i.badgeValue>0) && <span className="size-1.5 rounded-full bg-primary-700 animate-ping"/>}
          </span>
        </AccordionTrigger>
        <AccordionContent className="relative pl-6">
          {/* Ligne verticale */}
          <span
            className="absolute left-2 top-1 bottom-1 w-px bg-muted-foreground/40"
            aria-hidden
          />

          <div className="grid gap-2">
            {item.items.map((subItem, id) => (
              <NavigationLink
                key={id}
                href={subItem.href}
                title={subItem.title}
                badgeValue={subItem.badgeValue}
              />
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ) : (
    <NavigationLink
      href={item.href}
      title={item.title}
      badgeValue={item.badgeValue}
      icon={item.icon}
    />
  );
}

export default NavigationItem;

function NavigationLink({
  href,
  title,
  icon,
  badgeValue,
}: NavigationLinkProps) {
  const Icon = icon;
  const pathname = usePathname();
  const isActive = pathname === href;
  return (
    <Link
      href={href}
      className={cn(
        "h-10 w-full p-2 rounded transition-all ease-out duration-300 bg-transparent flex gap-2 items-center justify-between hover:bg-gray-100",
        isActive && "bg-primary-100 hover:bg-primary-100"
      )}
    >
      <span className="inline-flex items-center gap-2">
        {Icon && (
          <Icon
            size={20}
            className={cn("text-foreground", isActive && "text-primary-700")}
          />
        )}
        <span
          className={cn(
            "text-sm text-foreground font-medium font-mono truncate",
            isActive && "font-semibold"
          )}
        >
          {title}
        </span>
      </span>
      {badgeValue && badgeValue > 0 && (
        <span className="inline-flex shrink-0 h-[26px] min-w-[26px] px-1 items-center justify-center text-center rounded bg-accent text-xs font-medium text-primary-700">
          {badgeValue}
        </span>
      )}
    </Link>
  );
}
