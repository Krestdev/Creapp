"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useFetchQuery } from "@/hooks/useData";
import { XAF } from "@/lib/utils";
import { CommandRqstQueries } from "@/queries/commandRqstModule";
import { Provider } from "@/types/types";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Calendar,
  CircleDollarSign,
  FileQuestion,
  Hash,
  LucideCalendar,
  LucideCalendarFold,
  LucideCheckCheck,
  LucideFile,
  LucideFlag,
  LucideInfo,
  LucideMapPin,
  LucideScrollText,
  LucideSquareUserRound,
  LucideUserRound,
  LucideWallet,
  LucideX,
} from "lucide-react";

interface DetailBCProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: Provider | null;
}

export function ShowProvider({ open, onOpenChange, data }: DetailBCProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[760px] w-full overflow-y-auto p-0 gap-0 overflow-x-hidden border-none">
        {/* Header with burgundy background */}
        <DialogHeader className="bg-[#8B1538] text-white p-6 m-4 rounded-lg pb-8 relative">
          <DialogTitle className="text-xl font-semibold text-white">
            {`Fournisseur: ${data?.name}`}
          </DialogTitle>
          <p className="text-sm text-white/80 mt-1">
            {"Informations relatives à la commande"}
          </p>
        </DialogHeader>

        {/* Content */}
        <div className="p-6 space-y-4 grid grid-cols-2">
          <div className="flex-1 flex flex-col gap-3">
            {/* Nom (entreprise) */}
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <CircleDollarSign className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">
                  {"Nom (entreprise):"}
                </p>
                <p className="font-semibold">{data?.name}</p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <LucideWallet className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">{"Email"}</p>
                <p className="font-semibold">{data?.email}</p>
              </div>
            </div>

            {/* Téléphone */}
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <LucideWallet className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">{"Téléphone"}</p>
                <p className="font-semibold">{data?.phone}</p>
              </div>
            </div>

            {/* Addresse */}
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <LucideWallet className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">{"Addresse"}</p>
                <p className="font-semibold">{data?.address}</p>
              </div>
            </div>

            {/* Créé le */}
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <LucideCalendar className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">{"Créé le"}</p>
                {data?.createdAt ? (
                  <p className="font-semibold">
                    {format(new Date(data?.createdAt!), "PPP", { locale: fr })}
                  </p>
                ) : (
                  "-"
                )}
              </div>
            </div>

            {/* Modifié le */}
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <LucideCalendar className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">{"Modifié le"}</p>
                {data?.updatedAt ? (
                  <p className="font-semibold">
                    {format(new Date(data?.updatedAt!), "PPP", { locale: fr })}
                  </p>
                ) : (
                  "-"
                )}
              </div>
            </div>
          </div>
          <div className="flex-1 flex flex-col gap-3">
            {/* Carte contribuable */}
            <div className="w-full flex flex-row items-center gap-2">
              <div className="flex items-center justify-center rounded-full bg-[#E4E4E7] size-10">
                <LucideFile size={24} />
              </div>
              <div className="flex flex-col">
                <p className="text-[#52525B]">{"Carte contribuable"}</p>
                {data?.carte_contribuable ? (
                  <div className="flex gap-1.5 items-center">
                    <>
                      <img
                        src="/images/pdf.png"
                        alt="justificatif"
                        className="h-8 w-auto aspect-square"
                      />
                      <div>
                        {/* <p className="text-[#2F2F2F] text-[12px] font-medium">
                          {data.proof.name || "Document justificatif"}
                        </p>
                        <p className="text-[#A1A1AA] text-[12px]">
                          {data.proof.size ? `${(data.proof.size / 1024).toFixed(1)} ko` : "Taille inconnue"}
                        </p> */}
                        <p className="text-[#2F2F2F] text-[12px] font-medium">
                          {"Document justificatif"}
                        </p>
                        <p className="text-[#A1A1AA] text-[12px]">
                          {true
                            ? `${(20 / 1024).toFixed(1)} ko`
                            : "Taille inconnue"}
                        </p>
                      </div>
                    </>
                  </div>
                ) : (
                  <p className="text-[#A1A1AA] text-[12px]">
                    {"Aucun document"}
                  </p>
                )}
              </div>
            </div>
            {/* ACF */}
            <div className="w-full flex flex-row items-center gap-2">
              <div className="flex items-center justify-center rounded-full bg-[#E4E4E7] size-10">
                <LucideFile size={24} />
              </div>
              <div className="flex flex-col">
                <p className="text-[#52525B]">{"ACF"}</p>
                {data?.acf ? (
                  <div className="flex gap-1.5 items-center">
                    <>
                      <img
                        src="/images/pdf.png"
                        alt="justificatif"
                        className="h-8 w-auto aspect-square"
                      />
                      <div>
                        {/* <p className="text-[#2F2F2F] text-[12px] font-medium">
                          {data.proof.name || "Document justificatif"}
                        </p>
                        <p className="text-[#A1A1AA] text-[12px]">
                          {data.proof.size ? `${(data.proof.size / 1024).toFixed(1)} ko` : "Taille inconnue"}
                        </p> */}
                        <p className="text-[#2F2F2F] text-[12px] font-medium">
                          {"Document justificatif"}
                        </p>
                        <p className="text-[#A1A1AA] text-[12px]">
                          {true
                            ? `${(20 / 1024).toFixed(1)} ko`
                            : "Taille inconnue"}
                        </p>
                      </div>
                    </>
                  </div>
                ) : (
                  <p className="text-[#A1A1AA] text-[12px]">
                    {"Aucun document"}
                  </p>
                )}
              </div>
            </div>
            {/* Plan de localisation */}
            <div className="w-full flex flex-row items-center gap-2">
              <div className="flex items-center justify-center rounded-full bg-[#E4E4E7] size-10">
                <LucideFile size={24} />
              </div>
              <div className="flex flex-col">
                <p className="text-[#52525B]">{"Plan de localisation"}</p>
                {data?.plan_localisation ? (
                  <div className="flex gap-1.5 items-center">
                    <>
                      <img
                        src="/images/pdf.png"
                        alt="justificatif"
                        className="h-8 w-auto aspect-square"
                      />
                      <div>
                        {/* <p className="text-[#2F2F2F] text-[12px] font-medium">
                          {data.proof.name || "Document justificatif"}
                        </p>
                        <p className="text-[#A1A1AA] text-[12px]">
                          {data.proof.size ? `${(data.proof.size / 1024).toFixed(1)} ko` : "Taille inconnue"}
                        </p> */}
                        <p className="text-[#2F2F2F] text-[12px] font-medium">
                          {"Document justificatif"}
                        </p>
                        <p className="text-[#A1A1AA] text-[12px]">
                          {true
                            ? `${(20 / 1024).toFixed(1)} ko`
                            : "Taille inconnue"}
                        </p>
                      </div>
                    </>
                  </div>
                ) : (
                  <p className="text-[#A1A1AA] text-[12px]">
                    {"Aucun document"}
                  </p>
                )}
              </div>
            </div>
            {/* Régistre de commerce */}
            <div className="w-full flex flex-row items-center gap-2">
              <div className="flex items-center justify-center rounded-full bg-[#E4E4E7] size-10">
                <LucideFile size={24} />
              </div>
              <div className="flex flex-col">
                <p className="text-[#52525B]">{"Régistre de commerce"}</p>
                {data?.commerce_registre ? (
                  <div className="flex gap-1.5 items-center">
                    <>
                      <img
                        src="/images/pdf.png"
                        alt="justificatif"
                        className="h-8 w-auto aspect-square"
                      />
                      <div>
                        {/* <p className="text-[#2F2F2F] text-[12px] font-medium">
                          {data.proof.name || "Document justificatif"}
                        </p>
                        <p className="text-[#A1A1AA] text-[12px]">
                          {data.proof.size ? `${(data.proof.size / 1024).toFixed(1)} ko` : "Taille inconnue"}
                        </p> */}
                        <p className="text-[#2F2F2F] text-[12px] font-medium">
                          {"Document justificatif"}
                        </p>
                        <p className="text-[#A1A1AA] text-[12px]">
                          {true
                            ? `${(20 / 1024).toFixed(1)} ko`
                            : "Taille inconnue"}
                        </p>
                      </div>
                    </>
                  </div>
                ) : (
                  <p className="text-[#A1A1AA] text-[12px]">
                    {"Aucun document"}
                  </p>
                )}
              </div>
            </div>
            {/* Attestation bancaire */}
            <div className="w-full flex flex-row items-center gap-2">
              <div className="flex items-center justify-center rounded-full bg-[#E4E4E7] size-10">
                <LucideFile size={24} />
              </div>
              <div className="flex flex-col">
                <p className="text-[#52525B]">{"Attestation bancaire"}</p>
                {data?.banck_attestation ? (
                  <div className="flex gap-1.5 items-center">
                    <>
                      <img
                        src="/images/pdf.png"
                        alt="justificatif"
                        className="h-8 w-auto aspect-square"
                      />
                      <div>
                        {/* <p className="text-[#2F2F2F] text-[12px] font-medium">
                          {data.proof.name || "Document justificatif"}
                        </p>
                        <p className="text-[#A1A1AA] text-[12px]">
                          {data.proof.size ? `${(data.proof.size / 1024).toFixed(1)} ko` : "Taille inconnue"}
                        </p> */}
                        <p className="text-[#2F2F2F] text-[12px] font-medium">
                          {"Document justificatif"}
                        </p>
                        <p className="text-[#A1A1AA] text-[12px]">
                          {true
                            ? `${(20 / 1024).toFixed(1)} ko`
                            : "Taille inconnue"}
                        </p>
                      </div>
                    </>
                  </div>
                ) : (
                  <p className="text-[#A1A1AA] text-[12px]">
                    {"Aucun document"}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer buttons */}
        <div className="flex w-full justify-end gap-3 p-6 pt-0">
          <Button
            variant="outline"
            className="bg-transparent"
            onClick={() => onOpenChange(false)}
          >
            {"Fermer"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
