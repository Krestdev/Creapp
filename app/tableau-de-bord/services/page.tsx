"use client";
import ErrorPage from "@/components/error-page";
import LoadingPage from "@/components/loading-page";
import PageTitle from "@/components/pageTitle";
import { userQ } from "@/queries/baseModule";
import { useQuery } from "@tanstack/react-query";
import ServicesTable from "./services-table";
import { NavLink } from "@/types/types";
import { serviceQ } from "@/queries/services";

function Page() {
  const links: Array<NavLink> = [
    {
      href: "/tableau-de-bord/services/creer",
      title: "Créer un service",
    },
  ];

  const getUsers = useQuery({
    queryKey: ["users"],
    queryFn: userQ.getAll,
  });

  const getServices = useQuery({
    queryKey: ["services"],
    queryFn: serviceQ.getAll,
  });

  if (getUsers.isLoading || getServices.isLoading) return <LoadingPage />;
  if (getUsers.isError || getServices.isError)
    return (
      <ErrorPage error={getUsers.error || getServices.error || undefined} />
    );
  if (getUsers.isSuccess && getServices.isSuccess)
    return (
      <div className="content">
        <PageTitle
          title="Services"
          subtitle="Consultez et gérez le personnel assigné à un service"
          links={links}
        />
        <ServicesTable
          services={getServices.data.data}
          users={getUsers.data.data}
        />
      </div>
    );
}

export default Page;
