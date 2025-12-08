import { DepartmentCreateForm } from "@/components/forms/create-department";
import PageTitle from "@/components/pageTitle";

const Page = () => {
  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Créer un departement"
        subtitle="Formulaire de création d'un departement"
        color="blue"
      />
      <DepartmentCreateForm />
    </div>
  );
};

export default Page;
