import PageTitle from "@/components/pageTitle";
import CreateProject from "@/components/projets/createProject";

const Page = () => {
  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Créer un Projet"
        subtitle="Formulaire de création d'un projet"
        color="blue"
      />
      <CreateProject />
    </div>
  );
};

export default Page;
