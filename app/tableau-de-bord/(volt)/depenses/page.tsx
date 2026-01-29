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
import { payTypeQ } from "@/queries/payType";
import ExpensesTable from "./expenses-table";
import { providerQ } from "@/queries/providers";
import { requestQ } from "@/queries/requestModule";
import { userQ } from "@/queries/baseModule";

function Page() {
  const links: Array<NavLink> = [
    {
      title: "Créer une dépense",
      href: "/tableau-de-bord/depenses/creer",
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

  const request = useQuery({
    queryKey: ["requests"],
    queryFn: () => {
      return requestQ.getAll();
    },
  });

  const getUsers = useQuery({
    queryKey: ["users"],
    queryFn: () => userQ.getAll(),
  });



  const getBanks = useQuery({ queryKey: ["banks"], queryFn: bankQ.getAll });
  const getProviders = useQuery({
    queryKey: ["providers"],
    queryFn: providerQ.getAll,
  });
  if (
    isLoading ||
    getPurchases.isLoading ||
    getBanks.isLoading ||
    getRequestType.isLoading ||
    getPaymentType.isLoading ||
    request.isLoading ||
    getProviders.isLoading ||
    getUsers.isLoading
  ) {
    return <LoadingPage />;
  }
  if (
    isError ||
    getPurchases.isError ||
    getBanks.isError ||
    getRequestType.isError ||
    getPaymentType.isError ||
    request.isError ||
    getProviders.isError ||
    getUsers.isError
  ) {
    return (
      <ErrorPage
        error={
          error ||
          getPurchases.error ||
          getBanks.error ||
          getRequestType.error ||
          getPaymentType.error ||
          getProviders.error ||
          request.error ||
          getUsers.error ||
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
    getPaymentType.isSuccess &&
    request.isSuccess &&
    getProviders.isSuccess &&
    getUsers.isSuccess
  ) {
    const Statistics: Array<StatisticProps> = [
      {
        title: "Tickets en attente",
        value: data.data.filter(
          (p) => p.status === "pending_depense" || p.status === "validated",
        ).length,
        variant: "primary",
        more: {
          title: "Montant total",
          value: XAF.format(
            data.data
              .filter(
                (p) =>
                  p.status === "pending_depense" || p.status === "validated",
              )
              .reduce((total, el) => total + el.price, 0),
          ),
        },
      },
      {
        title: "Tickets payés",
        value: data.data.filter((p) => p.status === "paid").length,
        variant: "secondary",
        more: {
          title: "Montant total",
          value: XAF.format(
            data.data
              .filter((p) => p.status === "paid")
              .reduce((total, el) => total + el.price, 0),
          ),
        },
      },
      {
        title: "Tickets en attente de paiement",
        value: data.data.filter((p) => p.status === "signed" || p.status === "simple_signed").length,
        variant: "default",
        more: {
          title: "Montant total",
          value: XAF.format(
            data.data
              .filter((p) => p.status === "signed" || p.status === "simple_signed")
              .reduce((total, el) => total + el.price, 0),
          ),
        },
      },
    ];

    return (
      <div className="content">
        <PageTitle
          title="Dépenses"
          subtitle="Consulter et traiter les dépenses"
          color="red"
          links={links}
        />
        <div className="grid grid-cols-1 @min-[640px]:grid-cols-2 @min-[1024px]:grid-cols-4 items-center gap-5">
          {Statistics.map((data, id) => (
            <StatisticCard key={id} {...data} className="h-full" />
          ))}
        </div>
        <ExpensesTable
          payments={data.data}
          banks={getBanks.data.data}
          purchases={getPurchases.data.data}
          requestTypes={getRequestType.data.data}
          getPaymentType={getPaymentType}
          providers={getProviders.data.data}
          request={request.data.data}
          users={getUsers.data.data}
        />
      </div>
    );
  }
}

export default Page;
