"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Role } from "@/types/types";
import {
  FileText,
  Key,
  Users,
  Lock,
  Hash,
  Globe,
  CheckCircle,
  LucideFlag,
  Calendar,
  LucideCalendarFold,
  LucideFile,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface ShowRoleProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: Role | null;
  usersCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export function ShowRole({
  open,
  onOpenChange,
  role,
  usersCount = 0,
  createdAt,
  updatedAt,
}: ShowRoleProps) {
  if (!role) return null;

  const TranslateRole = (roleLabel: string) => {
    const translations: Record<string, string> = {
      USER: "Emetteur",
      MANAGER: "Manager",
      SALES: "Responsable d'achat",
      SALES_MANAGER: "Donneur d'ordre d'achat",
      ADMIN: "Administrateur",
    };
    return translations[roleLabel] || roleLabel;
  };

  const getRoleColor = (roleLabel: string) => {
    switch (roleLabel) {
      case "ADMIN":
        return "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800";
      case "SALES_MANAGER":
        return "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800";
      case "SALES":
        return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800";
      case "MANAGER":
        return "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800";
      case "USER":
        return "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-800";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getAccessLevel = (roleLabel: string) => {
    switch (roleLabel) {
      case "ADMIN":
        return {
          level: "Élevé",
          color: "bg-red-100 text-red-800 border-red-300",
        };
      case "SALES_MANAGER":
        return {
          level: "Important",
          color: "bg-orange-100 text-orange-800 border-orange-300",
        };
      case "SALES":
        return {
          level: "Moyen",
          color: "bg-blue-100 text-blue-800 border-blue-300",
        };
      case "MANAGER":
        return {
          level: "Basique",
          color: "bg-green-100 text-green-800 border-green-300",
        };
      case "USER":
        return {
          level: "Limité",
          color: "bg-gray-100 text-gray-800 border-gray-300",
        };
      default:
        return {
          level: "Personnalisé",
          color: "bg-gray-100 text-gray-800 border-gray-300",
        };
    }
  };

  const getPermissions = (roleLabel: string) => {
    const permissions: Record<string, string[]> = {
      ADMIN: [
        "Gestion complète du système",
        "Configuration des rôles et permissions",
        "Supervision de toutes les activités",
        "Accès à tous les rapports",
      ],
      SALES_MANAGER: [
        "Validation des devis",
        "Validation des bons de commandes",
      ],
      SALES: [
        "Création des demandes de cotation",
        "Insertion des devis",
        "Création des bons de commandes",
      ],
      MANAGER: [
        "Completion des besoins",
        "Validation des besoins",
        "Gestion de l'équipe",
      ],
      USER: ["Soumission de besoins", "Suivi de ses demandes"],
    };
    return permissions[roleLabel] || ["Permissions personnalisées"];
  };

  const getAccesPages = (roleLabel: string) => {
    const pages: Record<string, string[]> = {
      ADMIN: ["Toutes les pages"],
      SALES_MANAGER: ["Besoins", "Commande"],
      SALES: ["Besoins", "Commande"],
      MANAGER: ["Besoins", "Besoins - Approbation"],
      USER: ["Besoins"],
    };
    return pages[roleLabel] || ["Pages personnalisées"];
  };
  const accessLevel = getAccessLevel(role.label);
  const permissions = getPermissions(role.label);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[640px] w-full overflow-y-auto p-0 gap-0 border-none">
        {/* Header */}
        <DialogHeader className="bg-[#8B1538] text-white p-6 m-4 rounded-lg pb-8">
          <DialogTitle className="text-xl font-semibold text-white">
            {TranslateRole(role.label)}
          </DialogTitle>
          <p className="text-sm text-white/80 mt-1">
            {"Détails du rôle et permissions"}
          </p>
        </DialogHeader>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4">
          <div className="flex flex-col gap-3 pb-4">
            {/* ID du rôle */}
            <div className="flex items-start gap-3">
              <div className="mt-1 bg-[#E4E4E7] h-10 w-10 rounded-full flex items-center justify-center">
                <Hash className="h-5 w-5 text-black" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">{"ID du rôle"}</p>
                <Badge
                  variant="outline"
                  className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800 font-mono"
                >
                  ROLE-{role.id.toString().padStart(3, "0")}
                </Badge>
              </div>
            </div>

            {/* Code système */}
            <div className="flex items-start gap-3">
              <div className="mt-1 bg-[#E4E4E7] h-10 w-10 rounded-full flex items-center justify-center">
                <Lock className="h-5 w-5 text-black" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">
                  {"Code système"}
                </p>
                <Badge variant="outline" className={getRoleColor(role.label)}>
                  {role.label}
                </Badge>
              </div>
            </div>

            {/* Niveau d'accès */}
            <div className="flex items-start gap-3">
              <div className="mt-1 bg-[#E4E4E7] h-10 w-10 rounded-full flex items-center justify-center">
                <LucideFlag className="h-5 w-5 text-black" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">
                  {"Niveau d'accès"}
                </p>
                <div className="flex items-center gap-2">
                  {getAccesPages(role.label).map((page, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className={accessLevel.color}
                    >
                      {page}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Utilisateurs assignés */}
            <div className="flex items-start gap-3">
              <div className="mt-1 bg-[#E4E4E7] h-10 w-10 rounded-full flex items-center justify-center">
                <Users className="h-5 w-5 text-black" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">
                  {"Utilisateurs assignés"}
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-black font-semibold text-sm">
                    {usersCount} utilisateur{usersCount > 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            </div>

            {/* Permissions */}
            <div className="flex items-start gap-3">
              <div className="mt-1 bg-[#E4E4E7] h-10 w-10 rounded-full flex items-center justify-center">
                <Key className="h-5 w-5 text-black" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">{"Permissions"}</p>
                <div className="space-y-1 mt-1">
                  {permissions.map((permission, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      <span className="text-xs text-black">{permission}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer buttons */}
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
    </Dialog>
  );
}
