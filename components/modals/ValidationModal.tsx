"use client";
import { ActionDialog } from "@/components/ds/action-dialog";
import { TextareaField } from "@/components/ds/form-field";
import { CircleCheck, CircleX, TriangleAlert } from "lucide-react";
import { useState } from "react";

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

/**
 * Approbation ou rejet avec écran de résultat (succès / erreur avec
 * « Réessayer »), même présentation que `ReasonDialog`. Le motif de rejet
 * est demandé quand `isMotifRequired` est vrai.
 */
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
  const [touched, setTouched] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [result, setResult] = useState<"success" | "error" | null>(null);

  const isApprove = type === "approve";
  const needsMotif = isMotifRequired && !isApprove && !result;
  const motifMissing = needsMotif && !motif.trim();

  const [prevOpen, setPrevOpen] = useState(false);

  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setMotif("");
      setTouched(false);
      setIsPending(false);
      setResult(null);
    }
  }

  const handleSubmit = async () => {
    if (motifMissing) {
      setTouched(true);
      return;
    }

    setIsPending(true);

    try {
      const success = await onSubmit(motif);
      setResult(success ? "success" : "error");
    } catch {
      setResult("error");
    } finally {
      setIsPending(false);
    }
  };

  const tone =
    result === "error"
      ? "danger"
      : result === "success" || isApprove
        ? "success"
        : "danger";
  const Icon =
    result === "error"
      ? TriangleAlert
      : result === "success" || isApprove
        ? CircleCheck
        : CircleX;
  const heading =
    result === "success"
      ? successConfirmation
      : result === "error"
        ? errorConfirmation
        : { title, description };

  return (
    <ActionDialog
      open={open}
      onOpenChange={onOpenChange}
      tone={tone}
      icon={Icon}
      title={heading.title}
      description={heading.description}
      cancelLabel={result ? buttonTexts.close : buttonTexts.cancel}
      confirmLabel={
        result === "success"
          ? undefined
          : result === "error"
            ? buttonTexts.retry
            : isApprove
              ? buttonTexts.approve
              : buttonTexts.reject
      }
      confirmVariant={
        result === "error" || isApprove ? "default" : "destructive"
      }
      confirmDisabled={motifMissing}
      isPending={isPending}
      onConfirm={handleSubmit}
    >
      {needsMotif && (
        <TextareaField
          label={labels.rejectionReason}
          required
          value={motif}
          maxLength={500}
          placeholder={labels.rejectionPlaceholder}
          onChange={(e) => setMotif(e.target.value)}
          onBlur={() => setTouched(true)}
          error={touched && motifMissing ? labels.rejectionError : undefined}
          helper="Visible par l’émetteur et conservé dans l’historique."
          counter={{ value: motif.length, max: 500 }}
          className="[&_textarea]:h-26"
          disabled={isPending}
        />
      )}
    </ActionDialog>
  );
}
