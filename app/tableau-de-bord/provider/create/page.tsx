import CreateUserForm from "@/components/provider/create-provider";
import PageTitle from "@/components/pageTitle";

const Page = () => {
  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Créer un fournisseur"
        subtitle="Formulaire de création d'un fournisseur"
        color="blue"
      />
      <CreateUserForm />
    </div>
  );
};

export default Page;
