"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import React from "react";

export interface TabProps {
  tabs: { id: any; title: string; badge?: number }[];
  setSelectedTab: (value: React.SetStateAction<any>) => void;
  selectedTab: any;
  className?: string;
}

/**
 * Onglets de filtre / d'état (Figma · Tab) : rangée à bordure basse,
 * espacement 24 px, soulignement de marque sur l'onglet actif et compteur en
 * pastille (non affiché à 0). Les `id` peuvent être des nombres ou des chaînes.
 * Sous la largeur des onglets, la rangée défile horizontalement.
 */
export const TabBar = ({
  tabs,
  setSelectedTab,
  selectedTab,
  className = "",
}: TabProps) => {
  return (
    <Tabs
      value={String(selectedTab)}
      onValueChange={(value) => {
        const tab = tabs.find((t) => String(t.id) === value);
        if (tab) setSelectedTab(tab.id);
      }}
      className={cn("min-w-0 max-w-full gap-0", className)}
    >
      {/* Marge négative : le défilement ne rogne pas l'anneau de focus. */}
      <div className="no-scrollbar -m-[3px] overflow-x-auto p-[3px]">
        <TabsList variant="line" className="w-max min-w-full">
          {tabs.map((tab) => (
            <TabsTrigger
              key={String(tab.id)}
              value={String(tab.id)}
              count={tab.badge && tab.badge > 0 ? tab.badge : undefined}
            >
              {tab.title}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
    </Tabs>
  );
};
