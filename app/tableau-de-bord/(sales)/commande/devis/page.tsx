"use client";

import ErrorPage from "@/components/error-page";
import LoadingPage from "@/components/loading-page";
import PageTitle from "@/components/pageTitle";
import { DevisTable } from "@/components/tables/DevisTable";
import { useStore } from "@/providers/datastore";
import { commandRqstQ } from "@/queries/commandRqstModule";
import { providerQ } from "@/queries/providers";
import { quotationQ } from "@/queries/quotation";
import { NavLink } from "@/types/types";
import { useQuery } from "@tanstack/react-query";

const Page = () => {
  const { user } = useStore();
  const isAdmin = user?.role.some(
    (r) => r.label === "SALES_MANAGER" || r.label === "ADMIN",
  );

  const links: Array<NavLink> = [
    {
      title: "Créer un devis",
      href: "./devis/creer",
    },
  ];
  /**Quotation fetch */

  const { data, isSuccess, isError, error, isLoading } = useQuery({
    queryKey: ["quotations"],
    queryFn: quotationQ.getAll,
  });
  /**Providers fetch */

  const providers = useQuery({
    queryKey: ["providers"],
    queryFn: providerQ.getAll,
  });
  /**Commands fetch */
  const commands = useQuery({
    queryKey: ["commands"],
    queryFn: commandRqstQ.getAll,
  });
  if (isLoading || providers.isLoading || commands.isLoading) {
    return <LoadingPage />;
  }
  if (isError || providers.isError || commands.isError) {
    return (
      <ErrorPage
        error={error ?? providers.error ?? commands.error ?? undefined}
      />
    );
  }
  if (isSuccess && providers.isSuccess && commands.isSuccess)
    return (
      <div className="content">
        <PageTitle
          title="Devis"
          subtitle="Consultez et gérez les cotations."
          color="red"
          links={links}
        />
        <DevisTable
          data={data.data}
          commands={commands.data.data}
          providers={providers.data.data}
        />
      </div>
    );
};

export default Page;
