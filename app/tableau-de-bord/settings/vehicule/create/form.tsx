"use client";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { motion } from "motion/react";
import { Check } from "lucide-react";
import {
  Field,
  FieldGroup,
  FieldContent,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldSeparator,
} from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation, useQuery } from "@tanstack/react-query";
import { VehicleQueries } from "@/queries/vehicule";
import { Vehicle } from "@/types/types";

export interface ActionResponse<T = any> {
  success: boolean;
  message: string;
  errors?: {
    [K in keyof T]?: string[];
  };
  inputs?: T;
}
export const formSchema = z.object({
  label: z.string({ message: "This field is required" }),
  mark: z.string({ message: "This field is required" }),
  matricule: z.string({ message: "This field is required" }),
});

type Schema = z.infer<typeof formSchema>;

export function VehicleForm() {
  const form = useForm<Schema>({
    resolver: zodResolver(formSchema as any),
  });

  const vehiculeQuery = new VehicleQueries();

  const vehiculeData = useMutation({
    mutationKey: ["vehicle"],
    mutationFn: (data: Omit<Vehicle, "id" | "createdAt" | "updatedAt">) =>
      vehiculeQuery.create(data),
    onSuccess: () => {
      form.reset({
        label: "",
        mark: "",
        matricule: "",
      });
    },
  });

  const handleSubmit = form.handleSubmit(async (data: Schema) => {
    vehiculeData.mutate({
      label: data.label,
      mark: data.mark,
      matricule: data.matricule,
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
              <FieldLabel htmlFor="label">Model du vehicule *</FieldLabel>
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
              <FieldLabel htmlFor="mark">Marque *</FieldLabel>
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
      </FieldGroup>
      <div className="flex justify-end items-center w-full">
        <Button>{vehiculeData.isPending ? "Submitting..." : "Submit"}</Button>
      </div>
    </form>
  );
}
