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
import { PurchaseOrder } from "@/queries/purchase-order";
import { QuotationQueries } from "@/queries/quotation";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import z from "zod";

export const formSchema = z
  .object({
    devisId: z.coerce.number({ message: "Veuillez définir un devis" }),

    deliveryDueDate: z
    .string({ message: "Veuillez définir une date" })
    .refine(
      (val) => {
        const d = new Date(val);
        const now = new Date
        return !isNaN(d.getTime()) || d <= now;
      },
      { message: "Date invalide" }
    ),
    terms: z.string().min(1, "Ce champ est requis"),
    paymentMethod: z.string().min(1, "Ce champ est requis"),
    priority: z.string().min(1, "Ce champ est requis"),
    deliveryLocation: z.string().min(1, "Ce champ est requis"),

    penalities: z.boolean(),
    amountPenalities: z.coerce.number().optional(),
    penaltyMode: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.penalities) {
      if (
        data.amountPenalities == null ||
        Number.isNaN(data.amountPenalities)
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["amountPenalities"],
          message: "Veuillez renseigner le montant des pénalités",
        });
      } else if (data.amountPenalities <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["amountPenalities"],
          message: "Le montant des pénalités doit être supérieur à 0",
        });
      }
    }
  });
  
function CreateForm() {
  const [selectDate, setSelectDate] = React.useState(false); //Popover select Date
  const quotationQuery = new QuotationQueries();
  const purchaseOrderQuery = new PurchaseOrder();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      priority: "",
      terms: "",
      deliveryDueDate: new Date().toISOString().slice(0, 10),
      deliveryLocation: "",
      amountPenalities: 0,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(`Values: ${values}`);
  }
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="max-w-3xl grid grid-cols-1 gap-4 @min-[560px]:grid-cols-2"
      >
        <FormField
          control={form.control}
          name="devisId"
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
                    {}
                    <SelectItem value="-" disabled>
                      {"Aucun devis disponible"}
                    </SelectItem>
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
          name="deliveryDueDate"
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
          name="terms"
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
          name="penalities"
          render={({ field }) => (
            <FormItem>
              <FormLabel isRequired>{"Pénalités"}</FormLabel>
              <FormControl>
                <div className="flex items-center gap-2">
                  <Switch checked={field.value} onChange={field.onChange} />
                  <span>{field.value ? "Oui" : "Non"}</span>
                </div>
              </FormControl>
              <FormMessage/>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="amountPenalities"
          render={({ field }) => (
            <FormItem>
              <FormLabel isRequired>{"Montant des pénalités"}</FormLabel>
              <FormControl>
                <Input type="number" {...field} placeholder="Ex. 150 000" />
              </FormControl>
            </FormItem>
          )}
        />
        <div className="@min-[560px]:col-span-2">
          <Button type="submit" variant={"primary"}>{"Créer le bon de commande"}</Button>
        </div>
      </form>
    </Form>
  );
}

export default CreateForm;
