"use client";
import {
  StatisticCard,
  StatisticProps,
} from "@/components/base/TitleValueCard";
import ErrorPage from "@/components/error-page";
import LoadingPage from "@/components/loading-page";
import PageTitle from "@/components/pageTitle";
import { isRole, XAF } from "@/lib/utils";
import { useStore } from "@/providers/datastore";
import { bankQ } from "@/queries/bank";
import { NavLink } from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import BankTable from "./bank-table";

function Page() {
  const { user } = useStore();
  const auth =
    isRole({ roleList: user?.role ?? [], role: "trésorier" }) ||
    isRole({ roleList: user?.role ?? [], role: "comptable" });
  const canEdit = isRole({ roleList: user?.role ?? [], role: "trésorier" });
  const links: Array<NavLink> = [
    {
      title: "Ajouter un compte",
      href: "./banques/creer",
      hide: !auth,
    },
  ];

  const getBanks = useQuery({ queryKey: ["banks"], queryFn: bankQ.getAll });

  if (getBanks.isLoading) {
    return <LoadingPage />;
  }
  if (getBanks.isError) {
    return <ErrorPage error={getBanks.error} />;
  }
  if (getBanks.isSuccess) {
    const bankBalances: Array<StatisticProps> = [
      {
        title: "Solde Total",
        value: XAF.format(
          getBanks.data.data.reduce((sum, bank) => sum + bank.balance, 0)
        ),
        variant: "primary",
      },
      {
        title: "Comptes Bancaires",
        value: XAF.format(
          getBanks.data.data
            .filter((b) => b.type === "BANK")
            .reduce((sum, bank) => sum + bank.balance, 0)
        ),
        variant: "secondary",
        more: {
          title: "Nombre de comptes",
          value: getBanks.data.data.filter((b) => b.type === "BANK").length,
        },
      },
      {
        title: "Total caisses",
        value: XAF.format(
          getBanks.data.data
            .filter((b) => b.type === "CASH" || b.type === "CASH_REGISTER")
            .reduce((sum, bank) => sum + bank.balance, 0)
        ),
        variant: "dark",
        more: {
          title: "Nombre de comptes",
          value: getBanks.data.data.filter((b) => b.type === "CASH").length + 1,
        },
      },
    ];
    return (
      <div className="content">
        <PageTitle title="Banques" subtitle="Liste des comptes" links={links} />
        <div className="grid-stats-4">
          {bankBalances.map((item, id) => (
            <StatisticCard key={id} {...item} />
          ))}
        </div>
        <BankTable
          data={getBanks.data.data.filter((c) => !!c.type)}
          canEdit={canEdit}
        />
      </div>
    );
  }
}

export default Page;
