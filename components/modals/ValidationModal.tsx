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
import { Loader, Loader2 } from "lucide-react";

interface ValidationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "approve" | "reject";

  // Textes principaux
  title: string;
  description: string;

  // Textes pour les états de résultat
  successConfirmation: {
    title: string;
    description: string;
  };
  errorConfirmation: {
    title: string;
    description: string;
  };

  // Textes des boutons
  buttonTexts: {
    approve: string;
    reject: string;
    cancel: string;
    close: string;
    retry: string;
    processing: string;
  };

  // Textes des labels et placeholders
  labels: {
    rejectionReason: string;
    rejectionPlaceholder: string;
    rejectionError: string;
  };

  isMotifRequired?: boolean;

  /**
   * Fonction appelée lors de la validation
   * Elle reçoit un éventuel motif et retourne une Promise<boolean>
   * (true = succès, false = erreur)
   */
  onSubmit: (motif?: string) => Promise<boolean>;
}

export function ValidationModal({
  open,
  onOpenChange,
  type,
  title,
  description,
  successConfirmation,
  errorConfirmation,
  buttonTexts,
  labels,
  onSubmit,
  isMotifRequired = false,
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

  const handleSubmit = async () => {
    if (isMotifRequired && !isApprove && !motif.trim()) {
      setError(labels.rejectionError);
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
    if (result === "success") return successConfirmation.title;
    if (result === "error") return errorConfirmation.title;
    return title;
  };

  const renderDescription = () => {
    if (result === "success") return successConfirmation.description;
    if (result === "error") return errorConfirmation.description;
    return description;
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
        <DialogHeader
          className={`${gradient} text-white p-6 m-4 rounded-lg pb-8`}
        >
          <DialogTitle className="text-xl font-semibold text-white">
            {renderTitle()}
          </DialogTitle>
          <p className="text-sm text-white/80 mt-1">{renderDescription()}</p>
        </DialogHeader>

        {/* DESCRIPTION (uniquement pour approbation et avant résultat) */}
        {isApprove && !result && (
          <div className="px-6 pb-4">
            <p className="text-sm text-[#2F2F2F]">{description}</p>
          </div>
        )}

        {/* MOTIF uniquement pour rejet et avant résultat */}
        {isMotifRequired && !isApprove && !result && (
          <div className="px-6 pb-4">
            <label className="text-sm font-medium text-gray-700">
              {labels.rejectionReason}
            </label>
            <Textarea
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              placeholder={labels.rejectionPlaceholder}
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
                  {buttonTexts.retry}
                  {isPending && (
                    <Loader className="ml-2 h-4 w-4 animate-spin" />
                  )}
                </Button>
              )}
              <Button
                className="bg-gray-600 hover:bg-gray-700 text-white"
                onClick={() => onOpenChange(false)}
              >
                {buttonTexts.close}
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
                {buttonTexts.cancel}
                {isPending && <Loader className="ml-2 h-4 w-4 animate-spin" />}
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
                    {buttonTexts.processing}
                    <Loader className="ml-2 h-4 w-4 animate-spin" />
                  </>
                ) : isApprove ? (
                  buttonTexts.approve
                ) : (
                  buttonTexts.reject
                )}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
