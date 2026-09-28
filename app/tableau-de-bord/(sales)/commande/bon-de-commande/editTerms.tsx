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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { purchaseQ } from "@/queries/purchase-order";
import { BonsCommande, CommandCondition, RECEPTION_MODES } from "@/types/types";
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
  const [receptionMode, setReceptionMode] = React.useState<
    BonsCommande["receptionMode"]
  >(purchaseOrder.receptionMode);
  const [payDelay, setPayDelay] = React.useState(
    purchaseOrder.payDelay?.toString() ?? "0",
  );
  const [paymentTerms, setPaymentTerms] = React.useState(
    purchaseOrder.paymentTerms ?? "",
  );

  React.useEffect(() => {
    if (open) {
      setSelectedConditions(purchaseOrder.commandConditions);
      setReceptionMode(purchaseOrder.receptionMode);
      setPayDelay(purchaseOrder.payDelay?.toString() ?? "0");
      setPaymentTerms(purchaseOrder.paymentTerms ?? "");
    }
  }, [open, purchaseOrder]);

  const hasDelay = receptionMode === "FULL" || receptionMode === "PARTIAL";
  const payDelayValue = Number(payDelay);
  const isPayDelayValid =
    !hasDelay || (!Number.isNaN(payDelayValue) && payDelayValue >= 0);

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      purchaseQ.update(
        {
          ...purchaseOrder,
          conditions: selectedConditions.map((c) => c.id),
          receptionMode,
          payDelay: hasDelay ? payDelayValue : 0,
          isPayConditionedByReception: receptionMode !== "NONE",
          paymentTerms,
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
        <div className="grid gap-4">
          <div className="grid gap-1.5">
            <Label>{"Conditions du bon de commande"}</Label>
            <MultiSelectConditions
              display="Conditions"
              conditions={conditions}
              selected={selectedConditions}
              onChange={setSelectedConditions}
            />
          </div>
          <div className="grid gap-1.5">
            <Label>{"Condition de paiement"}</Label>
            <Select
              value={receptionMode}
              onValueChange={(v) =>
                setReceptionMode(v as BonsCommande["receptionMode"])
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sélectionnnez un mode" />
              </SelectTrigger>
              <SelectContent>
                {RECEPTION_MODES.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {hasDelay && (
            <div className="grid gap-1.5">
              <Label>{"Délai de paiement"}</Label>
              <Input
                type="number"
                value={payDelay}
                onChange={(e) => setPayDelay(e.target.value)}
                placeholder="ex. 30"
              />
              <p className="text-sm text-muted-foreground">
                {
                  "Nombre de jours aprés la livraison pour effectuer le paiement"
                }
              </p>
              {!isPayDelayValid && (
                <p className="text-sm font-medium text-destructive">
                  {"Veuillez saisir un délai valide"}
                </p>
              )}
            </div>
          )}
          <div className="grid gap-1.5">
            <Label>{"Conditions supplémentaires"}</Label>
            <Textarea
              value={paymentTerms}
              onChange={(e) => setPaymentTerms(e.target.value)}
              placeholder="Définissez les conditions relatives au bon de commande"
            />
          </div>
        </div>
        <DialogFooter>
          <div className="flex gap-3 w-full justify-end">
            <Button
              type="button"
              variant={"primary"}
              disabled={
                isPending ||
                selectedConditions.length === 0 ||
                !isPayDelayValid
              }
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
