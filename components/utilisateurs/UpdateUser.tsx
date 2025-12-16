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
import { User as UserT } from "@/types/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import MultiSelectUsers from "../base/multiSelectUsers";
import MultiSelectRole from "../base/multiSelectRole";

const formSchema = z.object({
  email: z.string(),
  name: z.string(),
  phone: z.string(),
  password: z.string(),
  role: z.string().optional(),
});

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
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      name: "",
      phone: "",
      password: "",
      role: "",
    },
  });

  useEffect(() => {
    form.reset({
      email: userData?.email || "",
      name: userData?.name || "",
      phone: userData?.phone,
      password: userData?.password,
    });
  }, [userData]);

  const userQueries = new UserQueries();
  const userMutation = useMutation({
    mutationKey: ["userUpdate"],
    mutationFn: async (data: Partial<UserT>) =>
      userQueries.update(Number(userData?.id), data),

    onSuccess: () => {
      toast.success("Besoin modifié avec succès !");
      setOpen(false);
      onSuccess?.();
    },

    onError: (e) => {
      console.error(e);
      toast.error("Une erreur est survenue lors de la modification.");
    },
  });

  const roles = new UserQueries();
  const { data: rolesData } = useQuery({
    queryKey: ["users"],
    queryFn: async () => roles.getRoles(),
  });

  const ROLES =
    rolesData?.data.map((u) => ({ id: u.id!, label: u.label })) || [];

  const [selectedRole, setSelectedRole] = useState<
    { id: number; label: string }[]
  >([]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    userMutation.mutate({
      email: values.email,
      name: values.name,
      phone: values.phone,
      password: values.password,
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[760px] w-full max-h-[90vh] p-0 gap-0 flex flex-col">
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
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 p-6"
          >
            {/* LABEL */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom</FormLabel>
                  <FormControl>
                    <Input placeholder="Entrez le nom" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* LABEL */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter l'email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* LABEL */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mot de passe</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter le nouveaux mot de pass"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* DESCRIPTION */}
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact</FormLabel>
                  <FormControl>
                    <Input placeholder="Entrer le contact" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>{"Rôle"}</FormLabel>

                  <MultiSelectRole
                    display="Role"
                    roles={ROLES}
                    selected={selectedRole}
                    onChange={(list) => {
                      setSelectedRole(list);
                      field.onChange(list.map((u) => u.id));
                    }}
                  />

                  <FormMessage />
                </FormItem>
              )}
            />

            {/* SUBMIT */}
            <Button type="submit" className="w-full">
              Enregistrer
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
