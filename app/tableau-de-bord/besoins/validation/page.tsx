"use client";

import { DataVal } from "@/components/base/dataVal";
import {
  StatisticCard,
  StatisticProps,
} from "@/components/base/TitleValueCard";
import ErrorPage from "@/components/error-page";
import LoadingPage from "@/components/loading-page";
import PageTitle from "@/components/pageTitle";
import { useStore } from "@/providers/datastore";
import { userQ } from "@/queries/baseModule";
import { categoryQ } from "@/queries/categoryModule";
import { paymentQ } from "@/queries/payment";
import { projectQ } from "@/queries/projectModule";
import { requestQ } from "@/queries/requestModule";
import { requestTypeQ } from "@/queries/requestType";
import { RequestModelT } from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import React, { useMemo } from "react";

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
    queryKey: ["requests"],
    queryFn: requestQ.getAll,
  });

  const getRequestType = useQuery({
    queryKey: ["requestType"],
    queryFn: requestTypeQ.getAll,
  });

  const data: Array<RequestModelT> = useMemo(() => {
    if (!requestData.data || !categoriesData.data) return [];
    return requestData.data.data.filter((r) => {
      const isValidator = categoriesData.data.data
        .find((c) => c.id === r.categoryId)
        ?.validators.find((v) => v.userId === user?.id);
      return (
        !!isValidator &&
        r.type !== "ressource_humaine" &&
        r.type !== "speciaux" &&
        r.state !== "cancel"
      );
    });
  }, [requestData.data, categoriesData.data, user, categoriesData.data]);

  // Calcul des statistiques à partir des données filtrées
  const pending = useMemo(() => {
    return data.filter((item) => {
      const validator = categoriesData.data?.data
        .find((c) => c.id === item.categoryId)
        ?.validators.find((v) => v.userId === user?.id);
      const canValidate = !!item.revieweeList
        ? validator?.rank === item.revieweeList.length + 1
        : validator?.rank === 1;
      return item.state === "pending" && canValidate;
    }).length;
  }, [data, categoriesData.data, user?.id]);

  const approved = useMemo(() => {
    return data.filter((item) => {
      const validator = categoriesData.data?.data
        .find((c) => c.id === item.categoryId)
        ?.validators.find((v) => v.userId === user?.id);
      const isValidated =
        item.state !== "rejected" &&
        !!validator &&
        !!item.revieweeList &&
        item.revieweeList.length > 0 &&
        item.revieweeList.some((u) => u.validatorId === validator.id);
      return isValidated;
    }).length;
  }, [data, categoriesData.data, user?.id]);

  const received = useMemo(() => {
    return data.filter((r) => {
      const validator = categoriesData.data?.data
        .find((c) => c.id === r.categoryId)
        ?.validators.find((v) => v.userId === user?.id);
      const canValidate = !!r.revieweeList
        ? validator?.rank === r.revieweeList.length + 1
        : validator?.rank === 1;
      const result = r.state === "pending" ? canValidate : true;
      return result;
    }).length;
  }, [data, categoriesData.data, user?.id]);

  const rejected = useMemo(() => {
    return data.filter((item) => {
      const validator = categoriesData.data?.data
        .find((c) => c.id === item.categoryId)
        ?.validators.find((v) => v.userId === user?.id);
      const isRejected =
        item.state === "rejected" &&
        !!validator &&
        !!item.revieweeList &&
        item.revieweeList.length > 0 &&
        item.revieweeList.some((u) => u.validatorId === validator.id);
      return isRejected;
    }).length;
  }, [data, categoriesData.data, user?.id]);

  const Statistics: Array<StatisticProps> = [
    {
      title: "En attente de validation",
      value: pending,
      variant: "secondary",
      more: {
        title: "Total recus",
        value: received,
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
        />
      </div>
    );
};

export default Page;
