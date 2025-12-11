"use client";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
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
import { DepartmentQueries } from "@/queries/departmentModule";
import { useMutation, useQueries, useQuery } from "@tanstack/react-query";
import { DepartmentT, ResponseT } from "@/types/types";
import { toast } from "sonner";
import { UserQueries } from "@/queries/baseModule";
import { useStore } from "@/providers/datastore";

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
});

type Schema = z.infer<typeof formSchema>;

export function DepartmentCreateForm() {
  const form = useForm<Schema>({
    resolver: zodResolver(formSchema as any),
    defaultValues: {
      chiefid: "0",
    },
  });

  const departmentQueries = new DepartmentQueries();
  const userQueries = new UserQueries();
  const { isHydrated } = useStore();

  const departmentApi = useMutation({
    mutationFn: (
      data: Omit<
        DepartmentT,
        | "updatedAt"
        | "createdAt"
        | "id"
        | "chief"
        | "status"
        | "reference"
        | "members"
      > & { chiefId: number }
    ) => departmentQueries.create(data),
    onSuccess: (data: ResponseT<DepartmentT>) => {
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
      DepartmentT,
      | "reference"
      | "updatedAt"
      | "createdAt"
      | "id"
      | "chief"
      | "status"
      | "members"
    > & { chiefId: number } = {
      label: values.label,
      description: values.description || "",
      chiefId: parseInt(values.chiefid, 10),
    };
    departmentApi.mutate(data);
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
                <FieldLabel htmlFor="label">Department Title *</FieldLabel>
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
                  placeholder="department description"
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
                      <SelectValue placeholder="Select department chief" />
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
