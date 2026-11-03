"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import { useStore } from "@/providers/datastore";
import { requestQ } from "@/queries/requestModule";
import { Category, RequestModelT, User } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { SearchableSelect } from "../base/searchableSelect";

interface Props {
  request: RequestModelT;
  users: Array<User>;
  categories: Array<Category>;
  open: boolean;
  onOpenChange: React.Dispatch<React.SetStateAction<boolean>>;
}

// ----------------------------------------------------------------------
// VALIDATION (identique au formulaire de création : SpecialRequestForm)
// ----------------------------------------------------------------------
const formSchema = z.object({
  titre: z.string().min(1, "Le titre est requis"),
  montant: z
    .string()
    .min(1, "Le montant est requis")
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Le montant doit être un nombre positif",
    }),
  raison: z.string().optional(),
  // "today" est recalculé à chaque validation (et non figé au chargement
  // du module) pour que le verrou ne devienne pas obsolète si l'onglet
  // reste ouvert d'un jour sur l'autre.
  delai: z.date().refine((d) => {
    const minDate = new Date();
    minDate.setHours(0, 0, 0, 0);
    return d >= minDate;
  }, "Le delai d'exécution doit être dans le futur"),
  categoryId: z.coerce.number({
    message: "Veuillez sélectionner une catégorie",
  }),
  beneficiaireId: z.string().optional(),
  paytype: z.enum(["cash", "chq", "ov"], {
    required_error: "Sélectionner le moyen de payement",
    invalid_type_error: "Sélectionner le moyen de payement",
  }),
});

type FormValues = z.input<typeof formSchema>;

const valuesOf = (request: RequestModelT): FormValues => ({
  titre: request.label || "",
  montant: request.amount?.toString() || "",
  raison: request.description || undefined,
  delai: request.dueDate ? new Date(request.dueDate) : (undefined as never),
  categoryId: request.categoryId as number,
  beneficiaireId: request.benef?.[0] ? String(request.benef[0]) : undefined,
  paytype: request.paytype as FormValues["paytype"],
});

export default function EditTypeSpecial({
  request,
  users,
  categories,
  open,
  onOpenChange,
}: Props) {
  const { user } = useStore();
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: valuesOf(request),
  });

  // Remplir le formulaire avec les données existantes
  useEffect(() => {
    if (open && request) {
      form.reset(valuesOf(request));
    }
  }, [request, form, open]);

  const USERS = users
    .filter((u) => u.verified)
    .map((u) => ({
      id: u.id!,
      name: u.firstName + " " + u.lastName,
    }));

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<RequestModelT>) =>
      requestQ.specialUpdate(data, request.id),
    onSuccess: () => {
      queryClient.invalidateQueries();
      toast.success("Votre besoin a été modifié avec succès !");
      onOpenChange(false);
    },
    onError: (error: Error) => {
      console.error("Erreur lors de la modification: ", error.message);
      toast.error("Une erreur est survenue lors de la modification.");
    },
  });

  function onSubmit(values: FormValues) {
    updateMutation.mutate({
      label: values.titre,
      amount: Number(values.montant),
      dueDate: values.delai,
      description: values.raison ?? "",
      quantity: 1,
      unit: "unit",
      userId: request.userId, // Garder l'utilisateur original
      type: "speciaux",
      categoryId: values.categoryId,
      benef: Array(Number(values.beneficiaireId)),
      paytype: values.paytype,
    });
  }

  const dayStart = new Date();
  dayStart.setDate(dayStart.getDate() - 1);
  dayStart.setHours(0, 0, 0, 0);

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerEyebrow>{"Besoins"}</DrawerEyebrow>
          <DrawerTitle>
            {request?.label
              ? `Modifier - ${request.label}`
              : "Modifier le besoin"}
          </DrawerTitle>
          <DrawerDescription>
            {"Modifiez les informations du besoin spécial"}
          </DrawerDescription>
        </DrawerHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex min-h-0 flex-1 flex-col"
          >
            <DrawerBody className="grid grid-cols-1 gap-4 @min-[520px]/dialog:grid-cols-2">
              {/* TITRE */}
              <FormField
                control={form.control}
                name="titre"
                render={({ field }) => (
                  <FormItem className="col-span-full">
                    <FormLabel isRequired>
                      {"Titre du besoin spécial"}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="ex. Budget pour déplacement urgent"
                        {...field}
                      />
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
                  // 1. Filtrage des catégories spécialisées
                  const speciauxCategories = categories.filter(
                    (c) => c.type.type === "speciaux",
                  );

                  // 2. Recherche de la catégorie sélectionnée (comparaison string/string)
                  const selectedCategory = speciauxCategories.find(
                    (c) => String(c.id) === String(field.value),
                  );

                  return (
                    <FormItem className="col-span-full">
                      <FormLabel isRequired>{"Categorie"}</FormLabel>
                      <FormControl>
                        <SearchableSelect
                          onChange={field.onChange}
                          options={speciauxCategories.map((c) => ({
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

              {/* MONTANT */}
              <FormField
                control={form.control}
                name="montant"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel isRequired>{"Montant (FCFA)"}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="ex. 500000"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Recepteur pour compte */}
              <FormField
                control={form.control}
                name="beneficiaireId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel isRequired>{"Recepteur pour compte"}</FormLabel>
                    <SearchableSelect
                      width="w-full"
                      allLabel=""
                      options={USERS.filter((u) => u.id !== user?.id).map(
                        (u) => ({
                          value: u.id.toString(),
                          label: u.name,
                        }),
                      )}
                      value={field.value?.toString() || ""}
                      onChange={(value) => field.onChange(value)}
                      placeholder="Sélectionner"
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Moyen de paiement */}
              <FormField
                control={form.control}
                name="paytype"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel isRequired>{"Moyen de paiement"}</FormLabel>
                    <Select
                      value={field.value ?? ""}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">{"Espèces"}</SelectItem>
                        <SelectItem value="chq">{"Cheque"}</SelectItem>
                        <SelectItem value="ov">{"Virement"}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* DELAI */}
              <FormField
                control={form.control}
                name="delai"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel isRequired>{"Délai d'exécution"}</FormLabel>
                    <FormControl>
                      <Popover>
                        <PopoverTrigger asChild className="h-10 w-full">
                          <FormControl>
                            <Button
                              type="button"
                              variant={"outline"}
                              className="w-full pl-3 text-left font-normal"
                            >
                              {field.value ? (
                                format(field.value, "PPP", { locale: fr })
                              ) : (
                                <span>{"Choisir une date"}</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date <= dayStart}
                          />
                        </PopoverContent>
                      </Popover>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* RAISON */}
              <FormField
                control={form.control}
                name="raison"
                render={({ field }) => (
                  <FormItem className="col-span-full">
                    <FormLabel>{"Commentaire"}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Expliquez la raison de ce besoin spécial..."
                        className="resize-none min-h-[100px]"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </DrawerBody>
            <DrawerFooter pinned>
              <DrawerClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  disabled={updateMutation.isPending}
                >
                  {"Annuler"}
                </Button>
              </DrawerClose>
              <Button
                type="submit"
                disabled={updateMutation.isPending}
                isLoading={updateMutation.isPending}
                variant="primary"
              >
                {"Enregistrer les modifications"}
              </Button>
            </DrawerFooter>
          </form>
        </Form>
      </DrawerContent>
    </Drawer>
  );
}
