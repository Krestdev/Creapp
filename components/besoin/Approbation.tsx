"use client";

import { DataValidation } from "@/components/base/dataValidation";
import { useStore } from "@/providers/datastore";
import { DepartmentQueries } from "@/queries/departmentModule";
import { RequestQueries } from "@/queries/requestModule";
import { RequestModelT } from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import React from "react";

interface Props {
  dateFilter: "today" | "week" | "month" | "year" | "custom" | undefined;
  setDateFilter: React.Dispatch<
    React.SetStateAction<
      "today" | "week" | "month" | "year" | "custom" | undefined
    >
  >;
  customDateRange?: { from: Date; to: Date } | undefined;
  setCustomDateRange?: React.Dispatch<
    React.SetStateAction<{ from: Date; to: Date } | undefined>
  >;
}

// Hook personnalisé pour isLastValidator
const useIsLastValidator = (departmentData: any, user: any) => {
  return React.useMemo(() => {
    const data = departmentData?.data?.data;
    const userId = user?.id;

    if (!data || !userId) return false;

    return (
      data
        .flatMap((mem: any) => mem.members)
        .find((mem: any) => mem.userId === userId)?.finalValidator === true
    );
  }, [departmentData?.data?.data, user?.id]);
};

// Hook personnalisé pour filtrer les données
const useFilteredRequests = (
  requestData: any,
  dateFilter: any,
  customDateRange: any
) => {
  return React.useMemo(() => {
    const data = requestData?.data?.data;

    if (!data) {
      return [];
    }

    if (!dateFilter) {
      return data;
    }

    const now = new Date();
    let startDate = new Date();
    let endDate = now;

    switch (dateFilter) {
      case "today":
        startDate.setHours(0, 0, 0, 0);
        break;
      case "week":
        startDate.setDate(
          now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1)
        );
        startDate.setHours(0, 0, 0, 0);
        break;
      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "year":
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case "custom":
        if (customDateRange?.from && customDateRange?.to) {
          startDate = customDateRange.from;
          endDate = customDateRange.to;
        } else {
          return data;
        }
        break;
      default:
        return data;
    }

    return data.filter((item: RequestModelT) => {
      const itemDate = new Date(item.createdAt);
      return itemDate >= startDate && itemDate <= endDate;
    });
  }, [requestData?.data?.data, dateFilter, customDateRange]);
};

// Hook personnalisé pour pendingData
const usePendingData = (
  filteredData: RequestModelT[],
  user: any,
  isLastValidator: boolean,
  departmentData: any
) => {
  return React.useMemo(() => {
    const userId = user?.id;
    const deptData = departmentData?.data?.data;

    if (!filteredData || !userId || !deptData) return [];

    return filteredData
      .filter((x) => x.state === "pending")
      .filter((item) => {
        const validatorIds = deptData
          .flatMap((x: any) => x.members)
          .filter((x: any) => x.validator === true)
          .map((x: any) => x.userId);

        if (isLastValidator) {
          return validatorIds?.every((id: number) =>
            item.revieweeList?.flatMap((x) => x.validatorId).includes(id)
          );
        } else {
          return (
            !item.revieweeList
              ?.flatMap((x) => x.validatorId)
              .includes(userId) && item.state === "pending"
          );
        }
      });
  }, [filteredData, user, isLastValidator, departmentData]);
};

// Hook personnalisé pour proceedData
const useProceedData = (
  filteredData: RequestModelT[],
  user: any,
  isLastValidator: boolean
) => {
  return React.useMemo(() => {
    const userId = user?.id;

    if (!filteredData || !userId) return [];

    return filteredData.filter((item) => {
      if (isLastValidator) {
        return item.state !== "pending";
      } else {
        return item.revieweeList
          ?.flatMap((x) => x.validatorId)
          .includes(userId);
      }
    });
  }, [filteredData, user, isLastValidator]);
};

const Approbation = ({
  dateFilter,
  setDateFilter,
  customDateRange,
  setCustomDateRange,
}: Props) => {
  const { isHydrated, user } = useStore();
  const request = new RequestQueries();

  const department = new DepartmentQueries();
  const departmentData = useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      return department.getAll();
    },
    enabled: isHydrated,
  });

  const requestData = useQuery({
    queryKey: ["requests-validation"],
    queryFn: () => {
      return request.getAll();
    },
    enabled: isHydrated,
  });

  // Utiliser les hooks personnalisés
  const isLastValidator = useIsLastValidator(departmentData, user);
  const filteredData = useFilteredRequests(
    requestData,
    dateFilter,
    customDateRange
  );
  const pendingData = usePendingData(
    filteredData,
    user,
    isLastValidator,
    departmentData
  );
  const proceedData = useProceedData(filteredData, user, isLastValidator);

  console.log(pendingData);
  

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col">
        <h2>Liste des besoins à approuver</h2>
        <DataValidation
          data={pendingData}
          isLastValidator={isLastValidator}
          empty={"Aucun besoin en attente de validation"}
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
          customDateRange={customDateRange}
          setCustomDateRange={setCustomDateRange}
        />
      </div>
      <div className="flex flex-col">
        <h2>Liste des besoins traités</h2>
        <DataValidation
          data={proceedData}
          isLastValidator={isLastValidator}
          empty={"Aucun besoin traité"}
          type="proceed"
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
          customDateRange={customDateRange}
          setCustomDateRange={setCustomDateRange}
        />
      </div>
    </div>
  );
};

export default Approbation;
