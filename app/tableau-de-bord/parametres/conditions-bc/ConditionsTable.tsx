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
    AsteriskIcon,
    ChevronDown,
    LucideEye,
    LucidePen,
    LucideTrash2
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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { CommandCondition } from "@/types/types";
import { useMutation } from "@tanstack/react-query";
import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
} from "lucide-react";
import { toast } from "sonner";
import { ModalWarning } from "@/components/modals/modal-warning";
import { CommandConditionQ } from "@/queries/commandsConditions";
import CreateCondition from "./CreateCondition";
import ConditionForm from "./CreateCondition";

interface ConditionsTableProps {
    data: CommandCondition[];
}

export function ConditionsTable({ data }: ConditionsTableProps) {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
        [],
    );
    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = React.useState({});
    const [globalFilter, setGlobalFilter] = React.useState("");

    const [selectedItem, setSelectedItem] = React.useState<CommandCondition | null>(null);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = React.useState(false);
    const [showDetail, setShowDetail] = React.useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);

    const conditionData = useMutation({
        mutationFn: (id: number) => CommandConditionQ.delete(id),
        onError: (error) => {
            toast.error(
                "Une erreur est survenue lors de la suppression de la condition.",
            );
            console.error(error);
        },
    });

    const columns = React.useMemo<ColumnDef<CommandCondition>[]>(
        () => [
            {
                accessorKey: "title",
                header: ({ column }) => {
                    return (
                        <span
                            className="tablehead"
                            onClick={() =>
                                column.toggleSorting(column.getIsSorted() === "asc")
                            }
                        >
                            {"Nom de la condition"}
                            <ArrowUpDown />
                        </span>
                    );
                },
                cell: ({ row }) => {
                    return (
                        <div className="font-medium uppercase flex items-center gap-1.5">{row.getValue("title")}</div>
                    )
                },
            },
            {
                id: "actions",
                header: "Actions",
                enableHiding: false,
                size: 50,
                cell: ({ row }) => {
                    const conditions = row.original;

                    return (
                        <div className="flex flex-row items-center gap-2 w-fit">
                            <Button variant={"outline"} size={"icon"} onClick={() => {
                                setSelectedItem(conditions);
                                setShowDetail(true);
                            }}>
                                <LucideEye className="h-4 w-4" />
                            </Button>
                            <Button variant={"outline"} size={"icon"} onClick={() => {
                                setSelectedItem(conditions);
                                setIsUpdateModalOpen(true);
                            }}>
                                <LucidePen className="h-4 w-4" />
                            </Button>
                            <Button variant={"outline"} size={"icon"} onClick={() => {
                                setSelectedItem(conditions);
                                setIsDeleteModalOpen(true);
                            }}>
                                <LucideTrash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    );
                },
            },
        ],
        [],
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
        globalFilterFn: (row, columnId, filterValue) => {
            const search = filterValue.toLowerCase();
            const name = row.getValue("label") as string;

            return name.toLowerCase().includes(search);
        },
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
            globalFilter,
        },
    });

    return (
        <div className="w-full">
            <div className="flex items-center gap-4 py-4">
                <Input
                    placeholder="Rechercher par nom de la condition..."
                    value={globalFilter ?? ""}
                    onChange={(event) => setGlobalFilter(event.target.value)}
                    className="max-w-sm"
                />
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
                                const text =
                                    column.id == "label"
                                        ? "Nom de la condition"
                                        : column.id == "description"
                                            ? "Description"
                                            : "";
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
                                // className={getRowClassName(row.original.status)}
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
                                    {"Aucun résultat."}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-between space-x-2 py-4">
                <div>.</div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.setPageIndex(0)}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                        disabled={!table.getCanNextPage()}
                    >
                        <ChevronsRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <ModalWarning
                open={isDeleteModalOpen}
                onOpenChange={setIsDeleteModalOpen}
                title="Supprimer la condition"
                description="Êtes-vous sûr de vouloir supprimer cette condition ?"
                message="Suprimer cette condition suprimera tous les besoins associés. Cette action est irreversible"
                onAction={() => conditionData.mutate(selectedItem?.id || 0)}
                actionText="Supprimer"
                variant="error"
            />

            <ConditionForm
                open={isUpdateModalOpen}
                openChange={setIsUpdateModalOpen}
                isEditing={true}
                condition={selectedItem}
            />
        </div>
    );
}
