"use client";

import { Role } from "@/types/types";
import { LucidePlus, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import { TranslateRole } from "@/lib/utils";

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
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fermer le dropdown quand on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const available = roles.filter((u) => !selected.some((s) => s.id === u.id));

  const addRole = (role: Role) => {
    onChange([...selected, role]);
  };

  const removeRole = (id: number) => {
    onChange(selected.filter((u) => u.id !== id));
  };

  return (
    <div
      className={`${className} w-full flex flex-col gap-2`}
      ref={dropdownRef}
    >
      <div
        className={`relative ${
          display === "Role" && "p-3 border"
        } rounded-lg flex flex-wrap gap-2 items-center`}
      >
        {/* Tags */}
        {display === "Role" &&
          (selected.length > 0 ? (
            selected.map((role, index) => (
              <div key={index} className="relative bg-[#8B0E4E] hover:bg-[#8B0E4E]/90 text-white px-3 py-1 rounded-md flex items-center gap-2 pr-8">
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
                    // onClick={() => removeRole(role.id)}
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

        <Button
          variant={"ghost"}
          type="button"
          onClick={() => setOpen(!open)}
          className={`${
            display === "Role" ? "ml-auto" : "mx-auto w-full border"
          }`}
        >
          {display === "Role" ? "Ajouter un Rôle" : ""}
          <LucidePlus
            className={`${open && "rotate-45"} transition-all ease-in-out`}
          />
        </Button>

        {open && (
          <div className="absolute right-0 top-full w-full bg-white shadow-md rounded-lg border z-20 transition-all ease-in-out max-h-60 overflow-y-auto">
            {available.length === 0 ? (
              <p className="p-2 text-sm text-gray-500 text-center">
                {display === "Role"
                  ? "Aucun role disponible"
                  : "Aucun utilisateur disponible"}
              </p>
            ) : (
              available.map((role) => (
                <div
                  key={role.id}
                  onClick={() => addRole(role)}
                  className="p-2 cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  {TranslateRole(role.label)}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
