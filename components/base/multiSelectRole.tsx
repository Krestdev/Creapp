"use client";

import { Role } from "@/types/types";
import { LucidePlus, X } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import { TranslateRole } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// type User = {
//   id: number;
//   label: string;
//   dueDate?: Date;
// };

type Props = {
  roles: Role[];
  selected: Role[];
  onChange: (list: Role[]) => void;
  display: "Role";
  className?: string;
};

export default function MultiSelectRole({
  roles,
  selected,
  onChange,
  display,
  className,
}: Props) {
  const [open, setOpen] = useState(false);

  const available = roles.filter((u) => !selected.some((s) => s.id === u.id));

  const addRole = (role: Role) => {
    onChange([...selected, role]);
    // On ne ferme pas le popover ici pour permettre la sélection multiple
  };

  const removeRole = (id: number) => {
    onChange(selected.filter((u) => u.id !== id));
  };

  return (
    <div className={`${className} w-full flex flex-col gap-2`}>
      <div
        className={`relative ${display === "Role" && "p-3 border"
          } rounded-lg flex flex-wrap gap-2 items-center`}
      >
        {/* Tags */}
        {display === "Role" &&
          (selected.length > 0 ? (
            selected.map((role, index) => (
              <div
                key={index}
                className="relative bg-[#8B0E4E] hover:bg-[#8B0E4E]/90 text-white px-3 py-1 rounded-md flex items-center gap-2 pr-8"
              >
                <Button
                  className="bg-transparent hover:bg-transparent px-0"
                  type="button"
                  key={role.id}
                  disabled={role.label === "MANAGER"}
                >
                  {TranslateRole(role.label)}
                </Button>
                {role.label === "MANAGER" ? (
                  <X
                    size={20}
                    className="cursor-pointer z-10 absolute top-3 right-2 opacity-40"
                  />
                ) : (
                  <X
                    size={20}
                    className="cursor-pointer z-10 absolute top-3 right-2"
                    onClick={() => removeRole(role.id)}
                  />
                )}
              </div>
            ))
          ) : (
            <span className="text-gray-500">{"Aucun Rôle sélectionné"}</span>
          ))}

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant={"ghost"}
              type="button"
              className={`${display === "Role" ? "ml-auto" : "mx-auto w-full border"
                }`}
            >
              {display === "Role" ? "Ajouter un Rôle" : ""}
              <LucidePlus
                className={`${open && "rotate-45"} transition-all ease-in-out`}
              />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-64 p-0"
            align="end"
            side="bottom"
            sideOffset={5}
            // Empêche la fermeture automatique au clic à l'intérieur
            onInteractOutside={(e) => {
              // Permet de fermer seulement quand on clique en dehors
              // Pas de logique spéciale ici, le comportement par défaut est bon
            }}
          >
            <div className="max-h-60 overflow-y-auto">
              {available.length === 0 ? (
                <p className="p-3 text-sm text-gray-500 text-center">
                  {display === "Role"
                    ? "Aucun role disponible"
                    : "Aucun utilisateur disponible"}
                </p>
              ) : (
                available.map((role) => (
                  <div
                    key={role.id}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      addRole(role);
                    }}
                    className="p-3 cursor-pointer hover:bg-gray-100 transition-colors border-b last:border-b-0"
                  >
                    {TranslateRole(role.label)}
                  </div>
                ))
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}