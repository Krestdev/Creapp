"use client";
import ErrorPage from "@/components/error-page";
import LoadingPage from "@/components/loading-page";
import PageTitle from "@/components/pageTitle";
import { isRole } from "@/lib/utils";
import { useStore } from "@/providers/datastore";
import { bankQ } from "@/queries/bank";
import { transactionQ } from "@/queries/transaction";
import { NavLink } from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import TransactionTable from "./transaction-table";

function Page() {
  const { user } = useStore();
  const auth = isRole({ roleList: user?.role ?? [], role: "trésorier" });
  const links: Array<NavLink> = [
    {
      title: "Créer une transaction",
      href: "./transactions/creer",
      hide: !auth,
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
        <PageTitle
          title="Transactions"
          subtitle="Consultez la liste des transactions"
          links={links}
        />
        <TransactionTable
          data={getTransactions.data.data.filter((t) => t.status === "APPROVED").sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())}
          canEdit={true}
          banks={getBanks.data.data}
          filterByType
        />
      </div>
    );
}

export default Page;
