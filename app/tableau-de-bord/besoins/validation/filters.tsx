import { SearchableSelect } from "@/components/base/searchableSelect";
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
import { Label } from "@/components/ui/label";
import { getUserName } from "@/lib/utils";
import {
  DateFilter,
  REQUEST_STATUS,
  RequestModelT,
  RequestType,
  User,
} from "@/types/types";
import { format } from "date-fns";
import { ChevronDown } from "lucide-react";

export interface ApprovalFiltersProps {
  customFilters: {
    search: string;
    user: string;
    tab: "pending" | "processed";
    category: string;
    project: string;
    status: string;
    type: string;
    date: DateFilter;
    from: string;
    to: string;
  };
  setCustomFilters: (filters: {
    search: string;
    user: string;
    tab: "pending" | "processed";
    category: string;
    project: string;
    status: string;
    type: string;
    date: DateFilter;
    from: string;
    to: string;
  }) => void;
  uniqueCategories: { id: number; label: string }[];
  isCustomDateModalOpen: boolean;
  setIsCustomDateModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setDateFilter: (filter: DateFilter) => void;
  users: User[];
  uniqueProjects: {
    id: number;
    label: string;
  }[];
  requestTypes: RequestType[];
  resetAllFilters: () => void;
}

export default function ApprovalFilters({
  customFilters,
  setCustomFilters,
  uniqueCategories,
  isCustomDateModalOpen,
  setIsCustomDateModalOpen,
  setDateFilter,
  users,
  uniqueProjects,
  requestTypes,
  resetAllFilters,
}: ApprovalFiltersProps) {
  return (
    <>
      {/* Category filter */}
      <div className="grid gap-1.5">
        <Label htmlFor="category">{"Catégorie"}</Label>
        <SearchableSelect
          value={customFilters.category}
          onChange={(v) => setCustomFilters({ ...customFilters, category: v })}
          options={uniqueCategories.map((category) => ({
            value: String(category.id),
            label: category.label,
          }))}
          placeholder="Sélectionner une catégorie"
          allLabel="Toutes les catégories"
          emptyLabel="Aucune catégorie trouvée"
        />
      </div>

      {/* User filter */}
      <div className="grid gap-1.5">
        <Label htmlFor="initiator">{"Utilisateur"}</Label>
        <SearchableSelect
          value={customFilters.user}
          onChange={(v) => setCustomFilters({ ...customFilters, user: v })}
          options={users.map((user) => ({
            value: String(user.id),
            label: getUserName(users, user.id) ?? "",
          }))}
          placeholder="Sélectionner un utilisateur"
          allLabel="Tous les utilisateurs"
          emptyLabel="Aucun utilisateur trouvé"
        />
      </div>

      {/**Type Filter */}
      <div className="grid gap-1.5">
        <Label htmlFor="type">{"Type de besoin"}</Label>
        <SearchableSelect
          value={customFilters.type}
          onChange={(v) =>
            setCustomFilters({
              ...customFilters,
              type: v as RequestModelT["type"] | "all",
            })
          }
          options={requestTypes.map((type) => ({
            value: String(type.type),
            label: type.label,
          }))}
          placeholder="Type de besoin"
          allLabel="Tous"
          emptyLabel="Aucun type trouvé"
        />
      </div>

      {/* Project filter */}
      <div className="grid gap-1.5">
        <Label htmlFor="project">{"Projet"}</Label>
        <SearchableSelect
          value={customFilters.project}
          onChange={(v) => setCustomFilters({ ...customFilters, project: v })}
          options={uniqueProjects.map((project) => ({
            value: String(project.id),
            label: project.label,
          }))}
          placeholder="Sélectionner un projet"
          allLabel="Tous les projets"
          emptyLabel="Aucun projet trouvé"
        />
      </div>

      {/* Status filter */}
      <div className="grid gap-1.5">
        <Label htmlFor="status">{"Statut"}</Label>
        <SearchableSelect
          value={customFilters.status}
          onChange={(v) => setCustomFilters({ ...customFilters, status: v })}
          options={REQUEST_STATUS.map((status) => ({
            value: status.value,
            label: status.name,
          }))}
          placeholder="Sélectionner un statut"
          allLabel="Tous les statuts"
          emptyLabel="Aucun statut trouvé"
        />
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
