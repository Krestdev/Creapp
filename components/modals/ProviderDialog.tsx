"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { providerQ } from "@/queries/providers";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
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
import { Provider } from "@/types/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Le nom du fournisseur doit contenir au moins 2 caractères.",
  }),
  regem: z.enum(["Réel", "Impot général synthétique"]),
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
      regem: undefined,
    },
  });

  const { mutate: registerProvider, isPending } = useMutation({
    mutationFn: (data: Omit<Provider, "id" | "createdAt">) =>
      providerQ.create(data),
    // Dans ProviderDialog, modifiez le onSuccess :
    onSuccess: () => {
      toast.success("Fournisseur ajouté avec succès !");

      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error(
        "Une erreur est survenue lors de la creation du fournisseur.",
      );
      console.error("Register error:", error);
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      registerProvider({
        name: values.name,
        regem: values.regem,
        expireAtcarte_contribuable: null,
        expireAtplan_localisation: null,
        expireAtcommerce_registre: null,
        expireAtbanck_attestation: null,
      });
    } catch (error) {
      console.error("Form submission error", error);
      toast.error("Failed to submit the form. Please try again.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="z-50">
        {/* Header */}
        <DialogHeader variant={"secondary"}>
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
              <FormField
                control={form.control}
                name="regem"
                render={({ field }) => (
                  <FormItem className="@min-[640px]:col-span-2">
                    <FormLabel isRequired>{"Régime"}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full h-10! shadow-none! rounded! py-1">
                          <SelectValue placeholder="Sélectionner un Régime" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {[
                          { id: 1, value: "Réel" },
                          { id: 2, value: "Impot général synthétique" },
                        ].map((p) => (
                          <SelectItem key={p.id} value={p.value}>
                            {p.value}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
            variant="primary"
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
