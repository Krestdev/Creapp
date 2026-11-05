"use client";

import AvatarText from "@/components/avatar-text";
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
import { Category, User } from "@/types/types";
import {
  ListChecksIcon,
  MessageSquareTextIcon,
  TextSelectIcon,
  TypeIcon,
} from "lucide-react";

interface ShowCategoryProps {
  open: boolean;
  onOpenChange: React.Dispatch<React.SetStateAction<boolean>>;
  category: Category;
  users: Array<User>;
}

export function ViewCategory({
  open,
  onOpenChange,
  category,
  users,
}: ShowCategoryProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerEyebrow>{"Catégorie"}</DrawerEyebrow>
          <DrawerTitle>{category.label}</DrawerTitle>
          <DrawerDescription>{"Consultez les informations associées à la catégorie"}</DrawerDescription>
        </DrawerHeader>
        <DrawerBody className="flex flex-col gap-3 [&>*]:shrink-0">
        {/* Title */}
        <div className="view-group">
          <span className="view-icon">
            <TypeIcon />
          </span>
          <div className="flex flex-col">
            <p className="view-group-title">{"Nom de la catégorie"}</p>
            <p className="font-semibold capitalize">{category.label}</p>
          </div>
        </div>
        {/**Description */}
        <div className="view-group">
          <span className="view-icon">
            <MessageSquareTextIcon />
          </span>
          <div className="flex flex-col">
            <p className="view-group-title">{"Description"}</p>
            <p>
              {category.description && category.description.length > 0
                ? category.description
                : "Non renseigné"}
            </p>
          </div>
        </div>
        {/**Type */}
        <div className="view-group">
          <span className="view-icon">
            <TextSelectIcon />
          </span>
          <div className="flex flex-col">
            <p className="view-group-title">{"Type"}</p>
            <p className="font-semibold">
              {category.type?.label ?? "Non défini"}
            </p>
          </div>
        </div>
        <div className="view-group">
          <span className="view-icon">
            <ListChecksIcon />
          </span>
          <div className="flex flex-col">
            <p className="view-group-title">{"Approbateurs"}</p>
            {category.validators.length === 0 ? (
              <p>
                {"Aucun validateur défini. "}
                <span className="text-destructive">
                  {
                    "Vous serez dans l'incapacité de valider les besoins lié à cette catégorie."
                  }
                </span>
              </p>
            ) : (
              <div className="mt-2">
                {category.validators
                  .sort((a, b) => a.rank - b.rank)
                  .map(({ userId }, id) => {
                    const user = users.find((u) => u.id === userId);
                    if (!!user)
                      return (
                        <div
                          key={userId}
                          className="w-full max-w-sm  flex flex-col items-center gap-1.5 px-3 py-1.5 rounded-sm bg-gray-50 border border-gray-200"
                        >
                          <div className="w-full flex items-center gap-2">
                            <AvatarText user={user} />
                            <div className="flex flex-col">
                              <p className="uppercase font-semibold">
                                {user.firstName.concat(" ", user.lastName)}
                              </p>
                              <p className="text-gray-600">
                                {"Rang: "}
                                {id === category.validators.length - 1
                                  ? "Dernier validateur"
                                  : id + 1}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                  })}
              </div>
            )}
          </div>
        </div>
        {/* Footer */}
        
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
