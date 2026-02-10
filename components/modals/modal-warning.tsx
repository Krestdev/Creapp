"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
  variant?: "warning" | "error" | "info" | "success";
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
    // avec le vert et l'autre vert plus foncé
    success: {
      header: "bg-gradient-to-r from-[#16A34A] to-[#052c14]",
      button: "bg-[#16A34A] hover:bg-[#16A34A]",
    }
  };

  const handleAction = () => {
    if (onAction) {
      onAction();
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {/* Header with dynamic background based on variant */}
        <DialogHeader className={variantStyles[variant].header}>
          <DialogTitle className="text-xl font-semibold text-white">
            {title + " " + name}
          </DialogTitle>
          {description ?
            <DialogDescription>
              {description}
            </DialogDescription>
          : <DialogDescription/>}
        </DialogHeader>

        {/* Message content */}
        {message &&
          <p className="text-foreground">{message}</p>
        }

        {/* Footer buttons */}
        <DialogFooter>
          <Button
            className={`text-white ${variantStyles[variant].button}`}
            onClick={handleAction}
          >
            {actionText}
          </Button>
          <DialogClose asChild>
            <Button variant={"outline"}>{"Annuler"}</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}