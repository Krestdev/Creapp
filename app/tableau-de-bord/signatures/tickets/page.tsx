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
import { userQ } from "@/queries/baseModule";
import { invoiceQ } from "@/queries/invoices";
import { paymentQ } from "@/queries/payment";
import { payTypeQ } from "@/queries/payType";
import { projectQ } from "@/queries/projectModule";
import { requestTypeQ } from "@/queries/requestType";
import { signatairQ } from "@/queries/signatair";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import ExpensesTableSign from "./expenses-table-sign";
import { queryKeys } from "@/lib/query-keys";

function Page() {
  const { data, isSuccess, isError, error, isLoading } = useQuery({
    queryKey: queryKeys.payments,
    queryFn: paymentQ.getAll,
  });

  const signatair = useQuery({
    queryKey: queryKeys.signataires,
    queryFn: signatairQ.getAll,
  });
  const getRequestType = useQuery({
    queryKey: queryKeys.requestTypes,
    queryFn: requestTypeQ.getAll,
  });
  const getInvoices = useQuery({
    queryKey: queryKeys.invoices,
    queryFn: invoiceQ.getAll,
  });
  const getBanks = useQuery({
    queryKey: queryKeys.banks,
    queryFn: bankQ.getAll,
  });
  const getPayType = useQuery({
    queryKey: queryKeys.paymentTypes,
    queryFn: payTypeQ.getAll,
  });

  const getUsers = useQuery({
    queryKey: queryKeys.users,
    queryFn: userQ.getAll,
  });
  const getProjects = useQuery({
    queryKey: queryKeys.projects,
    queryFn: projectQ.getAll,
  });

  const [selectedTab, setSelectedTab] = useState(0);
  const { user } = useStore();

  // Calculs mémoïsés pour éviter les recalculs inutiles
  const filteredData = useMemo(() => {
    if (!data?.data || !signatair.data?.data || !user) {
      return {
        unsignedPayments: [],
        signedPayments: [],
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
      userCanSign(p.bankId!, p.methodId!),
    );

    // Séparation des paiements par statut
    const pendingDepensePayments = authorizedPayments.filter(
      (p) =>
        p.signer?.flatMap((u) => u.id)?.includes(currentUserId) &&
        p.status === "pending_depense",
    );

    const unsignedPayments = authorizedPayments.filter(
      (p) =>
        !p.signer?.flatMap((u) => u.id)?.includes(currentUserId) &&
        p.status === "unsigned",
    );

    const signedPayments = authorizedPayments.filter(
      (p) => p.status === "signed" || p.status === "paid",
    );

    // Tous les paiements en attente (pour l'onglet)
    const allPendingPayments = [...pendingDepensePayments, ...unsignedPayments];

    // Calcul des statistiques détaillées
    const pendingDepenseTotal = pendingDepensePayments.reduce(
      (total, el) => total + (el.price || 0),
      0,
    );

    const unsignedTotal = unsignedPayments.reduce(
      (total, el) => total + (el.price || 0),
      0,
    );

    const signedTotal = signedPayments.reduce(
      (total, el) => total + (el.price || 0),
      0,
    );

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
      },
    ],
    [filteredData.unsignedPayments.length, filteredData.signedPayments.length],
  );

  if (
    isLoading ||
    getInvoices.isLoading ||
    getBanks.isLoading ||
    getRequestType.isLoading ||
    getPayType.isLoading ||
    signatair.isLoading ||
    getProjects.isLoading ||
    getUsers.isLoading
  ) {
    return <LoadingPage />;
  }

  if (
    isError ||
    getInvoices.isError ||
    getBanks.isError ||
    getRequestType.isError ||
    getPayType.isError ||
    signatair.isError ||
    getProjects.isError ||
    getUsers.isError
  ) {
    return (
      <ErrorPage
        error={
          error ||
          getInvoices.error ||
          getBanks.error ||
          getRequestType.error ||
          getPayType.error ||
          getTransaction.error ||
          signatair.error ||
          getProjects.error ||
          getUsers.error ||
          getRequests.error ||
          getPurchases.error ||
          undefined
        }
      />
    );
  }

  console.log(filteredData);

  if (
    isSuccess &&
    getInvoices.isSuccess &&
    getBanks.isSuccess &&
    getRequestType.isSuccess &&
    getPayType.isSuccess &&
    getTransaction.isSuccess &&
    signatair.isSuccess &&
    getProjects.isSuccess &&
    getUsers.isSuccess &&
    getRequests.isSuccess &&
    getPurchases.isSuccess
  ) {
    return (
      <div className="content">
        <PageTitle
          title="Signatures"
          subtitle="Consultez les demandes de signature liées aux retraits bancaires"
          color="blue"
        />

        <div className="grid grid-cols-1 @min-[640px]:grid-cols-2 @min-[1024px]:grid-cols-4 items-center gap-5">
          {filteredData.statistics.map((data, id) => (
            <StatisticCard key={id} {...data} className="h-full" />
          ))}
        </div>
        <TabBar
          tabs={tabs}
          setSelectedTab={setSelectedTab}
          selectedTab={selectedTab}
        />
        {selectedTab === 0 ? (
          <ExpensesTableSign
            key="pending-table"
            payments={filteredData.unsignedPayments}
            banks={getBanks.data.data}
            type="pending"
            invoices={getInvoices.data.data}
            requestTypes={getRequestType.data.data}
            signatair={signatair.data.data}
            payType={getPayType.data.data}
            projects={getProjects.data.data}
            users={getUsers.data.data}
          />
        ) : (
          <ExpensesTableSign
            key="signed-table"
            payments={filteredData.signedPayments}
            type="validated"
            banks={getBanks.data.data}
            invoices={getInvoices.data.data}
            requestTypes={getRequestType.data.data}
            signatair={signatair.data.data}
            payType={getPayType.data.data}
            projects={getProjects.data.data}
            users={getUsers.data.data}
          />
        )}
      </div>
    );
  }

  return null;
}

export default Page;
