"use client";
import PageTitle from "@/components/pageTitle";
import UtilisateursPage from "@/components/utilisateurs/utilisateurs";
import { NavLink } from "@/types/types";

function Page() {
  const links: Array<NavLink> = [
    {
      title: "Créer un utilisateur",
      href: "./utilisateurs/creer",
      hide: false,
      disabled: false,
    },
    {
      title: "Rôles",
      href: "./utilisateurs/roles",
      hide: false,
      disabled: false,
    },
  ];
  return (
    <div className="flex flex-col gap-6">
      {/* page title */}
      <PageTitle
        title="Utilisateurs"
        subtitle="Consultez et gérez les utilisateurs."
        color="red"
        links={links}
      />
      <UtilisateursPage />
    </div>
  );
}

export default Page;
