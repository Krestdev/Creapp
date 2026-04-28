"use client";

import PageTitle from "@/components/pageTitle";
import SettingsGroup, { SettingGroupProps } from "@/components/settings-group";
import { ArchiveIcon, Box, Car, ContactRoundIcon, Stamp } from "lucide-react";

export default function SettingsPage() {
  const links: SettingGroupProps["links"] = [
    {
      title: "Utilisateurs",
      description:
        "Gestion des utilisateurs enregistrés. Créez, modifiez ou suspendez un utilisateur.",
      icon: ContactRoundIcon,
      href: "/tableau-de-bord/parametres/utilisateurs",
      color: "purple",
      auth: ["ADMIN", "SUPERADMIN"],
    },
    {
      title: "Signataires",
      description:
        "Configurer les signataires relatifs aux différentes banques pour les virements et les chèques.",
      icon: Stamp,
      href: "/tableau-de-bord/parametres/signataires",
      color: "green",
      auth: ["ADMIN", "SUPERADMIN"],
    },
    {
      title: "Types de besoins",
      description:
        "Configurer les types de besoins, modifiez les titres affichés.",
      icon: Box,
      href: "/tableau-de-bord/parametres/type-de-besoins",
      color: "yellow",
      auth: ["ADMIN", "SUPERADMIN"],
    },
    {
      title: "Catégories des besoins",
      description:
        "Gérer les catégories des besoins. Créez, modifiez ou supprimez des catégories de besoins.",
      icon: ArchiveIcon,
      href: "/tableau-de-bord/parametres/categories",
      color: "primary",
      auth: ["ADMIN", "SUPERADMIN"],
    },
    {
      title: "Véhicules",
      description:
        "Enregistrement des véhicules. Créez, modifiez ou supprimez des véhicules.",
      icon: Car,
      href: "/tableau-de-bord/parametres/vehicules",
      color: "indigo",
      auth: ["ADMIN", "SUPERADMIN"],
    },
  ];

  return (
    <div className="content">
      <PageTitle
        title="Paramètres"
        subtitle="Gérez votre compte et les paramètres de votre organisation"
        color="blue"
      />
      <SettingsGroup links={links} />
    </div>
  );
}
