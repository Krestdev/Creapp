"use client";
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

function ViewService({ open, openChange, service }: Props) {
  return (
    <Drawer open={open} onOpenChange={openChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerEyebrow>{"Service"}</DrawerEyebrow>
          <DrawerTitle>{service.label}</DrawerTitle>
          <DrawerDescription>{"Consultez les informations associées au service"}</DrawerDescription>
        </DrawerHeader>
        <DrawerBody className="flex flex-col gap-3 [&>*]:shrink-0">
        {/**Name */}
        <div className="grid grid-cols-1 gap-3 @min-[520px]/dialog:grid-cols-2">
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
              <div className="grid grid-cols-1 gap-3 @min-[520px]/dialog:grid-cols-2">
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
        
        </DrawerBody>
        <DrawerFooter pinned>
          <DrawerClose asChild>
            <Button variant={"outline"}>Fermer</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

export default ViewService;
