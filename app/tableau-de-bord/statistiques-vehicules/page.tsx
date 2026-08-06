"use client"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ArrowUpDown, ChevronDown, Eye, Search, Settings2 } from "lucide-react"
import DashboardFilters from "../dashboardFilters"
import { StatisticCard, StatisticProps } from "@/components/base/TitleValueCard"
import { VehicleStatsQ } from "@/queries/stats"
import { useQuery } from "@tanstack/react-query"
import { XAF } from "@/lib/utils"
import LoadingPage from "@/components/loading-page"
import ErrorPage from "@/components/error-page"
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
import { DateFilter, StatsPerVehicle } from "@/types/types"
import { queryKeys } from "@/lib/query-keys"
import { vehicleQ } from "@/queries/vehicule"
import React from "react"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pagination } from "@/components/base/pagination"
import { Label } from "@/components/ui/label"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns";

const Page = () => {

    const [sorting, setSorting] = React.useState<SortingState>([
        { id: "vehicle", desc: true },
    ]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
        [],
    );
    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = React.useState({});
    const [globalFilter, setGlobalFilter] = React.useState("");
    const [isCustomDateModalOpen, setIsCustomDateModalOpen] =
        React.useState(false);
    const [dateFilter, setDateFilter] = React.useState<DateFilter>();
    const [customDateRange, setCustomDateRange] = React.useState<
        { from: Date; to: Date } | undefined
    >();

    const data = useQuery({
        queryKey: queryKeys.vehicleStats(dateFilter, customDateRange?.from, customDateRange?.to),
        queryFn: () => VehicleStatsQ.getAll({
            date: dateFilter || undefined,
            from: customDateRange?.from || undefined,
            to: customDateRange?.to || undefined,
        }).then((res) => res.data),
    });

    const vehicleData = useQuery({
        queryKey: queryKeys.vehicles,
        queryFn: () => vehicleQ.getAll(),
    });

    const columns: ColumnDef<StatsPerVehicle>[] = [

        {
            accessorKey: "vehicle",
            header: ({ column }) => {
                return (
                    <span
                        className="tablehead"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        {"Véhicule"}
                        <ArrowUpDown />
                    </span>
                );
            },
            cell: ({ row }) => {
                const vehicle = vehicleData.data?.data.find((vehicle) => vehicle.id === Number(row.getValue("vehicle")));
                return <span className="uppercase">{vehicle?.mark + " " + vehicle?.label + " - " + vehicle?.matricule}</span>;
            },
        },
        {
            accessorKey: "liters",
            header: ({ column }) => {
                return (
                    <span
                        className="tablehead"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        {"Litres totaux"}
                        <ArrowUpDown />
                    </span>
                );
            },
            cell: ({ row }) => <span>{row.getValue("liters")}</span>,
        },
        {
            accessorKey: "total",
            header: ({ column }) => {
                return (
                    <span
                        className="tablehead"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        {"Montant total"}
                        <ArrowUpDown />
                    </span>
                );
            },
            cell: ({ row }) => <span>{XAF.format(Number(row.getValue("total")))}</span>,
        },
        // {
        //     id: "actions",
        //     header: () => <span className="tablehead">{"Action"}</span>,
        //     enableHiding: false,
        //     cell: ({ row }) => {
        //         const vehicle = row.original;

        //         return (
        //             <Button onClick={() => {
        //                 setSelectedItem(vehicle);
        //                 setIsShowModalOpen(true);
        //             }}>
        //                 <Eye />
        //                 {"Voir"}
        //             </Button>
        //         );
        //     },
        // },
    ];

    // eslint-disable-next-line react-hooks/incompatible-library
    const table = useReactTable({
        data: data.data?.statsPerVehicle ?? [],
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
            const vehicle = vehicleData.data?.data.find((vehicle) => vehicle.id === Number(row.original.vehicle));

            // Recherche dans le nom complet
            const name = vehicle?.label.toLowerCase();

            // Recherche dans les autres champs
            const searchFields = [name, vehicle?.mark.toLowerCase()];

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

    if (data.isLoading) return <LoadingPage />
    if (data.isError) return <ErrorPage title="Erreur" message="Une erreur est survenue lors du chargement des données" />

    const statistics: Array<StatisticProps> = [
        {
            title: "Nombre de litres consommés",
            value: data.data?.globalVehicleStats.liters.toString() ?? "0",
            variant: "default",
            more: {
                title: "Montant total",
                value: XAF.format(Number(data.data?.globalVehicleStats.total)),
            },
        },
    ];

    return (
        <div className="content">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="font-bold">{"Statistiques des véhicules"}</h1>
                    <h4 className="font-extralight tracking-wide">{"Analyse des données des véhicules de l'organisation"}</h4>
                </div>

            </div>

            {/* Cartes de statistiques */}
            <div className="grid-stats-4">
                {statistics
                    .map((item) => (
                        <StatisticCard key={item.title} {...item} />
                    ))}
            </div>

            <div className="flex items-center gap-4">
                <div className="flex flex-row items-center justify-between w-full gap-4">
                    <div className="relative w-full">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Rechercher par nom ou mark"
                            value={globalFilter ?? ""}
                            onChange={(event) => setGlobalFilter(event.target.value)}
                            className="pl-8 w-full md:max-w-sm"
                        />
                    </div>
                    <Sheet>
                        <SheetTrigger asChild className="w-fit">
                            <Button variant={"outline"}>
                                <Settings2 />
                                {"Filtres"}
                            </Button>
                        </SheetTrigger>
                        <SheetContent className="px-3">
                            <SheetHeader>
                                <SheetTitle>{"Filtres"}</SheetTitle>
                                <SheetDescription>
                                    {"Configurer les filtres pour affiner les données"}
                                </SheetDescription>
                            </SheetHeader>
                            <div className="grid gap-1.5">
                                <Label>{"Période"}</Label>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="w-full justify-between"
                                        >
                                            <span className="truncate">
                                                {dateFilter === undefined
                                                    ? "Toutes les périodes"
                                                    : dateFilter === "today"
                                                        ? "Aujourd'hui"
                                                        : dateFilter === "week"
                                                            ? "Cette semaine"
                                                            : dateFilter === "month"
                                                                ? "Ce mois"
                                                                : dateFilter === "year"
                                                                    ? "Cette année"
                                                                    : dateFilter === "custom"
                                                                        ? "Personnalisé"
                                                                        : "Sélectionner"}
                                            </span>
                                            <ChevronDown className="ml-2 h-4 w-4 shrink-0" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width]">
                                        <DropdownMenuItem
                                            onClick={() => {
                                                setDateFilter(undefined);
                                                setCustomDateRange(undefined);
                                                setIsCustomDateModalOpen(false);
                                            }}
                                            className={
                                                dateFilter === undefined ? "bg-accent" : ""
                                            }
                                        >
                                            <span>Toutes les périodes</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => {
                                                setDateFilter("today");
                                                setIsCustomDateModalOpen(false);
                                            }}
                                            className={
                                                dateFilter === "today" ? "bg-accent" : ""
                                            }
                                        >
                                            <span>{"Aujourd'hui"}</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => {
                                                setDateFilter("week");
                                                setIsCustomDateModalOpen(false);
                                            }}
                                            className={dateFilter === "week" ? "bg-accent" : ""}
                                        >
                                            <span>Cette semaine</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => {
                                                setDateFilter("month");
                                                setIsCustomDateModalOpen(false);
                                            }}
                                            className={
                                                dateFilter === "month" ? "bg-accent" : ""
                                            }
                                        >
                                            <span>Ce mois</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => {
                                                setDateFilter("year");
                                                setIsCustomDateModalOpen(false);
                                            }}
                                            className={dateFilter === "year" ? "bg-accent" : ""}
                                        >
                                            <span>Cette année</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => {
                                                setDateFilter("custom");
                                                setIsCustomDateModalOpen(true);
                                            }}
                                            className={
                                                dateFilter === "custom" ? "bg-accent" : ""
                                            }
                                        >
                                            <span>Personnalisé</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>

                                <Collapsible
                                    open={isCustomDateModalOpen}
                                    onOpenChange={setIsCustomDateModalOpen}
                                    disabled={dateFilter !== "custom"}
                                >
                                    <CollapsibleTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="w-full justify-between"
                                        >
                                            {"Plage personnalisée"}
                                            <span className="text-muted-foreground text-xs">
                                                {customDateRange?.from && customDateRange.to
                                                    ? `${format(
                                                        customDateRange.from,
                                                        "dd/MM/yyyy",
                                                    )} → ${format(customDateRange.to, "dd/MM/yyyy")}`
                                                    : "Choisir"}
                                            </span>
                                        </Button>
                                    </CollapsibleTrigger>

                                    <CollapsibleContent className="space-y-4 pt-4">
                                        <Calendar
                                            mode="range"
                                            selected={customDateRange}
                                            onSelect={(range) => {
                                                if (!range?.from || !range?.to) return;
                                                const from = new Date(range.from);
                                                const to = new Date(range.to);
                                                to.setHours(23, 59, 59, 999);
                                                setCustomDateRange({ from, to });
                                            }}
                                            numberOfMonths={1}
                                            className="rounded-md border w-full"
                                        />
                                        <div className="space-y-1">
                                            <Button
                                                className="w-full"
                                                onClick={() => {
                                                    setCustomDateRange(undefined);
                                                    setDateFilter(undefined);
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
                        </SheetContent>
                    </Sheet>
                </div>

                <div className="flex items-center gap-2">

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
            </div>


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
                                        <TableCell key={cell.id}>
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
                                    {"Aucun vehicle trouvé."}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="mt-4">
                <Pagination table={table} />
            </div>
        </div>
    )
}

export default Page