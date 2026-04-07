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
import { requestQ } from "@/queries/requestModule";
import { Category, RequestModelT } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { CalendarIcon, LoaderIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { SearchableSelect } from "../base/searchableSelect";
import { userQ } from "@/queries/baseModule";

interface Props {
  categories: Array<Category>;
}

// ----------------------------------------------------------------------
// VALIDATION
// ----------------------------------------------------------------------

const today = new Date();
today.setHours(0, 0, 0, 0);

const formSchema = z.object({
  titre: z.string().min(1, "Le titre est requis"),
  montant: z
    .string()
    .min(1, "Le montant est requis")
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Le montant doit être un nombre positif",
    }),
  raison: z.string().optional(),
  delai: z.date().min(today, "Le delai d'exécution doit être dans le futur"),
  categoryId: z.coerce.number({
    message: "Veuillez sélectionner une catégorie",
  }),
  beneficiaireId: z.string().optional(),
  paytype: z.enum(["cash", "chq", "ov"], {
    required_error: "Sélectionner le moyen de payement",
    invalid_type_error: "Sélectionner le moyen de payement",
  }),
});

export default function SpecialRequestForm({ categories }: Props) {
  const { user } = useStore();

  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  // ----------------------------------------------------------------------
  // FORM INITIALISATION
  // ----------------------------------------------------------------------
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      titre: "",
      montant: "",
      raison: undefined,
      delai: undefined,
      categoryId: undefined,
      beneficiaireId: undefined,
      paytype: undefined,
    },
  });

  // ----------------------------------------------------------------------
  // REQUEST MUTATION
  // ----------------------------------------------------------------------

  const getUsers = useQuery({
    queryKey: ["users"],
    queryFn: async () => userQ.getAll(),
  });

  const USERS =
    getUsers.data?.data
      .filter((u) => u.verified)
      .map((u) => ({
        id: u.id!,
        name: u.firstName + " " + u.lastName,
      })) || [];

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
      amount: Number(values.montant),
      dueDate: values.delai,
      description: values.raison ?? "",
      quantity: 1,
      unit: "unit",
      beneficiary: user?.id!.toString() ?? "",
      userId: Number(user?.id),
      type: "speciaux",
      state: "pending",
      priority: "medium",
      categoryId: values.categoryId,
      benef: Array(Number(values.beneficiaireId)),
      paytype: values.paytype,
      proof: undefined,
    };
    requestMutation.mutate(requestData);
  }

  const dayStart = new Date();
  dayStart.setDate(dayStart.getDate() - 1);
  dayStart.setHours(0, 0, 0, 0);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 max-w-3xl"
      >
        <div className="flex flex-col md:grid md:grid-cols-2 gap-4">
          {/* TITRE */}
          <FormField
            control={form.control}
            name="titre"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel isRequired>{"Titre du besoin spécial"}</FormLabel>
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
          {/* Category */}
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => {
              const hrCategories = categories.filter(
                (c) => c.type.type === "ressource_humaine",
              );

              const selectedCategory = hrCategories.find(
                (c) => String(c.id) === String(field.value),
              );

              return (
                <FormItem>
                  <FormLabel isRequired>{"Categorie"}</FormLabel>
                  <FormControl>
                    <SearchableSelect
                      onChange={field.onChange}
                      options={hrCategories.map((c) => ({
                        value: c.id!.toString(),
                        label: c.label,
                      }))}
                      value={field.value ? String(field.value) : ""}
                      width="w-full"
                      allLabel=""
                      placeholder="Sélectionner une catégorie"
                    />
                  </FormControl>

                  {/* ✅ Affichage de la description sous le SearchableSelect */}
                  {selectedCategory?.description && (
                    <div className="first-letter:uppercase text-sm text-muted-foreground animate-in fade-in slide-in-from-top-1 duration-300">
                      {selectedCategory.description}
                    </div>
                  )}

                  <FormMessage />
                </FormItem>
              );
            }}
          />

          {/* MONTANT */}
          <FormField
            control={form.control}
            name="montant"
            render={({ field }) => (
              <FormItem>
                <FormLabel isRequired>{"Montant (FCFA)"}</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="ex. 500000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Recepteur pour compte */}
          <FormField
            control={form.control}
            name="beneficiaireId"
            render={({ field }) => (
              <FormItem>
                <FormLabel isRequired>{"Recepteur pour compte"}</FormLabel>
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

          {/* Moyen de paiement */}
          <FormField
            control={form.control}
            name="paytype"
            render={({ field }) => (
              <FormItem>
                <FormLabel isRequired>{"Moyen de paiement"}</FormLabel>
                <Select
                  defaultValue={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger className="min-w-60 w-full">
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">{"Espèces"}</SelectItem>
                    <SelectItem value="chq">{"Cheque"}</SelectItem>
                    <SelectItem value="ov">{"Virement"}</SelectItem>
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
                <FormLabel isRequired>{"Délai d'exécution"}</FormLabel>
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
                        disabled={(date) => date <= dayStart}
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
                <FormLabel>{"Commentaire"}</FormLabel>
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
            isLoading={requestMutation.isPending}
          >
            {"Soumettre le besoin spécial"}
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
