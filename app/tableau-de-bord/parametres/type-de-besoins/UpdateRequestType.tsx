"use client";

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
import { requestTypeQ } from "@/queries/requestType";
import { RequestType } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

// Validation schema
const formSchema = z.object({
  label: z
    .string()
    .min(1, "Le titre est obligatoire")
    .max(100, "Le titre ne doit pas dépasser 100 caractères"),
  description: z
    .string()
    .min(1, "La description est obligatoire")
    .max(500, "La description ne doit pas dépasser 500 caractères"),
});

type FormValues = z.infer<typeof formSchema>;

interface UpdateRequestTypeProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: RequestType | undefined;
}

export function UpdateRequestType({
  open,
  onOpenChange,
  data,
}: UpdateRequestTypeProps) {
  const queryClient = useQueryClient();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      label: "",
      description: "",
    },
  });

  // Mutation pour la mise à jour
  const updateMutation = useMutation({
    mutationFn: (values: {
      id: number;
      label: string;
      description: string;
    }) => {
      return requestTypeQ.update(Number(data?.id), {
        label: values.label,
        description: values.description,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      toast.success("Type de besoin modifié avec succès");
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error("Erreur lors de la modification");
      console.error("Update error:", error);
    },
  });

  // Reset form when data changes
  useEffect(() => {
    if (data) {
      form.reset({
        label: data.label || "",
        description: data.description || "",
      });
    }
  }, [data, form]);

  const handleSubmit = async (values: FormValues) => {
    if (!data?.id) {
      toast.error("ID du type de besoin manquant");
      return;
    }

    updateMutation.mutate({
      id: data.id,
      label: values.label,
      description: values.description,
      // Note: description n'est pas envoyé car elle est désactivée
    });
  };

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      form.reset();
      updateMutation.reset();
    }
  }, [open]); // ✅ seulement open

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        {/* Header avec fond bordeaux */}
        <DrawerHeader>
          <DrawerEyebrow>{"Réglages"}</DrawerEyebrow>
          <DrawerTitle>
            Modifier le type de besoin
          </DrawerTitle>
          <DrawerDescription>
            Mettez à jour les informations du type de besoin
          </DrawerDescription>
        </DrawerHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="flex min-h-0 flex-1 flex-col"
          >
            <DrawerBody className="space-y-4">
            {/* Titre */}
            <FormField
              control={form.control}
              name="label"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    Titre <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Achat de matériel informatique"
                      {...field}
                      disabled={updateMutation.isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description (désactivée) */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    Description
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ex: Type de besoin pour l'achat d'équipements informatiques..."
                      className="resize-none"
                      rows={4}
                      {...field}
                      disabled
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-red-600">
                    La description ne peut pas être modifiée
                  </p>
                </FormItem>
              )}
            />

            </DrawerBody>
            <DrawerFooter pinned>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={updateMutation.isPending}
              >
                {"Annuler"}
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Modification...
                  </>
                ) : (
                  "Enregistrer"
                )}
              </Button>
            </DrawerFooter>
          </form>
        </Form>
      </DrawerContent>
    </Drawer>
  );
}
