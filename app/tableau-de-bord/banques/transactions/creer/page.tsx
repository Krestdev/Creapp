"use client";
import PageTitle from "@/components/pageTitle";
import React from "react";
import TransactionForm from "./transaction-form";
import { bankQ } from "@/queries/bank";
import { useFetchQuery } from "@/hooks/useData";
import LoadingPage from "@/components/loading-page";
import ErrorPage from "@/components/error-page";
import { useStore } from "@/providers/datastore";

function Page() {
  const { user } = useStore();
  const {
    data: banks,
    isError,
    error,
    isLoading,
    isSuccess,
  } = useFetchQuery(["banks"], bankQ.getAll, 20000);
  if (isLoading) {
    return <LoadingPage />;
  }
  if (isError) {
    return <ErrorPage error={error} />;
  }
  if (isSuccess)
    return (
      <div className="content">
        <PageTitle
          title="Créer une transaction"
          subtitle="Complétez le formulaire pour enregistrer une nouvelle transaction"
          color="blue"
        />
        <TransactionForm banks={banks.data} userId={user?.id ?? 0} />
      </div>
    );
}

export default Page;
