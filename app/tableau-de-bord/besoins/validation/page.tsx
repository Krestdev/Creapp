"use client";

import { DataVal } from "@/components/base/dataVal";
import {
  StatisticCard,
  StatisticProps,
} from "@/components/base/TitleValueCard";
import ErrorPage from "@/components/error-page";
import LoadingPage from "@/components/loading-page";
import PageTitle from "@/components/pageTitle";
import { approbatorRequests, decidedRequests, pendingApprobation } from "@/lib/requests-helpers";
import { useStore } from "@/providers/datastore";
import { userQ } from "@/queries/baseModule";
import { categoryQ } from "@/queries/categoryModule";
import { paymentQ } from "@/queries/payment";
import { projectQ } from "@/queries/projectModule";
import { requestQ } from "@/queries/requestModule";
import { requestTypeQ } from "@/queries/requestType";
import { RequestModelT } from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

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

  const requestData = useQuery({
    queryKey: ["requests", user?.id],
    queryFn: async () => requestQ.getValidatorRequests(user?.id ?? 0),
    enabled: !!user,
  });

  const getRequestType = useQuery({
    queryKey: ["requestType"],
    queryFn: requestTypeQ.getAll,
  });

  const data: Array<RequestModelT> = useMemo(() => {
    if (!requestData.data) return [];
    return approbatorRequests(requestData.data.data, user?.id)
  }, [requestData.data, user?.id]);

  // Calcul des statistiques à partir des données filtrées
  const pending = useMemo(() => {
    return pendingApprobation(data, user?.id).length;
  }, [data, user?.id]);

  const approved = useMemo(() => {
    return decidedRequests(data, user?.id).filter(r=> r.state !== "rejected").length;
  }, [data, user?.id]);

  const rejected = useMemo(() => {
    return decidedRequests(data, user?.id).filter(r=> r.state === "rejected").length;
  }, [data]);

  const Statistics: Array<StatisticProps> = [
    {
      title: "En attente de validation",
      value: pending,
      variant: "secondary",
      more: {
        title: "Total recus",
        value: pending,
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
    requestData.isPending ||
    getRequestType.isPending
  ) {
    return <LoadingPage />;
  }

  if (
    projectsData.isError ||
    usersData.isError ||
    paymentsData.isError ||
    categoriesData.isError ||
    requestData.isError ||
    getRequestType.isError
  ) {
    return (
      <ErrorPage
        error={
          projectsData.error ||
          usersData.error ||
          paymentsData.error ||
          categoriesData.error ||
          requestData.error ||
          getRequestType.error ||
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
    requestData.data &&
    getRequestType.data
  )
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
        <DataVal
          data={data}
          empty="Aucun besoin en attente"
          isCheckable={true}
          categoriesData={categoriesData.data.data}
          projectsData={projectsData.data.data}
          usersData={usersData.data.data}
          paymentsData={paymentsData.data.data}
          requestTypeData={getRequestType.data.data}
          pending={pending}
          cleared={approved + rejected}
        />
      </div>
    );
};

export default Page;
