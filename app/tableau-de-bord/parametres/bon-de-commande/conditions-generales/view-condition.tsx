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
import { CommandCondition } from "@/types/types";
import {
    LucideHash,
    TextQuote,
    TypeOutlineIcon
} from "lucide-react";
import React from "react";

interface Props {
  open: boolean;
  openChange: React.Dispatch<React.SetStateAction<boolean>>;
  condition: CommandCondition;
}

function ViewCondition({ open, openChange, condition }: Props) {
  return (
    <Dialog open={open} onOpenChange={openChange}>
      <DialogContent>
        <DialogHeader variant={"default"}>
          <DialogTitle className="uppercase">
            {condition.title}
          </DialogTitle>
          <DialogDescription>{`Informations relatives à la condition`}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 @min-[540px]/dialog:grid-cols-2">
          {/**Reference */}
          <div className="view-group">
            <span className="view-icon">
              <LucideHash />
            </span>
            <div className="flex flex-col">
              <p className="view-group-title">{"Référence"}</p>
              <div className="w-fit bg-primary-100 flex items-center justify-center px-1.5 rounded">
                <p className="text-primary-600 text-sm">{`BC-C-${condition.id}`}</p>
              </div>
            </div>
          </div>
          {/**Montant */}
          <div className="view-group">
            <span className="view-icon">
              <TypeOutlineIcon />
            </span>
            <div className="flex flex-col">
              <p className="view-group-title">{"Titre"}</p>
              <p className="font-semibold">{condition.title}</p>
            </div>
          </div>
          {/**Method */}
          <div className="view-group">
            <span className="view-icon">
              <TextQuote />
            </span>
            <div className="flex flex-col">
              <p className="view-group-title">{"Contenu"}</p>
              <p>
                {condition.content}
              </p>
            </div>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">{"Fermer"}</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ViewCondition;
