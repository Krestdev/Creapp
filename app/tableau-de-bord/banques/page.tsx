'use client'
import PageTitle from '@/components/pageTitle';
import { Button } from '@/components/ui/button';
import { cn, isRole } from '@/lib/utils';
import { useStore } from '@/providers/datastore';
import { NavLink } from '@/types/types';
import Link from 'next/link';
import { BankTable } from './bank-table';
import { BankQuery } from '@/queries/bank';
import { useFetchQuery } from '@/hooks/useData';
import LoadingPage from '@/components/loading-page';
import ErrorPage from '@/components/error-page';

function Page() {
  const { user } = useStore();
  const auth = isRole({roleList: user?.role ?? [], role: "trésorier"});
  const links: Array<NavLink> = [
    {
      title: "Ajouter un compte",
      href: "./banques/creer",
      hide: !auth,
    }
  ];

  const bankQuery = new BankQuery();
  const getBanks = useFetchQuery(["banks"], bankQuery.getAll, 120000);

  if(getBanks.isLoading){
    return <LoadingPage/>
  }
  if(getBanks.isError){
    return <ErrorPage error={getBanks.error} />
  }
  if(getBanks.isSuccess)
  return (
    <div className='content'>
      <PageTitle title='Banques' subtitle="Liste des comptes">
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
      <BankTable data={getBanks.data.data}/>
    </div>
  )
}

export default Page