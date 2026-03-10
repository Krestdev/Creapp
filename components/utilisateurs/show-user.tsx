"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TranslateRole } from "@/lib/utils";
import { User } from "@/types/types";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Calendar,
  CalendarFold,
  CheckCircle,
  Edit,
  LucideShieldAlert,
  Mail,
  Phone,
  Shield,
  XCircle
} from "lucide-react";

interface ShowUserProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
}

export function ShowUser({ open, onOpenChange, user }: ShowUserProps) {
  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        {/* Header */}
        <DialogHeader>
          <DialogTitle>
            {"Utilisateur - " + user.lastName + " " + user.firstName}
          </DialogTitle>
          <DialogDescription>
            {"Détails du compte utilisateur"}
          </DialogDescription>
        </DialogHeader>
          {/* TABLEAU DES INFORMATIONS */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            {/* ROW 1: Email & Status */}
            <div className="flex border-b border-gray-200">
              <div className="w-1/3 bg-gray-50 p-3 font-semibold text-[14px] text-gray-600 border-r">
                <Mail className="h-4 w-4 inline mr-2" />
                {"Email"}
              </div>
              <div className="w-2/3 p-3 text-[14px]">{user.email}</div>
            </div>

            {/* ROW 2: Phone & Verification */}
            <div className="flex border-b border-gray-200">
              <div className="w-1/3 bg-gray-50 p-3 font-semibold text-[14px] text-gray-600 border-r">
                <Phone className="h-4 w-4 inline mr-2" />
                {"Téléphone"}
              </div>
              <div className="w-2/3 p-3 text-[14px]">
                {user.phone || "Non renseigné"}
              </div>
            </div>

            {/* Poste occupé */}
            <div className="flex border-b border-gray-200">
              <div className="w-1/3 bg-gray-50 p-3 font-semibold text-[14px] text-gray-600 border-r">
                <Edit className="h-4 w-4 inline mr-2" />
                {"Poste occupé"}
              </div>
              <div className="w-2/3 p-3 text-[14px]">
                {user.post || "Non renseigné"}
              </div>
            </div>

            {/* ROW 3: Status */}
            <div className="flex border-b border-gray-200">
              <div className="w-1/3 bg-gray-50 p-3 font-semibold text-[14px] text-gray-600 border-r">
                <LucideShieldAlert className="h-4 w-4 inline mr-2" />
                {"Statut"}
              </div>
              <div className="w-2/3 p-3 text-[14px]">
                <div className="flex items-center gap-2">
                  <Badge variant={user.verified ? "default" : "secondary"}>
                    {user.verified ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-1" />
                        {"Vérifié"}
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 mr-1" />
                        {"Non vérifié"}
                      </>
                    )}
                  </Badge>
                </div>
              </div>
            </div>

            {/* ROW 4: Roles */}
            <div className="flex border-b border-gray-200">
              <div className="w-1/3 bg-gray-50 p-3 font-semibold text-[14px] text-gray-600 border-r">
                <Shield className="h-4 w-4 inline mr-2" />
                {"Rôles"}
              </div>
              <div className="w-2/3 p-3 text-[14px]">
                <div className="flex flex-wrap gap-1">
                  {user.role?.map((role, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="text-[10px]"
                    >
                      {TranslateRole(role.label)}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* ROW 5: Last Connection */}
            <div className="flex border-b border-gray-200">
              <div className="w-1/3 bg-gray-50 p-3 font-semibold text-[14px] text-gray-600 border-r">
                <CalendarFold className="h-4 w-4 inline mr-2" />
                {"Dernière connexion"}
              </div>
              <div className="w-2/3 p-3 text-[14px]">
                {!!user.lastConnection ? format(new Date(user.lastConnection), "EEEE dd/MM/yyyy, hh:mm", {locale: fr}) : "Jamais connecté"}
              </div>
            </div>

            {/* ROW 6: Created At */}
            <div className="flex">
              <div className="w-1/3 bg-gray-50 p-3 font-semibold text-[14px] text-gray-600 border-r">
                <Calendar className="h-4 w-4 inline mr-2" />
                {"Date de création"}
              </div>
              <div className="w-2/3 p-3 text-[14px]">
                {user.createdAt ? format(new Date(user.createdAt), "dd MMMM yyyy, hh:mm", {locale: fr}) : "N/A"}
              </div>
            </div>
          </div>

        {/* Footer buttons */}
        <DialogFooter>
            <DialogClose asChild>
              <Button
                variant="outline"
              >
                {"Fermer"}
              </Button>
            </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
