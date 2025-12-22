"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

import { ProjectT, ResponseT } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Field, FieldError, FieldGroup, FieldLabel } from "../ui/field";
import { Textarea } from "../ui/textarea";
import { Loader } from "lucide-react";

// ----------------------------------------------------------------------
// VALIDATION
// ----------------------------------------------------------------------
export const formSchema = z.object({
  label: z.string({ message: "This field is required" }),
  description: z.string({ message: "This field is required" }).optional(),
  chiefid: z.string().min(1, "Please select an item"),
  budget: z.coerce.number({ message: "Please enter a valid number" }),
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
      chiefid: "",
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
    ) => projectQueries.update(projectData?.id || 0, data),
    onSuccess: (data: ResponseT<ProjectT>) => {
      toast.success("Projet mis à jour avec succès !");
      console.log("created successful:", data);
      form.reset();
      setOpen(false);
    },
    onError: (error: any) => {
      toast.error("Une erreur est survenue lors de la mise à jour du projet.");
      console.error("Register error:", error);
    },
  });

  const userApi = useQuery({
    queryKey: ["usersList"],
    queryFn: () => userQueries.getAll(),
    enabled: isHydrated,
  });

  useEffect(() => {
    form.reset({
      label: projectData?.label || "",
      description: projectData?.description || "",
      chiefid: projectData?.chief?.id.toString() || "",
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
      chiefId: parseInt(values.chiefid, 10),
      status: "planning",
    };
    projectApi.mutate(data);
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
            {`Modifier le projet  ${projectData?.label}`}
          </DialogTitle>
          <p className="text-sm text-white/80 mt-1">
            {"Modifiez les informations du projet existant"}
          </p>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onsubmit)}
            className="space-y-8 max-w-3xl py-10 p-6"
          >
            <FieldGroup>
              <Controller
                name="label"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="gap-1">
                    <FieldLabel htmlFor="label">
                      {"Titre du projet *"}
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
                    <FieldLabel htmlFor="description">
                      {"Description"}{" "}
                    </FieldLabel>
                    <Textarea
                      {...field}
                      id="description"
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
                      <FieldLabel htmlFor="chiefid">
                        {"Chef de projet *"}
                      </FieldLabel>

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

              <Controller
                name="budget"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="gap-1">
                    <FieldLabel htmlFor="budget">{"Budget *"}</FieldLabel>
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
              <div className="flex justify-end items-center w-full">
                <Button
                  disabled={projectApi.isPending}
                  type="submit"
                  variant={"primary"}
                  className="rounded-lg"
                  size="sm"
                >
                  {projectApi.isPending && (
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {"Enregistrer"}
                </Button>
              </div>
            </FieldGroup>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
{
}
