"use client";

import MultiSelectUsers from "@/components/base/multiSelectUsers";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
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

import { useStore } from "@/providers/datastore";
import { UserQueries } from "@/queries/baseModule";
import { ProjectQueries } from "@/queries/projectModule";
import { RequestQueries } from "@/queries/requestModule";

import { CategoryQueries } from "@/queries/categoryModule";
import { RequestModelT } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ChevronDownIcon, LoaderIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

// ----------------------------------------------------------------------
// VALIDATION
// ----------------------------------------------------------------------
const formSchema = z.object({
  projet: z.string(),
  categorie: z.string(),
  souscategorie: z.string(),
  titre: z.string().min(1),
  description: z.string(),
  quantity: z.string().refine((val) => !isNaN(Number(val)), {
    message: "Le montant doit être un nombre valide",
  }),
  unite: z.string().optional(),
  datelimite: z.date().optional(),
  beneficiaire: z.string().optional(),
  utilisateurs: z.array(z.number()).optional(), // IDs des users
});

interface UpdateRequestProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  requestData: RequestModelT | null;
  onSuccess?: () => void;
}

export default function UpdateRequest({
  open,
  setOpen,
  requestData,
  onSuccess,
}: UpdateRequestProps) {
  const { user } = useStore();

  const [openCalendar, setOpenCalendar] = useState(false);

  const [selectedUsers, setSelectedUsers] = useState<
    { id: number; name: string }[]
  >([]);

  // ----------------------------------------------------------------------
  // QUERY PROJECTS
  // ----------------------------------------------------------------------
  const projects = new ProjectQueries();
  const projectsData = useQuery({
    queryKey: ["projects"],
    queryFn: async () => projects.getAll(),
  });

  // ----------------------------------------------------------------------
  // QUERY USERS
  // ----------------------------------------------------------------------
  const users = new UserQueries();
  const usersData = useQuery({
    queryKey: ["users"],
    queryFn: async () => users.getAll(),
  });

  const USERS =
    usersData.data?.data.map((u) => ({ id: u.id!, name: u.name })) || [];

  const categoriesData = useQuery({
    queryKey: ["categories"],
    queryFn: async () => category.getCategories(),
  });

  // ----------------------------------------------------------------------
  // FORM INITIALISATION
  // ----------------------------------------------------------------------
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projet: "",
      categorie: "",
      souscategorie: "",
      titre: "",
      description: "",
      quantity: "",
      unite: "",
      datelimite: new Date(),
      beneficiaire: "",
      utilisateurs: [],
    },
  });

  const beneficiaire = form.watch("beneficiaire");
  const selectedCategorie = form.watch("categorie");

  // si on repasse à "me", on vide les utilisateurs
  useEffect(() => {
    if (beneficiaire !== "groupe") {
      setSelectedUsers([]);
      form.setValue("utilisateurs", []);
    }
  }, [beneficiaire]);

  // Réinitialiser la sous-catégorie quand la catégorie change
  useEffect(() => {
    if (selectedCategorie) {
      form.setValue("souscategorie", "");
    }
  }, [selectedCategorie, form]);

  // ----------------------------------------------------------------------
  // INITIALISATION DES DONNEES DU BESOIN
  // ----------------------------------------------------------------------
  useEffect(() => {
    if (requestData && open && categoriesData.data) {
      // Attendre que les catégories soient chargées
      const initializeForm = async () => {
        // Trouver la catégorie parente si c'est une sous-catégorie
        const categoryId = requestData.category;
        let categorieValue = "";
        let sousCategorieValue = "";

        const category = categoriesData.data.data.find(
          (cat) => cat.id === Number(categoryId)
        );

        if (category) {
          if (category.parentId === null) {
            // C'est une catégorie parente
            categorieValue = category.id!.toString();
          } else {
            // C'est une sous-catégorie
            sousCategorieValue = category.id!.toString();
            categorieValue = category.parentId!.toString();
          }
        }

        // Préparer les utilisateurs sélectionnés si bénéficiaire = groupe
        const usersSelection: { id: number; name: string }[] = [];
        if (requestData.beneficiary === "groupe" && requestData.benef) {
          const benefIds = Array.isArray(requestData.benef)
            ? requestData.benef
            : [];
          benefIds.forEach((id: number) => {
            const user = USERS.find((u) => u.id === id);
            if (user) usersSelection.push(user);
          });
          setSelectedUsers(usersSelection);
        }

        // Réinitialiser le formulaire avec les valeurs
        form.reset({
          projet: requestData.projectId?.toString(),
          categorie: categorieValue,
          souscategorie: sousCategorieValue,
          titre: requestData.label || "",
          description: requestData.description || "",
          quantity: requestData.quantity?.toString() || "",
          unite: requestData.unit || "",
          datelimite: requestData.dueDate
            ? new Date(requestData.dueDate)
            : new Date(),
          beneficiaire: requestData.beneficiary || "me",
          utilisateurs: usersSelection.map((u) => u.id),
        });

        // Forcer la mise à jour de la sous-catégorie après un court délai
        if (sousCategorieValue) {
          setTimeout(() => {
            form.setValue("souscategorie", sousCategorieValue);
          }, 50);
        }
      };

      initializeForm();
    }
  }, [requestData, open, categoriesData.data, form]);

  // Ajouter un état pour suivre le chargement des données
  const [isFormInitialized, setIsFormInitialized] = useState(false);

  // Et modifier l'useEffect comme ceci :
  // Et modifier l'useEffect comme ceci :
  useEffect(() => {
    if (requestData && open && categoriesData.data && USERS.length > 0) {
      const initializeForm = async () => {
        // Trouver la catégorie parente si c'est une sous-catégorie
        const categoryId = requestData.categoryId;
        let categorieValue = "";
        let sousCategorieValue = "";

        const category = categoriesData.data.data.find(
          (cat) => cat.id === Number(categoryId)
        );

        if (category) {
          if (category.parentId === null) {
            // C'est une catégorie parente
            categorieValue = category.id!.toString();
          } else {
            // C'est une sous-catégorie
            sousCategorieValue = category.id!.toString();
            categorieValue = category.parentId!.toString();
          }
        }

        // Préparer les utilisateurs sélectionnés si bénéficiaire = groupe
        const usersSelection: { id: number; name: string }[] = [];
        if (
          requestData.beneficiary === "groupe" &&
          requestData.beficiaryList?.flatMap((b) => b.id)
        ) {
          const benefIds = Array.isArray(
            requestData.beficiaryList?.flatMap((b) => b.id)
          )
            ? requestData.beficiaryList?.flatMap((b) => b.id)
            : [];
          benefIds.forEach((id: number) => {
            const user = USERS.find((u) => u.id === id);
            if (user) usersSelection.push(user);
          });
          setSelectedUsers(usersSelection);
        }

        // Réinitialiser le formulaire avec les valeurs
        form.reset({
          projet: requestData.projectId?.toString() || "",
          categorie: categorieValue,
          souscategorie: sousCategorieValue,
          titre: requestData.label || "",
          description: requestData.description || "",
          quantity: requestData.quantity?.toString() || "",
          unite: requestData.unit || "",
          datelimite: requestData.dueDate
            ? new Date(requestData.dueDate)
            : new Date(),
          beneficiaire: requestData.beneficiary || "me",
          utilisateurs: usersSelection.map((u) => u.id),
        });

        // Forcer la mise à jour de la sous-catégorie après un court délai
        if (sousCategorieValue) {
          setTimeout(() => {
            form.setValue("souscategorie", sousCategorieValue, {
              shouldValidate: true,
              shouldDirty: false,
              shouldTouch: false,
            });
          }, 100);
        }

        setIsFormInitialized(true);
      };

      initializeForm();
    } else {
      setIsFormInitialized(false);
    }
  }, [requestData, open, categoriesData.data, USERS.length, form]);

  // ----------------------------------------------------------------------
  // REQUEST MUTATION
  // ----------------------------------------------------------------------
  const request = new RequestQueries();
  const category = new CategoryQueries();
  const requestMutation = useMutation({
    mutationKey: ["requests", "update"],
    mutationFn: async (data: Partial<RequestModelT>) => {
      if (!requestData?.id) throw new Error("ID du besoin manquant");
      return request.update(Number(requestData.id), data);
    },

    onSuccess: () => {
      toast.success("Besoin modifié avec succès !");
      setOpen(false);
      onSuccess?.();
    },

    onError: () =>
      toast.error("Une erreur est survenue lors de la modification."),
  });

  // Filtrer les catégories parentes (parentId === null)
  const categories =
    categoriesData.data?.data.filter((cat) => cat.parentId === null) || [];

  // Filtrer les sous-catégories en fonction de la catégorie sélectionnée
  const souscategories = selectedCategorie
    ? categoriesData.data?.data.filter(
        (cat) =>
          cat.parentId !== null &&
          cat.parentId?.toString() === selectedCategorie
      ) || []
    : [];

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!requestData?.id) {
      toast.error("ID du besoin manquant");
      return;
    }

    requestMutation.mutate({
      label: values.titre,
      description: values.description || null,
      categoryId: Number(values.souscategorie || values.categorie),
      quantity: Number(values.quantity),
      unit: values.unite!,
      beneficiary: values.beneficiaire!,
      benef: values.beneficiaire === "groupe" ? values.utilisateurs! : null,
      userId: Number(user?.id),
      dueDate: values.datelimite!,
      projectId: Number(values.projet),
      state: requestData?.state || "pending",
      proprity: requestData?.proprity || "medium",
    });
  }

  // ----------------------------------------------------------------------
  // RENDER
  // ----------------------------------------------------------------------
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[760px] w-full max-h-[80vh] p-0 gap-0 flex flex-col">
        {/* Header avec fond bordeaux - FIXE */}
        <DialogHeader className="bg-[#8B1538] text-white p-6 m-4 rounded-lg pb-8 shrink-0">
          <DialogTitle className="text-xl font-semibold text-white">
            Modifier le besoin
          </DialogTitle>
          <p className="text-sm text-white/80 mt-1">
            Modifiez les informations du besoin existant
          </p>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex-1 flex flex-col"
          >
            {/* Contenu du formulaire - SCROLLABLE */}
            <div className="flex-1 overflow-y-auto px-12 pb-12">
              <div className="space-y-8 max-w-3xl mx-auto">
                <div className="flex flex-col md:grid md:grid-cols-2 gap-4">
                  {/* PROJET */}
                  <FormField
                    control={form.control}
                    name="projet"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Projet concerné</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full h-10! shadow-none! rounded! py-1">
                              <SelectValue placeholder="Sélectionner un projet" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {projectsData.data?.data.map((p) => (
                              <SelectItem key={p.id} value={p.id!.toString()}>
                                {p.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* CATEGORIE */}
                  <FormField
                    control={form.control}
                    name="categorie"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Catégorie</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full h-10! shadow-none! rounded! py-1">
                              <SelectValue placeholder="Sélectionner une catégorie" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories?.map((c) => (
                              <SelectItem key={c.id} value={c.id!.toString()}>
                                {c.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* SOUS-CATEGORIE */}
                  <FormField
                    control={form.control}
                    name="souscategorie"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sous-catégorie</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={!selectedCategorie}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full h-10! shadow-none! rounded! py-1">
                              <SelectValue
                                placeholder={
                                  !selectedCategorie
                                    ? "Sélectionnez d'abord une catégorie"
                                    : "Sélectionner une sous-catégorie"
                                }
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {souscategories.length > 0 ? (
                              souscategories.map((c) => (
                                <SelectItem key={c.id} value={c.id!.toString()}>
                                  {c.label}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="no-subcategory" disabled>
                                {"Aucune sous-catégorie disponible"}
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* TITRE */}
                  <FormField
                    control={form.control}
                    name="titre"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Titre</FormLabel>
                        <FormControl>
                          <Input placeholder="Titre du besoin" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* DESCRIPTION */}
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            className="resize-none"
                            placeholder="Décrivez le besoin en détail..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* DATE LIMITE */}
                  <FormField
                    control={form.control}
                    name="datelimite"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date limite</FormLabel>
                        <FormControl>
                          <Popover
                            open={openCalendar}
                            onOpenChange={setOpenCalendar}
                          >
                            <PopoverTrigger
                              asChild
                              className="h-10! w-full! rounded! shadow-none!"
                            >
                              <Button
                                variant="outline"
                                className="w-full justify-between"
                              >
                                {field.value
                                  ? format(field.value, "PPP", { locale: fr })
                                  : "Sélectionner une date"}
                                <ChevronDownIcon />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent align="start" className="p-0">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={(d) => {
                                  field.onChange(d);
                                  setOpenCalendar(false);
                                }}
                                locale={fr}
                              />
                            </PopoverContent>
                          </Popover>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* QUANTITE */}
                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantité</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="ex. 10"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* UNITE */}
                  <FormField
                    control={form.control}
                    name="unite"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unité</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full h-10! shadow-none! rounded! py-1">
                              <SelectValue placeholder="Sélectionner l'unité" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="KG">KG</SelectItem>
                            <SelectItem value="L">Litre</SelectItem>
                            <SelectItem value="FCFA">FCFA</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* BENEFICIAIRE */}
                  <FormField
                    control={form.control}
                    name="beneficiaire"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bénéficiaire</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full h-10! shadow-none! rounded! py-1">
                              <SelectValue placeholder="Sélectionner" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="me">Soi-même</SelectItem>
                            <SelectItem value="groupe">Groupe</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* MULTISELECT CONDITIONNEL */}
                  {beneficiaire === "groupe" && (
                    <FormField
                      control={form.control}
                      name="utilisateurs"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Utilisateurs</FormLabel>

                          <MultiSelectUsers
                            display="user"
                            users={USERS}
                            selected={selectedUsers}
                            onChange={(list) => {
                              setSelectedUsers(list);
                              field.onChange(list.map((u) => u.id));
                            }}
                          />

                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Boutons - FIXE */}
            <div className="flex gap-4 justify-end p-6 pt-0 shrink-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={requestMutation.isPending}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={requestMutation.isPending}
                className="bg-[#8B1538] hover:bg-[#7A1230]"
              >
                Modifier le besoin
                {requestMutation.isPending && (
                  <LoaderIcon className="ml-2 h-4 w-4 animate-spin" />
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
