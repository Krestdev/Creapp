"use client";

import { useMutation } from "@tanstack/react-query";
import React from "react";
import { toast } from "sonner";

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

import FilesUpload from "@/components/comp-547";
import { ReceptionCompletion, receptionQ } from "@/queries/reception";
import type { CommandRequestT, Quotation, Reception } from "@/types/types";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  open: boolean;
  onOpenChange: React.Dispatch<React.SetStateAction<boolean>>;
  reception: Reception;
  devis: Quotation[];
  cmdReqst: CommandRequestT[];
}

// Helpers
const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));
const safeNumber = (v: unknown) => {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
};

export default function UpdateReception({
  open,
  onOpenChange,
  reception,
  devis,
  cmdReqst,
}: Props) {
  const defaultFiles: Array<string> = reception?.Proof ? reception.Proof.split(";") : [];

  const [deliverables, setDeliverables] = React.useState<Reception["Deliverables"]>(
    reception?.Deliverables ?? [],
  );
  const [note, setNote] = React.useState<string>(reception.note);

  const [proof, setProof] = React.useState<Array<File | string> | null>(defaultFiles);

  React.useEffect(() => {
    if (open) setDeliverables(reception?.Deliverables ?? []);
  }, [open, reception]);

  const markReception = useMutation({
    mutationFn: ({ id, Deliverables, proof, note }: ReceptionCompletion) =>
      receptionQ.completeReception({ id, Deliverables, proof, note }),
    onSuccess: () => {
      toast.success("Réception mise à jour");
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error(error.message ?? "Une erreur est survenue");
    },
  });

  const updateDelivered = (index: number, nextDelivered: number) => {
    setDeliverables((prev) => {
      const copy = [...prev];
      const quota = safeNumber(copy[index]?.quantity); // quota depuis le devis (QuotationElement.quantity)
      const delivered = clamp(safeNumber(nextDelivered), 0, quota);
      copy[index] = { ...copy[index], delivered };
      return copy;
    });
  };

  const setAllDelivered = (mode: "FULL" | "ZERO") => {
    setDeliverables((prev) =>
      prev.map((d) => {
        const quota = safeNumber(d.quantity);
        return { ...d, delivered: mode === "FULL" ? quota : 0 };
      }),
    );
  };

  // --- KPIs / statut global ---
  const totalItems = deliverables.length;

  const completedItems = deliverables.filter((d) => safeNumber(d.delivered) >= safeNumber(d.quantity)).length;

  const totalQuota = deliverables.reduce((acc, d) => acc + safeNumber(d.quantity), 0);
  const totalDelivered = deliverables.reduce((acc, d) => acc + safeNumber(d.delivered), 0);

  const allCompleted = totalItems > 0 && completedItems === totalItems;
  const noneDelivered = totalItems === 0 ? true : deliverables.every((d) => safeNumber(d.delivered) <= 0);

  const receptionStatus: Reception["Status"] =
    totalItems === 0
      ? "PENDING"
      : allCompleted
        ? "COMPLETED"
        : noneDelivered
          ? "PENDING"
          : "PARTIAL";

  const submit = () => {
    // Si ton backend attend encore isDelivered, on l’envoie calculé,
    // mais la vérité reste delivered vs quota.
    const payloadDeliverables = deliverables.map((d) => {
      const quota = safeNumber(d.quantity);
      const delivered = clamp(safeNumber(d.delivered), 0, quota);
      return {
        ...d,
        delivered,
        isDelivered: delivered >= quota && quota > 0,
      };
    });

    markReception.mutate({
      id: reception.id,
      Deliverables: payloadDeliverables,
      proof: proof as Array<File>,
      note: note
    });
  };

  const devi = devis.find((d) => d.id === reception.Command?.deviId);
  const cmdReqs = cmdReqst.find((c) => c.id === (devi as any)?.commandRequestId); // adapte si besoin

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {cmdReqs?.title ?? "Non défini"}
          </DialogTitle>
          <DialogDescription>
            {`Compléter la réception — Statut: ${
              receptionStatus === "PENDING"
                ? "En attente"
                : receptionStatus === "PARTIAL"
                  ? "Partielle"
                  : "Complète"
            }`}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          {/* actions rapides */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-sm text-muted-foreground">
              {"Éléments : "}
              <span className="font-medium">{totalItems}</span>
              {" — Complétés : "}
              <span className="font-medium">{completedItems}</span>
              {" — Livré : "}
              <span className="font-medium">
                {totalDelivered} / {totalQuota}
              </span>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAllDelivered("FULL")}
                disabled={totalItems === 0 || allCompleted}
              >
                {"Tout recevoir"}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAllDelivered("ZERO")}
                disabled={totalItems === 0 || noneDelivered}
              >
                {"Tout remettre à 0"}
              </Button>
            </div>
          </div>

          {/* liste deliverables */}
          <div className="grid gap-2">
            {totalItems === 0 ? (
              <div className="text-sm text-muted-foreground">{"Aucun élément à réceptionner."}</div>
            ) : (
              deliverables.map((d, index) => {
                const quota = safeNumber(d.quantity);
                const delivered = clamp(safeNumber(d.delivered), 0, quota);
                const isCompleted = quota > 0 && delivered >= quota;

                return (
                  <div
                    key={d.id ?? index}
                    className="flex items-center justify-between gap-3 rounded-md border p-3"
                  >
                    <div className="min-w-0">
                      <p className="font-medium leading-5 line-clamp-1">
                        {d.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {isCompleted ? "Complété" : "Non complété"}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">{"Livré"}</span>
                      <div className="flex items-center gap-2">
                        <Input
                          className="w-[110px]"
                          type="number"
                          min={0}
                          max={quota}
                          step="1"
                          value={delivered}
                          onChange={(e) => updateDelivered(index, Number(e.target.value))}
                        />
                        <span className="text-sm text-muted-foreground">{`/ ${quota}`}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <FilesUpload
            value={proof}
            onChange={setProof}
            name="proof"
            acceptTypes="all"
            multiple={true}
            maxFiles={6}
          />
          <div className="grid gap-2">
            <Label>{"Note"}</Label>
            <Textarea value={note} onChange={(e)=>{setNote(e.target.value)}} placeholder="Commentaires sur la réception" />
          </div>

          {/* footer actions */}
          <DialogFooter>
            <Button
              type="button"
              variant="primary"
              onClick={submit}
              disabled={markReception.isPending || totalItems === 0}
              isLoading={markReception.isPending}
            >
              {"Enregistrer"}
            </Button>
            <DialogClose asChild>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {"Annuler"}
              </Button>
            </DialogClose>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
