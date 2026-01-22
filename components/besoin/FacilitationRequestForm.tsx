"use client";

import { SuccessModal } from "@/components/modals/success-modal";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useStore } from "@/providers/datastore";
import { requestQ } from "@/queries/requestModule";
import { RequestModelT } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarIcon, LoaderIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { SearchableSelect } from "../base/searchableSelect";
import { projectQ } from "@/queries/projectModule";
import { userQ } from "@/queries/baseModule";
import FilesUpload from "../comp-547";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar } from "../ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";
import BeneficiairesList from "./AddBenef";

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
  .max(1, "Pas plus d'un document")
  .nullable()
  .default([]);

const formSchema = z.object({
  beneficiaire: z.string().min(1, "Le bénéficiaire est requis"),
  projet: z.string().min(1, "Le projet est requis"),
  delai: z
    .date()
    .min(new Date(), "Le delai d'exécution doit être dans le futur"),
  category: z.string().min(1, "La categorie est requise"),
  title: z.string().min(1, "Le titre est requis"),
  description: z.string().min(1, "La description est requise"),
  justificatif: SingleFileSchema,
});

export default function FacilitationRequestForm() {
  const { user } = useStore();
  const queryClient = useQueryClient();
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [beneficiairesList, setBeneficiairesList] = useState<
    { id: number; nom: string; montant: number }[]
  >([]);

  // ----------------------------------------------------------------------
  // FORM INITIALISATION
  // ----------------------------------------------------------------------
  const form = useForm<z.input<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      beneficiaire: "",
      projet: "",
      category: "facilitation",
      delai: undefined,
      justificatif: [],
      title: "",
      description: "",
    },
  });

  // ----------------------------------------------------------------------
  // QUERY PROJECTS
  // ----------------------------------------------------------------------

  const projectsData = useQuery({
    queryKey: ["projects"],
    queryFn: async () => projectQ.getAll(),
  });

  // ----------------------------------------------------------------------
  // QUERY USERS
  // ----------------------------------------------------------------------

  const usersData = useQuery({
    queryKey: ["users"],
    queryFn: async () => userQ.getAll(),
  });

  // ----------------------------------------------------------------------
  // REQUEST MUTATION
  // ----------------------------------------------------------------------

  const requestMutation = useMutation({
    mutationFn: async (
      data: Omit<RequestModelT, "id" | "createdAt" | "updatedAt" | "ref" | "validators">,
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
    if (beneficiairesList.length === 0) {
      toast.error("Veuillez ajouter au moins un bénéficiaire.");
      return;
    }
    // Préparation des données
    const requestData: Omit<
      RequestModelT,
      "id" | "createdAt" | "updatedAt" | "ref" | "validators"
    > = {
      label: values.title,
      description: values.description || null,
      categoryId: 0,
      quantity: 1,
      unit: "unit",
      beneficiary: values.beneficiaire,
      benef: Array(user?.id),
      userId: Number(user?.id),
      dueDate: values.delai,
      projectId: Number(values.projet),
      proof: values.justificatif,
      amount: beneficiairesList.reduce((total, b) => total + b.montant, 0),
      type: "facilitation",
      state: "pending",
      priority: "medium",
      benFac: {
        list: beneficiairesList.map((b) => ({
          id: b.id,
          name: b.nom,
          amount: b.montant,
        })),
      },
    };
    requestMutation.mutate(requestData);
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 max-w-3xl md:mx-12"
      >
        <div className="flex flex-col @min-[640px]:grid @min-[640px]:grid-cols-2 gap-4">
          {/* PROJET */}
          <FormField
            control={form.control}
            name="projet"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {"Projet concerné"}
                  <span className="text-red-500">*</span>
                </FormLabel>
                <SearchableSelect
                  onChange={field.onChange}
                  options={
                    projectsData.data?.data
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
                  placeholder="Sélectionner un projet"
                />
                <FormMessage />
              </FormItem>
            )}
          />

          {/* CATEGORIE */}
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {"Categorie"}
                  <span className="text-red-500">*</span>
                </FormLabel>
                <Select value={field.value}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sélectionner une categorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="facilitation">
                      {"Facilitation"}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* TITLE */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {"Titre"}
                  <span className="text-red-500">*</span>
                </FormLabel>
                <Input {...field} placeholder="ex. Achat du carburant groupe" />
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
                <FormLabel>
                  {"Recepteur pour compte"}
                  <span className="text-red-500">*</span>
                </FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sélectionner un recepteur pour compte" />
                  </SelectTrigger>
                  <SelectContent>
                    {usersData.data?.data.map((user) => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        {user.lastName + " " + user.firstName}
                      </SelectItem>
                    ))}
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
                <FormLabel>
                  {"Date limite"}
                  <span className="text-red-500">*</span>
                </FormLabel>
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
                      />
                    </PopoverContent>
                  </Popover>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Description/Détail */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="@min-[640px]:col-span-2">
                <FormLabel>
                  {"Description/Détail"}
                  <span className="text-red-500">*</span>
                </FormLabel>
                <Textarea {...field} placeholder="Décrivez le besoin" />
                <FormMessage />
              </FormItem>
            )}
          />

          <BeneficiairesList
            initialBeneficiaires={beneficiairesList}
            onBeneficiairesChange={setBeneficiairesList}
          />

          {/* JUSTIFICATIF */}
          <FormField
            control={form.control}
            name="justificatif"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
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

        {/* SUBMIT */}
        <div className="flex justify-end">
          <Button
            variant={"primary"}
            disabled={requestMutation.isPending}
            type="submit"
            className="min-w-[200px]"
          >
            {requestMutation.isPending ? (
              <>
                <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                {"Soumission en cours..."}
              </>
            ) : (
              "Soumettre la demande de facilitation"
            )}
          </Button>
        </div>
      </form>

      <SuccessModal
        open={isSuccessModalOpen}
        onOpenChange={setIsSuccessModalOpen}
        message="Votre demande de facilitation a été soumise avec succès."
      />
    </Form>
  );
}
