import CategoriesPage from "@/components/organisation/categories";
import PageTitle from "@/components/pageTitle";
import { NavLink } from "@/types/types";

function Page() {
  const links: Array<NavLink> = [
    {
      title: "Créer un Catégorie",
      href: "/tableau-de-bord/organisation/createcategorie",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* page title */}
      <PageTitle
        title="Catégories besoins"
        subtitle="Consultez la liste des catégories."
        color="red"
        links={links}
      />
      <CategoriesPage />
    </div>
  );
}

export default Page;
