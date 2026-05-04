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
import { requestQ } from "@/queries/requestModule";
import { RequestModelT } from "@/types/types";
import { useMutation } from "@tanstack/react-query";
import React from "react";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: React.Dispatch<React.SetStateAction<boolean>>;
  data: RequestModelT;
}

function TerminateRequest({ open, onOpenChange, data }: Props) {
  const process = useMutation({
    mutationFn: (decision: "APPROVED" | "REJECTED") =>
      requestQ.validateServiceRequests(data.id, decision),
    onSuccess: () => {
      onOpenChange(false);
      toast.success("Besoin traité avec succès");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{"Traitement du besoin"}</DialogTitle>
          <DialogDescription>{data.label}</DialogDescription>
        </DialogHeader>
        <p className="py-2 text-sm">
          Cette action est irréversible. Veuillez vous assurer d'avoir pris la
          décision correcte et que les informations à traiter sont exactes.
        </p>
        <DialogFooter>
          <Button
            variant={"success"}
            onClick={() => process.mutate("APPROVED")}
            disabled={process.isPending}
            isLoading={process.isPending}
          >
            {"Approuver le besoin"}
          </Button>
          <Button
            variant={"destructive"}
            onClick={() => process.mutate("REJECTED")}
            disabled={process.isPending}
            isLoading={process.isPending}
          >
            {"Rejeter le besoin"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default TerminateRequest;
