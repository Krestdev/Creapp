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
import { driverQ } from "@/queries/driver";
import { Driver } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import FilesUpload from "../comp-547";

type FileValue = File | string;

const FileSchema = z.union([z.instanceof(File), z.string()]).nullable();

const formSchema = z.object({
  firstName: z.string().min(1, "Le nom est obligatoire"),
  lastName: z.string().min(1, "Le nom est obligatoire"),
  idCard: FileSchema,
  licence: FileSchema,
});

// Type pour le formulaire
type FormValues = z.infer<typeof formSchema>;

interface UpdateRequestProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  driverData: Driver | null;
  onSuccess?: () => void;
}

export default function UpdateDriver({
  open,
  setOpen,
  driverData,
  onSuccess,
}: UpdateRequestProps) {
  // Valeurs par défaut avec le bon type
  const defaultValues: FormValues = useMemo(
    () => ({
      firstName: "",
      lastName: "",
      idCard: "",
      licence: "",
    }),
    [],
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onChange",
  });

  // Réinitialiser le formulaire quand driverData change
  useEffect(() => {
    if (open && driverData) {
      form.reset({
        firstName: driverData.firstName ?? "",
        lastName: driverData.lastName ?? "",
        idCard: driverData.idCard ?? null,
        licence: driverData.licence ?? null,
      });
    } else if (!open) {
      form.reset(defaultValues);
    }
  }, [open, driverData, form, defaultValues]);

  const driverMutation = useMutation({
    mutationFn: async (data: Partial<Driver>) => {
      if (!driverData?.id) {
        throw new Error("ID du chauffeur manquant");
      }
      return driverQ.update(driverData.id, data);
    },
    onSuccess: () => {
      toast.success("chauffeur modifié avec succès !");
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
    if (!driverData?.id) {
      toast.error("chauffeur non sélectionné");
      return;
    }

    // Préparer les données pour l'API
    const updateData: Partial<Driver> = {
      firstName: values.firstName,
      lastName: values.lastName,
    };

    // Ajouter les champs optionnels s'ils ont une valeur
    if (values.idCard) updateData.idCard = values.idCard;
    if (values.licence) updateData.licence = values.licence;

    driverMutation.mutate(updateData);
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
      <DialogContent className="sm:max-w-[760px] w-full max-h-[90vh] p-0 gap-0 flex flex-col">
        <DialogHeader className="bg-[#8B1538] text-white p-6 m-4 rounded-lg pb-8 shrink-0">
          <DialogTitle className="text-xl font-semibold text-white uppercase">
            {`Chauffeur - ${driverData?.firstName} ${driverData?.lastName}`}
          </DialogTitle>
          <p className="text-sm text-white/80 mt-1">
            {"Modifiez les informations du chauffeur existant"}
          </p>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="max-w-3xl grid grid-cols-1 gap-4 @min-[640px]:grid-cols-2 mx-4 flex-1 overflow-y-auto pb-6"
            id="update-driver-form"
          >
            {/* Nom */}
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{"Nom"}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nom "
                      {...field}
                      disabled={driverMutation.isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Nom */}
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{"Prénom"}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="prenom"
                      {...field}
                      disabled={driverMutation.isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* ACF */}
            <FormField
              control={form.control}
              name="licence"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>{"Permis de conduire"}</FormLabel>
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
              name="idCard"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>{"Carte nationale d'identité"}</FormLabel>
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
              disabled={driverMutation.isPending}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              variant="primary"
              form="update-driver-form"
              disabled={driverMutation.isPending || !form.formState.isDirty}
            >
              {driverMutation.isPending ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </div>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
