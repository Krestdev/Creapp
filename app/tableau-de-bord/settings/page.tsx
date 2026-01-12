"use client";

import PageTitle from "@/components/pageTitle";
import SettingsCard from "@/components/settings/settings-card";
import {
  Building2,
  Users,
  User,
  Shield,
  Bell,
  Palette,
  Lock,
  CreditCard,
  LogOut,
  Database,
  Car,
  BookCopy,
  Type,
  Box,
  LucideProps,
  Stamp,
  UserPenIcon,
} from "lucide-react";
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
      category: "Gestion",
      items: [
        {
          title: "Utilisateurs",
          description: "Geres les Utilisateurs",
          icon: Users,
          href: "/tableau-de-bord/settings/utilisateurs",
          color: "from-purple-500 to-purple-600",
          items: [
            {
              pageId: "PG-08-01",
              title: "Liste de utilisateur",
              href: "/tableau-de-bord/settings/utilisateurs",
              authorized: ["ADMIN"],
            },
            {
              pageId: "PG-08-02",
              title: "Cree un utilisateur",
              href: "/tableau-de-bord/settings/utilisateurs/create",
              authorized: ["ADMIN"],
            },
            {
              pageId: "PG-08-03",
              title: "Roles d'utilisateur",
              href: "/tableau-de-bord/settings/utilisateurs/roles",
              authorized: ["ADMIN"],
            },
          ],
        },
        {
          title: "Signatairs",
          description: "Geres les fourniseur",
          icon: Stamp,
          href: "/tableau-de-bord/settings/signatairs",
          color: "from-green-500 to-green-600",
          items: [
            {
              pageId: "PG-08-02",
              title: "Liste des Signatairs",
              href: "/tableau-de-bord/settings/signatairs",
              authorized: ["ADMIN"],
            },
            {
              pageId: "PG-08-01",
              title: "Assigner un Signatair",
              href: "/tableau-de-bord/settings/signatairs/create",
              authorized: ["ADMIN"],
            },
          ],
        },
        {
          title: "Fournisseurs",
          description: "Geres les fourniseur",
          icon: Building2,
          href: "/tableau-de-bord/settings/provider",
          color: "from-amber-500 to-amber-600",
          items: [
            {
              pageId: "PG-08-02",
              title: "Liste des fournisseurs",
              href: "/tableau-de-bord/settings/provider",
              authorized: ["ADMIN"],
            },
            {
              pageId: "PG-08-01",
              title: "Créer un fournisseur",
              href: "/tableau-de-bord/settings/provider/create",
              authorized: ["ADMIN"],
            },
          ],
        },
        {
          title: "Besoins",
          description: "Geres les besoins",
          icon: Box,
          href: "/tableau-de-bord/settings/besoins",
          color: "from-yellow-500 to-yellow-600",
          items: [
            {
              pageId: "PG-08-02",
              title: "Types de besoins",
              href: "/tableau-de-bord/settings/type-de-besoins",
              authorized: ["ADMIN"],
            },
            {
              pageId: "PG-08-01",
              title: "Liste des catégories",
              href: "/tableau-de-bord/settings/categories",
              authorized: ["ADMIN"],
            },
          ],
        },
        {
          title: "Signatair",
          description: "Assigner les signatair",
          icon: UserPenIcon,
          href: "/tableau-de-bord/settings/signatairs",
          color: "from-red-500 to-red-600",
        },
      ],
    },
    {
      category: "Système",
      items: [
        {
          title: "Notifications",
          description: "Email and notification preferences",
          icon: Bell,
          href: "/tableau-de-bord/settings/notifications",
          color: "from-cyan-500 to-cyan-600",
        },
        {
          title: "Véhicule",
          description: "Enregistrement des vehicule",
          icon: Car,
          href: "/tableau-de-bord/settings/vehicule",
          color: "from-indigo-500 to-indigo-600",
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
