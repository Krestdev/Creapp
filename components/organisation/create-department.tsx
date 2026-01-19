"use client";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useStore } from "@/providers/datastore";
import { userQ } from "@/queries/baseModule";
import { departmentQ } from "@/queries/departmentModule";
import { DepartmentT, ResponseT } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { SearchableSelect } from "../base/searchableSelect";
import { Form } from "../ui/form";
import { Textarea } from "../ui/textarea";

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
      > & { chiefId: number },
    ) => departmentQ.create(data),
    onSuccess: (data: ResponseT<DepartmentT>) => {
      toast.success("Département créé avec succès !");
      console.log("created successful:", data);
      form.reset();
    },
    onError: (error: any) => {
      toast.error(
        "Une erreur est survenue lors de la creation du departement.",
      );
      console.error("Register error:", error);
    },
  });

  const userApi = useQuery({
    queryKey: ["users"],
    queryFn: () => userQ.getAll(),
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
                <FieldLabel htmlFor="label">
                  {"Nom du département"} <span className="text-red-400">*</span>
                </FieldLabel>
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
                <FieldLabel htmlFor="description">{"Description"} </FieldLabel>
                <Textarea
                  {...field}
                  rows={3}
                  id="description"
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
                    label: user.lastName + " " + user.firstName,
                  }))
                : [];
              return (
                <Field data-invalid={fieldState.invalid} className="gap-1">
                  <FieldLabel htmlFor="chiefid">
                    {"Chef du département"}{" "}
                    <span className="text-red-400">*</span>
                  </FieldLabel>

                  {/* <Select
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
                  </Select> */}
                  <SearchableSelect
                    width="w-full"
                    allLabel=""
                    options={
                      userApi.data?.data.map((user) => ({
                        value: String(user.id),
                        label: user.lastName + " " + user.firstName,
                      })) || []
                    }
                    {...field}
                    placeholder="Sélectionner"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              );
            }}
          />

          <div className="flex justify-end items-center w-full pt-3">
            <Button className="rounded-lg" size="sm">
              {"Enrégistrer"}
            </Button>
          </div>
        </FieldGroup>
      </form>
    </Form>
  );
}
