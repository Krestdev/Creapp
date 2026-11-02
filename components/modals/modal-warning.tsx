"use client";
import {
  ActionDialog,
  type ActionDialogTone,
} from "@/components/ds/action-dialog";
import {
  CircleCheck,
  Info,
  Trash2,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";

interface ModalWarningProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  message?: string;
  actionText?: string;
  onAction?: () => void;
  variant?: "warning" | "error" | "info" | "success";
  /** Complète le titre (« Supprimer » + nom de l'objet). */
  name?: string;
  /** Mise en garde affichée en gras à la suite du message. */
  warning?: string;
  /** Remplace l'icône du variant. */
  icon?: LucideIcon;
}

const variants: Record<
  NonNullable<ModalWarningProps["variant"]>,
  { tone: ActionDialogTone; icon: LucideIcon; destructive: boolean }
> = {
  warning: { tone: "warning", icon: TriangleAlert, destructive: false },
  error: { tone: "danger", icon: TriangleAlert, destructive: true },
  info: { tone: "review", icon: Info, destructive: false },
  success: { tone: "success", icon: CircleCheck, destructive: false },
};

/**
 * Confirmation générique (suppression, annulation, suspension…), même
 * présentation que `ReasonDialog`. `error` = action destructive (bouton rouge) ;
 * une suppression reçoit l'icône corbeille. La boîte se referme après
 * `onAction`.
 */
export function ModalWarning({
  open,
  onOpenChange,
  title = "Attention",
  description = "",
  message = "",
  actionText = "Confirmer",
  onAction,
  variant = "warning",
  name = "",
  warning = "",
  icon,
}: ModalWarningProps) {
  const config = variants[variant];
  const fullTitle = `${title} ${name}`.replace(/\s+/g, " ").trim();
  const Icon =
    icon ??
    (variant === "error" && /supprim/i.test(title) ? Trash2 : config.icon);

  const handleAction = () => {
    onAction?.();
    onOpenChange(false);
  };

  return (
    <ActionDialog
      open={open}
      onOpenChange={onOpenChange}
      tone={config.tone}
      icon={Icon}
      title={fullTitle}
      description={description || undefined}
      confirmLabel={actionText}
      confirmVariant={config.destructive ? "destructive" : "default"}
      onConfirm={handleAction}
    >
      {message && (
        <p className="text-body text-text-primary">
          {message}
          {warning && <span className="font-bold">{` ${warning}`}</span>}
        </p>
      )}
    </ActionDialog>
  );
}
