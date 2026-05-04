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
import { Service, User } from "@/types/types";
import { format } from "date-fns";
import { fr } from "date-fns/locale/fr";
import {
  Calendar,
  UserRoundIcon,
  UsersRoundIcon,
  WarehouseIcon,
} from "lucide-react";
import React from "react";

interface Props {
  open: boolean;
  openChange: React.Dispatch<React.SetStateAction<boolean>>;
  service: Service;
  users: User[];
}

function ViewService({ open, openChange, service, users }: Props) {
  return (
    <Dialog open={open} onOpenChange={openChange}>
      <DialogContent className="sm:max-w-3xl w-full">
        <DialogHeader variant={"default"}>
          <DialogTitle>{service.label}</DialogTitle>
          <DialogDescription>
            {service.description ?? "Service sans description"}
          </DialogDescription>
        </DialogHeader>
        {/**Name */}
        <div className="grid grid-cols-1 @min-[520px]/dialog:grid-cols-2 gap-4">
          <div className="view-group">
            <span className="view-icon">
              <WarehouseIcon />
            </span>
            <div className="flex flex-col">
              <p className="view-group-title">{"Nom du service"}</p>
              <p className="font-semibold">{service.label}</p>
            </div>
          </div>
          {/**Chief */}
          <div className="view-group">
            <span className="view-icon">
              <UserRoundIcon />
            </span>
            <div className="flex flex-col">
              <p className="view-group-title">{"Chef du service"}</p>
              <p className="font-semibold">
                {service.head
                  ? service.head.firstName.concat(" ", service.head.lastName)
                  : "N/A"}
              </p>
            </div>
          </div>
          {/**Users */}
          <div className="view-group col-span-full">
            <span className="view-icon">
              <UsersRoundIcon />
            </span>
            <div className="w-full flex flex-col">
              <p className="view-group-title">
                {`Membres du service (${service.users.length})`}
              </p>
              <div className="grid grid-cols-1 @min-[520px]/dialog:grid-cols-2 gap-x-4">
                {service.users.length === 0 ? (
                  <p className="text-sm italic text-muted-foreground">
                    {"Aucun membre"}
                  </p>
                ) : (
                  service.users.map((user, id) => (
                    <p
                      key={user.id}
                      className="font-semibold text-sm flex gap-1.5"
                    >
                      {`${id + 1}. `}
                      {user.firstName.concat(" ", user.lastName)}
                    </p>
                  ))
                )}
              </div>
            </div>
          </div>
          {/**Created At */}
          <div className="view-group">
            <span className="view-icon">
              <Calendar />
            </span>
            <div className="flex flex-col">
              <p className="view-group-title">{"Date de création"}</p>
              <p className="font-semibold">
                {format(new Date(service.createdAt), "dd/MM/yyyy, p", {
                  locale: fr,
                })}
              </p>
            </div>
          </div>
          {/**Updated At */}
          <div className="view-group">
            <span className="view-icon">
              <Calendar />
            </span>
            <div className="flex flex-col">
              <p className="view-group-title">{"Date de mise à jour"}</p>
              <p className="font-semibold">
                {format(new Date(service.updatedAt), "dd/MM/yyyy, p", {
                  locale: fr,
                })}
              </p>
            </div>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant={"outline"}>Fermer</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ViewService;
