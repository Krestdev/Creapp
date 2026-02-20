import PageTitle from "@/components/pageTitle";
import { ProjectCreateForm } from "@/components/projets/create-project";

const Page = () => {
  return (
    <div className="content">
      <PageTitle
        title="Créer un Projet"
        subtitle="Formulaire de création d'un projet"
        color="blue"
      />
      <ProjectCreateForm />
    </div>
  );
};

export default Page;
