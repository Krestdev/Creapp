"use client";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useStore } from "@/providers/datastore";
import { bankQ } from "@/queries/bank";
import { userQ } from "@/queries/baseModule";
import { paymentQ } from "@/queries/payment";
import { vehicleQ } from "@/queries/vehicule";
import { PaymentRequest } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { LoaderIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import FilesUpload from "../comp-547";
import { SuccessModal } from "../modals/success-modal";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import ViewDepense from "./viewDepense";
import { payTypeQ } from "@/queries/payType";
import { driverQ } from "@/queries/driver";

export interface ActionResponse<T = any> {
  success: boolean;
  message: string;
  errors?: {
    [K in keyof T]?: string[];
  };
  inputs?: T;
}

const FileSchema = z
  .array(
    z.union([
      z.instanceof(File, { message: "Doit être un fichier valide" }),
      z.string(),
    ]),
  )
  .max(5, "Pas plus d'un document");

export const formSchema = z.object({
  title: z.string({ message: "Ce champ est requis" }),
  model: z.string({ message: "Ce champ est requis" }),
  km: z.coerce.number({ message: "Ce champ est requis" }),
  liters: z.coerce.number({ message: "Ce champ est requis" }),
  Beneficier: z.string({ message: "This field is required" }),
  Montent: z.coerce.number({ message: "Please enter a valid number" }),
  Description: z.string({ message: "This field is required" }),
  Justificatif: FileSchema,
  caisseId: z.string({ message: "selectioner une caisse" }),
});

type Schema = z.infer<typeof formSchema>;

export function CarburentForm() {
  const form = useForm<Schema>({
    resolver: zodResolver(formSchema as any),
    defaultValues: {
      Beneficier: "",
      Description: "",
      km: 0,
      liters: 0,
      model: "",
      Montent: 0,
      title: "Carburant",
    },
  });

  const { user, isHydrated } = useStore();

  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [view, setView] = useState<boolean>(false);
  const [calculatedLiters, setCalculatedLiters] = useState<number>(0);

  // Observer les changements des champs
  const selectedCaisseId = form.watch("caisseId");
  const montentValue = form.watch("Montent");
  const prixUnitaire = form.watch("liters");

  // Effet pour calculer le nombre de litres
  useEffect(() => {
    if (prixUnitaire > 0 && montentValue > 0) {
      const calculated = montentValue / prixUnitaire;
      setCalculatedLiters(parseFloat(calculated.toFixed(2)));
    } else {
      setCalculatedLiters(0);
    }
  }, [prixUnitaire, montentValue]);

  const vehicleData = useQuery({
    queryKey: ["getvehicles"],
    queryFn: vehicleQ.getAll,
  });

  const driverDate = useQuery({
    queryKey: ["drivers"],
    queryFn: () => driverQ.getAll(),
    enabled: isHydrated,
  });

  const paymentsData = useMutation({
    mutationFn: async (
      data: Omit<
        PaymentRequest,
        "id" | "createdAt" | "updatedAt" | "transactionId" | "bankId"
      > & {
        vehiclesId: number;
      } & {
        caisseId: number;
      },
    ) => paymentQ.createDepense(data),
    onSuccess: () => {
      toast.success("Depense soumis avec succès !");
      setIsSuccessModalOpen(true);
      form.reset({
        Beneficier: "",
        Justificatif: undefined,
        Description: "",
        km: 0,
        liters: 0,
        model: "",
        Montent: 0,
        title: "Carburant",
      });
      setView(true);
    },
    onError: (error: any) => {
      toast.error("Une erreur est survenue lors de la soumission.");
    },
  });

  const bankData = useQuery({
    queryKey: ["banks"],
    queryFn: bankQ.getAll,
  });

  const getPaymentType = useQuery({
    queryKey: ["paymentType"],
    queryFn: payTypeQ.getAll,
  });

  // Calcul du solde de la caisse sélectionnée
  const selectedCaisseBalance = useMemo(() => {
    if (!selectedCaisseId || !bankData.data?.data) return 0;
    const caisse = bankData.data.data.find(
      (x) => x.id === Number(selectedCaisseId)
    );
    return caisse?.balance || 0;
  }, [selectedCaisseId, bankData.data?.data]);

  // Vérification en temps réel du solde
  const isBalanceSufficient = useMemo(() => {
    return selectedCaisseBalance >= montentValue;
  }, [selectedCaisseBalance, montentValue]);

  const handleSubmit = form.handleSubmit(async (data: Schema) => {
    // Vérifier le solde avant de soumettre
    const selectedCaisse = bankData.data?.data.find(
      (x) => x.id === Number(data.caisseId)
    );

    if (!selectedCaisse) {
      toast.error("Caisse non trouvée");
      return;
    }

    if (selectedCaisse.balance < data.Montent) {
      toast.error(`Solde insuffisant. Solde disponible: ${selectedCaisse.balance} FCFA`);
      return;
    }

    const payment: Omit<
      PaymentRequest,
      | "id"
      | "createdAt"
      | "updatedAt"
      | "vehiclesId"
      | "bankId"
      | "transactionId"
    > = {
      title: data.title,
      km: data.km,
      liters: data.liters,
      price: data.Montent,
      description: data.Description,
      driverId: Number(data.Beneficier),
      justification: data.Justificatif,
      status: "paid",
      type: "CURRENT",
      methodId: getPaymentType.data?.data.find((item) => item.type === "cash")
        ?.id!,
      priority: "medium",
      isPartial: false,
      userId: user!.id,
      deadline: new Date(),
      proof: "",
      reference: "",
    };
    paymentsData.mutate({
      ...payment,
      vehiclesId: Number(data.model),
      caisseId: Number(data.caisseId),
    });
  });

  return (
    !driverDate.isLoading &&
    !bankData.isLoading &&
    bankData.data &&
    driverDate.data && (
      <>
        <Form {...form}>
          <form
            onSubmit={handleSubmit}
            className="p-2 sm:p-5 md:p-8 w-full rounded-md gap-2 max-w-3xl"
          >
            <FieldGroup className="grid grid-cols-1 @min-[640px]:grid-cols-2 gap-4 mb-6">
              <Controller
                name="title"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="gap-1">
                    <FieldLabel htmlFor="title">
                      Titre <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Input
                      {...field}
                      id="title"
                      type="text"
                      disabled={true}
                      onChange={(e) => {
                        field.onChange(e.target.value);
                      }}
                      aria-invalid={fieldState.invalid}
                      placeholder="Le titre"
                    />

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="caisseId"
                control={form.control}
                render={({ field, fieldState }) => {
                  const options = bankData.data.data
                    .filter((x) => x.type === "CASH")
                    .map((bank) => {
                      return { value: bank.id, label: bank.label };
                    });
                  return (
                    <Field data-invalid={fieldState.invalid} className="gap-1">
                      <FieldLabel htmlFor="caisseId">
                        Caisse <span className="text-destructive">*</span>
                      </FieldLabel>

                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selectioner une Caisse" />
                        </SelectTrigger>
                        <SelectContent>
                          {options.map((option) => {
                            const caisse = bankData.data.data.find(
                              (x) => x.id === option.value
                            );
                            return (
                              <SelectItem
                                key={option.value}
                                value={option.value.toString()}
                              >
                                {option.label} (Solde: {caisse?.balance || 0} FCFA)
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                      {field.value && selectedCaisseBalance > 0 && (
                        <p className="text-sm mt-1">
                          Solde disponible: <strong>{selectedCaisseBalance} FCFA</strong>
                        </p>
                      )}
                    </Field>
                  );
                }}
              />

              <Controller
                name="model"
                control={form.control}
                render={({ field, fieldState }) => {
                  return (
                    <Field data-invalid={fieldState.invalid} className="gap-1">
                      <FieldLabel htmlFor="model">
                        Modèle du véhicule{" "}
                        <span className="text-destructive">*</span>
                      </FieldLabel>

                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selectioner un vehicule" />
                        </SelectTrigger>
                        <SelectContent>
                          {vehicleData.data?.data.map((option) => (
                            <SelectItem
                              key={option.id}
                              value={option.id.toString()}
                            >
                              {`${option.label} - ${option.mark} - ${option.matricule}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  );
                }}
              />

              <Controller
                name="km"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="gap-1">
                    <FieldLabel htmlFor="km">
                      Kilométrage <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Input
                      {...field}
                      id="km"
                      type="number"
                      onChange={(e) => {
                        field.onChange(e.target.valueAsNumber);
                      }}
                      aria-invalid={fieldState.invalid}
                      placeholder="1000"
                    />

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="liters"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="gap-1">
                    <FieldLabel htmlFor="liters">
                      Prix unitaire du litre (FCFA){" "}
                      <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Input
                      {...field}
                      id="liters"
                      type="number"
                      onChange={(e) => {
                        field.onChange(e.target.valueAsNumber);
                      }}
                      aria-invalid={fieldState.invalid}
                      placeholder="850"
                    />
                    <FieldDescription>
                      Entrez le prix d'un litre de carburant en FCFA. Le nombre de litres sera calculé automatiquement.
                    </FieldDescription>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="Montent"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="gap-1">
                    <FieldLabel htmlFor="Montent">
                      Montant total dépensé <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Input
                      {...field}
                      id="Montent"
                      type="number"
                      onChange={(e) => {
                        field.onChange(e.target.valueAsNumber);
                      }}
                      aria-invalid={fieldState.invalid}
                      placeholder="1000"
                      className={!isBalanceSufficient && selectedCaisseId ? "border-red-500" : ""}
                    />

                    {/* Afficher le calcul du nombre de litres */}
                    {prixUnitaire > 0 && montentValue > 0 && (
                      <div className="mt-2 p-2 bg-blue-50 rounded-md border border-blue-200">
                        <p className="text-sm text-blue-700 font-medium">
                          Nombre de litres consommés :
                        </p>
                        <p className="text-sm text-blue-600">
                          <span className="font-bold ml-1">
                            {calculatedLiters} Litres
                          </span>
                        </p>
                      </div>
                    )}

                    {selectedCaisseId && (
                      <div className="mt-2">
                        {!isBalanceSufficient && (
                          <p className="text-red-500 text-sm">
                            ❌ Solde insuffisant. Dépassement de {montentValue - selectedCaisseBalance} FCFA
                          </p>
                        )}
                      </div>
                    )}

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="Beneficier"
                control={form.control}
                render={({ field, fieldState }) => {
                  const options = driverDate.data.data.map((driver) => {
                    return { value: driver.id, label: driver.firstName };
                  });
                  return (
                    <Field data-invalid={fieldState.invalid} className="gap-1">
                      <FieldLabel htmlFor="Beneficier">
                        Beneficiaire <span className="text-destructive">*</span>
                      </FieldLabel>

                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selectioner un Beneficier" />
                        </SelectTrigger>
                        <SelectContent>
                          {options.map((option) => (
                            <SelectItem
                              key={option.value}
                              value={option.value.toString()}
                            >
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  );
                }}
              />

              <Controller
                name="Description"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field
                    data-invalid={fieldState.invalid}
                    className="gap-1 col-span-full"
                  >
                    <FieldLabel htmlFor="Description">
                      Description <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Textarea
                      {...field}
                      aria-invalid={fieldState.invalid}
                      id="Description"
                      placeholder="Description"
                    />
                    <FieldDescription>
                      Description de la depense
                    </FieldDescription>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="Justificatif"
                control={form.control}
                render={({ fieldState }) => (
                  <div>
                    <FormField
                      control={form.control}
                      name="Justificatif"
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
                    {Array.isArray(fieldState.error) ? (
                      fieldState.error?.map((error, i) => (
                        <p
                          key={i}
                          role="alert"
                          data-slot="field-error"
                          className="text-destructive text-sm"
                        >
                          {error.message}
                        </p>
                      ))
                    ) : (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </div>
                )}
              />
            </FieldGroup>


            <div className="flex justify-end items-center w-full">
              <Button
                variant={"primary"}
                disabled={paymentsData.isPending || !isBalanceSufficient || !selectedCaisseId}
                type="submit"
                className="min-w-[200px]"
              >
                {paymentsData.isPending ? (
                  <>
                    <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                    {"Soumission en cours..."}
                  </>
                ) : (
                  "Soumettre la depense"
                )}
              </Button>
            </div>
          </form>
        </Form>
        {paymentsData.isSuccess && (
          <ViewDepense
            open={view}
            openChange={setView}
            paymentRequest={paymentsData.data.data}
          />
        )}
        <SuccessModal
          open={isSuccessModalOpen}
          onOpenChange={setIsSuccessModalOpen}
          message="Votre besoin a été soumis avec succès. Il sera traité par notre équipe."
        />
      </>
    )
  );
}