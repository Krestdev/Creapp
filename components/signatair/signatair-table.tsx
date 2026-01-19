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

import { Badge } from "@/components/ui/badge";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { userQ } from "@/queries/baseModule";
import { PayType, Signatair } from "@/types/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Pagination } from "../base/pagination";
import UpdateUser from "./updateSignatair";
// import { ShowUser } from "./show-user";
import { TranslateRole } from "@/lib/utils";
import { useStore } from "@/providers/datastore";
import { ModalWarning } from "../modals/modal-warning";
import { signatairQ } from "@/queries/signatair";
import EditSignatairForm from "./updateSignatair";

interface UtilisateursTableProps {
  data: Signatair[];
}

export function SignatairTable({ data }: UtilisateursTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "Bank", desc: true },
  ]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({ createdAt: false });
  const [rowSelection, setRowSelection] = React.useState({});
  const [globalFilter, setGlobalFilter] = React.useState("");

  const [selectedItem, setSelectedItem] = React.useState<Signatair | null>(
    null,
  );
  const [isUpdateModalOpen, setIsUpdateModalOpen] = React.useState(false);
  const [isUpdatePasswordModalOpen, setIsUpdatePasswordModalOpen] =
    React.useState(false);
  // const [isDetailModalOpen, setIsDetailModalOpen] = React.useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);

  const { user } = useStore();
  const queryClient = useQueryClient();

  const signatairMutation = useMutation({
    mutationFn: (id: number) => signatairQ.delete(id),
    onSuccess: () => {
      toast.success("Signatair supprimer");
      // queryClient.invalidateQueries({
      //   queryKey: ["SignatairList"],
      //   refetchType: "active",
      // });
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

  const columns = React.useMemo<ColumnDef<Signatair>[]>(
    () => [
      // Colonne unique pour Nom & Prénom
      {
        id: "user",
        header: ({ column }) => (
          <span
            className="tablehead cursor-pointer select-none flex items-center"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Utilisateur
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </span>
        ),

        accessorFn: (row) =>
          row.user?.map((user, i) => (
            <Badge key={i} className={`flex items-center gap-1 w-fit`}>
              {formatFullName(user.lastName, user.firstName) ?? "Non Defini"}
            </Badge>
          )),

        cell: ({ row }) => {
          const fullName = row.getValue("user") as string;
          return <div className="font-medium space-y-1">{fullName}</div>;
        },
      },
      {
        accessorKey: "Bank",
        header: ({ column }) => {
          return (
            <span
              className="tablehead"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Bank
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </span>
          );
        },
        cell: ({ row }) => {
          const label = row.original.Bank?.label ?? "pas de label";
          return <div className="font-medium">{label}</div>;
        },
      },
      {
        accessorKey: "payType",
        header: ({ column }) => {
          return (
            <span
              className="tablehead"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Type
              {/* <ArrowUpDown className="ml-2 h-4 w-4" /> */}
            </span>
          );
        },
        cell: ({ row }) => {
          const paytype = row.original.payTypes?.label;
          return (
            <Badge className={`flex items-center gap-1 w-fit`}>
              {paytype ?? "Non Defini"}
            </Badge>
          );
        },
      },
      {
        accessorKey: "mode",
        header: ({ column }) => {
          return (
            <span
              className="tablehead"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Mode
              {/* <ArrowUpDown className="ml-2 h-4 w-4" /> */}
            </span>
          );
        },
        cell: ({ row }) => {
          const mode = row.original.mode;
          let message = "";
          if (mode == "ONE") {
            message = "Un Signataire";
          } else {
            message = "Tout les Signataires";
          }
          return (
            <Badge className={`flex items-center gap-1 w-fit`}>
              {message ?? "Non Defini"}
            </Badge>
          );
        },
      },
      {
        id: "actions",
        header: () => <span className="tablehead">Action</span>,
        enableHiding: false,
        cell: ({ row }) => {
          const signatair = row.original;

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
                {/* <DropdownMenuItem
                  onClick={() => {
                    setSelectedItem(signatair);
                    setIsDetailModalOpen(true);
                  }}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Voir
                </DropdownMenuItem> */}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedItem(signatair);
                    setIsUpdateModalOpen(true);
                  }}
                >
                  <LucidePen className="mr-2 h-4 w-4" />
                  Modifier
                </DropdownMenuItem>

                {/* <DropdownMenuItem
                  className="text-red-600"
                  onClick={() => {
                    setSelectedItem(signatair);
                    setIsDeleteModalOpen(true);
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Supprimer
                </DropdownMenuItem> */}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [user?.id, signatairMutation],
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
      const signatair = row.original;

      // Recherche dans les FullNames
      const fullName =
        signatair.user?.map((user) =>
          TranslateRole(
            user.firstName?.toLowerCase() +
              " " +
              user.lastName?.toLowerCase() || "",
          ),
        ) || [];

      // Recherche dans les autres champs
      const searchFields = [fullName, signatair.Bank?.label.toLowerCase()];

      // Vérifier si le terme de recherche correspond à n'importe quel champ
      return [...searchFields].some((field) => field?.includes(searchValue));
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
    queryClient.invalidateQueries({
      queryKey: ["SignatairList"],
      refetchType: "active",
    });
  };

  return (
    <div className="w-full">
      <div className="flex flex-col gap-4 py-4 md:flex-row md:items-center">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom, email ou rôle..."
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="pl-8 w-full md:max-w-sm"
          />
        </div>
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
                if (column.id === "user") text = "Nom & Prénom";
                else if (column.id === "payType") text = "type de payment";
                else if (column.id === "Bank") text = "bank";

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
            {table.getFilteredSelectedRowModel().rows.length} utilisateur(s)
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
                  Aucun utilisateur trouvé.
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
          <EditSignatairForm
            open={isUpdateModalOpen}
            setOpen={setIsUpdateModalOpen}
            signatair={selectedItem}
            onSuccess={handleUpdateSuccess}
          />
          {/* <ShowUser
            open={isDetailModalOpen}
            onOpenChange={setIsDetailModalOpen}
            user={selectedItem}
          /> */}
          <ModalWarning
            open={isDeleteModalOpen}
            onOpenChange={setIsDeleteModalOpen}
            title="Supprimer l'utilisateur"
            description="Êtes-vous sûr de vouloir supprimer cet utilisateur ?"
            variant="error"
            onAction={() => signatairMutation.mutate(selectedItem?.id ?? -1)}
          />
        </>
      )}
    </div>
  );
}
