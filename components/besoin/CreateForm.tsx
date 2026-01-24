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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { units } from "@/data/unit";
import { cn } from "@/lib/utils";

import { useStore } from "@/providers/datastore";
import { userQ } from "@/queries/baseModule";
import { categoryQ } from "@/queries/categoryModule";
import { projectQ } from "@/queries/projectModule";
import { requestQ } from "@/queries/requestModule";

import { RequestModelT } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { SearchableSelect } from "../base/searchableSelect";

// ----------------------------------------------------------------------
// VALIDATION
// ----------------------------------------------------------------------
const formSchema = z.object({
  projet: z.string().min(1, "Le projet est requis"),
  categorie: z.string().min(1, "La catégorie est requise"),
  titre: z.string().min(1, "Le titre est requis"),
  description: z.string(),
  quantity: z
    .string()
    .min(1, "La quantité est requise")
    .refine((val) => !isNaN(Number(val)), {
      message: "Le montant doit être un nombre valide",
    }),
  unite: z.string().min(1, "L'unité est requise"),
  datelimite: z
    .date()
    .min(new Date(), "La date limite doit être dans le futur"),
  beneficiaire: z.string().min(1, "Le bénéficiaire est requis"),
  beneficiaireId: z.string().optional(), // Nouveau champ pour sélectionner un seul utilisateur
});

export default function MyForm() {
  const { user } = useStore();

  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  // ----------------------------------------------------------------------
  // FORM INITIALISATION
  // ----------------------------------------------------------------------
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projet: "",
      categorie: "",
      titre: "",
      description: "",
      quantity: "",
      unite: "",
      datelimite: undefined,
      beneficiaire: "",
      beneficiaireId: "",
    },
  });

  const beneficiaire = form.watch("beneficiaire");

  // Si on change le bénéficiaire, on réinitialise le champ bénéficiaireId
  useEffect(() => {
    if (beneficiaire !== "autre") {
      form.setValue("beneficiaireId", "");
    }
  }, [beneficiaire, form]);

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
    queryKey: ["userQ"],
    queryFn: async () => userQ.getAll(),
  });

  const USERS =
    usersData.data?.data.map((u) => ({
      id: u.id!,
      name: u.firstName + " " + u.lastName,
    })) || [];

  // ----------------------------------------------------------------------
  // QUERY CATEGORIES
  // ----------------------------------------------------------------------
  const categoriesData = useQuery({
    queryKey: ["categories"],
    queryFn: async () => categoryQ.getCategories(),
  });

  // ----------------------------------------------------------------------
  // REQUEST MUTATION
  // ----------------------------------------------------------------------

  const requestMutation = useMutation({
    mutationFn: async (
      data: Omit<
        RequestModelT,
        "id" | "createdAt" | "updatedAt" | "ref" | "validators"
      >,
    ) => requestQ.create(data),

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

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Préparation des données
    const requestData: Omit<
      RequestModelT,
      "id" | "createdAt" | "updatedAt" | "ref" | "validators"
    > = {
      label: values.titre,
      description: values.description || null,
      categoryId: Number(values.categorie),
      quantity: Number(values.quantity),
      unit: values.unite,
      beneficiary: values.beneficiaire,
      type: "achat",
      benef:
        values.beneficiaire === "autre" && values.beneficiaireId
          ? [Number(values.beneficiaireId)]
          : null,
      userId: Number(user?.id),
      dueDate: values.datelimite,
      projectId: Number(values.projet),
      state: "pending",
      priority: "medium",
    };

    requestMutation.mutate(requestData);
  }

  // ----------------------------------------------------------------------
  // RENDER
  // ----------------------------------------------------------------------
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 max-w-3xl md:mx-12"
      >
        <div className="flex flex-col md:grid md:grid-cols-2 gap-4">
          {/* PROJET */}
          <FormField
            control={form.control}
            name="projet"
            render={({ field }) => (
              <FormItem>
                <FormLabel isRequired>{"Projet concerné"}</FormLabel>
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
                  value={field.value?.toString() || ""}
                  width="w-full"
                  allLabel=""
                />
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
                <FormLabel isRequired>{"Catégorie"}</FormLabel>
                <SearchableSelect
                  width="w-full"
                  allLabel=""
                  options={
                    categoriesData.data?.data
                      ?.filter((c) => c.id !== 0 && c.id !== 1)
                      .map((c) => ({
                        value: c.id!.toString(),
                        label: c.label,
                      })) ?? []
                  }
                  value={field.value?.toString() || ""}
                  onChange={(value) => field.onChange(value)}
                  placeholder="Sélectionner"
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
                <FormLabel isRequired>{"Titre"}</FormLabel>
                <FormControl>
                  <Input placeholder="Titre du besoin" {...field} />
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
                <FormLabel isRequired>{"Quantité"}</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="ex. 10" {...field} />
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
                <FormLabel isRequired>{"Unité"}</FormLabel>
                <Select onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="w-full h-10! shadow-none! rounded! py-1">
                      <SelectValue placeholder="Sélectionner l'unité" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {units.map((unit, id) => (
                      <SelectItem key={unit.value} value={unit.value}>
                        {unit.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* DATE LIMITE */}
          <FormField
            control={form.control}
            name="datelimite"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel isRequired>{"Date limite"}</FormLabel>
                <Popover>
                  <PopoverTrigger asChild className="h-10 w-full!">
                    <FormControl className="w-full">
                      <Button
                        type="button"
                        variant={"outline"}
                        className={cn(
                          "w-[320px] pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground",
                        )}
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
                    />
                  </PopoverContent>
                </Popover>
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
                <FormLabel isRequired>{"Bénéficiaire"}</FormLabel>
                <Select onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="w-full h-10! shadow-none! rounded! py-1">
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="me">{"Moi-même"}</SelectItem>
                    <SelectItem value="autre">{"Autre"}</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* SELECTION DU BENEFICIAIRE SI "AUTRE" */}
          {beneficiaire === "autre" && (
            <FormField
              control={form.control}
              name="beneficiaireId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel isRequired>
                    {"Sélectionner le bénéficiaire"}
                  </FormLabel>
                  <SearchableSelect
                    width="w-full"
                    allLabel=""
                    options={
                      USERS.filter((u) => u.id !== user?.id).map((user) => ({
                        value: user.id.toString(),
                        label: user.name,
                      })) ?? []
                    }
                    value={field.value?.toString() || ""}
                    onChange={(value) => field.onChange(value)}
                    placeholder="Sélectionner"
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* DESCRIPTION */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>{"Description"}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Description"
                    className="resize-none"
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
            {"Soumettre le besoin"}
          </Button>
        </div>
      </form>

      <SuccessModal
        open={isSuccessModalOpen}
        onOpenChange={setIsSuccessModalOpen}
        message="Votre besoin a été soumis avec succès. Il sera traité par notre équipe."
      />
    </Form>
  );
}
