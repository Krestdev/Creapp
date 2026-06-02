"use client";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  openChange: React.Dispatch<React.SetStateAction<boolean>>;
  title?: string;
  description?: string;
  className?: string;
  refetch?: () => void;
  errorMessage?: string;
}

function ErrorDialog({
  open,
  openChange,
  title,
  description,
  className,
  refetch,
  errorMessage,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={openChange}>
      <DialogContent className={cn(className)}>
        <DialogHeader>
          <DialogTitle>{title ?? "Erreur"}</DialogTitle>
          <DialogDescription>
            {description ?? "Une erreur est survenue"}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-1.5 p-3 rounded bg-red-100">
          <p className="text-sm">{errorMessage}</p>
        </div>
        <DialogFooter>
          {refetch && <Button onClick={refetch}>{"Réessayer"}</Button>}
          <Button onClick={() => openChange(false)}>{"Fermer"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ErrorDialog;
