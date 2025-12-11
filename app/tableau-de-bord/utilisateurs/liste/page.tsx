import UserListPage from "@/components/utilisateurs/liste";
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
      <UserListPage />
    </div>
  );
}

export default Page;
