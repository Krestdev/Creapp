import ServicesPage from "@/components/pages/organisation/services";
import UserListPage from "@/components/pages/utilisateurs/liste";
import PageTitle from "@/components/pageTitle";

function Page() {
  return (
    <div className="flex flex-col gap-6">
      {/* page title */}
      <PageTitle
        title="Services"
        subtitle="Consultez la liste des services."
        color="red"
      />
      <ServicesPage />
    </div>
  );
}

export default Page;
