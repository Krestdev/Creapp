import ProviderListPage from "@/components/pages/provider/liste";
import PageTitle from "@/components/pageTitle";

function Page() {
  return (
    <div className="flex flex-col gap-6">
      {/* page title */}
      <PageTitle
        title="Utilisateurs"
        subtitle="Consultez la liste des utilisateurs."
        color="red"
      />
      <ProviderListPage />
    </div>
  );
}

export default Page;
