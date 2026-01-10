"use client";
import ErrorPage from "@/components/error-page";
import LoadingPage from "@/components/loading-page";
import PageTitle from "@/components/pageTitle";
import { Button } from "@/components/ui/button";
import { useFetchQuery } from "@/hooks/useData";
import { cn } from "@/lib/utils";
import { transactionQ } from "@/queries/transaction";
import { NavLink } from "@/types/types";
import Link from "next/link";
import TransactionTable from "../transaction-table";
import { BankQuery } from "@/queries/bank";

function Page() {
  const links: Array<NavLink> = [
    {
      title: "Demande de transfert",
      href: "./transferts/creer",
    },
  ];
  const getTransactions = useFetchQuery(
    ["transactions"],
    transactionQ.getAll,
    30000
  );
  const bank = new BankQuery();
  const getBanks = useFetchQuery(["transactions"], bank.getAll, 50000);

  if (getTransactions.isLoading || getBanks.isLoading) {
    return <LoadingPage />;
  }
  if (getTransactions.isError || getBanks.isError) {
    return (
      <ErrorPage error={getTransactions.error || getBanks.error || undefined} />
    );
  }
  if (getTransactions.isSuccess && getBanks.isSuccess)
    return (
      <div className="content">
        <PageTitle title="Transferts" subtitle="Historique des transferts">
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
        <TransactionTable
          data={getTransactions.data.data.filter((t) => t.Type === "TRANSFER")}
          canEdit={true}
          banks={getBanks.data.data}
        />
      </div>
    );
}

export default Page;
