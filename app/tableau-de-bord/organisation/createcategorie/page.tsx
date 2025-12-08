import { CategoryCreateForm } from "@/components/forms/create-category";
import PageTitle from "@/components/pageTitle";

const Page = () => {
  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Créer une categorie"
        subtitle="Formulaire de création d'une categorie"
        color="blue"
      />
      <CategoryCreateForm />
    </div>
  );
};

export default Page;
