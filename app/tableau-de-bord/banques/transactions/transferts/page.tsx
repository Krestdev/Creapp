"use client";
import ErrorPage from "@/components/error-page";
import LoadingPage from "@/components/loading-page";
import PageTitle from "@/components/pageTitle";
import { bankQ } from "@/queries/bank";
import { transactionQ } from "@/queries/transaction";
import { NavLink } from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import TransferTable from "./transfer-table";

function Page() {
  const links: Array<NavLink> = [
    {
      title: "Demande de transfert",
      href: "./transferts/creer",
    },
  ];
  const getTransactions = useQuery({
    queryKey: ["transactions"],
    queryFn: transactionQ.getAll,
  });
  const getBanks = useQuery({ queryKey: ["banks"], queryFn: bankQ.getAll });

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
        <PageTitle title="Transferts" subtitle="Historique des transferts" links={links} />
        <TransferTable
          data={getTransactions.data.data.filter((t) => t.Type === "TRANSFER")}
          banks={getBanks.data.data}
        />
      </div>
    );
}

export default Page;
