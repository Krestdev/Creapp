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
import ExpensesTableSign from "./expenses-table-sign";
import { signatairQ } from "@/queries/signatair";
import { Signatair } from "@/types/types";
import { useStore } from "@/providers/datastore";
import { TabBar } from "@/components/base/TabBar";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

function Page() {

  const { data, isSuccess, isError, error, isLoading } = useQuery({
    queryKey: ["payments"],
    queryFn: paymentQ.getAll,
  });

  const signatair = useQuery({ queryKey: ["signatairs"], queryFn: signatairQ.getAll });
  const getRequestType = useQuery({
    queryKey: ["requestType"],
    queryFn: requestTypeQ.getAll
  });
  const getPurchases = useQuery({
    queryKey: ["purchaseOrders"],
    queryFn: purchaseQ.getAll
  });
  const getBanks = useQuery({
    queryKey: ["banks"],
    queryFn: bankQ.getAll
  });

  const [selectedTab, setSelectedTab] = useState(0);
  const { user } = useStore();

  // Calculs mémoïsés pour éviter les recalculs inutiles
  const filteredData = useMemo(() => {
    if (!data?.data || !signatair.data?.data || !user) {
      return {
        unsignedPayments: [], // unsigned seulement
        signedPayments: [], // pending_depense + unsigned (pour l'onglet)
        statistics: [],
      };
    }

    const allPayments = data.data;
    const allSignatair = signatair.data.data;
    const currentUserId = user.id;

    // Pré-calculer les signataires autorisés par banque et type de paiement
    const authorizedSigners = new Map<string, Set<number>>();

    allSignatair.forEach((signer) => {
      const key = `${signer.bankId}_${signer.payTypeId}`;
      const userIds = new Set(signer.user?.map((u) => u.id) || []);
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
    const authorizedPayments = allPayments.filter((p) =>
      userCanSign(p.bankId!, p.methodId!)
    );

    // Séparation des paiements par statut
    const pendingDepensePayments = authorizedPayments.filter(
      (p) => p.status === "pending_depense"
    );

    const unsignedPayments = authorizedPayments.filter(
      (p) => p.status === "unsigned"
    );

    const signedPayments = authorizedPayments.filter(
      (p) => p.status === "signed"
    );

    // Tous les paiements en attente (pour l'onglet)
    const allPendingPayments = [...pendingDepensePayments, ...unsignedPayments];

    // Calcul des statistiques détaillées
    const pendingDepenseTotal = pendingDepensePayments.reduce(
      (total, el) => total + (el.price || 0),
      0
    );

    const unsignedTotal = unsignedPayments.reduce(
      (total, el) => total + (el.price || 0),
      0
    );

    const signedTotal = signedPayments.reduce(
      (total, el) => total + (el.price || 0),
      0
    );

    const allPendingTotal = pendingDepenseTotal + unsignedTotal;

    const statistics: Array<StatisticProps> = [
      {
        title: "En attente signature",
        value: unsignedPayments.length,
        variant: "secondary",
        more: {
          title: "Montant total",
          value: XAF.format(unsignedTotal),
        },
      },
      {
        title: "Signés",
        value: signedPayments.length,
        variant: "success",
        more: {
          title: "Montant total",
          value: XAF.format(signedTotal),
        },
      },
    ];

    return {
      pendingDepensePayments,
      unsignedPayments,
      signedPayments,
      allPendingPayments,
      statistics,
      allPayments,
    };
  }, [data?.data, signatair.data?.data, user]);

  const tabs = useMemo(
    () => [
      {
        id: 0,
        title: "Tickets en attente",
        badge: filteredData.unsignedPayments.length,
      },
      {
        id: 1,
        title: "Tickets signés",
        badge: filteredData.signedPayments.length,
      },
    ],
    [filteredData.unsignedPayments.length, filteredData.signedPayments.length]
  );

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
