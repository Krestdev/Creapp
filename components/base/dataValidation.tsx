"use client";

import * as React from "react";
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
  Eye,
  CheckCircle,
  XCircle,
  ChevronDown,
  CheckCheck,
  LucideBan,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn, parseFrenchDate } from "@/lib/utils";
import { DetailBesoin } from "../modals/detail-besoin";
import { ValidationModal } from "../modals/ValidationModal";
import { RequestQueries } from "@/queries/requestModule";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useStore } from "@/providers/datastore";
import { RequestModelT } from "@/types/types";
import { toast } from "sonner";
import Empty from "./empty";
import { Pagination } from "./pagination";
import { ProjectQueries } from "@/queries/projectModule";
import { UserQueries } from "@/queries/baseModule";
import { DropdownMenuLabel } from "@radix-ui/react-dropdown-menu";
import { DepartmentQueries } from "@/queries/departmentModule";
import { BesoinLastVal } from "../modals/BesoinLastVal";

// Define the data type
export type TableData = {
  id: string;
  reference: string;
  title: string;
  project?: string;
  category: string;
  status: "pending" | "validated" | "rejected" | "in-review";
  emeteur: string;
  beneficiaires: string;
  limiteDate: Date | undefined;
  priorite: "low" | "medium" | "high" | "urgent";
  quantite: number;
  unite: string;
  description: string;
  createdAt: string;
  updatedAt: string;
};

const statusConfig = {
  pending: {
    label: "En attente",
    icon: CheckCircle,
    badgeClassName: "bg-yellow-100 text-yellow-800 border-yellow-200",
    rowClassName: "bg-yellow-50 hover:bg-yellow-100",
  },
  validated: {
    label: "Approuvé",
    icon: CheckCircle,
    badgeClassName: "bg-green-100 text-green-800 border-green-200",
    rowClassName: "bg-green-50 hover:bg-green-100",
  },
  rejected: {
    label: "Rejeté",
    icon: XCircle,
    badgeClassName: "bg-red-100 text-red-800 border-red-200",
    rowClassName: "bg-red-50 hover:bg-red-100",
  },
  "in-review": {
    label: "En revue",
    icon: CheckCircle,
    badgeClassName: "bg-blue-100 text-blue-800 border-blue-200",
    rowClassName: "bg-blue-50 hover:bg-blue-100",
  },
};

export function DataValidation() {
  const { isHydrated, user } = useStore();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [globalFilter, setGlobalFilter] = React.useState("");

  // Modal states
  const [selectedItem, setSelectedItem] = React.useState<TableData | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isValidationModalOpen, setIsValidationModalOpen] =
    React.useState(false);
  const [isLastValModalOpen, setIsLastValModalOpen] = React.useState(false);
  const [validationType, setValidationType] = React.useState<
    "approve" | "reject"
  >("approve");
  const [toShow, setToShow] = React.useState<RequestModelT[]>([]);

  const department = new DepartmentQueries();
  const departmentData = useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      return department.getAll();
    },
  });

  const projects = new ProjectQueries();
  const projectsData = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      return projects.getAll();
    },
  });

  const users = new UserQueries();
  const usersData = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      return users.getAll();
    },
  });

  const request = new RequestQueries();
  // Récupérer tous les besoins en attente de validation (pour les validateurs)
  const requestData = useQuery({
    queryKey: ["requests-validation"],
    queryFn: () => {
      return request.getAll();
    },
    enabled: isHydrated,
  });

  const rejectRequest = useMutation({
    mutationKey: ["requests-validation"],
    mutationFn: async ({ id }: { id: number }) => {
      await request.reject(id);
    },
    onSuccess: () => {
      toast.success("Besoin rejeté avec succès !");
      requestData.refetch();
    },
    onError: () => {
      toast.error("Une erreur est survenue.");
    },
  });

  const reviewRequest = useMutation({
    mutationKey: ["requests-review"],
    mutationFn: async ({ id, validated, decision }: { id: number; validated: boolean; decision?: string }) => {
      await request.review(id, { validated: validated, decision, userId: user?.id! });
    },
    onSuccess: () => {
      toast.success("Besoin validé avec succès !");
      requestData.refetch();
    },
    onError: () => {
      toast.error("Une erreur est survenue lors de la validation.");
    },
  });

  // const requestMutation = useMutation({
  //   mutationKey: ["requests"],
  //   mutationFn: async (data: Partial<RequestModelT>) => {
  //     const id = data?.id;
  //     if (!id) throw new Error("ID de besoin manquant");

  //     await request.update(Number(id), data);
  //     return { id: Number(id) };
  //   },
  //   onSuccess: (res) => {
  //     validateRequest.mutateAsync({ id: res.id });
  //   },
  //   onError: () => {
  //     toast.error("Une erreur est survenue.");
  //   },
  // });

  const mapApiStatusToTableStatus = (
    apiStatus: string
  ): TableData["status"] => {
    const statusMap: Record<string, TableData["status"]> = {
      pending: "pending",
      validated: "validated",
      rejected: "rejected",
      "in-review": "in-review",
    };
    return statusMap[apiStatus] || "pending";
  };

  const mapApiPriorityToTablePriority = (
    apiPriority: string
  ): TableData["priorite"] => {
    const priorityMap: Record<string, TableData["priorite"]> = {
      low: "low",
      medium: "medium",
      high: "high",
      urgent: "urgent",
    };
    return priorityMap[apiPriority] || "medium";
  };

  const formatDate = (date: Date | string): string => {
    if (!date) return "Non définie";
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString("fr-FR");
  };

  const isLastValidator =
    departmentData.data?.data
      .flatMap((mem) => mem.members)
      .find((mem) => mem.userId === user?.id)?.finalValidator === true;

  // afficher les element a valider en fonction du validateur
  React.useEffect(() => {
    if (requestData.data?.data && user) {
      const show = requestData.data?.data.filter((item) => {
        // Récupérer la liste des IDs des validateurs pour ce departement
        const validatorIds = departmentData.data?.data
          .flatMap((x) => x.members)
          .filter((x) => x.validator === true)
          .map((x) => x.userId);

        console.log(validatorIds, item.revieweeList);

        if (isLastValidator) {
          return validatorIds?.every((id) =>
            item.revieweeList?.flatMap((x) => x.validatorId).includes(id)
          );
        } else {
          return (
            !item.revieweeList
              ?.flatMap((x) => x.validatorId)
              .includes(user?.id!) && item.state === "pending"
          );
        }
      });
      setToShow(show);
    }
  }, [
    requestData.data?.data,
    user,
    isLastValidator,
    departmentData.data?.data,
  ]);

  const handleValidation = async (motif?: string): Promise<boolean> => {
    try {
      if (!selectedItem) {
        setIsValidationModalOpen(false);
        return false;
      }

      if (validationType === "approve") {
        await reviewRequest.mutateAsync({
          id: Number(selectedItem.id),
          validated: true
        });
      } else if (validationType === "reject") {
        // await rejectRequest.mutateAsync({ id: Number(selectedItem.id) });
        await reviewRequest.mutateAsync({
          id: Number(selectedItem.id),
          validated: false,
          decision: motif
        });
      }

      return true;
    } catch (error) {
      return false;
    } finally {
      setIsValidationModalOpen(false);
    }
  };

  const openValidationModal = (type: "approve" | "reject", item: TableData) => {
    setSelectedItem(item);
    setValidationType(type);
    setIsValidationModalOpen(true);
  };

  const data = React.useMemo(() => {
    if (!toShow || !Array.isArray(toShow)) {
      return [];
    }

    // Filtrer pour ne montrer que les besoins en attente de validation
    const pendingRequests = toShow.filter(
      (item: RequestModelT) =>
        item.state === "pending" || item.state === "in-review"
    );

    return pendingRequests.map((item: RequestModelT) => ({
      id: item.id.toString(),
      reference: `REF-${item.id.toString().padStart(3, "0")}`,
      title: item.label,
      project: item.projectId
        ? projectsData.data?.data.find(
            (project) => project.id === item.projectId
          )?.label
        : "Non assigné",
      category: "Général",
      status: mapApiStatusToTableStatus(item.state),
      emeteur:
        usersData.data?.data.find((user) => user.id === item.userId)?.name ||
        "Utilisateur inconnu",
      beneficiaires: item.beneficiary
        ? usersData.data?.data.find(
            (user) => user.id === Number(item.beneficiary)
          )?.name || "Non spécifié"
        : "Non spécifié",
      description: item.description || "Aucune description",
      limiteDate: item.dueDate,
      priorite: mapApiPriorityToTablePriority(item.proprity),
      quantite: item.quantity,
      unite: item.unit || "Unité",
      createdAt: formatDate(item.createdAt),
      updatedAt: formatDate(item.updatedAt),
    }));
  }, [toShow, usersData.data, projectsData.data]);

  // Define columns - Seulement les champs demandés
  const columns: ColumnDef<TableData>[] = [
    // {
    //   id: "select",
    //   header: ({ table }) => (
    //     <Checkbox
    //       checked={
    //         table.getIsAllPageRowsSelected() ||
    //         (table.getIsSomePageRowsSelected() && "indeterminate")
    //       }
    //       onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
    //       aria-label="Select all"
    //     />
    //   ),
    //   cell: ({ row }) => (
    //     <Checkbox
    //       checked={row.getIsSelected()}
    //       onCheckedChange={(value) => row.toggleSelected(!!value)}
    //       aria-label="Select row"
    //     />
    //   ),
    //   enableSorting: false,
    //   enableHiding: false,
    // },
    {
      accessorKey: "title",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {"Titres"}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("title")}</div>
      ),
    },
    {
      accessorKey: "project",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {"Projets"}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => <div>{row.getValue("project")}</div>,
    },
    {
      accessorKey: "category",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {"Catégories"}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => <div>{row.getValue("category")}</div>,
    },
    {
      accessorKey: "emeteur",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {"Emetteurs"}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => <div>{row.getValue("emeteur")}</div>,
    },
    {
      accessorKey: "beneficiaires",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {"Bénéficiaires"}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => <div>{row.getValue("beneficiaires")}</div>,
    },
    {
      id: "actions",
      enableHiding: false,
      header: "Actions",
      cell: ({ row }) => {
        const item = row.original;

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
              <DropdownMenuItem
                onClick={() => {
                  setSelectedItem(item);
                  setIsModalOpen(true);
                }}
              >
                <Eye className="mr-2 h-4 w-4" />
                Voir
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() =>
                  isLastValidator
                    ? (setSelectedItem(item), setIsLastValModalOpen(true))
                    : openValidationModal("approve", item)
                }
              >
                <CheckCheck className="text-green-500 mr-2 h-4 w-4" />
                Valider
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => openValidationModal("reject", item)}
              >
                <LucideBan className="text-red-500 mr-2 h-4 w-4" />
                Rejeter
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable<TableData>({
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
      const searchableColumns = [
        "title",
        "project",
        "emeteur",
        "beneficiaires",
      ];
      const searchValue = filterValue.toLowerCase();

      return searchableColumns.some((column) => {
        const value = row.getValue(column) as string;
        return value?.toLowerCase().includes(searchValue);
      });
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
        {/* Global search */}
        <Input
          placeholder="Rechercher par titre, projet, émetteur..."
          value={globalFilter ?? ""}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="max-w-sm"
        />

        {/* Category filter */}
        <Select
          value={
            (table.getColumn("category")?.getFilterValue() as string) ?? "all"
          }
          onValueChange={(value) =>
            table
              .getColumn("category")
              ?.setFilterValue(value === "all" ? "" : value)
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrer par catégorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les catégories</SelectItem>
            <SelectItem value="Design">Design</SelectItem>
            <SelectItem value="Development">Development</SelectItem>
            <SelectItem value="Security">Security</SelectItem>
            <SelectItem value="Marketing">Marketing</SelectItem>
          </SelectContent>
        </Select>

        {/* Column visibility */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto bg-transparent">
              Colonnes
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
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Table */}
      {table.getRowModel().rows?.length > 0 ? (
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
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={cn(
                    statusConfig[
                      row.original.status as keyof typeof statusConfig
                    ].rowClassName
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="border-r last:border-r-0"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <Empty message={"Aucun besoin en attente de validation"} />
      )}

      {/* Pagination */}
      {table.getRowModel().rows?.length > 0 && (
        <Pagination table={table} pageSize={15} />
      )}

      {/* Modals */}
      <DetailBesoin
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        data={selectedItem}
        actionButton="Valider"
        action={() =>
          isLastValidator
            ? (setIsModalOpen(false), setIsLastValModalOpen(true))
            : (setIsModalOpen(false),
              openValidationModal("approve", selectedItem!))
        }
      />

      <ValidationModal
        isMotifRequired={true}
        open={isValidationModalOpen}
        onOpenChange={setIsValidationModalOpen}
        type={validationType}
        title={
          validationType === "approve"
            ? "Valider le besoin"
            : "Rejeter le besoin"
        }
        description={
          validationType === "approve"
            ? "Êtes-vous sûr de vouloir valider ce besoin ?"
            : "Êtes-vous sûr de vouloir rejeter ce besoin ? Veuillez fournir un motif."
        }
        successConfirmation={{
          title: "Succès ✅",
          description:
            validationType === "approve"
              ? "Le besoin a été validé avec succès."
              : "Le besoin a été rejeté avec succès.",
        }}
        errorConfirmation={{
          title: "Erreur ❌",
          description: "Une erreur est survenue lors de l'opération.",
        }}
        buttonTexts={{
          approve: "Valider",
          reject: "Rejeter",
          cancel: "Annuler",
          close: "Fermer",
          retry: "Réessayer",
          processing: "Traitement...",
        }}
        labels={{
          rejectionReason: "Motif du rejet",
          rejectionPlaceholder: "Expliquez la raison du rejet...",
          rejectionError: "Veuillez fournir un motif",
        }}
        onSubmit={() => handleValidation()}
      />
      <BesoinLastVal
        open={isLastValModalOpen}
        onOpenChange={setIsLastValModalOpen}
        data={selectedItem}
        titre={"Valider le besoin"}
        description={"Êtes-vous sûr de vouloir valider ce besoin ?"}
      />
    </div>
  );
}
