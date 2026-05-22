"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { useStore } from "@/providers/datastore";
import { userQ } from "@/queries/baseModule";
import { projectQ } from "@/queries/projectModule";

import { queryKeys } from "@/lib/query-keys";
import { ProjectT, ResponseT } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { SearchableSelect } from "../base/searchableSelect";
import { Textarea } from "../ui/textarea";

// ----------------------------------------------------------------------
// VALIDATION
// ----------------------------------------------------------------------
export const formSchema = z.object({
  label: z.string({ message: "Veuillez renseigner un titre de projet" }),
  description: z
    .string({ message: "Veuillez renseigner une description" })
    .optional(),
  chiefid: z.coerce
    .number({ message: "Veuillez sélectionner un chef de projet" })
    .min(1, "Veuillez sélectionner un chef de projet"),
  budget: z.coerce
    .number({ message: "Veuillez entrer un montant valide" }),
});

interface UpdateRequestProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  projectData: ProjectT | null;
  onSuccess?: () => void;
}

export default function UpdateProject({
  open,
  setOpen,
  projectData,
  onSuccess,
}: UpdateRequestProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      label: "",
      description: "",
      chiefid: undefined,
      budget: 0,
    },
  });

  const { isHydrated, user } = useStore();

  const projectApi = useMutation({
    mutationFn: (
      data: Omit<
        ProjectT,
        "reference" | "updatedAt" | "createdAt" | "id" | "chief"
      > & { chiefId: number },
    ) => projectQ.update(projectData?.id || 0, data),
    onSuccess: (data: ResponseT<ProjectT>) => {
      toast.success("Projet mis à jour avec succès !");
      form.reset();
      setOpen(false);
    },
    onError: (error: any) => {
      toast.error("Une erreur est survenue lors de la mise à jour du projet.");
      console.error("Register error:", error);
    },
  });

  const userApi = useQuery({
    queryKey: queryKeys.users,
    queryFn: () => userQ.getAll(),
    enabled: isHydrated,
  });

  useEffect(() => {
    form.reset({
      label: projectData?.label || "",
      description: projectData?.description || "",
      chiefid: projectData?.chief?.id || undefined,
      budget: projectData?.budget || 0,
    });
  }, [projectData]);

  const onsubmit = (values: z.infer<typeof formSchema>) => {
    const data: Omit<
      ProjectT,
      "reference" | "updatedAt" | "createdAt" | "id" | "chief"
    > & { chiefId: number } = {
      label: values.label,
      description: values.description || "",
      budget: values.budget,
      chiefId: values.chiefid,
      status: projectData?.status || "ongoing",
      userId: user?.id!,
    };
    projectApi.mutate(data);
  };

  // ----------------------------------------------------------------------
  // RENDER
  // ----------------------------------------------------------------------
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        {/* Header avec fond bordeaux - FIXE */}
        <DialogHeader>
          <DialogTitle>
            {`Projet - ${projectData?.label}`}
          </DialogTitle>
          <DialogDescription>
            {"Modifiez les informations du projet existant"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onsubmit)}
            className="w-full grid gap-2"
          >
            <FormField control={form.control} name="label" render={({field})=>(
              <FormItem>
                <FormLabel isRequired>{"Titre du Projet"}</FormLabel>
                <FormControl>
                  <Textarea {...field} placeholder="Ex. Projet Oeuil de Lune" />
                </FormControl>
                <FormMessage/>
              </FormItem>
            )} />
            <FormField control={form.control} name="description" render={({field})=>(
              <FormItem>
                <FormLabel>{"Description"}</FormLabel>
                <FormControl>
                  <Textarea {...field} placeholder="Description du Projet" />
                </FormControl>
                <FormMessage/>
              </FormItem>
            )} />
            <FormField control={form.control} name="chiefid" render={({field})=>(<FormItem>
              <FormLabel>{"Chef de projet"}</FormLabel>
              <FormControl>
                <SearchableSelect 
                  value={field.value?.toString()}
                  onChange={(value) => field.onChange(parseInt(value))}
                  options={userApi.data?.data.map((user) => ({
                    value: user.id.toString(),
                    label: user.firstName + " " + user.lastName,
                  })) || []}
                />
              </FormControl>
              <FormMessage/>
            </FormItem>)} />
            <FormField control={form.control} name="budget" render={({field})=>(<FormItem>
              <FormLabel>{"Budget"}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage/>
            </FormItem>)} />
              <DialogFooter className="sticky bottom-0">
                <Button
                  disabled={projectApi.isPending}
                  type="submit"
                  variant={"primary"}
                  isLoading={projectApi.isPending}
                >
                  {"Enregistrer"}
                </Button>
                <DialogClose asChild>
                  <Button variant={"outline"} disabled={projectApi.isPending}>
                    {"Annuler"}
                  </Button>
                </DialogClose>
              </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
{
}
