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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { toast } from "sonner";
import FilesUpload from "../comp-547";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

// Définir un type pour les fichiers
type FileValue = File | string;

const FileSchema = z.union([z.instanceof(File), z.string()]).nullable();

const formSchema = z.object({
  name: z.string().min(1, "Le nom est obligatoire"),
  phone: z.string().min(1, "Le téléphone est obligatoire"),
  email: z.string().email("Email invalide"),
  address: z.string().min(1, "L'adresse est obligatoire"),

  // ✅ TOUJOURS string
  RCCM: z.string(),
  NIU: z.string(),

  regem: z.string().min(1, "Le régime est obligatoire"),

  // ✅ fichiers
  carte_contribuable: FileSchema,
  acf: FileSchema,
  plan_localisation: FileSchema,
  commerce_registre: FileSchema,
  banck_attestation: FileSchema,
});

// Type pour le formulaire
type FormValues = z.infer<typeof formSchema>;

interface UpdateRequestProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  providerData: Provider;
  onSuccess?: () => void;
}

export default function UpdateProvider({
  open,
  setOpen,
  providerData,
  onSuccess,
}: UpdateRequestProps) {
  // Valeurs par défaut avec le bon type
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
      plan_localisation: null,
      commerce_registre: null,
      banck_attestation: null,
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
        plan_localisation: providerData.plan_localisation ?? null,
        commerce_registre: providerData.commerce_registre ?? null,
        banck_attestation: providerData.banck_attestation ?? null,
      });
    } else if (!open) {
      form.reset(defaultValues);
    }
  }, [open, providerData, form, defaultValues]);

  const queryClient = useQueryClient();

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
      // queryClient.invalidateQueries({
      //   queryKey: ["providersList"],
      //   refetchType: "active",
      // });
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

    // Ajouter les champs optionnels s'ils ont une valeur
    if (values.RCCM) updateData.RCCM = values.RCCM;
    if (values.NIU) updateData.NIU = values.NIU;

    // Gérer les fichiers - adapter selon votre API
    if (values.carte_contribuable !== null) {
      updateData.carte_contribuable = values.carte_contribuable;
    }
    if (values.acf !== null) {
      updateData.acf = values.acf;
    }
    if (values.plan_localisation !== null) {
      updateData.plan_localisation = values.plan_localisation;
    }
    if (values.commerce_registre !== null) {
      updateData.commerce_registre = values.commerce_registre;
    }
    if (values.banck_attestation !== null) {
      updateData.banck_attestation = values.banck_attestation;
    }

    providerMutation.mutate(updateData);
  }

  // Fonction pour gérer les changements de fichiers
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
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader variant={"secondary"}>
          <DialogTitle>
            {`Fournisseur - ${providerData.name}`}
          </DialogTitle>
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
                    <Input
                      placeholder="Nom de l'entreprise"
                      {...field}
                    />
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
                  <FormLabel>{"Adresse(Localisation)"}</FormLabel>
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
                <FormItem>
                  <FormLabel>{"Régistre du Commerce(RCCM)"}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="RC/234/456/..."
                      {...field}
                    />
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
                    <Input
                      placeholder="QA123..."
                      {...field}
                    />
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
                <FormItem className="@min-[640px]:col-span-2">
                  <FormLabel>
                    {"Régime"}
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Sélectionner un Régime" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Réel">{"Réel"}</SelectItem>
                      <SelectItem value="Simplifié">{"Simplifié"}</SelectItem>
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
                <FormItem>
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

            {/* ACF */}
            <FormField
              control={form.control}
              name="acf"
              render={({ field }) => (
                <FormItem>
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

            {/* Plan de localisation */}
            <FormField
              control={form.control}
              name="plan_localisation"
              render={({ field }) => (
                <FormItem>
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

            {/* Registre de commerce */}
            <FormField
              control={form.control}
              name="commerce_registre"
              render={({ field }) => (
                <FormItem>
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

            {/* Attestation bancaire */}
            <FormField
              control={form.control}
              name="banck_attestation"
              render={({ field }) => (
                <FormItem>
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
              disabled={providerMutation.isPending || !form.formState.isDirty}
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
