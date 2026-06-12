"use client";
import { Badge } from "@/components/ui/badge";
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
import { queryKeys } from "@/lib/query-keys";
import {
  getPaymentPriorityBadge,
  getPurchaseStatusBadge,
  totalAmountPurchase,
  XAF,
} from "@/lib/utils";
import { payTypeQ } from "@/queries/payType";
import { BonsCommande, User } from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  BadgeInfoIcon,
  CalendarFoldIcon,
  CalendarIcon,
  CircleDollarSign,
  InfoIcon,
  ListOrderedIcon,
  LucideHash,
  MapPinIcon,
  MessageSquareWarningIcon,
  ScrollTextIcon,
  SquareAsteriskIcon,
  SquareUserRound,
  Wallet,
} from "lucide-react";
import React from "react";

interface Props {
  open: boolean;
  openChange: React.Dispatch<React.SetStateAction<boolean>>;
  purchaseOrder: BonsCommande;
  users: Array<User>;
}

function ViewPurchase({ open, openChange, purchaseOrder, users }: Props) {
  const getPaymentMethods = useQuery({
    queryKey: queryKeys.paymentTypes,
    queryFn: payTypeQ.getAll,
  });

  const priority = getPaymentPriorityBadge({
    priority: purchaseOrder.priority,
  });
  const status = getPurchaseStatusBadge(purchaseOrder.status);

  const paymentConditions = (purchase: BonsCommande): string => {
    switch (purchase.receptionMode) {
      case "FULL":
        return `(${purchase.payDelay}) jours après réception totale`;
      case "PARTIAL":
        return `(${purchase.payDelay}) jours après réception partielle ou totale`;
      default:
        return "À la commande";
    }
  };

  return (
    <Dialog open={open} onOpenChange={openChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {`Bon de commande - ${purchaseOrder.provider.name}`}
          </DialogTitle>
          <DialogDescription>
            {"Informations relatives aux bons de commande"}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 @min-[520px]/dialog:grid-cols-2 gap-3">
          <div className="view-group">
            <span className="view-icon">
              <LucideHash />
            </span>
            <div className="flex flex-col">
              <p className="view-group-title">{"Référence"}</p>
              <div className="w-fit bg-primary-100 flex items-center justify-center px-1.5 rounded">
                <p className="text-primary-600 text-sm">
                  {purchaseOrder.reference || "N/A"}
                </p>
              </div>
            </div>
          </div>
          {/**Object */}
          <div className="view-group">
            <span className="view-icon">
              <SquareAsteriskIcon />
            </span>
            <div className="flex flex-col">
              <p className="view-group-title">{"Objet"}</p>
              <p className="font-semibold">
                {purchaseOrder.object && purchaseOrder.object.trim() !== ""
                  ? purchaseOrder.object
                  : "N/A"}
              </p>
            </div>
          </div>
          {/**Provider */}
          <div className="view-group">
            <span className="view-icon">
              <SquareUserRound />
            </span>
            <div className="flex flex-col">
              <p className="view-group-title">{"Fournisseur"}</p>
              <p className="font-semibold">
                {purchaseOrder.provider.name || "N/A"}
              </p>
            </div>
          </div>
          {/**Amount */}
          <div className="view-group">
            <span className="view-icon">
              <CircleDollarSign />
            </span>
            <div className="flex flex-col">
              <p className="view-group-title">{"Montant"}</p>
              <p className="font-semibold">
                {`${XAF.format(totalAmountPurchase(purchaseOrder))} (HT: ${XAF.format(purchaseOrder.netToPay)})`}
              </p>
            </div>
          </div>
          {/**Payment Method */}
          <div className="view-group">
            <span className="view-icon">
              <Wallet />
            </span>
            <div className="flex flex-col">
              <p className="view-group-title">{"Moyen de paiement"}</p>
              <p className="font-semibold">
                {getPaymentMethods.data &&
                  getPaymentMethods.data.data.find(
                    (payType) =>
                      String(payType.id) === purchaseOrder.paymentMethod,
                  )?.label}
              </p>
            </div>
          </div>
          {/**Priority */}
          <div className="view-group">
            <span className="view-icon">
              <InfoIcon />
            </span>
            <div className="flex flex-col">
              <p className="view-group-title">{"Priorité"}</p>
              <Badge variant={priority.variant}>{priority.label}</Badge>
            </div>
          </div>
          {/**Deadline */}
          <div className="view-group">
            <span className="view-icon">
              <CalendarFoldIcon />
            </span>
            <div className="flex flex-col">
              <p className="view-group-title">{"Délai de livraison"}</p>
              <p className="font-semibold">
                {format(new Date(purchaseOrder.deliveryDelay), "dd MMMM yyyy", {
                  locale: fr,
                })}
              </p>
            </div>
          </div>
          {/**Created At */}
          <div className="view-group">
            <span className="view-icon">
              <CalendarIcon />
            </span>
            <div className="flex flex-col">
              <p className="view-group-title">{"Créé le"}</p>
              <p className="font-semibold">
                {format(new Date(purchaseOrder.createdAt), "dd MMMM yyyy, p", {
                  locale: fr,
                })}
              </p>
            </div>
          </div>
          {/**Updated At */}
          <div className="view-group">
            <span className="view-icon">
              <CalendarIcon />
            </span>
            <div className="flex flex-col">
              <p className="view-group-title">{"Modifié le"}</p>
              <p className="font-semibold">
                {format(new Date(purchaseOrder.updatedAt), "dd MMMM yyyy, p", {
                  locale: fr,
                })}
              </p>
            </div>
          </div>
          {/**Status */}
          <div className="view-group">
            <span className="view-icon">
              <BadgeInfoIcon />
            </span>
            <div className="flex flex-col">
              <p className="view-group-title">{"Statut"}</p>
              <Badge variant={status.variant}>{status.label}</Badge>
            </div>
          </div>
          {/**Requests */}
          <div className="view-group col-span-full">
            <span className="view-icon">
              <ScrollTextIcon />
            </span>
            <div className="w-full flex flex-col">
              <p className="view-group-title">{"Besoins"}</p>
              <div className="flex flex-col gap-1">
                {purchaseOrder.devi.commandRequest.besoins.map((r) => (
                  <div key={r.id} className="flex flex-col gap-0.5">
                    <p className="font-semibold">{r.label}</p>
                    <p className="text-sm text-primary-700">{`(x${r.quantity} ${r.unit})`}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/**Delivery Location */}
          <div className="view-group">
            <span className="view-icon">
              <MapPinIcon />
            </span>
            <div className="flex flex-col">
              <p className="view-group-title">{"Lieu de livraison"}</p>
              <p className="font-semibold">
                {purchaseOrder.deliveryLocation ?? "N/A"}
              </p>
            </div>
          </div>

          {/**Payment Conditions */}
          <div className="view-group">
            <span className="view-icon">
              <MessageSquareWarningIcon />
            </span>
            <div className="flex flex-col">
              <p className="view-group-title">{"Conditions de paiement"}</p>
              <p className="font-semibold">
                {paymentConditions(purchaseOrder)}
              </p>
            </div>
          </div>
          {/**Conditions */}
          <div className="view-group col-span-full">
            <span className="view-icon">
              <ListOrderedIcon />
            </span>
            <div className="w-full flex flex-col">
              <p className="view-group-title">
                {"Conditions du Bon de commande"}
              </p>
              <div className="grid gap-1">
                {purchaseOrder.commandConditions.map((c, id) => (
                  <div key={id}>
                    {/* <p className="font-semibold">{c.title}</p> */}
                    <p className="text-xs font-semibold">{c.content}</p>
                  </div>
                ))}
                {purchaseOrder.paymentTerms &&
                  purchaseOrder.paymentTerms.trim() !== "" && (
                    <div>
                      {/* <p className="font-semibold">{"Conditions additionnelles"}</p> */}
                      <p className="text-xs font-semibold">
                        {purchaseOrder.paymentTerms}
                      </p>
                    </div>
                  )}
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant={"outline"}>{"Fermer"}</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ViewPurchase;
