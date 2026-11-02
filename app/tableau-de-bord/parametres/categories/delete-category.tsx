"use client";
import { DeleteDialog } from "@/components/modals/delete-dialog";
import { categoryQ } from "@/queries/categoryModule";
import { Category } from "@/types/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React from "react";
import { toast } from "sonner";

interface ShowCategoryProps {
  open: boolean;
  onOpenChange: React.Dispatch<React.SetStateAction<boolean>>;
  category: Category;
}

export function DeleteCategory({ open, onOpenChange, category }: ShowCategoryProps) {
  const queryClient = useQueryClient();
  const { mutate, isPending } = useMutation({
    mutationFn: (id: number) => categoryQ.deleteCategory(id),
    onSuccess() {
      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return (
    <DeleteDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Supprimer la catégorie « ${category.label} » ?`}
      description="Êtes-vous sûr de vouloir supprimer cette catégorie ?"
      confirmLabel="Supprimer la catégorie"
      isPending={isPending}
      onConfirm={() => mutate(category.id)}
    />
  );
}
