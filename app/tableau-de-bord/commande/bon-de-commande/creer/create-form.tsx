"use client";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import { paymentMethods } from "@/data/payment-methods";
import { useFetchQuery } from "@/hooks/useData";
import { CreatePurchasePayload, PurchaseOrder } from "@/queries/purchase-order";
import { QuotationQueries } from "@/queries/quotation";
import { PENALITY_MODE, PURCHASE_ORDER_PRIORITIES } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

const PRIORITIES = PURCHASE_ORDER_PRIORITIES.map(s => s.value) as [
  (typeof PURCHASE_ORDER_PRIORITIES)[number]["value"],
  ...(typeof PURCHASE_ORDER_PRIORITIES)[number]["value"][]
];

export const formSchema = z
  .object({
    deviId: z.coerce.number({ message: "Veuillez définir un devis" }),
    deliveryDelay: z
    .string({ message: "Veuillez définir une date" })
    .refine(
      (val) => {
        const d = new Date(val);
        const now = new Date
        return !isNaN(d.getTime()) || d <= now;
      },
      { message: "Date invalide" }
    ),
    paymentTerms: z.string().min(1, "Ce champ est requis"),
    paymentMethod: z.string().min(1, "Ce champ est requis"),
    priority: z.enum(PRIORITIES),
    deliveryLocation: z.string().min(1, "Ce champ est requis"),

    hasPenalties: z.boolean(),
    amountBase: z.coerce.number().optional(),
    penaltyMode: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.hasPenalties) {
      if (
        data.amountBase == null ||
        Number.isNaN(data.amountBase)
      ) {
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
  const [selectDate, setSelectDate] = React.useState(false); //Popover select Date
  const quotationQuery = new QuotationQueries();
  const purchaseOrderQuery = new PurchaseOrder();

  const getQuotations = useFetchQuery(["quotations"],quotationQuery.getAll);

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
      paymentMethod: "",
    },
  });

  const {mutate, isPending} = useMutation({
    mutationFn: async(payload:CreatePurchasePayload)=>purchaseOrderQuery.create(payload),
    onSuccess: ()=>{
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
      paymentMethod: "",
    });
      
    }
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
  const quotation = getQuotations.data?.data.find(
    (q) => q.id === values.deviId
  );
  
  if (!quotation) {
    toast.error("Devis introuvable");
    return;
  }

  const ids = quotation?.commandRequest.besoins.map(b=> b.id);

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
    },
    ids: ids
  };

  mutate(payload);
}

const penalty = form.watch("hasPenalties");
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="max-w-3xl grid grid-cols-1 gap-4 @min-[560px]:grid-cols-2"
      >
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
                    {getQuotations.data && getQuotations.data.data.filter(c=>c.status ==="APPROVED").map((quote)=>(
                      <SelectItem key={quote.id} value={String(quote.id)} >
                      {quote.commandRequest.title ?? "Undefined"}
                    </SelectItem>
                    ))}
                    {
                      getQuotations.data && getQuotations.data.data.length === 0 &&
                      <SelectItem value="-" disabled>
                        {"Aucun devis disponible"}
                      </SelectItem>
                    }
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage/>
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
              <FormMessage/>
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
                  <SelectTrigger className="w-full"><SelectValue placeholder="Sélectionner"/></SelectTrigger>
                  <SelectContent>
                    {
                      paymentMethods.map(({title, value}, id)=>
                        <SelectItem key={id} value={value}>{title}</SelectItem>
                      )
                    }
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage/>
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
              <FormMessage/>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="paymentTerms"
          render={({ field }) => (
            <FormItem className="@min-[560px]:col-span-2">
              <FormLabel isRequired>{"Conditions de paiement"}</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Définissez les conditions relatives bon de commande" />
              </FormControl>
              <FormMessage/>
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
                  <SelectTrigger className="w-full"><SelectValue placeholder="Sélectionner"/></SelectTrigger>
                  <SelectContent>
                    {
                      PURCHASE_ORDER_PRIORITIES.map((priority)=>
                        <SelectItem key={priority.value} value={priority.value}>{priority.name}</SelectItem>
                      )
                    }
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage/>
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
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                  <span>{field.value ? "Oui" : "Non"}</span>
                </div>
              </FormControl>
              <FormMessage/>
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
                <Select value={field.value} onValueChange={field.onChange} disabled={!penalty}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="Sélectionner"/></SelectTrigger>
                  <SelectContent>
                    {
                      PENALITY_MODE.map((penalty)=>
                        <SelectItem key={penalty.value} value={penalty.value}>{penalty.name}</SelectItem>
                      )
                    }
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage/>
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
                <Input type="number" {...field} placeholder="Ex. 150 000" disabled={!penalty}/>
              </FormControl>
            </FormItem>
          )}
        />
        <div className="@min-[560px]:col-span-2">
          <Button type="submit" variant={"primary"} disabled={isPending} isLoading={isPending}>{"Créer le bon de commande"}</Button>
        </div>
      </form>
    </Form>
  );
}

export default CreateForm;
