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
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerDescription,
  DrawerEyebrow,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { userQ } from "@/queries/baseModule";
import { User as UserT } from "@/types/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
  // const router = useRouter();
  const queryClient = useQueryClient();
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
    onSuccess: () => {
      queryClient.invalidateQueries();
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
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerEyebrow>{"Réglages"}</DrawerEyebrow>
          <DrawerTitle>
            {userData?.firstName + " " + userData?.lastName}
          </DrawerTitle>
          <DrawerDescription>
            {
              "Modifier le mot de passe en indiquant les nouvelles informations."
            }
          </DrawerDescription>
        </DrawerHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex min-h-0 flex-1 flex-col"
          >
            <DrawerBody className="grid grid-cols-1 content-start gap-4 @min-[640px]:grid-cols-2">
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
            </DrawerBody>
            <DrawerFooter pinned>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                {"Annuler"}
              </Button>
              <Button
                type="submit"
                variant={"primary"}
                disabled={update.isPending}
                isLoading={update.isPending}
              >
                {"Enregistrer les modifications"}
              </Button>
            </DrawerFooter>
          </form>
        </Form>
      </DrawerContent>
    </Drawer>
  );
}
