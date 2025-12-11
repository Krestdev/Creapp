import DepartementPage from "@/components/organisation/departements";
import PageTitle from "@/components/pageTitle";

function Page() {
  return (
    <div className="flex flex-col gap-6">
      {/* page title */}
      <PageTitle
        title="Departements"
        subtitle="Consultez la liste des départements."
        color="red"
      />
      <DepartementPage />
    </div>
  );
}

export default Page;
