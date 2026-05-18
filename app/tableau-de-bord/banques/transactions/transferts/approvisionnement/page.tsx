"use client";
import ErrorPage from "@/components/error-page";
import LoadingPage from "@/components/loading-page";
import PageTitle from "@/components/pageTitle";
import { bankQ } from "@/queries/bank";
import { paymentQ } from "@/queries/payment";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import CashRequestForm from "./cash-request-form";
import { queryKeys } from "@/lib/query-keys";

function Page() {
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 45,
  });

  const {
    data: banks,
    isSuccess,
    isLoading,
    isError,
    error,
  } = useQuery({ queryKey: ["banks"], queryFn: bankQ.getAll });

  const getPayments = useQuery({
    queryKey: queryKeys.approvisionnement(pagination),
    queryFn: () =>
      paymentQ.getApproData({
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize,
      }),
  });

  const filteredBanks = React.useMemo(() => {
    if (!banks) return [];
    return banks.data.filter((c) => !!c.type);
  }, [banks]);

  if (isLoading || getPayments.isLoading) {
    return <LoadingPage />;
  }
  if (isError || getPayments.isError) {
    return <ErrorPage error={error || getPayments.error || undefined} />;
  }
  if (isSuccess && getPayments.isSuccess)
    return (
      <div className="content">
        <PageTitle
          title="Approvisionnement"
          subtitle="Initier une demande de transfert de fonds vers la caisse"
          color="blue"
        />
        <CashRequestForm
          banks={filteredBanks}
          payments={getPayments.data.data}
          pagination={pagination}
          paginationOptions={{
            onPaginationChange: setPagination,
            rowCount: getPayments.data.count,
          }}
        />
      </div>
    );
}

export default Page;
