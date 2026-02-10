"use client";
import { badgeVariants } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BonDeCommande, BonsCommande, User } from "@/types/types";
import { VariantProps } from "class-variance-authority";
import React from "react";
import { BonDeCommandePDF } from "./BonDeCommandePDF";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { Button } from "@/components/ui/button";
import { BonDocument } from "./BonDoc";
import LoadingPage from "@/components/loading-page";
import ErrorPage from "@/components/error-page";
import { CommandConditionQ } from "@/queries/commandsConditions";
import { useQuery } from "@tanstack/react-query";

interface Props {
  open: boolean;
  openChange: React.Dispatch<React.SetStateAction<boolean>>;
  purchaseOrder: BonsCommande;
  users: Array<User>;
}

function ViewPurchase({ open, openChange, purchaseOrder, users }: Props) {
  // Vérifier si le bon de commande est rejeté
  const isRejected = purchaseOrder.status === "REJECTED";
  const conditions = useQuery({
    queryKey: ["conditions"],
    queryFn: () => CommandConditionQ.getAll(),
  });
  if (conditions.isLoading) return <LoadingPage />;
  if (conditions.error) return <ErrorPage />;
  if (conditions.isSuccess)

    return (
      <Dialog open={open} onOpenChange={openChange}>
        <DialogContent className="max-h-[750px] max-w-4xl! gap-0 overflow-hidden border-none flex flex-col">
          {/* Header with burgundy background */}
          <DialogHeader className="bg-[#8B1538] text-white mb-2 rounded-lg relative">
            <DialogTitle className="text-xl font-semibold text-white uppercase">
              {`Bon de commande - ${purchaseOrder.provider.name}`}
            </DialogTitle>
            <p className="text-sm text-white/80 mt-1">
              {"Informations relatives aux bons de commande"}
            </p>
          </DialogHeader>

          <div className="flex-1 pb-[68px] bg-white">
            <BonDeCommandePDF doc={purchaseOrder} conditions={conditions.data.data} />
          </div>

          {/* pdf here */}
          <DialogFooter className="shrink-0 sticky z-10 w-full bottom-0">
            {isRejected ? (
              // Si le statut est REJECTED, afficher simplement un bouton désactivé
              <Button
                variant={"primary"}
                disabled
                style={{ padding: "8px 12px" }}
              >
                Bon de commande rejeté
              </Button>
            ) : (
              // Si le statut n'est pas REJECTED, afficher le lien de téléchargement
              <PDFDownloadLink
                document={<BonDocument doc={purchaseOrder} conditions={conditions.data.data} />}
                fileName={`BonDeCommande_${purchaseOrder.reference}.pdf`}
              >
                {({ loading }) => (
                  <Button
                    variant={"primary"}
                    style={{ padding: "8px 12px", cursor: "pointer" }}
                  >
                    {loading ? "Préparation..." : "Télécharger le PDF"}
                  </Button>
                )}
              </PDFDownloadLink>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
}

export default ViewPurchase;