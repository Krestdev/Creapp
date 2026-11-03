"use client";

import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import { useStore } from "@/providers/datastore";
import { requestQ } from "@/queries/requestModule";
import { Category, ProjectT, RequestModelT, User } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { SearchableSelect } from "../base/searchableSelect";
import FilesUpload from "../comp-547";
import { Calendar } from "../ui/calendar";
import BeneficiairesList from "./AddBenef";

// ----------------------------------------------------------------------
// VALIDATION (identique au formulaire de création : FacilitationRequestForm)
// ----------------------------------------------------------------------
const SingleFileSchema = z
  .array(
    z.union([
      z.instanceof(File, { message: "Doit être un fichier valide" }),
      z.string(),
    ]),
  )
  .max(1, "Pas plus d'un document")
  .default([]);

const formSchema = z.object({
  beneficiaire: z.string().min(1, "Le bénéficiaire est requis"),
  projet: z.string().min(1, "Le projet est requis"),
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
  title: z.string().min(1, "Le titre est requis"),
  description: z.string().min(1, "La description est requise"),
  justificatif: SingleFileSchema,
});

type FormInput = z.input<typeof formSchema>;

interface UpdateFacilitationRequestProps {
  open: boolean;
  onOpenChange: React.Dispatch<React.SetStateAction<boolean>>;
  requestData: RequestModelT;
  users: Array<User>;
  projects: Array<ProjectT>;
  categories: Array<Category>;
}

export default function UpdateRequestFac({
  open,
  onOpenChange,
  requestData,
  users,
  projects,
  categories,
}: UpdateFacilitationRequestProps) {
  const { user } = useStore();
  const queryClient = useQueryClient();

  const [beneficiairesList, setBeneficiairesList] = useState<
    { id: number; nom: string; montant: number }[]
  >([]);

  // ----------------------------------------------------------------------
  // FORM INITIALISATION
  // ----------------------------------------------------------------------
  const form = useForm<FormInput>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      beneficiaire: "",
      projet: "",
      categoryId: undefined,
      delai: undefined,
      justificatif: [],
      title: "",
      description: "",
    },
  });

  // ----------------------------------------------------------------------
  // INITIALISATION DES DONNÉES
  // ----------------------------------------------------------------------

  const [prevOpen, setPrevOpen] = useState(false);
  const [prevRequestDataId, setPrevRequestDataId] = useState<number | null>(
    null,
  );

  if (open !== prevOpen || requestData?.id !== prevRequestDataId) {
    setPrevOpen(open);
    setPrevRequestDataId(requestData?.id ?? null);
    if (open && requestData) {
      if (requestData.benFac?.list) {
        setBeneficiairesList(
          requestData.benFac.list.map((item: any) => ({
            id: item.id,
            nom: item.name,
            montant: item.amount,
          })),
        );
      } else {
        setBeneficiairesList([]);
      }
    }
  }

  useEffect(() => {
    if (open && users.length > 0) {
      try {
        // Réinitialiser le formulaire avec les valeurs
        form.reset({
          beneficiaire: requestData.beneficiary?.toString() || "",
          projet: requestData.projectId?.toString() || "",
          categoryId: requestData.categoryId,
          delai: requestData.dueDate
            ? new Date(requestData.dueDate)
            : new Date(),
          title: requestData.label || "",
          description: requestData.description || "",
          justificatif: requestData.proof ?? [],
        });
      } catch (error) {
        console.error("Erreur lors de l'initialisation du formulaire:", error);
        toast.error("Erreur lors du chargement des données");
      }
    }
  }, [requestData, open, users, form]);

  // ----------------------------------------------------------------------
  // UPDATE MUTATION
  // ----------------------------------------------------------------------

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<RequestModelT>) => {
      if (!requestData?.id) throw new Error("ID de la demande manquant");
      return requestQ.specialUpdate(data, Number(requestData.id));
    },

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

  function onSubmit(values: FormInput) {
    if (!requestData?.id) {
      toast.error("ID de la demande manquant");
      return;
    }
    if (beneficiairesList.length === 0) {
      toast.error("Veuillez ajouter au moins un bénéficiaire.");
      return;
    }

    // Préparation des données pour la mise à jour
    const requestDataUpdate: Partial<RequestModelT> = {
      label: values.title,
      description: values.description ?? "",
      categoryId: values.categoryId,
      quantity: 1,
      unit: "unit",
      beneficiary: values.beneficiaire,
      benef: Array(user?.id),
      userId: requestData.userId, // Garder l'utilisateur original
      dueDate: values.delai,
      projectId: Number(values.projet),
      proof: values.justificatif,
      amount: beneficiairesList.reduce((total, b) => total + b.montant, 0),
      type: "facilitation",
      // Garder les valeurs originales pour les champs non modifiables
      state: requestData?.state || "pending",
      priority: requestData?.priority || "medium",
      benFac: {
        list: beneficiairesList.map((b) => ({
          id: b.id,
          name: b.nom,
          amount: b.montant,
        })),
      },
    };

    updateMutation.mutate(requestDataUpdate);
  }

  const dayStart = new Date();
  dayStart.setDate(dayStart.getDate() - 1);
  dayStart.setHours(0, 0, 0, 0);

  // ----------------------------------------------------------------------
  // RENDER
  // ----------------------------------------------------------------------
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        {/* Header - FIXE EN HAUT */}
        <DrawerHeader>
          <DrawerEyebrow>{"Besoins"}</DrawerEyebrow>
          <DrawerTitle>{requestData.label}</DrawerTitle>
          <DrawerDescription>
            {"Modifiez les informations du besoin"}
          </DrawerDescription>
        </DrawerHeader>

        <Form {...form}>
          <DrawerBody>
            {/* Contenu scrollable */}
            <div className="flex flex-col @min-[640px]/dialog:grid @min-[640px]/dialog:grid-cols-2 gap-4 [&>*]:min-w-0">
              {/* PROJET */}
              <FormField
                control={form.control}
                name="projet"
                render={({ field }) => (
                  <FormItem className="col-span-full">
                    <FormLabel isRequired>{"Projet concerné"}</FormLabel>
                    <SearchableSelect
                      onChange={field.onChange}
                      options={
                        projects
                          ?.filter(
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
                      value={field.value}
                      width="w-full"
                      allLabel=""
                      wrapText
                      placeholder="Sélectionner un projet"
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Category */}
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => {
                  // 1. Filtrer les catégories de type "facilitation"
                  const facilitationCategories = categories.filter(
                    (c) => c.type.type === "facilitation",
                  );

                  // 2. Trouver l'objet sélectionné (en comparant les IDs comme des Strings)
                  const selectedCategory = facilitationCategories.find(
                    (c) => String(c.id) === String(field.value),
                  );

                  return (
                    <FormItem className="col-span-full">
                      <FormLabel isRequired>{"Categorie"}</FormLabel>
                      <FormControl>
                        <SearchableSelect
                          onChange={field.onChange}
                          options={facilitationCategories.map((c) => ({
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

              {/* TITLE */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel isRequired>{"Titre"}</FormLabel>
                    <Input
                      {...field}
                      placeholder="ex. Achat du carburant groupe"
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description/Détail */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="@min-[640px]/dialog:col-span-2">
                    <FormLabel isRequired>{"Description/Détail"}</FormLabel>
                    <Textarea {...field} placeholder="Décrivez le besoin" />
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
                    <FormLabel isRequired>{"Date limite"}</FormLabel>
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

              {/* LISTE DES BÉNÉFICIAIRES */}
              <div className="@min-[640px]/dialog:col-span-2">
                <BeneficiairesList
                  onBeneficiairesChange={setBeneficiairesList}
                  initialBeneficiaires={beneficiairesList}
                />
              </div>

              {/* BENEFICIAIRE */}
              <FormField
                control={form.control}
                name="beneficiaire"
                render={({ field }) => (
                  <FormItem className="@min-[640px]/dialog:col-span-2">
                    <FormLabel isRequired>{"Recepteur pour compte"}</FormLabel>
                    <Combobox
                      items={users.filter((u) => u.verified)}
                      value={
                        users.find(
                          (user) => user.id.toString() === field.value,
                        ) ?? null
                      }
                      onValueChange={(v) =>
                        field.onChange(v?.id.toString() ?? "")
                      }
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
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* JUSTIFICATIF */}
              <FormField
                control={form.control}
                name="justificatif"
                render={({ field }) => (
                  <FormItem className="@min-[640px]/dialog:col-span-2">
                    <FormLabel>{"Justificatif"}</FormLabel>
                    <FormControl>
                      <FilesUpload
                        value={field.value || []}
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
            </div>
          </DrawerBody>
          {/* Boutons - FIXE EN BAS */}
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
              variant="primary"
              disabled={updateMutation.isPending || !requestData}
              isLoading={updateMutation.isPending}
              onClick={form.handleSubmit(onSubmit)}
            >
              {"Modifier la demande"}
            </Button>
          </DrawerFooter>
        </Form>
      </DrawerContent>
    </Drawer>
  );
}
