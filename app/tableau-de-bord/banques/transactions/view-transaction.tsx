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
import { XAF } from "@/lib/utils";
import { useStore } from "@/providers/datastore";
import {
  Transaction,
  TRANSACTION_STATUS,
  TRANSACTION_TYPES,
} from "@/types/types";
import { VariantProps } from "class-variance-authority";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  ArrowDownToLineIcon,
  ArrowRightLeft,
  ArrowUpToLineIcon,
  Calendar,
  CircleHelpIcon,
  ClipboardPenIcon,
  DollarSign,
  FileIcon,
  LucideHash,
  Tag,
  UsersIcon,
} from "lucide-react";
import Link from "next/link";
import React from "react";

interface Props {
  open: boolean;
  openChange: React.Dispatch<React.SetStateAction<boolean>>;
  transaction: Transaction;
}

function ViewTransaction({ open, openChange, transaction }: Props) {
  const { user } = useStore();
  const getSourceDetails = (source: Transaction["from"]) => {
    const details = [];
    if ("accountNumber" in source && source.accountNumber) {
      details.push(`Numéro de compte: ${source.accountNumber}`);
    }
    if ("phoneNumber" in source && source.phoneNumber) {
      details.push(`Numéro de téléphone: ${source.phoneNumber}`);
    }
    return details;
  };

  const getTargetDetails = (target: Transaction["to"]) => {
    const details = [];
    if ("accountNumber" in target && target.accountNumber) {
      details.push(`Numéro de compte: ${target.accountNumber}`);
    }
    if ("phoneNumber" in target && target.phoneNumber) {
      details.push(`Numéro de téléphone: ${target.phoneNumber}`);
    }
    return details;
  };

  const getTypeBadgeVariant = (type: Transaction["Type"]) => {
    switch (type) {
      case "CREDIT":
        return "success";
      case "DEBIT":
        return "destructive";
      case "TRANSFER":
        return "blue";
      default:
        return "outline";
    }
  };

  const getStatusBadge = (
    status: Transaction["status"],
  ): {
    label: string;
    variant: VariantProps<typeof badgeVariants>["variant"];
  } => {
    const label =
      TRANSACTION_STATUS.find((t) => t.value === status)?.name ?? "Inconnu";
    switch (status) {
      case "APPROVED":
        return { label, variant: "success" };
      case "REJECTED":
        return { label, variant: "destructive" };
      case "PENDING":
        return { label, variant: "amber" };
      default:
        return { label, variant: "outline" };
    }
  };

  return (
    <Dialog open={open} onOpenChange={openChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader variant={"default"}>
          <DialogTitle className="uppercase">{`transfert - ${transaction.label}`}</DialogTitle>
          <DialogDescription>{"Détails de la transaction"}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 @min-[540px]/dialog:grid-cols-2">
          {/** Référence */}
          <div className="view-group">
            <span className="view-icon">
              <LucideHash />
            </span>
            <div className="flex flex-col">
              <p className="view-group-title">{"Référence"}</p>
              <div className="w-fit bg-primary-100 flex items-center justify-center px-1.5 rounded">
                <p className="text-primary-600 text-sm">
                  {`TR-${transaction.id}`}
                </p>
              </div>
            </div>
          </div>

          {/** Montant */}
          <div className="view-group">
            <span className="view-icon">
              <DollarSign />
            </span>
            <div className="flex flex-col">
              <p className="view-group-title">{"Montant"}</p>
              <p
                className={`font-semibold ${transaction.Type === "CREDIT" ? "text-green-600" : transaction.Type === "DEBIT" && "text-red-600"}`}
              >
                {XAF.format(transaction.amount)}
              </p>
            </div>
          </div>

          {/** Type de transaction */}
          <div className="view-group">
            <span className="view-icon">
              <ArrowRightLeft />
            </span>
            <div className="flex flex-col">
              <p className="view-group-title">{"Type de transaction"}</p>
              <Badge variant={getTypeBadgeVariant(transaction.Type)}>
                {TRANSACTION_TYPES.find((p) => p.value === transaction.Type)
                  ?.name ?? "Inconnu"}
              </Badge>
            </div>
          </div>

          {/** Libellé */}
          <div className="view-group">
            <span className="view-icon">
              <Tag />
            </span>
            <div className="flex flex-col">
              <p className="view-group-title">{"Libellé"}</p>
              <p className="font-semibold">{transaction.label}</p>
            </div>
          </div>

          {/** Status */}
          <div className="view-group">
            <span className="view-icon">
              <CircleHelpIcon />
            </span>
            <div className="flex flex-col">
              <p className="view-group-title">{"Statut"}</p>
              <p className="font-semibold">
                <Badge variant={getStatusBadge(transaction.status).variant}>
                  {getStatusBadge(transaction.status).label}
                </Badge>
                {!!transaction.reason && (
                  <p className="mt-1 text-xs text-destructive font-normal">{`Motif: ${transaction.reason}`}</p>
                )}
              </p>
            </div>
          </div>

          {/** Signed */}
          {
            transaction.Type === "TRANSFER" &&
            <>
              <div className="view-group">
                <span className="view-icon">
                  <ClipboardPenIcon />
                </span>
                <div className="flex flex-col">
                  <p className="view-group-title">{"Signature"}</p>
                  <p className="font-semibold">
                    <Badge variant={transaction.isSigned === true ? "success" : "amber"}>
                      {transaction.isSigned === true ? "Signé" : "En attente"}
                    </Badge>
                  </p>
                </div>
              </div>
              <div className="view-group">
                <span className="view-icon">
                  <UsersIcon />
                </span>
                <div className="w-full flex flex-col">
                  <p className="view-group-title">{"Signataires"}</p>
                  <div className="w-full grid gap-2">
                    {
                      transaction.signers?.length === 0 || !transaction.signers ?
                        <p className="text-sm">{"Aucune signature enregistrée"}</p>
                        :
                        transaction.signers.map(u =>
                          <div key={u.id} className="w-full px-3 py-1.5 rounded-sm border border-green-200 bg-green-50 text-gray-400 flex flex-col">
                            <p className="text-sm font-medium text-green-600">{u.user.firstName.concat(" ", u.user.lastName)}</p>
                            <span className="text-xs">{`Signé le ${format(new Date(u.signedAt), "dd MMM yyyy, p", { locale: fr })}`}</span>
                          </div>
                        )
                    }
                  </div>
                </div>
              </div>
            </>
          }

          {/** Source */}
          <div className="view-group">
            <span className="view-icon">
              <ArrowUpToLineIcon />
            </span>
            <div className="flex flex-col">
              <p className="view-group-title">
                {transaction.Type === "CREDIT"
                  ? "Source"
                  : transaction.Type === "DEBIT"
                    ? "Compte débité"
                    : "Compte d'origine"}
              </p>
              <div className="space-y-0.5">
                <p className="font-semibold">{transaction.from.label}</p>
                {getSourceDetails(transaction.from).map((detail, index) => (
                  <p key={index} className="text-sm text-gray-600">
                    {detail}
                  </p>
                ))}
              </div>
            </div>
          </div>

          {/** Destination */}
          <div className="view-group">
            <span className="view-icon">
              <ArrowDownToLineIcon />
            </span>
            <div className="flex flex-col">
              <p className="view-group-title">
                {transaction.Type === "CREDIT"
                  ? "Compte crédité"
                  : transaction.Type === "DEBIT"
                    ? "Destination"
                    : "Compte destinataire"}
              </p>
              <div className="space-y-0.5">
                <p className="font-semibold">{transaction.to.label}</p>
                {getTargetDetails(transaction.to).map((detail, index) => (
                  <p key={index} className="text-sm text-gray-600">
                    {detail}
                  </p>
                ))}
              </div>
            </div>
          </div>

          {/** Preuve */}
          <div className="view-group">
            <span className="view-icon">
              <FileIcon />
            </span>
            <div className="flex flex-col">
              <p className="view-group-title">{"Preuve de transaction"}</p>
              <div className="space-y-1">
                {transaction.proof ? (
                  transaction.proof.split(";").map((proof, index) => (
                    <Link
                      key={index}
                      href={`${process.env.NEXT_PUBLIC_API
                        }/${proof}`}
                      target="_blank"
                      className="flex gap-0.5 items-center"
                    >
                      <img
                        src="/images/pdf.png"
                        alt="preuve"
                        className="h-7 w-auto aspect-square"
                      />
                      <p className="text-foreground font-medium">
                        {"Document de preuve"}
                      </p>
                    </Link>
                  ))
                ) : (
                  <p className="italic">{"Aucune preuve jointe"}</p>
                )}
              </div>
            </div>
          </div>

          {/** Date de création */}
          <div className="view-group">
            <span className="view-icon">
              <Calendar />
            </span>
            <div className="flex flex-col">
              <p className="view-group-title">{"Date de la demande"}</p>
              <p className="font-semibold">
                {format(new Date(transaction.createdAt), "dd MMMM yyyy, p", {
                  locale: fr,
                })}
              </p>
            </div>
          </div>
          {/** Date de création */}
          {transaction.status === "APPROVED" && (
            <div className="view-group">
              <span className="view-icon">
                <Calendar />
              </span>
              <div className="flex flex-col">
                <p className="view-group-title">{"Date de la transaction"}</p>
                <p className="font-semibold">
                  {format(new Date(transaction.date), "dd MMMM yyyy, p", {
                    locale: fr,
                  })}
                </p>
              </div>
            </div>
          )}
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

export default ViewTransaction;
