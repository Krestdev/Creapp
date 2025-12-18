"use client";

import MultiSelectUsers from "@/components/base/multiSelectUsers";
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
import { cn } from "@/lib/utils";

import { useStore } from "@/providers/datastore";
import { UserQueries } from "@/queries/baseModule";
import { CategoryQueries } from "@/queries/categoryModule";
import { ProjectQueries } from "@/queries/projectModule";
import { RequestQueries } from "@/queries/requestModule";

import { RequestModelT } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon, LoaderIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

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
  utilisateurs: z.array(z.number()).optional(),
});

export default function MyForm() {
  const { user } = useStore();
  const queryClient = useQueryClient(); // Ajout du QueryClient

  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const [selectedUsers, setSelectedUsers] = useState<
    { id: number; name: string }[]
  >([]);

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

  // ----------------------------------------------------------------------
  // REQUEST MUTATION
  // ----------------------------------------------------------------------
  const request = new RequestQueries();
  const category = new CategoryQueries();
  const requestMutation = useMutation({
    mutationKey: ["requests"],
    mutationFn: async (
      data: Omit<RequestModelT, "id" | "createdAt" | "updatedAt" | "ref">
    ) => request.create(data),

    onSuccess: () => {
      toast.success("Besoin soumis avec succès !");
      setIsSuccessModalOpen(true);
      form.reset();
      setSelectedUsers([]);

      // Invalider et rafraîchir toutes les requêtes liées aux besoins
      queryClient.invalidateQueries({
        queryKey: ["requests"],
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: ["requests-validation"],
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: ["requests", user?.id],
        refetchType: "active",
      });
    },

    onError: () => toast.error("Une erreur est survenue."),
  });

  const categoriesData = useQuery({
    queryKey: ["categories"],
    queryFn: async () => category.getCategories(),
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    requestMutation.mutate({
      label: values.titre,
      description: values.description || null,
      categoryId: Number(values.categorie),
      quantity: Number(values.quantity),
      unit: values.unite!,
      beneficiary: values.beneficiaire!,
      benef: values.beneficiaire === "groupe" ? values.utilisateurs! : null,
      userId: Number(user?.id),
      dueDate: values.datelimite!,
      projectId: Number(values.projet),
      state: "pending",
      proprity: "medium",
    });
  }

  // ----------------------------------------------------------------------
  // RENDER
  // ----------------------------------------------------------------------
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 max-w-3xl md:mx-12 py-10"
      >
        <div className="flex flex-col md:grid md:grid-cols-2 gap-4">
          {/* PROJET */}
          <FormField
            control={form.control}
            name="projet"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Projet concerné <span className="text-red-500">*</span>
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
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
              </FormItem>
            )}
          />

          {/* CATEGORIE */}
          <FormField
            control={form.control}
            name="categorie"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Catégorie <span className="text-red-500">*</span>
                </FormLabel>
                <Select onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="w-full h-10! shadow-none! rounded! py-1">
                      <SelectValue placeholder="Sélectionner une catégorie" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categoriesData.data?.data?.map((c) => (
                      <SelectItem key={c.id} value={c.id!.toString()}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          {/* TITRE */}
          <FormField
            control={form.control}
            name="titre"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Titre <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="Titre du besoin" {...field} />
                </FormControl>
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
                  <Textarea className="resize-none" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          {/* DATE LIMITE */}
          <FormField
            control={form.control}
            name="datelimite"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>
                  {"Date limite"}
                  <span className="text-red-500">*</span>
                </FormLabel>
                <Popover>
                  <PopoverTrigger asChild className="h-10 w-full!">
                    <FormControl className="w-full">
                      <Button
                        type="button"
                        variant={"outline"}
                        className={cn(
                          "w-[320px] pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP", { locale: fr })
                        ) : (
                          <span>Choisir une date</span>
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
              </FormItem>
            )}
          />

          {/* QUANTITE */}
          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {"Quantité"}
                  <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input type="number" placeholder="ex. 10" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          {/* UNITE */}
          <FormField
            control={form.control}
            name="unite"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {"Unité"}
                  <span className="text-red-500">*</span>
                </FormLabel>
                <Select onValueChange={field.onChange}>
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
                  Bénéficiaire <span className="text-red-500">*</span>
                </FormLabel>
                <Select onValueChange={field.onChange}>
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
              </FormItem>
            )}
          />

          {/* MULTISELECT CONDITIONNEL */}
          {beneficiaire === "groupe" && (
            <FormField
              control={form.control}
              name="utilisateurs"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>
                    Utilisateurs <span className="text-red-500">*</span>
                  </FormLabel>

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

        {/* SUBMIT */}
        <Button disabled={requestMutation.isPending} type="submit">
          {"Soumettre le besoin"}
          {requestMutation.isPending && (
            <LoaderIcon className="ml-2 h-4 w-4 animate-spin" />
          )}
        </Button>
      </form>

      <SuccessModal
        open={isSuccessModalOpen}
        onOpenChange={setIsSuccessModalOpen}
      />
    </Form>
  );
}
