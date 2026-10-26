"use client";

// ----------------------------------------------------------------------
// TEMPORAIRE : permet de corriger manuellement la date limite d'un besoin
// depuis la page "Tous les besoins". À retirer une fois les corrections
// nécessaires effectuées (voir table-besoins.tsx pour le bouton associé).
// ----------------------------------------------------------------------

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { requestQ } from "@/queries/requestModule";
import { RequestModelT } from "@/types/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Props {
  request?: RequestModelT;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function EditDueDateTemp({ request, open, onOpenChange }: Props) {
  const queryClient = useQueryClient();
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [calendarOpen, setCalendarOpen] = useState(false);

  useEffect(() => {
    if (open && request?.dueDate) {
      setDate(new Date(request.dueDate));
    }
  }, [open, request]);

  const { mutate, isPending } = useMutation({
    mutationFn: async (dueDate: Date) => {
      if (!request) throw new Error("Aucun besoin sélectionné");
      return requestQ.update(request.id, { dueDate });
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      toast.success("Date limite modifiée avec succès !");
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error(
        error.message || "Une erreur est survenue lors de la modification",
      );
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{"Modifier la date limite (temporaire)"}</DialogTitle>
          <DialogDescription>
            {request?.label
              ? `Besoin : ${request.label}`
              : "Sélectionnez la nouvelle date limite."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-2">
          <Label>{"Date limite"}</Label>
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? (
                  format(date, "PPP", { locale: fr })
                ) : (
                  <span>{"Choisir une date"}</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => {
                  setDate(d);
                  setCalendarOpen(false);
                }}
                locale={fr}
              />
            </PopoverContent>
          </Popover>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            type="button"
            onClick={() => onOpenChange(false)}
          >
            {"Annuler"}
          </Button>
          <Button
            variant="primary"
            type="button"
            disabled={!date || isPending}
            onClick={() => date && mutate(date)}
          >
            {isPending ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default EditDueDateTemp;
