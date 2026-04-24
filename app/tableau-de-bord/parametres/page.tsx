"use client";

import PageTitle from "@/components/pageTitle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { cva, VariantProps } from "class-variance-authority";
import {
  ArchiveIcon,
  Box,
  Car,
  ContactRoundIcon,
  LucideIcon,
  LucideProps,
  Stamp,
  Users,
} from "lucide-react";
import Link from "next/link";
import { ForwardRefExoticComponent, RefAttributes } from "react";

export default function SettingsPage() {
  const iconVariants = cva("h-16 w-full bg-linear-to-b", {
    variants: {
      color: {
        primary: "from-primary-100 to-primary-200 text-primary-600",
        secondary: "from-secondary-100 to-secondary-200 text-secondary-600",
        destructive:
          "from-destructive-100 to-destructive-200 text-destructive-600",
        outline: "from-outline-100 to-outline-200 text-outline-600",
        accent: "from-accent-100 to-accent-200 text-accent-600",
        ghost: "from-ghost-100 to-ghost-200 text-ghost-600",
        link: "from-link-100 to-link-200 text-link-600",
        delete: "from-delete-100 to-delete-200 text-delete-600",
        success: "from-success-100 to-success-200 text-success-600",
        purple: "from-purple-100 to-purple-200 text-purple-600",
        green: "from-green-100 to-green-200 text-green-600",
        yellow: "from-yellow-100 to-yellow-200 text-yellow-600",
        indigo: "from-indigo-100 to-indigo-200 text-indigo-600",
      },
    },
    defaultVariants: {
      color: "purple",
    },
  });

  const links: Array<{
    title: string;
    description: string;
    icon: LucideIcon;
    href: string;
    color: VariantProps<typeof iconVariants>["color"];
    auth: Array<string>;
  }> = [
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
      {/* {settingsGroups.map((group) => (
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
      ))} */}
      <div className="grid grid-cols-1 @min-[640px]:grid-cols-2 @min-[1400px]:grid-cols-3 items-stretch gap-4 @min-[640px]:gap-5">
        {links.map((item, id) => (
          <Link
            key={id}
            href={item.href}
            className="grid rounded-lg border border-gray-200 shadow-sm shadow-gray-100 group"
          >
            <span
              className={cn(
                "relative overflow-hidden",
                iconVariants({ color: item.color }),
              )}
            >
              <item.icon
                size={120}
                className="absolute bottom-0 translate-y-1/3 right-1/5 -translate-x-1/2 -rotate-30 group-hover:scale-110 group-hover:rotate-0 transition-transform duration-300"
              />
            </span>
            <div className="p-4 flex flex-col gap-1">
              <h2 className="text-xl font-semibold text-foreground leading-1.2">
                {item.title}
              </h2>
              <p className="text-sm text-muted-foreground">
                {item.description}
              </p>
              <Button className="w-fit mt-auto ml-auto" variant={"outline"}>
                {"Continuer"}
              </Button>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
