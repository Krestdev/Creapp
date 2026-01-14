import CreateDepensePage from "@/components/depense/CreateDepensePage";
import PageTitle from "@/components/pageTitle";

const Page = () => {
  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Créer une Dépense"
        color="blue"
        subtitle="Renseignez les informations relatives à votre dépense."
      />
      <CreateDepensePage />
    </div>
  );
};

export default Page;
