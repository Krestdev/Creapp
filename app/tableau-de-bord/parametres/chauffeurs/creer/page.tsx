import CreateDriverForm from "@/components/driver/create-driver";
import PageTitle from "@/components/pageTitle";

const Page = () => {
  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Ajouter un chauffeur"
        subtitle="Formulaire de création d'un chauffeur"
        color="blue"
      />
      <CreateDriverForm />
    </div>
  );
};

export default Page;
