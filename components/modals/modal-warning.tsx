"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ModalWarningProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  message?: string;
  actionText?: string;
  onAction?: () => void;
  variant?: "warning" | "error" | "info";
  name?: string
}

export function ModalWarning({ 
  open, 
  onOpenChange, 
  title = "Attention",
  description = "",
  message = "",
  actionText = "Confirmer",
  onAction,
  variant = "warning",
  name = ""
}: ModalWarningProps) {
  
  const variantStyles = {
    warning: {
      header: "bg-gradient-to-r from-[#D97706] to-[#92400E]",
      button: "bg-[#D97706] hover:bg-[#B45309]",
    },
    error: {
      header: "bg-gradient-to-r from-[#DC2626] to-[#7F1D1D]",
      button: "bg-[#DC2626] hover:bg-[#B91C1C]",
    },
    info: {
      header: "bg-gradient-to-r from-[#2563EB] to-[#1E40AF]",
      button: "bg-[#2563EB] hover:bg-[#1D4ED8]",
    },
  };

  const handleAction = () => {
    if (onAction) {
      onAction();
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-screen overflow-y-auto p-0 gap-0 overflow-x-hidden border-none">
        {/* Header with dynamic background based on variant */}
        <DialogHeader className={`${variantStyles[variant].header} text-white p-6 m-4 rounded-lg pb-8 relative`}>
          <DialogTitle className="text-xl font-semibold text-white">
            {title + " " + name}
          </DialogTitle>
          {description && (
            <p className="text-sm text-white/80 mt-1">
              {description}
            </p>
          )}
        </DialogHeader>

        {/* Message content */}
        {message && <div className="px-6 py-4">
          <p className="text-foreground">{message}</p>
        </div>}

        {/* Footer buttons */}
        <div className="flex justify-end gap-3 p-6 pt-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            {"Fermer"}
          </Button>
          <Button
            className={`text-white ${variantStyles[variant].button}`}
            onClick={handleAction}
          >
            {actionText}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}