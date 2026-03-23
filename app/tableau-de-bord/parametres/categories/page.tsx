'use client'
import ErrorPage from "@/components/error-page";
import LoadingPage from "@/components/loading-page";
import PageTitle from "@/components/pageTitle";
import { userQ } from "@/queries/baseModule";
import { categoryQ } from "@/queries/categoryModule";
import { requestTypeQ } from "@/queries/requestType";
import { NavLink } from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import { TableCategories } from "./table-categories";

function Page() {
  const links: Array<NavLink> = [
    {
      title: "Créer un Catégorie",
      href: "./categories/creer",
    },
  ];

  const { isSuccess, isError, error, isLoading, data } = useQuery({
    queryKey: ["categoryList"],
    queryFn: categoryQ.getCategories,
  });
  const getUsers = useQuery({
    queryKey: ["users"],
    queryFn: userQ.getAll,
  });
  const getRequestTypes = useQuery({
    queryKey: ["types"],
    queryFn: requestTypeQ.getAll,
  });

  if (isLoading || getUsers.isLoading || getRequestTypes.isLoading) {
    return <LoadingPage />;
  }
  if (isError || getUsers.isError || getRequestTypes.isError) {
    return <ErrorPage error={error || getUsers.error || getRequestTypes.error || undefined} />;
  }
  if (isSuccess && getUsers.isSuccess && getRequestTypes.isSuccess)

  return (
    <div className="flex flex-col gap-6">
      {/* page title */}
      <PageTitle
        title="Catégories besoins"
        subtitle="Consultez la liste des catégories."
        color="red"
        links={links}
      />
      <TableCategories data={data.data} users={getUsers.data.data} types={getRequestTypes.data.data} />
    </div>
  );
}

export default Page;
