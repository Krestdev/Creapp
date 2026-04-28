"use client";

import PageTitle from "@/components/pageTitle";
import SettingsGroup, { SettingGroupProps } from "@/components/settings-group";
import { Building2, FileText } from "lucide-react";

export default function Page() {
  const links: SettingGroupProps["links"] = [
    {
      title: "Fournisseurs",
      description: "Gérer les fournisseurs",
      icon: Building2,
      href: "/tableau-de-bord/parametres-commandes/fournisseurs",
      color: "yellow",
      auth: ["ADMIN", "SUPERADMIN"],
    },
    {
      title: "Bon de commande",
      description: "Configurer les conditions générales des bons de commande",
      icon: FileText,
      href: "/tableau-de-bord/parametres-commandes/conditions-generales",
      color: "purple",
      auth: ["ADMIN", "SUPERADMIN"],
    },
  ];

  return (
    <div className="content">
      <PageTitle
        title="Paramètres des Commandes"
        subtitle="Configuration des paramètres relatifs aux commandes"
        color="blue"
      />
      <SettingsGroup links={links} />
    </div>
  );
}
