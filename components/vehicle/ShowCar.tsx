"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Vehicle } from "@/types/types";
import {
  CalendarDays,
  CalendarIcon,
  Car,
  CarIcon,
  FileImage,
  Hash,
  Info,
  ScanBarcodeIcon,
} from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface ShowCarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  vehicleData: Vehicle | null;
}

export default function ShowCar({ open, setOpen, vehicleData }: ShowCarProps) {
  if (!vehicleData) return null;

  /* =========================
       FORMAT DATE
    ========================= */
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Non disponible";

    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    } catch {
      return "Date invalide";
    }
  };

  const url = `${process.env.NEXT_PUBLIC_API}/${vehicleData.picture}`;
  /* =========================
       RENDER
    ========================= */
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {`Véhicule - ${vehicleData.mark} ${vehicleData.label}`}
          </DialogTitle>
          <DialogDescription>
            {"Informations complètes sur le véhicule"}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 grid-cols-1 min-[540px]/dialog:grid-cols-2">
          {/*Image */}
          <div className="view-group">
            <span className="view-icon">
              <FileImage />
            </span>
            <div className="flex flex-col">
              <p className="view-group-title">{"Aperçu du véhicule"}</p>
              {!!vehicleData.picture ? (
                <img
                  src={url}
                  alt={vehicleData.mark.concat(" ", vehicleData.label)}
                  className="w-full aspect-video h-auto object-cover mt-2"
                />
              ) : (
                <span className="italic text-gray-600">
                  {"Aucune image reseignée"}
                </span>
              )}
            </div>
          </div>
          {/* VEHICLE INFO GRID */}
          <div className="grid grid-cols-1 @min-[540px]/dialog:grid-cols-2 gap-3">
            {/* MARQUE */}
            <div className="view-group">
              <span className="view-icon">
                <CarIcon />
              </span>
              <div className="flex flex-col">
                <p className="view-group-title">{"Marque et modèle"}</p>
                <p className="font-semibold">
                  {vehicleData.mark.concat(" - ", vehicleData.label)}
                </p>
              </div>
            </div>
            {/* MATRICULE */}
            <div className="view-group">
              <span className="view-icon">
                <ScanBarcodeIcon />
              </span>
              <div className="flex flex-col">
                <p className="view-group-title">{"Immatriculation"}</p>
                <p
                  className={cn(
                    !!vehicleData.matricule ? "font-semibold" : "italic",
                  )}
                >
                  {vehicleData.matricule ?? "Non renseigné"}
                </p>
              </div>
            </div>

            {/* DATE DE CRÉATION */}
            {vehicleData.createdAt && (
              <div className="view-group">
                <span className="view-icon">
                  <CalendarIcon />
                </span>
                <div className="flex flex-col">
                  <p className="view-group-title">{"Date d'ajout"}</p>
                  <p className="font-semibold">
                    {format(new Date(vehicleData.createdAt), "dd MMMM yyyy, p", {locale: fr})}
                  </p>
                </div>
              </div>
            )}

            {/* DATE DE MISE À JOUR */}
            {vehicleData.updatedAt && (
              <div className="view-group">
                <span className="view-icon">
                  <CalendarIcon />
                </span>
                <div className="flex flex-col">
                  <p className="view-group-title">{"Date de mise à jour"}</p>
                  <p className="font-semibold">
                    {format(new Date(vehicleData.updatedAt), "dd MMMM yyyy, p", {locale: fr})}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* CLOSE BUTTON */}
          <div className="flex justify-end pt-4">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="min-w-[100px]"
            >
              Fermer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
