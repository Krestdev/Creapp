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
  Pencil,
  Search,
  Settings2,
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { Label } from "../ui/label";

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
  const [statusFilter, setStatusFilter] = React.useState<"all" | "complet" | "incomplet">("all");

  const driverMutation = useMutation({
    mutationFn: (id: number) => driverQ.delete(id),
    onSuccess: () => {
      toast.success("Chauffeur supprimé avec succès !");
    },
  });

  // Fonction pour vérifier les informations du chauffeur
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
    return data.filter(d=>{
      //status Filter
      const matchStatus = statusFilter === "all" ? true :
      statusFilter === checkDriverInfo(d);
      return matchStatus; 
    });
  }, [data, statusFilter]);

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
              {"Noms"}
              <ArrowUpDown />
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
              {"Prénoms"}
              <ArrowUpDown />
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
              <ArrowUpDown />
            </span>
          );
        },
        cell: ({ row }) => {
          const status = checkDriverInfo(row.original);
          return (
            <div className="font-medium">
              <Badge variant={status === "complet" ? "success" : "amber"}>
                {status === "complet" ? <Check /> : <AlertTriangle />}
                {status === "complet" ? "Complet" : "Incomplet"}
              </Badge>
            </div>
          );
        },
      },
      {
        id: "actions",
        header: ()=><span className="tablehead">{"Actions"}</span>,
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
                  <Eye />
                  {"Voir"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedItem(driver);
                    setIsUpdateModalOpen(true);
                  }}
                >
                  {" "}
                  <Pencil />
                  {"Modifier"}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedItem(driver);
                    SetOpenWarning(true);
                  }}
                  className="text-destructive"
                >
                  <Trash2 />
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
      if (!filterValue || filterValue === '') return true;
      const searchValue = filterValue.toLowerCase().trim();
      const item = row.original;
      const status = checkDriverInfo(item);
      if(item.firstName.toLocaleLowerCase().includes(searchValue)) return true;
      if(item.lastName.toLocaleLowerCase().includes(searchValue)) return true;
      if(status.includes(searchValue)) return true;
      if(String(item.id) === searchValue) return true;
      return false;
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
    <div className="content">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant={"outline"}>
              <Settings2 />
              {"Filtres"}
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>{"Filtres"}</SheetTitle>
              <SheetDescription>
                {"Configurer les fitres pour affiner les données"}
              </SheetDescription>
            </SheetHeader>
            <div className="px-5 grid gap-5">
              {/**Global Filter (Search) */}
              <div className="grid gap-1.5">
                <Label htmlFor="searchCommand">{"Recherche globale"}</Label>
                <Input
                  name="search"
                  type="search"
                  id="searchCommand"
                  placeholder="Référence, libellé"
                  value={globalFilter ?? ""}
                  onChange={(event) => setGlobalFilter(event.target.value)}
                  className="max-w-sm"
                />
              </div>
              {/**Status Filter */}
              <div className="grid gap-1.5">
                <Label htmlFor="statusFilter">{"Statut"}</Label>
                <Select value={statusFilter} onValueChange={(v)=>setStatusFilter(v as typeof statusFilter)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Tous les statuts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{"Tous les statuts"}</SelectItem>
                    <SelectItem value="complet">{"Complet"}</SelectItem>
                    <SelectItem value="incomplet">{"Incomplet"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {/* Bouton pour réinitialiser les filtres */}
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={resetAllFilters}
                  className="w-full"
                >
                  {"Réinitialiser"}
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
        {/* Menu des colonnes */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
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
      {
        selectedItem &&
        <UpdateDriver
        open={isUpdateModalOpen}
        setOpen={setIsUpdateModalOpen}
        driverData={selectedItem}
      />}
      {
        selectedItem &&
        <ShowDriver
        open={openUpdate}
        onOpenChange={setOpenUpdate}
        data={selectedItem}
      />}
      <ModalWarning
        variant="error"
        title="Chauffeur - "
        name={selectedItem?.firstName}
        description="êtes-vous sur de vouloir supprimer ce chauffeur ?"
        open={openWarning}
        onOpenChange={SetOpenWarning}
        onAction={() => driverMutation.mutate(selectedItem?.id!)}
        actionText="Supprimer"
      />
    </div>
  );
}
