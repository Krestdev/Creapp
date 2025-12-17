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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { useMutation, useQueries, useQuery } from "@tanstack/react-query";
import { Category, ResponseT } from "@/types/types";
import { toast } from "sonner";
import { UserQueries } from "@/queries/baseModule";
import { useStore } from "@/providers/datastore";
import { RequestQueries } from "@/queries/requestModule";
import { Checkbox } from "../ui/checkbox";
import { Switch } from "../ui/switch";

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
      parentId: "",
    },
  });

  const categoryQueries = new RequestQueries();
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
      toast.error("Une erreur est survenue lors de la creation de la categorie.");
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
      parentId: parentId
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
        className="grid grid-cols-1 gap-4 @min-[540px]:grid-cols-2 max-w-3xl"
      >
        <FormField control={form.control} name="label" render={({field})=>(
          <FormItem>
            <FormLabel>{"Titre de la catégorie"}</FormLabel>
            <FormControl>
              <Input placeholder="e.g. Madiba AutoRoute" {...field} />
            </FormControl>
            <FormMessage/>
          </FormItem>
        )} />
        <FormField control={form.control} name="parentId" render={({field})=>{
          const options = categoryData.data
                ? categoryData.data.data.map((category) => ({
                    value: category.id,
                    label: category.label,
                  }))
                : [];
          return(
          <FormItem>
            <FormLabel>{"Catégorie Principale"}</FormLabel>
            <FormControl>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Sélectionner une catégorie"/></SelectTrigger>
                <SelectContent>
                  {options.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value.toString()}
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                  {options.length === 0 && <SelectItem value={"-1"} disabled>{"Aucune catégorie disponible"}</SelectItem>}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage/>
          </FormItem>
        )}} />
        <FormField control={form.control} name="isSpecial" render={({field})=>(
          <FormItem>
                <FormLabel>{"Catégorie Spéciale"}</FormLabel>
            <FormControl>
              <div className="flex gap-2 items-center">
                <Switch checked={field.value} onCheckedChange={field.onChange} />
                <span>{field.value ? "Oui" : "Non"}</span>
              </div>
            </FormControl>
            <FormMessage/>
          </FormItem>
        )} />
        <div className="@min-[540px]:col-span-2">
            <Button variant={"primary"}>
              {"Enregistrer"}
            </Button>
          </div>
      </form>
    </Form>
  );
}
