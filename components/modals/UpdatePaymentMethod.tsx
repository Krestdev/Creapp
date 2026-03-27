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
import {
  Category,
  PaymentRequest,
  ProjectT,
  RequestModelT,
  User,
} from "@/types/types";
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
  payments: PaymentRequest[];
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
  const validator = categories
    .find((cat) => cat.id === requestData?.categoryId)
    ?.validators?.find((v) => v.userId === user?.id);

  const validateRequest = useMutation({
    mutationFn: async ({
      id,
      validator,
    }: {
      id: number;
      validator:
        | {
            id?: number | undefined;
            userId: number;
            rank: number;
          }
        | undefined;
    }) => {
      await requestQ.validate(id, validator?.id!, validator);
    },
    onSuccess: () => {
      toast.success("Besoin approuvé avec succès !");
    },
    onError: () => {
      toast.error("Erreur lors de la validation");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<RequestModelT>) => {
      if (!requestData?.id) throw new Error("ID de la demande manquant");
      return requestQ.specialUpdate(data, Number(requestData.id));
    },

    onSuccess: () => {
      validateRequest.mutateAsync({
        id: requestData?.id!,
        validator: validator,
      });
      setOpen(false);
      onSuccess?.();
    },

    onError: (error: any) => {
      console.error("Erreur lors de la validation:", error);
      toast.error("Une erreur est survenue lors de la validation.");
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!requestData?.id) {
      toast.error("ID de la demande manquant");
      return;
    }

    // Préparation des données pour la mise à jour - uniquement le moyen de paiement
    const requestDataUpdate: Partial<RequestModelT> = {
      paytype: values.paytype,
      // Conserver toutes les autres données inchangées
      label: requestData.label,
      description: requestData.description,
      categoryId: requestData.categoryId,
      quantity: requestData.quantity,
      unit: requestData.unit,
      beneficiary: requestData.beneficiary,
      userId: requestData.userId,
      dueDate: requestData.dueDate,
      projectId: requestData.projectId,
      amount: requestData.amount,
      type: requestData.type,
      state: requestData.state,
      priority: requestData.priority,
    };

    updateMutation.mutate(requestDataUpdate);
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
                  Besoin: <span className="font-normal">{requestData?.label}</span>
                </p>
                <p className="text-sm font-medium text-gray-700">
                  Montant: <span className="font-normal">{requestData?.amount?.toLocaleString()} FCFA</span>
                </p>
                {requestData?.dueDate && (
                  <p className="text-sm font-medium text-gray-700">
                    Date limite: <span className="font-normal">
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
                        disabled={updateMutation.isPending}
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
              disabled={updateMutation.isPending}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={updateMutation.isPending || !isFormInitialized}
              className="bg-green-500 hover:bg-green-600"
              onClick={form.handleSubmit(onSubmit)}
            >
              {updateMutation.isPending ? (
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