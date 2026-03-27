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
import { getTransactionTypeBadge, XAF } from "@/lib/utils";
import { Transaction, TRANSACTION_STATUS } from "@/types/types";
import { VariantProps } from "class-variance-authority";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  ArrowDownToLineIcon,
  ArrowRightLeft,
  ArrowUpToLineIcon,
  Calendar,
  CircleHelpIcon,
  ClipboardListIcon,
  ClipboardPenIcon,
  DollarSign,
  File,
  FileIcon,
  FilePenIcon,
  LucideHash,
  Tag,
  UsersIcon,
} from "lucide-react";
import Link from "next/link";
import React from "react";
import { PaymentRequest } from "@/types/types";

interface Props {
  open: boolean;
  openChange: React.Dispatch<React.SetStateAction<boolean>>;
  transaction: Transaction;
}

function ViewTransaction({ open, openChange, transaction }: Props) {
  const getSourceDetails = (source: Transaction["from"]) => {
    const details = [];
    // if ("accountNumber" in source && source.accountNumber) {
    //   details.push(`Numéro de compte: ${source.accountNumber}`);
    // }
    if ("phoneNumber" in source && source.phoneNumber) {
      details.push(`Numéro de téléphone: ${source.phoneNumber}`);
    }
    return details;
  };

  const getTargetDetails = (target: Transaction["to"]) => {
    const details = [];
    // if ("accountNumber" in target && target.accountNumber) {
    //   details.push(`Numéro de compte: ${target.accountNumber}`);
    // }
    if ("phoneNumber" in target && target.phoneNumber) {
      details.push(`Numéro de téléphone: ${target.phoneNumber}`);
    }
    return details;
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

  function getPaiementStatusBadge(status: PaymentRequest["status"]): {
    label: string;
    variant: VariantProps<typeof badgeVariants>["variant"];
  } {
    const label =
      status === "unsigned"
        ? "En attente de signature"
        : status === "signed"
          ? "Signé"
          : status === "paid"
            ? "Payé"
            : status === "simple_signed"
              ? "Paiement ouvert"
              : "En attente";

    switch (status) {
      case "pending_depense":
        return { label, variant: "yellow" };
      case "unsigned":
        return { label, variant: "teal" };
      case "signed":
        return { label, variant: "lime" };
      case "paid":
        return { label, variant: "success" };
      case "simple_signed":
        return { label, variant: "success" };
      default:
        return { label, variant: "yellow" };
    }
  }

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
              <Badge
                variant={getTransactionTypeBadge(transaction.Type).variant}
              >
                {getTransactionTypeBadge(transaction.Type).label}
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
          {transaction.Type === "TRANSFER" && (
            <>
              <div className="view-group">
                <span className="view-icon">
                  <File />
                </span>
                <div className="flex flex-col">
                  <p className="view-group-title">{"Document à signer"}</p>
                  <p className="font-semibold">
                    {transaction.method?.label! +
                      " N°" +
                      transaction?.docNumber}
                  </p>
                </div>
              </div>
              <div className="view-group">
                <span className="view-icon">
                  <UsersIcon />
                </span>
                <div className="w-full flex flex-col">
                  <p className="view-group-title">{"Signé par"}</p>
                  <div className="w-full grid gap-2">
                    {transaction.signers?.length === 0 ||
                    !transaction.signers ? (
                      <p className="text-sm">
                        {"Aucune signature enregistrée"}
                      </p>
                    ) : (
                      transaction.signers.map((u) => (
                        <div
                          key={u.id}
                          className="w-full px-3 py-1.5 rounded-sm border border-green-200 bg-green-50 text-gray-400 flex flex-col"
                        >
                          <p className="text-sm font-medium text-green-600">
                            {u.user.firstName.concat(" ", u.user.lastName)}
                          </p>
                          <span className="text-xs">{`Signé le ${format(new Date(u.signedAt), "dd MMM yyyy, p", { locale: fr })}`}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {/** Source */}
          <div className="view-group">
            <span className="view-icon">
              <ArrowUpToLineIcon />
            </span>
            <div className="flex flex-col">
              <p className="view-group-title">
                {/* {transaction.Type === "CREDIT"
                  ? "Source"
                  : transaction.Type === "DEBIT"
                    ? "Compte débité"
                    : "Compte d'origine"} */}
                {"Mouvement"}
              </p>
              <div className="w-full flex flex-row items-center justify-between">
                <p className="font-semibold">{`${transaction.from.label} → ${transaction.to.label}`}</p>
              </div>
            </div>
          </div>

          {/** Destination */}
          {/* <div className="view-group">
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
          </div> */}

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
                      href={`${process.env.NEXT_PUBLIC_API}/${proof}`}
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
          {/** Signatures */}
          {transaction.Type === "TRANSFER" && (
            <>
              <div className="view-group">
                <span className="view-icon">
                  <FilePenIcon />
                </span>
                <div className="flex flex-col">
                  <p className="view-group-title">{"Preuve de signature"}</p>
                  <div className="space-y-1">
                    {transaction.signDoc ? (
                      transaction.signDoc.split(";").map((proof, index) => (
                        <Link
                          key={index}
                          href={`${process.env.NEXT_PUBLIC_API}/${proof}`}
                          target="_blank"
                          className="flex gap-0.5 items-center"
                        >
                          <img
                            src="/images/pdf.png"
                            alt="preuve"
                            className="h-7 w-auto aspect-square"
                          />
                          <p className="text-foreground font-medium">
                            {"Document signé"}
                          </p>
                        </Link>
                      ))
                    ) : (
                      <p className="italic">{"Aucune preuve jointe"}</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="view-group col-span-2">
                <span className="view-icon">
                  <ClipboardListIcon />
                </span>
                <div className="flex flex-col">
                  <p className="view-group-title">{"Besoins associés"}</p>
                  <div className="flex flex-col">
                    {transaction.payments.map((item, i) => (
                      <span
                        key={item.id}
                        className={`p-1.5 w-full grid grid-cols-2 gap-2 justify-between text-sm ${i % 2 === 0 ? "bg-gray-100" : ""}`}
                      >
                        <p className="line-clamp-1">{item.title}</p>
                        <div className="grid grid-cols-2 items-center max-w-[300px]">
                          <p>{XAF.format(item.price ?? 0)}</p>
                          <Badge
                            variant={
                              getPaiementStatusBadge(item.status).variant
                            }
                          >
                            {getPaiementStatusBadge(item.status).label}
                          </Badge>
                        </div>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/** Date de création */}
          <div className="view-group">
            <span className="view-icon">
              <Calendar />
            </span>
            <div className="flex flex-col">
              <p className="view-group-title">{"Date de la demande"}</p>
              <p className="font-semibold">
                {format(
                  new Date(transaction.createdAt),
                  "dd MMMM yyyy à hh:mm",
                  {
                    locale: fr,
                  },
                )}
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
                  {format(new Date(transaction.date), "dd MMMM yyyy à hh:mm", {
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
