"use client";
import { TabBar } from "@/components/base/TabBar";
import {
    StatisticCard,
    StatisticProps,
} from "@/components/base/TitleValueCard";
import ErrorPage from "@/components/error-page";
import LoadingPage from "@/components/loading-page";
import PageTitle from "@/components/pageTitle";
import { XAF } from "@/lib/utils";
import { useStore } from "@/providers/datastore";
import { bankQ } from "@/queries/bank";
import { payTypeQ } from "@/queries/payType";
import { signatairQ } from "@/queries/signatair";
import { transactionQ } from "@/queries/transaction";
import { Transaction, TransferTransaction } from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import SignTransfers from "./sign-transfers";

function Page() {
  const { data, isSuccess, isError, error, isLoading } = useQuery({
    queryKey: ["transactions"],
    queryFn: transactionQ.getAll,
  });

  const signatair = useQuery({
    queryKey: ["signatairs"],
    queryFn: signatairQ.getAll,
  });
  const getBanks = useQuery({
    queryKey: ["banks"],
    queryFn: bankQ.getAll,
  });
  const getPayType = useQuery({
    queryKey: ["payType"],
    queryFn: payTypeQ.getAll,
  });

  const { user } = useStore();

  // Calculs mémoïsés pour éviter les recalculs inutiles
  const filteredData :Array<TransferTransaction> = useMemo(() => {
    if(!data || !signatair.data) return [];
    return data.data
    .filter(t=> t.Type === "TRANSFER")
    .filter(t => {
        if(!t.methodId) return false;
        if(t.from.type === "BANK" && t.to.type === "BANK"){
            return signatair.data.data.find(s => s.bankId === t.from.id && s.payTypeId === t.methodId)?.user?.some(x=> x.id === user?.id) 
            && t.status !== "PENDING" 
            && t.status !== "REJECTED"
        }
        return false;
    })
    
  }, [data, signatair.data, user?.id]);

  const unsigned = filteredData.filter(t=> !t.isSigned );
  const signed = filteredData.filter(t=> t.isSigned);

  const statistics: Array<StatisticProps> = [
      {
        title: "En attente signature",
        value: unsigned.length,
        variant: "primary",
      },
      {
        title: "Signés",
        value: signed.length,
        variant: "success",
      },
    ];


  if (
    isLoading ||
    getBanks.isLoading ||
    getPayType.isLoading ||
    signatair.isLoading
  ) {
    return <LoadingPage />;
  }

  if (
    isError ||
    getBanks.isError ||
    getPayType.isError ||
    signatair.isError
  ) {
    return (
      <ErrorPage
        error={
          error ||
          getBanks.error ||
          getPayType.error ||
          signatair.error ||
          undefined
        }
      />
    );
  }


  if (
    isSuccess &&
    getBanks.isSuccess &&
    getPayType.isSuccess &&
    signatair.isSuccess
  ) {
    return (
      <div className="content">
        <PageTitle
          title="Signer les Documents"
          subtitle="Signer les transferts"
          color="blue"
        />

        <div className="grid grid-cols-1 @min-[640px]:grid-cols-2 @min-[1024px]:grid-cols-4 items-center gap-5 mb-6">
          {statistics.map((data, id) => (
            <StatisticCard key={id} {...data} className="h-full" />
          ))}
        </div>
        <SignTransfers data={filteredData} banks={getBanks.data.data} paymentMethods={getPayType.data.data}  />
      </div>
    );
  }

  return null;
}

export default Page;
