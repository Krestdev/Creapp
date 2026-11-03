"use client";

import {
  type ColumnDef,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronDown, Eye, EllipsisVertical, LucidePen, Trash } from "lucide-react";
import * as React from "react";

import { FilterButton, FilterSearch } from "@/components/ds/filter-bar";
import { UserAvatar } from "@/components/ds/user-avatar";
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
import { queryKeys } from "@/lib/query-keys";
import { cn, getUserName } from "@/lib/utils";
import { userQ } from "@/queries/baseModule";
import { commandRqstQ } from "@/queries/commandRqstModule";
import { quotationQ } from "@/queries/quotation";
import {
  Category,
  CommandRequestT,
  DateFilter,
  RequestModelT,
} from "@/types/types";
import { CollapsibleContent } from "@radix-ui/react-collapsible";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "sonner";
import { Pagination } from "../base/pagination";
import { DownloadButton } from "../bdcommande/TéléchargeButton";
import { UpdateCotationModal } from "../bdcommande/UpdateCotationModal";
import { DetailOrder } from "../modals/detail-order";
import { ModalWarning } from "../modals/modal-warning";
import { Calendar } from "../ui/calendar";
import { Collapsible, CollapsibleTrigger } from "../ui/collapsible";
import { Label } from "../ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";

interface CommandeTableProps {
  data: CommandRequestT[];
  categories: Array<Category>;
  requests: Array<RequestModelT>;
}

const COLUMN_LABELS: Record<string, string> = {
  demande: "Demande",
  userId: "Créée par",
  besoins: "Besoins",
  devis: "Devis reçus",
  dueDate: "Date limite de soumission",
};

const plural = (count: number, one: string, many: string) =>
  `${count} ${count > 1 ? many : one}`;

export function CommandeTable({
  data,
  categories,
  requests,
}: CommandeTableProps) {
  const queryClient = useQueryClient();
  // La date limite n'est pas dans le Figma : disponible via « Colonnes ».
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({ dueDate: false });
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [selectedOrder, setSelectedOrder] =
    React.useState<CommandRequestT | null>(null);
  const [showOrder, setShowOrder] = React.useState(false);
  const [dateFilter, setDateFilter] = React.useState<DateFilter>();
  const [customDateRange, setCustomDateRange] = React.useState<
    { from: Date; to: Date } | undefined
  >();
  const [customOpen, setCustomOpen] = React.useState<boolean>(false); //Custom Period Filter

  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const commandData = useQuery({
    queryKey: queryKeys.quotationRequests,
    queryFn: async () => commandRqstQ.getAll(),
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const { data: devis } = useQuery({
    queryKey: queryKeys.quotations,
    queryFn: quotationQ.getAll,
  });

  const { data: usersData } = useQuery({
    queryKey: queryKeys.users,
    queryFn: () => userQ.getAll(),
  });
  const users = React.useMemo(() => usersData?.data ?? [], [usersData]);

  const cancelDevis = useMutation({
    mutationFn: (id: number) => commandRqstQ.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries();
      toast.success("Demande de cotation annulée avec succès.");
    },
  });

  // modal specific states
  const [isUpdateModalOpen, setIsUpdateModalOpen] = React.useState(false);
  const [selectedCommand, setSelectedCommand] = React.useState<
    CommandRequestT | undefined
  >(undefined);
  const [isDevisModalCancelOpen, setIsDevisModalCancelOpen] =
    React.useState(false);

  const resetAllFilters = () => {
    setGlobalFilter("");
    setDateFilter(undefined);
    setCustomDateRange(undefined);
    setCustomOpen(false);
  };

  // Période choisie, puis plus récentes d'abord.
  const filteredData = React.useMemo(() => {
    return data
      .filter((c) => {
        const now = new Date();
        let startDate = new Date();
        let endDate = now;
        let matchDate = true;
        if (dateFilter) {
          switch (dateFilter) {
            case "today":
              startDate.setHours(0, 0, 0, 0);
              break;
            case "week":
              startDate.setDate(
                now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1),
              );
              startDate.setHours(0, 0, 0, 0);
              break;
            case "month":
              startDate = new Date(now.getFullYear(), now.getMonth(), 1);
              break;
            case "year":
              startDate = new Date(now.getFullYear(), 0, 1);
              break;
            case "custom":
              if (customDateRange?.from && customDateRange?.to) {
                startDate = customDateRange.from;
                endDate = customDateRange.to;
              }
              break;
          }

          if (
            dateFilter !== "custom" ||
            (customDateRange?.from && customDateRange?.to)
          ) {
            matchDate =
              new Date(c.createdAt) >= startDate &&
              new Date(c.createdAt) <= endDate;
          }
        }
        return matchDate;
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }, [data, dateFilter, customDateRange]);

  const advancedCount = dateFilter ? 1 : 0;

  const columns: ColumnDef<CommandRequestT>[] = [
    {
      id: "demande",
      header: () => "Demande",
      enableHiding: false,
      cell: ({ row }) => {
        const { reference, title, createdAt, id } = row.original;
        const providers = new Set(
          (devis?.data ?? [])
            .filter((x) => x.commandRequestId === id)
            .map((x) => x.providerId),
        ).size;
        return (
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="text-caption text-brand">{reference}</span>
            <span className="truncate text-body-medium text-text-primary">
              {title}
            </span>
            <span className="text-caption text-text-tertiary">
              {`Créée le ${format(new Date(createdAt), "dd/MM")}${
                providers > 0
                  ? ` · ${plural(providers, "fournisseur", "fournisseurs")}`
                  : ""
              }`}
            </span>
          </div>
        );
      },
    },
    {
      id: "userId",
      header: () => "Créée par",
      cell: ({ row }) => {
        const name = getUserName(users, row.original.userId) ?? "N/A";
        return (
          <div className="flex items-center gap-2">
            <UserAvatar name={name} size="sm" />
            <span className="text-body text-text-primary">{name}</span>
          </div>
        );
      },
    },
    {
      id: "besoins",
      header: () => "Besoins",
      cell: ({ row }) => (
        <span className="text-body text-text-secondary">
          {row.original.besoins?.map((b) => b.ref).join(", ") || "—"}
        </span>
      ),
    },
    {
      id: "devis",
      header: () => "Devis reçus",
      cell: ({ row }) => {
        const count =
          devis?.data.filter((x) => x.commandRequestId === row.original.id)
            .length ?? 0;
        return (
          <span className="text-body text-text-secondary">
            {count === 0 ? "Aucun" : plural(count, "Devis", "Devis")}
          </span>
        );
      },
    },
    {
      accessorKey: "dueDate",
      header: () => "Date limite",
      cell: ({ row }) => (
        <span className="text-body whitespace-nowrap text-text-secondary">
          {format(new Date(row.original.dueDate), "dd/MM/yyyy")}
        </span>
      ),
    },
    {
      id: "actions",
      header: () => <span className="block text-right">{"Actions"}</span>,
      enableHiding: false,
      cell: ({ row }) => {
        const item = row.original;
        const hasDevis =
          (devis?.data.filter((x) => x.commandRequestId === item.id).length ??
            0) > 0;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label={`Actions pour ${item.reference}`}
              className="size-8 h-8 w-8 cursor-pointer justify-center gap-0 border-0 bg-transparent p-0 text-text-secondary hover:bg-hover hover:text-text-primary data-[state=open]:bg-hover [&_svg]:size-[18px] [&_svg]:text-current"
            >
              <EllipsisVertical />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{"Actions"}</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedOrder(item);
                  setShowOrder(true);
                }}
              >
                <Eye className="mr-2 h-4 w-4" />
                {"Voir"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <DownloadButton
                  data={item}
                  className="bg-transparent text-black hover:bg-transparent hover:text-black h-8 py-0 px-0 font-normal!"
                />
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedCommand(item);
                  setIsUpdateModalOpen(true);
                }}
                disabled={hasDevis}
              >
                <LucidePen className="mr-2 h-4 w-4" />
                {"Modifier"}
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={hasDevis}
                onClick={() => {
                  setSelectedCommand(item);
                  setIsDevisModalCancelOpen(true);
                }}
              >
                <Trash color="red" className="mr-2 h-4 w-4" />
                {"Annuler"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, _columnId, filterValue) => {
      const search = String(filterValue).toLowerCase();
      const { reference, title, besoins, userId } = row.original;
      return [
        reference,
        title,
        getUserName(users, userId),
        ...(besoins ?? []).flatMap((b) => [b.ref, b.label]),
      ].some((value) => value?.toLowerCase().includes(search));
    },
    onPaginationChange: setPagination,
    state: {
      columnVisibility,
      globalFilter,
      pagination,
    },
  });

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <FilterSearch
            value={globalFilter}
            onChange={setGlobalFilter}
            placeholder="Rechercher une demande, un besoin, un fournisseur…"
          />
          <Sheet>
            <SheetTrigger asChild>
              <FilterButton count={advancedCount} />
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>{"Filtres"}</SheetTitle>
                <SheetDescription>
                  {"Configurer les filtres pour affiner les données"}
                </SheetDescription>
              </SheetHeader>
              <div className="px-5 grid gap-5">
                <div className="grid gap-1.5">
                  <Label htmlFor="searchCommand">{"Recherche globale"}</Label>
                  <Input
                    name="search"
                    type="search"
                    id="searchCommand"
                    placeholder="Référence, libellé"
                    value={globalFilter ?? ""}
                    onChange={(event) => setGlobalFilter(event.target.value)}
                    className="w-full"
                  />
                </div>

                {/* Filtre par période */}
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
                                      : "Sélectionner une période"}
                        </span>
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width]">
                      <DropdownMenuItem
                        onClick={() => {
                          setDateFilter(undefined);
                          setCustomDateRange(undefined);
                          setCustomOpen(false);
                        }}
                        className={dateFilter === undefined ? "bg-accent" : ""}
                      >
                        <span>Toutes les périodes</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setDateFilter("today");
                          setCustomOpen(false);
                        }}
                        className={dateFilter === "today" ? "bg-accent" : ""}
                      >
                        <span>{"Aujourd'hui"}</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setDateFilter("week");
                          setCustomOpen(false);
                        }}
                        className={dateFilter === "week" ? "bg-accent" : ""}
                      >
                        <span>Cette semaine</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setDateFilter("month");
                          setCustomOpen(false);
                        }}
                        className={dateFilter === "month" ? "bg-accent" : ""}
                      >
                        <span>Ce mois</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setDateFilter("year");
                          setCustomOpen(false);
                        }}
                        className={dateFilter === "year" ? "bg-accent" : ""}
                      >
                        <span>Cette année</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setDateFilter("custom");
                          setCustomOpen(true);
                        }}
                        className={dateFilter === "custom" ? "bg-accent" : ""}
                      >
                        <span>Personnalisé</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Collapsible
                    open={customOpen}
                    onOpenChange={setCustomOpen}
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
                            setCustomOpen(false);
                          }}
                        >
                          {"Annuler"}
                        </Button>
                        <Button
                          className="w-full"
                          variant={"outline"}
                          onClick={() => {
                            setCustomOpen(false);
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
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">{"Colonnes"}</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {COLUMN_LABELS[column.id] ?? column.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border-default bg-surface">
        <Table className="min-w-[760px]">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={cn(
                      header.column.id === "demande" && "pl-5",
                      header.column.id === "actions" && "pr-5",
                    )}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
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
                      className={cn(
                        "py-3 whitespace-normal normal-case",
                        cell.column.id === "demande" && "pl-5",
                        cell.column.id === "actions" && "pr-5 text-right",
                      )}
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
        <Pagination
          table={table}
          noun="demandes"
          className="border-t border-border-default"
        />
      </div>

      {/* Modale pour modifier la demande */}
      {selectedCommand && (
        <UpdateCotationModal
          open={isUpdateModalOpen}
          onOpenChange={setIsUpdateModalOpen}
          quotationRequest={selectedCommand}
          quotationRequests={data}
          onSuccess={() => {
            commandData.refetch();
          }}
          requests={requests}
          categories={categories}
        />
      )}

      <DetailOrder
        open={showOrder}
        onOpenChange={setShowOrder}
        data={selectedOrder}
      />
      <ModalWarning
        open={isDevisModalCancelOpen}
        onOpenChange={setIsDevisModalCancelOpen}
        actionText="Annuler"
        description="Vous êtes sur le point de supprimer la demande de cotation"
        title={selectedCommand?.title || ""}
        onAction={() => cancelDevis.mutate(selectedCommand?.id || 0)}
        variant="error"
      />
    </div>
  );
}
