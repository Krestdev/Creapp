import ProviderListPage from "@/components/provider/liste";
import PageTitle from "@/components/pageTitle";

function Page() {
  return (
    <div className="flex flex-col gap-6">
      {/* page title */}
      <PageTitle
        title="Fournisseurs"
        subtitle="Consultez la liste des fournisseurs."
        color="red"
      />
      <ProviderListPage />
    </div>
  );
}

export default Page;
