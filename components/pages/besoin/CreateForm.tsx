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

import { useStore } from "@/providers/datastore";
import { UserQueries } from "@/queries/baseModule";
import { ProjectQueries } from "@/queries/projectModule";
import { RequestQueries } from "@/queries/requestModule";

import { RequestModelT } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
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

export default function MyForm() {
  const { user } = useStore();

  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [open, setOpen] = useState(false);

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
  const requestMutation = useMutation({
    mutationKey: ["requests"],
    mutationFn: async (
      data: Omit<RequestModelT, "id" | "createdAt" | "updatedAt">
    ) => request.create(data),

    onSuccess: () => {
      toast.success("Besoin soumis avec succès !");
      setIsSuccessModalOpen(true);
      form.reset();
      setSelectedUsers([]);
    },

    onError: () => toast.error("Une erreur est survenue."),
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    requestMutation.mutate({
      label: values.titre,
      description: values.description || null,
      quantity: Number(values.quantity),
      unit: values.unite!,
      beneficiary: values.beneficiaire!,
      beficiaryList:
        values.beneficiaire === "groupe" ? values.utilisateurs! : null,
      state: "pending",
      proprity: "normal",
      userId: Number(user?.id),
      dueDate: new Date(),
      projectId: Number(values.projet),
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
                <FormLabel>Projet concerné</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full h-10 py-1">
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
                <FormLabel>Catégorie</FormLabel>
                <Select onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="w-full h-10 py-1">
                      <SelectValue placeholder="Sélectionner une catégorie" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="A">Catégorie A</SelectItem>
                    <SelectItem value="B">Catégorie B</SelectItem>
                  </SelectContent>
                </Select>
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
                <Select onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="w-full h-10 py-1">
                      <SelectValue placeholder="Sélectionner une sous-catégorie" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="A1">A1</SelectItem>
                    <SelectItem value="A2">A2</SelectItem>
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
                <FormLabel>Titre</FormLabel>
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
              <FormItem>
                <FormLabel>Date limite</FormLabel>
                <FormControl>
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between"
                      >
                        {date
                          ? date.toLocaleDateString()
                          : "Sélectionner une date"}
                        <ChevronDownIcon />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="p-0">
                      <Calendar
                        className="h-10 py-1"
                        mode="single"
                        selected={date}
                        onSelect={(d) => {
                          setDate(d);
                          field.onChange(d);
                          setOpen(false);
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </FormControl>
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
                <FormLabel>Unité</FormLabel>
                <Select onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="w-full h-10 py-1">
                      <SelectValue placeholder="Sélectionner l’unité" />
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
                <FormLabel>Bénéficiaire</FormLabel>
                <Select onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="w-full h-10 py-1">
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="me">Sois-même</SelectItem>
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
                  <FormLabel>Utilisateurs</FormLabel>

                  <MultiSelectUsers
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
          Soumettre le besoin
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
