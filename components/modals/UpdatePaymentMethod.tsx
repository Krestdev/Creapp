"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStore } from "@/providers/datastore";
import { requestQ } from "@/queries/requestModule";
import { Category, ProjectT, RequestModelT, User } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { LoaderIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

// ----------------------------------------------------------------------
// VALIDATION
// ----------------------------------------------------------------------
const formSchema = z.object({
  paytype: z.enum(["cash", "chq", "ov"], {
    required_error: "Sélectionner le moyen de paiement",
    invalid_type_error: "Sélectionner le moyen de paiement",
  }),
});

interface UpdatePaymentMethodProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  requestData: RequestModelT;
  onSuccess?: () => void;
  categories: Category[];
  users: User[];
  projects: ProjectT[];
}

export default function UpdatePaymentMethod({
  open,
  setOpen,
  requestData,
  onSuccess,
  categories,
}: UpdatePaymentMethodProps) {
  const { user } = useStore();
  const [isFormInitialized, setIsFormInitialized] = useState(false);

  // ----------------------------------------------------------------------
  // FORM INITIALISATION
  // ----------------------------------------------------------------------
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      paytype: undefined,
    },
  });

  // ----------------------------------------------------------------------
  // INITIALISATION DES DONNÉES
  // ----------------------------------------------------------------------
  useEffect(() => {
    if (requestData && open) {
      try {
        // Réinitialiser le formulaire avec la valeur actuelle
        form.reset({
          paytype: requestData.paytype as "cash" | "chq" | "ov" | undefined,
        });
        setIsFormInitialized(true);
      } catch (error) {
        console.error("Erreur lors de l'initialisation du formulaire:", error);
        toast.error("Erreur lors du chargement des données");
      }
    } else {
      setIsFormInitialized(false);
    }
  }, [requestData, open, form]);

  // ----------------------------------------------------------------------
  // UPDATE MUTATION
  // ----------------------------------------------------------------------
  const validateRequest = useMutation({
    mutationFn: async ({
      id,
      request,
    }: {
      id: number;
      request: Partial<RequestModelT>;
    }) => requestQ.validate({ id, request }),
    onSuccess: () => {
      toast.success("Moyen de paiement mis à jour et besoin approuvé avec succès !");
      setOpen(false);
      onSuccess?.();
    },
    onError: (error: any) => {
      console.error("Erreur lors de la validation:", error);
      toast.error("Erreur lors de la validation");
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!requestData?.id) {
      toast.error("ID de la demande manquant");
      return;
    }

    validateRequest.mutate({
      id: Number(requestData.id),
      request: {
        paytype: values.paytype,
      },
    });
  }

  // ----------------------------------------------------------------------
  // RENDER
  // ----------------------------------------------------------------------
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] p-0 gap-0 flex flex-col">
        {/* Header - FIXE EN HAUT */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
          <DialogTitle>{"Modifier le moyen de paiement"}</DialogTitle>
          <DialogDescription>
            {"Sélectionnez le moyen de paiement pour ce besoin"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          {/* Contenu scrollable */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="space-y-6">
              {/* Informations du besoin */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <p className="text-sm font-medium text-gray-700">
                  Besoin:{" "}
                  <span className="font-normal">{requestData?.label}</span>
                </p>
                <p className="text-sm font-medium text-gray-700">
                  Montant:{" "}
                  <span className="font-normal">
                    {requestData?.amount?.toLocaleString()} FCFA
                  </span>
                </p>
                {requestData?.dueDate && (
                  <p className="text-sm font-medium text-gray-700">
                    Date limite:{" "}
                    <span className="font-normal">
                      {new Date(requestData.dueDate).toLocaleDateString()}
                    </span>
                  </p>
                )}
              </div>

              {/* Moyen de paiement */}
              <FormField
                control={form.control}
                name="paytype"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel isRequired>{"Moyen de paiement"}</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={validateRequest.isPending}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Sélectionner un moyen de paiement" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cash">Espèces</SelectItem>
                          <SelectItem value="chq">Chèque</SelectItem>
                          <SelectItem value="ov">Virement</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Boutons - FIXE EN BAS */}
          <DialogFooter className="px-6 py-4 border-t shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={validateRequest.isPending}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={validateRequest.isPending || !isFormInitialized}
              className="bg-green-500 hover:bg-green-600"
              onClick={form.handleSubmit(onSubmit)}
            >
              {validateRequest.isPending ? (
                <>
                  <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                  Traitement...
                </>
              ) : (
                "Appliquer"
              )}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
