"use client";
import ErrorPage from "@/components/error-page";
import LoadingPage from "@/components/loading-page";
import PageTitle from "@/components/pageTitle";
import { bankQ } from "@/queries/bank";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import CashSupplyForm from "./cash-supply-form";
import { requestQ } from "@/queries/requestModule";
import CashRequestForm from "./cash-request-form";
import { paymentQ } from "@/queries/payment";

function Page() {
  const {
    data: banks,
    isSuccess,
    isLoading,
    isError,
    error,
  } = useQuery({ queryKey: ["banks"], queryFn: bankQ.getAll });

  const getPayments = useQuery({
    queryKey: ["payments"],
    queryFn: paymentQ.getAll,
  });

  const filteredBanks = React.useMemo(() => {
    if (!banks) return [];
    return banks.data.filter((c) => !!c.type);
  }, [banks]);

  const filteredPayments = React.useMemo(() => {
    if (!getPayments.data) return [];
    return getPayments.data.data.filter(
      (r) =>
        r.method?.type === "cash" && r.type !== "transport" && r.type !== "gas",
    ); //To-Do Complete this
  }, [getPayments.data]);

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
        {/*  <CashSupplyForm banks={filteredBanks} requests={filteredRequests} /> */}
        <CashRequestForm banks={filteredBanks} payments={filteredPayments} />
      </div>
    );
}

export default Page;
