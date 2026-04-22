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
import { BonsCommande, User } from "@/types/types";
import { pdf } from "@react-pdf/renderer";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import { BonDocument } from "./BonDoc";
import { CrossPlatformPDFViewer } from "@/components/cross-view-pdf";

interface Props {
  open: boolean;
  openChange: React.Dispatch<React.SetStateAction<boolean>>;
  purchaseOrder: BonsCommande;
  users: User[];
}

function AddSignedFile({ open, openChange, purchaseOrder, users }: Props) {
  const [isGenerating, setIsGenerating] = useState(false);
  /**Responsable Achat */
  const saleUserId = purchaseOrder.devi.userId;
  /**Responsable Validation */
  const validatorUserId = purchaseOrder.validators?.userId;

  const saleUser = users.find((u) => u.id === saleUserId);
  const validatorUser = users.find((u) => u.id === validatorUserId);
  /**Fetch Signature */
  const saleSignature = useQuery({
    queryKey: ["signature", saleUserId],
    queryFn: () => userQ.getSignature(saleUserId),
  });
  const validatorSignature = useQuery({
    queryKey: ["signature", validatorUserId],
    queryFn: () => userQ.getSignature(validatorUserId ?? 0),
    enabled: !!validatorUserId,
  });

  React.useEffect(() => {
    if (!!validatorSignature.data) {
      console.log(
        `image : ${process.env.NEXT_PUBLIC_API}/${validatorSignature.data.path}`,
      );
    }
    if (!!saleSignature.data) {
      console.log(
        `image2 : ${process.env.NEXT_PUBLIC_API}/${saleSignature.data.path}`,
      );
    }
  }, [saleSignature.data, validatorSignature.data]);

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

  async function handleSave() {
    if (!saleSignature.data || !validatorSignature.data) return;

    try {
      setIsGenerating(true);
      const blob = await pdf(
        <BonDocument
          doc={purchaseOrder}
          signature={`${process.env.NEXT_PUBLIC_API}/${saleSignature.data.path}`}
          validatorSignature={`${process.env.NEXT_PUBLIC_API}/${validatorSignature.data.path}`}
        />,
      ).toBlob();

      const fileName = `Bon_de_commande_${purchaseOrder.devi.commandRequest.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.pdf`;
      const file = new File([blob], fileName, { type: "application/pdf" });

      mutate(
        { id: purchaseOrder.id, proof: file },
        {
          onSuccess: () => {
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
          },
        },
      );
    } catch (error) {
      toast.error("Erreur lors de la génération du PDF");
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={openChange}>
      <DialogContent className="sm:max-w-3xl">
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
              <p className="text-destructive">
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
              <p className="text-destructive">
                {
                  "Le validateur n'a pas de signature, veuillez l'ajouter dans son profil"
                }
              </p>
            )
          )}
          {!!validatorSignature.data && !!saleSignature.data && (
            <CrossPlatformPDFViewer
              document={
                <BonDocument
                  doc={purchaseOrder}
                  signature={`${process.env.NEXT_PUBLIC_API}/${saleSignature.data.path}`}
                  validatorSignature={`${process.env.NEXT_PUBLIC_API}/${validatorSignature.data.path}`}
                  signatureUser={saleUser}
                  validatorUser={validatorUser}
                />
              }
              fileName={`Bon_de_commande_${purchaseOrder.devi.commandRequest.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.pdf`}
              style={{ width: "100%", height: "500px" }}
            />
          )}
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant={"primary"}
            onClick={handleSave}
            disabled={
              isPending ||
              isGenerating ||
              !saleSignature.data ||
              !validatorSignature.data
            }
            isLoading={isPending || isGenerating}
          >
            {"Enregistrer et Télécharger"}
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
