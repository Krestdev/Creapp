"use client";

import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DepartmentT, DepartmentUpdateInput } from "@/types/types";
import { userQ } from "@/queries/baseModule";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { departmentQ } from "@/queries/departmentModule";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEffect } from "react";
import { Textarea } from "../ui/textarea";
import { Plus } from "lucide-react";

const formSchema = z.object({
  label: z.string(),
  description: z.string(),
  members: z
    .array(
      z.object({
        id: z.number().optional(),
        label: z.string(),
        userId: z.number(),
        validator: z.boolean(),
        chief: z.boolean(),
        finalValidator: z.boolean(),
      })
    )
    .nullable(),
  status: z.string(),
});

interface UpdateRequestProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  departmentData: DepartmentT | null;
  onSuccess?: () => void;
}

export default function UpdateDepartment({
  open,
  setOpen,
  departmentData,
  onSuccess,
}: UpdateRequestProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      label: "",
      description: "",
      status: "",
      members: [],
    },
  });
  const queryClient = useQueryClient();

  useEffect(() => {
    form.reset({
      label: departmentData?.label || "",
      description: departmentData?.description || "",
      status: departmentData?.status || "active",
      members: departmentData?.members || [],
    });
  }, [form, departmentData]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "members",
  });

  // // Example user list
  // const users = [
  //   { id: 1, name: "John Doe" },
  //   { id: 2, name: "Anna Smith" },
  // ];
  const users = useQuery({
    queryKey: ["users"],
    queryFn: async () => userQ.getAll(),
  });

  const departmentMutation = useMutation({
    mutationKey: ["departmentUpdate"],
    mutationFn: async (data: Partial<DepartmentUpdateInput>) =>
      departmentQ.update(Number(departmentData?.id), data),

    onSuccess: () => {
      toast.success("Département mis à jour avec succès !");
      setOpen(false);
      queryClient.invalidateQueries({
        queryKey: ["departmentList"],
        refetchType: "active",
      });
      onSuccess?.();
    },

    onError: (e) => {
      console.error(e);
      toast.error("Une erreur est survenue lors de la modification.");
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    departmentMutation.mutate({
      label: values.label,
      description: values.description ?? "",
      members: values.members ?? [],
      status: values.status,
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[760px] w-full max-h-[90vh] p-0 gap-0 flex flex-col">
        {/* Header avec fond bordeaux - FIXE */}
        <DialogHeader className="bg-[#8B1538] text-white p-6 m-4 rounded-lg pb-8 shrink-0">
          <DialogTitle className="text-xl font-semibold text-white">
            {`Modifier le département ${departmentData?.label}`}
          </DialogTitle>
          <p className="text-sm text-white/80 mt-1">
            {"Modifiez les informations du département"}
          </p>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex-1 overflow-y-auto px-6 pb-6"
          >
            {/* LABEL */}
            <FormField
              control={form.control}
              name="label"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{"Nom du Département"}</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex. Finances & Fiscalité" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* DESCRIPTION */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{"Description"}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Il regroupe le personnel en charge de la gestion fiscale et comptable de l'entreprise"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* STATUS */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{"Statut"}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">{"Actif"}</SelectItem>
                      <SelectItem value="inactive">{"Désactivé"}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* MEMBERS ARRAY */}
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{"Effectif"}</h3>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    append({
                      label: "",
                      userId:
                        users.data && users.data.data[0].id
                          ? users.data.data[0].id
                          : 0,
                      validator: false,
                      chief: false,
                      finalValidator: false,
                    })
                  }
                >
                  {"Ajouter un employé"}
                  <Plus />
                </Button>
              </div>

              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="border rounded-lg p-4 space-y-4 bg-muted/20"
                >
                  {/* MEMBER LABEL */}
                  <FormField
                    control={form.control}
                    name={`members.${index}.label`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{`Employé ${index + 1}`}</FormLabel>
                        <FormControl>
                          <Input placeholder="Member label" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* USER SELECT */}
                  <FormField
                    control={form.control}
                    name={`members.${index}.userId`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{"Utilisateur"}</FormLabel>
                        <Select
                          onValueChange={(v) => field.onChange(parseInt(v))}
                          defaultValue={String(field.value)}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Sélectionner un utilisateur" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {users.data
                              ? users.data.data.map((u) => (
                                  <SelectItem key={u.id} value={String(u.id)}>
                                    {u.firstName + " " + u.lastName}
                                  </SelectItem>
                                ))
                              : null}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* CHECKBOXES */}
                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name={`members.${index}.validator`}
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel>{"Validateur"}</FormLabel>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`members.${index}.chief`}
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel>{"Chef de Département"}</FormLabel>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`members.${index}.finalValidator`}
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel>{"Dernier Validateur"}</FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button
                    type="button"
                    variant="delete"
                    onClick={() => remove(index)}
                  >
                    {"Supprimer"}
                  </Button>
                </div>
              ))}
            </div>
          </form>
          <div className="flex gap-3 p-6 pt-0 shrink-0 ml-auto">
            {/* SUBMIT */}
            <Button
              type="submit"
              className="w-fit"
              onClick={form.handleSubmit(onSubmit)}
            >
              {"Enregistrer"}
            </Button>
            <Button
              type="button"
              className="w-fit"
              onClick={() => setOpen(false)}
              variant={"outline"}
            >
              {"Annuler"}
            </Button>
          </div>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
