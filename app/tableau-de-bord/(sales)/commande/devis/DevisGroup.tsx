"use client";

import { DownloadFile } from "@/components/base/downLoadFile";
import ShowFile from "@/components/base/show-file";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { QuotationGroup } from "@/types/types";
import {
  LucideClipboardList,
  LucideFile,
  LucideHash,
  LucideUserRound,
  LucideChevronRight,
  LucideFileText,
} from "lucide-react";
import Link from "next/link";
import React from "react";

interface DetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  devis: QuotationGroup | null;
}

const STATUS_STYLES = {
  not_processed: { bg: "bg-gray-100", text: "text-gray-700" },
  in_progress: { bg: "bg-blue-100", text: "text-blue-700" },
  pending: { bg: "bg-amber-100", text: "text-amber-700" },
  completed: { bg: "bg-green-100", text: "text-green-700" },
  cancelled: { bg: "bg-red-100", text: "text-red-700" },
} as const;

export function DevisGroup({ open, onOpenChange, devis }: DetailModalProps) {
  const [page, setPage] = React.useState(1);
  const [file, setFile] = React.useState<string | File | undefined>(undefined);
  const [selectedProvider, setSelectedProvider] = React.useState<string>("");

  const translateStatus = (status: string | undefined) => {
    status = status?.toLowerCase();
    switch (status) {
      case "not_processed":
        return "Non traité";
      case "in_progress":
        return "En cours";
      case "pending":
        return "En cours";
      case "completed":
        return "Complété";
      case "cancelled":
        return "Annulé";
      default:
        return "Statut inconnu";
    }
  };

  const getStatusStyle = (status: string | undefined) => {
    const normalizedStatus =
      status?.toLowerCase() as keyof typeof STATUS_STYLES;
    return (
      STATUS_STYLES[normalizedStatus] || {
        bg: "bg-gray-100",
        text: "text-gray-700",
      }
    );
  };

  const handleViewQuotation = (
    proof: string | File | undefined,
    providerName: string,
  ) => {
    setFile(proof);
    setSelectedProvider(providerName);
    setPage(2);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        onOpenChange(isOpen);
        if (!isOpen) {
          setPage(1);
          setFile(undefined);
          setSelectedProvider("");
        }
      }}
    >
      <DialogContent className="sm:max-w-[90vw] lg:max-w-[720px] max-h-screen overflow-y-auto overflow-x-hidden p-0 gap-0">
        {/* Header modernisé */}
        <DialogHeader className="px-6 py-4 border-b sticky top-0 bg-background z-10">
          <DialogTitle className="text-xl font-semibold tracking-tight uppercase">
            {`Devis - ${devis?.commandRequest.title || "Sans titre"}`}
          </DialogTitle>
          <DialogDescription className="text-sm mt-1">
            {page === 1
              ? "Détail du devis"
              : `Justificatif - ${selectedProvider}`}
          </DialogDescription>
        </DialogHeader>

        {/* Content */}
        <div className="px-6 py-4">
          <div className="flex gap-3">
            <div className="w-full flex flex-col gap-4 py-3">
              {/* Référence / Statut */}
              <div className="view-group group hover:bg-muted/30 transition-all duration-200 p-2 -m-2 rounded-lg">
                <span className="view-icon">
                  <LucideHash className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </span>
                <div className="flex flex-col flex-1">
                  <p className="text-sm text-muted-foreground mb-1">Statut</p>
                  <div className="w-fit">
                    {(() => {
                      const style = getStatusStyle(devis?.status);
                      return (
                        <div
                          className={`${style.bg} ${style.text} flex items-center justify-center px-3 py-1 rounded-full`}
                        >
                          <p className="text-sm font-medium">
                            {translateStatus(devis?.status) || "N/A"}
                          </p>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* Demande de quotation */}
              <div className="view-group group hover:bg-muted/30 transition-all duration-200 p-2 -m-2 rounded-lg">
                <span className="view-icon">
                  <LucideFile className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </span>
                <div className="flex flex-col flex-1">
                  <p className="text-sm text-muted-foreground mb-1">
                    Demande de quotation
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold uppercase">
                      {devis?.commandRequest.title}
                    </p>
                    <Badge variant="outline" className="text-xs font-mono">
                      {devis?.commandRequest.reference}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Fournisseur */}
              <div className="view-group group hover:bg-muted/30 transition-all duration-200 p-2 -m-2 rounded-lg">
                <span className="view-icon">
                  <LucideUserRound className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </span>
                <div className="flex flex-col flex-1">
                  <p className="text-sm text-muted-foreground mb-1">
                    Fournisseurs
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {devis?.providers.map((provider) => (
                      <Badge
                        key={provider.id}
                        variant="secondary"
                        className="text-xs font-medium"
                      >
                        {provider.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Devis associés */}
              <div className="view-group group transition-all duration-200 p-2 -m-2 rounded-lg">
                <span className="view-icon">
                  <LucideClipboardList className="h-5 w-5 text-muted-foreground transition-colors" />
                </span>
                <div className="flex flex-col flex-1">
                  <p className="text-sm text-muted-foreground mb-2">
                    Devis associés
                  </p>
                  <div className="space-y-2">
                    {devis?.quotations.map((devi, index) => {
                      const provider = devis.providers.find(
                        (x) => x.id === devi.providerId,
                      );
                      const hasProof = !!devi?.proof;

                      return (
                        <Link
                          key={index}
                          href={`${process.env.NEXT_PUBLIC_API}/${devi?.proof}`}
                          target="_blank"
                          className="w-full h-auto p-3 flex flex-row items-center justify-between gap-3 hover:bg-muted/50 transition-all duration-200 rounded-lg"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            {hasProof ? (
                              <div className="shrink-0 h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                <LucideFileText className="h-5 w-5 text-primary" />
                              </div>
                            ) : (
                              <div className="shrink-0 h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                                <LucideFileText className="h-5 w-5 text-muted-foreground" />
                              </div>
                            )}
                            <div className="flex-1 text-left">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="text-sm font-medium">
                                  {provider?.name || "Fournisseur inconnu"}
                                </p>
                                <Badge
                                  variant={
                                    devis.status === "IN_PROGRESS"
                                      ? "default"
                                      : devis.status === "NOT_PROCESSED"
                                        ? "destructive"
                                        : "success"
                                  }
                                  className="text-xs"
                                >
                                  {translateStatus(devi?.status)}
                                </Badge>
                              </div>
                              {hasProof && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Cliquez pour visualiser
                                </p>
                              )}
                            </div>
                          </div>
                          {hasProof && (
                            <LucideChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer modernisé */}
        <DialogFooter className="px-6 py-4 border-t mt-auto">
          <div className="flex items-center gap-3 w-full justify-end">
            {page === 2 && file && <DownloadFile file={file} />}
            <Button onClick={() => onOpenChange(false)} variant="outline">
              Fermer
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
