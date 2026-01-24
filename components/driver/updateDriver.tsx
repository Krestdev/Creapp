"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
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
import { driverQ } from "@/queries/driver";
import { Driver } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
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
  driverData: Driver;
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
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader variant={"secondary"}>
          <DialogTitle>
            {`Chauffeur - ${driverData?.firstName} ${driverData?.lastName}`}
          </DialogTitle>
          <DialogDescription>
            {"Modifiez les informations du chauffeur existant"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="max-w-3xl w-full grid grid-cols-1 gap-3 @min-[540px]/dialog:grid-cols-2"
            id="update-driver-form"
          >
            {/* Nom */}
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{"Noms"}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex. Atangana"
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
                  <FormLabel>{"Prénoms"}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex. Joël Stéphane"
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
                <FormItem className="@min-[540px]/dialog:col-span-2">
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
                <FormItem className="@min-[540px]/dialog:col-span-2">
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

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={driverMutation.isPending}
            >
              {"Annuler"}
            </Button>
            <Button
              type="submit"
              variant="primary"
              form="update-driver-form"
              disabled={driverMutation.isPending || !form.formState.isDirty}
              isLoading={driverMutation.isPending}
            >
              {"Enregistrer"}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
