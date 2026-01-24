"use client";
import { DriverTable } from "@/components/driver/driver-table";
import ErrorPage from "@/components/error-page";
import LoadingPage from "@/components/loading-page";
import PageTitle from "@/components/pageTitle";
import { driverQ } from "@/queries/driver";
import { NavLink } from "@/types/types";
import { useQuery } from "@tanstack/react-query";

function Page() {
  const links: Array<NavLink> = [
    {
      title: "Ajouter un chauffeur",
      href: "./chauffeurs/creer",
      hide: false,
      disabled: false,
    },
  ];

  const {data: drivers, isLoading, isSuccess, isError, error} = useQuery({
    queryKey: ["drivers"],
    queryFn: () => driverQ.getAll(),
  });

  if(isLoading) return <LoadingPage/>
  if(isError) return <ErrorPage error={error}/>
  if(isSuccess){
    return (
      <div className="flex flex-col gap-6">
        {/* page title */}
        <PageTitle
          title="Chauffeurs"
          subtitle="Consultez la liste des Chauffeurs."
          color="red"
          links={links}
        />
        <DriverTable data={drivers.data} />
      </div>
    );
  }
}

export default Page;
