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
import { EllipsisVertical, Eye, LucideBan, LucidePen } from "lucide-react";
import * as React from "react";

import Empty from "@/components/base/empty";
import { Pagination } from "@/components/base/pagination";
import { DetailBesoin } from "@/components/besoin/detail-besoin";
import EditTypeOthers from "@/components/besoin/EditTypeOthers";
import EditTypeSettle from "@/components/besoin/EditTypeSettle";
import EditTypeSpecial from "@/components/besoin/EditTypeSpecial";
import UpdateRequest from "@/components/besoin/UpdateRequest";
import UpdateRequestFac from "@/components/besoin/UpdateRequestFac";
import UpdateRHRequest from "@/components/besoin/UpdateRequestRH";
import {
  REQUEST_COLUMN_CLASS,
  RequestCell,
  RequestStatusPill,
  RequestTypePill,
  requestRowClass,
  requestStatusLabel,
} from "@/components/besoin/request-table-ui";
import { ModifiedLegend } from "@/components/legends";
import { ModalWarning } from "@/components/modals/modal-warning";
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
import { cn } from "@/lib/utils";
import { useStore } from "@/providers/datastore";
import { requestQ } from "@/queries/requestModule";
import {
  BonsCommande,
  Category,
  ProjectT,
  Reception,
  RequestModelT,
  RequestType,
  User,
} from "@/types/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import EditApproRequest from "./edit-appro-request";
import EditGasRequest from "./edit-gas-request";
import EditTaxesRequest from "./edit-taxes-request";
import EditTransportRequest from "./edit-transport-request";

interface Props {
  data: Array<RequestModelT>;
  categories: Array<Category>;
  projects: Array<ProjectT>;
  requestTypes: Array<RequestType>;
  users: Array<User>;
  receptions: Array<Reception>;
  purchaseOrders: Array<BonsCommande>;
  filters?: React.ReactNode;
}

export function TableMyRequests({
  data,
  categories,
  projects,
  requestTypes,
  users,
  receptions,
  purchaseOrders,
  filters,
}: Props) {
  const { user } = useStore();
  const queryClient = useQueryClient();
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({
      createdAt: false,
    });
  const [rowSelection, setRowSelection] = React.useState({});
  const [globalFilter, setGlobalFilter] = React.useState("");

  // modal specific states
  const [selectedItem, setSelectedItem] = React.useState<RequestModelT>();
  const [isUpdateModalOpen, setIsUpdateModalOpen] = React.useState(false);
  const [isUpdateFacModalOpen, setIsUpdateFacModalOpen] = React.useState(false);
  const [isUpdateRHModalOpen, setIsUpdateRHModalOpen] = React.useState(false);
  const [isUpdateOthersModalOpen, setIsUpdateOthersModalOpen] =
    React.useState(false);
  const [isUpdateSettleModalOpen, setIsUpdateSettleModalOpen] =
    React.useState(false);
  const [isUpdateApproModalOpen, setIsUpdateApproModalOpen] =
    React.useState(false);
  const [isUpdateGasModalOpen, setIsUpdateGasModalOpen] = React.useState(false);
  const [isUpdateTransportModalOpen, setIsUpdateTransportModalOpen] =
    React.useState(false);
  const [isUpdateTaxesModalOpen, setIsUpdateTaxesModalOpen] =
    React.useState(false);
  const [isUpdateSpecialModalOpen, setIsUpdateSpecialModalOpen] =
    React.useState(false);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = React.useState(false);

  const requestMutation = useMutation({
    mutationFn: async (data: Partial<RequestModelT>) => {
      const id = selectedItem?.id;
      if (!id) throw new Error("ID de besoin manquant");
      await requestQ.update(Number(id), data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      toast.success("Besoin annulé avec succès !");
    },
    onError: () => {
      toast.error("Une erreur est survenue.");
    },
  });

  const handleCancel = async () => {
    try {
      await requestMutation.mutateAsync({ state: "cancel" });
      return true;
    } catch {
      return false;
    }
  };

  const getProjectName = (projectId: string) => {
    const project = projects.find((proj) => proj.id === Number(projectId));
    return project?.label || projectId;
  };

  // Define columns
  const columns: ColumnDef<RequestModelT>[] = [
    {
      id: "besoin",
      accessorKey: "label",
      enableHiding: false,
      header: () => "Besoin",
      cell: ({ row }) => {
        const original = row.original;
        const modifier = original.requestOlds?.find((r) => r.id !== user?.id);
        const modified = !modifier
          ? false
          : modifier.priority !== original.priority ||
            modifier.amount !== original.amount ||
            modifier.dueDate !== original.dueDate ||
            modifier.quantity !== original.quantity ||
            modifier.unit !== original.unit;
        return (
          <RequestCell
            reference={original.ref}
            label={original.label}
            marker={!!modified && <ModifiedLegend />}
          />
        );
      },
    },
    {
      accessorKey: "type",
      header: () => "Type",
      cell: ({ row }) => (
        <RequestTypePill type={row.original.type} requestTypes={requestTypes} />
      ),
    },
    {
      accessorKey: "projectId",
      header: () => "Projet",
      cell: ({ row }) => {
        const projectId = row.original.projectId;
        return (
          <span className="line-clamp-1 text-body text-text-secondary">
            {projectId ? getProjectName(String(projectId)) : "--"}
          </span>
        );
      },
    },
    {
      accessorKey: "categoryId",
      header: () => "Catégorie",
      cell: ({ row }) => (
        <span className="line-clamp-1 text-body text-text-secondary">
          {categories.find((x) => x.id === Number(row.original.categoryId))
            ?.label ?? "--"}
        </span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: () => "Date d'émission",
      cell: ({ row }) => (
        <span className="text-body whitespace-nowrap text-text-secondary">
          {format(new Date(row.getValue("createdAt")), "PP", { locale: fr })}
        </span>
      ),
    },
    {
      accessorKey: "state",
      header: () => "Statut",
      cell: ({ row }) => <RequestStatusPill state={row.original.state} />,
    },
    {
      id: "actions",
      enableHiding: false,
      header: () => <span className="block text-right">{"Actions"}</span>,
      cell: ({ row }) => {
        const item = row.original;

        return (
          <div className="flex items-center justify-end gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger
                aria-label={`Actions pour ${item.ref}`}
                className="size-8 h-8 w-8 cursor-pointer justify-center gap-0 border-0 bg-transparent p-0 text-text-secondary hover:bg-hover hover:text-text-primary data-[state=open]:bg-hover [&_svg]:size-[18px] [&_svg]:text-current"
              >
                <EllipsisVertical />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{"Actions"}</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedItem(item);
                    setIsModalOpen(true);
                  }}
                >
                  <Eye />
                  {"Voir"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedItem(item);
                    switch (item.type) {
                      case "facilitation":
                        setIsUpdateFacModalOpen(true);
                        break;
                      case "ressource_humaine":
                        setIsUpdateRHModalOpen(true);
                        break;
                      case "others":
                        setIsUpdateOthersModalOpen(true);
                        break;
                      case "settle":
                        setIsUpdateSettleModalOpen(true);
                        break;
                      case "appro":
                        setIsUpdateApproModalOpen(true);
                        break;
                      case "gas":
                        setIsUpdateGasModalOpen(true);
                        break;
                      case "transport":
                        setIsUpdateTransportModalOpen(true);
                        break;
                      case "taxes":
                        setIsUpdateTaxesModalOpen(true);
                        break;
                      case "speciaux":
                        setIsUpdateSpecialModalOpen(true);
                        break;
                      default:
                        setIsUpdateModalOpen(true);
                        break;
                    }
                    // item.type === "facilitation"
                    //   ? setIsUpdateFacModalOpen(true)
                    //   : item.type === "ressource_humaine"
                    //     ? setIsUpdateRHModalOpen(true)
                    //     : item.type === "others"
                    //       ? setIsUpdateOthersModalOpen(true)
                    //       : item.type === "settle"
                    //         ? setIsUpdateSettleModalOpen(true)
                    //         : item.type === "appro"
                    //           ? setIsUpdateApproModalOpen(true)
                    //           : item.type === "gas"
                    //             ? setIsUpdateGasModalOpen(true)
                    //             : item.type === "transport"
                    //               ? setIsUpdateTransportModalOpen(true)
                    //               : item.type === "taxes"
                    //                 ? setIsUpdateTaxesModalOpen(true)
                    //                 : setIsUpdateModalOpen(true);
                  }}
                  disabled={
                    item.state !== "pending" ||
                    item.validators.some((v) => !!v.decision)
                  }
                >
                  <LucidePen />
                  {"Modifier"}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedItem(item);
                    setIsCancelModalOpen(true);
                  }}
                  disabled={
                    item.state !== "pending" ||
                    item.validators.some((v) => v.validated === true)
                  }
                >
                  <LucideBan className="mr-2 h-4 w-4 text-red-500" />
                  {"Annuler"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable<RequestModelT>({
    data: data || [],
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
      if (!filterValue || filterValue === "") return true;

      const searchValue = filterValue.toLowerCase().trim();
      const item = row.original;

      // 1. Recherche dans la référence
      if (item.ref?.toLowerCase().includes(searchValue)) return true;

      // 2. Recherche dans le label/titre
      if (item.label?.toLowerCase().includes(searchValue)) return true;

      // 3. Recherche dans le projet
      const projectName = getProjectName(String(item.projectId)).toLowerCase();
      if (projectName.includes(searchValue)) return true;

      // 4. Recherche dans la catégorie
      const categoryName =
        categories
          .find((cat) => cat.id === Number(item.categoryId))
          ?.label?.toLowerCase() || "";
      if (categoryName.includes(searchValue)) return true;

      // 5. Recherche dans le statut
      if (requestStatusLabel(item.state).toLowerCase().includes(searchValue))
        return true;

      // 6. Recherche dans le type
      const typeLabel =
        requestTypes.find((t) => t.type === item.type)?.label ?? item.type;
      if (typeLabel.toLowerCase().includes(searchValue)) return true;

      // 7. Recherche dans la date (formatée)
      const formattedDate = format(new Date(item.createdAt), "PP", {
        locale: fr,
      }).toLowerCase();
      if (formattedDate.includes(searchValue)) return true;

      return false;
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter: globalFilter,
    },
  });

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {filters}
        {/* Colonne de visibilité */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">{"Colonnes"}</Button>
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
                    {column.id === "type"
                      ? "Type"
                      : column.id === "state"
                        ? "Statut"
                        : column.id === "projectId"
                          ? "Projet"
                          : column.id === "categoryId"
                            ? "Catégorie"
                            : column.id === "createdAt"
                              ? "Date d'émission"
                              : column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {/* Table */}
      {table.getRowModel().rows?.length > 0 ? (
        <div className="overflow-hidden rounded-xl border border-border-default bg-surface">
          <Table className="min-w-[960px]">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-transparent">
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className={cn(
                        header.column.id === "besoin" &&
                          cn("pl-5", REQUEST_COLUMN_CLASS),
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
              {table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={requestRowClass(row.original.state)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        "py-3 whitespace-normal normal-case",
                        cell.column.id === "besoin" && "pl-5",
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
              ))}
            </TableBody>
          </Table>
          <Pagination
            table={table}
            noun="besoins"
            className="border-t border-border-default"
          />
        </div>
      ) : (
        <Empty message={"Aucun besoin enregistré"} />
      )}

      {/* Modals existants */}
      {selectedItem && (
        <>
          <DetailBesoin
            open={isModalOpen}
            onOpenChange={setIsModalOpen}
            data={selectedItem}
            users={users}
            projects={projects}
            receptions={receptions}
            purchaseOrders={purchaseOrders}
          />
          <UpdateRequest
            open={isUpdateModalOpen}
            onOpenChange={setIsUpdateModalOpen}
            request={selectedItem}
            users={users}
            projects={projects}
            categories={categories}
          />
          <UpdateRequestFac
            open={isUpdateFacModalOpen}
            onOpenChange={setIsUpdateFacModalOpen}
            requestData={selectedItem}
            users={users.filter((u) => !!u.verified && u.verified === true)}
            projects={projects}
            categories={categories}
          />
          <UpdateRHRequest
            open={isUpdateRHModalOpen}
            onOpenChange={setIsUpdateRHModalOpen}
            requestData={selectedItem}
            users={users}
            projects={projects}
            categories={categories}
          />
          <EditTypeSpecial
            request={selectedItem}
            users={users}
            categories={categories}
            open={isUpdateSpecialModalOpen}
            onOpenChange={setIsUpdateSpecialModalOpen}
          />

          <EditTypeOthers
            request={selectedItem}
            users={users}
            categories={categories}
            projects={projects}
            open={isUpdateOthersModalOpen}
            onOpenChange={setIsUpdateOthersModalOpen}
          />
          <EditTypeSettle
            request={selectedItem}
            users={users}
            categories={categories}
            projects={projects}
            open={isUpdateSettleModalOpen}
            onOpenChange={setIsUpdateSettleModalOpen}
          />
          <EditApproRequest
            request={selectedItem}
            categories={categories}
            projects={projects}
            open={isUpdateApproModalOpen}
            onOpenChange={setIsUpdateApproModalOpen}
          />
          <EditGasRequest
            request={selectedItem}
            categories={categories}
            open={isUpdateGasModalOpen}
            onOpenChange={setIsUpdateGasModalOpen}
          />
          <EditTaxesRequest
            request={selectedItem}
            categories={categories}
            open={isUpdateTaxesModalOpen}
            onOpenChange={setIsUpdateTaxesModalOpen}
            users={users}
            projects={projects}
          />
          <EditTransportRequest
            request={selectedItem}
            users={users}
            categories={categories}
            projects={projects}
            open={isUpdateTransportModalOpen}
            onOpenChange={setIsUpdateTransportModalOpen}
          />
        </>
      )}
      <ModalWarning
        open={isCancelModalOpen}
        onOpenChange={setIsCancelModalOpen}
        title="Annuler le besoin"
        description="Êtes-vous sûr de vouloir annuler ce besoin ?"
        actionText="Confirmer"
        onAction={() => handleCancel()}
        name={selectedItem?.label}
        variant="error"
      />
    </div>
  );
}
