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
import { Textarea } from "@/components/ui/textarea";
import { useStore } from "@/providers/datastore";
import { RequestQueries } from "@/queries/requestModule";
import { RequestModelT } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CalendarIcon, LoaderIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

// ----------------------------------------------------------------------
// VALIDATION
// ----------------------------------------------------------------------
const formSchema = z.object({
  titre: z.string().min(1, "Le titre est requis"),
  montant: z
    .string()
    .min(1, "Le montant est requis")
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Le montant doit être un nombre positif",
    }),
  raison: z.string().min(1, "La raison est requise"),
  delai: z
    .date()
    .min(new Date(), "Le delai d'exécution doit être dans le futur"),
});

export default function SpecialRequestForm() {
  const { user } = useStore();
  const queryClient = useQueryClient();
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  // ----------------------------------------------------------------------
  // FORM INITIALISATION
  // ----------------------------------------------------------------------
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      titre: "",
      montant: "",
      raison: "",
      delai: undefined,
    },
  });

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
      amount: Number(values.montant),
      dueDate: values.delai,
      description: values.raison || null,
      quantity: 1,
      unit: "unit",
      beneficiary: user?.id!.toString() ?? "",
      userId: Number(user?.id),
      type: "SPECIAL",
      state: "pending",
      priority: "medium",
      categoryId: 0,
      proof: undefined
    };
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
              <FormItem className="md:col-span-2">
                <FormLabel>
                  Titre du besoin spécial
                  <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="ex. Budget pour déplacement urgent"
                    {...field}
                  />
                </FormControl>
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
                <FormLabel>
                  Montant (FCFA)
                  <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input type="number" placeholder="ex. 500000" {...field} />
                </FormControl>
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
                  Délai d'exécution
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

          {/* RAISON */}
          <FormField
            control={form.control}
            name="raison"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>
                  Justification / Raison
                  <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Expliquez la raison de ce besoin spécial..."
                    className="resize-none min-h-[100px]"
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
              "Soumettre le besoin spécial"
            )}
          </Button>
        </div>
      </form>

      <SuccessModal
        open={isSuccessModalOpen}
        onOpenChange={setIsSuccessModalOpen}
        message="Votre besoin spécial a été soumis avec succès. Il sera traité en urgence par notre équipe."
      />
    </Form>
  );
}
