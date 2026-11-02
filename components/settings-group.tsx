import { StatusBadge } from "@/components/ds/status-badge";
import { cn } from "@/lib/utils";
import { ChevronRight, LucideIcon } from "lucide-react";
import Link from "next/link";
import React from "react";

export interface SettingLink {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  /** Anciennes teintes de carte : sans effet depuis le nouveau design. */
  color?: string;
  auth?: Array<string>;
  /** Résumé de l'état du réglage (« 24 utilisateurs · 7 rôles »). */
  badge?: React.ReactNode;
}

export interface SettingGroupProps {
  links: Array<SettingLink>;
  /** Réglages secondaires, en cartes compactes sous « Tous les paramètres ». */
  more?: Array<SettingLink>;
  moreTitle?: string;
}

/**
 * Accueil d'un groupe de réglages (Figma · Paramètres) : les réglages
 * principaux en lignes (icône, titre, description, état), puis les autres en
 * cartes compactes.
 */
function SettingsGroup({
  links,
  more,
  moreTitle = "Tous les paramètres",
}: SettingGroupProps) {
  //To-Do: Add auth guards

  return (
    <>
      <div className="flex flex-col gap-3">
        {links.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group flex items-center gap-4 rounded-xl border border-border-default bg-surface py-4 pr-4 pl-5 outline-none transition-shadow hover:shadow-md focus-visible:shadow-focus-ring"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-md border border-border-default bg-surface text-brand">
              <item.icon aria-hidden className="size-5" />
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="text-title text-text-primary">{item.title}</span>
              <span className="text-body text-text-tertiary">
                {item.description}
              </span>
            </span>
            {item.badge && (
              <StatusBadge tone="success" className="hidden sm:inline-flex">
                {item.badge}
              </StatusBadge>
            )}
            <ChevronRight
              aria-hidden
              className="size-5 shrink-0 text-text-tertiary transition-transform group-hover:translate-x-0.5"
            />
          </Link>
        ))}
      </div>

      {more && more.length > 0 && (
        <>
          <h2 className="text-heading-3 text-text-primary">{moreTitle}</h2>
          <div className="grid grid-cols-1 gap-3 @min-[640px]:grid-cols-2 @min-[1200px]:grid-cols-4">
            {more.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex min-w-0 items-center gap-3 rounded-lg border border-border-default bg-surface py-3 pr-3 pl-3.5 outline-none transition-shadow hover:shadow-md focus-visible:shadow-focus-ring",
                )}
              >
                <item.icon
                  aria-hidden
                  className="size-5 shrink-0 text-text-secondary"
                />
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-body-medium text-text-primary">
                    {item.title}
                  </span>
                  <span className="truncate text-caption text-text-tertiary">
                    {item.description}
                  </span>
                </span>
                <ChevronRight
                  aria-hidden
                  className="size-4 shrink-0 text-text-tertiary"
                />
              </Link>
            ))}
          </div>
        </>
      )}
    </>
  );
}

export default SettingsGroup;
