"use client";
import FilesUpload from "@/components/comp-547";
import ErrorPage from "@/components/error-page";
import LoadingPage from "@/components/loading-page";
import PageTitle from "@/components/pageTitle";
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
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { totalAmountPurchase, XAF } from "@/lib/utils";
import { commadQ } from "@/queries/command";
import { invoiceQ, NewInvoice } from "@/queries/invoices";
import { BonsCommande, Invoice } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { fr } from "date-fns/locale/fr";
import { CalendarIcon } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

const formSchema = z.object({
  title: z
    .string()
    .min(5, { message: "Le titre doit comporter au moins 5 caractères" }),
  amount: z.coerce.number({ message: "Veuillez entrer un montant" }),
  isPartial: z.boolean(),
  deadline: z.string({ message: "Veuillez définir une date" }).refine(
    (val) => {
      const d = new Date(val);
      const now = new Date();
      return !isNaN(d.getTime()) && d >= now;
    },
    { message: "Date invalide" },
  ),
  proof: z.array(
      z.instanceof(File, { message: "Doit être un fichier valide" }),
  ),
  commandId: z.coerce.number({
    message: "Veuillez sélectionner un bon de commande",
  }),
});

function Page() {
  const [dueDate, setDueDate] = React.useState<boolean>(false);
  const today = new Date(); //On part sur 3 jours de delai de base :)
  today.setDate(today.getDate() + 3);
  

  const getPurchases = useQuery({
    queryKey: ["purchaseOrders"],
    queryFn: commadQ.getAll,
  });

  const getInvoices = useQuery({
    queryKey: ["invoices"],
    queryFn: invoiceQ.getAll,
  });

  const purchases:Array<BonsCommande> = React.useMemo(()=>{
    if(!getPurchases.data) return [];
    return getPurchases.data.data;
  },[getPurchases.data]);

  const invoices:Array<Invoice> = React.useMemo(()=>{
    if(!getInvoices.data) return [];
    return getInvoices.data.data;
  },[getInvoices.data]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      amount: 0,
      isPartial: true,
      deadline: format(new Date(), "yyyy-MM-dd"),
      proof: [],
      commandId: undefined,
    },
  });

  const commandId = form.watch("commandId");
  const isPartial = form.watch("isPartial");

  const purchase = React.useMemo(() => {
      return purchases.find(p => p.id === commandId)
    }, [purchases, commandId]);
  
    const toPay = purchase && purchase.netToPay - invoices.filter(i => i.commandId === purchase.id && i.status !== "CANCELLED").reduce((total, e) => total + e.amount, 0);
  
    const rest = !!toPay && toPay >= 0 ? toPay : 0;
  
    React.useEffect(() => {
      if (!!commandId) {
        if (!purchase) {
          toast.error("Bon de commande invalide");
          return form.setError("commandId", {
            message: "Bon de commande invalide",
          });
        }
        form.setValue("amount", rest);
      }
    }, [commandId]);

  const createInvoice = useMutation({
    mutationFn: async (payload: NewInvoice) => invoiceQ.create(payload),
    onSuccess: () => {
      toast.success("Votre facture a bien été enregistré");
      form.reset({
        title: "",
        amount: 0,
        isPartial: true,
        deadline: format(new Date(), "yyyy-MM-dd"),
        proof: [],
        commandId: undefined,
      });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!(values.proof[0] instanceof File)) {
      return toast.error("La preuve doit être un fichier");
    }
    if (!values.isPartial && values.amount !== rest) {
      toast.error("Montant incorrect !");
      return form.setError("amount", {
        message:
          "Le montant doit être égale au montant total du Bon de commande",
      });
    }
    if (
      (values.isPartial && values.amount >= rest) ||
      (!values.isPartial && values.amount > rest)
    ) {
      toast.error("Montant invalide !");
      return form.setError("amount", {
        message:
          "Votre montant est supérieur ou égal au montant total du bon de commande",
      });
    }
    if (values.amount > rest) {
      toast.error("Montant invalide !");
      return form.setError("amount", { message: "Votre montant est supérieur au reste à payer" })
    }
    const payload: NewInvoice =
    {
      deadline: new Date(values.deadline),
      title: values.title,
      amount: values.amount,
      proof: values.proof[0],
      commandId: values.commandId,
      isPartial: values.isPartial,
    };
    createInvoice.mutate(payload);
  }

  if(getPurchases.isLoading || getInvoices.isLoading) return <LoadingPage/>

  if(getPurchases.error || getInvoices.isLoading) return <ErrorPage error={getPurchases.error || getInvoices.error || undefined} />
  if(getPurchases.isSuccess && getInvoices.isSuccess){
    console.log(form.formState.errors)
        return (
            <div className="content">
            <PageTitle
                title="Enregistrer une facture"
                subtitle="Complétez le formulaire pour enregistrer une facture"
                color="blue"
            />
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="form-3xl">
                    <FormField control={form.control} name="title" render={({field})=>(
                        <FormItem>
                            <FormLabel isRequired>{"Titre de la facture"}</FormLabel>
                            <FormControl>
                                <Input {...field} placeholder="Ex. 40% Bon Commande" />
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )} />
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
                                purchases
                                .filter((p) => p.status === "APPROVED")
                                .map((request) => {
                                    const pay = React.useMemo(() => {
                                    return invoices
                                        ?.filter(
                                        (invoice) => invoice.commandId === request.id,
                                        )
                                        .filter(
                                        (c) =>
                                            c.status !== "CANCELLED"
                                        );
                                    }, [invoices, request]);
                                    const paid =
                                    pay
                                        ?.flatMap((x) => x.amount)
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
                                    disabled={(date) => date < new Date()}
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
                    name="amount"
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
                        {!!commandId && (
                            <div className="grid gap-1.5">
                            {!!purchase &&
                                purchase.instalments.map((e, id) => (
                                <div
                                    key={id}
                                    className="text-sm text-gray-400"
                                >{`Echéance ${id + 1}: ${XAF.format((e.percentage * purchase.netToPay) / 100)} ${!!e.deadLine && `avant le ${format(new Date(e.deadLine), "dd MMMM yyyy", { locale: fr })}`}`}</div>
                                ))}
                            </div>
                        )}
                        <FormMessage />
                        </FormItem>
                    );
                    }}
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
                            acceptTypes="all"
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
                        createInvoice.isPending
                    }
                    isLoading={createInvoice.isPending}
                    >
                    {"Créer la facture"}
                    </Button>
                </div>
                </form>
            </Form>
            </div>
        );
  }
}

export default Page;
