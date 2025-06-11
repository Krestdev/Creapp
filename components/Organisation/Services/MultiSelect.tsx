"use client"

import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { useFormField } from "@/components/ui/form";
import { cn } from "@/lib/utils";

type User = {
    id: number;
    name: string;
    role: string;
    email?: string;
    avatar?: string;
};

interface MultiSelectUsersProps {
    users: User[];
    label?: string;
    placeholder?: string;
    className?: string;
    value?: User[];
    onChange: (users: User[]) => void;
    disabled?: boolean;
}

const MultiSelectUsers = React.forwardRef<HTMLDivElement, MultiSelectUsersProps>(
    (
        {
            users,
            label = "Membres du service",
            placeholder = "Rechercher un utilisateur...",
            className,
            value = [],
            onChange,
            disabled = false,
        },
        ref
    ) => {
        const [search, setSearch] = useState("");
        const [isFocused, setIsFocused] = useState(false);
        const inputRef = useRef<HTMLInputElement>(null);
        const dropdownRef = useRef<HTMLDivElement>(null);
        const { error } = useFormField();

        const selected = value || [];

        const handleSelect = (user: User) => {
            onChange([...selected, user]);
            setSearch("");
            inputRef.current?.focus();
        };

        const handleRemove = (id: number) => {
            onChange(selected.filter((u) => u.id !== id));
            inputRef.current?.focus();
        };

        const filteredUsers = users.filter(
            (user) =>
                user.name.toLowerCase().includes(search.toLowerCase()) &&
                !selected.some((u) => u.id === user.id)
        );

        return (
            <div
                ref={ref}
                className={cn("space-y-2 w-full", className)}
                onClick={() => inputRef.current?.focus()}
            >
                {label && (
                    <label className={cn(
                        "block text-sm font-medium leading-none",
                        error && "text-destructive"
                    )}>
                        {label}
                    </label>
                )}

                <div className="relative">
                    <div className='flex gap-2 items-center'>
                        <div className="relative w-full">
                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-black h-5 w-5" />
                            <Input
                                ref={inputRef}
                                placeholder={selected.length === 0 ? placeholder : ""}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onFocus={() => setIsFocused(true)}
                                onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                                disabled={disabled}
                            />
                        </div>
                    </div>

                    {/* Utilisateurs sélectionnés */}
                    <div className="space-y-2 max-h-[240px] overflow-auto pt-2">
                        {selected.map((user, i) => (
                            <div
                                key={i}
                                className={`flex justify-between items-center rounded-sm px-3 py-2 ${i % 2 === 0 ? "bg-gray-100" : "bg-white"} `}
                            >
                                <div>
                                    <div className="font-semibold">{user.name}</div>
                                    <div className="text-sm text-gray-600">{user.role}</div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleRemove(user.id)}
                                    className="text-gray-500 hover:text-red-600"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        ))}
                    </div>

                    {(isFocused || search) && (
                        <div
                            ref={dropdownRef}
                            className="absolute z-50 mt-1 w-full max-h-60 overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md"
                        >
                            {filteredUsers.length === 0 ? (
                                <div className="p-2 text-sm text-muted-foreground">
                                    Aucun utilisateur trouvé
                                </div>
                            ) : (
                                filteredUsers.map((user) => (
                                    <div
                                        key={user.id}
                                        className="cursor-pointer px-4 py-2 hover:bg-accent"
                                        onMouseDown={(e) => e.preventDefault()}
                                        onClick={() => handleSelect(user)}
                                    >
                                        <div className="flex items-center gap-3">
                                            {user.avatar && (
                                                <img
                                                    src={user.avatar}
                                                    alt={user.name}
                                                    className="h-8 w-8 rounded-full"
                                                />
                                            )}
                                            <div>
                                                <div className="font-medium">{user.name}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {user.role} {user.email && `• ${user.email}`}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    }
);

export { MultiSelectUsers };