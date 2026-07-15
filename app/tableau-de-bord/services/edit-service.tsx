"use client";
import { SearchableSelect } from "@/components/base/searchableSelect";
import MultiSelectUsers from "@/components/base/multiSelectUsers";
import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import { serviceQ, UpdateService, UpdateUsers } from "@/queries/services";
import { Service, User } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const schema = z.object({
  label: z.string().min(3, {
    message: "Le nom du service doit contenir au moins 3 caractères",
  }),
  description: z.string().optional(),
  headId: z.coerce.number({ message: "Veuillez définir un chef de service" }),
  users: z
    .array(z.coerce.number())
    .min(1, { message: "Veuillez ajouter au moins un utilisateur" }),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  openChange: React.Dispatch<React.SetStateAction<boolean>>;
  service: Service;
  users: User[];
}

function EditService({ open, openChange, service, users }: Props) {
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { label: "", description: "", headId: undefined, users: [] },
  });

  useEffect(() => {
    if (open && service) {
      form.reset({
        label: service.label ?? "",
        description: service.description ?? "",
        headId: service.headId ?? undefined,
        users: service.users.map((u) => u.id),
      });
    }
  }, [open, service, form]);

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateService }) =>
      serviceQ.update(id, data),
  });

  const addUsersMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateUsers }) =>
      serviceQ.addUsers(id, data),
  });

  const removeUsersMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateUsers }) =>
      serviceQ.removeUsers(id, data),
  });

  async function onSubmit(values: FormValues) {
    const originalIds = service.users.map((u) => u.id);
    const newIds = values.users;

    const toAdd = newIds.filter((id) => !originalIds.includes(id));
    const toRemove = originalIds.filter((id) => !newIds.includes(id));

    try {
      await Promise.all([
        updateMutation.mutateAsync({
          id: service.id,
          data: {
            label: values.label,
            description: values.description ?? null,
            headId: values.headId,
          },
        }),
        toAdd.length > 0
          ? addUsersMutation.mutateAsync({
            id: service.id,
            data: { users: toAdd },
          })
          : Promise.resolve(),
        toRemove.length > 0
          ? removeUsersMutation.mutateAsync({
            id: service.id,
            data: { users: toRemove },
          })
          : Promise.resolve(),
      ]);
      toast.success("Service modifié avec succès !");
      queryClient.invalidateQueries({ queryKey: ["services"] });
      openChange(false);
    } catch {
      toast.error("Erreur lors de la modification du service.");
    }
  }

  const isPending =
    updateMutation.isPending ||
    addUsersMutation.isPending ||
    removeUsersMutation.isPending;

  const headOptions = users.map((u) => ({
    value: String(u.id),
    label: `${u.firstName} ${u.lastName}`,
  }));

  const allMembers = users.map((u) => ({
    id: u.id,
    name: `${u.firstName} ${u.lastName}`,
  }));

  return (
    <Dialog open={open} onOpenChange={openChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader variant="secondary">
          <DialogTitle>{"Modifier le service"}</DialogTitle>
          <p className="text-sm text-white/80 mt-1">
            {"Mettez à jour les informations du service."}
          </p>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <FormField
              control={form.control}
              name="label"
              render={({ field }) => (
                <FormItem>
                  <FormLabel isRequired>{"Nom du service"}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ex. Direction Générale" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="col-span-full">
                  <FormLabel>{"Description"}</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Description du service..."
                      rows={2}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="headId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel isRequired>{"Chef de service"}</FormLabel>
                  <FormControl>
                    <SearchableSelect
                      value={field.value ? String(field.value) : undefined}
                      onChange={(val) =>
                        field.onChange(val ? Number(val) : undefined)
                      }
                      options={headOptions}
                      placeholder="Sélectionner un chef de service"
                      allLabel="Aucun chef"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="users"
              render={({ field }) => (
                <FormItem>
                  <FormLabel isRequired>{"Membres du service"}</FormLabel>
                  <FormControl>
                    <MultiSelectUsers
                      display="user"
                      users={allMembers}
                      selected={allMembers.filter((u) =>
                        field.value.includes(u.id),
                      )}
                      onChange={(selected) =>
                        field.onChange(selected.map((u) => u.id))
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => openChange(false)}
              >
                {"Annuler"}
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isPending}
                isLoading={isPending}
              >
                {"Enregistrer"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default EditService;
