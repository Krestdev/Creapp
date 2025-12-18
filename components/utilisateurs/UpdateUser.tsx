"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { UserQueries } from "@/queries/baseModule";
import { Role, User as UserT } from "@/types/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import MultiSelectRole from "../base/multiSelectRole";

/* =========================
   SCHEMA ZOD
========================= */
const formSchema = z
  .object({
    email: z.string().email("Email invalide"),
    name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
    phone: z.string().optional(),
    password: z.string().optional(),
    confirmPassword: z.string().optional(),
    role: z.array(z.number()).optional(),
  })
  .refine(
    (data) => {
      if (!data.password || data.password.trim() === "") return true;
      return data.password === data.confirmPassword;
    },
    {
      message: "Les mots de passe ne correspondent pas",
      path: ["confirmPassword"],
    }
  );

interface UpdateRequestProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  userData: UserT | null;
  onSuccess?: () => void;
}

export default function UpdateUser({
  open,
  setOpen,
  userData,
  onSuccess,
}: UpdateRequestProps) {
  const queryClient = useQueryClient();

  const [selectedRole, setSelectedRole] = useState<
    { id: number; label: string }[]
  >([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      name: "",
      phone: "",
      password: "",
      confirmPassword: "",
      role: [],
    },
  });

  /* =========================
     INIT FORM
  ========================= */
  useEffect(() => {
    if (userData && open) {
      const roles = userData.role || [];
      setSelectedRole(
        roles.map((r) => ({ id: r.id!, label: r.label }))
      );

      form.reset({
        email: userData.email || "",
        name: userData.name || "",
        phone: userData.phone || "",
        password: "",
        confirmPassword: "",
        role: roles.map((r) => r.id!),
      });
    }
  }, [userData, open, form]);

  /* =========================
     MUTATION
  ========================= */
  const userQueries = new UserQueries();
  const userMutation = useMutation({
    mutationFn: async (data: any) => {
      const { roleIds, ...payload } = data;

      if (roleIds?.length) {
        return userQueries.update(Number(payload.id), {
          ...payload,
          role: roleIds,
        });
      }

      return userQueries.update(Number(payload.id), payload);
    },
    onSuccess: () => {
      toast.success("Utilisateur modifié avec succès !");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setOpen(false);
      onSuccess?.();
    },
    onError: () => {
      toast.error("Erreur lors de la modification");
    },
  });

  /* =========================
     ROLES
  ========================= */
  const rolesQuery = new UserQueries();
  const { data: rolesData } = useQuery({
    queryKey: ["roles"],
    queryFn: async () => rolesQuery.getRoles(),
  });

  const ROLES =
    rolesData?.data?.map((r: Role) => ({
      id: r.id!,
      label: r.label,
    })) || [];

  /* =========================
     SUBMIT
  ========================= */
  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!userData?.id) return;

    const payload: any = {
      id: userData.id,
      email: values.email,
      name: values.name,
      phone: values.phone || undefined,
    };

    if (values.password && values.password.trim() !== "") {
      payload.password = values.password;
    }

    if (selectedRole.length) {
      payload.roleIds = selectedRole.map((r) => r.id);
    }

    userMutation.mutate(payload);
  }

  /* =========================
     RENDER
  ========================= */
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[760px] p-0 flex flex-col">
        <DialogHeader className="bg-[#8B1538] text-white p-6 m-4 rounded-lg">
          <DialogTitle className="text-xl font-semibold">
            Modifier l’utilisateur {userData?.name ?? ""}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex-1 overflow-y-auto px-6 pb-6 space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom *</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email *</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nouveau mot de passe</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Laisser vide pour ne pas modifier"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmer le mot de passe</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Téléphone</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <FormLabel>Rôles *</FormLabel>
              <MultiSelectRole
                display="Role"
                roles={ROLES}
                selected={selectedRole}
                onChange={(selected) => {
                  setSelectedRole(selected);
                  form.setValue(
                    "role",
                    selected.map((r) => r.id)
                  );
                }}
              />
            </div>
          </form>

          <div className="flex justify-end gap-3 p-6 pt-0">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button onClick={form.handleSubmit(onSubmit)} type="submit" disabled={userMutation.isPending}>
              {userMutation.isPending ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </div>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
