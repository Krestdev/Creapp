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
import { userQ } from "@/queries/baseModule";
import { AddFileProps, purchaseQ } from "@/queries/purchase-order";
import { BonsCommande } from "@/types/types";
import { PDFViewer } from "@react-pdf/renderer";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import React from "react";
import { toast } from "sonner";
import { BonDocument } from "./BonDoc";

interface Props {
  open: boolean;
  openChange: React.Dispatch<React.SetStateAction<boolean>>;
  purchaseOrder: BonsCommande;
}

function AddSignedFile({ open, openChange, purchaseOrder }: Props) {
  const saleUserId = purchaseOrder.devi.userId;
  const saleSignature = useQuery({
    queryKey: ["signature", saleUserId],
    queryFn: () => userQ.getSignature(saleUserId || 0),
    enabled: !!saleUserId,
  });
  const validatorSignature = useQuery({
    queryKey: ["signature", purchaseOrder.validator?.userId],
    queryFn: () => userQ.getSignature(purchaseOrder.validator?.userId || 0),
    enabled: !!purchaseOrder.validator?.userId,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: ({ id, proof }: AddFileProps) =>
      purchaseQ.addFile({ id, proof }),
    onSuccess: () => {
      toast.success(
        "Votre bon de commande signé a été enregistré avec succès !",
      );
      openChange(false);
    },
    onError: (error: Error) => {
      toast.error(error.message ?? "Une erreur est survenue");
    },
  });

  function onSubmit(file: File) {
    const value = file;
    if (!value)
      return toast.error("Veuillez insérer le bon de commande signé !");
    mutate({ id: purchaseOrder.id, proof: value });
  }

  return (
    <Dialog open={open} onOpenChange={openChange}>
      <DialogContent>
        <DialogHeader variant={"secondary"}>
          <DialogTitle>{`Télécharger le bon signé - ${
            purchaseOrder.devi.commandRequest.title
          }`}</DialogTitle>
          <DialogDescription>
            {"Génération du bon de commande signé"}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          {saleSignature.isLoading ? (
            <p>
              <Loader2 className="animate-spin" />
              {"Chargement de votre signature"}
            </p>
          ) : (
            !saleSignature.data && (
              <p>
                {
                  "Vous n'avez pas de signature, veuillez l'ajouter dans votre profil"
                }
              </p>
            )
          )}
          {validatorSignature.isLoading ? (
            <p>
              <Loader2 className="animate-spin" />
              {"Chargement de la signature du validateur"}
            </p>
          ) : (
            !validatorSignature.data && (
              <p>
                {
                  "Le validateur n'a pas de signature, veuillez l'ajouter dans son profil"
                }
              </p>
            )
          )}
          {!!validatorSignature.data && !!saleSignature.data && (
            <PDFViewer>
              <BonDocument
                doc={purchaseOrder}
                signature={`${process.env.NEXT_PUBLIC_API}/${saleSignature.data.path}`}
                validatorSignature={`${process.env.NEXT_PUBLIC_API}/${validatorSignature.data.path}`}
              />
            </PDFViewer>
          )}
        </div>
        <DialogFooter>
          <Button
            type="submit"
            variant={"primary"}
            disabled={
              isPending || !saleSignature.data || !validatorSignature.data
            }
            isLoading={isPending}
          >
            {"Enregistrer"}
          </Button>
          <Button
            onClick={(e) => {
              e.preventDefault();
              openChange(false);
            }}
            variant={"outline"}
          >
            {"Annuler"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default AddSignedFile;
