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
  AlertTriangle,
  ArrowUpDown,
  Check,
  ChevronDown,
  Eye,
  LucidePen,
  Search,
  Trash2,
} from "lucide-react";
import * as React from "react";

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
import { driverQ } from "@/queries/driver";
import { Driver } from "@/types/types";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Pagination } from "../base/pagination";
import { ModalWarning } from "../modals/modal-warning";
import { Badge } from "../ui/badge";
import { ShowDriver } from "./show-driver";
import UpdateDriver from "./updateDriver";

interface DriversTableProps {
  data: Driver[];
}

export function DriverTable({ data }: DriversTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "firstName", desc: true },
  ]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [globalFilter, setGlobalFilter] = React.useState("");

  const [selectedItem, setSelectedItem] = React.useState<Driver | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = React.useState(false);
  const [openUpdate, setOpenUpdate] = React.useState(false);
  const [openWarning, SetOpenWarning] = React.useState(false);

  // États pour les filtres
  const [regimeFilter, setRegimeFilter] = React.useState<string>("all");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");

  const driverMutation = useMutation({
    mutationFn: (id: number) => driverQ.delete(id),
    onSuccess: () => {
      toast.success("Fournisseur supprimé avec succès !");
    },
  });

  // Fonction pour vérifier les informations du fournisseur
  const checkDriverInfo = (driver: Driver): "complet" | "incomplet" => {
    const allFields = [
      driver.firstName,
      driver.lastName,
      driver.idCard,
      driver.licence,
    ];

    return allFields.every(
      (field) => typeof field === "string" && field.trim() !== "",
    )
      ? "complet"
      : "incomplet";
  };

  // Données filtrées
  const filteredData = React.useMemo(() => {
    let filtered = [...data];

    // Filtre par recherche globale
    if (globalFilter) {
      filtered = filtered.filter((driver) => {
        const searchableFields = ["firstName", "lastName"];
        return searchableFields.some((field) => {
          const value = driver[field as keyof Driver];
          return value
            ?.toString()
            .toLowerCase()
            .includes(globalFilter.toLowerCase());
        });
      });
    }

    // Filtre par statut (complet/incomplet)
    if (statusFilter !== "all") {
      filtered = filtered.filter((driver) => {
        const status = checkDriverInfo(driver);
        return status === statusFilter;
      });
    }

    return filtered;
  }, [data, globalFilter, regimeFilter, statusFilter]);

  const translateColumns = (columnId: string) => {
    const translations: { [key: string]: string } = {
      firstName: "Nom ",
      lastName: "Prenom",
      completionStatus: "Statut",
    };
    return translations[columnId] || columnId;
  };

  const columns = React.useMemo<ColumnDef<Driver>[]>(
    () => [
      {
        accessorKey: "firstName",
        header: ({ column }) => {
          return (
            <span
              className="tablehead"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Nom
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </span>
          );
        },
        cell: ({ row }) => (
          <div className="font-medium uppercase">
            {row.getValue("firstName")}
          </div>
        ),
      },
      {
        accessorKey: "lastName",
        header: ({ column }) => {
          return (
            <span
              className="tablehead"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Pre Nom
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </span>
          );
        },
        cell: ({ row }) => {
          const lname = row.original.lastName;
          return (
            <div className="font-medium">
              {lname || <span className="text-muted-foreground">{lname}</span>}
            </div>
          );
        },
      },
      {
        id: "completionStatus",
        accessorFn: (row) => checkDriverInfo(row),
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
          const status = checkDriverInfo(row.original);
          return (
            <div className="font-medium">
              <Badge variant={status === "complet" ? "success" : "amber"}>
                {status === "complet" ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <AlertTriangle className="h-4 w-4" />
                )}
                {status === "complet" ? "Complet" : "Incomplet"}
              </Badge>
            </div>
          );
        },
      },
      {
        id: "actions",
        header: "Actions",
        enableHiding: false,
        cell: ({ row }) => {
          const driver = row.original;

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant={"outline"}>
                  {"Actions"}
                  <ChevronDown />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{"Actions"}</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedItem(driver);
                    setOpenUpdate(true);
                  }}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  {"Voir"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedItem(driver);
                    setIsUpdateModalOpen(true);
                  }}
                >
                  <LucidePen className="mr-2 h-4 w-4" />
                  {"Modifier"}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedItem(driver);
                    SetOpenWarning(true);
                  }}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4 text-destructive" />
                  {"Supprimer"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [],
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
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, columnId, filterValue) => {
      const searchableColumns = ["name", "email", "phone", "address", "regem"];
      return searchableColumns.some((column) => {
        const value = row.getValue(column);
        return value
          ?.toString()
          .toLowerCase()
          .includes(filterValue.toLowerCase());
      });
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
  });

  // Fonction pour réinitialiser tous les filtres
  const resetAllFilters = () => {
    setRegimeFilter("all");
    setStatusFilter("all");
    setGlobalFilter("");
  };

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center gap-3 py-4">
        {/* Recherche existante */}
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom, email, téléphone..."
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="pl-8 w-[250px]"
          />
        </div>

        {/* Filtre par statut */}
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Tous les statuts" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{"Tous les statuts"}</SelectItem>
            <SelectItem value="complet">
              <div className="flex items-center gap-2">
                <Badge variant="success" className="h-4 w-4 p-0">
                  <Check className="h-3 w-3" />
                </Badge>
                {"Complet"}
              </div>
            </SelectItem>
            <SelectItem value="incomplet">
              <div className="flex items-center gap-2">
                <Badge variant="amber" className="h-4 w-4 p-0">
                  <AlertTriangle className="h-3 w-3" />
                </Badge>
                {"Incomplet"}
              </div>
            </SelectItem>
          </SelectContent>
        </Select>

        {/* Menu des colonnes */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto bg-transparent">
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
                    {translateColumns(column.id)}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Reste du code inchangé */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className="border-r last:border-r-0"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
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
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="border-r last:border-r-0"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
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
                  Aucun résultat trouvé avec les filtres actuels
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Pagination table={table} />
      <UpdateDriver
        open={isUpdateModalOpen}
        setOpen={setIsUpdateModalOpen}
        driverData={selectedItem}
      />
      <ShowDriver
        open={openUpdate}
        onOpenChange={setOpenUpdate}
        data={selectedItem}
      />
      <ModalWarning
        variant="error"
        title="Supprimer"
        name={selectedItem?.firstName}
        description="êtes-vous sur de vouloir supprimer ce fournisseur ?"
        open={openWarning}
        onOpenChange={SetOpenWarning}
        onAction={() => driverMutation.mutate(selectedItem?.id!)}
        actionText="Supprimer"
      />
    </div>
  );
}
