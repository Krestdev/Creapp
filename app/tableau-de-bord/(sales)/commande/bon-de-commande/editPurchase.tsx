"use client";
import MultiSelectConditions from "@/components/base/multiSelectConditions";
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
  FormDescription,
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
import { purchaseQ, updatePoPayload } from "@/queries/purchase-order";
import {
  BonsCommande,
  CommandCondition,
  PAYMENT_METHOD,
  PayType,
  PRIORITIES,
  Quotation,
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
  conditions: Array<CommandCondition>;
  quotations: Array<Quotation>;
  paytypes: Array<PayType>;
}

const PO_PRIORITIES = PRIORITIES.map((s) => s.value) as [
  (typeof PRIORITIES)[number]["value"],
  ...(typeof PRIORITIES)[number]["value"][],
];
const PO_METHODS = PAYMENT_METHOD.map((s) => s.value) as [
  (typeof PAYMENT_METHOD)[number]["value"],
  ...(typeof PAYMENT_METHOD)[number]["value"][],
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
        return !isNaN(d.getTime());
      },
      { message: "Date invalide" },
    )
    .optional(),
});

export const formSchema = z
  .object({
    deviId: z.coerce.number({ message: "Veuillez définir un devis" }),
    object: z
      .string()
      .max(300, { message: "Doit contenir au plus 300 caractères" })
      .optional(),
    deliveryDelay: z.string({ message: "Veuillez définir une date" }).refine(
      (val) => {
        const d = new Date(val);
        const now = new Date();
        return !isNaN(d.getTime());
      },
      { message: "Date invalide" },
    ),
    instalments: z.array(paymentSchema).refine(
      (data) => {
        const total = data.reduce(
          (sum, payment) => sum + payment.percentage,
          0,
        );
        return total === 100;
      },
      { message: "Le total des paiements doit être égal à 100%" },
    ),
    paymentTerms: z.string().optional(),
    paymentMethod: z.string(),
    priority: z.enum(PO_PRIORITIES),
    deliveryLocation: z.string().min(1, "Ce champ est requis"),

    hasPenalties: z.boolean(),
    amountBase: z.coerce.number().optional(),
    penaltyMode: z.string().optional(),
    escompteRate: z.coerce.number().min(0, "Le taux doit être positif"),
    keepTaxes: z.boolean(),
    hasPrecompt: z.boolean(),
    conditions: z
      .array(z.number())
      .min(1, "Veuillez sélectionner au moins une condition"),
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

function EditPurchase({
  open,
  openChange,
  purchaseOrder,
  conditions,
  quotations,
  paytypes,
}: Props) {
  const [selectDate, setSelectDate] = React.useState(false); //Popover select Date
  const [duePopovers, setDuePopovers] = React.useState<Record<number, boolean>>(
    {},
  );
  const [selectedConditions, setSelectedConditions] = React.useState<
    CommandCondition[]
  >(purchaseOrder.commandConditions);

  // Définir la valeur par défaut pour paymentMethod
  const defaultPaymentMethod = React.useMemo(() => {
    if (paytypes && paytypes.length > 0) {
      const purchaseOrderMethod = purchaseOrder?.paymentMethod || "";
      // Vérifier si la méthode de paiement actuelle existe dans la liste
      const exists = paytypes.some(
        (p) => p.id.toString() === purchaseOrderMethod,
      );

      if (exists) {
        return purchaseOrderMethod;
      } else {
        // Si la méthode n'existe pas, prendre la première de la liste
        return paytypes[0].id.toString();
      }
    }
    return purchaseOrder.paymentMethod || ""; // Garder la valeur existante ou vide
  }, [paytypes, purchaseOrder?.paymentMethod]);

  // Définir les échéances par défaut avec vérification
  const defaultInstalments = React.useMemo(() => {
    if (purchaseOrder.instalments && Array.isArray(purchaseOrder.instalments)) {
      return purchaseOrder.instalments.map((instalment) => ({
        percentage: instalment.percentage || 0,
        deadLine: instalment.deadLine
          ? format(new Date(instalment.deadLine), "yyyy-MM-dd")
          : undefined,
      }));
    }
    // Valeur par défaut si aucun échéancier n'existe
    return [{ percentage: 100, deadLine: undefined }];
  }, [purchaseOrder?.instalments]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      priority: purchaseOrder.priority || "medium",
      object: purchaseOrder.object || "",
      paymentTerms: purchaseOrder.paymentTerms || "",
      deliveryDelay: purchaseOrder.deliveryDelay
        ? format(new Date(purchaseOrder.deliveryDelay), "yyyy-MM-dd")
        : format(new Date(), "yyyy-MM-dd"),
      deliveryLocation: purchaseOrder?.deliveryLocation || "",
      amountBase: purchaseOrder.amountBase || 0,
      hasPenalties: purchaseOrder.hasPenalties || false,
      penaltyMode: purchaseOrder.penaltyMode || "",
      paymentMethod: defaultPaymentMethod,
      deviId: purchaseOrder.deviId || -1,
      instalments: defaultInstalments,
      escompteRate: purchaseOrder.escompteRate ?? 0,
      keepTaxes: purchaseOrder.keepTaxes ?? false,
      hasPrecompt: purchaseOrder.hasPrecompt ?? false,
      conditions: purchaseOrder.commandConditions.map((c) => c.id) ?? [],
    },
  });

  //console.log(form.formState.errors);
  //console.log(form.getValues("instalments"));

  React.useEffect(() => {
    if (open) {
      form.reset({
        priority: purchaseOrder.priority || "medium",
        object: purchaseOrder.object || "",
        paymentTerms: purchaseOrder.paymentTerms || "",
        deliveryDelay: purchaseOrder.deliveryDelay
          ? format(new Date(purchaseOrder.deliveryDelay), "yyyy-MM-dd")
          : format(new Date(), "yyyy-MM-dd"),
        deliveryLocation: purchaseOrder?.deliveryLocation || "",
        amountBase: purchaseOrder.amountBase || 0,
        hasPenalties: purchaseOrder.hasPenalties || false,
        penaltyMode: purchaseOrder.penaltyMode || "",
        paymentMethod: defaultPaymentMethod,
        deviId: purchaseOrder.deviId || -1,
        instalments: defaultInstalments,
        escompteRate: purchaseOrder.escompteRate ?? 0,
        keepTaxes: purchaseOrder.keepTaxes ?? false,
        hasPrecompt: purchaseOrder.hasPrecompt ?? false,
        conditions: purchaseOrder.commandConditions.map((c) => c.id) ?? [],
      });
    }
  }, [open]);

  // Mettre à jour les échéances de paiement lorsque les données sont chargées
  React.useEffect(() => {
    if (paytypes.length > 0) {
      const purchaseOrderMethod = purchaseOrder?.paymentMethod || "";
      const exists = paytypes.some(
        (p) => p.id.toString() === purchaseOrderMethod,
      );

      // Si la méthode de paiement actuelle n'existe pas dans la liste, la mettre à jour
      if (!exists) {
        const firstMethodId = paytypes[0].id.toString();
        form.setValue("paymentMethod", firstMethodId);
      }
    }

    // Initialiser les échéances si elles ne sont pas déjà définies
    if (
      !form.getValues("instalments") ||
      form.getValues("instalments").length === 0
    ) {
      form.setValue("instalments", defaultInstalments);
    }
  }, [paytypes, purchaseOrder?.paymentMethod, form, defaultInstalments]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "instalments",
  });

  const instalments = form.watch("instalments");
  const totalAmount = instalments.reduce(
    (sum, payment) => sum + (payment?.percentage || 0),
    0,
  ); //total amount
  const paymentsError = form.formState.errors.instalments?.root?.message;

  const { mutate, isPending } = useMutation({
    mutationFn: (payload: updatePoPayload) =>
      purchaseQ.update(payload, purchaseOrder?.id || 0),
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
      object: values.object,
      paymentMethod: values.paymentMethod,
      paymentTerms: values.paymentTerms,
      deliveryDelay: new Date(values.deliveryDelay),
      deliveryLocation: values.deliveryLocation,
      hasPenalties: values.hasPenalties,
      penaltyMode: values.penaltyMode,
      instalments: purchaseOrder.instalments,
      escompteRate: values.escompteRate,
      keepTaxes: values.keepTaxes,
      hasPrecompt: values.hasPrecompt,
    };

    mutate(payload);
  }

  const penalty = form.watch("hasPenalties");

  return (
    <Dialog open={open} onOpenChange={openChange}>
      <DialogContent className="sm:max-w-3xl">
        {/* En-tête fixe */}
        <DialogHeader variant={"secondary"}>
          <DialogTitle>{`Bon de commande - ${
            purchaseOrder?.provider?.name || "Non défini"
          }`}</DialogTitle>
          <DialogDescription>
            {"Mettre à jour les informations liées au bon de commande"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid grid-cols-1 gap-4 @min-[560px]/dialog:grid-cols-2"
            id="edit-purchase-form"
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
                        {quotations
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
                        {quotations.length === 0 && (
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
              name="object"
              render={({ field }) => (
                <FormItem className="col-span-full">
                  <FormLabel>Objet</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Objet" {...field} />
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
                        {paytypes.map((p) => (
                          <SelectItem key={p.id} value={p.id.toString()}>
                            {p.label}
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
            {/* <FormField
              control={form.control}
              name="keepTaxes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{"Retenir à la source"}</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      <span>{field.value ? "Oui" : "Non"}</span>
                    </div>
                  </FormControl>
                  <FormDescription>
                    {
                      "Cocher si vous souhaitez retenir les taxes à la source sur ce bon de commande"
                    }
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            /> */}
            <FormField
              control={form.control}
              name="hasPrecompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{"Précompte"}</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      <span>{field.value ? "Oui" : "Non"}</span>
                    </div>
                  </FormControl>
                  <FormDescription>
                    {
                      "Cocher si vous souhaitez ajouter le précompte sur ce bon de commande"
                    }
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="escompteRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{"Escompte"}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="number"
                        {...field}
                        placeholder="Ex. 2"
                        className="pr-8"
                      />
                      <span className="absolute top-1/2 right-2 -translate-y-1/2 text-sm text-primary-600 uppercase">
                        {"%"}
                      </span>
                    </div>
                  </FormControl>
                  <FormDescription>
                    {"Laissez à 0 si aucun escompte"}
                  </FormDescription>
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
                {"Ajouter une échéance"}
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
            <div className="col-span-2 w-full space-y-2">
              <FormLabel isRequired>
                {"Conditions du bon de commande"}
              </FormLabel>
              <MultiSelectConditions
                display="Conditions"
                conditions={conditions}
                selected={selectedConditions}
                onChange={(selected) => {
                  setSelectedConditions(selected);
                  form.setValue(
                    "conditions",
                    selected.map((r) => r.id),
                  );
                }}
              />
              <FormMessage />
            </div>
            <FormField
              control={form.control}
              name="paymentTerms"
              render={({ field }) => (
                <FormItem className="@min-[560px]/dialog:col-span-2">
                  <FormLabel>{"Conditions supplémentaires"}</FormLabel>
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
            {/* <FormField
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
                            <SelectItem
                              key={penalty.value}
                              value={penalty.value}
                            >
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
                    <FormMessage />
                  </FormItem>
                )}
              /> */}
          </form>
        </Form>
        {/* Pied de page fixe avec boutons */}
        <DialogFooter>
          <div className="flex gap-3 w-full justify-end">
            <Button
              type="submit"
              form="edit-purchase-form"
              variant={"primary"}
              disabled={isPending}
              isLoading={isPending}
            >
              {"Modifier"}
            </Button>
            <DialogClose asChild>
              <Button variant={"outline"}>{"Annuler"}</Button>
            </DialogClose>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default EditPurchase;
