"use client";
import {
  StatisticCard,
  StatisticProps,
} from "@/components/base/TitleValueCard";
import ErrorPage from "@/components/error-page";
import LoadingPage from "@/components/loading-page";
import PageTitle from "@/components/pageTitle";
import { XAF } from "@/lib/utils";
import { bankQ } from "@/queries/bank";
import { paymentQ } from "@/queries/payment";
import { purchaseQ } from "@/queries/purchase-order";
import { requestTypeQ } from "@/queries/requestType";
import { NavLink } from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import ExpensesTable from "../expenses-table";
import { providerQ } from "@/queries/providers";
import { payTypeQ } from "@/queries/payType";

function Page() {
  const links: Array<NavLink> = [
    {
      title: "Créer une dépense",
      href: "./creer",
      hide: false,
      disabled: false,
    },
  ];

  const { data, isSuccess, isError, error, isLoading } = useQuery({
    queryKey: ["payments"],
    queryFn: paymentQ.getAll,
  });

  const getRequestType = useQuery({
    queryKey: ["requestType"],
    queryFn: requestTypeQ.getAll,
  });

  const getPurchases = useQuery({
    queryKey: ["purchaseOrders"],
    queryFn: purchaseQ.getAll,
  });

  const getPaymentType = useQuery({
    queryKey: ["paymentType"],
    queryFn: payTypeQ.getAll,
  });

  const getBanks = useQuery({ queryKey: ["banks"], queryFn: bankQ.getAll });

  const getProviders = useQuery({ queryKey: ["providers"], queryFn: providerQ.getAll });
  if (
    isLoading ||
    getPurchases.isLoading ||
    getBanks.isLoading ||
    getRequestType.isLoading ||
    getProviders.isLoading ||
    getPaymentType.isLoading
  ) {
    return <LoadingPage />;
  }
  if (
    isError ||
    getPurchases.isError ||
    getBanks.isError ||
    getRequestType.isError ||
    getProviders.isError ||
    getPaymentType.isError
  ) {
    return (
      <ErrorPage
        error={
          error ||
          getPurchases.error ||
          getBanks.error ||
          getRequestType.error ||
          getProviders.error ||
          getPaymentType.error ||
          undefined
        }
      />
    );
  }
  if (
    isSuccess &&
    getPurchases.isSuccess &&
    getBanks.isSuccess &&
    getRequestType.isSuccess &&
    getProviders.isSuccess &&
    getPaymentType.isSuccess
  ) {
    const Statistics: Array<StatisticProps> = [
      {
        title: "Tickets en attente",
        value: data.data.filter(
          (p) => p.status === "pending_depense" && p.type === "CURRENT"
        ).length,
        variant: "primary",
        more: {
          title: "Montant total",
          value: XAF.format(
            data.data
              .filter(
                (p) => p.status === "pending_depense" && p.type === "CURRENT"
              )
              .reduce((total, el) => total + el.price, 0)
          ),
        },
      },
      {
        title: "Tickets payés",
        value: data.data.filter(
          (p) => p.status === "paid" && p.type === "CURRENT"
        ).length,
        variant: "secondary",
        more: {
          title: "Montant total",
          value: XAF.format(
            data.data
              .filter((p) => p.status === "paid" && p.type === "CURRENT")
              .reduce((total, el) => total + el.price, 0)
          ),
        },
      },
    ];

    return (
      <div className="content">
        <PageTitle
          title="Dépenses Courantes"
          subtitle="Consulter et traiter les dépenses courantes"
          color="red"
          links={links}
        />
        <div className="grid grid-cols-1 @min-[640px]:grid-cols-2 @min-[1024px]:grid-cols-4 items-center gap-5">
          {Statistics.map((data, id) => (
            <StatisticCard key={id} {...data} className="h-full" />
          ))}
        </div>
        <ExpensesTable
          payments={data.data.filter(
            (p) => p.status === "pending_depense" && p.type === "CURRENT"
          )}
          banks={getBanks.data.data}
          purchases={getPurchases.data.data}
          requestTypes={getRequestType.data.data}
          providers={getProviders.data.data}
          getPaymentType={getPaymentType}
        />
        <ExpensesTable
          payments={data.data.filter(
            (p) => p.status === "paid" && p.type === "CURRENT"
          )}
          banks={getBanks.data.data}
          purchases={getPurchases.data.data}
          requestTypes={getRequestType.data.data}
          providers={getProviders.data.data}
          getPaymentType={getPaymentType}
        />
      </div>
    );
  }
}

export default Page;
