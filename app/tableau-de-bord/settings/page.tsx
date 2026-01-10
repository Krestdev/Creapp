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
} from "lucide-react";

export default function SettingsPage() {
  const settingsGroups = [
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
          title: "Roles & Permissions",
          description: "Configure access levels and roles",
          icon: Shield,
          href: "/tableau-de-bord/settings/utilisateurs/roles",
          color: "from-green-500 to-green-600",
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
        // {
        //   title: "Appearance",
        //   description: "Theme and display preferences",
        //   icon: Palette,
        //   href: "/tableau-de-bord/settings/appearance",
        //   color: "from-pink-500 to-pink-600",
        // },
        // {
        //   title: "Billing",
        //   description: "Plans, invoices, and payments",
        //   icon: CreditCard,
        //   href: "/tableau-de-bord/settings/billing",
        //   color: "from-emerald-500 to-emerald-600",
        // },
        // {
        //   title: "Data & Privacy",
        //   description: "Data management and export options",
        //   icon: Database,
        //   href: "/tableau-de-bord/settings/data-privacy",
        //   color: "from-indigo-500 to-indigo-600",
        // },
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
