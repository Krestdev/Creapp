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
  Eye,
  LucidePen,
  Trash
} from "lucide-react";
import * as React from "react";

import CancelQuotation from "@/app/tableau-de-bord/(sales)/commande/devis/cancel";
import EditQuotation from "@/app/tableau-de-bord/(sales)/commande/devis/edit";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getQuotationAmount, XAF } from "@/lib/utils";
import {
  CommandRequestT,
  Provider,
  Quotation,
  QuotationElement,
  QuotationStatus
} from "@/types/types";
import { VariantProps } from "class-variance-authority";
import { format } from "date-fns";
import { Pagination } from "../base/pagination";
import { DevisModal } from "../modals/DevisModal";
import { Badge, badgeVariants } from "../ui/badge";

interface DevisTableProps {
  data: Quotation[];
  providers: Array<Provider>;
  commands: Array<CommandRequestT>;
}

export function DevisTable({ data, providers, commands }: DevisTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({ element: false });
  const [rowSelection, setRowSelection] = React.useState({});

  const [isUpdateModalOpen, setIsUpdateModalOpen] = React.useState(false);
  const [toCancel, setToCancel] = React.useState(false);
  const [isDevisModalOpen, setIsDevisModalOpen] = React.useState(false);
  const [selectedDevis, setSelectedDevis] = React.useState<
    Quotation | undefined
  >(undefined);
  const [selectedQuotation, setSelectedQuotation] = React.useState<
    string | undefined
  >(undefined);


  const getProviderName = (providerId: number) => {
    const provider = providers.find((p) => p.id === providerId);
    return provider ? provider.name : "Inconnu";
  };

  const getQuotationTitle = (commandRequestId: number) => {
    const command = commands.find((c) => c.id === commandRequestId);
    return command ? command.title : "Inconnu";
  };

  const getQuotationRef = (commandRequestId: number) => {
    const command = commands.find((c) => c.id === commandRequestId);
    return command ? command.reference : "Inconnu";
  };

  const getStatusLabel = (
    status: QuotationStatus,
  ): {
    label: string;
    variant: VariantProps<typeof badgeVariants>["variant"];
  } => {
    switch (status) {
      case "PENDING":
        return { label: "En attente", variant: "amber" };
      case "APPROVED":
        return { label: "Approuvé", variant: "success" };
      case "REJECTED":
        return { label: "Rejeté", variant: "destructive" };
      case "SUBMITTED":
        return { label: "Soumis", variant: "primary" };
      default:
        return { label: "Inconnu", variant: "outline" };
    }
  };

  const columns: ColumnDef<Quotation>[] = [
    {
      accessorKey: "ref",
      header: ({ column }) => {
        return (
          <span
            className="tablehead"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {"Référence"}
            <ArrowUpDown />
          </span>
        );
      },
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("ref")}</div>
      ),
    },
    {
      accessorKey: "commandRequestId",
      header: ({ column }) => {
        return (
          <span
            className="tablehead"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {"Demande de cotation"}
            <ArrowUpDown />
          </span>
        );
      },
      cell: ({ row }) => (
        <div className="font-medium first-letter:uppercase">
          {`${getQuotationTitle(row.getValue("commandRequestId"))} - `}
          <span className="text-destructive text-[12px]">{`${getQuotationRef(
            row.getValue("commandRequestId"),
          )}`}</span>
        </div>
      ),
    },
    {
      accessorKey: "providerId",
      header: ({ column }) => {
        return (
          <span
            className="tablehead"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {"Fournisseur"}
            <ArrowUpDown />
          </span>
        );
      },
      cell: ({ row }) => (
        <div className="first-letter:uppercase">
          {getProviderName(row.getValue("providerId"))}
        </div>
      ),
    },
    {
      accessorKey: "montant",
      header: ({ column }) => {
        return (
          <span
            className="tablehead"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {"Montant"}
            <ArrowUpDown />
          </span>
        );
      },
      cell: ({ row }) => {
        const elements = row.getValue("element") as QuotationElement[];
        const total = getQuotationAmount(elements);
        return <div>{XAF.format(total)}</div>;
      },
    },
    {
      accessorKey: "element",
      header: () => {
        return <span className="tablehead">{"Éléments"}</span>;
      },
      cell: ({ row }) => {
        const value = row.getValue("element") as QuotationElement[];
        return <span>{value.length}</span>;
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => {
        return (
          <span
            className="tablehead"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {"Statut"}
            <ArrowUpDown />
          </span>
        );
      },
      cell: ({ row }) => {
        const value = row.getValue("status") as QuotationStatus;
        const { label, variant } = getStatusLabel(value);
        return <Badge variant={variant}>{label}</Badge>;
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => {
        return (
          <span
            className="tablehead"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {"Date de création"}
            <ArrowUpDown />
          </span>
        );
      },
      cell: ({ row }) => (
        <div>
          {format(new Date(row.getValue("createdAt")), "dd/MM/yyyy HH:mm")}
        </div>
      ),
    },
    {
      id: "actions",
      header: () => <span className="tablehead">{"Actions"}</span>,
      enableHiding: false,
      cell: ({ row }) => {
        const item = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="w-fit">
              <Button variant="ghost" size={"sm"}>
                {"Actions"}
                <ChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{"Actions"}</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedDevis(item);
                  setSelectedQuotation(
                    getQuotationTitle(item.commandRequestId),
                  );
                  setIsDevisModalOpen(true);
                }}
              >
                <Eye />
                {"Voir"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setSelectedDevis(item);
                  setIsUpdateModalOpen(true);
                }}
                disabled={
                  item.status === "APPROVED" || item.status === "REJECTED"
                }
              >
                <LucidePen />
                {"Modifier"}
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={() => {
                  setSelectedDevis(item);
                  setToCancel(true);
                }}
                disabled={
                  item.status === "APPROVED" || item.status === "REJECTED"
                }
              >
                <Trash />
                {"Annuler"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: data.reverse() || [],
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="content">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h3>{`Devis (${data.length})`}</h3>

        {/* Menu des colonnes */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                {"Colonnes"}
                <ChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  let columnName = column.id;
                  if (column.id === "ref") columnName = "Référence";
                  else if (column.id === "commandRequestId")
                    columnName = "Demande de cotation";
                  else if (column.id === "providerId")
                    columnName = "Fournisseur";
                  else if (column.id === "montant") columnName = "Montant";
                  else if (column.id === "status") columnName = "Statut";
                  else if (column.id === "createdAt")
                    columnName = "Date de création";

                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {columnName}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
      </div>
      {/* Table */}
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
                  {"Aucun résultat"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {table.getRowModel().rows?.length > 0 && (
        <div className="mt-4">
          <Pagination table={table} pageSize={15} />
        </div>
      )}

      <DevisModal
        open={isDevisModalOpen}
        onOpenChange={setIsDevisModalOpen}
        data={selectedDevis}
        quotation={selectedQuotation}
      />

      {/* Modal pour la plage de dates personnalisée */}
      {selectedDevis && (
        <EditQuotation
          open={isUpdateModalOpen}
          openChange={setIsUpdateModalOpen}
          quotation={selectedDevis}
        />
      )}
      {selectedDevis && (
        <CancelQuotation
          open={toCancel}
          openChange={setToCancel}
          quotation={selectedDevis}
        />
      )}
    </div>
  );
}
