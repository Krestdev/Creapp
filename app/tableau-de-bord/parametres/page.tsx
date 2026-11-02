"use client";

import PageTitle from "@/components/pageTitle";
import SettingsGroup, { SettingGroupProps } from "@/components/settings-group";
import { queryKeys } from "@/lib/query-keys";
import { userQ } from "@/queries/baseModule";
import { categoryQ } from "@/queries/categoryModule";
import { requestTypeQ } from "@/queries/requestType";
import { signatairQ } from "@/queries/signatair";
import { useQuery } from "@tanstack/react-query";
import {
  ArchiveIcon,
  Box,
  Car,
  ContactRoundIcon,
  Stamp,
} from "lucide-react";

const count = (n: number | undefined, one: string, many: string) =>
  n === undefined ? undefined : `${n} ${n > 1 ? many : one}`;

export default function SettingsPage() {
  // Les compteurs ne sont qu'un résumé : sans réponse, la ligne s'affiche sans état.
  const users = useQuery({ queryKey: queryKeys.users, queryFn: userQ.getAll });
  const signataires = useQuery({
    queryKey: queryKeys.signataires,
    queryFn: signatairQ.getAll,
  });
  const requestTypes = useQuery({
    queryKey: queryKeys.requestTypes,
    queryFn: requestTypeQ.getAll,
  });
  const categories = useQuery({
    queryKey: queryKeys.categories,
    queryFn: categoryQ.getCategories,
  });

  const links: SettingGroupProps["links"] = [
    {
      title: "Utilisateurs",
      description:
        "Gestion des utilisateurs enregistrés. Créez, modifiez ou suspendez un utilisateur.",
      icon: ContactRoundIcon,
      href: "/tableau-de-bord/parametres/utilisateurs",
      badge: count(users.data?.data.length, "utilisateur", "utilisateurs"),
      auth: ["ADMIN", "SUPERADMIN"],
    },
    {
      title: "Signataires",
      description:
        "Configurer les signataires relatifs aux différentes banques pour les virements et les chèques.",
      icon: Stamp,
      href: "/tableau-de-bord/parametres/signataires",
      badge: count(signataires.data?.data.length, "signataire", "signataires"),
      auth: ["ADMIN", "SUPERADMIN"],
    },
    {
      title: "Types de besoins",
      description:
        "Configurer les types de besoins, modifiez les titres affichés.",
      icon: Box,
      href: "/tableau-de-bord/parametres/type-de-besoins",
      badge: count(requestTypes.data?.data.length, "type", "types"),
      auth: ["ADMIN", "SUPERADMIN"],
    },
    {
      title: "Catégories des besoins",
      description:
        "Gérer les catégories des besoins. Créez, modifiez ou supprimez des catégories de besoins.",
      icon: ArchiveIcon,
      href: "/tableau-de-bord/parametres/categories",
      badge: count(categories.data?.data.length, "catégorie", "catégories"),
      auth: ["ADMIN", "SUPERADMIN"],
    },
  ];

  const more: SettingGroupProps["links"] = [
    {
      title: "Véhicules",
      description: "Parc automobile et fiches véhicules",
      icon: Car,
      href: "/tableau-de-bord/parametres/vehicules",
      auth: ["ADMIN", "SUPERADMIN"],
    },
  ];

  return (
    <div className="content">
      <PageTitle
        title="Paramètres"
        subtitle="Gérez les paramètres de votre organisation"
      />
      <SettingsGroup links={links} more={more} />
    </div>
  );
}
