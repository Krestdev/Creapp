import CreateCommande from "@/components/pages/bdcommande/createCommande";
import PageTitle from "@/components/pageTitle";

const Page = () => {
  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Créer une Demande de quotation"
        subtitle="Complétez le formulaire pour créer une Demande de quotation"
        color="blue"
      />
      <CreateCommande />
    </div>
  );
};

export default Page;
