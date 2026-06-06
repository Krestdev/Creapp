"use client";
import { SearchableSelect } from "@/components/base/searchableSelect";
import FilesUpload from "@/components/comp-547";
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
import { Textarea } from "@/components/ui/textarea";
import { units } from "@/data/unit";
import { requestQ } from "@/queries/requestModule";
import {
  Category,
  PRIORITIES,
  ProjectT,
  RequestModelT,
  User,
} from "@/types/types";
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

const methods = [
  { value: "cash", label: "Espèces" },
  { value: "chq", label: "Chèque" },
  { value: "ov", label: "Virement" },
] as const;

const today = new Date();
today.setHours(0, 0, 0, 0);

const formSchema = z.object({
  label: z
    .string({ message: "Veuillez renseigner un titre" })
    .min(5, { message: "Trop court" })
    .max(50, { message: "Trop long" }),
  projectId: z.coerce.number({ message: "Veuillez définir un projet" }),
  description: z.string({ message: "Veuillez renseigner une description" }),
  categoryId: z.coerce.number({
    message: "Veuillez sélectionner une catégorie",
  }),
  amount: z.coerce.number({ message: "Veuillez renseigner un montant" }),
  quantity: z.coerce
    .number({ message: "Veuillez définir une quantité" })
    .refine((val) => val > 0, "La quantité doit être supérieure à 0"),
  benef: z.coerce.number(),
  dueDate: z.string({ message: "Veuillez définir une date" }).refine(
    (val) => {
      const d = new Date(val);
      return !isNaN(d.getTime()) && d >= today;
    },
    { message: "Date invalide" },
  ),
  unit: z.string().min(1, "Veuillez sélectionner une unité"),
  priority: z.enum(REQUEST_PRIORITIES),
  payType: z.enum(["cash", "chq", "ov"]),
});

type FormValues = z.infer<typeof formSchema>;

function EditTaxesRequest({
  request,
  users,
  categories,
  projects,
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
      quantity: request.quantity,
      benef: request.benef?.[0],
      dueDate: request.dueDate
        ? format(new Date(request.dueDate), "yyyy-MM-dd")
        : format(new Date(), "yyyy-MM-dd"),
      priority: request.priority,
      unit: request.unit,
      categoryId: request.categoryId,
      projectId: request.projectId,
      payType: request.paytype,
    },
  });

  // Remplir le formulaire avec les données existantes
  useEffect(() => {
    if (open && request) {
      form.reset({
        label: request.label,
        description: request.description,
        amount: request.amount,
        quantity: request.quantity,
        benef: request.benef?.[0],
        dueDate: request.dueDate
          ? format(new Date(request.dueDate), "yyyy-MM-dd")
          : format(new Date(), "yyyy-MM-dd"),
        priority: request.priority,
        unit: request.unit,
        categoryId: request.categoryId,
        projectId: request.projectId,
        payType: request.paytype,
      });
    }
  }, [request, form, open]);

  const { mutate, isPending } = useMutation({
    mutationFn: async (payload: any) => {
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
    const { dueDate, benef, ...rest } = values;
    mutate({
      ...rest,
      benef: [benef],
      dueDate: new Date(dueDate),
    });
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
                    <Input placeholder="Ex. Impôts Décembre 2027" {...field} />
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
                // 1. On filtre les catégories "others"
                const taxesCategories = categories.filter(
                  (c) => c.type.type === "taxes",
                );

                // 2. On trouve la catégorie sélectionnée en convertissant les IDs en String
                // pour garantir que la comparaison fonctionne (Nombre vs Texte)
                const selectedCategory = taxesCategories.find(
                  (c) => String(c.id) === String(field.value),
                );

                return (
                  <FormItem>
                    <FormLabel isRequired>{"Categorie"}</FormLabel>
                    <FormControl>
                      <SearchableSelect
                        onChange={field.onChange}
                        options={taxesCategories.map((c) => ({
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
            {/* Date limite de soumission */}
            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => {
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
            <FormField
              control={form.control}
              name="payType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel isRequired>{"Moyen de paiement"}</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="min-w-60 w-full">
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        {methods.map((method) => (
                          <SelectItem key={method.value} value={method.value}>
                            {method.label}
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
            <FormField
              control={form.control}
              name="benef"
              render={({ field }) => (
                <FormItem>
                  <FormLabel isRequired>{"Bénéficiaire"}</FormLabel>
                  <FormControl>
                    <Combobox
                      items={users}
                      value={
                        users.find((user) => user.id === field.value) ?? null
                      }
                      onValueChange={(v) => field.onChange(v?.id ?? "")}
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
                              {item.firstName.concat(" ", item.lastName)}
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
            {/* JUSTIFICATIF */}
            <div className="grid gap-1.5">
              <Label>{"Justificatif"}</Label>
              <FilesUpload
                value={request.proof}
                onChange={() => {}}
                name={"justificatif"}
                acceptTypes="all"
                multiple={false}
                maxFiles={1}
                disabled
              />
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

export default EditTaxesRequest;
