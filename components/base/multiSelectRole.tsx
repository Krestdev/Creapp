"use client";

import { Role } from "@/types/types";
import { LucidePlus, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";

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
            selected.map((role) => (
              <span
                key={role.id}
                className="bg-[#8B0E4E] text-white px-3 py-1 rounded-md flex items-center gap-2"
              >
                {role.label}
                <X
                  size={14}
                  className="cursor-pointer"
                  onClick={() => removeRole(role.id)}
                />
              </span>
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

        {/* Display selected items if display is request */}
        {/* {display === "request" && (
          <div className="flex flex-col gap-1.5 w-full">
            {selected.map((item, index) => (
              <div
                key={index}
                className="w-full flex flex-row items-center justify-between h-12 bg-[#FAFAFA] border border-[#E4E4E7] pl-2 gap-2 rounded-[6px]"
              >
                <div className="flex flex-col">
                  <p className="text-[#2F2F2F] text-sm ">{item.name}</p>
                  <p className="text-[12px] text-[#B0B0B0]">{`avant le ${format(
                    item.dueDate!,
                    "PPP",
                    { locale: fr }
                  )}`}</p>
                </div>
                <Button
                  type="button"
                  onClick={() => removeUser(item.id)}
                  variant={"outline"}
                  className="h-full"
                >
                  <LucideX size={16} color="red" />
                </Button>
              </div>
            ))}
          </div>
        )} */}

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
                  {role.label}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
