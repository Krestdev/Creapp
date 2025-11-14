"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { TableData } from "../base/data-table";

interface ValidationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "approve" | "reject";
  title: string | undefined;
  description: string | undefined;
  /** 
   * Fonction appelée lors de la validation
   * Elle reçoit un éventuel motif et retourne une Promise<boolean>
   * (true = succès, false = erreur)
   */
  onSubmit: (motif?: string) => Promise<boolean>;
  selectedItem: TableData | null;
}

export function ValidationModal({
  open,
  onOpenChange,
  type,
  title,
  description,
  onSubmit,
  selectedItem
}: ValidationModalProps) {
  const [motif, setMotif] = useState("");
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [result, setResult] = useState<"success" | "error" | null>(null);

  const isApprove = type === "approve";

  // Réinitialisation à chaque ouverture
  useEffect(() => {
    if (open) {
      setMotif("");
      setError("");
      setIsPending(false);
      setResult(null);
    }
  }, [open]);

  // Le handleSubmit n’est plus interne : il exécute la prop onSubmit
  const handleSubmit = async () => {
    if (!isApprove && !motif.trim()) {
      setError("Veuillez fournir un motif");
      return;
    }

    setIsPending(true);
    setError("");

    try {
      const success = await onSubmit(motif);
      setResult(success ? "success" : "error");
    } catch {
      setResult("error");
    } finally {
      setIsPending(false);
    }
  };

  // Affichage dynamique
  const renderTitle = () => {
    if (result === "success") return "Succès ✅";
    if (result === "error") return "Erreur ❌";
    return title;
  };

  const renderDescription = () => {
    if (result === "success")
      return isApprove
        ? "L’opération a été approuvée avec succès."
        : "L’opération a été rejetée avec succès.";
    if (result === "error")
      return "Une erreur est survenue. Vous pouvez réessayer.";
    return selectedItem?.title;
  };

  const gradient =
    result === "error"
      ? "bg-gradient-to-r from-[#B91C1C] to-[#7F1D1D]"
      : result === "success"
      ? "bg-gradient-to-r from-[#15803D] to-[#0B411F]"
      : isApprove
      ? "bg-gradient-to-r from-[#15803D] to-[#0B411F]"
      : "bg-gradient-to-r from-[#B91C1C] to-[#7F1D1D]";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-screen overflow-y-auto p-0 gap-0 border-none">
        {/* HEADER */}
        <DialogHeader className={`${gradient} text-white p-6 m-4 rounded-lg pb-8`}>
          <DialogTitle className="text-xl font-semibold text-white">
            {renderTitle()}
          </DialogTitle>
          <p className="text-sm text-white/80 mt-1">{renderDescription()}</p>
        </DialogHeader>

        {/* DESCRIPTION */}
        {isApprove && (
          <div className="px-6 pb-4">
            <p className="text-sm text-[#2F2F2F]">{description}</p>
          </div>
        )}
        {/* MOTIF uniquement pour rejet et avant résultat */}
        {!isApprove && !result && (
          <div className="px-6 pb-4">
            <label className="text-sm font-medium text-gray-700">
              Motif du rejet
            </label>
            <Textarea
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              placeholder="Expliquez la raison du rejet..."
              className="mt-2 resize-none"
              disabled={isPending}
            />
            {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
          </div>
        )}

        {/* FOOTER */}
        <div className="flex justify-end gap-3 p-6 pt-0">
          {result ? (
            <>
              {result === "error" && (
                <Button
                  className="bg-yellow-600 hover:bg-yellow-700 text-white"
                  onClick={handleSubmit}
                  disabled={isPending}
                >
                  Réessayer
                </Button>
              )}
              <Button
                className="bg-gray-600 hover:bg-gray-700 text-white"
                onClick={() => onOpenChange(false)}
              >
                Fermer
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                className="bg-transparent"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Annuler
              </Button>
              <Button
                className={`text-white ${
                  isApprove
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
                onClick={handleSubmit}
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Traitement...
                  </>
                ) : isApprove ? (
                  "Approuver"
                ) : (
                  "Rejeter"
                )}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
