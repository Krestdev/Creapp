"use client";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStore } from "@/providers/datastore";
import { UserQueries } from "@/queries/baseModule";
import { ProjectQueries } from "@/queries/projectModule";
import { ProjectCreateResponse, ProjectT, ResponseT } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
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
  label: z.string({ message: "This field is required" }),
  description: z.string({ message: "This field is required" }).optional(),
  chiefid: z.string().min(1, "Please select an item"),
  budget: z.coerce.number({ message: "Please enter a valid number" }),
  spendinginit: z.coerce.number({ message: "Please enter a valid number" }),
});

type Schema = z.infer<typeof formSchema>;

export function ProjectCreateForm() {
  const form = useForm<Schema>({
    resolver: zodResolver(formSchema as any),
    defaultValues: {
      chiefid: "0",
    },
  });

  const projectQueries = new ProjectQueries();
  const userQueries = new UserQueries();
  const { isHydrated } = useStore();

  const projectApi = useMutation({
    mutationFn: (
      data: Omit<
        ProjectT,
        "reference" | "updatedAt" | "createdAt" | "id" | "chief"
      > & { chiefId: number }
    ) => projectQueries.create(data),
    onSuccess: (data: ResponseT<ProjectCreateResponse>) => {
      toast.success("Inscription réussie !");
      console.log("created successful:", data);
      form.reset();
    },
    onError: (error: any) => {
      console.error("Register error:", error);
    },
  });

  const userApi = useQuery({
    queryKey: ["usersList"],
    queryFn: () => userQueries.getAll(),
    enabled: isHydrated,
  });

  const onsubmit = (values: z.infer<typeof formSchema>) => {
    const data: Omit<
      ProjectT,
      "reference" | "updatedAt" | "createdAt" | "id" | "chief"
    > & { chiefId: number } = {
      label: values.label,
      description: values.description || "",
      budget: values.budget,
      chiefId: parseInt(values.chiefid, 10),
      status: "planning",
    };
    projectApi.mutate(data);
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
              const options = userApi.data
                ? userApi.data.data.map((user) => ({
                    value: user.id,
                    label: user.name,
                  }))
                : [];
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
                          value={option.value ? option.value.toString() : ""}
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
