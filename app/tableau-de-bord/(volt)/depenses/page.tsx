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
import { invoiceQ } from "@/queries/invoices";
import { projectQ } from "@/queries/projectModule";
import { transactionQ } from "@/queries/transaction";
import { signatairQ } from "@/queries/signatair";
import { useMemo } from "react";
import { vehicleQ } from "@/queries/vehicule";

function Page() {
  const links: Array<NavLink> = [
    {
      title: "Créer une dépense",
      href: "/tableau-de-bord/depenses/creer",
      hide: true,
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

  const getInvoices = useQuery({
    queryKey: ["invoices"],
    queryFn: invoiceQ.getAll,
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

  const getProjects = useQuery({
    queryKey: ["projects"],
    queryFn: () => {
      return projectQ.getAll();
    },
  });

  const getUsers = useQuery({
    queryKey: ["users"],
    queryFn: () => userQ.getAll(),
  });

  const getBanks = useQuery({ queryKey: ["banks"], queryFn: bankQ.getAll });

  const getTransactions = useQuery({
    queryKey: ["transactions"],
    queryFn: transactionQ.getAll,
  });

  const getProviders = useQuery({
    queryKey: ["providers"],
    queryFn: providerQ.getAll,
  });

  const getSignataires = useQuery({
    queryKey: ["SignatairList"],
    queryFn: signatairQ.getAll,
  });

  const getVehicles = useQuery({
    queryKey: ["vehicles"],
    queryFn: vehicleQ.getAll,
  });

  const filteredData = useMemo(() => {
    if (!data) return [];
    return data.data.filter((x) => x.type !== "appro");
  }, [data]);

  if (
    isLoading ||
    getInvoices.isLoading ||
    getBanks.isLoading ||
    getRequestType.isLoading ||
    getPaymentType.isLoading ||
    request.isLoading ||
    getProviders.isLoading ||
    getProjects.isLoading ||
    getUsers.isLoading ||
    getTransactions.isLoading ||
    getSignataires.isLoading ||
    getVehicles.isLoading
  ) {
    return <LoadingPage />;
  }
  if (
    isError ||
    getInvoices.isError ||
    getBanks.isError ||
    getRequestType.isError ||
    getPaymentType.isError ||
    request.isError ||
    getProviders.isError ||
    getProjects.isError ||
    getUsers.isError ||
    getTransactions.isError ||
    getSignataires.isError ||
    getVehicles.isError
  ) {
    return (
      <ErrorPage
        error={
          error ||
          getInvoices.error ||
          getBanks.error ||
          getRequestType.error ||
          getPaymentType.error ||
          getProviders.error ||
          request.error ||
          getProjects.error ||
          getUsers.error ||
          getTransactions.error ||
          getSignataires.error ||
          getVehicles.error ||
          undefined
        }
      />
    );
  }
  if (
    isSuccess &&
    getInvoices.isSuccess &&
    getBanks.isSuccess &&
    getRequestType.isSuccess &&
    getPaymentType.isSuccess &&
    request.isSuccess &&
    getProviders.isSuccess &&
    getProjects.isSuccess &&
    getUsers.isSuccess &&
    getTransactions.isSuccess &&
    getSignataires.isSuccess &&
    getVehicles.isSuccess
  ) {
    const Statistics: Array<StatisticProps> = [
      {
        title: "Tickets en attente de traitement",
        value: filteredData.filter((p) => p.status === "validated").length,
        variant: "primary",
        more: {
          title: "Montant total",
          value: XAF.format(
            filteredData
              .filter((p) => p.status === "validated")
              .reduce((total, el) => total + el.price, 0),
          ),
        },
      },
      {
        title: "Tickets payés",
        value: filteredData.filter((p) => p.status === "paid").length,
        variant: "secondary",
        more: {
          title: "Montant total",
          value: XAF.format(
            filteredData
              .filter((p) => p.status === "paid")
              .reduce((total, el) => total + el.price, 0),
          ),
        },
      },
      {
        title: "Tickets traités",
        value: filteredData.filter(
          (p) => p.status === "signed" || p.status === "simple_signed",
        ).length,
        variant: "default",
        more: {
          title: "Montant total",
          value: XAF.format(
            filteredData
              .filter(
                (p) => p.status === "signed" || p.status === "simple_signed",
              )
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
          payments={filteredData}
          banks={getBanks.data.data}
          invoices={getInvoices.data.data}
          requestTypes={getRequestType.data.data}
          paymentTypes={getPaymentType.data.data}
          providers={getProviders.data.data}
          request={request.data.data}
          users={getUsers.data.data}
          projects={getProjects.data.data}
          transactions={getTransactions.data.data}
          signataires={getSignataires.data.data}
          vehicles={getVehicles.data.data}
        />
      </div>
    );
  }
}

export default Page;
