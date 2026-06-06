"use client";
import { SearchableSelect } from "@/components/base/searchableSelect";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Textarea } from "@/components/ui/textarea";
import { newRequestApprovisionement, requestQ } from "@/queries/requestModule";
import { Category, PRIORITIES, ProjectT, RequestModelT } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

interface Props {
  request: RequestModelT;
  projects: Array<ProjectT>;
  categories: Array<Category>;
  open: boolean;
  onOpenChange: React.Dispatch<React.SetStateAction<boolean>>;
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

type FormValues = z.infer<typeof formSchema>;

function EditApproRequest({
  request,
  projects,
  categories,
  open,
  onOpenChange,
}: Props) {
  const [dueDate, setDueDate] = useState<boolean>(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      label: request.label,
      description: request.description,
      amount: request.amount,
      dueDate: format(request.dueDate, "yyyy-MM-dd"),
      priority: request.priority,
      categoryId:
        categories.find((c) => c.type.type === "appro")?.id || undefined,
      projectId: request.projectId,
    },
  });

  // Update values on Open
  useEffect(() => {
    if (open && request) {
      form.reset({
        label: request.label,
        description: request.description,
        amount: request.amount,
        dueDate: format(request.dueDate, "yyyy-MM-dd"),
        priority: request.priority,
        categoryId: request.categoryId,
        projectId: request.projectId,
      });
    }
  }, [request, form, open]);

  const { mutate, isPending } = useMutation({
    mutationFn: async (payload: Partial<newRequestApprovisionement>) => {
      return requestQ.update(request.id, payload);
    },
    onSuccess: () => {
      toast.success("Votre besoin a été modifié avec succès !");
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error(
        error.message || "Une erreur est survenue lors de la modification",
      );
    },
  });

  const onSubmit = (values: FormValues) => {
    const { dueDate, ...rest } = values;
    mutate({ ...rest, dueDate: new Date(dueDate) });
  };

  const dayStart = new Date();
  dayStart.setDate(dayStart.getDate() - 1);
  dayStart.setHours(0, 0, 0, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader variant={"secondary"}>
          <DialogTitle>
            {request?.label
              ? `Modifier - ${request.label}`
              : "Modifier le besoin"}
          </DialogTitle>
          <DialogDescription>
            {"Modifiez les informations du besoin"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid grid-cols-1 gap-4 @min-[520px]/dialog:grid-cols-2"
          >
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
                <FormItem className="col-span-full">
                  <FormLabel isRequired>{"Motif"}</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Ex. Carburant" {...field} />
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

            {/* Boutons */}
            <DialogFooter className="w-full col-span-full">
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isPending}>
                  {"Annuler"}
                </Button>
              </DialogClose>
              <Button
                type="submit"
                disabled={isPending}
                isLoading={isPending}
                variant={"secondary"}
              >
                {"Enregistrer les modifications"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default EditApproRequest;
