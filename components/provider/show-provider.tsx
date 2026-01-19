"use client";

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
import { Provider } from "@/types/types";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  AtSignIcon,
  CalendarIcon,
  FileIcon,
  FileImageIcon,
  MapIcon,
  PhoneIcon,
  SquareUserRoundIcon,
} from "lucide-react";
import Link from "next/link";
import { DownloadFile } from "../base/downLoadFile";

interface DetailBCProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: Provider;
}

export function ShowProvider({ open, onOpenChange, data }: DetailBCProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{`Fournisseur - ${data?.name}`}</DialogTitle>
          <DialogDescription>
            {"Informations relatives au fournisseur"}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 @min-[540px]/dialog:grid-cols-2">
          {/**Provider Name */}
          <div className="view-group">
            <span className="view-icon">
              <SquareUserRoundIcon />
            </span>
            <div className="flex flex-col">
              <p className="view-group-title">{"Nom de l'entreprise"}</p>
              <p className="font-semibold">{data.name ?? "Non renseigné"}</p>
            </div>
          </div>
          {/**Email */}
          <div className="view-group">
            <span className="view-icon">
              <AtSignIcon />
            </span>
            <div className="flex flex-col">
              <p className="view-group-title">{"Adresse mail"}</p>
              <p className="font-semibold">{data.email ?? "Non renseigné"}</p>
            </div>
          </div>
          {/**Phone */}
          <div className="view-group">
            <span className="view-icon">
              <PhoneIcon />
            </span>
            <div className="flex flex-col">
              <p className="view-group-title">{"Numéro de téléphone"}</p>
              <p className="font-semibold">{data.phone ?? "Non renseigné"}</p>
            </div>
          </div>
          {/**Address */}
          <div className="view-group">
            <span className="view-icon">
              <MapIcon />
            </span>
            <div className="flex flex-col">
              <p className="view-group-title">{"Adresse"}</p>
              <p className="font-semibold">{data.address ?? "Non renseigné"}</p>
            </div>
          </div>
          {/**Created At */}
          <div className="view-group">
            <span className="view-icon">
              <CalendarIcon />
            </span>
            <div className="flex flex-col">
              <p className="view-group-title">{"Créé le"}</p>
              <p className="font-semibold">
                {format(new Date(data.createdAt), "dd MMMM yyyy, p", {
                  locale: fr,
                })}
              </p>
            </div>
          </div>
          {/**Updated At */}
          <div className="view-group">
            <span className="view-icon">
              <CalendarIcon />
            </span>
            <div className="flex flex-col">
              <p className="view-group-title">{"Modifié le"}</p>
              <p className="font-semibold">
                {!!data.updatedAt
                  ? format(new Date(data.updatedAt), "dd MMMM yyyy, p", {
                      locale: fr,
                    })
                  : "--"}
              </p>
            </div>
          </div>
          {/**Carte Contribuable */}
          <div className="view-group">
            <span className="view-icon">
              <FileIcon />
            </span>
            <div className="flex flex-col">
              <p className="view-group-title">{"Carte Contribuable"}</p>
              {!!data.carte_contribuable ? (
                <Link
                  href={`${
                    process.env.NEXT_PUBLIC_API
                  }/${encodeURIComponent(data.carte_contribuable as string)}`}
                  target="_blank"
                  className="flex gap-0.5 items-center"
                >
                  <img
                    src="/images/pdf.png"
                    alt="justificatif"
                    className="h-7 w-auto aspect-square"
                  />
                  <p className="text-foreground font-medium">
                    {"carte_contribuable"}
                  </p>
                </Link>
              ) : (
                <p className="italic">{"Aucun justificatif"}</p>
              )}
            </div>
          </div>
          {/**ACF */}
          <div className="view-group">
            <span className="view-icon">
              <FileImageIcon />
            </span>
            <div className="flex flex-col">
              <p className="view-group-title">
                {"Attestation de Conformité Fiscale"}
              </p>
              {!!data.acf ? (
                <Link
                  href={`${
                    process.env.NEXT_PUBLIC_API
                  }/${encodeURIComponent(data.acf as string)}`}
                  target="_blank"
                  className="flex gap-0.5 items-center"
                >
                  <img
                    src="/images/pdf.png"
                    alt="justificatif"
                    className="h-7 w-auto aspect-square"
                  />
                  <p className="text-foreground font-medium">{"ACF"}</p>
                </Link>
              ) : (
                <p className="italic">{"Aucun justificatif"}</p>
              )}
            </div>
          </div>
          {/**Localisation */}
          <div className="view-group">
            <span className="view-icon">
              <FileIcon />
            </span>
            <div className="flex flex-col">
              <p className="view-group-title">{"Plan de localisation"}</p>
              {!!data.plan_localisation ? (
                <Link
                  href={`${
                    process.env.NEXT_PUBLIC_API
                  }/${encodeURIComponent(data.plan_localisation as string)}`}
                  target="_blank"
                  className="flex gap-0.5 items-center"
                >
                  <img
                    src="/images/pdf.png"
                    alt="justificatif"
                    className="h-7 w-auto aspect-square"
                  />
                  <p className="text-foreground font-medium">{"Fichier"}</p>
                </Link>
              ) : (
                <p className="italic">{"Aucun justificatif"}</p>
              )}
            </div>
          </div>
          {/**RCM */}
          <div className="view-group">
            <span className="view-icon">
              <FileIcon />
            </span>
            <div className="flex flex-col">
              <p className="view-group-title">{"Régistre du Commerce"}</p>
              {!!data.RCCM ? (
                <Link
                  href={`${
                    process.env.NEXT_PUBLIC_API
                  }/${encodeURIComponent(data.RCCM as string)}`}
                  target="_blank"
                  className="flex gap-0.5 items-center"
                >
                  <img
                    src="/images/pdf.png"
                    alt="justificatif"
                    className="h-7 w-auto aspect-square"
                  />
                  <p className="text-foreground font-medium">{"Rccm"}</p>
                </Link>
              ) : (
                <p className="italic">{"Aucun justificatif"}</p>
              )}
            </div>
          </div>
          {/**Bank */}
          <div className="view-group">
            <span className="view-icon">
              <FileImageIcon />
            </span>
            <div className="flex flex-col">
              <p className="view-group-title">{"Régistre du Commerce"}</p>
              {!!data.banck_attestation ? (
                <Link
                  href={`${
                    process.env.NEXT_PUBLIC_API
                  }/${encodeURIComponent(data.banck_attestation as string)}`}
                  target="_blank"
                  className="flex gap-0.5 items-center"
                >
                  <img
                    src="/images/pdf.png"
                    alt="justificatif"
                    className="h-7 w-auto aspect-square"
                  />
                  <p className="text-foreground font-medium">{"Attestation"}</p>
                </Link>
              ) : (
                <p className="italic">{"Aucun justificatif"}</p>
              )}
            </div>
          </div>
          <div className="flex-1 flex flex-col gap-3"></div>
        </div>
        {/* Footer buttons */}
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">{"Fermer"}</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
