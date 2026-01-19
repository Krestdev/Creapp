import PageTitle from "@/components/pageTitle";
import { VehicleForm } from "./form";

const Page = () => {
  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Ajouter un véhicule"
        subtitle="Formulaire de création d'un véhicule"
        color="blue"
      />
      <VehicleForm />
    </div>
  );
};

export default Page;
