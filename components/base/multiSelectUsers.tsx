"use client";

import { useState } from "react";
import { LucidePlus, X } from "lucide-react";
import { Button } from "../ui/button";

type User = {
  id: number;
  name: string;
};

type Props = {
  users: User[];
  selected: User[];
  onChange: (list: User[]) => void;
};

export default function MultiSelectUsers({ users, selected, onChange }: Props) {
  const [open, setOpen] = useState(false);

  const available = users.filter((u) => !selected.some((s) => s.id === u.id));

  const addUser = (user: User) => {
    onChange([...selected, user]);
    setOpen(false);
  };

  const removeUser = (id: number) => {
    onChange(selected.filter((u) => u.id !== id));
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="border rounded-lg p-3 flex flex-wrap gap-2 items-center relative">
        {/* Tags */}
        {selected.length > 0 ? (
          selected.map((user) => (
            <span
              key={user.id}
              className="bg-[#8B0E4E] text-white px-3 py-1 rounded-md flex items-center gap-2"
            >
              {user.name}
              <X
                size={14}
                className="cursor-pointer"
                onClick={() => removeUser(user.id)}
              />
            </span>
          ))
        ) : (
          <span className="text-gray-500">{"Aucun utilisateur selectionné"}</span>
        )}

        <Button
        variant={"ghost"}
          type="button"
          onClick={() => setOpen(!open)}
          className={`ml-auto`}
        >
          <LucidePlus className={`${open && "rotate-45"} transition-all ease-in-out`} />
        </Button>

        {open && (
          <div className="absolute right-0 top-14 w-full bg-white shadow-md rounded-lg border z-20 transition-all ease-in-out">
            {available.length === 0 ? (
              <p className="p-2 text-sm text-gray-500 text-center">
                {"Aucun utilisateur disponible"}
              </p>
            ) : (
              available.map((user) => (
                <div
                  key={user.id}
                  onClick={() => addUser(user)}
                  className="p-2 cursor-pointer hover:bg-gray-100"
                >
                  {user.name}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
