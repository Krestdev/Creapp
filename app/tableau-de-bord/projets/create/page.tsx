import CreateUserForm from "@/components/forms/create-user";
import CreateProject from "@/components/pages/projets/createProject";
import PageTitle from "@/components/pageTitle";

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
