"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PaymentRequest, PRIORITIES } from "@/types/types";
import { ChevronDown } from "lucide-react";

export interface PaymentSignatureFiltersProps {
  customFilters: {
    search: string;
    amount: number;
    amountType: "equal" | "greater" | "less";
    priority: "all" | PaymentRequest["priority"];
    tab: "pending" | "signed";
  };
  setCustomFilters: (filters: {
    search: string;
    amount: number;
    amountType: "equal" | "greater" | "less";
    priority: "all" | PaymentRequest["priority"];
    tab: "pending" | "signed";
  }) => void;
  resetAllFilters: () => void;
}

export default function PaymentSignatureFilters({
  customFilters,
  setCustomFilters,
  resetAllFilters,
}: PaymentSignatureFiltersProps) {
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
      {/* Bouton pour réinitialiser les filtres */}
      <div className="flex items-end">
        <Button variant="outline" onClick={resetAllFilters} className="w-full">
          {"Réinitialiser"}
        </Button>
      </div>
    </>
  );
}
