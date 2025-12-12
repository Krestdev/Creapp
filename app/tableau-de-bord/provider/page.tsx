import UtilisateursPage from "@/components/utilisateurs/utilisateurs";
import PageTitle from "@/components/pageTitle";

function Page() {
  return (
    <div className="flex flex-col gap-6">
      {/* page title hier*/}
      <PageTitle
        title="Utilisateurs"
        subtitle="Consultez et gérez les utilisateurs."
        color="red"
      />
      <UtilisateursPage />
    </div>
  );
}

export default Page;
