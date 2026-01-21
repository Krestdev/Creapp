"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TranslateRole } from "@/lib/utils";
import { Role } from "@/types/types";
import { CheckCircle, Hash, HashIcon, InfoIcon, Key, Lock, LucideFlag, ScanEyeIcon, ShieldCheck, ShieldIcon, Users, UsersIcon } from "lucide-react";

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
}: ShowRoleProps) {
  if (!role) return null;

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
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="uppercase">
            {`role - ${TranslateRole(role.label)}`}
          </DialogTitle>
            {"Description du rôle"}
        </DialogHeader>

        {/* Content */}
        <div className="grid gap-3">
            {/* ID du rôle */}
            <div className="view-group">
            <span className="view-icon">
              <HashIcon />
            </span>
            <div className="flex flex-col">
              <p className="view-group-title">{"Identifiant"}</p>
              <Badge
                  variant="blue"
                >
                  {`ROLE-${role.id.toString().padStart(3, "0")}`}
                </Badge>
            </div>
          </div>
            {/* Code système */}
            <div className="view-group">
            <span className="view-icon">
              <ShieldIcon />
            </span>
            <div className="flex flex-col">
              <p className="view-group-title">{"Code Système"}</p>
              <Badge variant="outline" className={getRoleColor(role.label)}>
                  {role.label}
                </Badge>
            </div>
          </div>
            {/* Niveau d'accès */}
            <div className="view-group">
            <span className="view-icon">
              <ScanEyeIcon />
            </span>
            <div className="flex flex-col">
              <p className="view-group-title">{"Accès"}</p>
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
            <div className="view-group">
            <span className="view-icon">
              <UsersIcon />
            </span>
            <div className="flex flex-col">
              <p className="view-group-title">{"Utilisateurs"}</p>
              <p className="font-semibold">
                {`${usersCount} utilisateur${usersCount > 1 && "s"}`}
              </p>
            </div>
          </div>
            {/* Permissions */}
            <div className="view-group">
            <span className="view-icon">
              <ShieldCheck />
            </span>
            <div className="flex flex-col">
              <p className="view-group-title">{"Statut"}</p>
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
          <p className="text-sm text-gray-600 mt-2 flex gap-1 items-center"><InfoIcon className="text-sky-600" size={14}/>{"Tout utilisateur a accès à l'émission des besoins."}</p> 
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            {"Fermer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
