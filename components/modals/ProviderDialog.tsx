"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
} from "../ui/form";
import { Input } from "../ui/input";
import { ProviderQueries } from "@/queries/providers";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Le nom du fournisseur doit contenir au moins 2 caractères.",
  }),
});

interface DetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message?: string;
}

export function ProviderDialog({ open, onOpenChange }: DetailModalProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  const providerQueries = new ProviderQueries();
  const { mutate: registerProvider, isPending } = useMutation({
    mutationKey: ["registerNewProvider"],
    mutationFn: (data: { name: string }) => providerQueries.create(data),
    onSuccess: () => {
      toast.success("Inscription réussie !");
    //Invalidate les queries pour mettre à jour la liste des fournisseurs
    },
    onError: (error: any) => {
      console.error("Register error:", error);
    },
  });

  // 🔹 Reset automatique quand le dialog se ferme
  useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [open, form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      registerProvider({ name: values.name });
    } catch (error) {
      console.error("Form submission error", error);
      toast.error("Failed to submit the form. Please try again.");
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-screen overflow-y-auto p-0 gap-0 overflow-x-hidden border-none z-50">
        {/* Header */}
        <DialogHeader className="bg-linear-to-r from-[#8B1538] to-[#700032] text-white p-6 m-4 rounded-lg pb-8">
          <DialogTitle className="text-xl font-semibold">
            {"Créer un fournisseur"}
          </DialogTitle>
          <p className="text-sm text-white/80 mt-1">
            {"Renseigner le nom du fournisseur que vous compléterez plus tard."}
          </p>
        </DialogHeader>

        {/* Form */}
        <div className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel isRequired>{"Nom du fournisseur"}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 pt-0">
          <Button
            type="button"
            variant="default"
            onClick={form.handleSubmit(onSubmit)}
            disabled={isPending}
          >
            {isPending ? "Création en cours..." : "Créer un fournisseur"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            {"Annuler"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
