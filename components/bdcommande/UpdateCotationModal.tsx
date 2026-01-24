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
import { requestQ } from "@/queries/requestModule";
import { useMutation, useQuery } from "@tanstack/react-query";
import { CommandRequestT, RequestModelT } from "@/types/types";
import { useStore } from "@/providers/datastore";
import { toast } from "sonner";
import { SuccessModal } from "@/components/modals/success-modal";
import MultiSelectUsers from "@/components/base/multiSelectUsers";
import Besoins from "./besoins";
import { commandRqstQ } from "@/queries/commandRqstModule";

const formSchema = z.object({
  name: z.string().min(1, "Le nom est obligatoire"),
  telephone: z
    .string()
    .min(1, "Le numéro de téléphone est obligatoire")
    .refine((val) => !isNaN(Number(val)), {
      message: "Le numéro de téléphone doit contenir uniquement des chiffres",
    }),
  titre: z.string().min(1, "Le titre est obligatoire"),
  requests: z.array(z.number()).min(1, {
    message: "Veuillez sélectionner au moins un besoin",
  }),
  date_limite: z.coerce.date(),
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
  allCommands: CommandRequestT[] | undefined;
}

export function UpdateCotationModal({
  open,
  onOpenChange,
  commandId,
  onSuccess,
  commandData,
}: UpdateCotationModalProps) {
  const [selected, setSelected] = useState<Request[]>([]);
  const [dataSup, setDataSup] = useState<RequestModelT[] | undefined>();
  const [successOpen, setSuccessOpen] = useState(false);
  const { user } = useStore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      telephone: "",
      titre: "",
      requests: [],
      date_limite: new Date(),
    },
  });

  // Mutation pour la mise à jour
  const updateCommand = useMutation({
    mutationFn: (data: Partial<CommandRequestT>) =>
      commandRqstQ.update(commandId, data),
    onSuccess: () => {
      toast.success("Demande de cotation mise à jour avec succès");
      setSuccessOpen(true);
      onSuccess?.();

      // Fermer la modal
      setTimeout(() => {
        onOpenChange(false);
      }, 100);
    },
    onError: (error) => {
      toast.error("Erreur lors de la mise à jour de la demande");
      console.error("Update error:", error);
    },
  });

  const requestData = useQuery({
    queryKey: ["requests"],
    queryFn: () => requestQ.getAll(),
    enabled: open,
  });

  // Calculer les besoins disponibles avec useMemo
  const availableRequests = React.useMemo(() => {
    if (!open) return [];
    return (requestData.data?.data || [])
      .filter((item) => item.state === "validated")
      .map((item) => ({
        id: item.id,
        name: item.label,
        dueDate: item.dueDate,
      }));
  }, [open, requestData.data?.data]);

  // Effet pour initialiser les données quand la modal s'ouvre
  React.useEffect(() => {
    if (!open || !commandData || !availableRequests.length) return;

    // Calculer les données initiales
    const selectedRequests =
      commandData.besoins?.map((b) => ({
        id: b.id,
        name: b.label,
        dueDate: b.dueDate,
      })) || [];

    const dataSupData = commandData.besoins || [];

    // Mettre à jour les états
    setSelected(selectedRequests);
    setDataSup(dataSupData);

    // Reset du formulaire
    form.reset({
      name: commandData.name || "",
      telephone: commandData.phone || "",
      titre: commandData.title || "",
      requests: selectedRequests.map((r) => r.id),
      date_limite: commandData.dueDate
        ? new Date(commandData.dueDate)
        : new Date(),
    });
  }, [open, commandData, availableRequests.length, form]);

  // Effet pour nettoyer les états quand la modal se ferme
  React.useEffect(() => {
    if (!open) {
      // Réinitialiser les états
      setSelected([]);
      setDataSup(undefined);
      form.reset({
        name: "",
        telephone: "",
        titre: "",
        requests: [],
        date_limite: new Date(),
      });
    }
  }, [open, form]);

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
      },
    );
  };

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    try {
      const data: Partial<CommandRequestT> = {
        name: values.name,
        phone: values.telephone,
        title: values.titre,
        requests: selected.map((item) => item.id),
        dueDate: values.date_limite,
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

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[80vw]! w-full max-h-[90vh] p-0 overflow-hidden">
          <DialogHeader className="bg-[#8B1538] text-white p-6 m-4 rounded-lg pb-8 relative shrink-0">
            <DialogTitle className="text-xl font-semibold text-white">
              {"Modifier la demande de cotation"}
            </DialogTitle>
            <DialogDescription className="text-sm text-white/80 mt-1">
              {"Modifiez les informations de la demande de cotation"}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-row flex-1 overflow-y-auto gap-4 p-6">
            {/* Formulaire */}
            <div className="w-1/3">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(handleSubmit)}
                  className="space-y-8"
                >
                  <FormField
                    control={form.control}
                    name="titre"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Titre</FormLabel>
                        <FormControl className="w-full">
                          <Input
                            placeholder="ex. Fournitures pour Cédric et Samuel en Papier et stylos"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* <FormField
                    control={form.control}
                    name="requests"
                    render={() => (
                      <FormItem>
                        <FormLabel>{"Besoins"}</FormLabel>
                        <FormControl className="h-fit">
                          <MultiSelectUsers
                            display="request"
                            users={availableRequests}
                            selected={selected}
                            onChange={handleRequestsChange}
                            className="w-full h-9"
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
                  /> */}

                  <FormField
                    control={form.control}
                    name="date_limite"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>{"Date limite de soumission"}</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl className="w-full">
                              <Button
                                type="button"
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground",
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Choisir une date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex flex-col gap-4 border rounded-md bg-gray-50 p-4">
                    <h2>{"Contact pricipal"}</h2>

                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom</FormLabel>
                          <FormControl className="w-[320px]">
                            <Input placeholder="ex. Cédric" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="telephone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Numéro de téléphone</FormLabel>
                          <FormControl className="w-[320px]">
                            <Input
                              placeholder="ex. 06 12 34 56 78"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Boutons d'action */}
                  <div className="flex justify-end gap-4 pt-4 border-t shrink-0">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancel}
                      disabled={updateCommand.isPending}
                    >
                      Annuler
                    </Button>
                    <Button
                      type="submit"
                      disabled={
                        updateCommand.isPending || !form.formState.isDirty
                      }
                    >
                      {updateCommand.isPending
                        ? "Mise à jour..."
                        : "Mettre à jour"}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>

            {/* Liste des besoins sélectionnés */}
            <div className="w-2/3">
              <div className="flex flex-col gap-4 w-full border border-gray-200 rounded-md p-4 h-full">
                <div className="flex justify-between items-center">
                  <p className="text-[18px] font-semibold">
                    {`Besoins sélectionnés (${selected.length})`}
                    <span className="text-sm font-normal text-muted-foreground ml-2">
                      {`sur ${availableRequests.length} disponibles`}
                    </span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {"Cliquez sur un besoin pour le retirer"}
                  </p>
                </div>
                <Besoins
                  selected={selected}
                  setSelected={setSelected}
                  dataSup={dataSup}
                />
              </div>
            </div>
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
