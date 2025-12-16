"use client";

import ErrorPage from "@/components/error-page";
import LoadingPage from "@/components/loading-page";
import PageTitle from "@/components/pageTitle";
import { DevisTable } from "@/components/tables/DevisTable";
import { Button } from "@/components/ui/button";
import { useFetchQuery } from "@/hooks/useData";
import { useStore } from "@/providers/datastore";
import { CommandQueries } from "@/queries/commandModule";
import { ProviderQueries } from "@/queries/providers";
import { QuotationQueries } from "@/queries/quotation";
import Link from "next/link";
import React from "react";
import { QuotationGroupTable } from "./quotation-group";


const Page = () => {
  const { user } = useStore();
  const isManager = user?.role.some(r=>r.label === "SALES_MANAGER");
  const isAdmin = user?.role.some(r=> r.label === "SALES_MANAGER" || r.label === "ADMIN");
  /**Quotation fetch */
  const quotationQuery = new QuotationQueries();
  const { data, isSuccess, isError, error, isLoading } = useFetchQuery(["quotations"], quotationQuery.getAll);
  /**Providers fetch */
  const providersQuery = new ProviderQueries();
  const providers = useFetchQuery(["providers"], providersQuery.getAll, 500000);
  /**Commands fetch */
  const commandsQuery = new CommandQueries();
  const commands = useFetchQuery(["commands"], commandsQuery.getAll, 30000);

  const [dateFilter, setDateFilter] = React.useState<
    "today" | "week" | "month" | "year" | "custom" | undefined
  >();
if(isLoading || providers.isLoading || commands.isLoading){
  return <LoadingPage/>
}
if(isError || providers.isError || commands.isError){
  return <ErrorPage error={error ?? providers.error ?? commands.error ?? undefined}/>
}
if(isSuccess && providers.isSuccess && commands.isSuccess)
  return (
    <div className="content">
      <PageTitle
        title="Devis"
        subtitle="Consultez et gérez les cotations."
        color="red"
      >
        {
          !isManager && 
          <Link href={"devis/creer"}>
            <Button variant={"ghost"}>{"Créer un devis"}</Button>
          </Link>
        }
      </PageTitle>
      {
        isAdmin &&
        <QuotationGroupTable providers={providers.data.data} quotations={data.data} requests={commands.data.data}/>
      }
      <DevisTable
        data={data.data}
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
        commands={commands.data.data}
        providers={providers.data.data}
      />
    </div>
  );
};

export default Page;
