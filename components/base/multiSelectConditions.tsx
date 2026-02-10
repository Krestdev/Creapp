"use client";

import { CommandCondition } from "@/types/types";
import { LucidePlus, X } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

type Props = {
    conditions: CommandCondition[];
    selected: CommandCondition[];
    onChange: (list: CommandCondition[]) => void;
    display: "Conditions";
    className?: string;
};

export default function MultiSelectConditions({
    conditions,
    selected,
    onChange,
    display,
    className,
}: Props) {
    const [open, setOpen] = useState(false);

    const available = conditions.filter((u) => !selected.some((s) => s.id === u.id));

    const addCondition = (condition: CommandCondition) => {
        onChange([...selected, condition]);
    };

    const removeCondition = (id: number) => {
        onChange(selected.filter((u) => u.id !== id));
    };

    return (
        <div className={`${className} w-full flex flex-col gap-2`}>
            <div
                className={`relative ${display === "Conditions" && "p-3 border"
                    } rounded-lg flex flex-wrap gap-2 items-center`}
            >
                {/* Tags */}
                {display === "Conditions" &&
                    (selected.length > 0 ? (
                        selected.map((condition, index) => (
                            <div
                                key={condition.id}
                                className="relative bg-[#8B0E4E] hover:bg-[#8B0E4E]/90 text-white px-3 py-1 rounded-md flex items-center gap-2 pr-8"
                            >
                                <span>{condition.title}</span>
                                <X
                                    size={20}
                                    className="cursor-pointer absolute right-2"
                                    onClick={() => removeCondition(condition.id)}
                                />
                            </div>
                        ))
                    ) : (
                        <span className="text-gray-500">{"Aucune Condition sélectionnée"}</span>
                    ))}

                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant={"ghost"}
                            type="button"
                            className={`${display === "Conditions" ? "ml-auto" : "mx-auto w-full border"
                                }`}
                        >
                            {display === "Conditions" ? "Ajouter une Condition" : ""}
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
                        // Empêche la fermeture automatique
                        onInteractOutside={(e) => {
                            e.preventDefault();
                        }}
                    >
                        <div className="max-h-60 overflow-y-auto">
                            {available.length === 0 ? (
                                <p className="p-3 text-sm text-gray-500 text-center">
                                    {"Aucune condition disponible"}
                                </p>
                            ) : (
                                available.map((condition) => (
                                    <div
                                        key={condition.id}
                                        className="p-3 cursor-pointer hover:bg-gray-100 transition-colors border-b last:border-b-0"
                                        onMouseDown={(e) => {
                                            // Utiliser onMouseDown au lieu de onClick
                                            e.preventDefault();
                                            e.stopPropagation();
                                        }}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            addCondition(condition);
                                        }}
                                    >
                                        {condition.title}
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