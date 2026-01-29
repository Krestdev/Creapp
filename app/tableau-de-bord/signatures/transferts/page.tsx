"use client";
import {
    StatisticCard,
    StatisticProps,
} from "@/components/base/TitleValueCard";
import ErrorPage from "@/components/error-page";
import LoadingPage from "@/components/loading-page";
import PageTitle from "@/components/pageTitle";
import { useStore } from "@/providers/datastore";
import { bankQ } from "@/queries/bank";
import { payTypeQ } from "@/queries/payType";
import { signatairQ } from "@/queries/signatair";
import { transactionQ } from "@/queries/transaction";
import { TransferTransaction } from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
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

  /* function canSign(bankId:number,payTypeId:number){
  const signers = signatair.data?.data.find(x=>x.bankId === bankId && x.payTypeId === payTypeId )?.user?.some(u=> u.id === user?.id);
  return !!signers ;
  } */

  // Calculs mémoïsés pour éviter les recalculs inutiles
  const filteredData :Array<TransferTransaction> = useMemo(() => {
    if(!data || !signatair.data) return [];
    return data.data
    .filter(t=> t.Type === "TRANSFER")
    .filter(t => {
        if(!t.methodId) return false;
        if(t.from.type === "BANK" && t.to.type === "BANK"){
            return signatair.data.data.find(x=>x.bankId === t.from.id && x.payTypeId === t.method?.id )?.user?.some(u=> u.id === user?.id)
        }
        return false;
    })
    
  }, [data, signatair.data, user?.id]);

  console.log(filteredData)
  const unsigned = filteredData.filter(t=> t.isSigned === false && t.signers.length === 0 ? true : t.signers.some(s=> s.id === user?.id && s.signed === false)  );
  console.log(unsigned)
  const signed = filteredData.filter(t=> !!t.signers?.find(s=> s.userId === user?.id)?.signed === true);
  const signedByOthers = filteredData.filter(t=> t.isSigned === true && !t.signers?.find(s=> s.userId === user?.id));

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
        more: {
          title: "Signé par un autre signataire",
          value: signedByOthers.length
        }
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

        <div className="h-fit grid grid-cols-1 @min-[640px]:grid-cols-2 @min-[1024px]:grid-cols-4 items-center gap-5">
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
