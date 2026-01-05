"use client";

import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  CheckCircle,
  ChevronDown,
  Eye,
  LucideClock,
  LucideIcon,
  LucidePen,
  PauseCircle,
  PlayCircle,
  Search,
  Trash2,
  XCircle,
} from "lucide-react";
import * as React from "react";

import { Badge, badgeVariants } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ProjectQueries } from "@/queries/projectModule";
import { ProjectT } from "@/types/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { VariantProps } from "class-variance-authority";
import { toast } from "sonner";
import { Pagination } from "../base/pagination";
import { ModalWarning } from "../modals/modal-warning";
import { DetailProject } from "./detail-project";
import UpdateProject from "./UpdateProject";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

// Interface pour tous les filtres
export interface ProjectFilters {
  globalFilter: string;
  statusFilter: string | string[];
  chiefFilter: string;
  budgetOperator: "eq" | "lt" | "gt" | "lte" | "gte" | "none";
  budgetValue: string;
}

interface ProjectTableProps {
  data: ProjectT[];

  // Props pour les filtres (optionnelles pour compatibilité)
  filters?: ProjectFilters;
  setFilters?: React.Dispatch<React.SetStateAction<ProjectFilters>>;
}

export function ProjectTable({ data, filters, setFilters }: ProjectTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  // État local pour les filtres si les props ne sont pas fournies
  const [localFilters, setLocalFilters] = React.useState<ProjectFilters>({
    globalFilter: "",
    statusFilter: "all",
    chiefFilter: "all",
    budgetOperator: "none",
    budgetValue: "",
  });

  // Utiliser les filtres externes s'ils sont fournis, sinon utiliser les filtres locaux
  const effectiveFilters = filters || localFilters;
  const setEffectiveFilters = setFilters || setLocalFilters;

  const [selectedItem, setSelectedItem] = React.useState<ProjectT | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = React.useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = React.useState(false);
  const [isWarningModalOpen, setIsWarningModalOpen] = React.useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const [isCompletedModalOpen, setIsCompletedModalOpen] = React.useState(false);
  const [isSuspendedModalOpen, setIsSuspendedModalOpen] = React.useState(false);

  // Obtenir la liste unique des chefs de projet
  const uniqueChiefs = React.useMemo(() => {
    const chiefs = data
      .map((project) => project.chief)
      .filter((chief) => chief && chief.name)
      .map((chief) => chief!.name);

    return [...new Set(chiefs)].sort();
  }, [data]);

  // Obtenir les budgets min et max pour les limites
  const budgetRange = React.useMemo(() => {
    if (!data.length) return { min: 0, max: 0 };

    const budgets = data.map((project) => project.budget || 0);
    return {
      min: Math.min(...budgets),
      max: Math.max(...budgets),
      avg: budgets.reduce((a, b) => a + b, 0) / budgets.length,
    };
  }, [data]);

  // Obtenir les statuts uniques qui existent dans les données actuelles
  const uniqueStatuses = React.useMemo(() => {
    const statuses = data.map((project) => project.status).filter(Boolean); // Filtrer les valeurs nulles/indéfinies

    return [...new Set(statuses)].sort();
  }, [data]);

  const getBadge = (
    status: string
  ): {
    label: string;
    icon?: LucideIcon;
    variant: VariantProps<typeof badgeVariants>["variant"];
  } => {
    switch (status) {
      case "planning":
        return { label: "En cours", variant: "amber" };
      case "in-progress":
        return { label: "En cours", icon: PlayCircle, variant: "amber" };
      case "on-hold":
        return { label: "Suspendu", icon: PauseCircle, variant: "destructive" };
      case "Completed":
        return { label: "Terminé", icon: CheckCircle, variant: "success" };
      case "cancelled":
        return { label: "Supprimé", icon: XCircle, variant: "destructive" };
      case "ongoing":
        return { label: "En cours", icon: LucideClock, variant: "amber" };
      default:
        return { label: status, variant: "outline" };
    }
  };

  const getRowColor = (status: string) => {
    switch (status) {
      case "planning":
        return "bg-amber-50";
      case "in-progress":
        return "bg-yellow-50";
      case "on-hold":
        return "bg-red-50";
      case "Completed":
        return "bg-green-50";
      case "cancelled":
        return "bg-red-50";
      default:
        return "";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XAF",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const queryClient = useQueryClient();

  const project = new ProjectQueries();
  const projectMutationData = useMutation({
    mutationKey: ["projectsStatus"],
    mutationFn: (data: { id: number; status: string }) =>
      project.update(data.id, { status: data.status }),
    onSuccess: () => {
      // invalidate and refetch
      toast.success("Projet mis à jour avec succès !");
      queryClient.invalidateQueries({ queryKey: ["projectsList"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
    onError: () => {
      toast.error(
        "Une erreur s'est produite lors de la mise à jour du projet."
      );
    },
  });

  // Fonction pour mettre à jour un filtre
  const updateFilter = (filterName: keyof ProjectFilters, value: any) => {
    setEffectiveFilters((prev) => ({
      ...prev,
      [filterName]: value,
    }));
  };

  // Fonction pour normaliser le texte (ignorer accents)
  const normalizeText = (value: unknown) =>
    String(value ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();

  // Fonction pour filtrer les données avec TOUS les filtres
  const filteredData = React.useMemo(() => {
    let filtered = [...data];

    // Filtrer par recherche globale (insensible aux accents)
    if (effectiveFilters.globalFilter) {
      const searchValue = normalizeText(effectiveFilters.globalFilter);
      filtered = filtered.filter((project) => {
        const searchText = [
          project.reference || "",
          project.label || "",
          project.chief?.name || "",
        ]
          .map((text) => normalizeText(text))
          .join(" ");

        return searchText.includes(searchValue);
      });
    }

    // Filtrer par statut
    if (
      effectiveFilters.statusFilter &&
      effectiveFilters.statusFilter !== "all"
    ) {
      if (Array.isArray(effectiveFilters.statusFilter)) {
        filtered = filtered.filter((project) =>
          effectiveFilters.statusFilter.includes(project.status)
        );
      } else {
        filtered = filtered.filter(
          (project) => project.status === effectiveFilters.statusFilter
        );
      }
    }

    // Filtrer par chef de projet
    if (
      effectiveFilters.chiefFilter &&
      effectiveFilters.chiefFilter !== "all"
    ) {
      filtered = filtered.filter(
        (project) => project.chief?.name === effectiveFilters.chiefFilter
      );
    }

    // Filtrer par budget avec opérateur
    if (
      effectiveFilters.budgetOperator !== "none" &&
      effectiveFilters.budgetValue
    ) {
      const budgetValue = Number(effectiveFilters.budgetValue);

      if (!isNaN(budgetValue)) {
        switch (effectiveFilters.budgetOperator) {
          case "eq": // Égal à
            filtered = filtered.filter(
              (project) => (project.budget || 0) === budgetValue
            );
            break;
          case "lt": // Inférieur à
            filtered = filtered.filter(
              (project) => (project.budget || 0) < budgetValue
            );
            break;
          case "gt": // Supérieur à
            filtered = filtered.filter(
              (project) => (project.budget || 0) > budgetValue
            );
            break;
          case "lte": // Inférieur ou égal à
            filtered = filtered.filter(
              (project) => (project.budget || 0) <= budgetValue
            );
            break;
          case "gte": // Supérieur ou égal à
            filtered = filtered.filter(
              (project) => (project.budget || 0) >= budgetValue
            );
            break;
        }
      }
    }

    return filtered;
  }, [data, effectiveFilters]);

  const columns: ColumnDef<ProjectT>[] = React.useMemo(
    () => [
      {
        accessorKey: "reference",
        header: ({ column }) => {
          return (
            <span
              className="tablehead"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              {"Référence"}
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </span>
          );
        },
        cell: ({ row }) => (
          <div className="font-medium">{row.getValue("reference")}</div>
        ),
      },
      {
        accessorKey: "label",
        header: ({ column }) => {
          return (
            <span
              className="tablehead"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              {"Projet"}
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </span>
          );
        },
        cell: ({ row }) => <div className="uppercase">{row.getValue("label")}</div>,
      },
      {
        accessorKey: "budget",
        header: ({ column }) => {
          return (
            <span
              className="tablehead"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              {"Budget prévisionnel"}
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </span>
          );
        },
        cell: ({ row }) => {
          const budget = row.getValue("budget") as number;
          const projectBudget = row.original.budget || 0;
          const budgetRangeInfo = budgetRange;
          let colorClass = "font-medium";

          if (projectBudget < budgetRangeInfo.avg! * 0.5) {
            colorClass = "font-medium text-green-600";
          } else if (projectBudget > budgetRangeInfo.avg! * 1.5) {
            colorClass = "font-medium text-red-600";
          }

          return <div className={colorClass}>{formatCurrency(budget)}</div>;
        },
      },
      {
        accessorKey: "chief",
        header: ({ column }) => {
          return (
            <span
              className="tablehead"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              {"Chef Projet"}
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </span>
          );
        },
        cell: ({ row }) => {
          const chief = row.getValue("chief") as { id: number; name: string };
          return <div>{chief ? chief.name : "Pas de chef"}</div>;
        },
      },
      {
        accessorKey: "status",
        header: ({ column }) => {
          return (
            <span
              className="tablehead"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              {"Statut"}
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </span>
          );
        },
        cell: ({ row }) => {
          const status = row.getValue("status") as string;
          const Icon = getBadge(status).icon;
          const variant = getBadge(status).variant;
          const label = getBadge(status).label;
          return (
            <Badge variant={variant}>
              {Icon && <Icon />}
              {label}
            </Badge>
          );
        },
        filterFn: (row, id, value) => {
          return value.includes(row.getValue(id));
        },
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => {
          return (
            <span
              className="tablehead"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              {"Date de création"}
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </span>
          );
        },
        cell: ({ row }) => {
          return (
            <div>
              {format(row.getValue("createdAt"), "PPP", { locale: fr })}
            </div>
          );
        },
        filterFn: (row, id, value) => {
          return value.includes(row.getValue(id));
        },
      },
      {
        id: "actions",
        header: () => {
          return <span className="tablehead">{"Actions"}</span>;
        },
        enableHiding: false,
        cell: ({ row }) => {
          const project = row.original;
          const isSuspended = project.status === "on-hold";

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost">
                  {"Actions"}
                  <ChevronDown />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{"Actions"}</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedItem(project);
                    setIsDetailModalOpen(true);
                  }}
                >
                  <Eye />
                  {"Voir"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedItem(project);
                    setIsUpdateModalOpen(true);
                  }}
                  disabled={project.status === "Completed"}
                >
                  <LucidePen />
                  {"Modifier"}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedItem(project);
                    setIsCompletedModalOpen(true);
                  }}
                  disabled={project.status === "Completed"}
                >
                  <CheckCircle />
                  {"Terminer"}
                </DropdownMenuItem>

                {/* Bouton "Suspendre" ou "Reprendre" selon l'état */}
                {isSuspended ? (
                  <DropdownMenuItem
                    onClick={() => {
                      setSelectedItem(project);
                      setIsWarningModalOpen(true);
                    }}
                  >
                    <PlayCircle />
                    {"Reprendre"}
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    onClick={() => {
                      setSelectedItem(project);
                      setIsSuspendedModalOpen(true);
                    }}
                    disabled={
                      project.status === "Completed" ||
                      project.status === "cancelled"
                    }
                  >
                    <PauseCircle />
                    {"Suspendre"}
                  </DropdownMenuItem>
                )}

                <DropdownMenuItem
                  className="text-red-600"
                  onClick={() => {
                    setSelectedItem(project);
                    setIsDeleteModalOpen(true);
                  }}
                  disabled={
                    project.status === "cancelled" ||
                    project.status === "Completed"
                  }
                >
                  <Trash2 className="text-red-600" />
                  {"Supprimer"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: (value) => updateFilter("globalFilter", value),
    globalFilterFn: (row, columnId, filterValue) => {
      const search = normalizeText(filterValue);

      if (!search) return true;

      // Pour chercher dans toutes les cellules de la ligne
      return row.getAllCells().some((cell) => {
        const cellValue = cell.getValue();
        return normalizeText(cellValue).includes(search);
      });
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter: effectiveFilters.globalFilter,
    },
  });

  const selectedRows = table.getFilteredSelectedRowModel().rows;

  return (
    <div className="w-full">
      <div className="flex flex-col gap-4 py-4">
        {/* Barre de recherche */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par projet..."
              value={effectiveFilters.globalFilter ?? ""}
              onChange={(event) =>
                updateFilter("globalFilter", event.target.value)
              }
              className="pl-8 max-w-lg w-full!"
            />
          </div>

          {/* Sélecteur de statut - affiche uniquement les statuts existants */}
          <Select
            value={
              typeof effectiveFilters.statusFilter === "string"
                ? effectiveFilters.statusFilter
                : "multiple"
            }
            onValueChange={(value) =>
              updateFilter("statusFilter", value === "all" ? "all" : value)
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Tous les statuts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              {uniqueStatuses.map((status) => {
                const badgeInfo = getBadge(status);
                return (
                  <SelectItem key={status} value={status}>
                    <div className="flex items-center gap-2">
                      {badgeInfo.icon && <badgeInfo.icon className="h-4 w-4" />}
                      {badgeInfo.label}
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>

          <Select
            value={effectiveFilters.chiefFilter}
            onValueChange={(value) => updateFilter("chiefFilter", value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Tous les chefs" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les chefs</SelectItem>
              {uniqueChiefs.map((chief) => (
                <SelectItem key={chief} value={chief}>
                  {chief}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <DropdownMenu>
            <DropdownMenuTrigger asChild className="ml-auto">
              <Button variant="outline">
                {"Colonnes"}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id === "reference"
                        ? "Référence"
                        : column.id === "label"
                          ? "Projet"
                          : column.id === "chief"
                            ? "Chef Projet"
                            : column.id === "budget"
                              ? "Budget prévisionnel"
                              : column.id === "status"
                                ? "Statut"
                                : column.id === "createdAt"
                                  ? "Date de création"
                                  : column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header, index) => {
                  return (
                    <TableHead
                      key={header.id}
                      className={
                        index < headerGroup.headers.length - 1 ? "border-r" : ""
                      }
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={getRowColor(row.original.status)}
                >
                  {row.getVisibleCells().map((cell, index) => (
                    <TableCell
                      key={cell.id}
                      className={
                        index < row.getVisibleCells().length - 1
                          ? "border-r"
                          : ""
                      }
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Aucun résultat trouvé avec les filtres actuels.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Pagination table={table} />
      <UpdateProject
        open={isUpdateModalOpen}
        setOpen={setIsUpdateModalOpen}
        projectData={selectedItem}
      />
      <DetailProject
        open={isDetailModalOpen}
        onOpenChange={setIsDetailModalOpen}
        data={selectedItem}
      />
      <ModalWarning
        open={isWarningModalOpen}
        onOpenChange={setIsWarningModalOpen}
        title="Reprendre le projet"
        message="Êtes-vous sûr de vouloir reprendre ce projet ?"
        actionText="Reprendre"
        onAction={() =>
          projectMutationData.mutate({
            id: selectedItem?.id ?? -1,
            status: "in-progress",
          })
        }
        name={selectedItem?.label}
        variant="warning"
      />
      <ModalWarning
        open={isSuspendedModalOpen}
        onOpenChange={setIsSuspendedModalOpen}
        title="Suspendre le projet"
        message="Êtes-vous sûr de vouloir suspendre ce projet ?"
        actionText="Suspendre"
        onAction={() =>
          projectMutationData.mutate({
            id: selectedItem?.id ?? -1,
            status: "on-hold",
          })
        }
        name={selectedItem?.label}
        variant="warning"
      />
      <ModalWarning
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        title="Supprimer le projet"
        message="Êtes-vous sûr de vouloir supprimer ce projet ? Cette action est irréversible."
        actionText="Supprimer"
        onAction={() =>
          projectMutationData.mutate({
            id: selectedItem?.id ?? -1,
            status: "cancelled",
          })
        }
        name={selectedItem?.label}
        variant="error"
      />
      <ModalWarning
        open={isCompletedModalOpen}
        onOpenChange={setIsCompletedModalOpen}
        title="Terminer le projet"
        message="Êtes-vous sûr de vouloir terminer ce projet ? Cette action est irréversible."
        actionText="Terminer"
        onAction={() =>
          projectMutationData.mutate({
            id: selectedItem?.id ?? -1,
            status: "Completed",
          })
        }
        name={selectedItem?.label}
        variant="error"
      />
    </div>
  );
}
