import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type Props = {
  children: React.ReactNode;
  id: number;
  action: (id: number) => void;
  name?: string;
  section?: string;
};

function ModalWarning({ children, id, action, name = "an element", section }: Props) {

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[420px] sm:w-full">
        <DialogHeader>
          <DialogTitle className="text-[20px] font-semibold leading-[100%] tracking-[-2%]">{`Supprimer - ${name}`}</DialogTitle>
          <DialogDescription className="text-[#717171] text-[14px] font-normal">
              {`Etes-vos sûr de vouloir supprimer ${section}? \n Cette action est irréversible`}
          </DialogDescription>
        </DialogHeader>
        <span className="flex gap-3 flex-wrap items-center justify-end">
          <DialogClose asChild>
            <Button className="h-10" variant={"destructive"} onClick={() => action(id)}>
              {"Supprimer"}
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button className="h-10" variant={"outline"}>{"Annuler"}</Button>
          </DialogClose>
        </span>
      </DialogContent>
    </Dialog>
  );
}

export default ModalWarning;
