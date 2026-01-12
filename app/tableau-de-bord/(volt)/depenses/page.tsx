"use client";
import {
    StatisticCard,
    StatisticProps,
} from "@/components/base/TitleValueCard";
import ErrorPage from "@/components/error-page";
import LoadingPage from "@/components/loading-page";
import PageTitle from "@/components/pageTitle";
import { Button } from "@/components/ui/button";
import { useFetchQuery } from "@/hooks/useData";
import { cn, XAF } from "@/lib/utils";
import { bankQ } from "@/queries/bank";
import { paymentQ } from "@/queries/payment";
import { purchaseQ } from "@/queries/purchase-order";
import { NavLink } from "@/types/types";
import Link from "next/link";
import { requestTypeQ } from "@/queries/requestType";
import ExpensesTable from "./expenses-table";

function Page() {
    const links: Array<NavLink> = [
        {
            title: "Créer une dépense",
            href: "/tableau-de-bord/depenses/creer",
            hide: false,
            disabled: false,
        },
    ];

    const { data, isSuccess, isError, error, isLoading } = useFetchQuery(
        ["payments"],
        paymentQ.getAll,
        30000
    );

    const getRequestType = useFetchQuery(
        ["requestType"],
        requestTypeQ.getAll,
        30000
    );

    const getPurchases = useFetchQuery(
        ["purchaseOrders"],
        purchaseQ.getAll,
        30000
    );
    const getBanks = useFetchQuery(["banks"], bankQ.getAll, 30000);
    if (
        isLoading ||
        getPurchases.isLoading ||
        getBanks.isLoading ||
        getRequestType.isLoading
    ) {
        return <LoadingPage />;
    }
    if (
        isError ||
        getPurchases.isError ||
        getBanks.isError ||
        getRequestType.isError
    ) {
        return (
            <ErrorPage
                error={
                    error ||
                    getPurchases.error ||
                    getBanks.error ||
                    getRequestType.error ||
                    undefined
                }
            />
        );
    }
    if (
        isSuccess &&
        getPurchases.isSuccess &&
        getBanks.isSuccess &&
        getRequestType.isSuccess
    ) {
        const Statistics: Array<StatisticProps> = [
            {
                title: "Tickets en attente",
                value: data.data.filter(
                    (p) => p.status === "pending_depense" && p.type === "CURRENT"
                ).length,
                variant: "primary",
                more: {
                    title: "Montant total",
                    value: XAF.format(
                        data.data
                            .filter(
                                (p) => p.status === "pending_depense" && p.type === "CURRENT"
                            )
                            .reduce((total, el) => total + el.price, 0)
                    ),
                },
            },
            {
                title: "Tickets payés",
                value: data.data.filter(
                    (p) => p.status === "paid" && p.type === "CURRENT"
                ).length,
                variant: "secondary",
                more: {
                    title: "Montant total",
                    value: XAF.format(
                        data.data
                            .filter((p) => p.status === "paid" && p.type === "CURRENT")
                            .reduce((total, el) => total + el.price, 0)
                    ),
                },
            },
        ];

        return (
            <div className="content">
                <PageTitle
                    title="Dépenses"
                    subtitle="Consulter et traiter les dépenses"
                    color="red"
                >
                    {links
                        .filter((x) => (!x.hide ? true : x.hide === true && false))
                        .map((link, id) => {
                            const isLast = links.length > 1 ? id === links.length - 1 : false;
                            return (
                                <Link
                                    key={id}
                                    href={link.href}
                                    onClick={(e) => {
                                        link.disabled && e.preventDefault();
                                    }}
                                    className={cn(link.disabled && "cursor-not-allowed")}
                                >
                                    <Button
                                        size={"lg"}
                                        variant={isLast ? "accent" : "ghost"}
                                        disabled={link.disabled}
                                    >
                                        {link.title}
                                    </Button>
                                </Link>
                            );
                        })}
                </PageTitle>
                <div className="grid grid-cols-1 @min-[640px]:grid-cols-2 @min-[1024px]:grid-cols-4 items-center gap-5">
                    {Statistics.map((data, id) => (
                        <StatisticCard key={id} {...data} className="h-full" />
                    ))}
                </div>
                <ExpensesTable
                    payments={data.data.filter(
                        (p) => p.status === "pending_depense" || p.status === "validated"
                    )}
                    banks={getBanks.data.data}
                    type="pending"
                    purchases={getPurchases.data.data}
                    requestTypes={getRequestType.data.data}
                />
                <ExpensesTable
                    payments={data.data.filter(
                        (p) => p.status === "paid" || p.status === "validated"
                    )}
                    type="validated"
                    banks={getBanks.data.data}
                    purchases={getPurchases.data.data}
                    requestTypes={getRequestType.data.data}
                />
            </div>
        );
    }
}

export default Page;
