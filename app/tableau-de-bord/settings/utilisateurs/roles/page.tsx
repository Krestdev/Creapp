"use client"
import ErrorPage from "@/components/error-page";
import LoadingPage from "@/components/loading-page";
import PageTitle from "@/components/pageTitle";
import { RoleTable } from "@/components/utilisateurs/roles-table";
import { userQ } from "@/queries/baseModule";
import { useQuery } from "@tanstack/react-query";
import Roles from "./roles";

function Page() {
  const {
    data: roles,
    isError,
    error,
    isLoading,
    isSuccess,
  } = useQuery({
    queryKey: ["rolesList"],
    queryFn: () => userQ.getRoles(),
  });

  if (isLoading) {
    return <LoadingPage />;
  }
  if (isError) {
    return <ErrorPage error={error} />;
  }
  if (isSuccess) {
    return (
      <div className="content">
        {/* page title */}
        <PageTitle
          title="Rôles"
          subtitle="Consultez la liste des rôles."
          color="red"
        />
        {/* <RoleTable data={roles.data.filter((x) => x.label !== "MANAGER")} /> */}
        <Roles data={roles.data.filter((x) => x.label !== "MANAGER")} />
      </div>
    );
  }
}

export default Page;
