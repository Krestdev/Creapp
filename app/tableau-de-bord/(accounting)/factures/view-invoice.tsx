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
import { XAF } from "@/lib/utils";
import { userQ } from "@/queries/baseModule";
import { BonsCommande, Invoice } from "@/types/types";
import { useQuery } from "@tanstack/react-query";
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
  User
} from "lucide-react";
import Link from "next/link";
import React from "react";
import { getInvoiceStatusBadge } from "./invoices-table";

interface Props {
  invoice: Invoice;
  open: boolean;
  openChange: React.Dispatch<React.SetStateAction<boolean>>;
  purchases: Array<BonsCommande>;
}

function ViewInvoice({ invoice, open, openChange, purchases }: Props) {
  const getUsers = useQuery({ queryKey: ["users"], queryFn: userQ.getAll });
  const purchase = purchases.find((p) => p.id === invoice.commandId);
  const files = typeof invoice.proof === "string" ? invoice.proof : "";

  return (
    <Dialog open={open} onOpenChange={openChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {`facture - ${invoice.title}`}
          </DialogTitle>
          <DialogDescription>{`Informations sur la facture de ${purchase?.devi.commandRequest.title ?? invoice.commandId}`}</DialogDescription>
        </DialogHeader>
        {/**Reference */}
        <div className="view-group">
          <span className="view-icon">
            <LucideHash />
          </span>
          <div className="flex flex-col">
            <p className="view-group-title">{"Référence"}</p>
            <div className="w-fit bg-primary-100 flex items-center justify-center px-1.5 rounded">
              <p className="text-primary-600 text-sm">
                {invoice.reference || "N/A"}
              </p>
            </div>
          </div>
        </div>
        {/**Status */}
        <div className="view-group">
          <span className="view-icon">
            <HelpCircle />
          </span>
          <div className="flex flex-col">
            <p className="view-group-title">{"Statut"}</p>
            <Badge variant={getInvoiceStatusBadge(invoice.status).variant}>
              {getInvoiceStatusBadge(invoice.status).label}
            </Badge>
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
            <p className="font-semibold">{XAF.format(invoice.amount)}</p>
          </div>
        </div>
        {/**Justificatif */}
        <div className="view-group">
          <span className="view-icon">
            <FileIcon />
          </span>
          <div className="flex flex-col">
            <p className="view-group-title">{"Justificatif"}</p>
            <div className="space-y-1">
              {files ? (
                files
                  .split(";")
                  .filter((x) => !!x)
                  .map((proof, index) => (
                    <Link
                      key={index}
                      href={`${
                        process.env.NEXT_PUBLIC_API
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
        {/**Date limite */}
        <div className="view-group">
          <span className="view-icon">
            <CalendarFold />
          </span>
          <div className="flex flex-col">
            <p className="view-group-title">{"Date limite"}</p>
            <p className="font-semibold">
              {format(new Date(invoice.deadline), "dd MMMM yyyy", {
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
              {getUsers.data?.data.find((u) => u.id === invoice.userId)
                ?.firstName +
                " " +
                getUsers.data?.data.find((u) => u.id === invoice.userId)
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
              {format(new Date(invoice.createdAt), "dd MMMM yyyy", {
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

export default ViewInvoice;
