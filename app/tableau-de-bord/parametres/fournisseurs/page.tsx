"use client";
import ErrorPage from "@/components/error-page";
import LoadingPage from "@/components/loading-page";
import PageTitle from "@/components/pageTitle";
import { ProviderTable } from "@/components/provider/provider-table";
import { providerQ } from "@/queries/providers";
import { NavLink } from "@/types/types";
import { useQuery } from "@tanstack/react-query";

function Page() {
  const links: Array<NavLink> = [
    {
      title: "Créer un fournisseur",
      href: "./fournisseurs/creer",
    },
  ];

   const {data:providers, isError, error, isSuccess, isLoading} = useQuery({
    queryKey: ["providersList"],
    queryFn: () => providerQ.getAll(),
  });

  if(isLoading) return <LoadingPage/>;
  if(isError) return <ErrorPage error={error} />
  if(isSuccess){
    return (
      <div className="flex flex-col gap-6">
        {/* page title */}
        <PageTitle
          title="Fournisseurs"
          subtitle="Consultez la liste des fournisseurs."
          color="red"
          links={links}
        />
        <ProviderTable data={providers.data} />
      </div>
    );
  }
}

export default Page;
