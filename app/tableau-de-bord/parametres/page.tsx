"use client";

import PageTitle from "@/components/pageTitle";
import SettingsCard from "@/components/settings/settings-card";
import { Box, Building2, Car, LucideProps, Stamp, Users } from "lucide-react";
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
                authorized: ["ADMIN"],
              },
              {
                pageId: "PG-08-02",
                title: "Ajouter",
                href: "/tableau-de-bord/parametres/utilisateurs/creer",
                authorized: ["ADMIN"],
              },
              {
                pageId: "PG-08-03",
                title: "Rôles",
                href: "/tableau-de-bord/parametres/utilisateurs/roles",
                authorized: ["ADMIN"],
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
                authorized: ["ADMIN"],
              },
              {
                pageId: "PG-08-01",
                title: "Configurer les signataires",
                href: "/tableau-de-bord/parametres/signataires/creer",
                authorized: ["ADMIN"],
              },
            ],
          },
          {
            title: "Fournisseurs",
            description: "Gérer les fournisseurs",
            icon: Building2,
            href: "/tableau-de-bord/parametres/fournisseurs",
            color: "from-amber-500 to-amber-600",
            items: [
              {
                pageId: "PG-08-02",
                title: "Liste",
                href: "/tableau-de-bord/parametres/fournisseurs",
                authorized: ["ADMIN"],
              },
              {
                pageId: "PG-08-01",
                title: "Ajouter",
                href: "/tableau-de-bord/parametres/fournisseurs/creer",
                authorized: ["ADMIN"],
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
                authorized: ["ADMIN"],
              },
              {
                pageId: "PG-08-01",
                title: "Catégories",
                href: "/tableau-de-bord/parametres/categories",
                authorized: ["ADMIN"],
              },
            ],
          },
        ],
      },
      {
        category: "Système",
        items: [
          {
            title: "Chauffeurs",
            description: "Enregistrement des véhicules",
            icon: Car,
            href: "/tableau-de-bord/parametres/chauffeurs",
            color: "from-orange-500 to-orange-600",
            items: [
              {
                pageId: "PG-08-02",
                title: "Liste",
                href: "/tableau-de-bord/parametres/chauffeurs",
                authorized: ["ADMIN"],
              },
              {
                pageId: "PG-08-01",
                title: "Ajouter",
                href: "/tableau-de-bord/parametres/chauffeurs/creer",
                authorized: ["ADMIN"],
              },
            ],
          },
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
                authorized: ["ADMIN"],
              },
              {
                pageId: "PG-08-01",
                title: "Ajouter",
                href: "/tableau-de-bord/parametres/vehicules/creer",
                authorized: ["ADMIN"],
              },
            ],
          },
          {
            title: "Conditions BC",
            description: "Enregistrement des conditions des BC",
            icon: Car,
            href: "/tableau-de-bord/parametres/conditions-bc",
            color: "from-fuchsia-500 to-fuchsia-600",
            items: [
              {
                pageId: "PG-08-02",
                title: "Liste",
                href: "/tableau-de-bord/parametres/conditions-bc",
                authorized: ["ADMIN"],
              },
              // {
              //   pageId: "PG-08-01",
              //   title: "Ajouter",
              //   href: "/tableau-de-bord/parametres/conditions-bc/creer",
              //   authorized: ["ADMIN"],
              // },
            ],
          },
        ],
      },
    ];

  return (
    <main className="min-h-screen">
      <div className="mx-auto space-y-4">
        {/* Header */}
        {/* <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Paramètres
          </h1>
          <p className="text-muted-foreground text-lg">
            Gérez votre compte et les paramètres de votre organisation
          </p>
        </div> */}
        <PageTitle
          title="Paramètres"
          subtitle="Gérez votre compte et les paramètres de votre organisation"
          color="blue"
        />

        {/* Settings Groups */}
        <div className="space-y-12">
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
      </div>
    </main>
  );
}
