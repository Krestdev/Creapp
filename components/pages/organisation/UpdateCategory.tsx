"use client";

import MultiSelectUsers from "@/components/base/multiSelectUsers";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { useStore } from "@/providers/datastore";
import { UserQueries } from "@/queries/baseModule";
import { ProjectQueries } from "@/queries/projectModule";
import { RequestQueries } from "@/queries/requestModule";

import { Category, RequestModelT } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ChevronDownIcon, LoaderIcon } from "lucide-react";
import { use, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { format } from "date-fns";
import { ca, fr } from "date-fns/locale";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";

// ----------------------------------------------------------------------
// VALIDATION
// ----------------------------------------------------------------------
const formSchema = z.object({
  label: z.string(),
  parentId: z.string(),
  isSpecial: z.boolean(),
});

interface UpdateRequestProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  categoryData: Category | null;
  onSuccess?: () => void;
}

export default function UpdateCategory({
  open,
  setOpen,
  categoryData,
  onSuccess,
}: UpdateRequestProps) {
  // ----------------------------------------------------------------------
  // FORM INITIALISATION
  // ----------------------------------------------------------------------
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      label: "",
      isSpecial: false,
      parentId: "-1",
    },
  });

  useEffect(() => {
    form.reset({
      label: categoryData?.label || "",
      isSpecial: categoryData?.isSpecial || false,
      parentId: categoryData?.parentId ? String(categoryData.parentId) : "-1",
    });
  }, [categoryData, form]);

  // ----------------------------------------------------------------------
  // REQUEST MUTATION
  // ----------------------------------------------------------------------
  const categoryQuery = new RequestQueries();
  const categoryMutation = useMutation({
    mutationKey: ["requests", "update"],
    mutationFn: async (data: Partial<Category>) => {
      return categoryQuery.updateCategory(Number(categoryData?.id), data);
    },

    onSuccess: () => {
      toast.success("Category modifié avec succès !");
      setOpen(false);
      onSuccess?.();
    },

    onError: () =>
      toast.error("Une erreur est survenue lors de la modification."),
  });

  const { isHydrated } = useStore();

  const category = new RequestQueries();
  const categoriesData = useQuery({
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
    };
    if (parentId !== -1) {
      data.parentId = parentId;
    }
    categoryMutation.mutate(data);
  };

  // ----------------------------------------------------------------------
  // RENDER
  // ----------------------------------------------------------------------
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[760px] w-full max-h-[80vh] p-0 gap-0 flex flex-col">
        {/* Header avec fond bordeaux - FIXE */}
        <DialogHeader className="bg-[#8B1538] text-white p-6 m-4 rounded-lg pb-8 shrink-0">
          <DialogTitle className="text-xl font-semibold text-white">
            Modifier le besoin
          </DialogTitle>
          <p className="text-sm text-white/80 mt-1">
            Modifiez les informations du besoin existant
          </p>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onsubmit)}
            className="space-y-8 max-w-3xl px-6 py-10 w-full"
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
                  <Field
                    data-invalid={fieldState.invalid}
                    className="gap-4 flex-row items-center"
                  >
                    <FieldLabel htmlFor="isSpecial" className="w-fit!">
                      Special
                    </FieldLabel>

                    <Checkbox
                      className="w-6!"
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
                  const options = categoriesData.data
                    ? categoriesData.data.data.map((category) => ({
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
                              value={
                                option.value ? option.value.toString() : ""
                              }
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
                  Modifier
                </Button>
              </div>
            </FieldGroup>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
