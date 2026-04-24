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
import { projectQ } from "@/queries/projectModule";
import { ProjectT, User } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { SearchableSelect } from "../base/searchableSelect";
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
  label: z
    .string({ message: "Ce champ est requis" })
    .min(2, "Le libellé doit contenir au moins 2 caractères"),

  description: z.string().min(1, { message: "Ce champ est requis" }).optional(),

  chiefId: z.coerce.number({
    message: "Veuillez sélectionner un chef de projet",
  }),
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

export function ProjectCreateForm({
  users,
  userId,
}: {
  users: User[];
  userId: number;
}) {
  const form = useForm<Schema>({
    resolver: zodResolver(formSchema as any),
    defaultValues: {
      chiefId: undefined,
      label: "",
      description: "",
    },
  });

  const projectApi = useMutation({
    mutationFn: (
      data: Omit<
        ProjectT,
        "reference" | "updatedAt" | "createdAt" | "id" | "chief"
      > & { chiefId: number },
    ) => projectQ.create(data),
    onSuccess: () => {
      toast.success("Projet créé avec succès !");
      form.reset();
    },
    onError: (error: Error) => {
      toast.error(error.message);
      //console.error("Register error:", error.message);
    },
  });

  const onsubmit = (values: z.infer<typeof formSchema>) => {
    const data: Omit<
      ProjectT,
      "reference" | "updatedAt" | "createdAt" | "id" | "chief"
    > & { chiefId: number } = {
      label: values.label,
      description: values.description || "",
      budget: values.budget ?? 0,
      chiefId: values.chiefId,
      status: "planning",
      userId: userId,
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
              <FormLabel isRequired>{"Titre du Projet"}</FormLabel>
              <FormControl>
                <Input {...field} placeholder="ex. Autoroute A5" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="chiefId"
          render={({ field }) => {
            const options = users
              .filter((u) => u.verified)
              .map((user) => ({
                value: String(user.id),
                label: user.lastName + " " + user.firstName,
              }));
            return (
              <FormItem>
                <FormLabel isRequired>{"Chef du Projet"}</FormLabel>
                <FormControl>
                  <SearchableSelect
                    width="w-full"
                    allLabel="" // Pas d'option "all"
                    options={options}
                    value={String(field.value)}
                    onChange={field.onChange}
                    placeholder="Sélectionner un chef de projet"
                    emptyLabel="Aucun utilisateur trouvé"
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
              <FormLabel isRequired>{"Description du Projet"}</FormLabel>
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
          <Button
            disabled={projectApi.isPending}
            type="submit"
            variant={"primary"}
            isLoading={projectApi.isPending}
          >
            {"Enrégistrer"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
