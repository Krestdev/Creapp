"use client";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  openChange: React.Dispatch<React.SetStateAction<boolean>>;
  title?: string;
  description?: string;
  className?: string;
}

function LoadingDialog({
  open,
  openChange,
  title,
  description,
  className,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={openChange}>
      <DialogContent className={cn(className)}>
        <DialogHeader>
          <DialogTitle>{title ?? "Chargement..."}</DialogTitle>
          <DialogDescription>
            {description ?? "Veuillez patienter pendant le chargement"}
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-center py-3">
          <Loader2 className="animate-spin" size={24} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default LoadingDialog;
