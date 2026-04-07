"use client";
import { SearchableSelect } from "@/components/base/searchableSelect";
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
import { useStore } from "@/providers/datastore";
import { newRequestApprovisionement, requestQ } from "@/queries/requestModule";
import { Category, PRIORITIES, ProjectT, User } from "@/types/types";
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
  projects: Array<ProjectT>;
}

const REQUEST_PRIORITIES = PRIORITIES.map((m) => m.value) as [
  (typeof PRIORITIES)[number]["value"],
  ...(typeof PRIORITIES)[number]["value"][],
];

const today = new Date();
today.setHours(0, 0, 0, 0);

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
  projectId: z.coerce.number({
    message: "Veuillez sélectionner un projet",
  }),
  amount: z.coerce.number({ message: "Veuillez renseigner un montant" }),
  dueDate: z.string({ message: "Veuillez définir une date" }).refine(
    (val) => {
      const d = new Date(val);
      return !isNaN(d.getTime()) && d >= today;
    },
    { message: "Date invalide" },
  ),
  priority: z.enum(REQUEST_PRIORITIES),
});

function CreateTypeApprovisionement({ users, categories, projects }: Props) {
  const { user } = useStore();
  const router = useRouter();

  const [dueDate, setDueDate] = React.useState<boolean>(false);

  const today = new Date();
  const defaultDate = new Date();
  defaultDate.setDate(today.getDate() + 7);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      label: "Aprovisionement",
      description: "Aprovisionement Pour Carburent et Transport",
      amount: 100,
      dueDate: format(defaultDate, "yyyy-MM-dd"),
      priority: "low",
      categoryId:
        categories.find((c) => c.type.type === "appro")?.id || undefined,
      more: "",
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (payload: newRequestApprovisionement) =>
      requestQ.createApprovisionement(payload),
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
      dueDate: new Date(values.dueDate),
      priority: "medium",
      amount: values.amount,
      categoryId: values.categoryId,
      projectId: values.projectId,
      quantity: 1,
      type: "appro",
      paytype: "cash",
    });
  };
  //console.log(form.formState.errors);
  const dayStart = new Date();
  dayStart.setDate(dayStart.getDate() - 1);
  dayStart.setHours(0, 0, 0, 0);

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
          render={({ field }) => {
            // ✅ On filtre d'abord pour plus de clarté
            const approCategories = categories.filter(
              (c) => c.type.type === "appro",
            );

            // ✅ Correction ici : String(c.id) === String(field.value)
            const selectedCategory = approCategories.find(
              (c) => String(c.id) === String(field.value),
            );

            return (
              <FormItem>
                  <FormLabel isRequired>{"Categorie"}</FormLabel>
                  <FormControl>
                    <SearchableSelect
                      onChange={field.onChange}
                      options={approCategories.map((c) => ({
                        value: c.id!.toString(),
                        label: c.label,
                      }))}
                      value={field.value ? String(field.value) : ""}
                      width="w-full"
                      allLabel=""
                      placeholder="Sélectionner une catégorie"
                    />
                  </FormControl>

                  {/* ✅ Affichage de la description sous le SearchableSelect */}
                  {selectedCategory?.description && (
                    <div className="first-letter:uppercase text-sm text-muted-foreground animate-in fade-in slide-in-from-top-1 duration-300">
                      {selectedCategory.description}
                    </div>
                  )}

                  <FormMessage />
                </FormItem>
            );
          }}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem className="@min-[640px]:col-span-full">
              <FormLabel isRequired>{"Motif"}</FormLabel>
              <FormControl>
                <Input placeholder="Ex. Carburant" {...field} disabled />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Project */}
        <FormField
          control={form.control}
          name="projectId"
          render={({ field }) => (
            <FormItem>
              <FormLabel isRequired>{"Projet concerné"}</FormLabel>
              <SearchableSelect
                onChange={field.onChange}
                options={
                  projects
                    .filter(
                      (p) =>
                        p.status !== "cancelled" &&
                        p.status !== "Completed" &&
                        p.status !== "on-hold",
                    )
                    .map((p) => ({
                      value: p.id!.toString(),
                      label: p.label,
                    })) ?? []
                }
                value={field.value?.toString() || ""}
                width="w-full"
                allLabel=""
              />
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
                          disabled={(date) => date <= dayStart}
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
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel isRequired>{"Montant"}</FormLabel>
              <FormControl>
                <Input placeholder="Ex. 100" {...field} />
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
            onClick={() => console.log(form.getValues())}
          >
            {"Soumettre"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default CreateTypeApprovisionement;
