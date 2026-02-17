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
import { useQuery } from "@tanstack/react-query";
import ExpensesTable from "../expenses-table";
import { providerQ } from "@/queries/providers";
import { payTypeQ } from "@/queries/payType";
import { requestQ } from "@/queries/requestModule";
import { userQ } from "@/queries/baseModule";
import { invoiceQ } from "@/queries/invoices";
;
function Page() {
  const { data, isSuccess, isError, error, isLoading } = useQuery({
    queryKey: ["payments"],
    queryFn: paymentQ.getAll,
  });
  const getInvoices = useQuery({
    queryKey: ["invoices"],
    queryFn: invoiceQ.getAll,
  });
  const getRequestType = useQuery({
    queryKey: ["requestType"],
    queryFn: requestTypeQ.getAll,
  });

  const getPaymentType = useQuery({
    queryKey: ["paymentType"],
    queryFn: payTypeQ.getAll,
  });

  const getRequest = useQuery({
    queryKey: ["request"],
    queryFn: requestQ.getAll,
  });

  const getUsers = useQuery({
    queryKey: ["users"],
    queryFn: userQ.getAll,
  });

  const getBanks = useQuery({ queryKey: ["banks"], queryFn: bankQ.getAll });
  const getProviders = useQuery({ queryKey: ["providers"], queryFn: providerQ.getAll });
  if (
    isLoading ||
    getInvoices.isLoading ||
    getRequestType.isLoading ||
    getBanks.isLoading ||
    getProviders.isLoading ||
    getRequest.isLoading ||
    getUsers.isLoading ||
    getPaymentType.isLoading
  ) {
    return <LoadingPage />;
  }
  if (
    isError ||
    getInvoices.isError ||
    getRequestType.isError ||
    getBanks.isError ||
    getProviders.isError ||
    getRequest.isError ||
    getUsers.isError ||
    getPaymentType.isError
  ) {
    return (
      <ErrorPage
        error={
          error ||
          getInvoices.error ||
          getRequestType.error ||
          getBanks.error ||
          getProviders.error ||
          getPaymentType.error ||
          getRequest.error ||
          getUsers.error ||
          undefined
        }
      />
    );
  }
  if (
    isSuccess &&
    getInvoices.isSuccess &&
    getRequestType.isSuccess &&
    getBanks.isSuccess &&
    getProviders.isSuccess &&
    getRequest.isSuccess &&
    getUsers.isSuccess &&
    getPaymentType.isSuccess
  ) {
    const Statistics: Array<StatisticProps> = [
      {
        title: "Tickets en attente",
        value: data.data.filter(
          (p) => p.status === "validated" && p.type !== "CURRENT"
        ).length,
        variant: "primary",
        more: {
          title: "Montant total",
          value: XAF.format(
            data.data
              .filter((p) => p.status === "validated" && p.type !== "CURRENT")
              .reduce((total, el) => total + el.price, 0)
          ),
        },
      },
      {
        title: "Tickets payés",
        value: data.data.filter(
          (p) => p.status === "paid" && p.type !== "CURRENT"
        ).length,
        variant: "secondary",
        more: {
          title: "Montant total",
          value: XAF.format(
            data.data
              .filter((p) => p.status === "paid" && p.type !== "CURRENT")
              .reduce((total, el) => total + el.price, 0)
          ),
        },
      },
    ];

    return (
      <div className="content">
        <PageTitle
          title="Dépenses Tickets"
          subtitle="Consulter et traiter les dépenses"
          color="red"
        />

        <div className="grid grid-cols-1 @min-[640px]:grid-cols-2 @min-[1024px]:grid-cols-4 items-center gap-5">
          {Statistics.map((data, id) => (
            <StatisticCard key={id} {...data} className="h-full" />
          ))}
        </div>
        <ExpensesTable
          payments={data.data.filter(
            (p) => p.status === "validated" && p.type !== "CURRENT"
          )}
          invoices={getInvoices.data.data}
          banks={getBanks.data.data}
          requestTypes={getRequestType.data.data}
          providers={getProviders.data.data}
          getPaymentType={getPaymentType}
          request={getRequest.data.data}
          users={getUsers.data.data}
        />
        <ExpensesTable
          payments={data.data.filter(
            (p) => p.status === "paid" && p.type !== "CURRENT"
          )}
          invoices={getInvoices.data.data}
          banks={getBanks.data.data}
          requestTypes={getRequestType.data.data}
          providers={getProviders.data.data}
          getPaymentType={getPaymentType}
          request={getRequest.data.data}
          users={getUsers.data.data}
        />
      </div>
    );
  }
}

export default Page;
