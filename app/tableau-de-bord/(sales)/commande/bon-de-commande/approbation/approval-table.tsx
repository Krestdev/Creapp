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
import { VariantProps } from "class-variance-authority";
import {
  ArrowUpDown,
  CheckCircle2,
  ChevronDown,
  Eye,
  Settings2,
  XCircle,
} from "lucide-react";
import * as React from "react";

import { Pagination } from "@/components/base/pagination";
import { Badge, badgeVariants } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { TabBar } from "@/components/base/TabBar";
import { Textarea } from "@/components/ui/textarea";
import { formatToShortName, XAF } from "@/lib/utils";
import { purchaseQ } from "@/queries/purchase-order";
import { BonsCommande, PRIORITIES, PURCHASE_ORDER_STATUS } from "@/types/types";
import { useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "sonner";
import ViewPurchase from "../viewPurchase";

interface Props {
  data: Array<BonsCommande>;
}

type Status = (typeof PURCHASE_ORDER_STATUS)[number]["value"];
type Priority = (typeof PRIORITIES)[number]["value"];

const getStatusLabel = (
  status: Status,
): {
  label: string;
  variant: VariantProps<typeof badgeVariants>["variant"];
} => {
  switch (status) {
    case "PENDING":
      return { label: "En attente", variant: "amber" };
    case "IN-REVIEW":
      return { label: "En révision", variant: "primary" };
    case "APPROVED":
      return { label: "Approuvé", variant: "success" };
    case "REJECTED":
      return { label: "Rejeté", variant: "destructive" };
    default:
      return { label: "Inconnu", variant: "outline" };
  }
};

const getPriorityLabel = (
  priority: Priority,
): {
  label: string;
  variant: VariantProps<typeof badgeVariants>["variant"];
} => {
  switch (priority) {
    case "low":
      return { label: "Basse", variant: "outline" };
    case "medium":
      return { label: "Normal", variant: "default" };
    case "high":
      return { label: "Élevée", variant: "primary" };
    case "urgent":
      return { label: "Urgent", variant: "destructive" };
    default:
      return { label: "Inconnu", variant: "dark" };
  }
};

const canDecide = (status: Status) =>
  status === "PENDING" || status === "IN-REVIEW";

export function PurchaseApprovalTable({ data }: Props) {
  const purchaseOrderQuery = React.useMemo(() => purchaseQ, []);

  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [globalFilter, setGlobalFilter] = React.useState("");

  // filtres
  const [priorityFilter, setPriorityFilter] = React.useState<"all" | Priority>(
    "all",
  );
  const [penaltyFilter, setPenaltyFilter] = React.useState<
    "all" | "true" | "false"
  >("all");

  // modals
  const [view, setView] = React.useState(false);
  const [selectedValue, setSelectedValue] = React.useState<BonsCommande>();

  const [decisionOpen, setDecisionOpen] = React.useState(false);
  const [decisionType, setDecisionType] = React.useState<"approve" | "reject">(
    "approve",
  );

  // optionnel : reason pour rejet
  const [rejectReason, setRejectReason] = React.useState<string>("");
  const [selectedTab, setSelectedTab] = React.useState<number>(0);
  const tabs = [
    {
      id: 0,
      title: "Bons de commandes en attente",
    },
    {
      id: 1,
      title: "Bons de commandes traités",
    },
  ];

  const filteredData = React.useMemo(() => {
    return data.filter((po) => {
      //Filter Priority
      const matchPriority =
        priorityFilter === "all" ? true : po.priority === priorityFilter;
      //Filter penalty
      const matchPenalty =
        penaltyFilter === "all"
          ? true
          : Boolean(penaltyFilter) === po.hasPenalties;
      //Filter Tab
      const matchTab =
        selectedTab === 0
          ? po.status === "IN-REVIEW" || po.status === "PENDING"
          : po.status === "REJECTED" || po.status === "APPROVED";
      return matchPenalty && matchPriority && matchTab;
    });
  }, [data, priorityFilter, penaltyFilter, selectedTab]);

  const approveMutation = useMutation({
    mutationFn: async (id: number) => {
      // ✅ adapte selon ton query class
      // ex: return purchaseOrderQuery.approve(id);
      return purchaseOrderQuery.approve(id);
    },
    onSuccess: () => {
      toast.success("Bon de commande approuvé ✅");
      setDecisionOpen(false);
    },
    onError: (e: any) => toast.error(e?.message ?? "Impossible d'approuver"),
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: number; reason: string }) => {
      // ✅ adapte selon ton query class
      // ex: return purchaseOrderQuery.reject(id, reason);
      return purchaseOrderQuery.reject(id, reason);
    },
    onSuccess: () => {
      toast.success("Bon de commande rejeté ❌");
      setDecisionOpen(false);
      setRejectReason("");
    },
    onError: (e: any) => toast.error(e?.message ?? "Impossible de rejeter"),
  });

  const openDecision = (po: BonsCommande, type: "approve" | "reject") => {
    setSelectedValue(po);
    setDecisionType(type);
    setDecisionOpen(true);
  };

  const confirmDecision = () => {
    if (!selectedValue) return;
    if (!canDecide(selectedValue.status as Status)) return;

    if (decisionType !== "approve" && !rejectReason) {
      toast.error("Veuillez entrer une raison de rejet");
      return;
    }

    if (decisionType === "approve") {
      approveMutation.mutate(selectedValue.id);
      return;
    }

    rejectMutation.mutate({ id: selectedValue.id, reason: rejectReason });
  };

  const columns: ColumnDef<BonsCommande>[] = [
    {
      accessorKey: "reference",
      header: ({ column }) => (
        <span
          className="tablehead"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {"Référence"}
          <ArrowUpDown />
        </span>
      ),
      cell: ({ row }) => (
        <div className="font-medium uppercase">{row.getValue("reference")}</div>
      ),
    },

    {
      accessorKey: "devi",
      header: ({ column }) => (
        <span
          className="tablehead"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {"Titre"}
          <ArrowUpDown />
        </span>
      ),
      cell: ({ row }) => {
        const devi: BonsCommande["devi"] = row.getValue("devi");
        return <div className="font-medium">{devi.commandRequest.title}</div>;
      },
    },

    {
      accessorKey: "provider",
      header: ({ column }) => (
        <span
          className="tablehead"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {"Fournisseur"}
          <ArrowUpDown />
        </span>
      ),
      cell: ({ row }) => {
        const provider: BonsCommande["provider"] = row.getValue("provider");
        return (
          <div className="font-medium">{formatToShortName(provider.name)}</div>
        );
      },
    },

    {
      accessorKey: "amountBase",
      header: ({ column }) => (
        <span
          className="tablehead"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {"Montant"}
          <ArrowUpDown />
        </span>
      ),
      cell: ({ row }) => {
        const po = row.original;
        const total = po.devi.element.reduce(
          (t, el) => t + el.priceProposed * el.quantity,
          0,
        );
        return <div className="font-medium">{XAF.format(total)}</div>;
      },
    },

    {
      accessorKey: "priority",
      header: () => <span className="tablehead">{"Priorité"}</span>,
      cell: ({ row }) => {
        const value = row.getValue("priority") as Priority;
        const { label, variant } = getPriorityLabel(value);
        return <Badge variant={variant}>{label}</Badge>;
      },
    },

    {
      accessorKey: "status",
      header: () => <span className="tablehead">{"Statut"}</span>,
      cell: ({ row }) => {
        const value = row.getValue("status") as Status;
        const { label, variant } = getStatusLabel(value);
        return <Badge variant={variant}>{label}</Badge>;
      },
    },

    {
      id: "penalties",
      accessorFn: (row) => (row.hasPenalties ? "yes" : "no"),
      header: () => <span className="tablehead">{"Pénalités"}</span>,
      cell: ({ row }) => {
        const has = !!row.original.hasPenalties;
        return (
          <Badge variant={has ? "amber" : "outline"}>
            {has ? "Oui" : "Non"}
          </Badge>
        );
      },
    },

    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <span
          className="tablehead"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {"Créé le"}
          <ArrowUpDown />
        </span>
      ),
      cell: ({ row }) => {
        const raw = row.getValue("createdAt") as any;
        const d = new Date(raw);
        return (
          <div>{isNaN(d.getTime()) ? "-" : format(d, "dd/MM/yyyy HH:mm")}</div>
        );
      },
    },

    {
      id: "actions",
      header: () => <span className="tablehead">{"Actions"}</span>,
      enableHiding: false,
      cell: ({ row }) => {
        const item = row.original;
        const decidable = canDecide(item.status as Status);

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                {"Actions"}
                <ChevronDown />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{"Actions"}</DropdownMenuLabel>

              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => {
                  setSelectedValue(item);
                  setView(true);
                }}
              >
                <Eye />
                {"Voir"}
              </DropdownMenuItem>

              <DropdownMenuItem
                disabled={!decidable}
                className="cursor-pointer"
                onClick={() => openDecision(item, "approve")}
              >
                <CheckCircle2 className="text-green-600" />
                {"Approuver"}
              </DropdownMenuItem>

              <DropdownMenuItem
                disabled={!decidable}
                className="cursor-pointer text-destructive focus:text-destructive"
                onClick={() => openDecision(item, "reject")}
              >
                <XCircle className="text-destructive" />
                {"Rejeter"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

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
    globalFilterFn: (row, _columnId, filterValue) => {
      const s = String(filterValue).toLowerCase();
      const po = row.original;

      const created = new Date(po.createdAt as any);
      const createdText = isNaN(created.getTime())
        ? ""
        : format(created, "dd/MM/yyyy HH:mm").toLowerCase();

      const statusText = (po.status ?? "").toLowerCase();
      const priorityText = (po.priority ?? "").toLowerCase();
      const paymentMethodText = (po.paymentMethod ?? "").toLowerCase();
      const paymentTermsText = (po.paymentTerms ?? "").toLowerCase();
      const locationText = (po.deliveryLocation ?? "").toLowerCase();

      const providerName = (po.provider?.name ?? "").toLowerCase();
      const title = (po.devi?.commandRequest?.title ?? "").toLowerCase();
      const ref = (po.reference ?? "").toLowerCase();

      return (
        ref.includes(s) ||
        providerName.includes(s) ||
        title.includes(s) ||
        statusText.includes(s) ||
        priorityText.includes(s) ||
        paymentMethodText.includes(s) ||
        paymentTermsText.includes(s) ||
        locationText.includes(s) ||
        createdText.includes(s)
      );
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
  });

  const resetAllFilters = () => {
    setPriorityFilter("all");
    setPenaltyFilter("all");
    setGlobalFilter("");
    table.resetColumnFilters();
  };

  const isDeciding = approveMutation.isPending || rejectMutation.isPending;

  return (
    <div className="w-full space-y-4">
      {/* BARRE DE FILTRES */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <TabBar
          tabs={tabs}
          setSelectedTab={setSelectedTab}
          selectedTab={selectedTab}
        />
        <div className="flex flex-wrap items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline">
                <Settings2 className="mr-2 h-4 w-4" />
                {"Filtres"}
              </Button>
            </SheetTrigger>

            <SheetContent className="overflow-y-auto">
              <SheetHeader>
                <SheetTitle>{"Filtres"}</SheetTitle>
                <SheetDescription>
                  {"Configurer les filtres pour affiner vos données"}
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-5 px-5">
                <div className="space-y-3">
                  <Label htmlFor="searchPO">{"Recherche globale"}</Label>
                  <Input
                    id="searchPO"
                    type="search"
                    placeholder="Référence, titre, fournisseur, statut..."
                    value={globalFilter ?? ""}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                  />
                </div>
                <div className="space-y-3">
                  <Label>{"Priorité"}</Label>
                  <Select
                    value={priorityFilter}
                    onValueChange={(v: "all" | Priority) =>
                      setPriorityFilter(v)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Toutes les priorités" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{"Tous"}</SelectItem>
                      {PRIORITIES.map((p) => (
                        <SelectItem key={p.value} value={p.value}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* <div className="space-y-3">
                  <Label>{"Pénalités"}</Label>
                  <Select
                    value={penaltyFilter}
                    onValueChange={(v: "all" | "true" | "false") =>
                      setPenaltyFilter(v)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Tous" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{"Toutes"}</SelectItem>
                      <SelectItem value="true">{"Oui"}</SelectItem>
                      <SelectItem value="false">{"Non"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div> */}

                <Button
                  variant="outline"
                  onClick={resetAllFilters}
                  className="w-full"
                >
                  {"Réinitialiser les filtres"}
                </Button>
              </div>
            </SheetContent>
          </Sheet>
          {/* Menu colonnes */}
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
                  let columnName = column.id;
                  if (column.id === "reference") columnName = "Référence";
                  else if (column.id === "devi") columnName = "Titre";
                  else if (column.id === "provider") columnName = "Fournisseur";
                  else if (column.id === "amountBase") columnName = "Montant";
                  else if (column.id === "priority") columnName = "Priorité";
                  else if (column.id === "status") columnName = "Statut";
                  else if (column.id === "createdAt") columnName = "Créé le";
                  else if (column.id === "penalties") columnName = "Pénalités";

                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
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
      </div>

      {/* TABLEAU */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
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
                  className="hover:bg-muted/50"
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
                  <div className="flex flex-col items-center justify-center gap-2">
                    <span className="text-muted-foreground">
                      {"Aucun résultat trouvé"}
                    </span>
                    {(priorityFilter !== "all" ||
                      penaltyFilter !== "all" ||
                      globalFilter) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={resetAllFilters}
                        >
                          {"Réinitialiser les filtres"}
                        </Button>
                      )}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* PAGINATION */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* <div className="text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} sur{" "}
          {table.getFilteredRowModel().rows.length} ligne(s) sélectionnée(s)
        </div> */}
        {table.getPageCount() > 1 && <Pagination table={table} pageSize={15} />}
      </div>

      {/* VIEW */}
      {selectedValue && (
        <ViewPurchase
          open={view}
          openChange={setView}
          purchaseOrder={selectedValue}
          users={[]}
        />
      )}

      {/* CONFIRM DECISION */}
      <Dialog open={decisionOpen} onOpenChange={setDecisionOpen}>
        <DialogContent>
          <DialogHeader
            variant={decisionType === "approve" ? "success" : "error"}
          >
            <DialogTitle>
              {decisionType === "approve"
                ? "Approuver le bon de commande ?"
                : "Rejeter le bon de commande ?"}
            </DialogTitle>
            <DialogDescription>
              {selectedValue ? (
                <>
                  {`Référence: ${selectedValue.reference} — `}
                  <span className="font-medium">
                    {selectedValue.devi?.commandRequest?.title ?? "-"}
                  </span>
                </>
              ) : null}
            </DialogDescription>
          </DialogHeader>
          {decisionType === "approve" && (
            <p className="mb-2">
              {"Êtes-vous sûr de vouloir valider ce bon de commande ?"}
              <br />
              <span className="text-sm italic">
                <u>{"NB:"}</u>
                {" Cette action est irréversible"}
              </span>
            </p>
          )}
          {decisionType === "reject" && (
            <div className="grid gap-2">
              <Label>{"Motif (optionnel)"}</Label>
              <Textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Ex: montant incorrect, pièce manquante..."
              />
            </div>
          )}

          <DialogFooter>
            <Button
              variant={decisionType === "approve" ? "accent" : "destructive"}
              onClick={confirmDecision}
              isLoading={isDeciding}
              disabled={
                !selectedValue ||
                !canDecide(selectedValue.status as Status) ||
                isDeciding
              }
            >
              {decisionType === "approve" ? "Approuver" : "Rejeter"}
            </Button>
            <Button
              variant="outline"
              onClick={() => setDecisionOpen(false)}
              disabled={isDeciding}
            >
              {"Annuler"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
