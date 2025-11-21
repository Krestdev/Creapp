"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Hash,
  FolderOpen,
  FileText,
  FolderTree,
  AlertCircle,
  Users,
  UserPlus,
  Calendar,
  X,
  LucideScrollText,
  UserRound,
  CalendarFold,
} from "lucide-react";
import { CommandeData } from "../tables/commande-table";

interface DetailOrderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: CommandeData | null;
}

export function DetailOrder({ open, onOpenChange, data }: DetailOrderProps) {
  if (!data) return null;

  const statusConfig = {
    pending: {
      label: "En attente",
      color:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    },
    approved: {
      label: "Approuvé",
      color:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    },
    rejected: {
      label: "Rejeté",
      color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    },
    "in-review": {
      label: "En révision",
      color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    },
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[420px] max-h-screen overflow-y-auto p-0 gap-0 overflow-x-hidden border-none">
        {/* Header with burgundy background */}
        <DialogHeader className="bg-[#8B1538] text-white p-6 m-4 rounded-lg pb-8 relative">
          <button
            onClick={() => onOpenChange(false)}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground z-10"
          >
            {/* <X className="h-4 w-4 text-white" /> */}
            <span className="sr-only">Close</span>
          </button>
          <DialogTitle className="text-xl font-semibold text-white">
            {data.titre}
          </DialogTitle>
          <p className="text-sm text-white/80 mt-1">{"Informations relatives à la commande"}</p>
        </DialogHeader>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Reference */}
          <div className="flex items-start gap-3">
            <div className="mt-1">
              <Hash className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-1">Référence</p>
              <Badge
                variant="secondary"
                className="bg-pink-100 text-pink-900 hover:bg-pink-100 dark:bg-pink-900 dark:text-pink-100"
              >
                {data.reference}
              </Badge>
            </div>
          </div>

          {/* Besoins */}
          <div className="flex items-start gap-3">
            <div className="mt-1">
              <LucideScrollText className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-1">{"Besoins"}</p>
              <div className="flex flex-col gap-1">
                {data.besoins.map((besoin, index) => (
                    <div key={index} className="flex flex-col gap-[2px]">
                        <p className="text-[14px] font-medium">{besoin.title}</p>
                        <p className="text-primary text-[12px] font-medium">{"x"+ besoin.qte + " Pièce"}</p>
                    </div>
                ))}
              </div>
            </div>
          </div>

          {/* Auteur */}
          <div className="flex items-start gap-3">
            <div className="mt-1">
              <UserRound className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-1">{"Initié par"}</p>
              <p className="text-[14px] font-semibold">
                {data.author}
              </p>
            </div>
          </div>

          {/* Date limite */}
          <div className="flex items-start gap-3">
            <div className="mt-1">
              <CalendarFold className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-1">{"Data limite"}</p>
              <p className="font-semibold">{data.datelimite}</p>
            </div>
          </div>

          {/* Created date */}
          <div className="flex items-start gap-3">
            <div className="mt-1">
              <Calendar className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-1">Créé le</p>
              <p className="font-semibold">12 Septembre 2025</p>
            </div>
          </div>

          {/* Modified date */}
          <div className="flex items-start gap-3">
            <div className="mt-1">
              <Calendar className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-1">Modifié le</p>
              <p className="font-semibold">12 Septembre 2025</p>
            </div>
          </div>
        </div>

        {/* Footer buttons */}
        <div className="flex w-full justify-end gap-3 p-6 pt-0">
          <Button className="bg-[#27272A] hover:bg-[#27272A]/80 text-white">
            {"Télécharger"}
          </Button>
          <Button className="bg-primary hover:bg-primary/80 text-white">
            {"Modifier"}
          </Button>
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
