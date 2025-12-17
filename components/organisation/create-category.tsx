"use client";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStore } from "@/providers/datastore";
import { CategoryQueries } from "@/queries/categoryModule";
import { RequestQueries } from "@/queries/requestModule";
import { Category, ResponseT } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { Checkbox } from "../ui/checkbox";
import { Form } from "../ui/form";

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
  isSpecial: z.boolean({ message: "This field is required" }).optional(),
  parentId: z.string(),
});

type Schema = z.infer<typeof formSchema>;

export function CategoryCreateForm() {
  const form = useForm<Schema>({
    resolver: zodResolver(formSchema as any),
    defaultValues: {
      isSpecial: false,
      parentId: "-1",
    },
  });

  const categoryQueries = new CategoryQueries();
  const { isHydrated } = useStore();

  const categoryApi = useMutation({
    mutationKey: ["createCategory"],
    mutationFn: (
      data: Omit<Category, "updatedAt" | "createdAt" | "id"> & {
        parentId?: number;
      }
    ) => categoryQueries.createCategory(data),
    onSuccess: (data: ResponseT<Category>) => {
      toast.success("Inscription réussie !");
      console.log("created successful:", data);
      form.reset();
    },
    onError: (error: any) => {
      toast.error(
        "Une erreur est survenue lors de la creation de la categorie."
      );
      console.error("Register error:", error);
    },
  });

  const category = new RequestQueries();
  const categoryData = useQuery({
    queryKey: ["categoryList"],
    queryFn: () => category.getCategories(),
    enabled: isHydrated,
  });

  const onsubmit = (values: z.infer<typeof formSchema>) => {
    let parentId = parseInt(values.parentId, 10);
    parentId = isNaN(parentId) ? -1 : parentId;
    const data: Omit<Category, "updatedAt" | "createdAt" | "id"> & {
      parentId?: number;
    } = {
      label: values.label,
      isSpecial: values.isSpecial || false,
      parentId: parentId,
    };
    if (parentId !== -1) {
      data.parentId = parentId;
    }
    categoryApi.mutate(data);
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
                <FieldLabel htmlFor="label">Category Title *</FieldLabel>
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
            name="isSpecial"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className="gap-1">
                <FieldLabel htmlFor="isSpecial">Description</FieldLabel>

                <Checkbox
                  id="isSpecial"
                  checked={field.value}
                  onCheckedChange={(checked) => {
                    field.onChange(checked);
                  }}
                  aria-invalid={fieldState.invalid}
                />

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="parentId"
            control={form.control}
            render={({ field, fieldState }) => {
              const options = categoryData.data
                ? categoryData.data.data.map((category) => ({
                    value: category.id,
                    label: category.label,
                  }))
                : [];
              return (
                <Field data-invalid={fieldState.invalid} className="gap-1">
                  <FieldLabel htmlFor="parentId">Parent</FieldLabel>

                  <Select
                    value={field.value.toString()}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select category chief" />
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
