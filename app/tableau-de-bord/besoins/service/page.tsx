"use client";

import {
  StatisticCard,
  StatisticProps,
} from "@/components/base/TitleValueCard";
import ErrorPage from "@/components/error-page";
import LoadingPage from "@/components/loading-page";
import PageTitle from "@/components/pageTitle";
import { approbatorRequests } from "@/lib/requests-helpers";
import { useStore } from "@/providers/datastore";
import { userQ } from "@/queries/baseModule";
import { categoryQ } from "@/queries/categoryModule";
import { paymentQ } from "@/queries/payment";
import { projectQ } from "@/queries/projectModule";
import { purchaseQ } from "@/queries/purchase-order";
import { receptionQ } from "@/queries/reception";
import { requestQ } from "@/queries/requestModule";
import { requestTypeQ } from "@/queries/requestType";
import { RequestModelT } from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import ServiceRequestsTable from "./service-req-table";

const Page = () => {
  const { user } = useStore();
  const categoriesData = useQuery({
    queryKey: ["categories"],
    queryFn: categoryQ.getCategories,
  });
  const projectsData = useQuery({
    queryKey: ["projects"],
    queryFn: projectQ.getAll,
  });

  const usersData = useQuery({
    queryKey: ["users"],
    queryFn: userQ.getAll,
  });

  const paymentsData = useQuery({
    queryKey: ["payments"],
    queryFn: paymentQ.getAll,
  });

  const getServiceRequests = useQuery({
    queryKey: ["serviceRequests"],
    queryFn: requestQ.getServiceRequests,
  });

  const getRequestType = useQuery({
    queryKey: ["requestType"],
    queryFn: requestTypeQ.getAll,
  });

  const getReceptions = useQuery({
    queryKey: ["receptions"],
    queryFn: receptionQ.getAll,
  });

  const getPurchases = useQuery({
    queryKey: ["purchaseOrders"],
    queryFn: purchaseQ.getAll,
  });

  const data: Array<RequestModelT> = useMemo(() => {
    if (!getServiceRequests.data) return [];
    console.log(getServiceRequests.data);
    return getServiceRequests.data.data.filter(
      (b) => b.serviceChiefId === user?.id,
    );
  }, [getServiceRequests.data, user?.id]);

  // Calcul des statistiques à partir des données filtrées
  const pending = useMemo(() => {
    return data.filter((b) => b.decision === "PENDING").length;
  }, [data]);

  const approved = useMemo(() => {
    return data.filter((b) => b.decision === "APPROVED").length;
  }, [data]);

  const rejected = useMemo(() => {
    return data.filter((b) => b.decision === "REJECTED").length;
  }, [data]);

  const Statistics: Array<StatisticProps> = [
    {
      title: "En attente de validation",
      value: pending,
      variant: "secondary",
      more: {
        title: "Total recus",
        value: data.length,
      },
    },
    {
      title: "Besoins approuvés",
      value: approved,
      variant: "default",
      more: {
        title: "Besoins rejetés",
        value: rejected,
      },
    },
  ];

  if (
    projectsData.isPending ||
    usersData.isPending ||
    paymentsData.isPending ||
    categoriesData.isPending ||
    getServiceRequests.isPending ||
    getRequestType.isPending ||
    getReceptions.isPending ||
    getPurchases.isPending
  ) {
    return <LoadingPage />;
  }

  if (
    projectsData.isError ||
    usersData.isError ||
    paymentsData.isError ||
    categoriesData.isError ||
    getServiceRequests.isError ||
    getRequestType.isError ||
    getPurchases.isError ||
    getReceptions.isError
  ) {
    return (
      <ErrorPage
        error={
          projectsData.error ||
          usersData.error ||
          paymentsData.error ||
          categoriesData.error ||
          getServiceRequests.error ||
          getRequestType.error ||
          getReceptions.error ||
          getPurchases.error ||
          undefined
        }
      />
    );
  }

  if (
    projectsData.data &&
    usersData.data &&
    paymentsData.data &&
    categoriesData.data &&
    getServiceRequests.data &&
    getRequestType.data &&
    getPurchases.isSuccess &&
    getReceptions.isSuccess
  ) {
    //console.log(data);
    return (
      <div className="content">
        {/* page title */}
        <PageTitle
          title="Validation des besoins"
          subtitle="Approuvez ou rejetez les besoins."
          color="green"
        />
        <div className="grid-stats-4">
          {Statistics.map((statistic, id) => (
            <StatisticCard key={id} {...statistic} />
          ))}
        </div>
        <ServiceRequestsTable
          requests={data}
          categories={categoriesData.data.data}
          projects={projectsData.data.data}
          users={usersData.data.data}
          payments={paymentsData.data.data}
          requestTypes={getRequestType.data.data}
          purchaseOrders={getPurchases.data.data}
          receptions={getReceptions.data.data}
        />
      </div>
    );
  }
};

export default Page;
