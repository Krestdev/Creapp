"use client";
import { RejectDialog } from "@/components/modals/reject-dialog";
import { TableData } from "@/types/types";
import { toast } from "sonner";

interface DetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: TableData | null;
}

/**
 * Rejet d'un besoin avec motif. Ébauche : le motif est seulement affiché dans
 * un toast, à brancher sur la mutation de rejet.
 */
export function RejectModal({ open, onOpenChange, data }: DetailModalProps) {
  if (!data) return null;

  return (
    <RejectDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Rejeter ce besoin ?"
      description="Le rejet est définitif : le besoin sort du circuit. L’émetteur est notifié avec votre motif."
      reason={{ placeholder: "Raison du rejet" }}
      confirmLabel="Rejeter le besoin"
      onConfirm={(motif) => {
        toast(
          <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
            <code className="text-white">
              {JSON.stringify({ motif }, null, 2)}
            </code>
          </pre>,
        );
        onOpenChange(false);
      }}
    />
  );
}
