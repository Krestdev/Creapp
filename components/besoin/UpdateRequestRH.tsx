"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { paymentQ } from "@/queries/payment";
import { requestQ } from "@/queries/requestModule";
import { ProjectT, RequestModelT, User } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon, LoaderIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import MultiSelectUsers from "../base/multiSelectUsers";
import { SearchableSelect } from "../base/searchableSelect";
import FilesUpload from "../comp-547";
import { Calendar } from "../ui/calendar";

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
  .max(1, "Pas plus d'un document");

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

interface UpdateRHRequestProps {
  open: boolean;
  onOpenChange: React.Dispatch<React.SetStateAction<boolean>>;
  requestData: RequestModelT;
  projects: Array<ProjectT>;
  users: Array<User>;
}

export default function UpdateRHRequest({
  open,
  onOpenChange,
  requestData,
  projects,
  users,
}: UpdateRHRequestProps) {
  const { user } = useStore();

  const [isFormInitialized, setIsFormInitialized] = useState(false);

  // ----------------------------------------------------------------------
  // QUERY PAYMENTS
  // ----------------------------------------------------------------------
  const paymentsData = useQuery({
    queryKey: ["payments"],
    queryFn: async () => paymentQ.getAll(),
  });

  const USERS =
    users.filter((u) => u.verified).map((u) => ({
      id: u.id!,
      name: u.firstName + " " + u.lastName,
    }));

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
    if ( open && USERS.length > 0) {
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
  const updateMutation = useMutation({
    mutationFn: async (data: Partial<RequestModelT>) => {
      if (!requestData?.id) throw new Error("ID de la demande manquant");
      return requestQ.specialUpdate(data, Number(requestData.id));
    },

    onSuccess: () => {
      toast.success("Besoin RH modifié avec succès !");
      onOpenChange(false);
    },

    onError: (error: any) => {
      console.error("Erreur lors de la modification:", error);
      toast.error("Une erreur est survenue lors de la modification.");
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
      description: values.description,
      amount: Number(values.montant),
      projectId: Number(values.projet),
      dueDate: values.date_limite,
      period: { from: values.periode.from, to: values.periode.to },
      benef: values.beneficiaire,
      proof: values.justificatif,
      // Champs fixes
      categoryId: 1,
      quantity: 1,
      unit: "unit",
      userId: Number(user?.id),
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        {/* Header avec fond bordeaux - FIXE */}
        <DialogHeader variant={"secondary"}>
          <DialogTitle>
            {`Modifier - ${requestData.label}`}
          </DialogTitle>
          <DialogDescription>
            {"Modifiez les informations du besoin en ressources humaines"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="form-3xl"
          >
                {/* PROJET */}
                <FormField
                  control={form.control}
                  name="projet"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel isRequired>
                        {"Projet"}
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
                      <FormLabel isRequired>
                        {"Titre"}
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Ex. Salaires Octobre" {...field} />
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
                      <FormLabel isRequired>
                        {"Période"}
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
                      <FormLabel isRequired>
                        {"Date limite"}
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
                      <FormLabel isRequired>
                        {"Montant"}
                      </FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="ex. 500 000" {...field} />
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
                      <FormLabel isRequired>
                        {"Bénéficiaire(s)"}
                      </FormLabel>
                      <FormControl>
                        <MultiSelectUsers
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
                      <FormLabel isRequired>
                        {"Description détaillée du besoin"}
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Description détaillée du besoin RH"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
          </form>
          {/* Boutons - FIXE */}
          <DialogFooter>
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                disabled={updateMutation.isPending}
              >
                {"Annuler"}
              </Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={updateMutation.isPending || !isFormInitialized}
              isLoading={updateMutation.isPending}
              variant={"secondary"}
            >
              {"Enregistrer les modifications"}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
