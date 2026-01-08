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
    firstName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
    lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
    phone: z.string().optional(),
    password: z.string().optional(),
    confirmPassword: z.string().optional(),
    role: z.array(z.number()).optional(),
    post: z.string().optional(),
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
      firstName: "",
      lastName: "",
      phone: "",
      password: "",
      confirmPassword: "",
      role: [],
      post: "",
    },
  });

  /* =========================
     INIT FORM
  ========================= */
  useEffect(() => {
    if (userData && open) {
      const roles = userData.role || [];
      setSelectedRole(roles.map((r) => ({ id: r.id!, label: r.label })));

      form.reset({
        email: userData.email || "",
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        phone: userData.phone || "",
        password: "",
        confirmPassword: "",
        role: roles.map((r) => r.id!),
        post: userData.post || "",
      });
    }
  }, [userData, open, form]);

  /* =========================
     MUTATION
  ========================= */
  const userQueries = new UserQueries();

  const userMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<UserT> }) =>
      userQueries.update(id, data),

    onSuccess: () => {
      toast.success("Utilisateur modifié avec succès !");
      queryClient.invalidateQueries({
        queryKey: ["usersList"],
        refetchType: "active",
      });
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
      email: values.email,
      firstName: values.firstName,
      lastName: values.lastName,
      phone: values.phone || undefined,
      post: values.post || undefined,
    };

    if (values.password && values.password.trim() !== "") {
      payload.password = values.password;
    }

    if (selectedRole.length) {
      payload.role = selectedRole.map((r) => r.id);
    }

    userMutation.mutate({ id: userData.id, data: payload });
  }

  /* =========================
     RENDER
  ========================= */
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[840px] p-0 flex flex-col">
        <DialogHeader className="bg-[#8B1538] text-white p-6 m-4 rounded-lg">
          <DialogTitle className="text-xl font-semibold">
            {userData?.firstName + " " + userData?.lastName}
          </DialogTitle>
          <p className="text-sm text-white/80 mt-1">
            {"Modifier l'utilisateur en indiquant les nouvelles informations."}
          </p>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full grid grid-cols-1 gap-4 @min-[640px]:grid-cols-2 px-6"
          >

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prénom </FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                  <FormLabel>Contact </FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
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
                  <FormLabel>Adresse email </FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="post"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Poste </FormLabel>
                  <FormControl>
                    <Input type="Poste" {...field} />
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

            <div className="space-y-2 col-span-2">
              <FormLabel>Rôles *</FormLabel>
              <MultiSelectRole
                display="Role"
                roles={ROLES.filter((r) => r.label !== "MANAGER")}
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
            <Button
              variant={"primary"}
              onClick={form.handleSubmit(onSubmit)}
              type="submit"
              disabled={userMutation.isPending}
            >
              {userMutation.isPending ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </div>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
