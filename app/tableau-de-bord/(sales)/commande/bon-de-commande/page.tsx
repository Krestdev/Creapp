"use client";

import ErrorPage from "@/components/error-page";
import LoadingPage from "@/components/loading-page";
import PageTitle from "@/components/pageTitle";
import { queryKeys } from "@/lib/query-keys";
import { userQ } from "@/queries/baseModule";
import { CommandConditionQ } from "@/queries/commandsConditions";
import { invoiceQ } from "@/queries/invoices";
import { payTypeQ } from "@/queries/payType";
import { purchaseQ } from "@/queries/purchase-order";
import { quotationQ } from "@/queries/quotation";
import { receptionQ } from "@/queries/reception";
import { NavLink } from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { PurchaseTable } from "./PurchaseTable";

const Page = () => {
  const { isSuccess, isError, error, isLoading, data } = useQuery({
    queryKey: queryKeys.purchaseOrders,
    queryFn: purchaseQ.getAll,
  });

  const getConditions = useQuery({
    queryKey: queryKeys.conditions,
    queryFn: () => CommandConditionQ.getAll(),
  });

  const getInvoices = useQuery({
    queryKey: queryKeys.invoices,
    queryFn: invoiceQ.getAll,
  });

  const getReceptions = useQuery({
    queryKey: queryKeys.receptions,
    queryFn: receptionQ.getAll,
  });

  const getUsers = useQuery({
    queryKey: queryKeys.users,
    queryFn: userQ.getAll,
  });

  const getQuotations = useQuery({
    queryKey: queryKeys.quotations,
    queryFn: quotationQ.getAll,
  });

  const getPaymentType = useQuery({
    queryKey: queryKeys.paymentTypes,
    queryFn: payTypeQ.getAll,
  });

  // const { user } = useStore();
  // const auth = isRole({
  //   roleList: user?.role || [],
  //   role: "Donner d'ordre achat",
  // });

  const receptions = useMemo(() => {
    if (!getReceptions.data) return [];
    return getReceptions.data.data.filter((r) => r.Status !== "COMPLETED");
  }, [getReceptions.data]);

  const links: Array<NavLink> = [
    {
      title: "Créer un bon",
      href: "./bon-de-commande/creer",
      hide: false,
    },
    {
      title: "Statistiques",
      href: "./bon-de-commande/statistiques",
      disabled: false,
    },
    {
      title: "Receptions",
      href: "./bon-de-commande/receptions",
      disabled: false,
      badge: receptions.length > 0 ? receptions.length : undefined,
    },
  ];

  if (
    isLoading ||
    getConditions.isLoading ||
    getInvoices.isLoading ||
    getReceptions.isLoading ||
    getUsers.isLoading ||
    getQuotations.isLoading ||
    getPaymentType.isLoading
  ) {
    return <LoadingPage />;
  }
  if (
    isError ||
    getConditions.isError ||
    getInvoices.isError ||
    getReceptions.isError ||
    getUsers.isError ||
    getQuotations.isError ||
    getPaymentType.isError
  ) {
    return (
      <ErrorPage
        error={
          error ||
          getInvoices.error ||
          getConditions.error ||
          getReceptions.error ||
          getUsers.error ||
          getQuotations.error ||
          getPaymentType.error ||
          undefined
        }
      />
    );
  }
  if (
    isSuccess &&
    getConditions.isSuccess &&
    getInvoices.isSuccess &&
    getReceptions.isSuccess &&
    getUsers.isSuccess &&
    getQuotations.isSuccess &&
    getPaymentType.isSuccess
  )
    return (
      <div className="content">
        <PageTitle
          title="Bons de commande"
          subtitle="Approbation des bons de commande"
          links={links}
        />
        <PurchaseTable
          data={data.data}
          conditions={getConditions.data.data}
          invoices={getInvoices.data.data}
          users={getUsers.data.data}
          quotations={getQuotations.data.data}
          paytypes={getPaymentType.data.data}
        />
      </div>
    );
};

export default Page;
