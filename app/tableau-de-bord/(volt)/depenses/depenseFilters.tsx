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
import {
  DateFilter,
  PaymentRequest,
  PayType,
  Provider,
  User,
} from "@/types/types";
import { ChevronDown } from "lucide-react";
import React from "react";

interface DepenseFiltersProps {
  customFilters: {
    search: string;
    beneficiary: "all" | number;
    amount: number;
    amountType: "equal" | "greater" | "less";
    provider: number;
    priority: PaymentRequest["priority"];
    paymentMethod: number;
    isSelected: boolean;
    type: PaymentRequest["type"];
    date: DateFilter;
    from: string;
    to: string;
  };
  setCustomFilters: (filters: {
    search: string;
    beneficiary: "all" | number;
    amount: number;
    amountType: "equal" | "greater" | "less";
    provider: number;
    priority: PaymentRequest["priority"];
    paymentMethod: number;
    isSelected: boolean;
    type: PaymentRequest["type"];
    date: DateFilter;
    from: string;
    to: string;
  }) => void;
  isCustomDateModalOpen: boolean;
  setIsCustomDateModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setDateFilter: (filter: DateFilter) => void;
  providers: Provider[];
  paymentTypes: PayType[];
  users: User[];
  resetAllFilters: () => void;
}

export default function DepenseFilters({
  customFilters,
  setCustomFilters,
  isCustomDateModalOpen,
  setIsCustomDateModalOpen,
  setDateFilter,
  providers,
  paymentTypes,
  users,
  resetAllFilters,
}: DepenseFiltersProps) {
  const [beneficiarySearch, setBeneficiarySearch] = React.useState<string>("");
  const filteredUsers = React.useMemo(() => {
    return users.filter((user) => {
      const fullName = user.firstName
        .toLowerCase()
        .concat(" ", user.lastName.toLowerCase());
      return fullName.includes(beneficiarySearch.toLowerCase());
    });
  }, [users, beneficiarySearch]);
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
      {/**Beneficiary Filter */}
      <div className="grid gap-1.5">
        <Label htmlFor="beneficiary">Bénéficiaire</Label>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              <span className="truncate">
                {customFilters.beneficiary === "all"
                  ? "Tous les bénéficiaires"
                  : users.find((u) => u.id === customFilters.beneficiary)
                      ?.firstName || "Sélectionner un bénéficiaire"}
              </span>
              <ChevronDown className="ml-2 h-4 w-4 shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] max-h-[300px] overflow-y-auto">
            <div className="p-2 sticky top-0 bg-popover z-10 border-b">
              <Input
                placeholder="Rechercher un bénéficiaire..."
                className="h-8"
                value={beneficiarySearch}
                onChange={(e) => setBeneficiarySearch(e.target.value)}
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
                autoFocus
              />
            </div>
            <DropdownMenuItem
              onClick={() => {
                setCustomFilters({ ...customFilters, beneficiary: "all" });
              }}
              className={customFilters.beneficiary === "all" ? "bg-accent" : ""}
            >
              <div className="flex items-center gap-2">
                <span>Tous les bénéficiaires</span>
              </div>
            </DropdownMenuItem>
            {filteredUsers.map((user) => (
              <DropdownMenuItem
                key={user.id}
                onClick={() => {
                  setCustomFilters({
                    ...customFilters,
                    beneficiary: user.id,
                  });
                }}
                className={
                  customFilters.beneficiary === user.id ? "bg-accent" : ""
                }
              >
                <div className="flex items-center gap-2">
                  <span className="truncate">
                    {user.firstName.concat(" ", user.lastName)}
                  </span>
                </div>
              </DropdownMenuItem>
            ))}
            {filteredUsers.length === 0 && (
              <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                Aucun bénéficiaire trouvé
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
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
    </>
  );
}
