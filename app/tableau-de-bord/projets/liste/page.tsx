import PageTitle from "@/components/pageTitle";
import ProjectListPage from "@/components/projets/liste";
import { NavLink } from "@/types/types";

function Page() {
  const links :Array<NavLink> = [
    {
      title: "Créer un Projet",
      href: "./create",
    },
  ];
  return (
    <div className="content">
      {/* page title */}
      <PageTitle
        title="Les Projets"
        subtitle="Consultez la liste des projets."
        color="red"
        links={links}
      />
      <ProjectListPage />
    </div>
  );
}

export default Page;
