import CreateDriverForm from "@/components/driver/create-driver";
import PageTitle from "@/components/pageTitle";

const Page = () => {
  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Créer un Chauffer"
        subtitle="Formulaire de création d'un Chauffer"
        color="blue"
      />
      <CreateDriverForm />
    </div>
  );
};

export default Page;
