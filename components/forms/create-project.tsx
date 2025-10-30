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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Form } from "../ui/form";
import { ProjectQueries } from "@/queries/projectModule";
import { useMutation } from "@tanstack/react-query";
import { ProjectCreateResponse, ProjectT, ResponseT } from "@/types/types";
import { toast } from "sonner";

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
  description: z.string({ message: "This field is required" }).optional(),
  chiefid: z.number().min(1, "Please select an item"),
  budget: z.coerce.number({ message: "Please enter a valid number" }),
  spendinginit: z.coerce.number({ message: "Please enter a valid number" }),
});

type Schema = z.infer<typeof formSchema>;

export function ProjectCreateForm() {
  const form = useForm<Schema>({
    resolver: zodResolver(formSchema as any),
    defaultValues: {
      chiefid: 1,
    },
  });

  const projectQueries = new ProjectQueries();

  const projectApi = useMutation({
    mutationFn: (data: ProjectT) =>
      projectQueries.create({ ...data, chiefId: Number(data.chiefId) }),
    onSuccess: (data: ResponseT<ProjectCreateResponse>) => {
      toast.success("Inscription réussie !");
      console.log("Register successful:", data);
    },
    onError: (error: any) => {
      console.error("Register error:", error);
    },
  });

  const onsubmit = (values: z.infer<typeof formSchema>) => {
    console.log(values);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onsubmit)}
        className="space-y-8 max-w-3xl py-10"
      >
        <FieldGroup>
          <Controller
            name="label"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className="gap-1">
                <FieldLabel htmlFor="label">Project Title *</FieldLabel>
                <Input
                  {...field}
                  id="label"
                  type="text"
                  onChange={(e) => {
                    field.onChange(e.target.value);
                  }}
                  aria-invalid={fieldState.invalid}
                  placeholder=".ex Madiba AutoRoute"
                />

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="description"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className="gap-1">
                <FieldLabel htmlFor="description">Description </FieldLabel>
                <Input
                  {...field}
                  id="description"
                  type="text"
                  onChange={(e) => {
                    field.onChange(e.target.value);
                  }}
                  aria-invalid={fieldState.invalid}
                  placeholder="project description"
                />

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="chiefid"
            control={form.control}
            render={({ field, fieldState }) => {
              const options = [
                { value: 1, label: "Option 1" },
                { value: 2, label: "Option 2" },
                { value: 3, label: "Option 3" },
                { value: 4, label: "Option 4" },
              ];
              return (
                <Field data-invalid={fieldState.invalid} className="gap-1">
                  <FieldLabel htmlFor="chiefid">Chief *</FieldLabel>

                  <Select
                    value={field.value.toString()}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select project chief" />
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
            name="budget"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className="gap-1">
                <FieldLabel htmlFor="budget">Budget *</FieldLabel>
                <Input
                  {...field}
                  id="budget"
                  type="number"
                  onChange={(e) => {
                    field.onChange(e.target.valueAsNumber);
                  }}
                  aria-invalid={fieldState.invalid}
                  placeholder="12000"
                />

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="spendinginit"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className="gap-1">
                <FieldLabel htmlFor="spendinginit">
                  Initial Spending *
                </FieldLabel>
                <Input
                  {...field}
                  id="spendinginit"
                  type="number"
                  onChange={(e) => {
                    field.onChange(e.target.valueAsNumber);
                  }}
                  aria-invalid={fieldState.invalid}
                  placeholder="20000"
                />

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <div className="flex justify-end items-center w-full pt-3">
            <Button className="rounded-lg" size="sm">
              Submit
            </Button>
          </div>
        </FieldGroup>
      </form>
    </Form>
  );
}
