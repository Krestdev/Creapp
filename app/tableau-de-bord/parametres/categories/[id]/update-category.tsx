"use client";
import ErrorPage from "@/components/error-page";
import LoadingPage from "@/components/loading-page";
import PageTitle from "@/components/pageTitle";
import { Badge } from "@/components/ui/badge";
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { userQ } from "@/queries/baseModule";
import { categoryQ } from "@/queries/categoryModule";
import { requestTypeQ } from "@/queries/requestType";
import { Category, RequestType, ResponseT, User } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

export const formSchema = z.object({
  label: z.string({ message: "This field is required" }),
  validators: z
    .array(
      z.object({
        id: z.number().optional(), // ID existant pour les ascendants
        userId: z.number().min(1, "Sélectionnez un utilisateur"),
        rank: z.number().min(1).max(3),
      }),
    )
    .min(1, "Au moins un ascendant est requis") // MODIFICATION: minimum 1 validateur
    .max(3, "Maximum 3 ascendants autorisés"),
  description: z.string().optional(),
  requestTypeId: z.coerce.number({ message: "Veuillez sélectionner un type" }),
});

type Schema = z.infer<typeof formSchema>;

export default function UpdateCategory({ id }: { id: number }) {
  const router = useRouter();

  const getCategories = useQuery({
    queryKey: ["categoryList"],
    queryFn: categoryQ.getCategories,
  });
  const getUsers = useQuery({
    queryKey: ["users"],
    queryFn: userQ.getAll,
  });
  const getRequestTypes = useQuery({
    queryKey: ["types"],
    queryFn: requestTypeQ.getAll,
  });
  const usersList = useMemo(() => {
    if (!getUsers.isSuccess) return [];
    return getUsers.data.data;
  }, [getUsers]);
  const categories = useMemo(() => {
    if (!getCategories.isSuccess) return [];
    return getCategories.data.data;
  }, [getCategories]);
  const requestTypes = useMemo(() => {
    if (!getRequestTypes.isSuccess) return [];
    return getRequestTypes.data.data;
  }, [getRequestTypes]);

  //Let's retrieve the category
  const category = categories.find((c) => c.id === id);

  const form = useForm<Schema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      label: category?.label || "",
      description: category?.description || "",
      validators: category?.validators || [],
      requestTypeId: category?.requestTypeId || 0,
    },
  });

  useEffect(() => {
    if (category) {
      form.reset({
        label: category.label,
        description: category.description,
        validators: category.validators,
        requestTypeId: category.requestTypeId,
      });
    }
  }, [category]);

  // Field array pour gérer les ascendants
  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: "validators",
  });

  // Réinitialiser le formulaire quand les données changent
  useEffect(() => {
    if (category) {
      const validators = category.validators || [];

      // S'assurer qu'il y a au moins un validateur
      if (validators.length === 0 && category.id !== 0) {
        toast.warning(
          "Cette catégorie n'a pas d'ascendant. Veuillez en ajouter au moins un.",
        );
      }

      form.reset({
        label: category.label || "",
        description: category.description || "",
        validators: validators.map((validator) => ({
          id: validator.id,
          userId: validator.userId,
          rank: validator.rank,
        })),
        requestTypeId: category.requestTypeId,
      });
    }
  }, [category, form]);

  const categoryApi = useMutation({
    mutationFn: async (data: Partial<Category>) => {
      return await categoryQ.updateCategory(category?.id!, data);
    },
    onSuccess: () => {
      toast.success("Catégorie mise à jour avec succès !");
      router.push("./");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Fonction pour ajouter un ascendant
  const addValidator = () => {
    if (fields.length >= 3) {
      toast.error("Maximum 3 ascendants autorisés");
      return;
    }

    const users = usersList.filter((u) => u.verified) || [];
    if (users.length === 0) {
      toast.error("Aucun utilisateur disponible");
      return;
    }

    // Trouver un utilisateur qui n'est pas déjà sélectionné
    const existingUserIds = fields.map((field) => field.userId);
    const availableUser = users.find(
      (user) => !existingUserIds.includes(user.id!),
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

  // MODIFICATION: Fonction pour supprimer un ascendant avec vérification
  const removeValidator = (index: number) => {
    // Vérifier qu'on ne supprime pas le dernier ascendant
    if (fields.length <= 1) {
      toast.error("Au moins un ascendant doit être présent");
      return;
    }

    // Vérifier si c'est un ascendant existant (avec ID)
    const validator = fields[index];
    if (validator.id) {
      remove(index);
    } else {
      // C'est un nouvel ascendant, suppression directe
      remove(index);
    }
  };

  // Fonction pour obtenir le nom d'un utilisateur par son ID
  const getUserName = (userId: number) => {
    const users = usersList.filter((u) => u.verified) || [];
    const user = users.find((u) => u.id === userId);
    return user?.lastName + " " + user?.firstName || `Utilisateur #${userId}`;
  };

  // Fonction pour obtenir les utilisateurs disponibles (non sélectionnés)
  const getAvailableUsers = (currentIndex?: number) => {
    const users = usersList.filter((u) => u.verified) || [];
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
    // Vérifier qu'il y a au moins un ascendant
    if (!values.validators || values.validators.length === 0) {
      toast.error("Au moins un ascendant est requis");
      return;
    }
    if (category?.id === undefined) {
      toast.error("ID de catégorie manquant");
      return;
    }

    // Préparer les ascendants avec les rangs mis à jour
    const validators = values.validators.map((validator, index) => ({
      id: validator.id, // Conserver l'ID existant si présent
      userId: validator.userId,
      rank: index + 1,
    }));

    const data: Partial<Category> = {
      label: values.label,
      description: values.description || undefined,
      validators: validators,
      requestTypeId: values.requestTypeId,
    };

    categoryApi.mutate(data);
  };

  // Mettre à jour automatiquement les rangs quand le nombre de ascendants change
  useEffect(() => {
    const validators = form.getValues("validators") || [];
    validators.forEach((validator, index) => {
      form.setValue(`validators.${index}.rank`, index + 1);
    });
  }, [fields.length, form]);

  if (
    getCategories.isLoading ||
    getUsers.isLoading ||
    getRequestTypes.isLoading
  )
    return <LoadingPage />;

  if (getCategories.isError || getUsers.isError || getRequestTypes.isError)
    return (
      <ErrorPage
        error={
          getUsers.error ||
          getCategories.error ||
          getRequestTypes.error ||
          undefined
        }
      />
    );

  if (
    getCategories.isSuccess &&
    getUsers.isSuccess &&
    getRequestTypes.isSuccess
  ) {
    if (!category) return <ErrorPage statusCode={404} />;
    return (
      <div className="content">
        <PageTitle
          title="Modifier une catégorie"
          subtitle="Mettez à jour les informations relatives à une catégorie"
          color="blue"
        />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onsubmit)} className="form-3xl">
            {/* Informations de base */}
            <div className="col-span-full w-full grid gap-4">
              <FormField
                control={form.control}
                name="label"
                disabled={category.id === 0}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel isRequired>{"Titre de la catégorie"}</FormLabel>
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
                disabled={category.id === 0}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{"Description"}</FormLabel>
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
              <FormField
                control={form.control}
                name="requestTypeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel isRequired>{"Type de besoin"}</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value ? String(field.value) : undefined}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Sélectionner un type" />
                        </SelectTrigger>
                        <SelectContent>
                          {requestTypes.map((t, id) => (
                            <SelectItem key={id} value={t.id.toString()}>
                              {t.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Section des ascendants */}
            <div className="col-span-full w-full space-y-4 border rounded-lg p-4 bg-muted/20">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <FormLabel className="text-base font-semibold">
                    {"Définissez les ascendants"}
                  </FormLabel>
                  <p className="text-sm text-muted-foreground">
                    {`Ajoutez jusqu'à 3 ascendants dans l'ordre d'approbation souhaité`}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="primary"
                  onClick={addValidator}
                  disabled={fields.length >= 3 || categoryApi.isPending}
                >
                  {"Ajouter un ascendant"}
                  <Plus />
                </Button>
              </div>

              {/* Message d'information */}
              {fields.length === 1 && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm text-blue-700">
                    {`ⓘ Au moins un ascendant doit être présent. Vous ne pouvez pas supprimer le dernier ascendant.`}
                  </p>
                </div>
              )}

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
                          <Badge
                            variant={
                              index === fields.length - 1 ? "primary" : "dark"
                            }
                          >
                            {`Position ${index + 1}`}
                            {index === fields.length - 1 && (
                              <span className="ml-1">{"(Dernier)"}</span>
                            )}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => moveUp(index)}
                            disabled={index === 0 || categoryApi.isPending}
                            title="Déplacer vers le haut"
                          >
                            <ChevronUp />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => moveDown(index)}
                            disabled={
                              index === fields.length - 1 ||
                              categoryApi.isPending
                            }
                            title="Déplacer vers le bas"
                          >
                            <ChevronDown />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeValidator(index)}
                            disabled={
                              fields.length <= 1 || categoryApi.isPending
                            } // MODIFICATION: désactivé si seul ascendant
                            className={`text-red-500 hover:text-red-700 ${
                              fields.length <= 1
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                            }`}
                            title={
                              fields.length <= 1
                                ? "Au moins un ascendant est requis"
                                : "Supprimer"
                            }
                          >
                            <Trash2 />
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
                              <FormLabel isRequired>
                                {"Nom de l'ascendant"}
                              </FormLabel>
                              {/* <Select
                                  value={field.value?.toString() || ""}
                                  onValueChange={(value) =>
                                    field.onChange(parseInt(value))
                                  }
                                  disabled={isLoading}
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
                                          {user.lastName + " " + user.firstName}
                                        </SelectItem>
                                      ))
                                    ) : (
                                      <SelectItem value="" disabled>
                                        {"Aucun utilisateur disponible"}
                                      </SelectItem>
                                    )}
                                  </SelectContent>
                                </Select> */}
                              <Combobox
                                items={availableUsers}
                                value={
                                  availableUsers.find(
                                    (u) => u.id === field.value,
                                  ) ?? null
                                }
                                onValueChange={(v) =>
                                  field.onChange(v?.id ?? "")
                                }
                                itemToStringLabel={(u) =>
                                  u.firstName.concat(" ", u.lastName)
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
                              <FormMessage />
                            </FormItem>
                          );
                        }}
                      />

                      {/* Champ caché pour le rang et l'ID */}
                      <FormField
                        control={form.control}
                        name={`validators.${index}.rank`}
                        render={({ field }) => (
                          <input type="hidden" {...field} />
                        )}
                      />
                      {field.id && (
                        <FormField
                          control={form.control}
                          name={`validators.${index}.id`}
                          render={({ field }) => (
                            <input type="hidden" {...field} />
                          )}
                        />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 border rounded-lg bg-muted/10">
                  <p className="text-muted-foreground">
                    {"Aucun ascendant configuré"}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {`Vous devez ajouter au moins un ascendant`}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addValidator}
                    disabled={categoryApi.isPending}
                    className="mt-4"
                  >
                    <Plus />
                    {"Ajouter le premier ascendant"}
                  </Button>
                </div>
              )}
            </div>
            {/* Footer avec boutons */}
            <div className="col-span-full w-full flex items-center justify-end">
              <Button
                type="submit"
                variant={"secondary"}
                className="w-fit"
                onClick={form.handleSubmit(onsubmit)}
                disabled={categoryApi.isPending || fields.length === 0}
                isLoading={categoryApi.isPending || fields.length === 0}
              >
                {"Enregistrer"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    );
  }
}
