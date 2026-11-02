"use client";
import { DeleteDialog } from "@/components/modals/delete-dialog";
import { serviceQ } from "@/queries/services";
import { Service } from "@/types/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React from "react";
import { toast } from "sonner";

interface Props {
  open: boolean;
  openChange: React.Dispatch<React.SetStateAction<boolean>>;
  service: Service;
}

function DeleteService({ open, openChange, service }: Props) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (id: number) => serviceQ.delete(id),
    onSuccess: () => {
      toast.success("Service supprimé avec succès !");
      queryClient.invalidateQueries({ queryKey: ["services"] });
      openChange(false);
    },
    onError: () => {
      toast.error("Erreur lors de la suppression du service.");
    },
  });

  return (
    <DeleteDialog
      open={open}
      onOpenChange={openChange}
      title={`Supprimer le service « ${service.label} » ?`}
      description="Cette action est irréversible. Tous les membres rattachés à ce service seront dissociés."
      confirmLabel="Supprimer le service"
      isPending={mutation.isPending}
      onConfirm={() => mutation.mutate(service.id)}
    />
  );
}

export default DeleteService;
