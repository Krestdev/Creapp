"use client";
import FilesUpload from "@/components/comp-547";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { vehicleQ } from "@/queries/vehicule";
import { Vehicle } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";

export interface ActionResponse<T = any> {
  success: boolean;
  message: string;
  errors?: {
    [K in keyof T]?: string[];
  };
  inputs?: T;
}
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

type Schema = z.infer<typeof formSchema>;

export function VehicleForm() {
  const form = useForm<Schema>({
    resolver: zodResolver(formSchema as any),
    defaultValues: {
      label: "",
      mark: "",
      matricule: "",
      image: [],
    },
  });

  const vehiculeData = useMutation({
    mutationKey: ["vehicle"],
    mutationFn: (data: Omit<Vehicle, "id" | "createdAt" | "updatedAt">) =>
      vehicleQ.create(data),
    onSuccess: () => {
      form.reset({
        label: "",
        mark: "",
        matricule: "",
        image: undefined,
      });
    },
  });

  const handleSubmit = form.handleSubmit(async (data: Schema) => {
    vehiculeData.mutate({
      label: data.label,
      mark: data.mark,
      matricule: data.matricule!,
      proof: data.image[0],
    });
  });

  return (
    <form
      onSubmit={handleSubmit}
      className="p-2 sm:p-5 md:p-8 rounded-md max-w-3xl gap-2"
    >
      <FieldGroup className="grid md:grid-cols-6 gap-4 mb-6">
        <Controller
          name="label"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field
              data-invalid={fieldState.invalid}
              className="gap-1 col-span-full"
            >
              <FieldLabel htmlFor="label">Modèle du véhicule <span className="text-destructive">*</span></FieldLabel>
              <Input
                {...field}
                id="label"
                type="text"
                onChange={(e) => {
                  field.onChange(e.target.value);
                }}
                aria-invalid={fieldState.invalid}
                placeholder="model"
              />

              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="mark"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field
              data-invalid={fieldState.invalid}
              className="gap-1 col-span-full"
            >
              <FieldLabel htmlFor="mark">Marque <span className="text-destructive">*</span></FieldLabel>
              <Input
                {...field}
                id="mark"
                type="text"
                onChange={(e) => {
                  field.onChange(e.target.value);
                }}
                aria-invalid={fieldState.invalid}
                placeholder="toyota"
              />

              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="matricule"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field
              data-invalid={fieldState.invalid}
              className="gap-1 col-span-full"
            >
              <FieldLabel htmlFor="color">Matricule </FieldLabel>
              <Input
                {...field}
                id="color"
                type="text"
                onChange={(e) => {
                  field.onChange(e.target.value);
                }}
                aria-invalid={fieldState.invalid}
                placeholder="Matricule"
              />

              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="image"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field
              data-invalid={fieldState.invalid}
              className="gap-1 col-span-full"
            >
              <FieldLabel htmlFor="color">Image <span className="text-destructive">*</span></FieldLabel>
              <FilesUpload
                value={field.value}
                onChange={field.onChange}
                name={field.name}
                acceptTypes="all"
                multiple={false}
                maxFiles={1}
              />

              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

      </FieldGroup>
      <div className="flex justify-end items-center w-full">
        <Button variant={"primary"}>{vehiculeData.isPending ? "Ajout en cours..." : "Ajouter"}</Button>
      </div>
    </form>
  );
}
