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
  const [selectedItem, setSelectedItem] = React.useState<RequestModelT | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isValidationModalOpen, setIsValidationModalOpen] =
    React.useState(false);
  const [isLastValModalOpen, setIsLastValModalOpen] = React.useState(false);
  const [validationType, setValidationType] = React.useState<
    "approve" | "reject"
  >("approve");
  const [data, setData] = React.useState<RequestModelT[]>([]);

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

  const categoriesData = useQuery({
    queryKey: ["categories"],
    queryFn: async () => request.getCategories(),
  });

  const getProjectName = (projectId: string) => {
    const project = projectsData.data?.data?.find(
      (proj) => proj.id === Number(projectId)
    );
    return project?.label || projectId;
  };

  const getCategoryName = (categoryId: string) => {
    const category = categoriesData.data?.data?.find(
      (cat) => cat.id === Number(categoryId)
    );
    return category?.label || categoryId;
  };

  const getUserName = (userId: string) => {
    const user = usersData.data?.data?.find((u) => u.id === Number(userId));
    return user?.name || userId;
  };

  const uniqueCategories = React.useMemo(() => {
    if (!data.length || !categoriesData.data?.data) return [];

    const categoryIds = [...new Set(data.map((req) => req.categoryId))];

    return categoryIds.map((categoryId) => {
      const category = categoriesData.data.data.find(
        (cat) => cat.id === Number(categoryId)
      );
      return {
        id: categoryId,
        name: category?.label || `Catégorie ${categoryId}`,
      };
    });
  }, [data, categoriesData.data]);

  const getBeneficiaryDisplay = (request: RequestModelT) => {
    if (request.beneficiary === "me") {
      return getUserName(String(request.userId));
    } else if (
      request.beneficiary === "groupe" &&
      request.benef &&
      request.benef.length === 1
    ) {
      return request.beficiaryList![0].name;
    } else if (
      request.beneficiary === "groupe" &&
      request.beficiaryList &&
      request.beficiaryList.length > 0
    ) {
      if (request.beficiaryList.length > 2) {
        return (
          request.beficiaryList
            .slice(0, 2)
            .map((ben) => getUserName(String(ben.name)))
            .join(", ") +
          " + " +
          (request.beficiaryList.length - 2) +
          " autre" +
          (request.beficiaryList.length > 2 ? "s" : "")
        );
      }
      return request.beficiaryList
        .map((ben) => getUserName(String(ben.name)))
        .join(", ");
    }
    return "Aucun bénéficiaire";
  };

  const reviewRequest = useMutation({
    mutationKey: ["requests-review"],
    mutationFn: async ({
      id,
      validated,
      decision,
    }: {
      id: number;
      validated: boolean;
      decision?: string;
    }) => {
      await request.review(id, {
        validated: validated,
        decision: decision,
        userId: user?.id!,
      });
    },
    onSuccess: () => {
      toast.success("Besoin validé avec succès !");
      requestData.refetch();
    },
    onError: () => {
      toast.error("Une erreur est survenue lors de la validation.");
    },
  });

  const isLastValidator =
    departmentData.data?.data
      .flatMap((mem) => mem.members)
      .find((mem) => mem.userId === user?.id)?.finalValidator === true;

  // afficher les element a valider en fonction du validateur
  React.useEffect(() => {
    if (requestData.data?.data && user) {
      const show = requestData.data?.data
        .filter((x) => x.state === "pending")
        .filter((item) => {
          // Récupérer la liste des IDs des validateurs pour ce departement
          const validatorIds = departmentData.data?.data
            .flatMap((x) => x.members)
            .filter((x) => x.validator === true)
            .map((x) => x.userId);

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
      setData(show);
    }
  }, [
    requestData.data?.data,
    user,
    isLastValidator,
    departmentData.data?.data,
  ]);

  const handleValidation = async (motif?: string): Promise<boolean> => {
    console.log(motif);

    try {
      if (!selectedItem) {
        setIsValidationModalOpen(false);
        return false;
      }

      if (validationType === "approve") {
        await reviewRequest.mutateAsync({
          id: Number(selectedItem.id),
          validated: true,
        });
      } else if (validationType === "reject") {
        // await rejectRequest.mutateAsync({ id: Number(selectedItem.id) });
        await reviewRequest.mutateAsync({
          id: Number(selectedItem.id),
          validated: false,
          decision: motif,
        });
      }

      return true;
    } catch (error) {
      return false;
    } finally {
      setIsValidationModalOpen(false);
    }
  };

  const openValidationModal = (
    type: "approve" | "reject",
    item: RequestModelT
  ) => {
    setSelectedItem(item);
    setValidationType(type);
    setIsValidationModalOpen(true);
  };

  // Define columns - Seulement les champs demandés
  const columns: ColumnDef<RequestModelT>[] = [
    {
      accessorKey: "label",
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
        <div className="max-w-[200px] truncate">{row.getValue("label")}</div>
      ),
    },
    {
      accessorKey: "projectId",
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
      cell: ({ row }) => <div>{getProjectName(row.getValue("projectId"))}</div>,
    },
    {
      accessorKey: "categoryId",
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
      cell: ({ row }) => {
        const categoryId = row.getValue("categoryId") as string;
        return <div>{getCategoryName(categoryId)}</div>;
      },
      // Ajoutez cette propriété pour améliorer le filtrage
      filterFn: (row, columnId, filterValue) => {
        
        if (!filterValue || filterValue === "all") return true;
        const categoryId = row.getValue(columnId) as string;
        console.log(filterValue, categoryId);
        return categoryId === filterValue;
      },
    },
    {
      accessorKey: "userId",
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
      cell: ({ row }) => <div>{getUserName(row.getValue("userId"))}</div>,
    },
    {
      accessorKey: "beneficiary",
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
      cell: ({ row }) => (
        <div className="max-w-[200px] truncate">
          {getBeneficiaryDisplay(row.original)}
        </div>
      ),
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
      const searchValue = filterValue.toLowerCase();

      // Recherche dans toutes les colonnes principales avec conversion des IDs en noms
      const searchableColumns = [
        "label",
        "projectId",
        "categoryId",
        "userId",
        "beneficiary",
      ];

      return searchableColumns.some((columnId) => {
        const rawValue = row.getValue(columnId);
        let displayValue = rawValue;

        // Convertir les IDs en noms pour la recherche
        if (columnId === "projectId") {
          displayValue = getProjectName(String(rawValue));
        } else if (columnId === "categoryId") {
          displayValue = getCategoryName(String(rawValue));
        } else if (columnId === "userId") {
          displayValue = getUserName(String(rawValue));
        } else if (columnId === "beneficiary") {
          displayValue = getBeneficiaryDisplay(row.original);
        }

        return String(displayValue).toLowerCase().includes(searchValue);
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
            (table.getColumn("categoryId")?.getFilterValue() as string) ?? "all"
          }
          onValueChange={(value) => {
            table
              .getColumn("categoryId")
              ?.setFilterValue(value === "all" ? "" : value);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrer par catégorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les catégories</SelectItem>
            {categoriesData.data?.data
              ?.filter((category) =>
                // Vérifier que la catégorie existe dans les données actuelles
                data.some(
                  (request) =>
                    String(request.categoryId) === String(category.id)
                )
              )
              .map((category) => (
                <SelectItem key={category.id} value={String(category.id)}>
                  {category.label}
                </SelectItem>
              ))}
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
                    {column.id === "label"
                      ? "Titres"
                      : column.id === "projectId"
                      ? "Projets"
                      : column.id === "categoryId"
                      ? "Catégories"
                      : column.id === "userId"
                      ? "Emetteurs"
                      : column.id === "beneficiary"
                      ? "Beneficiaires"
                      : column.id}
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
                      row.original.state as keyof typeof statusConfig
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
        onSubmit={(motif) => handleValidation(motif)}
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
