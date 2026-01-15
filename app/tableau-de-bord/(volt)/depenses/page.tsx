"use client";

import { useState, useMemo } from "react";
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
import { signatairQ } from "@/queries/signatair";
import { TabBar } from "@/components/base/TabBar";
import { useStore } from "@/providers/datastore";
import ExpensesTableSign from "./sign/expenses-table-sign";
import ExpensesTable from "./expenses-table";

function Page() {
    /* ---------------- STORE (SÉLECTEURS PROPRES) ---------------- */
    const userId = useStore((s) => s.user?.id);
    const isHydrated = useStore((s) => s.isHydrated);

    /* ---------------- STATE UI ---------------- */
    const [selectedTab, setSelectedTab] = useState(0);

    /* ---------------- QUERIES ---------------- */
    const paymentsQuery = useFetchQuery(["payments"], paymentQ.getAll, 30000);
    const signatairQuery = useFetchQuery(["signatair"], signatairQ.getAll);
    const requestTypeQuery = useFetchQuery(["requestType"], requestTypeQ.getAll, 30000);
    const purchasesQuery = useFetchQuery(["purchaseOrders"], purchaseQ.getAll, 30000);
    const banksQuery = useFetchQuery(["banks"], bankQ.getAll, 30000);

    /* ---------------- HYDRATION GUARD ---------------- */
    if (!isHydrated) {
        return <LoadingPage />;
    }

    /* ---------------- LOADING ---------------- */
    if (
        paymentsQuery.isLoading ||
        signatairQuery.isLoading ||
        requestTypeQuery.isLoading ||
        purchasesQuery.isLoading ||
        banksQuery.isLoading
    ) {
        return <LoadingPage />;
    }

    /* ---------------- ERROR ---------------- */
    if (
        paymentsQuery.isError ||
        signatairQuery.isError ||
        requestTypeQuery.isError ||
        purchasesQuery.isError ||
        banksQuery.isError
    ) {
        return (
            <ErrorPage
                error={
                    paymentsQuery.error ||
                    signatairQuery.error ||
                    requestTypeQuery.error ||
                    purchasesQuery.error ||
                    banksQuery.error ||
                    undefined
                }
            />
        );
    }

    /* ---------------- DATA NORMALISÉE ---------------- */
    const payments = paymentsQuery.data?.data ?? [];
    const signataires = signatairQuery.data?.data ?? [];

    /* ---------------- SIGNATAIRES AUTORISÉS ---------------- */
    const authorizedSigners = useMemo(() => {
        const map = new Map<string, Set<number>>();

        signataires.forEach((s) => {
            const key = `${s.bankId}_${s.payTypeId}`;
            map.set(key, new Set(s.user?.map((u) => u.id)));
        });

        return map;
    }, [signataires]);

    /* ---------------- FILTRAGE PRINCIPAL ---------------- */
    const filteredData = useMemo(() => {
        if (!userId) {
            return {
                unsignedPayments: [],
                signedPayments: [],
                pendingPayments: [],
                statistics: [],
            };
        }

        const canUserSign = (bankId?: number | null, methodId?: number | null) => {
            if (!bankId || !methodId) return false;
            return authorizedSigners
                .get(`${bankId}_${methodId}`)
                ?.has(userId) ?? false;
        };

        const authorizedPayments = payments.filter((p) =>
            canUserSign(p.bankId, p.methodId)
        );

        const unsignedPayments = authorizedPayments.filter(
            (p) => p.status === "unsigned" && p.type === "achat"
        );

        const signedPayments = authorizedPayments.filter(
            (p) => p.status === "signed" && p.type === "achat"
        );

        const pendingPayments = payments.filter(
            (p) => p.status === "pending" || p.status === "pending_depense"
        );

        const pendingTotal = unsignedPayments.reduce(
            (t, p) => t + (p.price || 0),
            0
        );
        const signedTotal = signedPayments.reduce(
            (t, p) => t + (p.price || 0),
            0
        );

        const statistics: StatisticProps[] = [
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
        };
    }, [payments, authorizedSigners, userId]);

    /* ---------------- TABS ---------------- */
    const tabs = useMemo(
        () => [
            {
                id: 0,
                title: "Tickets en attente",
                badge: filteredData.pendingPayments.length,
            },
            {
                id: 1,
                title: "Tickets signés",
                badge: filteredData.signedPayments.length,
            },
        ],
        [
            filteredData.pendingPayments.length,
            filteredData.signedPayments.length,
        ]
    );

    /* ---------------- RENDER ---------------- */

    if (paymentsQuery.isSuccess && signatairQuery.isSuccess && requestTypeQuery.isSuccess && purchasesQuery.isSuccess && banksQuery.isSuccess) {
        return (
            <div className="content">
                <PageTitle
                    title="Signer les Documents"
                    subtitle="Signer les documents des factures"
                    color="blue"
                />

                <div className="grid grid-cols-1 @min-[640px]:grid-cols-2 @min-[1024px]:grid-cols-4 gap-5 mb-6">
                    {filteredData.statistics.map((s, i) => (
                        <StatisticCard key={i} {...s} />
                    ))}
                </div>

                <div className="mb-6">
                    <TabBar
                        tabs={tabs}
                        selectedTab={selectedTab}
                        setSelectedTab={setSelectedTab}
                    />
                </div>

                {selectedTab === 0 ? (
                    <ExpensesTable
                        payments={filteredData.unsignedPayments}
                        type="pending"
                        banks={banksQuery.data.data}
                        purchases={purchasesQuery.data.data}
                        requestTypes={requestTypeQuery.data.data}
                    />
                ) : (
                    <ExpensesTable
                        payments={filteredData.signedPayments}
                        type="signed"
                        banks={banksQuery.data.data}
                        purchases={purchasesQuery.data.data}
                        requestTypes={requestTypeQuery.data.data}
                    />
                )}
            </div>
        );
    }
}

export default Page;
