"use client";

import { SuccessModal } from "@/components/modals/success-modal";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import { userQ } from "@/queries/baseModule";
import { projectQ } from "@/queries/projectModule";
import { requestQ } from "@/queries/requestModule";
import { Category, ProjectT, RequestModelT, User } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import MultiSelectUsers from "../base/multiSelectUsers";
import { SearchableSelect } from "../base/searchableSelect";
import FilesUpload from "../comp-547";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";


interface Props {
  categories: Array<Category>;
  projects: Array<ProjectT>;
  users: Array<User>;
}

// ----------------------------------------------------------------------
// VALIDATION
// ----------------------------------------------------------------------
const SingleFileSchema = z
  .array(
    z.union([
      z.instanceof(File, { message: "Doit être un fichier valide" }),
      z.string(),
    ]),
  )
  .min(1, { message: "Le justificatif est requis" })
  .default([]);

const formSchema = z.object({
  projet: z.string().min(1, "Le projet est requis"),
  titre: z.string().min(1, "Le titre est requis"),
  description: z.string().min(1, "La description est requise"),
  periode: z
    .object({
      from: z.date({ required_error: "La date de début est requise" }),
      to: z.date({ required_error: "La date de fin est requise" }),
    })
    .refine((data) => data.from <= data.to, {
      message:
        "La date de début doit être antérieure ou égale à la date de fin",
      path: ["from"],
    }),
  montant: z
    .string()
    .min(1, "Le montant est requis")
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Le montant doit être un nombre positif",
    }),
  date_limite: z
    .date()
    .min(new Date(), "La date limite doit être dans le futur"),
  beneficiaire: z.array(z.number()).min(1, "Le bénéficiaire est requis"),
  justificatif: SingleFileSchema,
  categoryId: z.coerce.number({message: "Veuillez sélectionner une catégorie"}),
});

export default function RHRequestForm({categories, projects, users}:Props) {
  const { user } = useStore();

  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  // ----------------------------------------------------------------------
  // FORM INITIALISATION
  // ----------------------------------------------------------------------
  const form = useForm<z.input<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projet: "",
      titre: "",
      description: "",
      montant: "",
      periode: {
        from: undefined,
        to: undefined,
      },
      date_limite: undefined,
      beneficiaire: [],
      justificatif: [],
      categoryId: undefined,
    },
  });

  const USERS =
    users.filter((u) => u.verified).map((u) => ({
      id: u.id!,
      name: u.firstName + " " + u.lastName,
    })) || [];

  // ----------------------------------------------------------------------
  // REQUEST MUTATION
  // ----------------------------------------------------------------------

  const requestMutation = useMutation({
    mutationFn: async (
      data: Omit<
        RequestModelT,
        "id" | "createdAt" | "updatedAt" | "ref" | "validators"
      >,
    ) => requestQ.special(data),

    onSuccess: () => {
      toast.success("Besoin soumis avec succès !");
      setIsSuccessModalOpen(true);
      form.reset();
    },

    onError: (error: any) => {
      console.error("Erreur lors de la soumission:", error);
      toast.error("Une erreur est survenue lors de la soumission.");
    },
  });

  function onSubmit(values: z.input<typeof formSchema>) {
    // Préparation des données
    const requestData: Omit<
      RequestModelT,
      "id" | "createdAt" | "updatedAt" | "ref" | "validators"
    > = {
      label: values.titre,
      dueDate: values.date_limite,
      beneficiary: "",
      benef: values.beneficiaire,
      proof: values.justificatif,
      description: values.description,
      amount: Number(values.montant),
      projectId: Number(values.projet),
      categoryId: values.categoryId,
      quantity: 1,
      unit: "unit",
      userId: Number(user?.id),
      type: "ressource_humaine",
      state: "pending",
      priority: "medium",
      period: { from: values.periode.from, to: values.periode.to },
    };
    requestMutation.mutate(requestData);
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 max-w-3xl"
      >
        <div className="flex flex-col md:grid md:grid-cols-2 gap-4">
          {/* PROJET */}
          <FormField
            control={form.control}
            name="projet"
            render={({ field }) => (
              <FormItem>
                <FormLabel isRequired>
                  {"Projet concerné"}
                </FormLabel>
                <SearchableSelect
                  onChange={field.onChange}
                  options={
                    projects
                      .filter(
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
                  placeholder="Sélectionner un projet"
                />
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
                <FormLabel isRequired>{"Titre du besoin"}</FormLabel>
                <FormControl>
                  <Input placeholder="Titre du besoin" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Category */}
        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel isRequired>{"Categorie"}</FormLabel>
              <FormControl>
                <Select
                  defaultValue={field.value ? String(field.value) : undefined}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger className="min-w-60 w-full">
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    {
                      categories.filter(c=> c.type.type === "ressource_humaine").length === 0 ?
                      <SelectItem value="#" disabled>{"Aucune catégorie enregistrée"}</SelectItem>
                      :
                    categories.filter(c=> c.type.type === "ressource_humaine").map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

          {/* PERIODE - RANGE */}
          <FormField
            control={form.control}
            name="periode"
            render={({ field }) => (
              <FormItem>
                <FormLabel isRequired>{"Période"}</FormLabel>
                <FormControl>
                  <Popover>
                    <PopoverTrigger asChild className="h-10 w-full">
                      <FormControl>
                        <Button
                          type="button"
                          variant={"outline"}
                          className="w-full pl-3 text-left font-normal"
                        >
                          {field.value?.from && field.value?.to ? (
                            <>
                              {format(field.value.from, "PPP", { locale: fr })}{" "}
                              - {format(field.value.to, "PPP", { locale: fr })}
                            </>
                          ) : (
                            <span>{"Choisir une période"}</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="range"
                        selected={field.value}
                        onSelect={field.onChange}
                        numberOfMonths={2}
                        locale={fr}
                        className="rounded-md border"
                        defaultMonth={field.value?.from || new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* DATE LIMITE */}
          <FormField
            control={form.control}
            name="date_limite"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel isRequired>{"Date limite"}</FormLabel>
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
                      disabled={(date) => date < new Date()}
                      locale={fr}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* MONTANT */}
          <FormField
            control={form.control}
            name="montant"
            render={({ field }) => (
              <FormItem>
                <FormLabel isRequired>{"Montant"}</FormLabel>
                <FormControl>
                  <Input placeholder="Montant" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* BENEFICIAIRE */}
          <FormField
            control={form.control}
            name="beneficiaire"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel isRequired>{"Bénéficiaire"}</FormLabel>
                <FormControl>
                  <MultiSelectUsers
                    users={USERS}
                    selected={USERS.filter((u) => field.value?.includes(u.id))}
                    onChange={(selectedUsers) => {
                      field.onChange(selectedUsers.map((u) => u.id));
                    }}
                    display={"user"}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* JUSTIFICATIF */}
          <FormField
            control={form.control}
            name="justificatif"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel isRequired>{"Justificatif"}</FormLabel>
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

          {/* DESCRIPTION */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel isRequired>
                  {"Description détaillée du besoin"}
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Description détaillée du besoin RH"
                    className="resize-none min-h-[120px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* SUBMIT */}
        <div className="flex justify-end">
          <Button
            variant={"primary"}
            disabled={requestMutation.isPending}
            type="submit"
            className="min-w-[200px]"
            isLoading={requestMutation.isPending}
          >
            {"Soumettre la demande RH"}
          </Button>
        </div>
      </form>

      <SuccessModal
        open={isSuccessModalOpen}
        onOpenChange={setIsSuccessModalOpen}
        message="Votre demande de ressource humaine a été soumise avec succès."
      />
    </Form>
  );
}
