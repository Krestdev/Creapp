"use client";
import { receiverIdOf } from "@/lib/utils";
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
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerEyebrow,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
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
import { requestQ } from "@/queries/requestModule";
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
import { CalendarIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

interface Props {
  request: RequestModelT;
  users: Array<User>;
  categories: Array<Category>;
  projects: Array<ProjectT>;
  open: boolean;
  onOpenChange: React.Dispatch<React.SetStateAction<boolean>>;
}

const REQUEST_PRIORITIES = PRIORITIES.map((m) => m.value) as [
  (typeof PRIORITIES)[number]["value"],
  ...(typeof PRIORITIES)[number]["value"][],
];

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
  // "minDate" est recalculé à chaque validation (et non figé au chargement
  // du module) pour que le verrou ne devienne pas obsolète si l'onglet
  // reste ouvert d'un jour sur l'autre.
  dueDate: z.string({ message: "Veuillez définir une date" }).refine(
    (val) => {
      const d = new Date(val);
      const minDate = new Date();
      minDate.setHours(0, 0, 0, 0);
      return !isNaN(d.getTime()) && d >= minDate;
    },
    { message: "Date invalide" },
  ),
  unit: z.string().min(1, "Veuillez sélectionner une unité"),
  priority: z.enum(REQUEST_PRIORITIES),
});

type FormValues = z.infer<typeof formSchema>;

function EditTypeOthers({
  request,
  users,
  categories,
  projects,
  open,
  onOpenChange,
}: Props) {
  // const { user } = useStore();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [dueDate, setDueDate] = useState<boolean>(false);

  // Calculé à chaque rendu (et non au chargement du module) pour que le
  // verrou sur les dates passées ne devienne pas obsolète si l'onglet
  // reste ouvert d'un jour sur l'autre.
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dayStart = new Date();
  dayStart.setDate(dayStart.getDate() - 1);
  dayStart.setHours(0, 0, 0, 0);

  // Filtrer les catégories de type "others" une seule fois
  // const filteredCategories = useMemo(() => {
  //   return categories.filter((c) => c.type?.type === request.type);
  // }, [categories]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      label: "",
      description: "",
      amount: 100,
      quantity: 1,
      benef: undefined,
      priority: "low",
      unit: "",
      categoryId: undefined,
      projectId: undefined,
      dueDate: "",
    },
  });

  // Remplir le formulaire avec les données existantes
  useEffect(() => {
    if (open && request) {
      form.reset({
        label: request.label || "",
        description: request.description || "",
        amount: request.amount || 100,
        quantity: request.quantity || 1,
        unit: request.unit || "",
        benef: receiverIdOf(request),
        dueDate: request.dueDate
          ? format(new Date(request.dueDate), "yyyy-MM-dd")
          : format(new Date(), "yyyy-MM-dd"),
        priority: request.priority || "low",
        categoryId: request.categoryId,
        projectId: request.projectId,
      });
    }
  }, [request, form, open]);

  const { mutate, isPending } = useMutation({
    mutationFn: async (payload: any) => {
      return requestQ.update(request.id, payload);
    },
    onSuccess: () => {
      toast.success("Votre besoin a été modifié avec succès !");
      // Invalider les requêtes pour rafraîchir les données
      queryClient.invalidateQueries();
      onOpenChange(false);
      router.refresh();
    },
    onError: (error: Error) => {
      toast.error(
        error.message || "Une erreur est survenue lors de la modification",
      );
    },
  });

  const onSubmit = useCallback(
    (values: FormValues) => {
      // Validation supplémentaire
      if (!values.projectId) {
        toast.error("Veuillez sélectionner un projet");
        return;
      }

      const payload = {
        label: values.label,
        description: values.description,
        amount: values.amount,
        quantity: values.quantity,
        unit: values.unit,
        benef: [values.benef],
        dueDate: new Date(values.dueDate),
        priority: values.priority,
        categoryId: values.categoryId,
        projectId: values.projectId,
      };

      mutate(payload);
    },
    [mutate],
  );

  // Gérer la fermeture du modal
  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      if (!newOpen) {
        // Réinitialiser le formulaire lors de la fermeture
        form.reset();
      }
      onOpenChange(newOpen);
    },
    [form, onOpenChange],
  );

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerEyebrow>{"Besoins"}</DrawerEyebrow>
          <DrawerTitle>
            {request?.label
              ? `Modifier - ${request.label}`
              : "Modifier le besoin"}
          </DrawerTitle>
          <DrawerDescription>
            Modifiez les informations du besoin en achat direct
          </DrawerDescription>
        </DrawerHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex min-h-0 flex-1 flex-col"
          >
            <DrawerBody className="grid grid-cols-1 gap-4 @min-[640px]:grid-cols-2">
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

            {/* Category */}
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => {
                // 1. On filtre les catégories "others"
                const otherCategories = categories.filter(
                  (c) => c.type.type === "others",
                );

                // 2. On trouve la catégorie sélectionnée en convertissant les IDs en String
                // pour garantir que la comparaison fonctionne (Nombre vs Texte)
                const selectedCategory = otherCategories.find(
                  (c) => String(c.id) === String(field.value),
                );

                return (
                  <FormItem className="col-span-full">
                    <FormLabel isRequired>{"Catégorie"}</FormLabel>

                    <FormControl>
                      <Select
                        value={field.value ? String(field.value) : ""}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>

                        <SelectContent>
                          {otherCategories.length === 0 ? (
                            <SelectItem value="#" disabled>
                              {"Aucune catégorie enregistrée"}
                            </SelectItem>
                          ) : (
                            otherCategories.map((category) => (
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

                    {/* La description s'affiche maintenant correctement */}
                    {selectedCategory?.description && (
                      <div className="first-letter:uppercase text-sm text-muted-foreground animate-in fade-in duration-300">
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
                <FormItem className="@min-[640px]:col-span-2">
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
                <FormItem className="col-span-full">
                  <FormLabel isRequired>{"Projet"}</FormLabel>
                  <FormControl>
                    <Combobox
                      items={projects.filter((x) => x.status !== "cancelled")}
                      value={projects.find((p) => p.id === field.value) ?? null}
                      onValueChange={(v) => field.onChange(v?.id ?? "")}
                    >
                      <ComboboxInput placeholder="Sélectionner" />
                      <ComboboxContent className="min-w-[min(32rem,var(--available-width))]">
                        <ComboboxEmpty>Aucun projet enregistré</ComboboxEmpty>
                        <ComboboxList>
                          {(item: ProjectT) => (
                            <ComboboxItem
                              key={item.id}
                              value={item}
                              className="items-start leading-snug wrap-break-word"
                            >
                              {item.label}
                            </ComboboxItem>
                          )}
                        </ComboboxList>
                      </ComboboxContent>
                    </Combobox>
                  </FormControl>
                  {projects.find((p) => p.id === field.value) && (
                    <p className="text-xs text-muted-foreground wrap-break-word">
                      {projects.find((p) => p.id === field.value)?.label}
                    </p>
                  )}
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
                                Sélectionner une date
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
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        FCFA
                      </span>
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
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
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
                          Aucun utilisateur enregistré
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

            {/* Boutons */}
            </DrawerBody>
            <DrawerFooter pinned>
              <DrawerClose asChild>
                <Button type="button" variant="outline" disabled={isPending}>
                  Annuler
                </Button>
              </DrawerClose>
              <Button
                type="submit"
                disabled={isPending}
                isLoading={isPending}
                variant="primary"
              >
                Enregistrer les modifications
              </Button>
            </DrawerFooter>
          </form>
        </Form>
      </DrawerContent>
    </Drawer>
  );
}

export default EditTypeOthers;
