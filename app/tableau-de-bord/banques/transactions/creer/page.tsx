
'use client'
import PageTitle from '@/components/pageTitle'
import React from 'react'
import TransactionForm from './transaction-form'
import { BankQuery } from '@/queries/bank'
import { useFetchQuery } from '@/hooks/useData'
import LoadingPage from '@/components/loading-page'
import ErrorPage from '@/components/error-page'

function Page() {
    const bankQuery = new BankQuery();
    const {data: banks, isError, error, isLoading, isSuccess} = useFetchQuery(["banks"], bankQuery.getAll, 20000);
    if(isLoading){
        return <LoadingPage/>
    }
    if(isError){
        return <ErrorPage error={error} />
    }
    if(isSuccess)
  return (
    <div className='content'>
        <PageTitle title='Créer une transaction' subtitle='Complétez le formulaire pour enregistrer une nouvelle transaction' color="blue"/>
        <TransactionForm banks={banks.data} />
    </div>
  )
}

export default Page