"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
    <Dialog open={open} onOpenChange={openChange}>
      <DialogContent>
        <DialogHeader variant={"error"}>
          <DialogTitle>{"Supprimer le service"}</DialogTitle>
        </DialogHeader>

        <p className="text-foreground text-sm">
          {"Êtes-vous sûr de vouloir supprimer le service "}
          <span className="font-semibold">{`"${service.label}"`}</span>
          {" ?"}
        </p>
        <p className="text-muted-foreground text-sm">
          {
            "Cette action est irréversible. Tous les membres rattachés à ce service seront dissociés."
          }
        </p>

        <DialogFooter>
          <Button
            variant={"destructive"}
            onClick={() => mutation.mutate(service.id)}
            disabled={mutation.isPending}
            isLoading={mutation.isPending}
          >
            {"Supprimer"}
          </Button>
          <DialogClose asChild>
            <Button variant="outline">{"Annuler"}</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default DeleteService;
