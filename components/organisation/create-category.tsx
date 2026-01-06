"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStore } from "@/providers/datastore";
import { UserQueries } from "@/queries/baseModule";
import { CategoryQueries } from "@/queries/categoryModule";
import { Category, ResponseT } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { useEffect, useRef } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { SearchableSelect } from "../base/searchableSelect";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Textarea } from "../ui/textarea";

export interface ActionResponse<T = any> {
  success: boolean;
  message: string;
  errors?: {
    [K in keyof T]?: string[];
  };
  inputs?: T;
}

export const formSchema = z.object({
  label: z.string().min(1, { message: "Ce champ est obligatoire" }),
  validators: z
    .array(
      z.object({
        userId: z.number().min(1, "Sélectionnez un utilisateur"),
        rank: z.number().min(1).max(3),
      })
    )
    .min(1, "Sélectionnez au moins un utilisateur")
    .max(3, "Maximum 3 ascendants autorisés")
    .optional()
    .default([]),
  description: z.string().min(1, { message: "Ce champ est obligatoire" }),
});

type Schema = z.infer<typeof formSchema>;

export function CategoryCreateForm() {
  const intentRef = useRef<"save" | "saveAndCreate">("save");
  const form = useForm<Schema>({
    resolver: zodResolver(formSchema as any),
    defaultValues: {
      label: "",
      description: "",
      validators: [],
    },
  });

  // Field array pour gérer les ascendants
  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: "validators",
  });

  const categoryQueries = new CategoryQueries();
  const { isHydrated } = useStore();

  // Récupérer la liste des utilisateurs
  const userQueries = new UserQueries();
  const usersData = useQuery({
    queryKey: ["users-list"],
    queryFn: () => userQueries.getAll(),
    enabled: isHydrated,
  });

  const categoryApi = useMutation({
    mutationKey: ["createCategory"],
    mutationFn: (
      data: Omit<Category, "updatedAt" | "createdAt" | "id"> & {
        parentId?: number;
        description?: string;
        validators?: { userId: number; rank: number }[];
      }
    ) => categoryQueries.createCategory(data),
    onSuccess: (data: ResponseT<Category>) => {
      toast.success("Catégorie créée avec succès !");
      console.log("created successful:", data);
      form.reset();
    },
    onError: (error: any) => {
      toast.error(
        "Une erreur est survenue lors de la creation de la categorie."
      );
      console.error("Register error:", error);
    },
  });

  // Fonction pour ajouter un ascendant
  const addValidator = () => {
    if (fields.length >= 3) {
      toast.error("Maximum 3 ascendants autorisés");
      return;
    }

    const users = usersData.data?.data || [];
    if (users.length === 0) {
      toast.error("Aucun utilisateur disponible");
      return;
    }

    // Trouver un utilisateur qui n'est pas déjà sélectionné
    const existingUserIds = fields.map((field) => field.userId);
    const availableUser = users.find(
      (user) => !existingUserIds.includes(user.id!)
    );

    if (!availableUser) {
      toast.error("Tous les utilisateurs sont déjà sélectionnés");
      return;
    }

    append({
      userId: availableUser.id!,
      rank: fields.length + 1,
    });
  };

  // Fonction pour déplacer un ascendant vers le haut
  const moveUp = (index: number) => {
    if (index > 0) {
      move(index, index - 1);
      // Mettre à jour les rangs après le déplacement
      const validators = form.getValues("validators") || [];
      validators.forEach((validator, idx) => {
        form.setValue(`validators.${idx}.rank`, idx + 1);
      });
    }
  };

  // Fonction pour déplacer un ascendant vers le bas
  const moveDown = (index: number) => {
    if (index < fields.length - 1) {
      move(index, index + 1);
      // Mettre à jour les rangs après le déplacement
      const validators = form.getValues("validators") || [];
      validators.forEach((validator, idx) => {
        form.setValue(`validators.${idx}.rank`, idx + 1);
      });
    }
  };

  // Fonction pour obtenir le nom d'un utilisateur par son ID
  const getUserName = (userId: number) => {
    const users = usersData.data?.data || [];
    const user = users.find((u) => u.id === userId);
    return user?.firstName + " " + user?.lastName || `Utilisateur #${userId}`;
  };

  // Fonction pour obtenir les utilisateurs disponibles (non sélectionnés)
  const getAvailableUsers = (currentIndex?: number) => {
    const users = usersData.data?.data || [];
    const existingUserIds = fields
      .map((field, index) => {
        // Si on est en train d'éditer un champ, exclure son propre userId
        if (currentIndex !== undefined && index === currentIndex) {
          return null;
        }
        return field.userId;
      })
      .filter((id) => id !== null);

    return users.filter((user) => !existingUserIds.includes(user.id!));
  };

  const onsubmit = (values: z.infer<typeof formSchema>) => {
    // Préparer les ascendants avec les rangs mis à jour
    const validators =
      values.validators?.map((validator, index) => ({
        userId: validator.userId,
        rank: index + 1,
      })) || [];

    const data: Omit<Category, "updatedAt" | "createdAt" | "id"> & {
      parentId?: number;
      description?: string;
    } = {
      label: values.label,
      validators: validators,
    };

    if (values.description) {
      data.description = values.description;
    }
    categoryApi.mutate(data);
  };

  // Mettre à jour automatiquement les rangs quand le nombre de ascendants change
  useEffect(() => {
    const validators = form.getValues("validators") || [];
    validators.forEach((validator, index) => {
      form.setValue(`validators.${index}.rank`, index + 1);
    });
  }, [fields.length, form]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onsubmit)}
        className="grid grid-cols-3 gap-6 max-w-[1000px]"
      >
        {/* Informations de base */}
        <div className="flex flex-col gap-2">
          <FormField
            control={form.control}
            name="label"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{"Titre de la catégorie *"}</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Madiba AutoRoute" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Description de la catégorie"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Section des ascendants */}
        <div className="space-y-4 border rounded-lg p-4 bg-muted/20 col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <FormLabel className="text-lg font-semibold">
                {"Définissez les ascendants"}
              </FormLabel>
              <p className="text-sm text-muted-foreground">
                {
                  "Ajoutez jusqu'à 3 ascendants dans l'ordre d'approbation souhaité"
                }
              </p>
            </div>
            {/* <Button
              type="button"
              variant="outline"
              onClick={addValidator}
              disabled={fields.length >= 3}
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un ascendant
            </Button> */}
          </div>

          {/* Liste des ascendants */}
          {fields.length > 0 ? (
            <div className="space-y-3">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="border rounded-lg p-4 bg-white space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge className="bg-primary text-primary-foreground text-[16px] p-2">
                        Position {index + 1}
                        {index === fields.length - 1 && (
                          <span className="ml-1">(Dernier)</span>
                        )}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => moveUp(index)}
                        disabled={index === 0}
                        title="Déplacer vers le haut"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => moveDown(index)}
                        disabled={index === fields.length - 1}
                        title="Déplacer vers le bas"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                        className="text-red-500 hover:text-red-700"
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name={`validators.${index}.userId`}
                    render={({ field }) => {
                      const availableUsers = getAvailableUsers(index);
                      return (
                        <FormItem>
                          <FormLabel>{"Nom de l'ascendant *"}</FormLabel>
                          {/* <Select
                            value={field.value?.toString() || ""}
                            onValueChange={(value) =>
                              field.onChange(parseInt(value))
                            }
                          >
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Sélectionner un utilisateur">
                                  {field.value
                                    ? getUserName(field.value)
                                    : "Sélectionner un utilisateur"}
                                </SelectValue>
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {availableUsers.length > 0 ? (
                                availableUsers.map((user) => (
                                  <SelectItem
                                    key={user.id}
                                    value={user.id!.toString()}
                                  >
                                    {user.name}
                                  </SelectItem>
                                ))
                              ) : (
                                <SelectItem value="" disabled>
                                  Aucun utilisateur disponible
                                </SelectItem>
                              )}
                            </SelectContent>
                          </Select> */}
                          <SearchableSelect
                            width="w-full"
                            allLabel=""
                            options={
                              availableUsers.length > 0
                                ? availableUsers.map((user) => ({
                                  value: user.id!.toString(),
                                  label: user.firstName + " " + user.lastName,
                                }))
                                : []
                            }
                            value={field.value?.toString() || ""}
                            onChange={(value) =>
                              field.onChange(parseInt(value))
                            }
                            placeholder="Sélectionner"
                          />
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />

                  {/* Champ caché pour le rang */}
                  <FormField
                    control={form.control}
                    name={`validators.${index}.rank`}
                    render={({ field }) => <input type="hidden" {...field} />}
                  />
                </div>
              ))}
              {/* Je vérifie qu'il y'a encore des utilisateurs disponible  */}
              {getAvailableUsers(fields.length - 1).length > 0 && (
                <div className="flex flex-col items-center justify-center mt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addValidator}
                    disabled={fields.length >= 3}
                    className="h-12 w-12 rounded-full bg-muted flex items-center justify-center"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  {"Ajouter un ascendant"}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-6 border rounded-lg bg-muted/10">
              <div className="flex flex-col items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={addValidator}
                  disabled={fields.length >= 3}
                  className="h-12 w-12 rounded-full bg-muted flex items-center justify-center"
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <p className="text-muted-foreground">
                  Aucun ascendant configuré
                </p>
                <p className="text-sm text-muted-foreground">
                  {`Cliquez sur "+" pour configurer la chaîne d'approbation`}
                </p>
              </div>
            </div>
          )}

          {/* Messages d'erreur pour l'ensemble du tableau */}
          {form.formState.errors.validators && (
            <div className="text-sm text-red-500">
              {form.formState.errors.validators.message}
            </div>
          )}
        </div>

        {/* Bouton de soumission */}
        <div className="@min-[540px]:col-span-3 ml-auto">
          <Button
            type="submit"
            variant={"primary"}
            disabled={categoryApi.isPending}
          >
            {categoryApi.isPending ? "Création..." : "Enregistrer la catégorie"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
