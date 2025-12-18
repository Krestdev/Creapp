"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStore } from "@/providers/datastore";
import { CategoryQueries } from "@/queries/categoryModule";
import { RequestQueries } from "@/queries/requestModule";
import { Category, ResponseT } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Trash2, Plus, ChevronUp, ChevronDown } from "lucide-react";
import { useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { UserQueries } from "@/queries/baseModule";

export interface ActionResponse<T = any> {
  success: boolean;
  message: string;
  errors?: {
    [K in keyof T]?: string[];
  };
  inputs?: T;
}

export const formSchema = z.object({
  label: z.string({ message: "This field is required" }),
  validators: z.array(
    z.object({
      userId: z.number().min(1, "Sélectionnez un utilisateur"),
      rank: z.number().min(1).max(3),
    })
  ).max(3, "Maximum 3 validateurs autorisés").optional().default([]),
  description: z.string().optional(),
});

type Schema = z.infer<typeof formSchema>;

export function CategoryCreateForm() {
  const form = useForm<Schema>({
    resolver: zodResolver(formSchema as any),
    defaultValues: {
      label: "",
      description: "",
      validators: [],
    },
  });

  // Field array pour gérer les validateurs
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

  // Fonction pour ajouter un validateur
  const addValidator = () => {
    if (fields.length >= 3) {
      toast.error("Maximum 3 validateurs autorisés");
      return;
    }

    const users = usersData.data?.data || [];
    if (users.length === 0) {
      toast.error("Aucun utilisateur disponible");
      return;
    }

    // Trouver un utilisateur qui n'est pas déjà sélectionné
    const existingUserIds = fields.map(field => field.userId);
    const availableUser = users.find(user => !existingUserIds.includes(user.id!));

    if (!availableUser) {
      toast.error("Tous les utilisateurs sont déjà sélectionnés");
      return;
    }

    append({
      userId: availableUser.id!,
      rank: fields.length + 1, 
    });
  };

  // Fonction pour déplacer un validateur vers le haut
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

  // Fonction pour déplacer un validateur vers le bas
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
    const user = users.find(u => u.id === userId);
    return user?.name || `Utilisateur #${userId}`;
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
      .filter(id => id !== null);

    return users.filter(user => !existingUserIds.includes(user.id!));
  };

  const onsubmit = (values: z.infer<typeof formSchema>) => {
    
// Préparer les validateurs avec les rangs mis à jour
    const validators = values.validators?.map((validator, index) => ({
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

  // Mettre à jour automatiquement les rangs quand le nombre de validateurs change
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
        className="grid grid-cols-1 gap-6"
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
                  <Input placeholder="Description de la catégorie" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Section des validateurs */}
        <div className="space-y-4 border rounded-lg p-4 bg-muted/20">
          <div className="flex items-center justify-between">
            <div>
              <FormLabel className="text-lg font-semibold">
                Chaîne de validation
              </FormLabel>
              <p className="text-sm text-muted-foreground">
                Ajoutez jusqu'à 3 validateurs dans l'ordre de validation
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={addValidator}
              disabled={fields.length >= 3}
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un validateur
            </Button>
          </div>

          {/* Liste des validateurs */}
          {fields.length > 0 ? (
            <div className="space-y-3">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="border rounded-lg p-4 bg-white space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge className="bg-primary text-primary-foreground">
                        Position {index + 1}
                        {index === fields.length - 1 && (
                          <span className="ml-1">(Dernier)</span>
                        )}
                      </Badge>
                      {index === 0 && (
                        <Badge variant="outline">Premier validateur</Badge>
                      )}
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
                          <FormLabel>Utilisateur validateur *</FormLabel>
                          <Select
                            value={field.value?.toString() || ""}
                            onValueChange={(value) =>
                              field.onChange(parseInt(value))
                            }
                          >
                            <FormControl>
                              <SelectTrigger>
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
                                    {user.name} ({user.email})
                                  </SelectItem>
                                ))
                              ) : (
                                <SelectItem value="" disabled>
                                  Aucun utilisateur disponible
                                </SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />

                  {/* Champ caché pour le rang */}
                  <FormField
                    control={form.control}
                    name={`validators.${index}.rank`}
                    render={({ field }) => (
                      <input type="hidden" {...field} />
                    )}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 border rounded-lg bg-muted/10">
              <div className="flex flex-col items-center gap-2">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                  <Plus className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">
                  Aucun validateur configuré
                </p>
                <p className="text-sm text-muted-foreground">
                  Cliquez sur "Ajouter un validateur" pour configurer la chaîne de validation
                </p>
              </div>
            </div>
          )}

          {/* Indicateur de progression */}
          {fields.length > 0 && (
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">Premier validateur</span>
                <span className="text-muted-foreground">Dernier validateur</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${(fields.length / 3) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Position 1</span>
                <span>Position {fields.length}</span>
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
        <div className="@min-[540px]:col-span-2">
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