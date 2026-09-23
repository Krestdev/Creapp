"use client";
import MultiSelectConditions from "@/components/base/multiSelectConditions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { purchaseQ } from "@/queries/purchase-order";
import { BonsCommande, CommandCondition } from "@/types/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React from "react";
import { toast } from "sonner";

interface Props {
  open: boolean;
  openChange: React.Dispatch<React.SetStateAction<boolean>>;
  purchaseOrder: BonsCommande;
  conditions: Array<CommandCondition>;
}

function EditTerms({ open, openChange, purchaseOrder, conditions }: Props) {
  const queryClient = useQueryClient();
  const [selectedConditions, setSelectedConditions] = React.useState<
    CommandCondition[]
  >(purchaseOrder.commandConditions);

  React.useEffect(() => {
    if (open) {
      setSelectedConditions(purchaseOrder.commandConditions);
    }
  }, [open, purchaseOrder]);

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      purchaseQ.update(
        {
          ...purchaseOrder,
          conditions: selectedConditions.map((c) => c.id),
        },
        purchaseOrder.id,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries();
      toast.success("Les conditions du bon de commande ont été mises à jour !");
      openChange(false);
    },
    onError: (error: Error) => {
      toast.error(error.message ?? "Une erreur est survenue");
    },
  });

  return (
    <Dialog open={open} onOpenChange={openChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader variant={"secondary"}>
          <DialogTitle>{`Bon de commande - ${
            purchaseOrder?.provider?.name || "Non défini"
          }`}</DialogTitle>
          <DialogDescription>
            {"Modifier uniquement les conditions du bon de commande"}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          <MultiSelectConditions
            display="Conditions"
            conditions={conditions}
            selected={selectedConditions}
            onChange={setSelectedConditions}
          />
        </div>
        <DialogFooter>
          <div className="flex gap-3 w-full justify-end">
            <Button
              type="button"
              variant={"primary"}
              disabled={isPending || selectedConditions.length === 0}
              isLoading={isPending}
              onClick={() => mutate()}
            >
              {"Modifier"}
            </Button>
            <DialogClose asChild>
              <Button variant={"outline"}>{"Annuler"}</Button>
            </DialogClose>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default EditTerms;
