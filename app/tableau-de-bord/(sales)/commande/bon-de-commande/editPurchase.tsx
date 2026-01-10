"use client";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useFetchQuery } from "@/hooks/useData";
import { formatToShortName } from "@/lib/utils";
import { providerQ } from "@/queries/providers";
import { purchaseQ, updatePoPayload } from "@/queries/purchase-order";
import { quotationQ } from "@/queries/quotation";
import {
  BonsCommande,
  PAYMENT_METHOD,
  PENALITY_MODE,
  PRIORITIES,
} from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { CalendarIcon, Plus, Trash2 } from "lucide-react";
import React from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

interface Props {
  open: boolean;
  openChange: React.Dispatch<React.SetStateAction<boolean>>;
  purchaseOrder: BonsCommande;
}

const PO_PRIORITIES = PRIORITIES.map((s) => s.value) as [
  (typeof PRIORITIES)[number]["value"],
  ...(typeof PRIORITIES)[number]["value"][]
];
const PO_METHODS = PAYMENT_METHOD.map((s) => s.value) as [
  (typeof PAYMENT_METHOD)[number]["value"],
  ...(typeof PAYMENT_METHOD)[number]["value"][]
];

const paymentSchema = z.object({
  percentage: z.coerce
    .number({ message: "Valeur invalide" })
    .refine((val) => val <= 100 && val > 0, {
      message: "Doit être entre 0 et 100",
    }),
  deadLine: z
    .string()
    .refine(
      (val) => {
        const d = new Date(val);
        const now = new Date();
        return !isNaN(d.getTime()) && d >= now;
      },
      { message: "Date invalide" }
    )
    .optional(),
});

export const formSchema = z
  .object({
    deviId: z.coerce.number({ message: "Veuillez définir un devis" }),
    deliveryDelay: z.string({ message: "Veuillez définir une date" }).refine(
      (val) => {
        const d = new Date(val);
        const now = new Date();
        return !isNaN(d.getTime()) || d <= now;
      },
      { message: "Date invalide" }
    ),
    instalments: z.array(paymentSchema).refine(
      (data) => {
        const total = data.reduce(
          (sum, payment) => sum + payment.percentage,
          0
        );
        return total === 100;
      },
      { message: "Le total des paiements doit être égal à 100%" }
    ),
    paymentTerms: z.string().min(1, "Ce champ est requis"),
    paymentMethod: z.enum(PO_METHODS),
    priority: z.enum(PO_PRIORITIES),
    deliveryLocation: z.string().min(1, "Ce champ est requis"),

    hasPenalties: z.boolean(),
    amountBase: z.coerce.number().optional(),
    penaltyMode: z.string().optional(),
    providerId: z.coerce.number({ message: "Veuillez définir un fournisseur" }),
  })
  .superRefine((data, ctx) => {
    if (data.hasPenalties) {
      if (data.amountBase == null || Number.isNaN(data.amountBase)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["amountBase"],
          message: "Veuillez renseigner le montant des pénalités",
        });
      } else if (data.amountBase <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["amountBase"],
          message: "Le montant des pénalités doit être supérieur à 0",
        });
      }
    }
  });

function EditPurchase({ open, openChange, purchaseOrder }: Props) {
  const [selectDate, setSelectDate] = React.useState(false); //Popover select Date
  const [duePopovers, setDuePopovers] = React.useState<Record<number, boolean>>(
    {}
  );

  const getQuotations = useFetchQuery(["quotations"], quotationQ.getAll);
  const getProviders = useFetchQuery(["providers"], providerQ.getAll);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      priority: purchaseOrder.priority,
      paymentTerms: purchaseOrder.paymentTerms,
      deliveryDelay: format(
        new Date(purchaseOrder.deliveryDelay),
        "yyyy-MM-dd"
      ),
      deliveryLocation: purchaseOrder.deliveryLocation,
      amountBase: purchaseOrder.amountBase,
      hasPenalties: purchaseOrder.hasPenalties,
      penaltyMode: purchaseOrder.penaltyMode,
      paymentMethod: purchaseOrder.paymentMethod,
      deviId: purchaseOrder.deviId,
      providerId: purchaseOrder.providerId,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "instalments",
  });

  const instalments = form.watch("instalments");
  const totalAmount = instalments.reduce(
    (sum, payment) => sum + payment.percentage,
    0
  ); //total amount
  const paymentsError = form.formState.errors.instalments?.root?.message;

  const { mutate, isPending } = useMutation({
    mutationFn: (payload: updatePoPayload) =>
      purchaseQ.update(payload, purchaseOrder.id),
    onSuccess: () => {
      toast.success("Votre Bon de Commande a été mis à jour avec succès !");
      openChange(false);
    },
    onError: (error: Error) => {
      toast.error(error.message ?? "Une erreur est survenue");
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const payload: updatePoPayload = {
      amountBase: values.amountBase ?? 0,
      priority: values.priority,
      paymentMethod: values.paymentMethod,
      paymentTerms: values.paymentTerms,
      deliveryDelay: new Date(values.deliveryDelay),
      deliveryLocation: values.deliveryLocation,
      hasPenalties: values.hasPenalties,
      penaltyMode: values.penaltyMode,
      instalments: purchaseOrder.instalments,
    };

    mutate(payload);
  }

  const penalty = form.watch("hasPenalties");
  return (
    <Dialog open={open} onOpenChange={openChange}>
      <DialogContent className="sm:max-w-4xl! sm:w-[90%]">
        <DialogHeader variant={"secondary"}>
          <DialogTitle>{`Bon de commande - ${purchaseOrder.provider.name}`}</DialogTitle>
          <DialogDescription>
            {"Mettre à jour les informations liées au bon de commande"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid grid-cols-1 gap-4 @min-[560px]/dialog:grid-cols-2"
          >
            <FormField
              control={form.control}
              name="deviId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{"Devis"}</FormLabel>
                  <FormControl>
                    <Select
                      value={String(field.value)}
                      onValueChange={field.onChange}
                      disabled
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        {getQuotations.data &&
                          getQuotations.data.data
                            .filter((c) => c.status === "APPROVED")
                            .map((quote) => (
                              <SelectItem
                                key={quote.id}
                                value={String(quote.id)}
                                className="line-clamp-1"
                              >
                                {`${quote.commandRequest.title}`}
                              </SelectItem>
                            ))}
                        {getQuotations.data &&
                          getQuotations.data.data.length === 0 && (
                            <SelectItem value="-" disabled>
                              {"Aucun devis disponible"}
                            </SelectItem>
                          )}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="providerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{"Fournisseur"}</FormLabel>
                  <FormControl>
                    <Select
                      value={String(field.value)}
                      onValueChange={field.onChange}
                      disabled
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        {getQuotations.data &&
                          getQuotations.data.data
                            .filter((c) => c.status === "APPROVED")
                            .map((quote) => (
                              <SelectItem
                                key={quote.id}
                                value={String(quote.id)}
                                className="line-clamp-1"
                              >
                                {`${formatToShortName(
                                  getProviders.data?.data.find(
                                    (p) => p.id === quote.providerId
                                  )?.name
                                )}`}
                              </SelectItem>
                            ))}
                        {getQuotations.data &&
                          getQuotations.data.data.length === 0 && (
                            <SelectItem value="-" disabled>
                              {"Aucun devis disponible"}
                            </SelectItem>
                          )}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="deliveryLocation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel isRequired>{"Lieu de livraison"}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ex. Creaconsult" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel isRequired>{"Moyen de Paiement"}</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        {PAYMENT_METHOD.map(({ name, value }, id) => (
                          <SelectItem key={id} value={value}>
                            {name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="deliveryDelay"
              render={({ field }) => (
                <FormItem>
                  <FormLabel isRequired>{"Date limite de livraison"}</FormLabel>
                  <FormControl>
                    <div className="relative flex gap-2">
                      <Input
                        id={field.name}
                        value={field.value}
                        placeholder="Sélectionner une date"
                        className="bg-background pr-10"
                        onChange={(e) => {
                          field.onChange(e.target.value);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "ArrowDown") {
                            e.preventDefault();
                            setSelectDate(true);
                          }
                        }}
                      />
                      <Popover open={selectDate} onOpenChange={setSelectDate}>
                        <PopoverTrigger asChild>
                          <Button
                            id="date-picker"
                            variant="ghost"
                            className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
                          >
                            <CalendarIcon className="size-3.5" />
                            <span className="sr-only">
                              {"Sélectionner une date"}
                            </span>
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-auto overflow-hidden p-0"
                          align="end"
                          alignOffset={-8}
                          sideOffset={10}
                        >
                          <Calendar
                            mode="single"
                            selected={
                              field.value ? new Date(field.value) : undefined
                            }
                            captionLayout="dropdown"
                            onSelect={(date) => {
                              if (!date) return;
                              const value = date.toISOString().slice(0, 10); // "YYYY-MM-DD"
                              field.onChange(value);
                              setSelectDate(false);
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="w-full @min-[560px]:col-span-2 grid gap-3">
              <div className="flex items-center justify-between">
                <FormLabel isRequired>
                  {"Échelonnement des paiements"}
                </FormLabel>
                <div className="text-sm text-muted-foreground">
                  {"Total: "}
                  <span
                    className={
                      totalAmount === 100
                        ? "text-green-600 font-medium"
                        : "text-red-600 font-medium"
                    }
                  >{`${totalAmount}%`}</span>
                </div>
              </div>

              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="p-4 rounded-md border grid grid-cols-1 @min-[560px]:grid-cols-2 gap-3 place-items-start"
                  >
                    <FormField
                      control={form.control}
                      name={`instalments.${index}.percentage`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{"Montant (%)"}</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              placeholder="Ex. 30"
                              disabled
                              onChange={(e) => {
                                const value =
                                  e.target.value === ""
                                    ? 0
                                    : parseFloat(e.target.value);
                                field.onChange(value);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`instalments.${index}.deadLine`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{`Date d'échéance (optionnel)`}</FormLabel>
                          <FormControl>
                            <div className="relative flex gap-2">
                              <Input
                                id={field.name}
                                value={field.value}
                                placeholder="Sélectionner une date"
                                className="bg-background pr-10"
                                disabled
                                onChange={(e) => {
                                  field.onChange(e.target.value);
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "ArrowDown") {
                                    e.preventDefault();
                                    setDuePopovers((p) => ({
                                      ...p,
                                      [index]: true,
                                    }));
                                  }
                                }}
                              />
                              <Popover
                                open={!!duePopovers[index]}
                                onOpenChange={(open) =>
                                  setDuePopovers((p) => ({
                                    ...p,
                                    [index]: open,
                                  }))
                                }
                              >
                                <PopoverTrigger asChild>
                                  <Button
                                    id="date-picker"
                                    variant="ghost"
                                    className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
                                  >
                                    <CalendarIcon className="size-3.5" />
                                    <span className="sr-only">
                                      {"Sélectionner une date"}
                                    </span>
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent
                                  className="w-auto overflow-hidden p-0"
                                  align="end"
                                  alignOffset={-8}
                                  sideOffset={10}
                                >
                                  <Calendar
                                    mode="single"
                                    selected={
                                      field.value
                                        ? new Date(field.value)
                                        : undefined
                                    }
                                    captionLayout="dropdown"
                                    onSelect={(date) => {
                                      if (!date) return;
                                      const value = format(date, "yyyy-MM-dd");
                                      field.onChange(value);
                                      setSelectDate(false);
                                    }}
                                  />
                                </PopoverContent>
                              </Popover>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="delete"
                        size="icon"
                        onClick={() => remove(index)}
                        disabled
                      >
                        <Trash2 />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={() => append({ percentage: 0, deadLine: undefined })}
                disabled
              >
                <Plus />
                {"Ajouter un paiement"}
              </Button>

              <div className="text-sm text-muted-foreground">
                <p className="mt-2">
                  <strong>{"Note : "}</strong>
                  {"La somme de tous les paiements doit être égale à 100%."}
                  {totalAmount !== 100 && (
                    <span className="text-destructive ml-2">
                      {`Total actuel: ${totalAmount}% (il manque ${
                        100 - totalAmount
                      }%)`}
                    </span>
                  )}
                </p>
                {paymentsError && (
                  <p className="text-sm font-medium text-destructive">
                    {paymentsError}
                  </p>
                )}
              </div>
            </div>
            <FormField
              control={form.control}
              name="paymentTerms"
              render={({ field }) => (
                <FormItem className="@min-[560px]/dialog:col-span-2">
                  <FormLabel isRequired>{"Conditions de paiement"}</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Définissez les conditions relatives bon de commande"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel isRequired>{"Priorité"}</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        {PRIORITIES.map((priority) => (
                          <SelectItem
                            key={priority.value}
                            value={priority.value}
                          >
                            {priority.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="hasPenalties"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{"Pénalités"}</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      <span>{field.value ? "Oui" : "Non"}</span>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="penaltyMode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{"Mode de pénalité"}</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={!penalty}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        {PENALITY_MODE.map((penalty) => (
                          <SelectItem key={penalty.value} value={penalty.value}>
                            {penalty.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amountBase"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{"Montant des pénalités"}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      placeholder="Ex. 150 000"
                      disabled={!penalty}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <DialogFooter className="@min-[560px]/dialog:col-span-2">
              <Button
                type="submit"
                variant={"primary"}
                disabled={isPending}
                isLoading={isPending}
              >
                {"Modifier"}
              </Button>
              <DialogClose asChild>
                <Button variant={"outline"}>{"Annuler"}</Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default EditPurchase;
