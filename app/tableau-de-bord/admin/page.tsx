import PageTitle from "@/components/pageTitle";
import SettingsGroup, { SettingGroupProps } from "@/components/settings-group";
import {
  ArrowRightLeftIcon,
  TableCellsMergeIcon,
  TicketsIcon,
} from "lucide-react";
import React from "react";

function Page() {
  const links: SettingGroupProps["links"] = [
    {
      title: "Tickets",
      description:
        "Modification et annulation des tickets associés aux dépenses.",
      icon: TicketsIcon,
      href: "/tableau-de-bord/admin/tickets",
      color: "red",
      auth: ["SUPERADMIN"],
    },
    {
      title: "Devis",
      description: "Modification des devis associés aux commandes.",
      icon: TableCellsMergeIcon,
      href: "/tableau-de-bord/admin/devis",
      color: "orange",
      auth: ["SUPERADMIN"],
    },
    {
      title: "Transactions",
      description: "Modification et annulation des transactions.",
      icon: ArrowRightLeftIcon,
      href: "/tableau-de-bord/admin/transactions",
      color: "indigo",
      auth: ["SUPERADMIN"],
    },
  ];

  return (
    <div className="content">
      <PageTitle
        title="Administration"
        subtitle="Gestion de la base de données"
        color="purple"
      />
      <SettingsGroup links={links} />
    </div>
  );
}

export default Page;
