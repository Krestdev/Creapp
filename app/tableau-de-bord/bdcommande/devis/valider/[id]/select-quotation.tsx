"use client"
import React from 'react'
import { useFetchQuery } from '@/hooks/useData';
import { groupQuotationsByCommandRequest } from '@/lib/quotation-functions';
import { CommandQueries } from '@/queries/commandModule';
import { ProviderQueries } from '@/queries/providers';
import { QuotationQueries } from '@/queries/quotation';
import { notFound } from 'next/navigation';
import LoadingPage from '@/components/loading-page';

function SelectQuotation({id}:{id:string}) {
  const quotationQuery = new QuotationQueries();
    const quotations = useFetchQuery(["quotations"], quotationQuery.getAll);
    /**Providers fetch */
    const providersQuery = new ProviderQueries();
    const providers = useFetchQuery(["providers"], providersQuery.getAll, 500000);
    /**Commands fetch */
    const commandsQuery = new CommandQueries();
    const commands = useFetchQuery(["commands"], commandsQuery.getAll, 30000);

    const data = React.useMemo(() => {
      if(!quotations.data || !providers.data || !commands.data) return [];
        return groupQuotationsByCommandRequest(commands.data.data, quotations.data.data, providers.data.data);
      }, [commands, quotations, providers]);

    const quotationGroup = data.find(x=> x.commandRequest.id === Number(id));

    if(quotations.isLoading || providers.isLoading || commands.isLoading) return <LoadingPage/>
    if(!quotationGroup) return notFound();
  return <div>

  </div>
}

export default SelectQuotation