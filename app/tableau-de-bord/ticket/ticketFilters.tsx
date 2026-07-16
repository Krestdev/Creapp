"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DateFilter,
  PAYMENT_TYPES,
  PaymentRequest,
  PRIORITIES,
} from "@/types/types";
import { format } from "date-fns";
import { ChevronDown } from "lucide-react";
import React from "react";

export interface TicketFiltersProps {
  customFilters: {
    search: string;
    priority: "all" | PaymentRequest["priority"];
    tab: "pending" | "processed" | "paid";
    type: "all" | PaymentRequest["type"];
    date: DateFilter;
    from: string;
    to: string;
  };
  setCustomFilters: (filters: {
    search: string;
    priority: "all" | PaymentRequest["priority"];
    tab: "pending" | "processed" | "paid";
    type: "all" | PaymentRequest["type"];
    date: DateFilter;
    from: string;
    to: string;
  }) => void;
  isCustomDateModalOpen: boolean;
  setIsCustomDateModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setDateFilter: (filter: DateFilter) => void;
  resetAllFilters: () => void;
}

export default function TicketFilters({
  customFilters,
  setCustomFilters,
  isCustomDateModalOpen,
  setIsCustomDateModalOpen,
  setDateFilter,
  resetAllFilters,
}: TicketFiltersProps) {
  return (
    <>
      {/**Search Filter */}
      <div className="grid gap-1.5">
        <Label htmlFor="search">Rechercher</Label>
        <Input
          id="search"
          placeholder="Rechercher..."
          value={customFilters.search}
          onChange={(e) =>
            setCustomFilters({
              ...customFilters,
              search: e.target.value,
            })
          }
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="priority">Priorité</Label>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              <span className="truncate">
                {customFilters.priority === "all"
                  ? "Toutes les priorités"
                  : PRIORITIES.find((p) => p.value === customFilters.priority)
                      ?.name}
              </span>
              <ChevronDown className="ml-2 h-4 w-4 shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] max-h-[300px] overflow-y-auto">
            <DropdownMenuItem
              onClick={() => {
                setCustomFilters({
                  ...customFilters,
                  priority: "all",
                });
              }}
              className={customFilters.priority === "all" ? "bg-accent" : ""}
            >
              <div className="flex items-center gap-2">
                <span>Toutes les priorités</span>
              </div>
            </DropdownMenuItem>
            {PRIORITIES.map((priority) => (
              <DropdownMenuItem
                key={priority.value}
                onClick={() => {
                  setCustomFilters({
                    ...customFilters,
                    priority: priority.value,
                  });
                }}
                className={
                  customFilters.priority === priority.value ? "bg-accent" : ""
                }
              >
                <div className="flex items-center gap-2">
                  <span>{priority.name}</span>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {/**Type Filter */}
      <div className="grid gap-1.5">
        <Label htmlFor="type">Type</Label>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              <span className="truncate">
                {customFilters.type === "all"
                  ? "Tous les types"
                  : PAYMENT_TYPES.find((t) => t.value === customFilters.type)
                      ?.name}
              </span>
              <ChevronDown className="ml-2 h-4 w-4 shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] max-h-[300px] overflow-y-auto">
            <DropdownMenuItem
              onClick={() => {
                setCustomFilters({
                  ...customFilters,
                  type: "all",
                });
              }}
              className={customFilters.type === "all" ? "bg-accent" : ""}
            >
              <div className="flex items-center gap-2">
                <span>Tous les types</span>
              </div>
            </DropdownMenuItem>
            {PAYMENT_TYPES.map((type) => (
              <DropdownMenuItem
                key={type.value}
                onClick={() => {
                  setCustomFilters({
                    ...customFilters,
                    type: type.value,
                  });
                }}
                className={customFilters.type === type.value ? "bg-accent" : ""}
              >
                <div className="flex items-center gap-2">
                  <span>{type.name}</span>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {/* Filtre par période */}
      <div className="grid gap-1.5">
        <Label>{"Période"}</Label>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              <span className="truncate">
                {customFilters.date === undefined
                  ? "Toutes les périodes"
                  : customFilters.date === "today"
                    ? "Aujourd'hui"
                    : customFilters.date === "week"
                      ? "Cette semaine"
                      : customFilters.date === "month"
                        ? "Ce mois"
                        : customFilters.date === "year"
                          ? "Cette année"
                          : customFilters.date === "custom"
                            ? "Personnalisé"
                            : "Sélectionner une période"}
              </span>
              <ChevronDown className="ml-2 h-4 w-4 shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width]">
            <DropdownMenuItem
              onClick={() => {
                setDateFilter(undefined);
                setCustomFilters({
                  ...customFilters,
                  from: "",
                  to: "",
                });
                setIsCustomDateModalOpen(false);
              }}
              className={customFilters.date === undefined ? "bg-accent" : ""}
            >
              <span>Toutes les périodes</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setCustomFilters({ ...customFilters, date: "today" });
                setIsCustomDateModalOpen(false);
              }}
              className={customFilters.date === "today" ? "bg-accent" : ""}
            >
              <span>{"Aujourd'hui"}</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setCustomFilters({ ...customFilters, date: "week" });
                setIsCustomDateModalOpen(false);
              }}
              className={customFilters.date === "week" ? "bg-accent" : ""}
            >
              <span>Cette semaine</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setCustomFilters({ ...customFilters, date: "month" });
                setIsCustomDateModalOpen(false);
              }}
              className={customFilters.date === "month" ? "bg-accent" : ""}
            >
              <span>Ce mois</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setCustomFilters({ ...customFilters, date: "year" });
                setIsCustomDateModalOpen(false);
              }}
              className={customFilters.date === "year" ? "bg-accent" : ""}
            >
              <span>Cette année</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setCustomFilters({ ...customFilters, date: "custom" });
                setIsCustomDateModalOpen(true);
              }}
              className={customFilters.date === "custom" ? "bg-accent" : ""}
            >
              <span>Personnalisé</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Collapsible
          open={isCustomDateModalOpen}
          onOpenChange={setIsCustomDateModalOpen}
          disabled={customFilters.date !== "custom"}
        >
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              {"Plage personnalisée"}
              <span className="text-muted-foreground text-xs">
                {customFilters.from && customFilters.to
                  ? `${format(customFilters.from, "dd/MM/yyyy")} → ${format(
                      customFilters.to,
                      "dd/MM/yyyy",
                    )}`
                  : "Choisir"}
              </span>
            </Button>
          </CollapsibleTrigger>

          <CollapsibleContent className="space-y-4 pt-4">
            <Calendar
              mode="range"
              selected={{
                from: customFilters.from
                  ? new Date(customFilters.from)
                  : undefined,
                to: customFilters.to ? new Date(customFilters.to) : undefined,
              }}
              onSelect={(range) => {
                if (!range?.from || !range?.to) return;
                const from = new Date(range.from);
                const to = new Date(range.to);
                to.setHours(23, 59, 59, 999);
                setCustomFilters({
                  ...customFilters,
                  from: from.toISOString(),
                  to: to.toISOString(),
                });
              }}
              numberOfMonths={1}
              className="rounded-md border w-full"
            />
            <div className="space-y-1">
              <Button
                className="w-full"
                onClick={() => {
                  setCustomFilters({
                    ...customFilters,
                    from: "",
                    to: "",
                  });
                  setIsCustomDateModalOpen(false);
                }}
              >
                {"Annuler"}
              </Button>
              <Button
                className="w-full"
                variant={"outline"}
                onClick={() => {
                  setIsCustomDateModalOpen(false);
                }}
              >
                {"Réduire"}
              </Button>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
      {/* Bouton pour réinitialiser les filtres */}
      <div className="flex items-end">
        <Button variant="outline" onClick={resetAllFilters} className="w-full">
          {"Réinitialiser"}
        </Button>
      </div>
    </>
  );
}
