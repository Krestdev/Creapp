import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerEyebrow,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
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
    <Drawer open={open} onOpenChange={openChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerEyebrow>{"Condition"}</DrawerEyebrow>
          <DrawerTitle>{condition.title}</DrawerTitle>
          <DrawerDescription>{"Consultez les informations associées à la condition"}</DrawerDescription>
        </DrawerHeader>
        <DrawerBody className="flex flex-col gap-3 [&>*]:shrink-0">
        <div className="grid grid-cols-1 gap-3 @min-[520px]/dialog:grid-cols-2">
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
        
        </DrawerBody>
        <DrawerFooter pinned>
          <DrawerClose asChild>
            <Button variant="outline">{"Fermer"}</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

export default ViewCondition;
