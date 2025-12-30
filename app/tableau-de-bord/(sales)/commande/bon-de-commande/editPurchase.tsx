'use client'
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
import { formatToShortName } from "@/lib/utils";
import { ProviderQueries } from "@/queries/providers";
import { PurchaseOrder, updatePoPayload } from "@/queries/purchase-order";
import { QuotationQueries } from "@/queries/quotation";
import { BonsCommande, PENALITY_MODE, PRIORITIES } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import React from 'react';
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

interface Props {
  open: boolean;
  openChange: React.Dispatch<React.SetStateAction<boolean>>;
  purchaseOrder: BonsCommande;
}

const PRIORITIES = PRIORITIES.map(s => s.value) as [
  (typeof PRIORITIES)[number]["value"],
  ...(typeof PRIORITIES)[number]["value"][]
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

function EditPurchase({open, openChange, purchaseOrder}:Props) {
    const [selectDate, setSelectDate] = React.useState(false); //Popover select Date
      const quotationQuery = new QuotationQueries();
      const providerQuery = new ProviderQueries();
      const purchaseOrderQuery = new PurchaseOrder();
    
      const getQuotations = useFetchQuery(["quotations"],quotationQuery.getAll);
      const getProviders = useFetchQuery(["providers"],providerQuery.getAll);
    
      const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
          priority: purchaseOrder.priority,
          paymentTerms: purchaseOrder.paymentTerms,
          deliveryDelay: format(new Date(purchaseOrder.deliveryDelay), "yyyy-MM-dd"),
          deliveryLocation: purchaseOrder.deliveryLocation,
          amountBase: purchaseOrder.amountBase,
          hasPenalties: purchaseOrder.hasPenalties,
          penaltyMode: purchaseOrder.penaltyMode,
          paymentMethod: purchaseOrder.paymentMethod,
          deviId: purchaseOrder.deviId
        },
      });
    
      const {mutate, isPending} = useMutation({
        mutationFn: (payload:updatePoPayload)=>purchaseOrderQuery.update(payload, purchaseOrder.id),
        onSuccess: ()=>{
          toast.success("Votre Bon de Commande a été mis à jour avec succès !");
        openChange(false);
          
        },
        onError: (error:Error)=>{
          toast.error(error.message ?? "Une erreur est survenue");
        }
      })
    
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
      };
    
      mutate(payload);
    }
    
    const penalty = form.watch("hasPenalties");
  return (
    <Dialog open={open} onOpenChange={openChange}>
        <DialogContent className='sm:max-w-3xl sm:w-[90%]'>
            <DialogHeader variant={"secondary"}>
                <DialogTitle>{`Modifier ${purchaseOrder.devi.commandRequest.title}`}</DialogTitle>
                <DialogDescription>{"Mettre à jour les informations liées au bon de commande"}</DialogDescription>
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
                                {getQuotations.data && getQuotations.data.data.filter(c=>c.status ==="APPROVED").map((quote)=>(
                                  <SelectItem key={quote.id} value={String(quote.id)} className="line-clamp-1" >
                                  {`${quote.commandRequest.title} - ${formatToShortName(getProviders.data?.data.find(p=> p.id === quote.providerId)?.name)}`}
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
                        <FormItem className="@min-[560px]/dialog:col-span-2">
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
                                  PRIORITIES.map((priority)=>
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
                    <DialogFooter className="@min-[560px]/dialog:col-span-2">
                      <Button type="submit" variant={"primary"} disabled={isPending} isLoading={isPending}>{"Modifier"}</Button>
                      <DialogClose asChild>
                        <Button variant={"outline"}>{"Annuler"}</Button>
                      </DialogClose>
                    </DialogFooter>
                  </form>
                </Form>
        </DialogContent>
    </Dialog>
  )
}

export default EditPurchase