"use client";

import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Badge, badgeVariants } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { MoreHorizontal } from "lucide-react";
import { format } from "date-fns";
import { XAF, cn } from "@/lib/utils";
import { Bank, BANK_TYPES } from "@/types/types";
import { VariantProps } from "class-variance-authority";

interface Props {
  data: Bank[];
}

export function BankTable({ data }: Props) {
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState<string>("ALL");

  function getTypeBadge(type: Bank["type"]):{label: string; variant: VariantProps<typeof badgeVariants>["variant"]}{
    const typeData = BANK_TYPES.find(s=>s.value === type);
      const label = typeData?.name ?? "Inconnu"
      switch(type){
        case "BANK":
            return {label, variant: "blue"};
        case "CASH":
            return {label, variant: "lime"};
        case "MOBILE_WALLET":
            return {label, variant: "teal"};
        default:
            return {label, variant: "outline"};
      }
  }

  const columns = React.useMemo<ColumnDef<Bank>[]>(
    () => [
      {
        accessorKey: "id",
        header: ()=><span className="tablehead">{"Référence"}</span> ,
        cell: ({ row }) => `BA-${row.original.id.toString().padStart(2, "0")}`,
      },
      {
        accessorKey: "label",
        header: ()=><span className="tablehead">{"Intitulé du compte"}</span>,
      },
      {
        accessorKey: "balance",
        header: ()=><span className="tablehead">{"Solde"}</span>,
        cell: ({ row }) => {
          const value = row.original.balance;
          return (
            <span
              className={cn(
                "font-medium",
                value < 0 ? "text-destructive" : "text-foreground"
              )}
            >
              {XAF.format(value)}
            </span>
          );
        },
      },
      {
        accessorKey: "type",
        header: ()=><span className="tablehead">{"Type"}</span>,
        cell: ({ row }) => {
          const value = getTypeBadge(row.original.type)
          return (
            <Badge variant={value.variant}>
              {value.label}
            </Badge>
          );
        },
      },
      {
        id: "identifier",
        header: ()=><span className="tablehead">{"Identifiant"}</span>,
        cell: ({ row }) =>
          row.original.accountNumber ??
          row.original.phoneNum ??
          "-",
      },
      {
        accessorKey: "updatedAt",
        header: ()=><span className="tablehead">{"Dernière mise à jour"}</span>,
        cell: ({ row }) =>{
            const value = row.original.updatedAt
            return !!value ? format(new Date(value), "dd/MM/yyyy HH:mm") : "-";
        },
      },
      {
        id: "actions",
        header: "",
        cell: () => (
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      globalFilter,
    },
    globalFilterFn: (row, _, value) => {
  const search = value.toLowerCase();

  const labelMatch = row.original.label
    .toLowerCase()
    .includes(search);

  const accountMatch = row.original.accountNumber
    ? row.original.accountNumber.toLowerCase().includes(search)
    : false;

  const phoneMatch = row.original.phoneNum
    ? row.original.phoneNum.toLowerCase().includes(search)
    : false;

  return labelMatch || accountMatch || phoneMatch;
},
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  // Filtre Type (manuel)
  const filteredRows = table
    .getRowModel()
    .rows.filter((row) =>
      typeFilter === "ALL" ? true : row.original.type === typeFilter
    );

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Rechercher (nom, compte, téléphone)"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="max-w-xs"
        />

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-56">
            <SelectValue placeholder="Type de compte" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{"Tous"}</SelectItem>
            {BANK_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {filteredRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center">
                  {"Aucun compte trouvé"}
                </TableCell>
              </TableRow>
            ) : (
              filteredRows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
