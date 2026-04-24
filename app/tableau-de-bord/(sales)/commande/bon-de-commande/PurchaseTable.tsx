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
  ChevronDown,
  Eye,
  FileSpreadsheetIcon,
  FileTextIcon,
  Pencil,
  Settings2,
} from "lucide-react";
import * as React from "react";

import { Pagination } from "@/components/base/pagination";
import { Badge, badgeVariants } from "@/components/ui/badge";
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
import { Label } from "@/components/ui/label";
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

import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from "@/components/ui/progress";
import { subText, totalAmountPurchase, XAF } from "@/lib/utils";
import {
  BonsCommande,
  CommandCondition,
  Invoice,
  PaymentRequest,
  PRIORITIES,
  PURCHASE_ORDER_STATUS,
  User,
} from "@/types/types";
import { format } from "date-fns";
import Link from "next/link";
import AddSignedFile from "./add-signed-file";
import EditPurchase from "./editPurchase";
import ViewPurchase from "./viewPurchase";
import ViewSignedPurchase from "./viewSignedPurchase";

interface BonsCommandeTableProps {
  data: Array<BonsCommande>;
  payments: Array<PaymentRequest>;
  conditions: Array<CommandCondition>;
  invoices: Array<Invoice>;
  users: Array<User>;
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

export function PurchaseTable({
  data,
  payments,
  conditions,
  invoices,
  users,
}: BonsCommandeTableProps) {
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

  // filtres spécifiques
  const [statusFilter, setStatusFilter] = React.useState<"all" | Status>("all");
  const [priorityFilter, setPriorityFilter] = React.useState<"all" | Priority>(
    "all",
  );
  const [statusSearch, setStatusSearch] = React.useState("");
  const [prioritySearch, setPrioritySearch] = React.useState("");
  const [penaltyFilter, setPenaltyFilter] = React.useState<
    "all" | "yes" | "no"
  >("all");

  // Nouveaux filtres pour fournisseur et cotation
  const [providerFilter, setProviderFilter] = React.useState<string>("all");
  const [providerSearch, setProviderSearch] = React.useState("");
  const [cotationFilter, setCotationFilter] = React.useState<string>("all");
  const [cotationSearch, setCotationSearch] = React.useState("");

  // Extraire la liste unique des fournisseurs
  const uniqueProviders = React.useMemo(() => {
    const providers = new Map();
    data?.forEach((po) => {
      if (po.provider && po.provider.id) {
        providers.set(po.provider.id, po.provider);
      }
    });
    return Array.from(providers.values());
  }, [data]);

  // Extraire la liste unique des cotations (devis)
  const uniqueCotations = React.useMemo(() => {
    const cotations = new Map();
    data?.forEach((po) => {
      if (po.devi && po.devi.id) {
        cotations.set(po.devi.id, {
          id: po.devi.id,
          label: `${po.devi.commandRequest.title} - ${po.devi.commandRequest.reference}`,
          reference: po.devi.commandRequest.reference,
          title: po.devi.commandRequest.title,
        });
      }
    });
    return Array.from(cotations.values());
  }, [data]);

  //ViewModal
  const [view, setView] = React.useState<boolean>(false);
  //EditModal
  const [edit, setEdit] = React.useState<boolean>(false);
  //Complete Modal
  const [complete, setComplete] = React.useState<boolean>(false);
  //ViewSignedModal
  const [viewSigned, setViewSigned] = React.useState<boolean>(false);
  //Selected
  const [selectedValue, setSelectedValue] = React.useState<BonsCommande>();

  const filteredData = React.useMemo(() => {
    let filtered = [...(data ?? [])];

    if (statusFilter !== "all") {
      filtered = filtered.filter((po) => po.status === statusFilter);
    }

    if (priorityFilter !== "all") {
      filtered = filtered.filter((po) => po.priority === priorityFilter);
    }

    if (penaltyFilter !== "all") {
      filtered = filtered.filter((po) => {
        const has = !!po.hasPenalties;
        return penaltyFilter === "yes" ? has : !has;
      });
    }

    // Filtre par fournisseur
    if (providerFilter !== "all") {
      filtered = filtered.filter(
        (po) => po.provider?.id === parseInt(providerFilter),
      );
    }

    // Filtre par cotation
    if (cotationFilter !== "all") {
      filtered = filtered.filter(
        (po) => po.devi?.id === parseInt(cotationFilter),
      );
    }

    return filtered;
  }, [
    data,
    statusFilter,
    priorityFilter,
    penaltyFilter,
    providerFilter,
    cotationFilter,
  ]);

  const getProgress = (
    purchaseOrder: BonsCommande,
  ): { progress: number; value: number } => {
    //To-Do complete this code
    const data = invoices.filter((i) => i.commandId === purchaseOrder.id);
    //console.log(data);

    const values = data.flatMap((i) =>
      i.payment.map((p) => {
        if (p.status !== "paid") return 0;
        return p.price;
      }),
    );
    return {
      progress:
        (values.reduce((acc, i) => acc + i, 0) * 100) / purchaseOrder.netToPay,
      value: values.reduce((acc, i) => acc + i, 0),
    };
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
          {"Cotation"}
          <ArrowUpDown />
        </span>
      ),
      cell: ({ row }) => {
        const name: BonsCommande["devi"] = row.getValue("devi");
        return (
          <div className="font-medium">
            {subText({ text: name.commandRequest.title, length: 21 })} -{" "}
            <span className="text-red-500">
              {name.commandRequest.reference}
            </span>
          </div>
        );
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
          <div className="font-medium">{provider.name}</div>
          // <div className="font-medium">{formatToShortName(provider.name)}</div>
        );
      },
    },

    {
      accessorKey: "amount",
      header: ({ column }) => (
        <span
          className="tablehead"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {"Montant TTC"}
          <ArrowUpDown />
        </span>
      ),
      cell: ({ row }) => {
        const base = row.original;
        return <div className="font-medium">{XAF.format(base.netToPay)}</div>;
      },
    },
    {
      accessorKey: "amountHT",
      header: ({ column }) => (
        <span
          className="tablehead"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {"Montant HT"}
          <ArrowUpDown />
        </span>
      ),
      cell: ({ row }) => {
        const base = row.original;
        return (
          <div className="font-medium">
            {XAF.format(totalAmountPurchase(base))}
          </div>
        );
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
      header: () => <span className="tablehead">{"État de paiement"}</span>,
      cell: ({ row }) => {
        const value = row.getValue("status") as Status;
        const { label, variant } = getStatusLabel(value);
        return <Badge variant={variant}>{label}</Badge>;
      },
    },

    {
      accessorKey: "payment",
      header: () => <span className="tablehead">{"Statut de paiement"}</span>,
      cell: ({ row }) => {
        const original = row.original;
        const i = getProgress(original);

        return (
          <Progress value={i.progress} className={"w-full"}>
            <ProgressLabel>{XAF.format(i.value)}</ProgressLabel>
            <ProgressValue />
          </Progress>
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
          <ArrowUpDown className="h-4 w-4" />
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
                className="cursor-pointer"
                onClick={() => {
                  setSelectedValue(item);
                  setEdit(true);
                }}
                disabled={item.status === "APPROVED"}
              >
                <Pencil />
                {"Modifier"}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => {
                  setSelectedValue(item);
                  setComplete(true);
                }}
                disabled={false} //change with these rules item.status !== "APPROVED" || !!item.commandFile
              >
                <FileTextIcon />
                {"Générer le bon signé"}{" "}
                {/**Previously Compléter (Bon signé) */}
              </DropdownMenuItem>
              {!!item.commandFile && item.commandFile.length > 0 && (
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => {
                    setSelectedValue(item);
                    setViewSigned(true);
                  }}
                >
                  <FileSpreadsheetIcon />
                  {"Voir le bon signé"}
                </DropdownMenuItem>
              )}
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

      // Recherche sur le fournisseur
      const providerText = (po.provider?.name ?? "").toLowerCase();
      // Recherche sur la cotation
      const cotationText =
        `${po.devi?.commandRequest?.title ?? ""} ${po.devi?.commandRequest?.reference ?? ""}`.toLowerCase();

      return (
        String(po.id).includes(s) ||
        String(po.deviId).includes(s) ||
        String(po.providerId).includes(s) ||
        statusText.includes(s) ||
        priorityText.includes(s) ||
        paymentMethodText.includes(s) ||
        paymentTermsText.includes(s) ||
        locationText.includes(s) ||
        createdText.includes(s) ||
        providerText.includes(s) ||
        cotationText.includes(s)
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
    setGlobalFilter("");
    setStatusFilter("all");
    setPriorityFilter("all");
    setProviderFilter("all");
    setCotationFilter("all");
    // Réinitialiser les recherches
    setStatusSearch("");
    setPrioritySearch("");
    setProviderSearch("");
    setCotationSearch("");
    // setPenaltyFilter("all"); // Si vous décommentez le filtre pénalités
  };

  return (
    <div className="w-full space-y-4">
      {/* BARRE DE FILTRES */}
      <div className="flex flex-wrap items-center justify-between gap-4">
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
                    placeholder="Ref, Cotation, fournisseur, statut"
                    value={globalFilter ?? ""}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                  />
                </div>

                {/* Filtre par statut avec recherche */}
                <div className="space-y-3">
                  <Label>{"Statut"}</Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between"
                      >
                        <span className="truncate">
                          {statusFilter === "all"
                            ? "Tous les statuts"
                            : PURCHASE_ORDER_STATUS.find(
                                (s) => s.value === statusFilter,
                              )?.name || "Sélectionner"}
                        </span>
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] max-h-[300px] overflow-y-auto">
                      <div className="p-2 sticky top-0 bg-popover z-10 border-b">
                        <Input
                          placeholder="Rechercher un statut..."
                          className="h-8"
                          value={statusSearch}
                          onChange={(e) => setStatusSearch(e.target.value)}
                          onMouseDown={(e) => e.stopPropagation()}
                          onClick={(e) => e.stopPropagation()}
                          onKeyDown={(e) => e.stopPropagation()}
                          autoFocus
                        />
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => {
                          setStatusFilter("all");
                          setStatusSearch("");
                        }}
                        className={statusFilter === "all" ? "bg-accent" : ""}
                      >
                        <span>Tous les statuts</span>
                      </DropdownMenuItem>
                      {PURCHASE_ORDER_STATUS.filter((s) =>
                        s.name
                          .toLowerCase()
                          .includes(statusSearch.toLowerCase()),
                      ).map((s) => (
                        <DropdownMenuItem
                          key={s.value}
                          onClick={() => {
                            setStatusFilter(s.value as Status);
                            setStatusSearch("");
                          }}
                          className={
                            statusFilter === s.value ? "bg-accent" : ""
                          }
                        >
                          <span>{s.name}</span>
                        </DropdownMenuItem>
                      ))}
                      {PURCHASE_ORDER_STATUS.filter((s) =>
                        s.name
                          .toLowerCase()
                          .includes(statusSearch.toLowerCase()),
                      ).length === 0 && (
                        <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                          Aucun statut trouvé
                        </div>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Filtre par priorité avec recherche */}
                <div className="space-y-3">
                  <Label>{"Priorité"}</Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between"
                      >
                        <span className="truncate">
                          {priorityFilter === "all"
                            ? "Toutes les priorités"
                            : PRIORITIES.find((p) => p.value === priorityFilter)
                                ?.name || "Sélectionner"}
                        </span>
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] max-h-[300px] overflow-y-auto">
                      <div className="p-2 sticky top-0 bg-popover z-10 border-b">
                        <Input
                          placeholder="Rechercher une priorité..."
                          className="h-8"
                          value={prioritySearch}
                          onChange={(e) => setPrioritySearch(e.target.value)}
                          onMouseDown={(e) => e.stopPropagation()}
                          onClick={(e) => e.stopPropagation()}
                          onKeyDown={(e) => e.stopPropagation()}
                          autoFocus
                        />
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => {
                          setPriorityFilter("all");
                          setPrioritySearch("");
                        }}
                        className={priorityFilter === "all" ? "bg-accent" : ""}
                      >
                        <span>Toutes les priorités</span>
                      </DropdownMenuItem>
                      {PRIORITIES.filter((p) =>
                        p.name
                          .toLowerCase()
                          .includes(prioritySearch.toLowerCase()),
                      ).map((p) => (
                        <DropdownMenuItem
                          key={p.value}
                          onClick={() => {
                            setPriorityFilter(p.value as Priority);
                            setPrioritySearch("");
                          }}
                          className={
                            priorityFilter === p.value ? "bg-accent" : ""
                          }
                        >
                          <span>{p.name}</span>
                        </DropdownMenuItem>
                      ))}
                      {PRIORITIES.filter((p) =>
                        p.name
                          .toLowerCase()
                          .includes(prioritySearch.toLowerCase()),
                      ).length === 0 && (
                        <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                          Aucune priorité trouvée
                        </div>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Filtre par fournisseur avec recherche */}
                <div className="space-y-3">
                  <Label>{"Fournisseur"}</Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between"
                      >
                        <span className="truncate">
                          {providerFilter === "all"
                            ? "Tous les fournisseurs"
                            : uniqueProviders.find(
                                (p) => p.id === parseInt(providerFilter),
                              )?.name || "Sélectionner"}
                        </span>
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] max-h-[300px] overflow-y-auto">
                      <div className="p-2 sticky top-0 bg-popover z-10 border-b">
                        <Input
                          placeholder="Rechercher un fournisseur..."
                          className="h-8"
                          value={providerSearch}
                          onChange={(e) => setProviderSearch(e.target.value)}
                          onMouseDown={(e) => e.stopPropagation()}
                          onClick={(e) => e.stopPropagation()}
                          onKeyDown={(e) => e.stopPropagation()}
                          autoFocus
                        />
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => {
                          setProviderFilter("all");
                          setProviderSearch("");
                        }}
                        className={providerFilter === "all" ? "bg-accent" : ""}
                      >
                        <span>Tous les fournisseurs</span>
                      </DropdownMenuItem>
                      {uniqueProviders
                        .filter((p) =>
                          p.name
                            .toLowerCase()
                            .includes(providerSearch.toLowerCase()),
                        )
                        .map((p) => (
                          <DropdownMenuItem
                            key={p.id}
                            onClick={() => {
                              setProviderFilter(String(p.id));
                              setProviderSearch("");
                            }}
                            className={
                              providerFilter === String(p.id) ? "bg-accent" : ""
                            }
                          >
                            <span>{p.name}</span>
                          </DropdownMenuItem>
                        ))}
                      {uniqueProviders.filter((p) =>
                        p.name
                          .toLowerCase()
                          .includes(providerSearch.toLowerCase()),
                      ).length === 0 && (
                        <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                          Aucun fournisseur trouvé
                        </div>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Filtre par cotation avec recherche */}
                <div className="space-y-3">
                  <Label>{"Cotation"}</Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between"
                      >
                        <span className="truncate">
                          {cotationFilter === "all"
                            ? "Toutes les cotations"
                            : uniqueCotations.find(
                                (c) => c.id === parseInt(cotationFilter),
                              )?.label || "Sélectionner"}
                        </span>
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] max-h-[300px] overflow-y-auto">
                      <div className="p-2 sticky top-0 bg-popover z-10 border-b">
                        <Input
                          placeholder="Rechercher une cotation..."
                          className="h-8"
                          value={cotationSearch}
                          onChange={(e) => setCotationSearch(e.target.value)}
                          onMouseDown={(e) => e.stopPropagation()}
                          onClick={(e) => e.stopPropagation()}
                          onKeyDown={(e) => e.stopPropagation()}
                          autoFocus
                        />
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => {
                          setCotationFilter("all");
                          setCotationSearch("");
                        }}
                        className={cotationFilter === "all" ? "bg-accent" : ""}
                      >
                        <span>Toutes les cotations</span>
                      </DropdownMenuItem>
                      {uniqueCotations
                        .filter(
                          (c) =>
                            c.label
                              .toLowerCase()
                              .includes(cotationSearch.toLowerCase()) ||
                            c.reference
                              .toLowerCase()
                              .includes(cotationSearch.toLowerCase()) ||
                            c.title
                              .toLowerCase()
                              .includes(cotationSearch.toLowerCase()),
                        )
                        .map((c) => (
                          <DropdownMenuItem
                            key={c.id}
                            onClick={() => {
                              setCotationFilter(String(c.id));
                              setCotationSearch("");
                            }}
                            className={
                              cotationFilter === String(c.id) ? "bg-accent" : ""
                            }
                          >
                            <span className="truncate">{c.label}</span>
                          </DropdownMenuItem>
                        ))}
                      {uniqueCotations.filter((c) =>
                        c.label
                          .toLowerCase()
                          .includes(cotationSearch.toLowerCase()),
                      ).length === 0 && (
                        <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                          Aucune cotation trouvée
                        </div>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

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

          {/* Filtres actifs */}
          {(statusFilter !== "all" ||
            priorityFilter !== "all" ||
            penaltyFilter !== "all" ||
            providerFilter !== "all" ||
            cotationFilter !== "all" ||
            globalFilter) && (
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span>Filtres actifs:</span>

              {statusFilter !== "all" && (
                <Badge variant="default" className="font-normal">
                  {`Statut: ${getStatusLabel(statusFilter).label}`}
                </Badge>
              )}

              {priorityFilter !== "all" && (
                <Badge variant="outline" className="font-normal">
                  {`Priorité: ${getPriorityLabel(priorityFilter).label}`}
                </Badge>
              )}

              {providerFilter !== "all" && (
                <Badge variant="outline" className="font-normal">
                  {`Fournisseur: ${uniqueProviders.find((p) => p.id === parseInt(providerFilter))?.name}`}
                </Badge>
              )}

              {cotationFilter !== "all" && (
                <Badge variant="outline" className="font-normal">
                  {`Cotation: ${uniqueCotations.find((c) => c.id === parseInt(cotationFilter))?.reference}`}
                </Badge>
              )}

              {penaltyFilter !== "all" && (
                <Badge variant="outline" className="font-normal">
                  {`Pénalités: ${penaltyFilter === "yes" ? "Oui" : "Non"}`}
                </Badge>
              )}

              {globalFilter && (
                <Badge variant="outline" className="font-normal">
                  {`Recherche: "${globalFilter}"`}
                </Badge>
              )}
            </div>
          )}
        </div>

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
                if (column.id === "id") columnName = "#";
                else if (column.id === "devi") columnName = "Devis";
                else if (column.id === "reference") columnName = "Référence";
                else if (column.id === "provider") columnName = "Fournisseur";
                else if (column.id === "amount") columnName = "Montant";
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
                    {(statusFilter !== "all" ||
                      priorityFilter !== "all" ||
                      penaltyFilter !== "all" ||
                      providerFilter !== "all" ||
                      cotationFilter !== "all" ||
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

      {/* PAGINATION + INFOS */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {table.getPageCount() > 1 && <Pagination table={table} pageSize={15} />}
      </div>
      {selectedValue && (
        <ViewPurchase
          open={view}
          openChange={setView}
          purchaseOrder={selectedValue}
          users={users}
        />
      )}
      {selectedValue && (
        <EditPurchase
          open={edit}
          openChange={setEdit}
          purchaseOrder={selectedValue}
          conditions={conditions}
        />
      )}
      {selectedValue && (
        <AddSignedFile
          open={complete}
          openChange={setComplete}
          purchaseOrder={selectedValue}
          users={users}
        />
      )}
      {selectedValue && (
        <ViewSignedPurchase
          open={viewSigned}
          openChange={setViewSigned}
          purchaseOrder={selectedValue}
          fileUrl={`${process.env.NEXT_PUBLIC_API}/${selectedValue.commandFile}`}
        />
      )}
    </div>
  );
}
