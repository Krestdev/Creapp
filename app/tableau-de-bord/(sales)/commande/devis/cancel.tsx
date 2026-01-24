"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog";
import { quotationQ } from "@/queries/quotation";
import { Quotation } from "@/types/types";
import { DialogDescription, DialogTitle } from "@radix-ui/react-dialog";
import { useMutation } from "@tanstack/react-query";
import React from "react";
import { toast } from "sonner";

interface Props {
  open: boolean;
  openChange: React.Dispatch<React.SetStateAction<boolean>>;
  quotation: Quotation;
}

function CancelQuotation({ open, openChange, quotation }: Props) {
  const { mutate, isPending } = useMutation({
    mutationFn: async () => quotationQ.cancel(quotation.id),
    onSuccess: () => {
      toast.success("Devis annulé avec succès !");
      openChange(false);
    },
    onError: (error) => {
      console.error(error);
      toast.error("Une erreur est survenue lors de l'annulation du devis.");
    },
  });
  return (
    <Dialog open={open} onOpenChange={openChange}>
      <DialogContent>
        <DialogHeader variant={"error"}>
          <DialogTitle>{"Annuler le devis"}</DialogTitle>
          <DialogDescription>{`Devis - ${quotation.ref}`}</DialogDescription>
        </DialogHeader>
        <p className="italic">{`Êtes-vous sûr de vouloir annuler ce devis ?`}</p>
        <DialogFooter>
          <Button
            onClick={() => mutate()}
            variant={"destructive"}
            disabled={isPending}
            isLoading={isPending}
          >
            {"Annuler le Devis"}
          </Button>
          <DialogClose asChild>
            <Button variant={"outline"} disabled={isPending}>
              {"Fermer"}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default CancelQuotation;
