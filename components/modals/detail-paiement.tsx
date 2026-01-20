"use client";
import React from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  BonsCommande,
  PAY_STATUS,
  PAYMENT_METHOD,
  PaymentRequest,
} from "@/types/types";
import {
  Calendar,
  CalendarFold,
  DollarSign,
  FileIcon,
  HelpCircle,
  LucideAlarmClockPlus,
  LucideHash,
  SquareUser,
  User,
  Wallet,
} from "lucide-react";
import { VariantProps } from "class-variance-authority";
import { Badge, badgeVariants } from "../ui/badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { userQ } from "@/queries/baseModule";
import { Button } from "../ui/button";
import { XAF } from "@/lib/utils";
import Link from "next/link";
import { payTypeQ } from "@/queries/payType";
import { useQuery } from "@tanstack/react-query";

interface Props {
  payment: PaymentRequest;
  open: boolean;
  openChange: React.Dispatch<React.SetStateAction<boolean>>;
  purchases: Array<BonsCommande>;
}

function getStatusBadge(status: PaymentRequest["status"]): {
  label: string;
  variant: VariantProps<typeof badgeVariants>["variant"];
} {
  const statusData = PAY_STATUS.find((s) => s.value === status);
  const label = statusData?.name ?? "Inconnu";

  switch (status) {
    case "pending":
      return { label, variant: "amber" };
    case "validated":
      return { label, variant: "success" };
    case "rejected":
      return { label, variant: "destructive" };
    default:
      return { label, variant: "outline" };
  }
}

function DetailPaiement({ payment, open, openChange, purchases }: Props) {
  const getUsers = useQuery({ queryKey: ["users"], queryFn: userQ.getAll });
  const purchase = purchases.find((p) => p.id === payment.commandId);
  const getPaymentType = useQuery({
    queryKey: ["paymentType"],
    queryFn: payTypeQ.getAll,
  });

  return (
    <Dialog open={open} onOpenChange={openChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="uppercase">
            {purchase?.devi.commandRequest.title +
              " - " +
              purchase?.provider.name}
          </DialogTitle>
          <DialogDescription>{`Facture ${payment.reference}`}</DialogDescription>
        </DialogHeader>
        <div className="w-full grid grid-cols-3 gap-3"></div>
        {/**Reference */}
        <div className="view-group">
          <span className="view-icon">
            <LucideHash />
          </span>
          <div className="flex flex-col">
            <p className="view-group-title">{"Référence"}</p>
            <div className="w-fit bg-primary-100 flex items-center justify-center px-1.5 rounded">
              <p className="text-primary-600 text-sm">
                {payment.reference || "N/A"}
              </p>
            </div>
          </div>
        </div>
        {/**Fournisseur */}
        <div className="view-group">
          <span className="view-icon">
            <SquareUser />
          </span>
          <div className="flex flex-col">
            <p className="view-group-title">{"Fournisseur"}</p>
            <p className="font-semibold">
              {purchase?.provider.name ?? "Non défini"}
            </p>
          </div>
        </div>
        {/**Montant */}
        <div className="view-group">
          <span className="view-icon">
            <DollarSign />
          </span>
          <div className="flex flex-col">
            <p className="view-group-title">{"Montant"}</p>
            <p className="font-semibold">{XAF.format(payment.price)}</p>
          </div>
        </div>
        {/**Method */}
        <div className="view-group">
          <span className="view-icon">
            <Wallet />
          </span>
          <div className="flex flex-col">
            <p className="view-group-title">{"Méthode de paiement"}</p>
            <p className="font-semibold">
              {
                getPaymentType.data?.data.find(
                  (item) => item.id === payment.methodId,
                )?.label
              }
            </p>
          </div>
        </div>
        {/**Status */}
        <div className="view-group">
          <span className="view-icon">
            <HelpCircle />
          </span>
          <div className="flex flex-col">
            <p className="view-group-title">{"Statut"}</p>
            <Badge variant={getStatusBadge(payment.status).variant}>
              {getStatusBadge(payment.status).label}
            </Badge>
          </div>
        </div>
        {payment.status === "rejected" && (
          <div className="view-group">
            <span className="view-icon">
              <LucideAlarmClockPlus />
            </span>
            <div className="flex flex-col">
              <p className="view-group-title text-destructive">
                {"Motif du rejet"}
              </p>
              <p className="text-destructive">{payment.reason}</p>
            </div>
          </div>
        )}
        {/**Justificatif */}
        <div className="view-group">
          <span className="view-icon">
            <FileIcon />
          </span>
          <div className="flex flex-col">
            <p className="view-group-title">{"Justificatif"}</p>
            <Link
              href={`${
                process.env.NEXT_PUBLIC_API
              }/${payment.proof as string}`}
              target="_blank"
              className="flex gap-0.5 items-center"
            >
              <img
                src="/images/pdf.png"
                alt="justificatif"
                className="h-7 w-auto aspect-square"
              />
              <p className="text-foreground font-medium">
                {payment.proof ? "Document justificatif" : "Aucun justificatif"}
              </p>
            </Link>
          </div>
        </div>
        {/**Date limite */}
        <div className="view-group">
          <span className="view-icon">
            <CalendarFold />
          </span>
          <div className="flex flex-col">
            <p className="view-group-title">{"Date limite de paiement"}</p>
            <p className="font-semibold">
              {format(new Date(payment.deadline), "dd MMMM yyyy", {
                locale: fr,
              })}
            </p>
          </div>
        </div>
        {/**Created by */}
        <div className="view-group">
          <span className="view-icon">
            <User />
          </span>
          <div className="flex flex-col">
            <p className="view-group-title">{"Initié par"}</p>
            <p className="font-semibold">
              {getUsers.data?.data.find((u) => u.id === payment.userId)
                ?.firstName +
                " " +
                getUsers.data?.data.find((u) => u.id === payment.userId)
                  ?.lastName || "Non défini"}
            </p>
          </div>
        </div>
        {/**Created at */}
        <div className="view-group">
          <span className="view-icon">
            <Calendar />
          </span>
          <div className="flex flex-col">
            <p className="view-group-title">{"Créé le"}</p>
            <p className="font-semibold">
              {format(new Date(payment.createdAt), "dd MMMM yyyy", {
                locale: fr,
              })}
            </p>
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

export default DetailPaiement;
