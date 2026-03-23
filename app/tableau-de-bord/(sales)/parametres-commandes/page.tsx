'use client'
import PageTitle from "@/components/pageTitle";
import SettingsCard from "@/components/settings/settings-card";
import { Building2, FileText, LucideProps } from "lucide-react";
import { ForwardRefExoticComponent, RefAttributes } from "react";

function Page() {
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
      category: "Paramètres des Commandes",
      items: [
        {
          title: "Fournisseurs",
          description: "Gérer les fournisseurs",
          icon: Building2,
          href: "./parametres-commandes/fournisseurs",
          color: "from-amber-500 to-amber-600",
          items: [
            {
              pageId: "PG-08-02",
              title: "Liste",
              href: "./parametres-commandes/fournisseurs",
              authorized: ["ADMIN", "SUPERADMIN"],
            },
            {
              pageId: "PG-08-01",
              title: "Ajouter",
              href: "./parametres-commandes/fournisseurs/creer",
              authorized: ["ADMIN", "SUPERADMIN"],
            },
          ],
        },
        {
          title: "Bon de commande",
          description: "Configurer les bons de commande",
          icon: FileText,
          href: "./parametres-commandes/conditions-bc",
          color: "from-fuchsia-500 to-fuchsia-600",
          items: [
            {
              pageId: "PG-08-02",
              title: "Conditions générales",
              href: "./parametres-commandes/conditions-generales",
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
        title="Paramètres des Commandes"
        subtitle="Configuration des paramètres relatifs aux commandes"
      />
        {settingsGroups.map((group) => (
          <div key={group.category}>
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

export default Page;
