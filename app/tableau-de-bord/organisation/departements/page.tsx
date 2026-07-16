import DepartementPage from "@/components/organisation/departements";
import PageTitle from "@/components/pageTitle";
import { NavLink } from "@/types/types";

function Page() {
  const links: Array<NavLink> = [
    {
      title: "Créer un département",
      href: "/tableau-de-bord/organisation/createdepartement",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* page title */}
      <PageTitle
        title="Départements"
        subtitle="Consultez la liste des départements."
        color="red"
        links={links}
      />
      <DepartementPage />
    </div>
  );
}

export default Page;
