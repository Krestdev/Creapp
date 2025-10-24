import UtilisateursPage from "@/components/pages/utilisateurs/utilisateurs";
import PageTitle from "@/components/pageTitle";

function Page() {
  return (
    <div className="flex flex-col gap-6">
      {/* page title */}
      <PageTitle
        title="Organisation"
        subtitle="Consultez et gérez les Departements et Services."
        color="red"
      />
      <UtilisateursPage />
    </div>
  );
}

export default Page;
