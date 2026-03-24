"use client";

import { useState, useRef, useEffect } from "react";
import { LucidePlus, LucideX, X, Search } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { User } from "@/types/types";

type Props = {
  users: User[];
  selected: User[];
  onChange: (list: User[]) => void;
  display: "user" | "request";
  className?: string;
  placeholder?: string;
  showMail?: boolean;
};

export default function MultiSelectUsers({
  users,
  selected,
  onChange,
  display,
  className,
  placeholder = "Aucun utilisateur selectionné",
  showMail = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Fermer le dropdown quand on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
        setSearchTerm(""); // Reset search when closing
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Focus sur l'input de recherche quand le dropdown s'ouvre
  useEffect(() => {
    if (open && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [open]);

  const available = users.filter(
    (u) =>
      !selected.some((s) => s.id === u.id) &&
      (searchTerm === "" ||
        `${u.firstName} ${u.lastName}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (showMail && u.email?.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  const addUser = (user: User) => {
    onChange([...selected, user]);
    setSearchTerm(""); // Reset search after adding
  };

  const addUserAll = () => {
    const newUsers = users.filter(
      (u) => !selected.some((s) => s.id === u.id)
    );
    onChange([...selected, ...newUsers]);
    setSearchTerm("");
  };

  const removeUserAll = () => {
    onChange([]);
    setSearchTerm("");
  };

  const removeUser = (id: number) => {
    onChange(selected.filter((u) => u.id !== id));
  };

  // Fonction pour filtrer et afficher les utilisateurs avec surbrillance
  const highlightText = (text: string, search: string) => {
    if (!search) return text;
    const parts = text.split(new RegExp(`(${search})`, "gi"));
    return parts.map((part, i) =>
      part.toLowerCase() === search.toLowerCase() ? (
        <span key={i} className="bg-yellow-200 font-semibold">
          {part}
        </span>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  };

  return (
    <div
      className={`${className} w-full flex flex-col gap-2`}
      ref={dropdownRef}
    >
      <div
        className={`relative ${
          display === "user" && "p-3 border"
        } rounded-lg flex flex-wrap gap-2 items-center`}
      >
        {/* Tags */}
        {display === "user" &&
          (selected.length > 0 ? (
            selected.map((user) => (
              <span
                key={user.id}
                className="bg-[#8B0E4E] text-white px-3 py-1 rounded-md flex items-center gap-2"
              >
                {`${user.firstName} ${user.lastName}`}
                <X
                  size={14}
                  className="cursor-pointer"
                  onClick={() => removeUser(user.id)}
                />
              </span>
            ))
          ) : (
            <span className="text-gray-500">{placeholder}</span>
          ))}

        <Button
          variant={"ghost"}
          type="button"
          onClick={() => setOpen(!open)}
          className={`${
            display === "user" ? "ml-auto" : "mx-auto w-full border"
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
                  <p className="text-[#2F2F2F] text-sm ">{`${item.firstName} ${item.lastName}`}</p>
                  <p className="text-[12px] text-[#B0B0B0]">{`avant le ${format(
                    item.lastConnection!,
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
        )}

        {open && (
          <div className="absolute right-0 top-full w-full bg-white shadow-md rounded-lg border z-20 transition-all ease-in-out max-h-96 overflow-hidden flex flex-col">
            {/* Barre de recherche */}
            <div className="p-2 border-b sticky top-0 bg-white">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Rechercher un utilisateur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-8"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>
            </div>

            {/* Liste des résultats */}
            <div className="overflow-y-auto max-h-64">
              {available.length === 0 ? (
                <div className="p-4">
                  {searchTerm ? (
                    <p className="text-sm text-gray-500 text-center">
                      Aucun résultat pour "{searchTerm}"
                    </p>
                  ) : (
                    <>
                      <div
                        className="p-2 cursor-pointer hover:bg-gray-100 transition-colors rounded-md"
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
                </div>
              ) : (
                <>
                  {/* Tous les utilisateurs disponibles */}
                  {!searchTerm && (
                    <div
                      className="p-2 cursor-pointer hover:bg-gray-100 transition-colors border-b"
                      onClick={() => addUserAll()}
                    >
                      {"Tous les utilisateurs"}
                    </div>
                  )}
                  {available.map((user) => (
                    <div
                      key={user.id}
                      onClick={() => addUser(user)}
                      className="p-2 cursor-pointer hover:bg-gray-100 transition-colors border-b last:border-b-0"
                    >
                      {highlightText(`${user.firstName} ${user.lastName}`, searchTerm)}
                      {showMail && (
                        <span className="text-[14px] text-[#B0B0B0] ml-2">
                          {highlightText(user.email || "", searchTerm)}
                        </span>
                      )}
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