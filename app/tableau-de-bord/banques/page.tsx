"use client";
import ErrorPage from "@/components/error-page";
import LoadingPage from "@/components/loading-page";
import PageTitle from "@/components/pageTitle";
import { Button } from "@/components/ui/button";
import { isRole } from "@/lib/utils";
import { useStore } from "@/providers/datastore";
import { bankQ } from "@/queries/bank";
import { useQuery } from "@tanstack/react-query";
import { PlusIcon, RotateCcwIcon, WalletIcon } from "lucide-react";
import Link from "next/link";
import BankAccounts from "./bank-accounts";

function Page() {
  const { user } = useStore();
  const auth =
    isRole({ roleList: user?.role ?? [], role: "trésorier" }) ||
    isRole({ roleList: user?.role ?? [], role: "comptable" });
  const canEdit = isRole({ roleList: user?.role ?? [], role: "trésorier" });

  const getBanks = useQuery({ queryKey: ["banks"], queryFn: bankQ.getAll });

  if (getBanks.isLoading) {
    return <LoadingPage />;
  }
  if (getBanks.isError) {
    return <ErrorPage error={getBanks.error} />;
  }
  if (getBanks.isSuccess) {
    return (
      <div className="content">
        <PageTitle
          title="Comptes & caisses"
          subtitle="Liste des comptes"
          actions={
            <>
              {auth && (
                <Button asChild variant="outline">
                  <Link href="/tableau-de-bord/banques/creer">
                    <PlusIcon />
                    {"Ajouter un compte"}
                  </Link>
                </Button>
              )}
              {canEdit && (
                <>
                  <Button asChild variant="outline">
                    <Link href="/tableau-de-bord/banques/transactions/creer">
                      <PlusIcon />
                      {"Transaction manuelle"}
                    </Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/tableau-de-bord/banques/transactions/transferts/creer">
                      <RotateCcwIcon />
                      {"Transfert entre comptes"}
                    </Link>
                  </Button>
                  <Button asChild variant="primary">
                    <Link href="/tableau-de-bord/banques/transactions/transferts/approvisionnement">
                      <WalletIcon />
                      {"Approvisionner une caisse"}
                    </Link>
                  </Button>
                </>
              )}
            </>
          }
        />
        <BankAccounts
          data={getBanks.data.data.filter((c) => !!c.type)}
          canEdit={canEdit}
        />
      </div>
    );
  }
}

export default Page;
