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
import { Textarea } from "@/components/ui/textarea";
import { units } from "@/data/unit";
import { useStore } from "@/providers/datastore";
import { newRequestOthers, requestQ } from "@/queries/requestModule";
import { PRIORITIES, User } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

interface Props {
  users: Array<User>;
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
  amount: z.coerce.number({ message: "Veuillez renseigner un montant" }),
  quantity: z.coerce.number({ message: "Veuillez définir une quantité" }),
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

function CreateTypeOthers({ users }: Props) {
  const { user } = useStore();
  const router = useRouter();

  const [dueDate, setDueDate] = useState<boolean>(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      label: "",
      description: "",
      amount: 100,
      quantity: 1,
      benef: undefined,
      priority: "low",
      unit: "",
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (payload: newRequestOthers) =>
      requestQ.createOthersRequest(payload),
    onSuccess: () => {
      toast.success("Votre besoin a été soumis avec succès !");
      router.push("./mes-besoins");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    mutate({
        label: values.label,
        description: values.description,
        amount: values.amount,
        quantity: values.quantity,
        unit: values.unit,
        benef: [values.benef],
        dueDate: new Date(values.dueDate),
        priority: values.priority,
    });
  };
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
                <Input placeholder="Ex. Thé" {...field} />
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
          name="description"
          render={({ field }) => (
            <FormItem className="@min-[640px]:col-span-full">
              <FormLabel isRequired>{"Description"}</FormLabel>
              <FormControl>
                <Textarea placeholder="Décrivez votre besoin" {...field} />
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
                    placeholder="Ex. 15 000 FCFA"
                    {...field}
                    className="pr-12"
                  />
                  <p className="absolute right-2 top-1/2 -translate-y-1/2">
                    {"FCFA"}
                  </p>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel isRequired>{"Quantité"}</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Ex. 3"
                  {...field}
                  className="pr-12"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Unité */}
        <FormField
          control={form.control}
          name="unit"
          render={({ field }) => (
            <FormItem>
              <FormLabel isRequired>{"Unité"}</FormLabel>
              <FormControl>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    {units.map((unit) => (
                      <SelectItem key={unit.value} value={unit.value}>
                        {unit.name}
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
          name="benef"
          render={({ field }) => (
            <FormItem>
              <FormLabel isRequired>{"Bénéficiaire"}</FormLabel>
              <FormControl>
                <Select
                  value={field.value ? String(field.value) : undefined}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map(({ id, firstName, lastName }) => (
                      <SelectItem key={id} value={String(id)}>
                        {user?.id === id
                          ? `${firstName.concat(" ", lastName)} (Moi-même)`
                          : firstName.concat(" ", lastName)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="@min-[640px]:col-span-full w-full flex justify-end">
          <Button variant={"primary"} type="submit">
            {"Soumettre"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default CreateTypeOthers;
