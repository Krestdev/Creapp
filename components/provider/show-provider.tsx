"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Provider } from "@/types/types";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  CircleDollarSign,
  LucideCalendar,
  LucideWallet,
  LucideFile,
} from "lucide-react";
import { useState } from "react";
import ShowFile from "../base/show-file";
import { DownloadFile } from "../base/downLoadFile";

interface DetailBCProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: Provider | null;
}

export function ShowProvider({ open, onOpenChange, data }: DetailBCProps) {
  const [page, setPage] = useState(1);
  const [file, setFile] = useState<string | File | undefined>(undefined);
  const [title, setTitle] = useState("");
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
      <DialogContent className="sm:max-w-[760px] w-full overflow-y-auto p-0 gap-0 overflow-x-hidden border-none">
        {/* Header with burgundy background */}
        <DialogHeader className="bg-[#8B1538] text-white p-6 m-4 rounded-lg pb-8 relative">
          <DialogTitle className="text-xl font-semibold text-white">
            {`Fournisseur ${data?.name}`}
          </DialogTitle>
          <p className="text-sm text-white/80 mt-1">
            {title !== "" ? title : "Informations relatives au fournisseur"}
          </p>
        </DialogHeader>

        {/* Content */}
        {page === 1 ? (
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
                      {format(new Date(data?.createdAt!), "PPP", {
                        locale: fr,
                      })}
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
                  <p className="text-sm text-muted-foreground">
                    {"Modifié le"}
                  </p>
                  {data?.updatedAt ? (
                    <p className="font-semibold">
                      {format(new Date(data?.updatedAt!), "PPP", {
                        locale: fr,
                      })}
                    </p>
                  ) : (
                    "-"
                  )}
                </div>
              </div>
            </div>
            <div className="flex-1 flex flex-col gap-3">
              {/* Carte contribuable */}
              <Button
                disabled={!data?.carte_contribuable}
                variant={"ghost"}
                className="w-full h-fit px-0 flex flex-row items-center text-start justify-start gap-2"
                onClick={() => {
                  setPage(2);
                  setFile(data?.carte_contribuable);
                  setTitle("Carte contribuable");
                }}
              >
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
                          <p className="text-[#2F2F2F] text-[12px] font-medium">
                            {data.carte_contribuable
                              ? "Document justificatif"
                              : "Aucun document"}
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
              </Button>
              {/* ACF */}
              <Button
                disabled={!data?.acf}
                variant={"ghost"}
                className="w-full h-fit px-0 flex flex-row items-center text-start justify-start gap-2"
                onClick={() => {
                  setPage(2);
                  setFile(data?.acf);
                  setTitle("ACF");
                }}
              >
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
                          <p className="text-[#2F2F2F] text-[12px] font-medium">
                            {data.acf
                              ? "Document justificatif"
                              : "Aucun document"}
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
              </Button>
              {/* Plan de localisation */}
              <Button
                disabled={!data?.plan_localisation}
                variant={"ghost"}
                className="w-full h-fit px-0 flex flex-row items-center text-start justify-start gap-2"
                onClick={() => {
                  setPage(2);
                  setFile(data?.plan_localisation);
                  setTitle("Plan de localisation");
                }}
              >
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
                          <p className="text-[#2F2F2F] text-[12px] font-medium">
                            {data?.plan_localisation
                              ? "Document justificatif"
                              : "Aucun document"}
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
              </Button>
              {/* Régistre de commerce */}
              <Button
                disabled={!data?.commerce_registre}
                variant={"ghost"}
                className="w-full h-fit px-0 flex flex-row items-center text-start justify-start gap-2"
                onClick={() => {
                  setPage(2);
                  setFile(data?.commerce_registre);
                  setTitle("Régistre de commerce");
                }}
              >
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
                          <p className="text-[#2F2F2F] text-[12px] font-medium">
                            {data?.commerce_registre
                              ? "Document justificatif"
                              : "Aucun document"}
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
              </Button>
              {/* Attestation bancaire */}
              <Button
                disabled={!data?.banck_attestation}
                variant={"ghost"}
                className="w-full h-fit px-0 flex flex-row items-center text-start justify-start gap-2"
                onClick={() => {
                  setPage(2);
                  setFile(data?.banck_attestation);
                  setTitle("Attestation bancaire");
                }}
              >
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
                          <p className="text-[#2F2F2F] text-[12px] font-medium">
                            {data?.banck_attestation
                              ? "Document justificatif"
                              : "Aucun document"}
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
              </Button>
            </div>
          </div>
        ) : (
          <ShowFile
            file={file}
            setPage={setPage}
            title={`Justificatif du devis ${title}`}
          />
        )}

        {/* Footer buttons */}
        <div className="flex w-full justify-end gap-3 p-6 pt-0">
          {page === 2 && <DownloadFile file={file} />}
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
