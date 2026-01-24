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
import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

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
    },
  );

type FormValues = z.infer<typeof formSchema>;

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
  const router = useRouter();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const update = useMutation({
    mutationFn: async (password: string) =>
      userQ.changePassword(userData?.id ?? 0, password),
    onSuccess: (data) => {
      toast.success(
        `Vous avez modifié le mot de passe de ${userData?.firstName} ${userData?.lastName} avec succès !`,
      );
      setOpen(false);
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  function onSubmit(values: FormValues) {
    update.mutate(values.password);
  }

  /* =========================
       RENDER
    ========================= */
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[540px]! p-0 flex flex-col">
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
        <div className="px-6 pb-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="form-3xl">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="@min-[640px]:col-span-2">
                    <FormLabel isRequired>{"Mot de passe"}</FormLabel>
                    <FormControl>
                      <Input {...field} type="password" placeholder="******" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem className="@min-[640px]:col-span-2">
                    <FormLabel isRequired>
                      {"Confirmer votre mot de passe"}
                    </FormLabel>
                    <FormControl>
                      <Input {...field} type="password" placeholder="******" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="@min-[640px]:col-span-2 w-full inline-flex justify-end">
                <Button
                  variant={"primary"}
                  disabled={update.isPending}
                  isLoading={update.isPending}
                >
                  {"Enregistrer les modifications"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
