"use client";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
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
import { Textarea } from "@/components/ui/textarea";
import { useStore } from "@/providers/datastore";
import { newRequestGas, requestQ } from "@/queries/requestModule";
import { Category, PRIORITIES, User, Vehicle } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

interface Props {
  users: Array<User>;
  categories: Array<Category>;
  vehicles: Array<Vehicle>;
}

const REQUEST_PRIORITIES = PRIORITIES.map((m) => m.value) as [
  (typeof PRIORITIES)[number]["value"],
  ...(typeof PRIORITIES)[number]["value"][],
];

const today = new Date();

const formSchema = z.object({
  label: z
    .string({ message: "Veuillez renseigner un titre" })
    .min(5, { message: "Trop court" })
    .max(50, { message: "Trop long" }),
  description: z.string({ message: "Veuillez renseigner une description" }),
  more: z.string().optional(),
  categoryId: z.coerce.number({
    message: "Veuillez sélectionner une catégorie",
  }),
  amount: z.coerce.number({ message: "Veuillez renseigner un montant" }),
  vehiclesId: z.coerce.number(),
  km: z.coerce.number(),
  liters: z.coerce.number(),
  benef: z.coerce.number(),
  dueDate: z.string({ message: "Veuillez définir une date" }).refine(
    (val) => {
      const d = new Date(val);
      return !isNaN(d.getTime()) && d >= today;
    },
    { message: "Date invalide" },
  ),
  unit: z.string(),
  priority: z.enum(REQUEST_PRIORITIES),
});

function CreateTypeGas({ users, categories, vehicles }: Props) {
  const { user } = useStore();
  const router = useRouter();

  const [dueDate, setDueDate] = React.useState<boolean>(false);

  const today = new Date();
  const defaultDate = new Date();
  defaultDate.setDate(today.getDate() + 7);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      label: "Recharge de carburant",
      description: "",
      amount: 100,
      liters: 1,
      benef: user?.id,
      dueDate: format(defaultDate, "yyyy-MM-dd"),
      priority: "low",
      vehiclesId: undefined,
      km: 1,
      unit: "km",
      categoryId: undefined,
      more: "",
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (payload: newRequestGas) =>
      requestQ.createGasRequest(payload),
    onSuccess: () => {
      toast.success("Votre besoin a été soumis avec succès !");
      router.push("./mes-besoins");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const description =
      values.description === "Mission"
        ? values.description.concat(" - ", values.more ?? "")
        : values.description;
    mutate({
      label: values.label,
      description,
      unit: "FCFA",
      benef: [user?.id ?? 0],
      dueDate: new Date(values.dueDate),
      vehiclesId: values.vehiclesId,
      priority: "medium",
      categoryId: values.categoryId,
      quantity: 1,
    });
  };
  console.log(form.formState.errors);
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="form-3xl">
        <FormField
          control={form.control}
          name="label"
          render={({ field }) => (
            <FormItem>
              <FormLabel isRequired>{"Titre"}</FormLabel>
              <FormControl>
                <Input placeholder="Ex. Carburant" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Category */}
        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel isRequired>{"Categorie"}</FormLabel>
              <FormControl>
                <Select
                  defaultValue={field.value ? String(field.value) : undefined}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger className="min-w-60 w-full">
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.filter((c) => c.type.type === "gas").length ===
                    0 ? (
                      <SelectItem value="#" disabled>
                        {"Aucune catégorie enregistrée"}
                      </SelectItem>
                    ) : (
                      categories
                        .filter((c) => c.type.type === "gas")
                        .map((category) => (
                          <SelectItem
                            key={category.id}
                            value={category.id.toString()}
                          >
                            {category.label}
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
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem className="@min-[640px]:col-span-full">
              <FormLabel isRequired>{"Motif"}</FormLabel>
              <FormControl>
                <Select
                  value={field.value || ""}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger className="min-w-60 w-full">
                    <SelectValue placeholder="Sélectionner le motif" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Panne">{"Panne"}</SelectItem>
                    <SelectItem value="Mission">{"Mission"}</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {form.watch("description") === "Mission" && (
          <FormField
            control={form.control}
            name="more"
            render={({ field }) => (
              <FormItem className="@min-[640px]:col-span-full">
                <FormLabel isRequired>{"Description de la mission"}</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Renseigner une description"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
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
                <FormLabel isRequired>{"Date limite"}</FormLabel>
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
        {/* Vehicle */}
        <FormField
          control={form.control}
          name="vehiclesId"
          render={({ field }) => (
            <FormItem>
              <FormLabel isRequired>{"Véhicule"}</FormLabel>
              <FormControl>
                {/* <Select
                  defaultValue={field.value ? String(field.value) : undefined}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles.map((vehicle) => (
                      <SelectItem key={vehicle.id} value={vehicle.id.toString()}>
                        {vehicle.mark.concat(" - ", vehicle.label, " - ", vehicle.matricule)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select> */}
                <Combobox
                  items={vehicles}
                  value={
                    vehicles.find((vehicle) => vehicle.id === field.value) ??
                    null
                  }
                  onValueChange={(v) => field.onChange(v?.id ?? "")}
                  itemToStringLabel={(v) =>
                    v.mark.concat(" - ", v.label, " - ", v.matricule)
                  }
                >
                  <ComboboxInput placeholder="Sélectionner" />
                  <ComboboxContent>
                    <ComboboxEmpty>{"Aucun véhicule enregistré"}</ComboboxEmpty>
                    <ComboboxList>
                      {(item: Vehicle) => (
                        <ComboboxItem key={item.id} value={item}>
                          {item.mark.concat(
                            " - ",
                            item.label,
                            " - ",
                            item.matricule,
                          )}
                        </ComboboxItem>
                      )}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="@min-[640px]:col-span-full w-full flex justify-end">
          <Button
            variant={"primary"}
            type="submit"
            disabled={isPending}
            isLoading={isPending}
          >
            {"Soumettre"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default CreateTypeGas;
