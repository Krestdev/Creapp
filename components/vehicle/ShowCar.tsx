"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Vehicle } from "@/types/types";
import { CalendarDays, Car, FileImage, Hash, Info } from "lucide-react";
import { Button } from "../ui/button";

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

  const url = `${process.env.NEXT_PUBLIC_API}/uploads/${vehicleData.picture}`;
  /* =========================
       RENDER
    ========================= */
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[540px] p-0 overflow-hidden">
        <DialogHeader className="bg-[#8B1538] text-white p-6 m-4 rounded-lg">
          <DialogTitle className="text-xl font-semibold uppercase flex items-center gap-2">
            {`Véhicule - ${vehicleData.mark} ${vehicleData.label}`}
          </DialogTitle>
          <p className="text-sm text-white/80 mt-1">
            {"Informations complètes sur le véhicule"}
          </p>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* IMAGE SECTION */}
          {
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <FileImage className="h-4 w-4" />
                <span>Photo du véhicule</span>
              </div>
              <div className="relative h-48 w-full rounded-lg overflow-hidden border border-gray-200">
                {vehicleData.picture !== null ? (
                  <img
                    src={url}
                    alt={`${vehicleData.mark} ${vehicleData.label}`}
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full bg-gray-100">
                    <FileImage className="h-12 w-12 text-gray-400" />
                  </div>
                )}
              </div>
            </div>
          }

          {/* VEHICLE INFO GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* MARQUE */}

            <div className="flex items-start gap-3">
              <div className="mt-1">
                <Car className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">
                  {"Marque & Modèle"}
                </p>
                <p className="font-semibold text-lg">
                  {vehicleData.mark} {vehicleData.label}
                </p>
              </div>
            </div>

            {/* MATRICULE */}
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <Hash className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">
                  {"Immatriculation"}
                </p>
                <p className="font-semibold text-lg">
                  {vehicleData.matricule || "Non renseigné"}
                </p>
              </div>
            </div>

            {/* DATE DE CRÉATION */}
            {vehicleData.createdAt && (
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <CalendarDays className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">
                    {"Date d'ajout"}
                  </p>
                  <p className="font-semibold text-lg">
                    {formatDate(vehicleData.createdAt)}
                  </p>
                </div>
              </div>
            )}

            {/* DATE DE MISE À JOUR */}
            {vehicleData.updatedAt && (
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <CalendarDays className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">
                    {"Dernière modification"}
                  </p>
                  <p className="font-semibold text-lg">
                    {formatDate(vehicleData.updatedAt)}
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
