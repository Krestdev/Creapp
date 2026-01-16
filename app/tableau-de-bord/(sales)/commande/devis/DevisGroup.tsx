"use client";
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
    LucideUserRound
} from "lucide-react";
import React from "react";

interface DetailModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    devis: QuotationGroup | null
}

export function DevisGroup({
    open,
    onOpenChange,
    devis,
}: DetailModalProps) {

    const [page, setPage] = React.useState(1);
    const [file, setFile] = React.useState<string | File | undefined>(undefined);
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
                return "Completé";
            case "cancelled":
                return "Annulé";
            default:
                return "Statut inconnu";
        }
    }

    return (
        <Dialog
            open={open}
            onOpenChange={(isOpen) => {
                onOpenChange(isOpen);
                if (!isOpen) {
                    setPage(1);
                }
            }}
        >
            <DialogContent className="sm:max-w-[90vw] lg:max-w-[720px] max-h-screen overflow-y-auto overflow-x-hidden">
                {/* Header */}
                <DialogHeader>
                    <DialogTitle className="uppercase">
                        {`Quotation - ${devis?.commandRequest.title || "Sans titre"}`}
                    </DialogTitle>
                    <DialogDescription>
                        {page === 1
                            ? "Détail de la quotation"
                            : `Justificatif du devis ${devis}`}
                    </DialogDescription>
                </DialogHeader>
                {
                    page === 1 ?
                        <div className="flex gap-3 p-4">
                            <div className="w-full flex flex-col gap-3 py-3">
                                {/* Référence */}
                                <div className="view-group">
                                    <span className="view-icon">
                                        <LucideHash />
                                    </span>
                                    <div className="flex flex-col">
                                        <p className="text-gray-600">{"Statut"}</p>
                                        <div className="w-fit bg-[#F2CFDE] flex items-center justify-center px-1.5 rounded">
                                            <p className="text-[#9E1351] text-sm">
                                                {translateStatus(devis?.status) || "N/A"}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Demande de quotation */}
                                <div className="view-group">
                                    <span className="view-icon">
                                        <LucideFile />
                                    </span>
                                    <div className="flex flex-col">
                                        <p className="text-gray-600">{"Demande de quotation"}</p>
                                        <p className="text-sm font-semibold uppercase">
                                            {devis?.commandRequest.title} - <span className="text-red-500">{devis?.commandRequest.reference}</span>
                                        </p>
                                    </div>
                                </div>

                                {/* Fournisseur */}
                                <div className="view-group">
                                    <span className="view-icon">
                                        <LucideUserRound />
                                    </span>
                                    <div className="flex flex-col">
                                        <p className="text-gray-600">{"Fournisseur"}</p>
                                        <p className="text-sm font-semibold uppercase">
                                            {
                                                devis?.providers.map(provider => {
                                                    return (
                                                        <Badge key={provider.id} variant="outline" className="text-xs">
                                                            {provider.name}
                                                        </Badge>
                                                    )
                                                })
                                            }
                                        </p>
                                    </div>
                                </div>

                                <div className="view-group">
                                    <span className="view-icon">
                                        <LucideClipboardList />
                                    </span>

                                    <div className="flex flex-col">
                                        <p className="text-gray-600">{"Devis associés"}</p>
                                        {
                                            devis?.quotations.map(devi => {
                                                return (
                                                    <Button
                                                    key={devi.id}
                                                        variant={"ghost"}
                                                        className="w-full h-fit px-0 flex flex-row items-center text-start justify-start gap-2"
                                                        disabled={!devi?.proof}
                                                        onClick={() => {
                                                            setPage(2);
                                                            setFile(devi?.proof);
                                                        }}
                                                    >
                                                        <div className="flex flex-col">
                                                            <div className="flex gap-1.5 items-center">
                                                                {devi?.proof ? (
                                                                    <>
                                                                        <img
                                                                            src="/images/pdf.png"
                                                                            alt="justificatif"
                                                                            className="h-8 w-auto aspect-square"
                                                                        />
                                                                        <p className="text-[#2F2F2F] text-[12px] font-medium">
                                                                            {`Devis ${devis.providers.find(x => x.id === devi.providerId)?.name}`} - <Badge variant={devis.status === "IN_PROGRESS" ? "default" : devis.status === "NOT_PROCESSED" ? "destructive" : "success"}>{translateStatus(devi?.status)}</Badge>
                                                                        </p>
                                                                    </>
                                                                ) : (
                                                                    <p className="text-sm text-gray-500">
                                                                        {"Aucun devis"}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </Button>
                                                )
                                            })
                                        }
                                    </div>
                                </div>


                            </div>
                        </div> :
                        <ShowFile file={file} title="" setPage={setPage} />
                }
                <DialogFooter>
                    <Button variant={"outline"} className="ml-auto">{"Fermer"}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
