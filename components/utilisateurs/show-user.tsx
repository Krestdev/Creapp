"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { User } from "@/types/types";
import { Badge } from "@/components/ui/badge";
import {
  Mail,
  Phone,
  User as UserIcon,
  Calendar,
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  Edit,
  LucideShieldAlert,
} from "lucide-react";

interface ShowUserProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
}

export function ShowUser({ open, onOpenChange, user }: ShowUserProps) {
  if (!user) return null;

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const TranslateRole = (role: string) => {
    switch (role) {
      case "USER":
        return "Emetteur";
      case "MANAGER":
        return "Manager";
      case "SALES":
        return "Responsable d'achat";
      case "SALES_MANAGER":
        return "Donneur d'ordre d'achat";
      case "ADMIN":
        return "Administrateur";
      default:
        return role;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[640px]! max-h-[650px] overflow-y-auto p-0 gap-0 overflow-x-hidden border-none flex flex-col">
        {/* Header */}
        <DialogHeader className="bg-[#8B1538] text-white p-6 m-4 rounded-lg pb-8">
          <DialogTitle className="text-xl font-semibold text-white flex items-center gap-2">
            <UserIcon className="h-5 w-5" />
            {user.name}
          </DialogTitle>
          <p className="text-sm text-white/80 mt-1">
            {"Détails du compte utilisateur"}
          </p>
        </DialogHeader>

        <div className="w-full p-6">
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
                  <Badge
                    variant={
                      user.status === "active"
                        ? "default"
                        : user.status === "suspended"
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {user.status === "active" ? "Activé" : "Inactivé"}
                  </Badge>
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
                <Clock className="h-4 w-4 inline mr-2" />
                {"Dernière connexion"}
              </div>
              <div className="w-2/3 p-3 text-[14px]">
                {formatDate(user.lastConnection)}
              </div>
            </div>

            {/* ROW 6: Created At */}
            <div className="flex">
              <div className="w-1/3 bg-gray-50 p-3 font-semibold text-[14px] text-gray-600 border-r">
                <Calendar className="h-4 w-4 inline mr-2" />
                {"Date de création"}
              </div>
              <div className="w-2/3 p-3 text-[14px]">
                {user.createdAt ? formatDate(user.createdAt) : "N/A"}
              </div>
            </div>
          </div>
        </div>

        {/* Footer buttons */}
        <div className="flex w-full justify-between gap-3 p-6 pt-0">
          <div className="text-xs text-gray-500">
            {`Utilisateur ${user.verified ? "vérifié" : "non vérifié"}`}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              {"Fermer"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
