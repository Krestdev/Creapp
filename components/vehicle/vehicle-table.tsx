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
  ChevronDown,
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
import { useStore } from "@/providers/datastore";
import { vehicleQ } from "@/queries/vehicule";
import { Role, Vehicle } from "@/types/types";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Pagination } from "../base/pagination";
import { ModalWarning } from "../modals/modal-warning";
import UpdateVehicle from "./UpdateUser";

interface VehiclesTableProps {
  data: Vehicle[];
}

export function VehiclesTable({ data }: VehiclesTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({ createdAt: false });
  const [rowSelection, setRowSelection] = React.useState({});
  const [globalFilter, setGlobalFilter] = React.useState("");

  const [selectedItem, setSelectedItem] = React.useState<Vehicle | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = React.useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const [verifiedFilter, setVerifiedFilter] = React.useState<string>("all");

  const { user } = useStore();

  const vehicleMutation = useMutation({
    mutationFn: async (data: number) => vehicleQ.delete(Number(data)),

    onSuccess: () => {
      toast.success("Vehicle supprimé avec succès !");
    },

    onError: (e) => {
      console.error(e);
      toast.error("Une erreur est survenue lors de la suppression.");
    },
  });

  const capitalizeFirstName = (value: string) =>
    value
      .toLocaleLowerCase("fr-FR")
      .replace(/^\p{L}/u, (letter) => letter.toLocaleUpperCase("fr-FR"));

  const formatFullName = (lastName: string, firstName: string) =>
    `${lastName.toLocaleUpperCase("fr-FR")} ${capitalizeFirstName(firstName)}`;

  const columns = React.useMemo<ColumnDef<Vehicle>[]>(
    () => [
      // Colonne unique pour Nom & Prénom
      {
        accessorKey: "mark",
        header: ({ column }) => {
          return (
            <span
              className="tablehead"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Marque
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </span>
          );
        },
        cell: ({ row }) => (
          <div className="font-medium">{row.getValue("mark")}</div>
        ),
      },
      {
        id: "label",
        header: ({ column }) => (
          <span
            className="tablehead cursor-pointer select-none flex items-center"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Modèle
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </span>
        ),

        accessorFn: (row) => row.label,

        cell: ({ row }) => {
          return <div className="font-medium">{row.getValue("label")}</div>;
        },

        sortingFn: (rowA, rowB) => {
          return rowA.original.label.localeCompare(rowB.original.label, "fr", {
            sensitivity: "base",
          });
        },
      },
      {
        accessorKey: "matricule",
        header: ({ column }) => {
          return (
            <span
              className="tablehead"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Matricule
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </span>
          );
        },
        cell: ({ row }) => {
          return (
            <div className="flex flex-wrap max-w-[350px] gap-1">
              {row.getValue("matricule") ?? "Pas de couleur"}
            </div>
          );
        },
        filterFn: (row, columnId, filterValue) => {
          if (!filterValue || filterValue === "all") return true;

          const roles = row.getValue(columnId) as Role[];
          return roles?.some((role) =>
            role.label.toLowerCase().includes(filterValue.toLowerCase()),
          );
        },
      },
      {
        id: "actions",
        header: () => <span className="tablehead">Action</span>,
        enableHiding: false,
        cell: ({ row }) => {
          const vehicle = row.original;

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant={"outline"}>
                  {"Actions"}
                  <ChevronDown />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedItem(vehicle);
                    setIsUpdateModalOpen(true);
                  }}
                >
                  <LucidePen className="mr-2 h-4 w-4" />
                  Modifier
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={() => {
                    setSelectedItem(vehicle);
                    setIsDeleteModalOpen(true);
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [user?.id, vehicleMutation],
  );

  const table = useReactTable({
    data,
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
    globalFilterFn: (row, _, filterValue) => {
      if (!filterValue) return true;

      const searchValue = filterValue.toLowerCase();
      const vehicle = row.original;

      // Recherche dans le nom complet
      const name = vehicle.label.toLowerCase();

      // Recherche dans les autres champs
      const searchFields = [name, vehicle.mark.toLowerCase()];

      // Vérifier si le terme de recherche correspond à n'importe quel champ
      return [...searchFields].some((field) => field.includes(searchValue));
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
  });

  // Gestion des succès
  const handleUpdateSuccess = () => {
    setIsUpdateModalOpen(false);
    setSelectedItem(null);
  };

  return (
    <div className="w-full">
      <div className="flex flex-col gap-4 py-4 md:flex-row md:items-center">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom ou mark"
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="pl-8 w-full md:max-w-sm"
          />
        </div>
        <Select
          value={verifiedFilter}
          onValueChange={(value) => {
            setVerifiedFilter(value);
            if (value === "all") {
              table.getColumn("mark")?.setFilterValue(undefined);
            } else {
              table.getColumn("mark")?.setFilterValue(value);
            }
          }}
        >
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Filtrer par mark" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{"Toutes les marques"}</SelectItem>
            {Array.from(new Set(data.map((item) => item.mark))).map((mark) => (
              <SelectItem key={mark} value={mark}>
                {mark}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto bg-transparent">
              Colonnes <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                let text = column.id;
                if (column.id === "fullName") text = "Nom & Prénom";
                else if (column.id === "label") text = "Modèle";
                else if (column.id === "mark") text = "Marque";
                else if (column.id === "verified") text = "Statut";
                else if (column.id === "createdAt") text = "Date d'ajout";
                else if (column.id === "lastConnection")
                  text = "Dernière connexion";

                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {text}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {table.getFilteredSelectedRowModel().rows.length > 0 && (
        <div className="flex items-center justify-between gap-2 py-2">
          <span className="text-sm text-muted-foreground">
            {table.getFilteredSelectedRowModel().rows.length} vehicle(s)
            sélectionné(s)
          </span>
          <Button variant="outline" size="sm">
            Actions groupées
          </Button>
        </div>
      )}

      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className="border-r last:border-r-0 bg-muted/50"
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
                  Aucun vehicle trouvé.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4">
        <Pagination table={table} />
      </div>

      {selectedItem && (
        <>
          <UpdateVehicle
            open={isUpdateModalOpen}
            setOpen={setIsUpdateModalOpen}
            vehicleData={selectedItem}
            onSuccess={handleUpdateSuccess}
          />
          <ModalWarning
            open={isDeleteModalOpen}
            onOpenChange={setIsDeleteModalOpen}
            title="Supprimer l'vehicle"
            description="Êtes-vous sûr de vouloir supprimer ce vehicle ?"
            variant="error"
            onAction={() => vehicleMutation.mutate(selectedItem?.id ?? -1)}
          />
        </>
      )}
    </div>
  );
}
