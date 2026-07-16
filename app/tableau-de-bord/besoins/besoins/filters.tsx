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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

export interface RequestFiltersProps {
  customFilters: {
    search: string;
    user: string;
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
  users: { data: User[] };
  uniqueProjects: {
    id: number;
    label: string;
  }[];
  requestTypes: RequestType[];
  resetAllFilters: () => void;
}

export default function Filters({
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
}: RequestFiltersProps) {
  return (
    <>
      {/* Category filter */}
      <div className="grid gap-1.5">
        <Label htmlFor="category">{"Catégorie"}</Label>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              <span className="truncate">
                {customFilters.category === "all"
                  ? "Toutes les catégories"
                  : uniqueCategories.find(
                      (c) => String(c.id) === customFilters.category,
                    )?.label || "Sélectionner une catégorie"}
              </span>
              <ChevronDown className="ml-2 h-4 w-4 shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="max-h-[300px] overflow-y-auto">
            <DropdownMenuItem
              onClick={() => {
                setCustomFilters({ ...customFilters, category: "all" });
              }}
              className={customFilters.category === "all" ? "bg-accent" : ""}
            >
              <div className="flex items-center gap-2">
                <span>Toutes les catégories</span>
              </div>
            </DropdownMenuItem>
            {uniqueCategories.map((category) => (
              <DropdownMenuItem
                key={category.id}
                onClick={() => {
                  setCustomFilters({
                    ...customFilters,
                    category: String(category.id),
                  });
                }}
                className={
                  customFilters.category === String(category.id)
                    ? "bg-accent"
                    : ""
                }
              >
                <div className="flex items-center gap-2">
                  <span className="truncate">{category.label}</span>
                </div>
              </DropdownMenuItem>
            ))}
            {uniqueCategories.length === 0 && (
              <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                Aucune catégorie trouvée
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* User filter */}
      <div className="grid gap-1.5">
        <Label htmlFor="initiator">{"Utilisateur"}</Label>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              <span className="truncate">
                {customFilters.user === "all"
                  ? "Tous les utilisateurs"
                  : getUserName(users.data, Number(customFilters.user)) ||
                    "Sélectionner un utilisateur"}
              </span>
              <ChevronDown className="ml-2 h-4 w-4 shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="max-h-[300px] overflow-y-auto">
            <DropdownMenuItem
              onClick={() => {
                setCustomFilters({ ...customFilters, user: "all" });
              }}
              className={customFilters.user === "all" ? "bg-accent" : ""}
            >
              <div className="flex items-center gap-2">
                <span>Tous les utilisateurs</span>
              </div>
            </DropdownMenuItem>
            {users.data.map((user) => (
              <DropdownMenuItem
                key={user.id}
                onClick={() => {
                  setCustomFilters({
                    ...customFilters,
                    user: String(user.id),
                  });
                }}
                className={
                  customFilters.user === String(user.id) ? "bg-accent" : ""
                }
              >
                <div className="flex items-center gap-2">
                  <span className="truncate">
                    {getUserName(users.data, user.id)}
                  </span>
                </div>
              </DropdownMenuItem>
            ))}
            {users.data.length === 0 && (
              <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                Aucun utilisateur trouvé
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/**Type Filter */}
      <div className="grid gap-1.5">
        <Label htmlFor="type">{"Type de besoin"}</Label>
        <Select
          value={customFilters.type}
          onValueChange={(v) =>
            setCustomFilters({
              ...customFilters,
              type: v as RequestModelT["type"] | "all",
            })
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Type de besoin" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            {requestTypes.map((type) => (
              <SelectItem key={type.id} value={String(type.type)}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Project filter */}
      <div className="grid gap-1.5">
        <Label htmlFor="project">{"Projet"}</Label>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              <span className="truncate">
                {customFilters.project === "all"
                  ? "Tous les projets"
                  : uniqueProjects.find(
                      (p) => String(p.id) === customFilters.project,
                    )?.label || "Sélectionner un projet"}
              </span>
              <ChevronDown className="ml-2 h-4 w-4 shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="max-h-[300px] overflow-y-auto">
            <DropdownMenuItem
              onClick={() => {
                setCustomFilters({ ...customFilters, project: "all" });
              }}
              className={customFilters.project === "all" ? "bg-accent" : ""}
            >
              <div className="flex items-center gap-2">
                <span>Tous les projets</span>
              </div>
            </DropdownMenuItem>
            {uniqueProjects.map((project) => (
              <DropdownMenuItem
                key={project.id}
                onClick={() => {
                  setCustomFilters({
                    ...customFilters,
                    project: String(project.id),
                  });
                }}
                className={
                  customFilters.project === String(project.id)
                    ? "bg-accent"
                    : ""
                }
              >
                <div className="flex items-center gap-2">
                  <span className="truncate">{project.label}</span>
                </div>
              </DropdownMenuItem>
            ))}
            {uniqueProjects.length === 0 && (
              <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                Aucun projet trouvé
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Status filter */}
      <div className="grid gap-1.5">
        <Label htmlFor="status">{"Statut"}</Label>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              <span className="truncate">
                {customFilters.status === "all"
                  ? "Tous les statuts"
                  : REQUEST_STATUS.find((s) => s.value === customFilters.status)
                      ?.name || "Sélectionner"}
              </span>
              <ChevronDown className="ml-2 h-4 w-4 shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="max-h-[300px] overflow-y-auto">
            <DropdownMenuItem
              onClick={() => {
                setCustomFilters({ ...customFilters, status: "all" });
              }}
              className={customFilters.status === "all" ? "bg-accent" : ""}
            >
              <div className="flex items-center gap-2">
                <span>Tous les statuts</span>
              </div>
            </DropdownMenuItem>
            {REQUEST_STATUS.map((status) => (
              <DropdownMenuItem
                key={status.value}
                onClick={() => {
                  setCustomFilters({
                    ...customFilters,
                    status: status.value,
                  });
                }}
                className={
                  customFilters.status === status.value ? "bg-accent" : ""
                }
              >
                <div className="flex items-center gap-2">
                  <span>{status.name}</span>
                </div>
              </DropdownMenuItem>
            ))}
            {REQUEST_STATUS.length < 1 && (
              <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                Aucun statut trouvé
              </div>
            )}
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
