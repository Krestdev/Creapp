import CreateDepensePage from "@/components/depense/CreateResquestPage";
import PageTitle from "@/components/pageTitle";

const Page = () => {
  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Créer une Depense"
        color="blue"
        subtitle="Renseignez les informations relatives à votre depense."
      />
      <CreateDepensePage />
    </div>
  );
};

export default Page;
