"use client";
import { SearchableSelect } from "@/components/base/searchableSelect";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { units } from "@/data/unit";
import { XAF } from "@/lib/utils";
import { useStore } from "@/providers/datastore";
import { newRequestTransport, requestQ } from "@/queries/requestModule";
import {
  Category,
  PRIORITIES,
  ProjectT,
  RequestModelT,
  User,
} from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { CalendarIcon, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

interface Props {
  request: RequestModelT;
  users: Array<User>;
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

export const beneficiaryArray = z.object({
  id: z.coerce.number(),
  name: z.string(),
  amount: z.coerce.number().min(1, "Veuillez saisir un montant"),
});

const formSchema = z.object({
  label: z
    .string({ message: "Veuillez renseigner un titre" })
    .min(5, { message: "Trop court" })
    .max(50, { message: "Trop long" }),
  description: z.string({ message: "Veuillez renseigner une description" }),
  categoryId: z.coerce.number({
    message: "Veuillez sélectionner une catégorie",
  }),
  projectId: z.coerce.number({ message: "Veuillez définir un projet" }),
  list: z.array(beneficiaryArray).min(1, "Veuillez ajouter un bénéficiaire"),
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

function EditTransportRequest({
  request,
  users,
  projects,
  categories,
  open,
  onOpenChange,
}: Props) {
  const { user } = useStore();
  const [dueDate, setDueDate] = useState<boolean>(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      label: request.label,
      description: request.description,
      list: request.benFac?.list || [],
      priority: request.priority,
      projectId: request.projectId,
      dueDate: request.dueDate
        ? format(new Date(request.dueDate), "yyyy-MM-dd")
        : format(new Date(), "yyyy-MM-dd"),
    },
  });

  // Remplir le formulaire avec les données existantes
  useEffect(() => {
    if (open && request) {
      form.reset({
        label: request.label || "Transport",
        description: request.description || "",
        projectId: request.projectId,
        dueDate: request.dueDate
          ? format(new Date(request.dueDate), "yyyy-MM-dd")
          : format(new Date(), "yyyy-MM-dd"),
        list: request.benFac?.list || [],
        priority: request.priority,
        categoryId: request.categoryId,
      });
    }
  }, [request, form, open]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "list",
  });

  const list = form.watch("list");
  const amount = list.reduce((a, b) => a + b.amount, 0);
  const listError = form.getFieldState("list").error?.message;

  const dayStart = new Date();
  dayStart.setDate(dayStart.getDate() - 1);
  dayStart.setHours(0, 0, 0, 0);

  const { mutate, isPending } = useMutation({
    mutationFn: async (payload: Partial<newRequestTransport>) => {
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
    const { dueDate, list, ...rest } = values;
    mutate({ dueDate: new Date(dueDate), benFac: { list }, ...rest });
  };

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
                    <Input placeholder="Ex. Visite Terrain" {...field} />
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
                const transportCategories = categories.filter(
                  (c) => c.type.type === "transport",
                );

                const selectedCategory = transportCategories.find(
                  (c) => String(c.id) === String(field.value),
                );

                return (
                  <FormItem>
                    <FormLabel isRequired>{"Categorie"}</FormLabel>
                    <FormControl>
                      <SearchableSelect
                        onChange={field.onChange}
                        options={transportCategories.map((c) => ({
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
            {/* Project */}
            <FormField
              control={form.control}
              name="projectId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel isRequired>{"Projet"}</FormLabel>
                  <FormControl>
                    <Combobox
                      items={projects.filter((x) => x.status !== "cancelled")}
                      value={projects.find((p) => p.id === field.value) ?? null}
                      onValueChange={(v) => field.onChange(v?.id ?? "")}
                    >
                      <ComboboxInput placeholder="Sélectionner" />
                      <ComboboxContent>
                        <ComboboxEmpty>
                          {"Aucun projet enregistré"}
                        </ComboboxEmpty>
                        <ComboboxList>
                          {(item: ProjectT) => (
                            <ComboboxItem key={item.id} value={item}>
                              {item.label}
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
            {/* Priorité */}
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel isRequired>{"Priorité"}</FormLabel>
                  <FormControl>
                    <Select
                      defaultValue={
                        field.value ? String(field.value) : undefined
                      }
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className="min-w-60 w-full">
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        {PRIORITIES.map((priority) => (
                          <SelectItem
                            key={priority.value}
                            value={priority.value}
                          >
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
            <div className="w-full col-span-full grid gap-3">
              <div className="flex items-center justify-between">
                <FormLabel isRequired>{"Bénéficiaires"}</FormLabel>
                <div className="text-sm text-muted-foreground">
                  {"Total: "}
                  <span>{XAF.format(amount)}</span>
                </div>
              </div>

              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="p-4 rounded-md border grid grid-cols-1 @min-[520px]/dialog:grid-cols-2 gap-3 place-items-start"
                  >
                    <FormField
                      control={form.control}
                      name={`list.${index}.amount`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{"Montant (FCFA)"}</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                {...field}
                                type="number"
                                placeholder="Ex. 30"
                                onChange={(e) => {
                                  const value =
                                    e.target.value === ""
                                      ? 0
                                      : parseFloat(e.target.value);
                                  field.onChange(value);
                                }}
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
                      name={`list.${index}.id`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{`Beneficiaire`}</FormLabel>
                          <FormControl>
                            <Combobox
                              items={users}
                              value={
                                users.find((user) => user.id === field.value) ??
                                null
                              }
                              onValueChange={(v) => {
                                field.onChange(v?.id ?? "");
                                form.setValue(
                                  `list.${index}.name`,
                                  v?.firstName.concat(" ", v.lastName) ?? "",
                                );
                              }}
                              itemToStringLabel={(v) =>
                                v.firstName.concat(" ", v.lastName)
                              }
                            >
                              <ComboboxInput placeholder="Sélectionner" />
                              <ComboboxContent>
                                <ComboboxEmpty>
                                  {"Aucun utilisateur enregistré"}
                                </ComboboxEmpty>
                                <ComboboxList>
                                  {(item: User) => (
                                    <ComboboxItem key={item.id} value={item}>
                                      {item.firstName.concat(
                                        " ",
                                        item.lastName,
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

                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="delete"
                        size="icon"
                        onClick={() => remove(index)}
                      >
                        <Trash2 />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={() => append({ amount: 0, id: -1, name: "" })}
              >
                <Plus />
                {"Ajouter un bénéficiaire"}
              </Button>
              {listError && (
                <p className="text-sm font-medium text-destructive">
                  {listError}
                </p>
              )}
            </div>

            {/* Boutons */}
            <DialogFooter className="w-full col-span-full mt-4">
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

export default EditTransportRequest;
