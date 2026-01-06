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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon, ChevronDownIcon, LoaderIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import FilesUpload from "../comp-547";
import { SearchableSelect } from "../base/searchableSelect";
import { Calendar } from "../ui/calendar";
import BeneficiairesList from "./AddBenef";
import { PaymentQueries } from "@/queries/payment";

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
  .nullable();

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

interface UpdateFacilitationRequestProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  requestData: RequestModelT | null;
  onSuccess?: () => void;
}

export default function UpdateRequestFac({
  open,
  setOpen,
  requestData,
  onSuccess,
}: UpdateFacilitationRequestProps) {
  const { user } = useStore();
  const queryClient = useQueryClient();
  const [openCalendar, setOpenCalendar] = useState(false);
  const [beneficiairesList, setBeneficiairesList] = useState<
    { id: number; nom: string; montant: number }[]
  >([]);
  const [isFormInitialized, setIsFormInitialized] = useState(false);

  // ----------------------------------------------------------------------
  // QUERY PROJECTS
  // ----------------------------------------------------------------------
  const projects = new ProjectQueries();
  const projectsData = useQuery({
    queryKey: ["projects"],
    queryFn: async () => projects.getAll(),
  });

  // ----------------------------------------------------------------------
  // QUERY PAYMENTS
  // ----------------------------------------------------------------------
  const payments = new PaymentQueries();
  const paymentsData = useQuery({
    queryKey: ["payments"],
    queryFn: async () => payments.getAll(),
  });

  // ----------------------------------------------------------------------
  // QUERY USERS
  // ----------------------------------------------------------------------
  const users = new UserQueries();
  const usersData = useQuery({
    queryKey: ["users"],
    queryFn: async () => users.getAll(),
  });

  const USERS = usersData.data?.data || [];

  // ----------------------------------------------------------------------
  // FORM INITIALISATION
  // ----------------------------------------------------------------------
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      beneficiaire: "",
      projet: "",
      category: "facilitation",
      delai: new Date(),
      justificatif: [],
      title: "",
      description: "",
    },
  });

  // ----------------------------------------------------------------------
  // INITIALISATION DES DONNÉES
  // ----------------------------------------------------------------------

  const paiement = paymentsData.data?.data.find(
    (x) => x.requestId === requestData?.id
  );

  useEffect(() => {
    if (requestData && open && USERS.length > 0) {
      const initializeForm = async () => {
        try {
          // Récupérer la liste des bénéficiaires depuis benFac
          if (requestData.benFac?.list) {
            setBeneficiairesList(
              requestData.benFac.list.map((item: any) => ({
                id: item.id,
                nom: item.name,
                montant: item.amount,
              }))
            );
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

          // Réinitialiser le formulaire avec les valeurs
          form.reset({
            beneficiaire: requestData.beneficiary?.toString() || "",
            projet: requestData.projectId?.toString() || "",
            category: requestData.type === "FAC" ? "facilitation" : "",
            delai: requestData.dueDate
              ? new Date(requestData.dueDate)
              : new Date(),
            justificatif: proofValue,
            title: requestData.label || "",
            description: requestData.description || "",
          });

          setIsFormInitialized(true);
        } catch (error) {
          console.error(
            "Erreur lors de l'initialisation du formulaire:",
            error
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
  const request = new RequestQueries();
  const updateMutation = useMutation({
    mutationKey: ["requests", "update", "facilitation"],
    mutationFn: async (data: Partial<RequestModelT>) => {
      if (!requestData?.id) throw new Error("ID de la demande manquant");
      return request.specialUpdate(data, Number(requestData.id));
    },

    onSuccess: () => {
      toast.success("Demande de facilitation modifiée avec succès !");
      setOpen(false);

      // Invalider et rafraîchir toutes les requêtes
      queryClient.invalidateQueries({
        queryKey: ["requests"],
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: ["requests", user?.id],
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: ["requests-validation"],
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: ["payment", user?.id],
        refetchType: "active",
      });

      onSuccess?.();
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
      type: "FAC",
      // Garder les valeurs originales pour les champs non modifiables
      state: requestData?.state || "pending",
      priority: requestData?.priority || "medium",
      benFac: {
        list: beneficiairesList.map((b) => ({
          id: b.id,
          name: b.nom,
          amount: b.montant,
        })),
      },
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
            {"MODIFICATION DEMANDE DE FACILITATION - " +
              (requestData?.label || "")}
          </DialogTitle>
          <p className="text-sm text-white/80 mt-1">
            {
              "Modifiez les informations de la demande de facilitation existante"
            }
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
                        onChange={field.onChange}
                        options={
                          projectsData.data?.data
                            ?.filter(
                              (p) =>
                                p.status !== "cancelled" &&
                                p.status !== "Completed" &&
                                p.status !== "on-hold"
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
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
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
                      <Input
                        {...field}
                        placeholder="ex. Achat du carburant groupe"
                      />
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
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Sélectionner un recepteur pour compte" />
                        </SelectTrigger>
                        <SelectContent>
                          {USERS.map((user) => (
                            <SelectItem
                              key={user.id}
                              value={user.id!.toString()}
                            >
                              {user.firstName + " " + user.lastName}
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
                        <Popover
                          open={openCalendar}
                          onOpenChange={setOpenCalendar}
                        >
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
                              onSelect={(d) => {
                                field.onChange(d);
                                setOpenCalendar(false);
                              }}
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

                {/* LISTE DES BÉNÉFICIAIRES */}
                <div className="@min-[640px]:col-span-2">
                  <BeneficiairesList
                    onBeneficiairesChange={setBeneficiairesList}
                    initialBeneficiaires={beneficiairesList}
                  />
                </div>

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
              className="bg-[#8B1538] hover:bg-[#7A1230]"
              onClick={() => form.handleSubmit(onSubmit)()}
            >
              Modifier la demande
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
