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
import { vehicleQ } from "@/queries/vehicule";
import { Vehicle } from "@/types/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "sonner";
import FilesUpload from "../comp-547";

/* =========================
   SCHEMA ZOD
========================= */

export const formSchema = z.object({
  label: z.string({ message: "Ce champs est obligatoire" }),
  mark: z.string({ message: "Ce champs est obligatoire" }),
  matricule: z.string().optional(),
  image: z.array(
    z.union([
      z.instanceof(File, { message: "Doit être un fichier valide" }),
      z.string(),
    ])
  ),
});

interface UpdateRequestProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  vehicleData: Vehicle | null;
  onSuccess?: () => void;
}

export default function UpdateVehicle({
  open,
  setOpen,
  vehicleData,
  onSuccess,
}: UpdateRequestProps) {
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      label: "",
      mark: "",
      matricule: "",
      image: undefined,
    },
  });

  /* =========================
     INIT FORM
  ========================= */
  useEffect(() => {
    if (vehicleData && open) {
      form.reset({
        label: vehicleData.label,
        mark: vehicleData.mark,
        matricule: vehicleData.matricule,
        image: vehicleData.picture
          ? [vehicleData.picture]
          : [],
      });
    }
  }, [vehicleData, open, form]);

  /* =========================
     MUTATION
  ========================= */

  const vehicleMutation = useMutation({
    mutationFn: (data: { id: number; vehicle: Partial<Vehicle> }) =>
      vehicleQ.update(data.id, data.vehicle),

    onSuccess: () => {
      toast.success("Utilisateur modifié avec succès !");
      queryClient.invalidateQueries({
        queryKey: ["usersList"],
        refetchType: "active",
      });
      setOpen(false);
      onSuccess?.();
    },

    onError: () => {
      toast.error("Erreur lors de la modification");
    },
  });

  /* =========================
     SUBMIT
  ========================= */
  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!vehicleData?.id) return;

    const payload: Partial<Vehicle> = {
      label: values.label,
      mark: values.mark,
      matricule: values.matricule,
      proof: values.image[0],
    };

    vehicleMutation.mutate({ id: vehicleData.id, vehicle: payload });
  }

  /* =========================
     RENDER
  ========================= */
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[540px] p-0 flex flex-col">
        <DialogHeader className="bg-[#8B1538] text-white p-6 m-4 rounded-lg">
          <DialogTitle className="text-xl font-semibold uppercase">
            {`Véhicule - ${vehicleData?.label} ${vehicleData?.mark}`}
          </DialogTitle>
          <p className="text-sm text-white/80 mt-1">
            {"Modifier le vehicule en indiquant les nouvelles informations."}
          </p>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="w-full px-6 flex flex-col gap-6">
            <FormField
              control={form.control}
              name="label"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Nom" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="mark"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Marque </FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Prénom" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="matricule"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Matricule </FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Contact" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image </FormLabel>
                  <FormControl>
                    <FilesUpload
                      value={field.value}
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

            <div className="flex justify-end gap-3 p-6 pt-0">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Annuler
              </Button>
              <Button
                variant={"primary"}
                onClick={form.handleSubmit(onSubmit)}
                type="submit"
                disabled={vehicleMutation.isPending}
              >
                {vehicleMutation.isPending
                  ? "Enregistrement..."
                  : "Enregistrer"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
