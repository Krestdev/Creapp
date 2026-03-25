"use client";

import { useState, useRef, useEffect } from "react";
import { LucidePlus, LucideX, X, Search } from "lucide-react";
import { Button } from "../ui/button";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Input } from "../ui/input";

type User = {
  id: number;
  name: string;
  dueDate?: Date;
};

type Props = {
  users: User[];
  selected: User[];
  onChange: (list: User[]) => void;
  display: "user" | "request";
  className?: string;
  disabled?: boolean;
};

export default function MultiSelectUsers({
  users,
  selected,
  onChange,
  display,
  className,
  disabled = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fermer le dropdown quand on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
        setSearchTerm(""); // Réinitialiser la recherche quand on ferme
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Filtrer les utilisateurs disponibles en fonction de la recherche
  const available = users.filter(
    (u) => !selected.some((s) => s.id === u.id)
  );

  const filteredAvailable = available.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addUser = (user: User) => {
    onChange([...selected, user]);
    setSearchTerm(""); // Réinitialiser la recherche après ajout
  };

  const addUserAll = () => {
    onChange([...selected, ...users]);
    setSearchTerm(""); // Réinitialiser la recherche
  };

  const removeUserAll = () => {
    onChange([]);
    setSearchTerm(""); // Réinitialiser la recherche
  };

  const removeUser = (id: number) => {
    onChange(selected.filter((u) => u.id !== id));
  };

  // Réinitialiser la recherche quand on ferme le dropdown
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setSearchTerm("");
    }
  };

  return (
    <div
      className={`${className} w-full flex flex-col gap-2`}
      ref={dropdownRef}
    >
      <div
        className={`relative ${display === "user" && "p-3 border"
          } rounded-lg flex flex-wrap gap-2 items-center`}
      >
        {/* Tags */}
        {display === "user" &&
          (selected.length > 0 ? (
            selected.map((user) => (
              <button
                disabled={disabled}
                key={user.id}
                className={`${disabled ? "bg-[#8B0E4E]/50" : "bg-[#8B0E4E]"} text-white px-3 py-1 rounded-md flex items-center gap-2`}
              >
                {user.name}
                <X
                  size={14}
                  className="cursor-pointer"
                  onClick={() => removeUser(user.id)}
                />
              </button>
            ))
          ) : (
            <span className="text-gray-500">
              {"Aucun utilisateur selectionné"}
            </span>
          ))}

        <Button
          variant={"ghost"}
          type="button"
          onClick={() => handleOpenChange(!open)}
          className={`${display === "user" ? "ml-auto" : "mx-auto w-full border"
            }`}
        >
          {display === "request" ? "Ajouter un besoin" : ""}
          <LucidePlus
            className={`${open && "rotate-45"} transition-all ease-in-out`}
          />
        </Button>

        {/* Display selected items if display is request */}
        {display === "request" && (
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
                  disabled={disabled}
                >
                  <LucideX size={16} color="red" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {open && (
          <div className="absolute right-0 top-full w-full bg-white shadow-md rounded-lg border z-20 transition-all ease-in-out">
            {/* Barre de recherche */}
            <div className="p-2 border-b sticky top-0 bg-white">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder={
                    display === "request"
                      ? "Rechercher un besoin..."
                      : "Rechercher un utilisateur..."
                  }
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 h-8 text-sm"
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  >
                    <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>
            </div>

            {/* Liste des résultats */}
            <div className="max-h-60 overflow-y-auto">
              {filteredAvailable.length === 0 ? (
                <>
                  {available.length > 0 && searchTerm && (
                    <p className="p-2 text-sm text-gray-500 text-center">
                      {display === "request"
                        ? "Aucun besoin trouvé"
                        : "Aucun utilisateur trouvé"}
                    </p>
                  )}
                  {available.length === 0 && (
                    <>
                      <div
                        className="p-2 cursor-pointer hover:bg-gray-100 transition-colors border-b"
                        onClick={() => removeUserAll()}
                      >
                        {"Tout retirer"}
                      </div>
                      <p className="p-2 text-sm text-gray-500 text-center">
                        {display === "request"
                          ? "Aucun besoin disponible"
                          : "Aucun utilisateur disponible"}
                      </p>
                    </>
                  )}
                </>
              ) : (
                <>
                  {/* Tous les utilisateurs disponibles */}
                  {available.length > 0 && searchTerm === "" && (
                    <div
                      className="p-2 cursor-pointer hover:bg-gray-100 transition-colors border-b"
                      onClick={() => addUserAll()}
                    >
                      {"Tous les utilisateurs"}
                    </div>
                  )}
                  {filteredAvailable.map((user) => (
                    <div
                      key={user.id}
                      onClick={() => addUser(user)}
                      className="p-2 cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      {user.name}
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}