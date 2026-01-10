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
import { useFetchQuery } from "@/hooks/useData";
import { XAF } from "@/lib/utils";
import { userQ } from "@/queries/baseModule";
import {
  BonsCommande,
  PAY_STATUS,
  PAYMENT_METHOD,
  PaymentRequest,
} from "@/types/types";
import { VariantProps } from "class-variance-authority";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Calendar,
  CalendarFold,
  DollarSign,
  FileIcon,
  HelpCircle,
  LucideHash,
  SquareUser,
  User,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import React from "react";

interface Props {
  open: boolean;
  openChange: React.Dispatch<React.SetStateAction<boolean>>;
  payment: PaymentRequest;
  purchases: Array<BonsCommande>;
}

function getStatusBadge(status: PaymentRequest["status"]): {
  label: string;
  variant: VariantProps<typeof badgeVariants>["variant"];
} {
  const statusData = PAY_STATUS.find((s) => s.value === status);
  const label = statusData?.name ?? "Inconnu";

  switch (status) {
    case "paid":
      return { label, variant: "success" };
    case "validated":
      return { label: "Non payé", variant: "destructive" };
    default:
      return { label, variant: "outline" };
  }
}

function ViewExpense({ open, openChange, payment, purchases }: Props) {
  const getUsers = useFetchQuery(["users"], userQ.getAll, 50000);
  const purchase = purchases.find((p) => p.id === payment.commandId);
  return (
    <Dialog open={open} onOpenChange={openChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader variant={"default"}>
          <DialogTitle>{`Ticket - ${
            payment.title ?? "Non défini"
          }`}</DialogTitle>
          <DialogDescription>{`Voir les informations du ticket`}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 @min-[540px]/dialog:grid-cols-2">
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
                {PAYMENT_METHOD.find((p) => p.value === payment.method)?.name ??
                  "Non défini"}
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
                }/uploads/${encodeURIComponent(payment.proof as string)}`}
                target="_blank"
                className="flex gap-0.5 items-center"
              >
                <img
                  src="/images/pdf.png"
                  alt="justificatif"
                  className="h-7 w-auto aspect-square"
                />
                <p className="text-foreground font-medium">
                  {payment.proof
                    ? "Document justificatif"
                    : "Aucun justificatif"}
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
              <p className="view-group-title">{"Date limite"}</p>
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
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">{"Fermer"}</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ViewExpense;
