"use client";

import PageTitle from "@/components/pageTitle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { cva, VariantProps } from "class-variance-authority";
import { Building2, FileText, LucideIcon } from "lucide-react";
import Link from "next/link";

export default function Page() {
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
