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
import { userQ } from "@/queries/baseModule";
import { User as UserT } from "@/types/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "sonner";

/* =========================
   SCHEMA ZOD
========================= */
const formSchema = z
  .object({
    password: z
      .string()
      .min(6, "Le mot de passe doit contenir au moins 8 caractères"),
    confirmPassword: z
      .string()
      .min(6, "Le mot de passe doit contenir au moins 8 caractères"),
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

export default function UpdatePassword({
  open,
  setOpen,
  userData,
  onSuccess,
}: UpdateRequestProps) {
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  /* =========================
       INIT FORM
    ========================= */
  useEffect(() => {
    if (userData && open) {
      form.reset({
        password: "",
        confirmPassword: "",
      });
    }
  }, [userData, open, form]);

  /* =========================
       MUTATION
    ========================= */

  const userMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<UserT> }) =>
      userQ.update(id, data),

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
       SUBMIT
    ========================= */
  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!userData?.id) return;

    const payload = {
      password: values.password,
    };

    userMutation.mutate({ id: userData.id, data: payload });
  }

  /* =========================
       RENDER
    ========================= */
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[440px] p-0 flex flex-col">
        <DialogHeader className="bg-[#8B1538] text-white p-6 m-4 rounded-lg">
          <DialogTitle className="text-xl font-semibold">
            {userData?.firstName + " " + userData?.lastName}
          </DialogTitle>
          <p className="text-sm text-white/80 mt-1">
            {
              "Modifier le mot de passe en indiquant les nouvelles informations."
            }
          </p>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full flex flex-col gap-4 px-6"
          >
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nouveau mot de passe</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="******" {...field} />
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
                    <Input type="password" placeholder="******" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
              {userMutation.isPending ? "Enregistrement..." : "Modifier"}
            </Button>
          </div>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
