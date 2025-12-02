"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon } from "lucide-react";
import { RequestQueries } from "@/queries/requestModule";
import { useMutation, useQuery } from "@tanstack/react-query";
import { CommandQueries } from "@/queries/commandModule";
import { CommandRequestT } from "@/types/types";
import { useStore } from "@/providers/datastore";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import MultiSelectUsers from "@/components/base/multiSelectUsers";
import { toast } from "sonner";
import { SuccessModal } from "@/components/modals/success-modal";

const formSchema = z.object({
  titre: z.string().min(1, "Le titre est obligatoire"),
  requests: z.array(z.number()).min(1, {
    message: "Veuillez sélectionner au moins un besoin",
  }),
  date_limite: z.coerce.date(),
  modality: z.string().optional(),
  justification: z.string().optional(),
  state: z.enum(["pending", "validated", "rejected", "in-review", "cancel"]),
});

interface Request {
  id: number;
  name: string;
  dueDate?: Date;
}

interface UpdateCotationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  commandId: number;
  commandData?: CommandRequestT;
  onSuccess?: () => void;
}

export function UpdateCotationModal({
  open,
  onOpenChange,
  commandId,
  onSuccess,
}: UpdateCotationModalProps) {
  const { user } = useStore();
  const [selected, setSelected] = useState<Request[]>([]);
  const [successOpen, setSuccessOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      titre: "",
      requests: [],
      date_limite: new Date(),
      modality: "",
      justification: "",
      state: "pending",
    },
  });

  const command = new CommandQueries();

  // Récupérer les données de la commande
  const commandDetails = useQuery({
    queryKey: ["command", commandId],
    queryFn: () => command.getOne(commandId),
    enabled: !!commandId && open,
  });

  // Mutation pour la mise à jour
  const updateCommand = useMutation({
    mutationKey: ["update-command", commandId],
    mutationFn: (data: Partial<CommandRequestT>) =>
      command.update(commandId, data),
    onSuccess: () => {
      toast.success("Demande de cotation mise à jour avec succès");
      setSuccessOpen(true);
      commandDetails.refetch();
      onSuccess?.();
    },
    onError: (error) => {
      toast.error("Erreur lors de la mise à jour de la demande");
      console.error("Update error:", error);
    },
  });

  const request = new RequestQueries();
  const requestData = useQuery({
    queryKey: ["requests"],
    queryFn: () => request.getAll(),
    enabled: open,
  });

  const commandData = useQuery({
    queryKey: ["commands"],
    queryFn: async () => command.getAll(),
    enabled: open,
  });

  // Initialiser le formulaire
  React.useEffect(() => {
    if ((commandDetails.data?.data || commandData) && open) {
      const data = commandDetails.data?.data;

      if (data) {
        // Transformer les besoins sélectionnés
        const selectedRequests =
          data.besoins?.map((besoin) => ({
            id: besoin.id,
            name: besoin.label || besoin.label || `Besoin ${besoin.id}`,
            dueDate: besoin.dueDate,
          })) || [];

        setSelected(selectedRequests);

        form.reset({
          titre: data.title || "",
          requests: selectedRequests.map((r) => r.id),
          date_limite: data.dueDate ? new Date(data.dueDate) : new Date(),
          modality: data.modality || "",
          justification: data.justification || "",
          state: data.state as
            | "pending"
            | "validated"
            | "rejected"
            | "in-review"
            | "cancel"
            | undefined,
        });

        setIsLoading(false);
      }
    }
  }, [commandDetails.data, commandData, open, form]);

  // Fonction pour gérer la sélection des besoins
  const handleRequestsChange = (list: Request[]) => {
    setSelected(list);
    form.setValue(
      "requests",
      list.map((u) => u.id),
      {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      }
    );
  };

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    try {
      const data: Partial<CommandRequestT> = {
        title: values.titre,
        requests: values.requests,
        dueDate: values.date_limite,
        modality: values.modality,
        justification: values.justification,
        state: values.state,
        updatedAt: new Date(),
      };

      updateCommand.mutate(data);
    } catch (error) {
      console.error("Form submission error", error);
      toast.error("Erreur lors de la soumission du formulaire");
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  const handleSuccess = () => {
    onOpenChange(false);
    onSuccess?.();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[70vw]! w-full max-h-[90vh] p-0 overflow-hidden">
          <DialogHeader className="bg-[#8B1538] text-white p-6 m-4 rounded-lg pb-8 relative shrink-0">
            <DialogTitle className="text-xl font-semibold text-white">
              {"Modifier la demande de cotation"}
            </DialogTitle>
            <p className="text-sm text-white/80 mt-1">
              {"Modifiez les informations de la demande de cotation"}
            </p>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
            {/* Formulaire */}
            <div>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(handleSubmit)}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Titre */}
                    <FormField
                      control={form.control}
                      name="titre"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Titre *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="ex. Fournitures pour Cédric et Samuel"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Date limite */}
                    <FormField
                      control={form.control}
                      name="date_limite"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Date limite de livraison *</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  type="button"
                                  variant={"outline"}
                                  className={cn(
                                    "pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "dd/MM/yyyy")
                                  ) : (
                                    <span>Choisir une date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => date < new Date()}
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Modalité */}
                    <FormField
                      control={form.control}
                      name="modality"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Modalité</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Modalité de paiement ou livraison"
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Statut */}
                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Statut</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner un statut" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="pending">
                                En attente
                              </SelectItem>
                              <SelectItem value="validated">Validé</SelectItem>
                              <SelectItem value="in-review">
                                En révision
                              </SelectItem>
                              <SelectItem value="rejected">Refusé</SelectItem>
                              <SelectItem value="cancel">Annulé</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Besoins */}
                    <FormField
                      control={form.control}
                      name="requests"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Besoins *</FormLabel>
                          <FormControl>
                            <MultiSelectUsers
                              display="request"
                              users={[]} // Vous devrez passer les données réelles ici
                              selected={selected}
                              onChange={handleRequestsChange}
                              className="w-full"
                            />
                          </FormControl>
                          <FormDescription>
                            {selected.length > 0
                              ? `${selected.length} besoin(s) sélectionné(s)`
                              : "Aucun besoin sélectionné"}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Justification */}
                    <FormField
                      control={form.control}
                      name="justification"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Justification</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Justification de la demande..."
                              className="min-h-20"
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </form>
              </Form>
            </div>

            {/* Liste des besoins sélectionnés */}
            <div  className="lg:col-span-2">
              <div className="border border-gray-200 rounded-lg p-4 h-full">
                <div className="flex justify-between items-center mb-4">
                  <p className="text-lg font-semibold">
                    {`Besoins sélectionnés (${selected.length})`}
                  </p>
                  <div className="space-y-2">
                    {selected.map((request) => (
                      <div
                        key={request.id}
                        className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50"
                      >
                        <div>
                          <p className="font-medium text-sm">{request.name}</p>
                          {request.dueDate && (
                            <p className="text-xs text-muted-foreground">
                              Échéance: {format(request.dueDate, "dd/MM/yyyy")}
                            </p>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newSelected = selected.filter(
                              (r) => r.id !== request.id
                            );
                            handleRequestsChange(newSelected);
                          }}
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                    {selected.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">
                        Aucun besoin sélectionné
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex justify-end gap-4 p-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={updateCommand.isPending}
            >
              Annuler
            </Button>
            <Button
              type="button"
              onClick={form.handleSubmit(handleSubmit)}
              disabled={updateCommand.isPending || !form.formState.isDirty}
            >
              {updateCommand.isPending ? "Mise à jour..." : "Mettre à jour"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de succès */}
      <SuccessModal
        open={successOpen}
        onOpenChange={setSuccessOpen}
        message="Demande de cotation mise à jour avec succès."
      />
    </>
  );
}
