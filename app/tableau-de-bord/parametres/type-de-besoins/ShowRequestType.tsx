"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { RequestType } from "@/types/types";
import {
    LucideScrollText,
} from "lucide-react";

export type Justificatif = {
    type: "file" | "image";
    nom: string;
    taille: number; // en Ko ou Mo selon ton choix
};

interface ShowRequestTypeProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    data: RequestType | undefined;
}

export function ShowRequestType({ open, onOpenChange, data }: ShowRequestTypeProps) {

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[520px] w-full overflow-y-auto p-0 gap-0 overflow-x-hidden border-none">
                {/* Header with burgundy background */}
                <DialogHeader className="bg-[#8B1538] text-white p-6 m-4 rounded-lg pb-8 relative">
                    <DialogTitle className="text-xl font-semibold text-white first-letter:uppercase">
                        {data?.label}
                    </DialogTitle>
                    <p className="text-sm text-white/80 mt-1">
                        {"Informations relatives au type de besoin"}
                    </p>
                </DialogHeader>
                <div className="flex-1 flex flex-col gap-3 px-4">


                    {/* Nom */}
                    <div className="flex items-start gap-3">
                        <div className="mt-1">
                            <LucideScrollText className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm text-muted-foreground">
                                {"Nom"}
                            </p>
                            <p className="font-semibold first-letter:uppercase">{data?.label}</p>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="flex items-start gap-3">
                        <div className="mt-1">
                            <LucideScrollText className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm text-muted-foreground">
                                {"Description"}
                            </p>
                            <p className="font-semibold first-letter:uppercase">{data?.description}</p>
                        </div>
                    </div>
                </div>
                <div className="flex w-full justify-end gap-3 p-6 pt-0">
                    <Button
                        variant="outline"
                        className="bg-transparent"
                        onClick={() => onOpenChange(false)}
                    >
                        {"Fermer"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog >
    );
}
