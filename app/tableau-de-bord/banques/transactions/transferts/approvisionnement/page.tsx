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

function Page() {
  const {
    data: banks,
    isSuccess,
    isLoading,
    isError,
    error,
  } = useQuery({ queryKey: ["banks"], queryFn: bankQ.getAll });

  const getRequests = useQuery({
    queryKey: ["requests"],
    queryFn: requestQ.getAll,
  });

  const filteredBanks = React.useMemo(() => {
    if (!banks) return [];
    return banks.data.filter((c) => !!c.type);
  }, [banks]);

  const filteredRequests = React.useMemo(() => {
    if (!getRequests.data) return [];
    return getRequests.data.data.filter((r) => true); //To-Do Complete this
  }, [getRequests.data]);

  if (isLoading || getRequests.isLoading) {
    return <LoadingPage />;
  }
  if (isError || getRequests.isError) {
    return <ErrorPage error={error || getRequests.error || undefined} />;
  }
  if (isSuccess && getRequests.isSuccess)
    return (
      <div className="content">
        <PageTitle
          title="Approvisionnement"
          subtitle="Initier une demande de transfert de fonds vers la caisse"
          color="blue"
        />
        {/*  <CashSupplyForm banks={filteredBanks} requests={filteredRequests} /> */}
        <CashRequestForm banks={filteredBanks} needs={filteredRequests} />
      </div>
    );
}

export default Page;
