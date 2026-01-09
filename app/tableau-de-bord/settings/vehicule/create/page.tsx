import PageTitle from "@/components/pageTitle";
import { VehicleForm } from "./form";

const Page = () => {
  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Créer un Utilisateur"
        subtitle="Formulaire de création d'utilisateur"
        color="blue"
      />
      <VehicleForm />
    </div>
  );
};

export default Page;
