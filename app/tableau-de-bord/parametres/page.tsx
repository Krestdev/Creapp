"use client";

import PageTitle from "@/components/pageTitle";
import SettingsCard from "@/components/settings/settings-card";
import { Box, Car, LucideProps, Stamp, Users } from "lucide-react";
import { ForwardRefExoticComponent, RefAttributes } from "react";

export default function SettingsPage() {
  const settingsGroups: {
    category: string;
    items: {
      title: string;
      description: string;
      icon: ForwardRefExoticComponent<
        Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
      >;
      href: string;
      color: string;
      items?: {
        pageId: string;
        title: string;
        href: string;
        authorized: string[];
      }[];
    }[];
  }[] = [
      {
        category: "Général",
        items: [
          {
            title: "Utilisateurs",
            description: "Gérer les utilisateurs",
            icon: Users,
            href: "/tableau-de-bord/parametres/utilisateurs",
            color: "from-purple-500 to-purple-600",
            items: [
              {
                pageId: "PG-08-01",
                title: "Liste",
                href: "/tableau-de-bord/parametres/utilisateurs",
                authorized: ["ADMIN", "SUPERADMIN"],
              },
              {
                pageId: "PG-08-02",
                title: "Ajouter",
                href: "/tableau-de-bord/parametres/utilisateurs/creer",
                authorized: ["ADMIN", "SUPERADMIN"],
              },
              {
                pageId: "PG-08-03",
                title: "Rôles",
                href: "/tableau-de-bord/parametres/utilisateurs/roles",
                authorized: ["ADMIN", "SUPERADMIN"],
              },
            ],
          },
          {
            title: "Signataires",
            description: "Gérer les signataires",
            icon: Stamp,
            href: "/tableau-de-bord/parametres/signataires",
            color: "from-green-500 to-green-600",
            items: [
              {
                pageId: "PG-08-02",
                title: "Liste",
                href: "/tableau-de-bord/parametres/signataires",
                authorized: ["ADMIN", "SUPERADMIN"],
              },
              {
                pageId: "PG-08-01",
                title: "Configurer les signataires",
                href: "/tableau-de-bord/parametres/signataires/creer",
                authorized: ["ADMIN", "SUPERADMIN"],
              },
            ],
          },
          {
            title: "Besoins",
            description: "Gérer les besoins",
            icon: Box,
            href: "/tableau-de-bord/parametres/besoins",
            color: "from-yellow-500 to-yellow-600",
            items: [
              {
                pageId: "PG-08-02",
                title: "Types",
                href: "/tableau-de-bord/parametres/type-de-besoins",
                authorized: ["ADMIN", "SUPERADMIN"],
              },
              {
                pageId: "PG-08-01",
                title: "Catégories",
                href: "/tableau-de-bord/parametres/categories",
                authorized: ["ADMIN", "SUPERADMIN"],
              },
            ],
          },
        ],
      },
      {
        category: "Système",
        items: [
          // {
          //   title: "Chauffeurs",
          //   description: "Enregistrement des véhicules",
          //   icon: Car,
          //   href: "/tableau-de-bord/parametres/chauffeurs",
          //   color: "from-orange-500 to-orange-600",
          //   items: [
          //     {
          //       pageId: "PG-08-02",
          //       title: "Liste",
          //       href: "/tableau-de-bord/parametres/chauffeurs",
          //       authorized: ["ADMIN", "SUPERADMIN"],
          //     },
          //     {
          //       pageId: "PG-08-01",
          //       title: "Ajouter",
          //       href: "/tableau-de-bord/parametres/chauffeurs/creer",
          //       authorized: ["ADMIN", "SUPERADMIN"],
          //     },
          //   ],
          // },
          {
            title: "Véhicules",
            description: "Enregistrement des véhicules",
            icon: Car,
            href: "/tableau-de-bord/parametres/vehicules",
            color: "from-indigo-500 to-indigo-600",
            items: [
              {
                pageId: "PG-08-02",
                title: "Liste",
                href: "/tableau-de-bord/parametres/vehicules",
                authorized: ["ADMIN", "SUPERADMIN"],
              },
              {
                pageId: "PG-08-01",
                title: "Ajouter",
                href: "/tableau-de-bord/parametres/vehicules/creer",
                authorized: ["ADMIN", "SUPERADMIN"],
              },
            ],
          },
        ],
      },
    ];

  return (
      <div className="content">
        <PageTitle
          title="Paramètres"
          subtitle="Gérez votre compte et les paramètres de votre organisation"
          color="blue"
        />

        {/* Settings Groups */}
          {settingsGroups.map((group) => (
            <div key={group.category}>
              <h2 className="text-2xl font-semibold text-foreground mb-6">
                {group.category}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {group.items.map((item) => (
                  <SettingsCard
                    key={item.title}
                    title={item.title}
                    description={item.description}
                    icon={item.icon}
                    href={item.href}
                    color={item.color}
                    sublinks={item.items}
                  />
                ))}
              </div>
            </div>
          ))}
      </div>
  );
}
