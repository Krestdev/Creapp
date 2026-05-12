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
import { DateFilter, NavLink } from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import { payTypeQ } from "@/queries/payType";
import ExpensesTable from "./expenses-table";
import { providerQ } from "@/queries/providers";
import { requestQ } from "@/queries/requestModule";
import { userQ } from "@/queries/baseModule";
import { invoiceQ } from "@/queries/invoices";
import { projectQ } from "@/queries/projectModule";
import { transactionQ } from "@/queries/transaction";
import { signatairQ } from "@/queries/signatair";
import { useMemo } from "react";
import { vehicleQ } from "@/queries/vehicule";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Settings2 } from "lucide-react";
import DepenseFilters, { DepenseFiltersProps } from "./depenseFilters";
import React from "react";
import { TabBar } from "@/components/base/TabBar";

function Page() {
  const links: Array<NavLink> = [
    {
      title: "Créer une dépense",
      href: "/tableau-de-bord/depenses/creer",
      hide: true,
      disabled: false,
    },
  ];

  const [isCustomDateModalOpen, setIsCustomDateModalOpen] =
    React.useState(false);
  const [dateFilter, setDateFilter] = React.useState<DateFilter>();
  const [customFilters, setCustomFilters] = React.useState<
    DepenseFiltersProps["customFilters"]
  >({
    search: "",
    tab: "pending",
    beneficiary: "all",
    amount: 0,
    amountType: "greater",
    provider: "all",
    priority: "all",
    paymentMethod: "all",
    isSelected: "all",
    type: "all",
    date: undefined,
    from: "",
    to: "",
  });

  const resetAllFilters = () => {
    setCustomFilters({
      search: "",
      tab: "pending",
      beneficiary: "all",
      amount: 0,
      amountType: "greater",
      provider: "all",
      priority: "all",
      paymentMethod: "all",
      isSelected: "all",
      type: "all",
      date: undefined,
      from: "",
      to: "",
    });
    setDateFilter(undefined);
  };

  const tabs = [
    {
      id: 0,
      title: "Tickets en attente",
      //badge: payments.filter((p) => p.status === "validated").length,
    },
    {
      id: 1,
      title: "Tickets traités",
      //badge: payments.filter((p) => p.status === "pending_depense" || p.status === "signed" || p.status === "simple_signed").length,
    },
    {
      id: 2,
      title: "Tickets payés",
    },
    {
      id: 3,
      title: "Tickets annulés",
    },
  ];

  const { data, isSuccess, isError, error, isLoading } = useQuery({
    queryKey: ["payments"],
    queryFn: () => paymentQ.getAll({}),
  });

  const getRequestType = useQuery({
    queryKey: ["requestType"],
    queryFn: requestTypeQ.getAll,
  });

  const getInvoices = useQuery({
    queryKey: ["invoices"],
    queryFn: invoiceQ.getAll,
  });

  const getPaymentType = useQuery({
    queryKey: ["paymentTypes"],
    queryFn: payTypeQ.getAll,
  });

  const request = useQuery({
    queryKey: ["requests"],
    queryFn: () => {
      return requestQ.getAll();
    },
  });

  const getProjects = useQuery({
    queryKey: ["projects"],
    queryFn: () => {
      return projectQ.getAll();
    },
  });

  const getUsers = useQuery({
    queryKey: ["users"],
    queryFn: () => userQ.getAll(),
  });

  const getBanks = useQuery({ queryKey: ["banks"], queryFn: bankQ.getAll });

  const getTransactions = useQuery({
    queryKey: ["transactions"],
    queryFn: transactionQ.getAll,
  });

  const getProviders = useQuery({
    queryKey: ["providers"],
    queryFn: providerQ.getAll,
  });

  const getSignataires = useQuery({
    queryKey: ["signataires"],
    queryFn: signatairQ.getAll,
  });

  const getVehicles = useQuery({
    queryKey: ["vehicles"],
    queryFn: vehicleQ.getAll,
  });

  const getPurchases = useQuery({
    queryKey: ["purchaseOrders"],
    queryFn: purchaseQ.getAll,
  });

  const filteredData = useMemo(() => {
    if (!data) return [];
    return data.data.filter((x) => x.type !== "appro");
  }, [data]);

  if (
    isLoading ||
    getInvoices.isLoading ||
    getBanks.isLoading ||
    getRequestType.isLoading ||
    getPaymentType.isLoading ||
    request.isLoading ||
    getProviders.isLoading ||
    getProjects.isLoading ||
    getUsers.isLoading ||
    getTransactions.isLoading ||
    getSignataires.isLoading ||
    getVehicles.isLoading ||
    getPurchases.isLoading
  ) {
    return <LoadingPage />;
  }
  if (
    isError ||
    getInvoices.isError ||
    getBanks.isError ||
    getRequestType.isError ||
    getPaymentType.isError ||
    request.isError ||
    getProviders.isError ||
    getProjects.isError ||
    getUsers.isError ||
    getTransactions.isError ||
    getSignataires.isError ||
    getVehicles.isError ||
    getPurchases.isError
  ) {
    return (
      <ErrorPage
        error={
          error ||
          getInvoices.error ||
          getBanks.error ||
          getRequestType.error ||
          getPaymentType.error ||
          getProviders.error ||
          request.error ||
          getProjects.error ||
          getUsers.error ||
          getTransactions.error ||
          getSignataires.error ||
          getVehicles.error ||
          getPurchases.error ||
          undefined
        }
      />
    );
  }
  if (
    isSuccess &&
    getInvoices.isSuccess &&
    getBanks.isSuccess &&
    getRequestType.isSuccess &&
    getPaymentType.isSuccess &&
    request.isSuccess &&
    getProviders.isSuccess &&
    getProjects.isSuccess &&
    getUsers.isSuccess &&
    getTransactions.isSuccess &&
    getSignataires.isSuccess &&
    getVehicles.isSuccess &&
    getPurchases.isSuccess
  ) {
    const Statistics: Array<StatisticProps> = [
      {
        title: "Tickets en attente de traitement",
        value: filteredData.filter((p) => p.status === "validated").length,
        variant: "primary",
        more: {
          title: "Montant total",
          value: XAF.format(
            filteredData
              .filter((p) => p.status === "validated")
              .reduce((total, el) => total + el.price, 0),
          ),
        },
      },
      {
        title: "Tickets payés",
        value: filteredData.filter((p) => p.status === "paid").length,
        variant: "secondary",
        more: {
          title: "Montant total",
          value: XAF.format(
            filteredData
              .filter((p) => p.status === "paid")
              .reduce((total, el) => total + el.price, 0),
          ),
        },
      },
      {
        title: "Tickets traités",
        value: filteredData.filter(
          (p) => p.status === "signed" || p.status === "simple_signed",
        ).length,
        variant: "default",
        more: {
          title: "Montant total",
          value: XAF.format(
            filteredData
              .filter(
                (p) => p.status === "signed" || p.status === "simple_signed",
              )
              .reduce((total, el) => total + el.price, 0),
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
          links={links}
        />
        <Sheet>
          <SheetTrigger asChild>
            <Button variant={"outline"}>
              <Settings2 />
              {"Filtres"}
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>{"Filtres"}</SheetTitle>
              <SheetDescription>
                {"Configurer les filtres pour affiner les données"}
              </SheetDescription>
            </SheetHeader>
            <DepenseFilters
              customFilters={customFilters}
              setCustomFilters={setCustomFilters}
              isCustomDateModalOpen={isCustomDateModalOpen}
              setIsCustomDateModalOpen={setIsCustomDateModalOpen}
              users={getUsers.data.data}
              providers={getProviders.data.data}
              setDateFilter={setDateFilter}
              resetAllFilters={resetAllFilters}
            />
          </SheetContent>
        </Sheet>
        <div className="grid grid-cols-1 @min-[640px]:grid-cols-2 @min-[1024px]:grid-cols-4 items-center gap-5">
          {Statistics.map((data, id) => (
            <StatisticCard key={id} {...data} className="h-full" />
          ))}
        </div>
        <TabBar
          tabs={tabs}
          setSelectedTab={setSelectedTab}
          selectedTab={selectedTab}
          className="w-fit"
        />
        <ExpensesTable
          payments={filteredData}
          banks={getBanks.data.data}
          invoices={getInvoices.data.data}
          requestTypes={getRequestType.data.data}
          paymentTypes={getPaymentType.data.data}
          providers={getProviders.data.data}
          request={request.data.data}
          users={getUsers.data.data}
          projects={getProjects.data.data}
          transactions={getTransactions.data.data}
          signataires={getSignataires.data.data}
          vehicles={getVehicles.data.data}
          purchases={getPurchases.data.data}
        />
      </div>
    );
  }
}

export default Page;
