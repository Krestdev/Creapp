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
      case "SUPERADMIN":
        return "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800";
      case "ADMIN":
        return "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800";
      case "SALES_MANAGER":
        return "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-900/30 dark:text-teal-300 dark:border-teal-800";
      case "SALES":
        return "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-900/30 dark:text-sky-300 dark:border-sky-800";
      case "MANAGER":
        return "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800";
      case "USER":
        return "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-800";
      case "DRIVER":
        return "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200 dark:bg-fuchsia-900/30 dark:text-fuchsia-300 dark:border-fuchsia-800";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getAccessLevel = (roleLabel: string) => {
    switch (roleLabel) {
      case "SUPERADMIN":
        return {
          level: "Élevé",
          color: "bg-red-100 text-red-800 border-red-300",
        };
      case "ADMIN":
        return {
          level: "Important",
          color: "bg-indigo-100 text-indigo-800 border-indigo-300",
        };
      case "SALES_MANAGER":
        return {
          level: "Important",
          color: "bg-teal-100 text-teal-800 border-teal-300",
        };
      case "SALES":
        return {
          level: "Moyen",
          color: "bg-sky-100 text-sky-800 border-sky-300",
        };
      case "MANAGER":
        return {
          level: "Basique",
          color: "bg-green-100 text-green-800 border-green-300",
        };
      case "ACCOUNTANT":
        return {
          level: "Basique",
          color: "bg-blue-100 text-blue-800 border-blue-300",
        };
      case "RH":
        return {
          level: "Basique",
          color: "bg-orange-100 text-orange-800 border-orange-300",
        };
      case "DRIVER":
        return {
          level: "Basique",
          color: "bg-fuchsia-100 text-fuchsia-800 border-fuchsia-300",
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
      "SUPERADMIN": [
        "Gestion complète du système",
        "Configuration des rôles et permissions",
        "Supervision de toutes les activités",
        "Accès à tous les rapports",
      ],
      ADMIN: [
        "Configuration des paramètres globaux",
        "Gestion des projets"
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
      DRIVER: [
        "Soumission des besoins de transport",
        "Soumission des besoins de carburant",
      ],
      ACCOUNTANT: [
        "Gestion des transactions bancaires",
        "Gestion des comptes bancaires",
        "Gestion des factures",
      ],
      RH: [
        "Soumission des besoins RH",
      ],
      USER: ["Soumission de besoins", "Suivi de ses demandes"],
    };
    return permissions[roleLabel] || ["Permissions personnalisées"];
  };

  const getAccesPages = (roleLabel: string) => {
    const pages: Record<string, string[]> = {
      "SUPERADMIN": ["Toutes les pages"],
      ADMIN: ["Paramètres", "Projets"],
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
