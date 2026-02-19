"use client";
import { SearchableSelect } from "@/components/base/searchableSelect";
import ErrorPage from "@/components/error-page";
import LoadingPage from "@/components/loading-page";
import PageTitle from "@/components/pageTitle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { userQ } from "@/queries/baseModule";
import { categoryQ, newCategory } from "@/queries/categoryModule";
import { requestTypeQ } from "@/queries/requestType";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

const formSchema = z.object({
    label: z.string().min(1, { message: "Ce champ est obligatoire" }),
    validators: z
      .array(
        z.object({
          userId: z.number().min(1, "Sélectionnez un utilisateur"),
          rank: z.number().min(1).max(3),
        }),
      )
      .min(1, "Definissez au minimum un ascendant")
      .max(3, "Maximum 3 ascendants autorisés")
      .default([]),
    description: z.string().min(1, { message: "Ce champ est obligatoire" }),
    requestTypeId: z.coerce.number({
      message: "Veuillez sélectionner un type",
    }),
  });

  type Schema = z.infer<typeof formSchema>;

const Page = () => {
  const router = useRouter();
  const {
    data: types,
    isLoading,
    isError,
    error,
    isSuccess,
  } = useQuery({
    queryKey: ["types"],
    queryFn: requestTypeQ.getAll,
  });

   const usersData = useQuery({
      queryKey: ["users"],
      queryFn: () => userQ.getAll(),
    });

    const usersList = React.useMemo(()=>{
      if(!usersData.data) return [];
      return usersData.data.data;
    },[usersData.data])
    //Form related
    const intentRef = React.useRef<"save" | "saveAndCreate">("save");
      const form = useForm<Schema>({
        resolver: zodResolver(formSchema as any),
        defaultValues: {
          label: "",
          description: "",
          validators: [],
          requestTypeId: undefined,
        },
      });
    
      // Field array to manage ascendants
      const { fields, append, remove, move } = useFieldArray({
        control: form.control,
        name: "validators",
      });

      const categoryApi = useMutation({
          mutationFn: (
            data: newCategory & {
              parentId?: number;
              description?: string;
              validators?: { userId: number; rank: number }[];
            },
          ) => categoryQ.createCategory(data),
          onSuccess: () => {
            toast.success("Votre catégorie a été créée avec succès !");
            form.reset();
          },
          onError: (error: any) => {
            toast.error(
              "Une erreur est survenue lors de la creation de la categorie.",
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
      
        // Move a user rank up
        const moveUp = (index: number) => {
          if (index > 0) {
            move(index, index - 1);
            // Update ranks after a change
            const validators = form.getValues("validators") || [];
            validators.forEach((validator, idx) => {
              form.setValue(`validators.${idx}.rank`, idx + 1);
            });
          }
        };
      
        // Move a user rank down
        const moveDown = (index: number) => {
          if (index < fields.length - 1) {
            move(index, index + 1);
            // Update ranks after a change
            const validators = form.getValues("validators") || [];
            validators.forEach((validator, idx) => {
              form.setValue(`validators.${idx}.rank`, idx + 1);
            });
          }
        };
      
      
        // Get available users
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
          // Préparer les ascendants avec les rangs mis à jour
          const validators =
            values.validators?.map((validator, index) => ({
              userId: validator.userId,
              rank: index + 1,
            })) || [];
      
          const data: newCategory & {
            parentId?: number;
            description?: string;
          } = {
            label: values.label,
            validators: validators,
            requestTypeId: values.requestTypeId,
          };
      
          if (values.description) {
            data.description = values.description;
          }
          categoryApi.mutate(data);
        };
      
        // Mettre à jour automatiquement les rangs quand le nombre de ascendants change
        React.useEffect(() => {
          const validators = form.getValues("validators") || [];
          validators.forEach((validator, index) => {
            form.setValue(`validators.${index}.rank`, index + 1);
          });
        }, [fields.length, form]);

  if (isLoading || usersData.isLoading) return <LoadingPage />;
  if (isError || usersData.isError) return <ErrorPage error={error || usersData.error || undefined} />;
  if (isSuccess && usersData.isSuccess)
    return (
      <div className="content">
        <PageTitle
          title="Créer une categorie"
          subtitle="Formulaire de création d'une categorie"
          color="blue"
        />
        <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onsubmit)}
        className="form-3xl"
      >
        {/* Informations de base */}
          <FormField
            control={form.control}
            name="label"
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
                      {types.data
                        .filter(
                          (t) => t.type === "achat" || t.type === "others",
                        )
                        .map((t, id) => (
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
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="@min-[640px]:col-span-full">
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
        {/* Section des ascendants */}
        <div className="@min-[640px]:col-span-full w-full grid gap-4 bg-muted/20 ">
          <div className="flex items-center justify-between">
            <div>
              <FormLabel isRequired>
                {"Définissez les ascendants"}
              </FormLabel>
              <FormDescription>
                {
                  "(Ajoutez jusqu'à 3 ascendants dans l'ordre d'approbation souhaité)"
                }
              </FormDescription>
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
                      <Badge variant={index === fields.length - 1 ? "primary" : "dark"}>
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
                        disabled={index === 0}
                        title="Déplacer vers le haut"
                      >
                        <ChevronUp />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => moveDown(index)}
                        disabled={index === fields.length - 1}
                        title="Déplacer vers le bas"
                      >
                        <ChevronDown />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                        className="text-destructive hover:text-red-700"
                        title="Supprimer"
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
                          <FormLabel isRequired>{"Nom de l'ascendant"}</FormLabel>
                          <SearchableSelect
                            width="w-full"
                            allLabel=""
                            options={
                              availableUsers.length > 0
                                ? availableUsers.map((user) => ({
                                    value: user.id!.toString(),
                                    label: user.lastName + " " + user.firstName,
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
                  >
                    <Plus />
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
                >
                  <Plus />
                </Button>
                <p className="text-muted-foreground">
                  {"Aucun ascendant configuré"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {`Cliquez sur "+" pour configurer la chaîne d'approbation`}
                </p>
              </div>
            </div>
          )}

          {/* Messages d'erreur pour l'ensemble du tableau */}
          {form.formState.errors.validators && (
            <div className="text-sm text-destructive">
              {form.formState.errors.validators.message}
            </div>
          )}
        </div>

        {/* Bouton de soumission */}
        <div className="@min-[540px]:col-span-full w-full flex justify-end">
          <Button
            type="submit"
            variant={"primary"}
            disabled={categoryApi.isPending}
            isLoading={categoryApi.isPending}
          >
            {"Enregistrer la catégorie"}
          </Button>
        </div>
      </form>
    </Form>
      </div>
    );
};

export default Page;
