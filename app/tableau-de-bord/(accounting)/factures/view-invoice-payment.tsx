"use client";
import { Badge, badgeVariants } from "@/components/ui/badge";
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
import { cn, XAF } from "@/lib/utils";
import { BonsCommande, Invoice, PAY_STATUS, PaymentRequest } from "@/types/types";
import { VariantProps } from "class-variance-authority";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import React from "react";

interface Props {
  invoice: Invoice;
  open: boolean;
  openChange: React.Dispatch<React.SetStateAction<boolean>>;
  purchases: Array<BonsCommande>;
}

function ViewInvoicePayment({ invoice, open, openChange, purchases }: Props) {
  const purchase = purchases.find((p) => p.id === invoice.commandId);

  const styles = (status: PaymentRequest["status"]):HTMLDivElement["className"] => {
    switch(status){
      case "cancelled":
        return "bg-gray-50 border-gray-200 text-gray-700";
      case "paid":
        return "bg-green-50 border-green-200 text-green-700";
      case "accepted" :
        return "bg-teal-50 border-teal-200 text-teal-700";
      case "validated":
        return "bg-green-50 border-green-200 text-green-700"; 
      case "rejected":
        return "bg-red-50 border-red-200 text-red-700";
      default :
      return "bg-amber-50 border-amber-200 text-amber-700"
    }
  };

  const badgePayment = (status: PaymentRequest["status"]):{label: string; variant: VariantProps<typeof badgeVariants>["variant"]} => {
    const label = PAY_STATUS.find(x=> x.value === status)?.name ?? status;
    switch (status) {
    case "pending":
      return { label, variant: "amber" };
    case "accepted":
      return { label, variant: "sky" };
    case "rejected":
      return { label, variant: "destructive" };
    case "cancelled":
      return { label, variant: "default" };
    case "validated":
      return { label, variant: "sky" };
    case "signed":
      return { label, variant: "lime" };
    case "paid":
      return { label, variant: "success" };
    default:
      return { label, variant: "outline" };
  }
  }

  return (
    <Dialog open={open} onOpenChange={openChange}>
      <DialogContent>
        <DialogHeader variant={"secondary"}>
          <DialogTitle>
            {`facture - ${invoice.title}`}
          </DialogTitle>
          <DialogDescription>{`Paiements de la facture de ${purchase?.devi.commandRequest.title ?? invoice.commandId}`}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-2.5">
          {
          !invoice.payments || invoice.payments.length === 0 ? 
          <div className="px-3 py-2 rounded-sm text-gray-600 text-sm">{"Aucun paiement enregistré sur cette facture."}</div>
        :
          invoice.payments.map((item, id)=>(
            <div key={id} className={cn("px-3 py-2 rounded-sm border flex flex-col gap-0.5", styles(item.status))}>
                <span className="text-sm font-bold">{XAF.format(item.price)}</span>
                <div className="flex flex-wrap gap-2 items-center">
                    <Badge variant={badgePayment(item.status).variant}>
                        {badgePayment(item.status).label}
                    </Badge>
                    <span className="text-xs text-gray-900">{format(new Date(item.createdAt), "dd MMM yyyy", {locale: fr})}</span>
                </div>
            </div>
          ))}
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

export default ViewInvoicePayment;
