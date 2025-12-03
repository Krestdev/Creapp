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
  LucideScrollText,
  UserRound,
  CalendarFold,
} from "lucide-react";
import { CommandRequestT } from "@/types/types";
import { RequestQueries } from "@/queries/requestModule";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { UserQueries } from "@/queries/baseModule";


interface DetailOrderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: CommandRequestT | null;
}

export function DetailOrder({ open, onOpenChange, data }: DetailOrderProps) {

  const request = new RequestQueries();
  const user = new UserQueries();

  const userData = useQuery({
    queryKey: ["users"],
    queryFn: async () => user.getAll(),
  });

  const requestData = useQuery({
    queryKey: ["requests"],
    queryFn: async () => request.getAll(),
  });

  if (!data) return null;

  const statusConfig = {
    pending: {
      label: "En attente",
      color:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    },
    approved: {
      label: "Soumis",
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
      <DialogContent className="max-w-[420px] max-h-[750px] overflow-y-auto p-0 gap-0 overflow-x-hidden border-none">
        {/* Header with burgundy background */}
        <DialogHeader className="bg-[#8B1538] text-white p-6 m-4 rounded-lg pb-8 relative">
          <DialogTitle className="text-xl font-semibold text-white">
            {data.title}
          </DialogTitle>
          <p className="text-sm text-white/80 mt-1">
            {"Informations relatives à la commande"}
          </p>
        </DialogHeader>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Reference */}
          <div className="flex items-start gap-3">
            <div className="mt-1">
              <Hash className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-1">
                {"Référence"}
              </p>
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
                {data.besoins?.map((besoin, index) => {
                  return (
                    <div key={index} className="flex flex-col gap-0.5">
                      <p className="text-[14px] font-medium first-letter:uppercase">{besoin?.label}</p>
                      <p className="text-primary text-[12px] font-medium">
                        {"x" + besoin?.quantity + " " + besoin?.unit}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Auteur */}
          <div className="flex items-start gap-3">
            <div className="mt-1">
              <UserRound className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-1">
                {"Initié par"}
              </p>
              <p className="text-[14px] font-semibold capitalize">{userData.data?.data.find((user) => user.id === data.userId)?.name}</p>
            </div>
          </div>

          {/* Date limite */}
          <div className="flex items-start gap-3">
            <div className="mt-1">
              <CalendarFold className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-1">
                {"Data limite"}
              </p>
              <p className="font-semibold">
                {format(data.dueDate, "PPP", { locale: fr })}
              </p>
            </div>
          </div>

          {/* Created date */}
          <div className="flex items-start gap-3">
            <div className="mt-1">
              <Calendar className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-1">{"Créé le"}</p>
              <p className="font-semibold">{format(data.createdAt!, "PPP", { locale: fr })}</p>
            </div>
          </div>

          {/* Modified date */}
          <div className="flex items-start gap-3">
            <div className="mt-1">
              <Calendar className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-1">{"Modifié le"}</p>
              <p className="font-semibold">{format(data.updatedAt!, "PPP", { locale: fr })}</p>
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
