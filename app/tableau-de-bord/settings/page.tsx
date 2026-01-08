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
} from "lucide-react";

export default function SettingsPage() {
  const settingsGroups = [
    {
      category: "Account",
      items: [
        {
          title: "Profile",
          description: "Manage your personal information",
          icon: User,
          href: "/tableau-de-bord/settings/profile",
          color: "from-blue-500 to-blue-600",
        },
        {
          title: "Security",
          description: "Password and authentication settings",
          icon: Lock,
          href: "/tableau-de-bord/settings/security",
          color: "from-red-500 to-red-600",
        },
      ],
    },
    {
      category: "Management",
      items: [
        {
          title: "Utilisateurs",
          description: "Manage team members and permissions",
          icon: Users,
          href: "/tableau-de-bord/settings/utilisateurs",
          color: "from-purple-500 to-purple-600",
        },
        {
          title: "Fournisseur",
          description: "Manage your suppliers and vendors",
          icon: Building2,
          href: "/tableau-de-bord/settings/provider",
          color: "from-amber-500 to-amber-600",
        },
        {
          title: "Roles & Permissions",
          description: "Configure access levels and roles",
          icon: Shield,
          href: "/tableau-de-bord/settings/roles",
          color: "from-green-500 to-green-600",
        },
      ],
    },
    {
      category: "System",
      items: [
        {
          title: "Notifications",
          description: "Email and notification preferences",
          icon: Bell,
          href: "/tableau-de-bord/settings/notifications",
          color: "from-cyan-500 to-cyan-600",
        },
        {
          title: "Appearance",
          description: "Theme and display preferences",
          icon: Palette,
          href: "/tableau-de-bord/settings/appearance",
          color: "from-pink-500 to-pink-600",
        },
        {
          title: "Billing",
          description: "Plans, invoices, and payments",
          icon: CreditCard,
          href: "/tableau-de-bord/settings/billing",
          color: "from-emerald-500 to-emerald-600",
        },
        {
          title: "Data & Privacy",
          description: "Data management and export options",
          icon: Database,
          href: "/tableau-de-bord/settings/data-privacy",
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
              <h2 className="text-2xl font-semibold text-foreground mb-6 pb-3 border-b border-border">
                {group.category}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {group.items.map((item) => (
                  <SettingsCard
                    key={item.title}
                    title={item.title}
                    description={item.description}
                    icon={item.icon}
                    href={item.href}
                    color={item.color}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Sign Out */}
        <div className="mt-16 pt-8 border-t border-border">
          <button className="flex items-center gap-2 text-red-500 hover:text-red-600 transition-colors font-medium">
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </div>
    </main>
  );
}
