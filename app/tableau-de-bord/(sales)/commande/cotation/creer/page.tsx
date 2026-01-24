import CreateCotation from "@/components/bdcommande/createCommande";
import PageTitle from "@/components/pageTitle";

const CreerPage = () => {
  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title={"Créer une Demande de cotation"}
        subtitle={"Complétez le formulaire pour créer une Demande de cotation"}
        color={"blue"}
      />
      <CreateCotation />
    </div>
  );
};

export default CreerPage;
