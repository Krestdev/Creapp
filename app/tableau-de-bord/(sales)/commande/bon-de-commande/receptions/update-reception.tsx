"use client";

import React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

import { ReceptionCompletion, ReceptionQuery } from "@/queries/reception";
import type { Reception } from "@/types/types";
import FilesUpload from "@/components/comp-547";

interface Props {
  open: boolean;
  onOpenChange: React.Dispatch<React.SetStateAction<boolean>>;
  reception: Reception;
}

export default function UpdateReception({
  open,
  onOpenChange,
  reception,
}: Props) {
  const queryClient = useQueryClient();
  const receptionQuery = new ReceptionQuery();

  // local state (tu évites de modifier l’objet reception direct)
  const [deliverables, setDeliverables] = React.useState<
    Reception["Deliverables"]
  >(reception?.Deliverables ?? []);
  const [proof, setProof] = React.useState<Array<File | string>| null>([]);

  React.useEffect(() => {
    // reset quand on ouvre / change de réception
    if (open) setDeliverables(reception?.Deliverables ?? []);
  }, [open, reception]);

  //const status = computeStatus(deliverables);

  const markReception = useMutation({
    mutationFn: ({ id, Deliverables }: ReceptionCompletion) =>
      receptionQuery.completeReception({ id, Deliverables }),
    onSuccess: () => {
      toast.success("Réception mise à jour");
      onOpenChange(false);
      // adapte la clé à ta query réelle
      queryClient.invalidateQueries({ queryKey: ["receptions"] });
    },
    onError: (error: Error) => {
      toast.error(error.message ?? "Une erreur est survenue");
    },
  });

  const toggleDeliverable = (index: number, next: boolean) => {
    setDeliverables((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], state: next };
      return copy;
    });
  };

  const allChecked =
    deliverables.length > 0 && deliverables.every((d) => d.state);
  const noneChecked = deliverables.every((d) => !d.state);

  const setAll = (value: boolean) => {
    setDeliverables((prev) => prev.map((d) => ({ ...d, state: value })));
  };

  const submit = () => {
    markReception.mutate({
      id: reception.id,
      Deliverables: deliverables,
      proof: proof?.[0] instanceof File ? proof[0] as File : undefined,
    });
  };

  const title =
    reception.Command?.devi?.commandRequest?.title ??
    reception.Command?.devi?.commandRequest?.title ??
    "Non défini";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between gap-2">
            {title}
          </DialogTitle>
          <DialogDescription>{"Compléter la réception"}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          {/* actions rapides */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-sm text-muted-foreground">
              {"Total : "}
              <span className="font-medium">{deliverables.length}</span>
              {" — Reçus : "}
              <span className="font-medium">
                {deliverables.filter((d) => d.state).length}
              </span>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAll(true)}
                disabled={deliverables.length === 0 || allChecked}
              >
                {"Tout reçu"}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAll(false)}
                disabled={deliverables.length === 0 || noneChecked}
              >
                {"Tout annuler"}
              </Button>
            </div>
          </div>

          {/* liste deliverables */}
          <div className="grid gap-2">
            {deliverables.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                {"Aucun élément à réceptionner."}
              </div>
            ) : (
              deliverables.map((d, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between gap-3 rounded-md border p-3"
                >
                  <div className="min-w-0">
                    <p className="font-medium leading-5 line-clamp-1">
                      {`${d.title} - ${d.quantity} ${d.unit}`}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {d.state ? "Reçu" : "Non reçu"}
                    </span>
                    <Switch
                      checked={!!d.state}
                      onCheckedChange={(val) => toggleDeliverable(index, val)}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
          <FilesUpload
            value={proof}
            onChange={setProof}
            name="proof"
            acceptTypes="images"
            multiple={false}
            maxFiles={1}
          />

          {/* footer actions */}
          <DialogFooter>
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                {"Annuler"}
              </Button>
            </DialogClose>
            <Button
              type="button"
              variant="primary"
              onClick={submit}
              disabled={markReception.isPending || deliverables.length === 0}
              isLoading={markReception.isPending}
            >
              {"Enregistrer"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
