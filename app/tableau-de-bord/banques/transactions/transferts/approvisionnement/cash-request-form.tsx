"use client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn, XAF } from "@/lib/utils";
import { useStore } from "@/providers/datastore";
import { ApproProps, transactionQ } from "@/queries/transaction";
import { Bank, PaymentRequest } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { CheckCheckIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Pagination } from "@/components/base/pagination";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table as TableComponent,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  PaginationOptions,
  PaginationState,
  useReactTable,
} from "@tanstack/react-table";
import z from "zod";
import PaymentsList from "./payments-list";

interface Props {
  banks: Array<Bank>;
  payments: Array<PaymentRequest>;
  pagination: PaginationState;
  paginationOptions: Pick<PaginationOptions, "onPaginationChange" | "rowCount">;
}

const formSchema = z.object({
  label: z.string().min(2, "Libellé trop court"),
  amount: z.coerce
    .number({ message: "Montant invalide" })
    .gt(0, "Montant > 0 requis"),
  fromBankId: z.coerce.number().int(),
  toBankId: z.coerce.number().int(),
  payments: z.array(z.coerce.number(), {
    message: "Veuillez ajouter des besoins",
  }),
});

type FormValues = z.infer<typeof formSchema>;

function CashRequestForm({
  banks,
  payments,
  pagination,
  paginationOptions,
}: Props) {
  const { user } = useStore();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      label: "Approvisionnement",
      amount: 0,
      fromBankId: undefined,
      toBankId: undefined, //To-Do Here !
      payments: [],
    },
  });

  const router = useRouter();
  const create = useMutation({
    mutationFn: async (payload: ApproProps) =>
      transactionQ.createAppro(payload),
    onSuccess: () => {
      toast.success("Votre demande de transfert a été initiée avec succès !");
      router.push("./");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  //Watch from Bank Id
  const fromValue = form.watch("fromBankId");
  const paymentValue = form.watch("payments");

  const rowSelection = React.useMemo(() => {
    const selection: Record<string, boolean> = {};
    paymentValue.forEach((id) => {
      selection[String(id)] = true;
    });
    return selection;
  }, [paymentValue]);

  const columns: ColumnDef<PaymentRequest>[] = React.useMemo(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "title",
        header: "Libellé",
        cell: ({ row }) => (
          <div className="line-clamp-1 text-base">{row.original.title}</div>
        ),
      },
      {
        accessorKey: "price",
        header: "Montant",
        cell: ({ row }) => (
          <div className="font-semibold text-gray-800">
            {XAF.format(row.original.price ?? 0)}
          </div>
        ),
      },
    ],
    [],
  );

  const table = useReactTable({
    data: payments,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getRowId: (row) => String(row.id),
    manualPagination: true,
    ...paginationOptions,
    state: {
      rowSelection,
      pagination,
    },
  });

  useEffect(() => {
    const paymentList = payments.filter((p) =>
      paymentValue.some((r) => r === p.id),
    );
    const total = paymentList.reduce((acc, i) => acc + (i.price ?? 0), 0);
    form.setValue("amount", total);
  }, [paymentValue]);

  const fromBank = React.useMemo(() => {
    if (!fromValue) return null;
    return banks.find((b) => b.id === Number(fromValue)) ?? null;
  }, [fromValue, banks]);

  function onSubmit(values: FormValues) {
    // Vérifier le solde insuffisant avant de continuer
    const fromBank = banks.find((x) => x.id === values.fromBankId);
    if (!fromBank) {
      return form.setError("fromBankId", {
        message: "Compte source introuvable",
      });
    }

    if (values.amount > fromBank.balance) {
      return form.setError("amount", {
        message: `Solde insuffisant. Solde disponible : ${XAF.format(
          fromBank.balance,
        )}`,
      });
    }

    const fromType = banks.find((x) => x.id === values.fromBankId)?.type;
    const toType = banks.find((x) => x.id === values.toBankId)?.type;
    if (!fromType) {
      return form.setError("fromBankId", { message: "Erreur sur le compte" });
    }
    if (!toType) {
      return form.setError("toBankId", { message: "Erreur sur le compte" });
    }
    create.mutate({
      ...values,
      Type: "TRANSFER",
      userId: user?.id ?? 0,
    });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid grid-cols-1 gap-4 @min-[1280px]:grid-cols-2"
      >
        <div className="max-w-3xl grid grid-cols-1 gap-4 @min-[640px]:grid-cols-2 place-items-start h-fit">
          <FormField
            control={form.control}
            name="label"
            render={({ field }) => (
              <FormItem className="@min-[640px]:col-span-2">
                <FormLabel isRequired>{"Libellé"}</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Intitulé de la transaction" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="@min-[640px]:col-span-2 w-full p-3 rounded-sm border grid grid-cols-1 gap-4 @min-[640px]:grid-cols-2 place-items-start">
            <h3 className="@min-[640px]:col-span-2">{"Transférer depuis"}</h3>
            <FormField
              control={form.control}
              name="fromBankId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel isRequired>{"Compte source"}</FormLabel>
                  <FormControl>
                    <Select
                      value={!!field.value ? String(field.value) : undefined}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Sélectionner un compte" />
                      </SelectTrigger>
                      <SelectContent>
                        {banks
                          .filter((c) => c.Status === true && c.type === "BANK")
                          .map((bank) => (
                            <SelectItem key={bank.id} value={String(bank.id)}>
                              {bank.label}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormDescription>
                    {fromBank ? (
                      <span className="text-muted-foreground">
                        {"Solde disponible : "}
                        <span className="font-medium text-secondary">
                          {XAF.format(fromBank.balance)}
                        </span>
                      </span>
                    ) : (
                      <span className="text-muted-foreground">
                        {"Sélectionnez un compte"}
                      </span>
                    )}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="@min-[640px]:col-span-2 w-full p-3 rounded-sm border grid grid-cols-1 gap-4 @min-[640px]:grid-cols-2 place-items-start">
            <h3 className="@min-[640px]:col-span-2">{"Transférer vers"}</h3>
            <FormField
              control={form.control}
              name="toBankId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel isRequired>{"Compte destinataire"}</FormLabel>
                  <FormControl>
                    <Select
                      value={!!field.value ? String(field.value) : undefined}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Sélectionner un compte" />
                      </SelectTrigger>
                      <SelectContent>
                        {banks
                          .filter(
                            (c) =>
                              c.Status === true && c.type === "CASH_REGISTER",
                          )
                          .map((bank) => (
                            <SelectItem key={bank.id} value={String(bank.id)}>
                              {bank.label}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="payments"
            render={({ field }) => (
              <FormItem>
                <FormLabel isRequired>{"Besoins"}</FormLabel>
                <FormControl>
                  <PaymentsList data={payments} value={field.value} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel isRequired>{"Montant"}</FormLabel>
                <FormControl>
                  <span className="w-full flex items-center rounded border border-input px-4 h-10 text-xl font-bold text-primary-600 select-none">
                    {XAF.format(field.value)}
                  </span>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="@min-[640px]:col-span-2 w-full inline-flex justify-end">
            <Button
              type="submit"
              variant={"primary"}
              disabled={create.isPending}
              isLoading={create.isPending}
            >
              {"Enregistrer"}
            </Button>
          </div>
        </div>
        <div className="flex flex-col border rounded bg-white overflow-hidden max-h-[70vh]">
          <div className="overflow-y-auto">
            <TableComponent>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        className="h-10 py-2 px-4 text-xs font-semibold"
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
                      className={cn(
                        "cursor-pointer transition-colors",
                        row.getIsSelected()
                          ? "bg-primary-50 hover:bg-primary-50/80"
                          : "hover:bg-gray-50",
                      )}
                      onClick={() => row.toggleSelected()}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          className="py-2 px-4"
                          onClick={(e) => {
                            if (
                              (e.target as HTMLElement).closest(
                                'button[role="checkbox"]',
                              )
                            ) {
                              e.stopPropagation();
                            }
                          }}
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
                      className="h-24 text-center text-muted-foreground"
                    >
                      Aucun besoin disponible.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </TableComponent>
          </div>
          {table.getPageCount() > 1 && (
            <div className="border-t bg-gray-50/50 mt-auto">
              <Pagination table={table} className="py-2" showPageInfo={true} />
            </div>
          )}
        </div>
      </form>
    </Form>
  );
}

export default CashRequestForm;
