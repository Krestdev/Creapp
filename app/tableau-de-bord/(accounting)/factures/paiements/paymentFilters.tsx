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
  PaymentRequest,
  PRIORITIES,
  Provider,
} from "@/types/types";
import { format } from "date-fns";
import { ChevronDown } from "lucide-react";
import React from "react";

export interface PaymentFiltersProps {
  customFilters: {
    search: string;
    amount: number;
    amountType: "equal" | "greater" | "less";
    provider: "all" | number;
    priority: "all" | PaymentRequest["priority"];
    tab: "pending" | "processed" | "paid" | "cancelled";
    date: DateFilter;
    from: string;
    to: string;
  };
  setCustomFilters: (filters: {
    search: string;
    amount: number;
    amountType: "equal" | "greater" | "less";
    provider: "all" | number;
    priority: "all" | PaymentRequest["priority"];
    tab: "pending" | "processed" | "paid" | "cancelled";
    date: DateFilter;
    from: string;
    to: string;
  }) => void;
  isCustomDateModalOpen: boolean;
  setIsCustomDateModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setDateFilter: (filter: DateFilter) => void;
  providers: Provider[];
  resetAllFilters: () => void;
}

export default function PaymentFilters({
  customFilters,
  setCustomFilters,
  isCustomDateModalOpen,
  setIsCustomDateModalOpen,
  setDateFilter,
  providers,
  resetAllFilters,
}: PaymentFiltersProps) {
  const [providerSearch, setProviderSearch] = React.useState<string>("");
  const filteredProviders = React.useMemo(() => {
    return providers.filter((provider) => {
      const fullName = provider.name.toLowerCase();
      return fullName.includes(providerSearch.toLowerCase());
    });
  }, [providers, providerSearch]);
  return (
    <>
      {/**Amount Filter */}
      <div className="grid gap-1.5">
        <Label htmlFor="amount">Montant</Label>
        <Input
          id="amount"
          placeholder="Montant"
          type="number"
          value={customFilters.amount}
          onChange={(e) =>
            setCustomFilters({
              ...customFilters,
              amount: Number(e.target.value),
            })
          }
        />
      </div>
      {/**Amount Type Filter */}
      <div className="grid gap-1.5">
        <Label htmlFor="amountType">Type de montant</Label>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              <span className="truncate">
                {customFilters.amountType === "equal"
                  ? "Égal"
                  : customFilters.amountType === "greater"
                    ? "Supérieur"
                    : "Inférieur"}
              </span>
              <ChevronDown className="ml-2 h-4 w-4 shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width]">
            <DropdownMenuItem
              onClick={() => {
                setCustomFilters({
                  ...customFilters,
                  amountType: "equal",
                });
              }}
              className={
                customFilters.amountType === "equal" ? "bg-accent" : ""
              }
            >
              <div className="flex items-center gap-2">
                <span>Égal</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setCustomFilters({
                  ...customFilters,
                  amountType: "greater",
                });
              }}
              className={
                customFilters.amountType === "greater" ? "bg-accent" : ""
              }
            >
              <div className="flex items-center gap-2">
                <span>Supérieur</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setCustomFilters({
                  ...customFilters,
                  amountType: "less",
                });
              }}
              className={customFilters.amountType === "less" ? "bg-accent" : ""}
            >
              <div className="flex items-center gap-2">
                <span>Inférieur</span>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {/**Provider Filter */}
      <div className="grid gap-1.5">
        <Label htmlFor="provider">Fournisseur</Label>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              <span className="truncate">
                {customFilters.provider === "all"
                  ? "Tous les fournisseurs"
                  : providers.find((p) => p.id === customFilters.provider)
                      ?.name || "Sélectionner un fournisseur"}
              </span>
              <ChevronDown className="ml-2 h-4 w-4 shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] max-h-[300px] overflow-y-auto">
            <div className="p-2 sticky top-0 bg-popover z-10 border-b">
              <Input
                placeholder="Rechercher un fournisseur..."
                className="h-8"
                value={providerSearch}
                onChange={(e) => setProviderSearch(e.target.value)}
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
                autoFocus
              />
            </div>
            <DropdownMenuItem
              onClick={() => {
                setCustomFilters({
                  ...customFilters,
                  provider: "all",
                });
              }}
              className={customFilters.provider === "all" ? "bg-accent" : ""}
            >
              <div className="flex items-center gap-2">
                <span>Tous les fournisseurs</span>
              </div>
            </DropdownMenuItem>
            {filteredProviders.map((provider) => (
              <DropdownMenuItem
                key={provider.id}
                onClick={() => {
                  setCustomFilters({
                    ...customFilters,
                    provider: provider.id,
                  });
                }}
                className={
                  customFilters.provider === provider.id ? "bg-accent" : ""
                }
              >
                <div className="flex items-center gap-2">
                  <span className="truncate">{provider.name}</span>
                </div>
              </DropdownMenuItem>
            ))}
            {filteredProviders.length === 0 && (
              <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                Aucun fournisseur trouvé
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {/**Priority Filter */}
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
