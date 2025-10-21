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
} from "lucide-react";
import type { TableData } from "./data-table";

interface DetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: TableData | null;
}

export function DetailModal({ open, onOpenChange, data }: DetailModalProps) {
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

  const currentStatus = statusConfig[data.status];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-screen overflow-y-auto p-0 gap-0 overflow-x-hidden border-none">
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
            Achat d'un nouveau casque
          </DialogTitle>
          <p className="text-sm text-white/80 mt-1">Details du besoin</p>
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

          {/* Project */}
          <div className="flex items-start gap-3">
            <div className="mt-1">
              <FolderOpen className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-1">Projet</p>
              <p className="font-semibold">{data.project}</p>
            </div>
          </div>

          {/* Description */}
          <div className="flex items-start gap-3">
            <div className="mt-1">
              <FileText className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-1">Description</p>
              <p className="text-sm">
                Un casque de protection individuel m'est nécessaire pour mes
                déplacement sur le chantier
              </p>
            </div>
          </div>

          {/* Category */}
          <div className="flex items-start gap-3">
            <div className="mt-1">
              <FolderTree className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-1">Catégorie</p>
              <p className="font-semibold">{data.category}</p>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-start gap-3">
            <div className="mt-1">
              <AlertCircle className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-1">Statut</p>
              <Badge className={currentStatus.color}>
                <X className="h-3 w-3 mr-1" />
                {currentStatus.label}
              </Badge>
            </div>
          </div>

          {/* Beneficiaries */}
          <div className="flex items-start gap-3">
            <div className="mt-1">
              <Users className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-1">
                Bénéficiaires
              </p>
              <p className="font-semibold">Jean Michel Atangana</p>
            </div>
          </div>

          {/* Initiated by */}
          <div className="flex items-start gap-3">
            <div className="mt-1">
              <UserPlus className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-1">Initié par</p>
              <p className="font-semibold">Jean Michel Atangana</p>
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

          {/* Deadline */}
          <div className="flex items-start gap-3">
            <div className="mt-1">
              <Calendar className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-1">Date limite</p>
              <p className="font-semibold">22 Octobre 2025</p>
            </div>
          </div>
        </div>

        {/* Footer buttons */}
        <div className="flex gap-3 p-6 pt-0">
          <Button className="flex-1 bg-[#003D82] hover:bg-[#002D62] text-white">
            Modifier
          </Button>
          <Button
            variant="outline"
            className="flex-1 bg-transparent"
            onClick={() => onOpenChange(false)}
          >
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
