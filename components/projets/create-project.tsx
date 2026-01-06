"use client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useStore } from "@/providers/datastore";
import { UserQueries } from "@/queries/baseModule";
import { ProjectQueries } from "@/queries/projectModule";
import { ProjectCreateResponse, ProjectT, ResponseT } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { SearchableSelect } from "../base/searchableSelect";
import { Textarea } from "../ui/textarea";
import { Loader2 } from "lucide-react";

export interface ActionResponse<T = any> {
  success: boolean;
  message: string;
  errors?: {
    [K in keyof T]?: string[];
  };
  inputs?: T;
}
export const formSchema = z.object({
  label: z
    .string({ message: "Ce champ est requis" })
    .min(2, "Le libellé doit contenir au moins 2 caractères"),

  description: z.string().min(1, { message: "Ce champ est requis" }).optional(),

  chiefid: z
    .string({ message: "Veuillez définir un chef de projet" })
    .min(1, "Veuillez sélectionner un chef de projet"),

  budget: z.coerce
    .number({
      invalid_type_error: "Veuillez entrer un nombre valide",
      required_error: "Veuillez entrer un nombre",
    })
    .positive("Le budget doit être un nombre positif")
    .transform((val) => (val === null || isNaN(val) ? null : val))
    .optional()
    .nullable(),
});

type Schema = z.infer<typeof formSchema>;

export function ProjectCreateForm() {
  const form = useForm<Schema>({
    resolver: zodResolver(formSchema as any),
    defaultValues: {
      chiefid: "",
      label: "",
      description: "",
    },
  });

  const projectQueries = new ProjectQueries();
  const userQueries = new UserQueries();
  const { isHydrated, user } = useStore();

  const projectApi = useMutation({
    mutationFn: (
      data: Omit<
        ProjectT,
        "reference" | "updatedAt" | "createdAt" | "id" | "chief"
      > & { chiefId: number }
    ) => projectQueries.create(data),
    onSuccess: (data: ResponseT<ProjectCreateResponse>) => {
      toast.success("Projet créé avec succès !");
      console.log("created successful:", data);
      form.reset();
    },
    onError: (error: any) => {
      toast.error("Une erreur est survenue lors de la creation du projet.");
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
      budget: values.budget ?? 0,
      chiefId: parseInt(values.chiefid, 10),
      status: "planning",
      userId: user?.id!
    };
    projectApi.mutate(data);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onsubmit)}
        className="max-w-3xl grid grid-cols-1 gap-4 @min-[640px]:grid-cols-2"
      >
        <FormField
          control={form.control}
          name="label"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {"Titre du Projet"}
                <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input {...field} placeholder="ex. Autoroute A5" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="chiefid"
          render={({ field }) => {
            const options = userApi.data
              ? userApi.data.data.map((user) => ({
                value: user.id,
                label: user.firstName + " " + user.lastName,
              }))
              : [];
            return (
              <FormItem>
                <FormLabel>
                  {"Chef du Projet"}
                  <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  {/* <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      {options.map((option, id) => (
                        <SelectItem
                          key={id}
                          value={String(option.value)}
                          className="capitalize"
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                      {options.length === 0 && (
                        <SelectItem value="-" disabled>
                          {"Aucun utilisateur enregistré"}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select> */}
                  <SearchableSelect
                    width="w-full"
                    allLabel=""
                    options={
                      userApi.data?.data.map((user) => ({
                        value: String(user.id),
                        label: user.firstName + " " + user.lastName,
                      })) || []
                    }
                    {...field}
                    placeholder="Sélectionner"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem className="@min-[640px]:col-span-2">
              <FormLabel>{"Description du Projet"} <span className="text-destructive">*</span></FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Décrivez le projet" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="budget"
          render={({ field: { value, ...props } }) => (
            <FormItem className="col-span-2">
              <FormLabel>{"Budget prévisionnel"}</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type="number"
                    value={String(value)}
                    {...props}
                    placeholder="ex. 150 000 000"
                  />
                  <div className="absolute right-0 top-[1%] bg-gray-100 p-2 ">
                    {"FCFA"}
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="@min-[640px]:col-span-2 ml-auto">
          <Button disabled={projectApi.isPending} type="submit" variant={"primary"}>
            {"Enrégistrer"}
            {projectApi.isPending && <Loader2 className="ml-2 animate-spin" />}
          </Button>
        </div>
      </form>
    </Form>
  );
}
