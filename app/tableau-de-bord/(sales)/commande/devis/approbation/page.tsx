'use client'
import PageTitle from '@/components/pageTitle'
import React from 'react'
import { QuotationGroupTable } from '../quotation-group'
import { useStore } from '@/providers/datastore'
import ErrorPage from '@/components/error-page'
import { QuotationQueries } from '@/queries/quotation'
import { useFetchQuery } from '@/hooks/useData'
import { ProviderQueries } from '@/queries/providers'
import { CommandRqstQueries } from '@/queries/commandRqstModule'
import LoadingPage from '@/components/loading-page'

function Page() {
    const { user } = useStore();
    const isAdmin = user?.role.some(
    (r) => r.label === "SALES_MANAGER" || r.label === "ADMIN"
  );
  
  const quotationQuery = new QuotationQueries();
    const quotations = useFetchQuery(
      ["quotations"],
      quotationQuery.getAll
    );
    /**Providers fetch */
    const providersQuery = new ProviderQueries();
    const providers = useFetchQuery(["providers"], providersQuery.getAll);
    /**Commands fetch */
    const commandsQuery = new CommandRqstQueries();
    const commands = useFetchQuery(["commands"], commandsQuery.getAll, 30000);

  if(!isAdmin){
    return <ErrorPage statusCode={401}/>
  }
  if(quotations.isError || providers.isError || commands.isError){
    return <ErrorPage />
  }
  if(quotations.isSuccess && providers.isSuccess && commands.isSuccess)
  return (
    <div className="content">
        <PageTitle title="Approbation des devis" subtitle="Sélectionnez les éléments des devis à valider" color="green" />
        <QuotationGroupTable
                    providers={providers.data.data}
                    quotations={quotations.data.data}
                    requests={commands.data.data}
                  />
    </div>
  )
  return <LoadingPage/>
}

export default Page