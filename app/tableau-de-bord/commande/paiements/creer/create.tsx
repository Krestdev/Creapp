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
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { CommandRequestT, Provider } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { SelectValue } from "@radix-ui/react-select";
import { CalendarIcon } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import z from "zod";

const formSchema = z.object({
  commandId: z.number({ message: "Requis" }),
  dueDate: z.string({ message: "Veuillez définir une date" }).refine(
    (val) => {
      const d = new Date(val);
      return !isNaN(d.getTime());
    },
    { message: "Date invalide" }
  ),
  isPartial: z.boolean(),
  amount: z.number({ message: "Veuillez renseigner un montant" }),
  payementMethod: z.string({
    message: "Veuillez choisir un moyen de paiement",
  }),
  priority: z.string({ message: "Veuillez choisir une priorité" }),
  proof: z
    .array(
      z.union([
        z.instanceof(File, { message: "Doit être un fichier valide" }),
        z.string(),
      ])
    )
    .min(1, "Veuillez renseigner au moins 1 justificatif")
    .max(1, "Pas plus d'un justificatif"),
});

type FormValues = z.infer<typeof formSchema>;

interface Props {
  paiement?: FormValues;
  openChange?: React.Dispatch<React.SetStateAction<boolean>>;
}

function CreatePaiement({ paiement, openChange }: Props) {
  /**Data states */
  const [dueDate, setDueDate] = React.useState<boolean>(false);
  const [requests, setRequests] = React.useState<Array<CommandRequestT>>([]);
  const today = new Date(); //On part sur 3 jours de delai de base :)
  today.setDate(today.getDate() + 3);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      commandId: paiement?.commandId ?? undefined,
      dueDate: paiement?.dueDate ?? undefined,
      isPartial: paiement?.isPartial ?? false,
      amount: paiement?.amount ?? 0,
      payementMethod: paiement?.payementMethod ?? "",
      priority: paiement?.priority ?? "",
      proof: paiement?.proof ?? undefined,
    },
  });

  function onSubmit(values: FormValues) {
    console.log(values);
  }

  const paymentMethods = ["Cheque", "Virement", "Espece", "Autre"];
  const priorities = ["Haute", "Moyenne", "Basse"];

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="max-w-3xl grid grid-cols-1 gap-4 @min-[640px]:grid-cols-2"
      >
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
                    {requests.length === 0 ? (
                      <SelectItem value="-" disabled>
                        {"Aucune demande enregistrée"}
                      </SelectItem>
                    ) : (
                      requests.map((request) => (
                        <SelectItem key={request.id} value={String(request.id)}>
                          {request.title}
                        </SelectItem>
                      ))
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
          name="dueDate"
          render={({ field }) => {
            // Convertir la valeur string en Date pour le calendrier
            const selectedDate = field.value
              ? new Date(field.value)
              : undefined;

            return (
              <FormItem>
                <FormLabel isRequired>{"Date limite de soumission"}</FormLabel>
                <FormControl>
                  <div className="relative flex gap-2">
                    <Input
                      id={field.name}
                      value={field.value || ""}
                      placeholder="JJ/MM/AAAA"
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
                            // Formater la date en YYYY-MM-DD
                            const year = date.getFullYear();
                            const month = String(date.getMonth() + 1).padStart(
                              2,
                              "0"
                            );
                            const day = String(date.getDate()).padStart(2, "0");
                            const value = `${year}-${month}-${day}`;
                            field.onChange(value);
                            setDueDate(false);
                          }}
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
                <div className="flex items-center space-x-2">
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
          render={({ field }) => (
            <FormItem>
              <FormLabel isRequired>{"Montant"}</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type="number"
                    value={field.value || ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value === "" ? undefined : Number(value));
                    }}
                  />
                  <p className="absolute right-3 top-1/2 -translate-y-1/2">
                    {"FCFA"}
                  </p>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Moyen de paiement */}
        <FormField
          control={form.control}
          name="payementMethod"
          render={({ field }) => (
            <FormItem>
              <FormLabel isRequired>{"Moyen de paiement"}</FormLabel>
              <FormControl>
                <Select
                  defaultValue={field.value ? String(field.value) : undefined}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger className="min-w-60 w-full">
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.map((method) => (
                      <SelectItem key={method} value={method}>
                        {method}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
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
                    {priorities.map((priority) => (
                      <SelectItem key={priority} value={priority}>
                        {priority}
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

        <Button type="submit" className="w-fit">
          {!!paiement ? "Modifier la facture" : "Soumettre la facture"}
        </Button>
      </form>
    </Form>
  );
}

export default CreatePaiement;
