import { RoleCreateForm } from "@/components/utilisateurs/create-Role";
import RolesPage from "@/components/utilisateurs/roles";
import PageTitle from "@/components/pageTitle";

function Page() {
  return (
    <div className="flex flex-col gap-6">
      {/* page title */}
      <PageTitle
        title="Rôles"
        subtitle="Consultez la liste des rôles."
        color="red"
      />
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        <div className="w-full">
          <RolesPage />
        </div>
        <div className={`w-full`}>
          <RoleCreateForm />
        </div>
      </div>
    </div>
  );
}

export default Page;
