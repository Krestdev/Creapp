"use client";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import { formatToShortName, isProviderValid } from "@/lib/utils";
import { payTypeQ } from "@/queries/payType";
import { providerQ } from "@/queries/providers";
import { CreatePurchasePayload, purchaseQ } from "@/queries/purchase-order";
import { quotationQ } from "@/queries/quotation";
import { PENALITY_MODE, PRIORITIES } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { CalendarIcon, Plus, Trash2 } from "lucide-react";
import React from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

const PO_PRIORITIES = PRIORITIES.map((s) => s.value) as [
  (typeof PRIORITIES)[number]["value"],
  ...(typeof PRIORITIES)[number]["value"][],
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
      { message: "Date invalide" },
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
        return !isNaN(d.getTime()) && d >= now;
      },
      { message: "Date invalide" },
    ),
    paymentTerms: z.string().min(1, "Ce champ est requis"),
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
    paymentMethod: z.string().min(1, "Ce champ est requis"),
    priority: z.enum(PO_PRIORITIES),
    deliveryLocation: z.string().min(1, "Ce champ est requis"),

    hasPenalties: z.boolean(),
    amountBase: z.coerce.number().optional(),
    penaltyMode: z.string().optional(),
    rabaisAmount: z.coerce.number().min(0, "Le montant doit être positif"),
    remiseAmount: z.coerce.number().min(0, "Le montant doit être positif"),
    ristourneAmount: z.coerce.number().min(0, "Le montant doit être positif"),
    escompteRate: z.coerce.number().min(0, "Le taux doit être positif"),
    keepTaxes: z.boolean(),
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

function CreateForm() {
  const [selectDate, setSelectDate] = React.useState(false);
  const [duePopovers, setDuePopovers] = React.useState<Record<number, boolean>>(
    {},
  );

  const getQuotations = useQuery({
    queryKey: ["quotations"],
    queryFn: quotationQ.getAll,
  });
  const getProviders = useQuery({
    queryKey: ["providers"],
    queryFn: providerQ.getAll,
  });
  const getPurchases = useQuery({
    queryKey: ["purchaseOrders"],
    queryFn: purchaseQ.getAll,
  });
  const getPaymentType = useQuery({
    queryKey: ["paymentType"],
    queryFn: payTypeQ.getAll,
  });

  // Définir la valeur par défaut pour paymentMethod
  const defaultPaymentMethod = React.useMemo(() => {
    if (getPaymentType.data?.data && getPaymentType.data.data.length > 0) {
      return getPaymentType.data.data[0].id.toString();
    }
    return "bank-transfer"; // Valeur par défaut de fallback
  }, [getPaymentType.data]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      priority: "medium",
      paymentTerms: "",
      deliveryDelay: format(new Date(), "yyyy-MM-dd"),
      deliveryLocation: "",
      amountBase: 0,
      hasPenalties: false,
      penaltyMode: "",
      instalments: [{ percentage: 100, deadLine: undefined }],
      paymentMethod: defaultPaymentMethod,
      rabaisAmount: 0,
      remiseAmount: 0,
      ristourneAmount: 0,
      escompteRate: 0,
      keepTaxes: false,
    },
  });

  // Mettre à jour la valeur de paymentMethod lorsque les données sont chargées
  React.useEffect(() => {
    if (getPaymentType.data?.data && getPaymentType.data.data.length > 0) {
      const firstMethodId = getPaymentType.data.data[0].id.toString();

      // Définir la valeur seulement si elle est vide ou si c'est la valeur de fallback
      const currentValue = form.getValues("paymentMethod");
      if (!currentValue || currentValue === "bank-transfer") {
        form.setValue("paymentMethod", firstMethodId);
      }
    }
  }, [getPaymentType.data, form]);

  const methodValue = form.watch("paymentMethod");

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "instalments",
  });

  const instalments = form.watch("instalments");
  const totalAmount = instalments.reduce(
    (sum, payment) => sum + payment.percentage,
    0,
  ); //total amount
  const paymentsError = form.formState.errors.instalments?.root?.message;

  const { mutate, isPending } = useMutation({
    mutationFn: (payload: CreatePurchasePayload) => purchaseQ.create(payload),
    onSuccess: () => {
      toast.success("Votre Bon de Commande a été créé avec succès !");
      form.reset({
        priority: "medium",
        deviId: -1,
        paymentTerms: "",
        deliveryDelay: format(new Date(), "yyyy-MM-dd"),
        deliveryLocation: "",
        amountBase: 0,
        hasPenalties: false,
        penaltyMode: "",
        instalments: [{ percentage: 100, deadLine: undefined }],
        paymentMethod: defaultPaymentMethod,
        rabaisAmount: 0,
        remiseAmount: 0,
        ristourneAmount: 0,
        escompteRate: 0,
        keepTaxes: false,
      });
    },
    onError: (error: Error) => {
      toast.error(error.message ?? "Une erreur est survenue");
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const quotation = getQuotations.data?.data.find(
      (q) => q.id === values.deviId,
    );

    if (!quotation) {
      toast.error("Devis introuvable");
      return;
    }
    const provider = getProviders.data?.data.find(
      (p) => p.id === quotation.providerId,
    );
    const result = provider ? isProviderValid(provider) : false;

    if (!result) {
      toast.error(
        "Fournisseur Invalide ! Veuillez compléter les informations relatives au fournisseurs",
      );
      return;
    }

    const ids = quotation?.commandRequest.besoins.map((b) => b.id);

    const payload: CreatePurchasePayload = {
      command: {
        deviId: values.deviId,
        providerId: quotation.providerId,
        amountBase: values.amountBase ?? 0,
        priority: values.priority,
        paymentMethod: values.paymentMethod,
        paymentTerms: values.paymentTerms,
        deliveryDelay: new Date(values.deliveryDelay),
        deliveryLocation: values.deliveryLocation,
        hasPenalties: values.hasPenalties,
        penaltyMode: values.penaltyMode,
        instalments: values.instalments.map((instalment) => ({
          percentage: instalment.percentage,
          deadLine: instalment.deadLine
            ? new Date(instalment.deadLine)
            : undefined,
        })),
        rabaisAmount: values.rabaisAmount,
        remiseAmount: values.remiseAmount,
        ristourneAmount: values.ristourneAmount,
        escompteRate: values.escompteRate,
        keepTaxes: values.keepTaxes,
      },
      ids: ids,
    };

    mutate(payload);
  }

  const penalty = form.watch("hasPenalties");
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="form-3xl">
        <FormField
          control={form.control}
          name="deviId"
          render={({ field }) => (
            <FormItem>
              <FormLabel isRequired>{"Devis"}</FormLabel>
              <FormControl>
                <Select
                  value={field.value ? String(field.value) : undefined}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    {getQuotations.isSuccess &&
                      getPurchases.isSuccess &&
                      getQuotations.data.data
                        .filter(
                          (c) =>
                            c.status === "APPROVED" &&
                            !getPurchases.data.data.some(
                              (a) => a.deviId === c.id,
                            ),
                        )
                        .map((quote) => (
                          <SelectItem
                            key={quote.id}
                            value={String(quote.id)}
                            className="line-clamp-1"
                          >
                            {`${
                              quote.commandRequest.title
                            } - ${formatToShortName(
                              getProviders.data?.data.find(
                                (p) => p.id === quote.providerId,
                              )?.name,
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
                    {getPaymentType.data?.data.map((p) => (
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
        <FormField
          control={form.control}
          name="rabaisAmount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{"Rabais"}</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type="number"
                    {...field}
                    placeholder="Ex. 3"
                    className="pr-8"
                  />
                  <span className="absolute top-1/2 right-2 -translate-y-1/2 text-sm text-primary-600 uppercase">{"%"}</span>
                </div>
              </FormControl>
              <FormMessage/>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="ristourneAmount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{"Ristourne"}</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type="number"
                    {...field}
                    placeholder="Ex. 3"
                    className="pr-8"
                  />
                  <span className="absolute top-1/2 right-2 -translate-y-1/2 text-sm text-primary-600 uppercase">{"%"}</span>
                </div>
              </FormControl>
              <FormMessage/>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="remiseAmount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{"Remise"}</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type="number"
                    {...field}
                    placeholder="Ex. 5"
                    className="pr-8"
                  />
                  <span className="absolute top-1/2 right-2 -translate-y-1/2 text-sm text-primary-600 uppercase">{"%"}</span>
                </div>
              </FormControl>
              <FormMessage/>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="keepTaxes"
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
                  <span className="absolute top-1/2 right-2 -translate-y-1/2 text-sm text-primary-600 uppercase">{"%"}</span>
                </div>
              </FormControl>
              <FormDescription>{"Laissez à 0 si aucun escompte"}</FormDescription>
              <FormMessage/>
            </FormItem>
          )}
        />
        <div className="w-full @min-[560px]:col-span-2 grid gap-3">
          <div className="flex items-center justify-between">
            <FormLabel isRequired>{"Échelonnement des paiements"}</FormLabel>
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
                              setDuePopovers((p) => ({ ...p, [index]: open }))
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
            <FormItem className="@min-[560px]:col-span-2">
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
                      <SelectItem key={priority.value} value={priority.value}>
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
                <div className="relative">
                  <Input
                    type="number"
                    {...field}
                    placeholder="Ex. 150 000"
                    disabled={!penalty}
                    className="pr-12"
                  />
                  <span className="absolute top-1/2 right-2 -translate-y-1/2 text-sm text-primary-600 uppercase">{"FCFA"}</span>
                </div>
              </FormControl>
              <FormMessage/>
            </FormItem>
          )}
        />
        <div className="@min-[560px]:col-span-2">
          <Button
            type="submit"
            variant={"primary"}
            disabled={isPending}
            isLoading={isPending}
          >
            {"Créer le bon de commande"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default CreateForm;
