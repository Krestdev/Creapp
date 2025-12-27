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
import { RequestQueries } from "@/queries/requestModule";
import { RequestModelT } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon, LoaderIcon } from "lucide-react";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { SearchableSelect } from "../base/searchableSelect";
import { UserQueries } from "@/queries/baseModule";
import FilesUpload from "../comp-547";
import MultiSelectUsers from "../base/multiSelectUsers";

// ----------------------------------------------------------------------
// VALIDATION
// ----------------------------------------------------------------------
const SingleFileSchema = z
  .array(
    z.union([
      z.instanceof(File, { message: "Doit être un fichier valide" }),
      z.string(),
    ])
  )
  .max(1, "Pas plus d'un document")
  .nullable()
  .default([]);

const formSchema = z.object({
  titre: z.string().min(1, "Le titre est requis"),
  description: z.string().min(1, "La description est requise"),
  periode: z.date().refine((val) => val instanceof Date, {
    message: "La période est requise",
  }),
  date_limite: z
    .date()
    .min(new Date(), "La date limite doit être dans le futur"),
  // Beneficiaire represente le tableau de numbers des IDs des utilisateurs
  beneficiaire: z.array(z.number()).min(1, "Le bénéficiaire est requis"),
  justificatif: SingleFileSchema,
});

export default function RHRequestForm() {
  const { user } = useStore();
  const queryClient = useQueryClient();
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  // ----------------------------------------------------------------------
  // FORM INITIALISATION
  // ----------------------------------------------------------------------
  const form = useForm<z.input<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      titre: "",
      description: "",
      periode: undefined,
      date_limite: undefined,
      beneficiaire: [],
      justificatif: [],
    },
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
    usersData.data?.data.map((u) => ({
      id: u.id!,
      name: u.name,
    })) || [];

  // ----------------------------------------------------------------------
  // REQUEST MUTATION
  // ----------------------------------------------------------------------
  const request = new RequestQueries();
    const requestMutation = useMutation({
      mutationKey: ["requests"],
      mutationFn: async (
        data: Omit<RequestModelT, "id" | "createdAt" | "updatedAt" | "ref">
      ) => request.special(data),
  
      onSuccess: () => {
        toast.success("Besoin soumis avec succès !");
        setIsSuccessModalOpen(true);
        form.reset();
  
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
  
      onError: (error: any) => {
        console.error("Erreur lors de la soumission:", error);
        toast.error("Une erreur est survenue lors de la soumission.");
      },
    });
  
    function onSubmit(values: z.input<typeof formSchema>) {
      // Préparation des données
      const requestData: Omit<
        RequestModelT,
        "id" | "createdAt" | "updatedAt" | "ref"
      > = {
        label: values.titre,
        dueDate: values.date_limite,
        beneficiary: "",
        benef: values.beneficiaire,
        proof: values.justificatif,
        description: values.description || null,
        categoryId: 0,
        quantity: 1,
        unit: "unit",
        userId: Number(user?.id),
        type: "RH",
        state: "pending",
        proprity: "medium",
      };
  
      console.log("Données soumises:", requestData);
      requestMutation.mutate(requestData);
    }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 max-w-3xl md:mx-12"
      >
        <div className="flex flex-col md:grid md:grid-cols-2 gap-4">
          {/* TITRE */}
          <FormField
            control={form.control}
            name="titre"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {"Titre du besoin"}
                  <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="Titre du besoin" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* PERIODE */}
          <FormField
            control={form.control}
            name="periode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {"Période"}
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
                <FormLabel>
                  {"Date limite"}
                  <span className="text-red-500">*</span>
                </FormLabel>
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
                  {"Bénéficiaire"}
                  <span className="text-red-500">*</span>
                </FormLabel>
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
                <FormLabel>
                  {"Justificatif"}
                  <span className="text-red-500">*</span>
                </FormLabel>
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
                <FormLabel>
                  {"Description détaillée du besoin"}
                  <span className="text-red-500">*</span>
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
          >
            {requestMutation.isPending ? (
              <>
                <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                Soumission en cours...
              </>
            ) : (
              "Soumettre la demande RH"
            )}
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
