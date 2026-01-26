"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { requestQ } from "@/queries/requestModule";
import { RequestModelT } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon, LoaderIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import FilesUpload from "../comp-547";
import { SearchableSelect } from "../base/searchableSelect";
import { Calendar } from "../ui/calendar";
import MultiSelectUsers from "../base/multiSelectUsers";
import { projectQ } from "@/queries/projectModule";
import { paymentQ } from "@/queries/payment";
import { categoryQ } from "@/queries/categoryModule";

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
  .nullable();

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
});

interface BesoinRHLastValProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  requestData: RequestModelT | null;
  onSuccess?: () => void;
}

export default function BesoinRHLastVal({
  open,
  setOpen,
  requestData,
  onSuccess,
}: BesoinRHLastValProps) {
  const { user } = useStore();

  const [isFormInitialized, setIsFormInitialized] = useState(false);

  // ----------------------------------------------------------------------
  // QUERY PROJECTS
  // ----------------------------------------------------------------------
  const projectsData = useQuery({
    queryKey: ["projects"],
    queryFn: async () => projectQ.getAll(),
  });

  // ----------------------------------------------------------------------
  // QUERY PAYMENTS
  // ----------------------------------------------------------------------
  const paymentsData = useQuery({
    queryKey: ["payments"],
    queryFn: async () => paymentQ.getAll(),
  });

  // ----------------------------------------------------------------------
  // QUERY USERS
  // ----------------------------------------------------------------------
  const usersData = useQuery({
    queryKey: ["users"],
    queryFn: async () => userQ.getAll(),
  });

  const USERS =
    usersData.data?.data.filter((u) => u.verified).map((u) => ({
      id: u.id!,
      name: u.firstName + " " + u.lastName,
    })) || [];

  // ----------------------------------------------------------------------
  // FORM INITIALISATION
  // ----------------------------------------------------------------------
  const form = useForm<z.infer<typeof formSchema>>({
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
    },
  });

  // ----------------------------------------------------------------------
  // INITIALISATION DES DONNÉES
  // ----------------------------------------------------------------------

  const paiement = paymentsData.data?.data.find(
    (x) => x.requestId === requestData?.id,
  );

  useEffect(() => {
    if (requestData && open && USERS.length > 0) {
      const initializeForm = async () => {
        try {
          // Formater la période si elle existe
          let periodValue: {
            from?: Date;
            to?: Date;
          } = {};

          if (requestData.period) {
            periodValue = {
              from: requestData.period.from
                ? new Date(requestData.period.from)
                : undefined,
              to: requestData.period.to
                ? new Date(requestData.period.to)
                : undefined,
            };
          }

          // Formater la preuve si elle existe
          let proofValue: any[] = [];
          if (paiement?.proof) {
            if (typeof paiement?.proof === "string") {
              proofValue = [paiement?.proof];
            } else if (Array.isArray(paiement?.proof)) {
              proofValue = paiement?.proof;
            }
          }

          // Récupérer les bénéficiaires
          const beneficiaireIds =
            requestData.beficiaryList?.flatMap((x) => x.id) || [];
          if (typeof requestData.beneficiary === "string") {
            const benefId = parseInt(requestData.beneficiary);
            if (!isNaN(benefId) && !beneficiaireIds.includes(benefId)) {
              beneficiaireIds.push(benefId);
            }
          }

          // Réinitialiser le formulaire avec les valeurs
          form.reset({
            projet: requestData.projectId?.toString() || "",
            titre: requestData.label || "",
            description: requestData.description || "",
            montant: requestData.amount?.toString() || "",
            periode: periodValue,
            date_limite: requestData.dueDate
              ? new Date(requestData.dueDate)
              : new Date(),
            beneficiaire: beneficiaireIds,
            justificatif: proofValue,
          });

          setIsFormInitialized(true);
        } catch (error) {
          console.error(
            "Erreur lors de l'initialisation du formulaire:",
            error,
          );
          toast.error("Erreur lors du chargement des données");
        }
      };

      initializeForm();
    } else {
      setIsFormInitialized(false);
    }
  }, [requestData, open, USERS.length, form]);

  // ----------------------------------------------------------------------
  // UPDATE MUTATION
  // ----------------------------------------------------------------------

  const categoriesData = useQuery({
    queryKey: ["categoryList"],
    queryFn: () => {
      return categoryQ.getCategories();
    },
  });

  const validator = categoriesData.data?.data
    ?.find((cat) => cat.id === requestData?.categoryId)
    ?.validators?.find((v) => v.userId === user?.id);

  const validateRequest = useMutation({
    mutationFn: async ({
      id,
      validator,
    }: {
      id: number;
      validator:
      | {
        id?: number | undefined;
        userId: number;
        rank: number;
      }
      | undefined;
    }) => requestQ.validate(id, validator?.id!, validator),
    onSuccess: () => {
      toast.success("Besoin approuvé avec succès !");
    },
    onError: () => {
      toast.error("Erreur lors de la validation");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<RequestModelT>) => {
      if (!requestData?.id) throw new Error("ID de la demande manquant");
      return requestQ.specialUpdate(data, Number(requestData.id));
    },

    onSuccess: () => {
      toast.success("Besoin RH validé avec succès !");
      setOpen(false);
      onSuccess?.();
      validateRequest.mutateAsync({
        id: requestData?.id!,
        validator: validator,
      });
    },

    onError: (error: any) => {
      console.error("Erreur lors de la validation:", error);
      toast.error("Une erreur est survenue lors de la validation.");
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!requestData?.id) {
      toast.error("ID de la demande manquant");
      return;
    }

    // Préparation des données pour la mise à jour
    const requestDataUpdate: Partial<RequestModelT> = {
      label: values.titre,
      description: values.description || null,
      amount: Number(values.montant),
      projectId: Number(values.projet),
      dueDate: values.date_limite,
      period: { from: values.periode.from, to: values.periode.to },
      benef: values.beneficiaire,
      proof: values.justificatif,
      // Champs fixes
      categoryId: 0,
      quantity: 1,
      unit: "unit",
      userId: requestData.userId,
      type: "ressource_humaine",
      // Garder les valeurs originales pour les champs non modifiables
      state: requestData?.state || "pending",
      priority: requestData?.priority || "medium",
      beneficiary:
        values.beneficiaire.length > 0 ? values.beneficiaire[0].toString() : "",
    };

    updateMutation.mutate(requestDataUpdate);
  }

  // ----------------------------------------------------------------------
  // RENDER
  // ----------------------------------------------------------------------
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[760px] w-full max-h-[80vh] p-0 gap-0 flex flex-col">
        {/* Header avec fond bordeaux - FIXE */}
        <DialogHeader className="bg-[#8B1538] text-white p-6 m-4 rounded-lg pb-8 relative shrink-0">
          <DialogTitle className="text-xl font-semibold text-white">
            {"Approbation"}
          </DialogTitle>
          <p className="text-sm text-white/80 mt-1">
            {"Validez les informations du besoin en ressources humaines"}
          </p>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex-1 overflow-y-auto px-6"
          >
            <div className="space-y-8 max-w-3xl mx-auto pb-8">
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
                        disabled
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
                        <Input
                          disabled
                          placeholder="Titre du besoin"
                          {...field}
                        />
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
                      <FormLabel>
                        {"Période"}
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Popover>
                          <PopoverTrigger asChild className="h-10 w-full">
                            <FormControl>
                              <Button
                                disabled
                                type="button"
                                variant={"outline"}
                                className="w-full pl-3 text-left font-normal"
                              >
                                {field.value?.from && field.value?.to ? (
                                  <>
                                    {format(field.value.from, "PPP", {
                                      locale: fr,
                                    })}{" "}
                                    -{" "}
                                    {format(field.value.to, "PPP", {
                                      locale: fr,
                                    })}
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
                      <FormLabel>
                        {"Montant"}
                        <span className="text-red-500">*</span>
                      </FormLabel>
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
                    <FormItem className="@min-[640px]:col-span-2">
                      <FormLabel>
                        {"Bénéficiaire(s)"}
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <MultiSelectUsers
                          disabled
                          users={USERS}
                          selected={USERS.filter((u) =>
                            field.value?.includes(u.id),
                          )}
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
                    <FormItem className="@min-[640px]:col-span-2">
                      <FormLabel>{"Justificatif"}</FormLabel>
                      <FormControl>
                        <FilesUpload
                          disabled
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
                    <FormItem className="@min-[640px]:col-span-2">
                      <FormLabel>
                        {"Description détaillée du besoin"}
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          disabled
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
            </div>
          </form>
          {/* Boutons - FIXE */}
          <div className="flex gap-3 p-4 pt-0 shrink-0 w-full justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={updateMutation.isPending}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={updateMutation.isPending || !isFormInitialized}
              className="bg-green-500 hover:bg-green-600"
              onClick={() => form.handleSubmit(onSubmit)()}
            >
              Valider le besoin RH
              {updateMutation.isPending && (
                <LoaderIcon className="ml-2 h-4 w-4 animate-spin" />
              )}
            </Button>
          </div>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
