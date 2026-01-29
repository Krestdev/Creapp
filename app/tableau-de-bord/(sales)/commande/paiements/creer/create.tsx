//Paiement Form
"use client";
import FilesUpload from "@/components/comp-547";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { totalAmountPurchase, XAF } from "@/lib/utils";
import { useStore } from "@/providers/datastore";
import { NewPayment, paymentQ } from "@/queries/payment";
import { payTypeQ } from "@/queries/payType";
import { BonsCommande, PaymentRequest, PRIORITIES } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { SelectValue } from "@radix-ui/react-select";
import { useMutation, useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

const PAY_PRIORITY = PRIORITIES.map((m) => m.value) as [
  (typeof PRIORITIES)[number]["value"],
  ...(typeof PRIORITIES)[number]["value"][],
];

const formSchema = z.object({
  commandId: z.number({ message: "Requis" }),
  deadline: z.string({ message: "Veuillez définir une date" }).refine(
    (val) => {
      const d = new Date(val);
      return !isNaN(d.getTime());
    },
    { message: "Date invalide" },
  ),
  isPartial: z.boolean(),
  price: z.number({ message: "Veuillez renseigner un montant" }),
  method: z.string().min(1, "Ce champ est requis"),
  priority: z.enum(PAY_PRIORITY),
  proof: z
    .array(
      z.union([
        z.instanceof(File, { message: "Doit être un fichier valide" }),
        z.string(),
      ]),
    )
    .min(1, "Veuillez ajouter un élément")
    .max(1, "Un seul justificatif autorisé"),
});

type FormValues = z.infer<typeof formSchema>;

interface Props {
  purchases: Array<BonsCommande>;
  payments: Array<PaymentRequest>;
}

function CreatePaiement({ purchases, payments }: Props) {
  /**Data states */
  const { user } = useStore();

  const router = useRouter();

  const [dueDate, setDueDate] = React.useState<boolean>(false);
  const today = new Date(); //On part sur 3 jours de delai de base :)
  today.setDate(today.getDate() + 3);

  const getPaymentType = useQuery({
    queryKey: ["paymentType"],
    queryFn: payTypeQ.getAll,
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      commandId: undefined,
      deadline: format(new Date(), "yyyy-MM-dd"),
      isPartial: false,
      price: 0,
      method: "",
      priority: "high",
      proof: [],
    },
  });

  const commandId = form.watch("commandId");
  const isPartial = form.watch("isPartial");
  const methodValue = form.watch("method");

  const createPayment = useMutation({
    mutationFn: async (
      payload: Omit<NewPayment, "vehiclesId" | "bankId" | "transactionId">,
    ) => paymentQ.new(payload),
    onSuccess: () => {
      toast.success("Votre paiement a été initié avec succès !");
      router.push("./");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Initialiser la valeur par défaut quand les données sont chargées
  React.useEffect(() => {
    if (getPaymentType.data?.data && getPaymentType.data.data.length > 0) {
      const firstMethodId = getPaymentType.data.data[0].id.toString();

      // Définir la valeur seulement si elle est vide
      if (!methodValue || methodValue.trim() === "") {
        form.setValue("method", firstMethodId);
      }
    }
  }, [getPaymentType.data, methodValue, form]);

   const purchase = React.useMemo(()=>{
    return purchases.find(p=> p.id === commandId)
  },[purchases, commandId]);

  const toPay = purchase && purchase.netToPay - payments.filter(p=>p.commandId === purchase?.id && p.status !== "rejected" && p.status !== "cancelled").reduce((total, e)=> total + e.price, 0);

  const rest = !!toPay && toPay >= 0 ? toPay : 0;

  useEffect(() => {
    if (!!commandId) {
      if (!purchase) {
        toast.error("Bon de commande invalide");
        return form.setError("commandId", {
          message: "Bon de commande invalide",
        });
      }
      form.setValue("price", rest);
    }
  }, [commandId]);

  function onSubmit(values: FormValues) {
    // Validation supplémentaire pour le moyen de paiement
    if (!values.method || values.method.trim() === "") {
      toast.error("Veuillez sélectionner un moyen de paiement");
      return;
    }

    const purchase = purchases.find((p) => p.id === values.commandId);
    if (!purchase) {
      form.setError("commandId", { message: "Bon de commande invalide" });
      return toast.error("Bon de commande invalide");
    }
    if (!(values.proof[0] instanceof File)) {
      return toast.error("La preuve doit être un fichier");
    }
    if (!values.isPartial && values.price !== totalAmountPurchase(purchase)) {
      toast.error("Montant incorrect !");
      return form.setError("price", {
        message:
          "Le montant doit être égale au montant total du Bon de commande",
      });
    }
    if (
      (values.isPartial && values.price >= totalAmountPurchase(purchase)) ||
      (!values.isPartial && values.price > totalAmountPurchase(purchase))
    ) {
      toast.error("Montant invalide !");
      return form.setError("price", {
        message:
          "Votre montant est supérieur ou égal au montant total du bon de commande",
      });
    }
    if(values.price > rest) {
      toast.error("Montant invalide !");
      return form.setError("price", { message: "Votre montant est supérieur au reste à payer"})
    }
    const payload: Omit<NewPayment, "vehiclesId" | "bankId" | "transactionId"> =
    {
      methodId: Number(values.method),
      type: "achat",
      deadline: new Date(values.deadline),
      title: purchase.devi.commandRequest.title,
      price: values.price,
      priority: values.priority,
      userId: user?.id ?? 0,
      proof: values.proof[0],
      commandId: values.commandId,
      isPartial: values.isPartial,
    };
    createPayment.mutate(payload);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="form-3xl">
        {/* Bon de commande */}
        <FormField
          control={form.control}
          name="commandId"
          render={({ field }) => (
            <FormItem>
              <FormLabel isRequired>{"Bon de commande"}</FormLabel>
              <FormControl>
                <Select
                  defaultValue={field.value ? String(field.value) : undefined}
                  onValueChange={(v) => field.onChange(Number(v))}
                >
                  <SelectTrigger className="min-w-60 w-full">
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    {purchases.length === 0 ? (
                      <SelectItem value="no-option" disabled>
                        {"Aucune demande enregistrée"}
                      </SelectItem>
                    ) : (
                      purchases.filter(p => p.status === "APPROVED").map((request) => {
                        const pay = React.useMemo(() => {
                          return payments
                            ?.filter(
                              (payment) => payment.commandId === request.id,
                            )
                            .filter((c) => c.status !== "rejected" && c.status !== "cancelled");
                        }, [payments, request]);
                        const paid =
                          pay
                            ?.flatMap((x) => x.price)
                            .reduce((a, b) => a + b, 0) ?? 0;
                        const total = totalAmountPurchase(request);

                        const diff = total - paid;
                        return (
                          diff > 0 && (
                            <SelectItem
                              key={request.id}
                              value={String(request.id)}
                            >
                              {request.devi.commandRequest.title +
                                " - " +
                                request.provider.name}
                            </SelectItem>
                          )
                        );
                      })
                    )}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Date limite de soumission */}
        <FormField
          control={form.control}
          name="deadline"
          render={({ field }) => {
            // Convertir la valeur string en Date pour le calendrier
            const selectedDate = field.value
              ? new Date(field.value)
              : undefined;

            return (
              <FormItem>
                <FormLabel isRequired>{"Delai de paiement"}</FormLabel>
                <FormControl>
                  <div className="relative flex gap-2">
                    <Input
                      id={field.name}
                      value={field.value || ""}
                      placeholder="Sélectionner une date"
                      className="bg-background pr-10"
                      onChange={(e) => {
                        field.onChange(e.target.value);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "ArrowDown") {
                          e.preventDefault();
                          setDueDate(true);
                        }
                      }}
                    />
                    <Popover open={dueDate} onOpenChange={setDueDate}>
                      <PopoverTrigger asChild>
                        <Button
                          id="date-picker"
                          type="button"
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
                          selected={selectedDate}
                          defaultMonth={selectedDate || today}
                          captionLayout="dropdown"
                          onSelect={(date) => {
                            if (!date) return;
                            const value = format(date, "yyyy-MM-dd");
                            field.onChange(value);
                            setDueDate(false);
                          }}
                          disabled={(date)=> date < new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />

        {/* is Partial */}
        {/* Paiement partiel */}
        <FormField
          control={form.control}
          name="isPartial"
          render={({ field }) => (
            <FormItem>
              <FormLabel isRequired>{"Paiement partiel"}</FormLabel>
              <FormControl>
                <div className="flex items-center space-x-2 h-10">
                  <Switch
                    id="isPartial"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                  <Label htmlFor="isPartial">
                    {"Le montant est-il partiel ? " +
                      (field.value ? "Oui" : "Non")}
                  </Label>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Montant */}
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => {
            return (
              <FormItem>
                <FormLabel isRequired>
                  {"Montant"}
                  <span className="text-xs text-red-500">
                    {`(Reste à payer : ${XAF.format(rest)})`}
                  </span>
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type="number"
                      disabled={!isPartial}
                      value={field.value}
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(Number(value));
                      }}
                      className="pr-12"
                    />
                    <p className="absolute right-2 top-1/2 -translate-y-1/2">
                      {"FCFA"}
                    </p>
                  </div>
                </FormControl>
                {!!commandId && 
                <div className="grid gap-1.5">
                  {!!purchase && purchase.instalments.map((e, id)=>(
                    <div key={id} className="text-sm text-gray-400">{`Echéance ${id+1}: ${XAF.format(e.percentage*purchase.netToPay/100)} ${!!e.deadLine && `avant le ${format(new Date(e.deadLine), "dd MMMM yyyy", {locale: fr})}`}`}</div>
                  ))}
                </div>
                  }
                <FormMessage />
              </FormItem>
            );
          }}
        />

        {/* Moyen de paiement - CORRIGÉ */}
        <FormField
          control={form.control}
          name="method"
          render={({ field }) => {
            const paymentMethods = getPaymentType.data?.data || [];

            return (
              <FormItem>
                <FormLabel isRequired>{"Moyen de paiement"}</FormLabel>
                <FormControl>
                  {paymentMethods.length === 0 ? (
                    <div className="text-sm text-muted-foreground p-2 border rounded-md bg-muted">
                      Chargement des moyens de paiement...
                    </div>
                  ) : (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="min-w-60 w-full">
                        <SelectValue placeholder="Sélectionner">
                          {paymentMethods.find(
                            (method) => String(method.id) === field.value,
                          )?.label || "Sélectionner"}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {paymentMethods.map((method) => (
                          <SelectItem key={method.id} value={String(method.id)}>
                            {method.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />

        {/* Priorité */}
        <FormField
          control={form.control}
          name="priority"
          render={({ field }) => (
            <FormItem>
              <FormLabel isRequired>{"Priorité"}</FormLabel>
              <FormControl>
                <Select
                  defaultValue={field.value ? String(field.value) : undefined}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger className="min-w-60 w-full">
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

        {/* Justificatif */}
        <FormField
          control={form.control}
          name="proof"
          render={({ field }) => (
            <FormItem className="@min-[640px]:col-span-2">
              <FormLabel isRequired>{"Justificatif"}</FormLabel>
              <FormControl>
                <FilesUpload
                  value={field.value}
                  onChange={field.onChange}
                  name={field.name}
                  acceptTypes="images"
                  multiple={false}
                  maxFiles={1}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="@min-[640px]:col-span-2 w-full flex justify-end">
          <Button
            type="submit"
            className="w-fit"
            variant={"primary"}
            disabled={
              createPayment.isPending || !getPaymentType.data?.data?.length
            }
            isLoading={createPayment.isPending}
          >
            {"Créer le paiement"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default CreatePaiement;
