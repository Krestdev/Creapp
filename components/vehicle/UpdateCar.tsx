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
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerDescription,
  DrawerEyebrow,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
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
    ]),
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
        image: vehicleData.picture ? [vehicleData.picture] : [],
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
      queryClient.invalidateQueries();
      toast.success("Véhicule modifié avec succès !");
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
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerEyebrow>{"Véhicules"}</DrawerEyebrow>
          <DrawerTitle>
            {`Véhicule - ${vehicleData?.label} ${vehicleData?.mark}`}
          </DrawerTitle>
          <DrawerDescription>
            {"Modifier le vehicule en indiquant les nouvelles informations."}
          </DrawerDescription>
        </DrawerHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex min-h-0 flex-1 flex-col"
          >
            <DrawerBody className="flex flex-col gap-6">
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

            </DrawerBody>
            <DrawerFooter pinned>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                {"Annuler"}
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
            </DrawerFooter>
          </form>
        </Form>
      </DrawerContent>
    </Drawer>
  );
}
