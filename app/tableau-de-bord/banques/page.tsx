"use client";
import PageTitle from "@/components/pageTitle";
import { Button } from "@/components/ui/button";
import { cn, isRole, XAF } from "@/lib/utils";
import { useStore } from "@/providers/datastore";
import { NavLink } from "@/types/types";
import Link from "next/link";
import BankTable from "./bank-table";
import { bankQ } from "@/queries/bank";
import LoadingPage from "@/components/loading-page";
import ErrorPage from "@/components/error-page";
import {
  StatisticCard,
  StatisticProps,
} from "@/components/base/TitleValueCard";
import { useQuery } from "@tanstack/react-query";

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
        title: "Caisse",
        value: XAF.format(
          getBanks.data.data
            .filter((b) => b.type === "CASH" || b.type === "CASH_REGISTER")
            .reduce((sum, bank) => sum + bank.balance, 0)
        ),
        variant: "dark",
        more: {
          title: "Nombre de comptes",
          value: getBanks.data.data.filter((b) => b.type === "CASH").length,
        },
      },
      {
        title: "Portefeuilles Mobiles",
        value: XAF.format(
          getBanks.data.data
            .filter((b) => b.type === "MOBILE_WALLET")
            .reduce((sum, bank) => sum + bank.balance, 0)
        ),
        variant: "default",
        more: {
          title: "Nombre de comptes",
          value: getBanks.data.data.filter((b) => b.type === "MOBILE_WALLET")
            .length,
        },
      },
    ];
    return (
      <div className="content">
        <PageTitle title="Banques" subtitle="Liste des comptes">
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
