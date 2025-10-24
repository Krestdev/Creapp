import CreateUserForm from "@/components/forms/create-user";
import PageTitle from "@/components/pageTitle";

const Page = () => {
  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Créer un Utilisateur"
        subtitle="Formulaire de création d'utilisateur"
        color="blue"
      />
      <CreateUserForm />
    </div>
  );
};

export default Page;
