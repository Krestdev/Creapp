"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { providerQ } from "@/queries/providers";
import { Provider } from "@/types/types";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import FilesUpload from "../comp-547";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { CalendarIcon } from "lucide-react";

// Définir un type pour les fichiers
type FileValue = File | string;

const FileSchema = z.union([z.instanceof(File), z.string()]).nullable();

// Schéma de validation avec dates optionnelles
const formSchema = z.object({
  name: z.string().min(1, "Le nom du fournisseur est obligatoire"),
  phone: z.string().optional(),
  email: z.string().email("Email invalide").optional().or(z.literal("")),
  address: z.string().optional(),
  carte_contribuable: FileSchema,
  acf: FileSchema,
  expireAtacf: z.string().optional(),
  expireAtcarte_contribuable: z.string().optional(),
  plan_localisation: FileSchema,
  commerce_registre: FileSchema,
  expireAtplan_localisation: z.string().optional(),
  expireAtcommerce_registre: z.string().optional(),
  banck_attestation: FileSchema.optional(),
  expireAtbanck_attestation: z.string().optional(),
  RCCM: z.string().optional(),
  NIU: z.string().optional(),
  regem: z.string().min(1, "Le régime du fournisseur est obligatoire"),
});

type FormValues = z.infer<typeof formSchema>;

interface UpdateRequestProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  providerData: Provider;
  onSuccess?: () => void;
}

// Fonction utilitaire pour formater une date valide
const formatDateSafe = (dateValue: string | Date | null | undefined): string | undefined => {
  if (!dateValue) return undefined;
  const d = new Date(dateValue);
  return !isNaN(d.getTime()) ? format(d, "yyyy-MM-dd") : undefined;
};

export default function UpdateProvider({
  open,
  setOpen,
  providerData,
  onSuccess,
}: UpdateRequestProps) {
  const [selectBankDate, setSelectBankDate] = useState<boolean>(false);
  const [selectACFDate, setSelectACFDate] = useState<boolean>(false);
  const [selectCarteDate, setSelectCarteDate] = useState<boolean>(false);
  const [selectPlanDate, setSelectPlanDate] = useState<boolean>(false);
  const [selectCommerceDate, setSelectCommerceDate] = useState<boolean>(false);

  const defaultValues: FormValues = useMemo(
    () => ({
      name: "",
      phone: "",
      email: "",
      address: "",
      RCCM: "",
      NIU: "",
      regem: "",
      carte_contribuable: null,
      acf: null,
      expireAtacf: undefined,
      expireAtcarte_contribuable: undefined,
      expireAtplan_localisation: undefined,
      expireAtcommerce_registre: undefined,
      plan_localisation: null,
      commerce_registre: null,
      banck_attestation: null,
      expireAtbanck_attestation: undefined,
    }),
    [],
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onChange",
  });

  // Réinitialiser le formulaire quand providerData change
  useEffect(() => {
    if (open && providerData) {
      form.reset({
        name: providerData.name ?? "",
        phone: providerData.phone ?? "",
        email: providerData.email ?? "",
        address: providerData.address ?? "",
        RCCM: providerData.RCCM ?? "",
        NIU: providerData.NIU ?? "",
        regem: providerData.regem ?? "",
        carte_contribuable: providerData.carte_contribuable ?? null,
        acf: providerData.acf ?? null,
        expireAtacf: formatDateSafe(providerData.expireAtacf),
        expireAtcarte_contribuable: formatDateSafe(providerData.expireAtcarte_contribuable),
        expireAtplan_localisation: formatDateSafe(providerData.expireAtplan_localisation),
        expireAtcommerce_registre: formatDateSafe(providerData.expireAtcommerce_registre),
        plan_localisation: providerData.plan_localisation ?? null,
        commerce_registre: providerData.commerce_registre ?? null,
        banck_attestation: providerData.banck_attestation ?? null,
        expireAtbanck_attestation: formatDateSafe(providerData.expireAtbanck_attestation),
      });
    } else if (!open) {
      form.reset(defaultValues);
    }
  }, [open, providerData, form, defaultValues]);

  const providerMutation = useMutation({
    mutationFn: async (data: Partial<Provider>) => {
      if (!providerData?.id) {
        throw new Error("ID du fournisseur manquant");
      }
      return providerQ.update(providerData.id, data);
    },
    onSuccess: () => {
      toast.success("Fournisseur modifié avec succès !");
      setOpen(false);
      form.reset(defaultValues);
      onSuccess?.();
    },
    onError: (error: Error) => {
      console.error("Erreur de mise à jour:", error);
      toast.error(
        error.message || "Une erreur est survenue lors de la modification.",
      );
    },
  });

  function onSubmit(values: FormValues) {
    if (!providerData?.id) {
      toast.error("Fournisseur non sélectionné");
      return;
    }

    // Préparer les données pour l'API
    const updateData: Partial<Provider> = {
      name: values.name,
      phone: values.phone,
      email: values.email,
      address: values.address,
      regem: values.regem,
    };

    // Ajouter les champs optionnels
    if (values.RCCM) updateData.RCCM = values.RCCM;
    if (values.NIU) updateData.NIU = values.NIU;

    // Gérer les dates - ne les inclure que si elles sont valides
    if (values.expireAtbanck_attestation) {
      const date = new Date(values.expireAtbanck_attestation);
      if (!isNaN(date.getTime())) updateData.expireAtbanck_attestation = date;
    }
    if (values.expireAtacf) {
      const date = new Date(values.expireAtacf);
      if (!isNaN(date.getTime())) updateData.expireAtacf = date;
    }
    if (values.expireAtcarte_contribuable) {
      const date = new Date(values.expireAtcarte_contribuable);
      if (!isNaN(date.getTime())) updateData.expireAtcarte_contribuable = date;
    }
    if (values.expireAtplan_localisation) {
      const date = new Date(values.expireAtplan_localisation);
      if (!isNaN(date.getTime())) updateData.expireAtplan_localisation = date;
    }
    if (values.expireAtcommerce_registre) {
      const date = new Date(values.expireAtcommerce_registre);
      if (!isNaN(date.getTime())) updateData.expireAtcommerce_registre = date;
    }

    // Gérer les fichiers
    if (values.carte_contribuable !== null && values.carte_contribuable !== undefined) {
      updateData.carte_contribuable = values.carte_contribuable;
    }
    if (values.acf !== null && values.acf !== undefined) {
      updateData.acf = values.acf;
    }
    if (values.plan_localisation !== null && values.plan_localisation !== undefined) {
      updateData.plan_localisation = values.plan_localisation;
    }
    if (values.commerce_registre !== null && values.commerce_registre !== undefined) {
      updateData.commerce_registre = values.commerce_registre;
    }
    if (values.banck_attestation !== null && values.banck_attestation !== undefined) {
      updateData.banck_attestation = values.banck_attestation;
    }

    providerMutation.mutate(updateData);
  }

  const handleFileChange = (
    field: any,
    value: FileValue | FileValue[] | null,
  ) => {
    if (Array.isArray(value)) {
      field.onChange(value[0] || null);
    } else {
      field.onChange(value);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader variant={"secondary"}>
          <DialogTitle>{`Fournisseur - ${providerData?.name || ""}`}</DialogTitle>
          <p className="text-sm text-white/80 mt-1">
            {"Modifiez les informations du fournisseur existant"}
          </p>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid gap-4 @min-[540px]/dialog:grid-cols-2"
            id="update-provider-form"
          >
            {/* Nom */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel isRequired>{"Nom de l'entreprise"}</FormLabel>
                  <FormControl>
                    <Input placeholder="Nom de l'entreprise" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{"Email"}</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Entrer l'email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Adresse */}
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{"Adresse (Localisation)"}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Entrer l'adresse de l'entreprise"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Téléphone */}
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{"Numéro de téléphone"}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Entrer le numéro de téléphone"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* RCCM */}
            <FormField
              control={form.control}
              name="RCCM"
              render={({ field }) => (
                <FormItem className="@min-[540px]/dialog:col-span-2">
                  <FormLabel>{"Registre du Commerce (RCCM)"}</FormLabel>
                  <FormControl>
                    <Input placeholder="RC/234/456/..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* NIU */}
            <FormField
              control={form.control}
              name="NIU"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{"NIU"}</FormLabel>
                  <FormControl>
                    <Input placeholder="QA123..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Régime */}
            <FormField
              control={form.control}
              name="regem"
              render={({ field }) => (
                <FormItem>
                  <FormLabel isRequired>{"Régime"}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Sélectionner un Régime" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Réel">{"Réel"}</SelectItem>
                      <SelectItem value="Simplifié">{"Impôt général synthétique"}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Carte Contribuable */}
            <FormField
              control={form.control}
              name="carte_contribuable"
              render={({ field }) => (
                <FormItem className="@min-[540px]/dialog:col-span-2">
                  <FormLabel>{"Carte de contribuable"}</FormLabel>
                  <FormControl>
                    <FilesUpload
                      value={field.value ? [field.value] : []}
                      onChange={(value) => handleFileChange(field, value)}
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

            <FormField
              control={form.control}
              name="expireAtcarte_contribuable"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{"Date d'Expiration Carte de contribuable"}</FormLabel>
                  <FormControl>
                    <div className="relative flex gap-2">
                      <Input
                        value={field.value || ""}
                        placeholder="Sélectionner une date"
                        className="bg-background pr-10"
                        onChange={(e) => field.onChange(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "ArrowDown") {
                            e.preventDefault();
                            setSelectCarteDate(true);
                          }
                        }}
                      />
                      <Popover open={selectCarteDate} onOpenChange={setSelectCarteDate}>
                        <PopoverTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
                          >
                            <CalendarIcon className="size-3.5" />
                            <span className="sr-only">{"Sélectionner une date"}</span>
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto overflow-hidden p-0" align="end">
                          <Calendar
                            mode="single"
                            selected={field.value ? new Date(field.value) : undefined}
                            captionLayout="dropdown"
                            onSelect={(date) => {
                              if (!date) return;
                              field.onChange(format(date, "yyyy-MM-dd"));
                              setSelectCarteDate(false);
                            }}
                            disabled={(date) => date < new Date()}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* ACF */}
            <FormField
              control={form.control}
              name="acf"
              render={({ field }) => (
                <FormItem className="@min-[540px]/dialog:col-span-2">
                  <FormLabel>{"Attestation de Conformité Fiscale"}</FormLabel>
                  <FormControl>
                    <FilesUpload
                      value={field.value ? [field.value] : []}
                      onChange={(value) => handleFileChange(field, value)}
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

            <FormField
              control={form.control}
              name="expireAtacf"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{"Date d'Expiration ACF"}</FormLabel>
                  <FormControl>
                    <div className="relative flex gap-2">
                      <Input
                        value={field.value || ""}
                        placeholder="Sélectionner une date"
                        className="bg-background pr-10"
                        onChange={(e) => field.onChange(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "ArrowDown") {
                            e.preventDefault();
                            setSelectACFDate(true);
                          }
                        }}
                      />
                      <Popover open={selectACFDate} onOpenChange={setSelectACFDate}>
                        <PopoverTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
                          >
                            <CalendarIcon className="size-3.5" />
                            <span className="sr-only">{"Sélectionner une date"}</span>
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto overflow-hidden p-0" align="end">
                          <Calendar
                            mode="single"
                            selected={field.value ? new Date(field.value) : undefined}
                            captionLayout="dropdown"
                            onSelect={(date) => {
                              if (!date) return;
                              field.onChange(format(date, "yyyy-MM-dd"));
                              setSelectACFDate(false);
                            }}
                            disabled={(date) => date < new Date()}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Plan de localisation */}
            <FormField
              control={form.control}
              name="plan_localisation"
              render={({ field }) => (
                <FormItem className="@min-[540px]/dialog:col-span-2">
                  <FormLabel>{"Plan de localisation"}</FormLabel>
                  <FormControl>
                    <FilesUpload
                      value={field.value ? [field.value] : []}
                      onChange={(value) => handleFileChange(field, value)}
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

            <FormField
              control={form.control}
              name="expireAtplan_localisation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{"Date d'Expiration Plan de localisation"}</FormLabel>
                  <FormControl>
                    <div className="relative flex gap-2">
                      <Input
                        value={field.value || ""}
                        placeholder="Sélectionner une date"
                        className="bg-background pr-10"
                        onChange={(e) => field.onChange(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "ArrowDown") {
                            e.preventDefault();
                            setSelectPlanDate(true);
                          }
                        }}
                      />
                      <Popover open={selectPlanDate} onOpenChange={setSelectPlanDate}>
                        <PopoverTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
                          >
                            <CalendarIcon className="size-3.5" />
                            <span className="sr-only">{"Sélectionner une date"}</span>
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto overflow-hidden p-0" align="end">
                          <Calendar
                            mode="single"
                            selected={field.value ? new Date(field.value) : undefined}
                            captionLayout="dropdown"
                            onSelect={(date) => {
                              if (!date) return;
                              field.onChange(format(date, "yyyy-MM-dd"));
                              setSelectPlanDate(false);
                            }}
                            disabled={(date) => date < new Date()}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Registre de commerce */}
            <FormField
              control={form.control}
              name="commerce_registre"
              render={({ field }) => (
                <FormItem className="@min-[540px]/dialog:col-span-2">
                  <FormLabel>{"Registre de commerce"}</FormLabel>
                  <FormControl>
                    <FilesUpload
                      value={field.value ? [field.value] : []}
                      onChange={(value) => handleFileChange(field, value)}
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

            <FormField
              control={form.control}
              name="expireAtcommerce_registre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{"Date d'Expiration Registre de commerce"}</FormLabel>
                  <FormControl>
                    <div className="relative flex gap-2">
                      <Input
                        value={field.value || ""}
                        placeholder="Sélectionner une date"
                        className="bg-background pr-10"
                        onChange={(e) => field.onChange(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "ArrowDown") {
                            e.preventDefault();
                            setSelectCommerceDate(true);
                          }
                        }}
                      />
                      <Popover open={selectCommerceDate} onOpenChange={setSelectCommerceDate}>
                        <PopoverTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
                          >
                            <CalendarIcon className="size-3.5" />
                            <span className="sr-only">{"Sélectionner une date"}</span>
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto overflow-hidden p-0" align="end">
                          <Calendar
                            mode="single"
                            selected={field.value ? new Date(field.value) : undefined}
                            captionLayout="dropdown"
                            onSelect={(date) => {
                              if (!date) return;
                              field.onChange(format(date, "yyyy-MM-dd"));
                              setSelectCommerceDate(false);
                            }}
                            disabled={(date) => date < new Date()}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Attestation bancaire */}
            <FormField
              control={form.control}
              name="banck_attestation"
              render={({ field }) => (
                <FormItem className="@min-[540px]/dialog:col-span-2">
                  <FormLabel>{"Attestation bancaire"}</FormLabel>
                  <FormControl>
                    <FilesUpload
                      value={field.value ? [field.value] : []}
                      onChange={(value) => handleFileChange(field, value)}
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

            <FormField
              control={form.control}
              name="expireAtbanck_attestation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{"Date d'Expiration de l'Attestation bancaire"}</FormLabel>
                  <FormControl>
                    <div className="relative flex gap-2">
                      <Input
                        value={field.value || ""}
                        placeholder="Sélectionner une date"
                        className="bg-background pr-10"
                        onChange={(e) => field.onChange(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "ArrowDown") {
                            e.preventDefault();
                            setSelectBankDate(true);
                          }
                        }}
                      />
                      <Popover open={selectBankDate} onOpenChange={setSelectBankDate}>
                        <PopoverTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
                          >
                            <CalendarIcon className="size-3.5" />
                            <span className="sr-only">{"Sélectionner une date"}</span>
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto overflow-hidden p-0" align="end">
                          <Calendar
                            mode="single"
                            selected={field.value ? new Date(field.value) : undefined}
                            captionLayout="dropdown"
                            onSelect={(date) => {
                              if (!date) return;
                              field.onChange(format(date, "yyyy-MM-dd"));
                              setSelectBankDate(false);
                            }}
                            disabled={(date) => date < new Date()}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>

          <div className="flex gap-3 p-6 pt-0 shrink-0 ml-auto">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={providerMutation.isPending}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              variant="primary"
              form="update-provider-form"
              disabled={providerMutation.isPending}
              isLoading={providerMutation.isPending}
            >
              {"Enregistrer"}
            </Button>
          </div>
        </Form>
      </DialogContent>
    </Dialog>
  );
}