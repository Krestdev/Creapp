'use client'
import PageTitle from '@/components/pageTitle'
import React from 'react'
import TransferTable from './transfer-table'
import { TransactionQuery } from '@/queries/transaction'
import { useFetchQuery } from '@/hooks/useData'
import LoadingPage from '@/components/loading-page'
import ErrorPage from '@/components/error-page'
import TransferHistory from './transfert-history'

function Page() {
    const transactionQuery = new TransactionQuery();
    const {data, isSuccess, isError, error, isLoading} = useFetchQuery(["transactions"], transactionQuery.getAll);

    if(isLoading){
        return <LoadingPage/>
    }
    if(isError){
        return <ErrorPage error={error} />
    }
    if(isSuccess){
        return (
          <div className='content'>
              <PageTitle title='Approbation des transferts' subtitle='Approuvez ou rejetez les demandes de transfert de fonds.' color="green" />
              <TransferTable data={data.data.filter(c=> c.Type === "TRANSFER" && c.status === "PENDING")}/>
              <TransferHistory data={data.data.filter(c=> c.Type === "TRANSFER" && c.status === "APPROVED" || c.status === "REJECTED")}/>
          </div>
        )
    }
}

export default Page