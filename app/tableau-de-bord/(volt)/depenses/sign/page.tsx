"use client";
import {
  StatisticCard,
  StatisticProps,
} from "@/components/base/TitleValueCard";
import ErrorPage from "@/components/error-page";
import LoadingPage from "@/components/loading-page";
import PageTitle from "@/components/pageTitle";
import { useFetchQuery } from "@/hooks/useData";
import { XAF } from "@/lib/utils";
import { bankQ } from "@/queries/bank";
import { paymentQ } from "@/queries/payment";
import { purchaseQ } from "@/queries/purchase-order";
import { requestTypeQ } from "@/queries/requestType";
import ExpensesTableSign from "./expenses-table-sign";
import { signatairQ } from "@/queries/signatair";
import { Signatair } from "@/types/types";
import { useStore } from "@/providers/datastore";
import { TabBar } from "@/components/base/TabBar";
import { useState, useMemo } from "react";

function Page() {
  const { data, isSuccess, isError, error, isLoading } = useFetchQuery(
    ["payments"],
    paymentQ.getAll,
    30000
  );

  const signatair = useFetchQuery(["signatair"], signatairQ.getAll);
  const getRequestType = useFetchQuery(["requestType"], requestTypeQ.getAll, 30000);
  const getPurchases = useFetchQuery(["purchaseOrders"], purchaseQ.getAll, 30000);
  const getBanks = useFetchQuery(["banks"], bankQ.getAll, 30000);

  const [selectedTab, setSelectedTab] = useState(0);
  const { user } = useStore();

  // Calculs mémoïsés pour éviter les recalculs inutiles
  const filteredData = useMemo(() => {
    if (!data?.data || !signatair.data?.data || !user) {
      return {
        unsignedPayments: [],
        signedPayments: [],
        pendingPayments: [],
        statistics: [],
      };
    }

    const allPayments = data.data;
    const allSignatair = signatair.data.data;
    const currentUserId = user.id;

    // Pré-calculer les signataires autorisés par banque et type de paiement
    const authorizedSigners = new Map<string, Set<number>>();

    allSignatair.forEach(signer => {
      const key = `${signer.bankId}_${signer.payTypeId}`;
      const userIds = new Set(signer.user?.map(u => u.id) || []);
      authorizedSigners.set(key, userIds);
    });

    // Fonction optimisée pour vérifier si l'utilisateur peut signer
    const userCanSign = (bankId: number | null, methodId: number | null) => {
      if (bankId == null || methodId == null) return false;
      const key = `${bankId}_${methodId}`;
      const userIds = authorizedSigners.get(key);
      return userIds ? userIds.has(currentUserId) : false;
    };

    // Filtrer les paiements selon les permissions - version optimisée
    const authorizedPayments = allPayments.filter(p =>
      userCanSign(p.bankId!, p.methodId!)
    );

    const unsignedPayments = authorizedPayments.filter(
      (p) => p.status === "unsigned" && p.type === "achat"
    );

    const signedPayments = authorizedPayments.filter(
      (p) => p.status === "signed" && p.type === "achat"
    );

    const pendingPayments = allPayments.filter(
      (p) => p.status === "pending_depense" || p.status === "pending"
    );

    // Calcul des statistiques
    const pendingTotal = unsignedPayments.reduce((total, el) => total + (el.price || 0), 0);
    const signedTotal = signedPayments.reduce((total, el) => total + (el.price || 0), 0);

    const statistics: Array<StatisticProps> = [
      {
        title: "Tickets en attente de signature",
        value: unsignedPayments.length,
        variant: "primary",
        more: {
          title: "Montant total",
          value: XAF.format(pendingTotal),
        },
      },
      {
        title: "Tickets signés",
        value: signedPayments.length,
        variant: "secondary",
        more: {
          title: "Montant total",
          value: XAF.format(signedTotal),
        },
      },
    ];

    return {
      unsignedPayments,
      signedPayments,
      pendingPayments,
      statistics,
      allPayments
    };
  }, [data?.data, signatair.data?.data, user]);

  const tabs = useMemo(() => [
    {
      id: 0,
      title: "Tickets en attente",
      badge: filteredData.pendingPayments.length // Utiliser pendingPayments comme dans l'autre page
    },
    {
      id: 1,
      title: "Tickets signés",
      badge: filteredData.signedPayments.length
    }
  ], [filteredData.pendingPayments.length, filteredData.signedPayments.length]);

  if (
    isLoading ||
    getPurchases.isLoading ||
    getBanks.isLoading ||
    getRequestType.isLoading ||
    signatair.isLoading
  ) {
    return <LoadingPage />;
  }

  if (
    isError ||
    getPurchases.isError ||
    getBanks.isError ||
    getRequestType.isError ||
    signatair.isError
  ) {
    return (
      <ErrorPage
        error={
          error ||
          getPurchases.error ||
          getBanks.error ||
          getRequestType.error ||
          signatair.error ||
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
    signatair.isSuccess
  ) {
    return (
      <div className="content">
        <PageTitle
          title="Signer les Documents"
          subtitle="Signer les documents des factures"
          color="blue"
        />

        <div className="grid grid-cols-1 @min-[640px]:grid-cols-2 @min-[1024px]:grid-cols-4 items-center gap-5 mb-6">
          {filteredData.statistics.map((data, id) => (
            <StatisticCard key={id} {...data} className="h-full" />
          ))}
        </div>

        <div className="mb-6">
          <TabBar
            tabs={tabs}
            setSelectedTab={setSelectedTab}
            selectedTab={selectedTab}
          />
        </div>

        {selectedTab === 0 ? (
          <ExpensesTableSign
            key="pending-table"
            payments={filteredData.unsignedPayments}
            banks={getBanks.data.data}
            type="pending"
            purchases={getPurchases.data.data}
            requestTypes={getRequestType.data.data}
            signatair={signatair.data.data}
          />
        ) : (
          <ExpensesTableSign
            key="signed-table"
            payments={filteredData.signedPayments}
            type="validated"
            banks={getBanks.data.data}
            purchases={getPurchases.data.data}
            requestTypes={getRequestType.data.data}
            signatair={signatair.data.data}
          />
        )}
      </div>
    );
  }

  return null;
}

export default Page;