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
import { categoryQ } from "@/queries/categoryModule";
import { Category } from "@/types/types";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

interface ShowCategoryProps {
  open: boolean;
  onOpenChange: React.Dispatch<React.SetStateAction<boolean>>;
  category: Category;
}

export function DeleteCategory({ open, onOpenChange, category }: ShowCategoryProps) {

    const {mutate, isPending} = useMutation({
    mutationFn: (id: number) => categoryQ.deleteCategory(id),
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {/* Header avec fond bordeaux */}
        <DialogHeader variant={"error"}>
          <DialogTitle>{`Supprimer ${category.label}`}</DialogTitle>
          <DialogDescription>
            {"Êtes-vous sûr de vouloir supprimer cette catégorie ?"}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
            <Button onClick={()=>{mutate(category.id)}} variant={"destructive"} disabled={isPending} isLoading={isPending}>
                {"Supprimer"}
            </Button>
          <DialogClose asChild>
            <Button
              variant="outline"
              disabled={isPending}
            >
              {"Annuler"}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
