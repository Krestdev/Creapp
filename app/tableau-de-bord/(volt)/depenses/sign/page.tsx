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
import { requestTypeQ } from "@/queries/requestType";
import ExpensesTableSign from "../expenses-table-sign";

function Page() {
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
        title: "Tickets en attente de signature",
        value: data.data.filter(
          (p) => p.status === "unsigned" && p.type === "achat"
        ).length,
        variant: "primary",
        more: {
          title: "Montant total",
          value: XAF.format(
            data.data
              .filter((p) => p.status === "validated" && p.type === "achat")
              .reduce((total, el) => total + el.price, 0)
          ),
        },
      },
      {
        title: "Tickets signer",
        value: data.data.filter(
          (p) => p.status === "signed" && p.type === "achat"
        ).length,
        variant: "secondary",
        more: {
          title: "Montant total",
          value: XAF.format(
            data.data
              .filter(
                (p) =>
                  (p.status === "paid" || p.status === "validated") &&
                  p.type === "achat"
              )
              .reduce((total, el) => total + el.price, 0)
          ),
        },
      },
    ];

    return (
      <div className="content">
        <PageTitle
          title="Signer les Documents"
          subtitle="Signer les document des factures"
          color="blue"
        />
        <div className="grid grid-cols-1 @min-[640px]:grid-cols-2 @min-[1024px]:grid-cols-4 items-center gap-5">
          {Statistics.map((data, id) => (
            <StatisticCard key={id} {...data} className="h-full" />
          ))}
        </div>
        <ExpensesTableSign
          payments={data.data.filter(
            (p) => p.status === "unsigned" && p.type === "achat"
          )}
          banks={getBanks.data.data}
          type="pending"
          purchases={getPurchases.data.data}
          requestTypes={getRequestType.data.data}
        />
        <ExpensesTableSign
          payments={data.data.filter(
            (p) => p.status === "signed" && p.type === "achat"
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
