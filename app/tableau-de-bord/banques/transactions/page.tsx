'use client'
import PageTitle from '@/components/pageTitle'
import { Button } from '@/components/ui/button';
import { cn, isRole } from '@/lib/utils';
import { useStore } from '@/providers/datastore';
import { NavLink } from '@/types/types';
import Link from 'next/link';
import React from 'react'
import TransactionTable from './transaction-table';
import { TransactionQuery } from '@/queries/transaction';
import { useFetchQuery } from '@/hooks/useData';
import LoadingPage from '@/components/loading-page';
import ErrorPage from '@/components/error-page';

function Page() {
    const { user } = useStore();
    const auth = isRole({roleList: user?.role ?? [], role: "trésorier"});
    const links: Array<NavLink> = [
        {
          title: "Créer une transaction",
          href: "./transactions/creer",
          hide: !auth,
        },
        {
          title: "Demande de transfert",
          href: "./transactions/transfert",
          hide: !auth,
        },
      ];

      const transactionQuery = new TransactionQuery();
      const getTransactions = useFetchQuery(["transactions"], transactionQuery.getAll, 500000);

      if(getTransactions.isLoading){
        return <LoadingPage/>
      }
      if(getTransactions.isError){
        return <ErrorPage error={getTransactions.error} />
      }
      if(getTransactions.isSuccess)
  return (
    <div className='content'>
        <PageTitle title="Transactions" subtitle="Consultez la liste des transactions">
            {links
            .filter((x) => (!x.hide ? true : x.hide === true && false))
            .map((link, id) => {
              const isLast = links.length > 1 ? id === links.length - 1 : false;
              return (
                <Link
                  key={id}
                  href={link.href}
                  onClick={(e) => {
                    link.disabled && e.preventDefault();
                  }}
                  className={cn(link.disabled && "cursor-not-allowed")}
                >
                  <Button
                    size={"lg"}
                    variant={isLast ? "accent" : "ghost"}
                    disabled={link.disabled}
                  >
                    {link.title}
                  </Button>
                </Link>
              );
            })}
        </PageTitle>
        <TransactionTable data={getTransactions.data.data} canEdit={true} />
    </div>
  )
}

export default Page