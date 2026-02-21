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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { SearchableSelect } from "../base/searchableSelect";
import FilesUpload from "../comp-547";
import { Calendar } from "../ui/calendar";
import BeneficiairesList from "./AddBenef";

// ----------------------------------------------------------------------
// VALIDATION
// ----------------------------------------------------------------------
const SingleFileSchema = z.array(
    z.union([
      z.instanceof(File, { message: "Doit être un fichier valide" }),
      z.string(),
    ]),
  );

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
  onOpenChange: React.Dispatch<React.SetStateAction<boolean>>;
  requestData: RequestModelT;
  users: Array<User>;
  projects: Array<ProjectT>;
}

export default function UpdateRequestFac({
  open,
  onOpenChange,
  requestData,
  users,
  projects
}: UpdateFacilitationRequestProps) {
  const { user } = useStore();

  const [openCalendar, setOpenCalendar] = useState(false);
  const [beneficiairesList, setBeneficiairesList] = useState<
    { id: number; nom: string; montant: number }[]
  >([]);
  const [isFormInitialized, setIsFormInitialized] = useState(false);

  // ----------------------------------------------------------------------
  // QUERY PAYMENTS
  // ----------------------------------------------------------------------
  const paymentsData = useQuery({
    queryKey: ["payments"],
    queryFn: async () => paymentQ.getAll(),
  });
  

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
    (x) => x.requestId === requestData?.id,
  );

  useEffect(() => {
    if ( open && users.length > 0) {
      const initializeForm = async () => {
        try {
          // Récupérer la liste des bénéficiaires depuis benFac
          if (requestData.benFac?.list) {
            setBeneficiairesList(
              requestData.benFac.list.map((item: any) => ({
                id: item.id,
                nom: item.name,
                montant: item.amount,
              })),
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
            category: requestData.type === "facilitation" ? "facilitation" : "",
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
            error,
          );
          toast.error("Erreur lors du chargement des données");
        }
      };

      initializeForm();
    } else {
      setIsFormInitialized(false);
    }
  }, [requestData, open, users, form]);

  // ----------------------------------------------------------------------
  // UPDATE MUTATION
  // ----------------------------------------------------------------------

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<RequestModelT>) => {
      if (!requestData?.id) throw new Error("ID de la demande manquant");
      return requestQ.specialUpdate(data, Number(requestData.id));
    },

    onSuccess: () => {
      toast.success("Votre besoin a été modifié avec succès !");
      onOpenChange(false);

    },

    onError: (error: Error) => {
      console.error("Erreur lors de la modification: ", error.message);
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
      description: values.description,
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader variant={"secondary"}>
          <DialogTitle>{requestData.label}</DialogTitle>
          <DialogDescription>
            {"Modifiez les informations du besoin"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="form-3xl"
          >
            <div className="space-y-8 max-w-3xl mx-auto pb-8">
              <div className="flex flex-col @min-[640px]:grid @min-[640px]:grid-cols-2 gap-4">
                {/* PROJET */}
                <FormField
                  control={form.control}
                  name="projet"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel isRequired>
                        {"Projet concerné"}
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

                {/* CATEGORIE */}
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel isRequired>
                        {"Categorie"}
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
                      <FormLabel isRequired>
                        {"Titre"}
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
                      <FormLabel isRequired>
                        {"Recepteur pour compte"}
                      </FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Sélectionner un recepteur pour compte" />
                        </SelectTrigger>
                        <SelectContent>
                          {users.map((user) => (
                            <SelectItem
                              key={user.id}
                              value={user.id!.toString()}
                            >
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
                      <FormLabel isRequired>
                        {"Date limite"}
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
                      <FormLabel isRequired>
                        {"Description/Détail"}
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
              variant={"secondary"}
              disabled={updateMutation.isPending || !isFormInitialized}
              isLoading={updateMutation.isPending}
              onClick={() => form.handleSubmit(onSubmit)()}
            >
              {"Modifier la demande"}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
