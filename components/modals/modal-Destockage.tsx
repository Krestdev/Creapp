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
  Calendar,
  UserRound,
  CalendarFold,
} from "lucide-react";
import { TableData } from "@/types/types";

interface DetailOrderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: TableData | null;
}

export function ModalDestockage({
  open,
  onOpenChange,
  data,
}: DetailOrderProps) {
  if (!data) return null;

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
            {data.title}
          </DialogTitle>
          <p className="text-sm text-white/80 mt-1">{"Déstockage du besoin"}</p>
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

          {/* Projet */}
          <div className="flex items-start gap-3">
            <div className="mt-1">
              <UserRound className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-1">{"Projet"}</p>
              <p className="text-[14px] font-semibold">{data.project}</p>
            </div>
          </div>

          {/* Description */}
          <div className="flex items-start gap-3">
            <div className="mt-1">
              <UserRound className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-1">
                {"Description"}
              </p>
              <p className="text-[14px] text-[#2F2F2F]">{data.description}</p>
            </div>
          </div>

          {/* Bénéficiaires */}
          <div className="flex items-start gap-3">
            <div className="mt-1">
              <CalendarFold className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-1">
                {"Bénéficiaires"}
              </p>
              <p className="font-semibold">{data.beneficiaires}</p>
            </div>
          </div>

          {/* Initié par */}
          <div className="flex items-start gap-3">
            <div className="mt-1">
              <Calendar className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-1">
                {"Initié par"}
              </p>
              <p className="font-semibold">{data.emeteur}</p>
            </div>
          </div>
        </div>

        {/* Footer buttons */}
        <div className="flex w-full justify-end gap-3 p-6 pt-0">
          <Button className="bg-primary hover:bg-primary/80 text-white">
            {"Déstocker"}
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
