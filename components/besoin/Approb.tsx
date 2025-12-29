"use client";

import React from "react";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { CheckCircle } from "lucide-react";

import { useStore } from "@/providers/datastore";
import { CategoryQueries } from "@/queries/categoryModule";
import { RequestQueries } from "@/queries/requestModule";
import { UserQueries } from "@/queries/baseModule";

import { Category, RequestModelT, User } from "@/types/types";
import { DataVal } from "../base/dataVal";

/* ======================================================
   TYPES
====================================================== */

interface Props {
  dateFilter: "today" | "week" | "month" | "year" | "custom" | undefined;
  setDateFilter: React.Dispatch<
    React.SetStateAction<
      "today" | "week" | "month" | "year" | "custom" | undefined
    >
  >;
  customDateRange?: { from: Date; to: Date };
  setCustomDateRange?: React.Dispatch<
    React.SetStateAction<{ from: Date; to: Date } | undefined>
  >;
}

/* ======================================================
   UTILS (IMPORTANT : categoryId = 0 est VALIDE)
====================================================== */

const isValidCategoryId = (
  id: number | null | undefined
): id is number => id !== null && id !== undefined;

const isUserValidatorForCategory = (
  categoryId: number | null | undefined,
  userId: number,
  categories: Category[]
): boolean => {
  if (!isValidCategoryId(categoryId)) return false;

  const category = categories.find(c => c.id === categoryId);
  if (!category?.validators) return false;

  return category.validators.some(v => v.userId === userId);
};

const hasUserValidatedRequest = (
  request: RequestModelT,
  userId: number,
  categories: Category[]
): boolean => {
  if (!isValidCategoryId(request.categoryId)) return false;

  const category = categories.find(c => c.id === request.categoryId);
  if (!category?.validators || !request.revieweeList) return false;

  const validator = category.validators.find(v => v.userId === userId);
  if (!validator) return false;

  return request.revieweeList.some(
    r => r.validatorId === validator.id
  );
};

const hasAllPreviousValidatorsApproved = (
  request: RequestModelT,
  userId: number,
  categories: Category[]
): boolean => {
  if (!isValidCategoryId(request.categoryId)) return false;

  const category = categories.find(c => c.id === request.categoryId);
  if (!category?.validators) return false;

  const currentValidator = category.validators.find(v => v.userId === userId);
  if (!currentValidator) return false;

  // Rank 1 → toujours visible
  if (currentValidator.rank === 1) return true;

  const previousValidators = category.validators.filter(
    v => v.rank < currentValidator.rank
  );

  if (previousValidators.length === 0) return true;

  const validatedIds =
    request.revieweeList?.map(r => r.validatorId) ?? [];

  return previousValidators.every(v =>
    validatedIds.includes(v.id!)
  );
};

/* ======================================================
   HOOKS
====================================================== */

const useFilteredRequests = (
  requestData: UseQueryResult<{ data: RequestModelT[] }, Error>,
  dateFilter: Props["dateFilter"],
  customDateRange?: { from: Date; to: Date }
) => {
  return React.useMemo(() => {
    const data =
      requestData.data?.data.filter(r => r.state !== "cancel") ?? [];

    if (!dateFilter) return data;

    const now = new Date();
    let start = new Date(0);
    let end = new Date();

    switch (dateFilter) {
      case "today":
        start = new Date();
        start.setHours(0, 0, 0, 0);
        break;
      case "week":
        start = new Date();
        start.setDate(now.getDate() - now.getDay() + 1);
        start.setHours(0, 0, 0, 0);
        break;
      case "month":
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "year":
        start = new Date(now.getFullYear(), 0, 1);
        break;
      case "custom":
        if (customDateRange) {
          start = customDateRange.from;
          end = customDateRange.to;
        }
        break;
    }

    return data.filter(item => {
      const d = new Date(item.createdAt);
      return d >= start && d <= end;
    });
  }, [requestData.data?.data, dateFilter, customDateRange]);
};

const usePendingData = (
  filteredData: RequestModelT[],
  user: User,
  categoryData: UseQueryResult<{ data: Category[] }, Error>
) => {
  return React.useMemo(() => {
    const categories = categoryData.data?.data;
    if (!categories) return [];

    return filteredData.filter(item => {
      return (
        item.state === "pending" &&
        isUserValidatorForCategory(item.categoryId, user.id!, categories) &&
        !hasUserValidatedRequest(item, user.id!, categories) &&
        hasAllPreviousValidatorsApproved(item, user.id!, categories)
      );
    });
  }, [filteredData, user.id, categoryData.data?.data]);
};

const useProceedData = (
  filteredData: RequestModelT[],
  user: User,
  categoryData: UseQueryResult<{ data: Category[] }, Error>
) => {
  return React.useMemo(() => {
    const categories = categoryData.data?.data;
    if (!categories) return [];

    return filteredData.filter(item => {
      return (
        isUserValidatorForCategory(item.categoryId, user.id!, categories) &&
        hasUserValidatedRequest(item, user.id!, categories) &&
        (item.state === "pending" || item.state === "validated")
      );
    });
  }, [filteredData, user.id, categoryData.data?.data]);
};

/* ======================================================
   COMPONENT
====================================================== */

const Approb = ({
  dateFilter,
  setDateFilter,
  customDateRange,
  setCustomDateRange,
}: Props) => {
  const { isHydrated, user } = useStore();

  const requestQueries = new RequestQueries();
  const categoryQueries = new CategoryQueries();
  const userQueries = new UserQueries();

  const categoryData = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoryQueries.getCategories(),
    enabled: isHydrated,
  });

  const requestData = useQuery({
    queryKey: ["requests"],
    queryFn: () => requestQueries.getAll(),
    enabled: isHydrated && !!user,
  });

  useQuery({
    queryKey: ["users"],
    queryFn: () => userQueries.getAll(),
    enabled: isHydrated && !!user,
  });

  if (!isHydrated || !user) return null;

  const filteredData = useFilteredRequests(
    requestData,
    dateFilter,
    customDateRange
  );

  const pendingData = usePendingData(filteredData, user, categoryData);
  const proceedData = useProceedData(filteredData, user, categoryData);

  return (
    <div className="flex flex-col gap-6">
      {/* ================== PENDING ================== */}
      <div>
        <h2 className="text-xl font-semibold mb-3">
          Besoins en attente de validation ({pendingData.length})
        </h2>

        {pendingData.length > 0 ? (
          <DataVal
            data={pendingData}
            dateFilter={dateFilter}
            setDateFilter={setDateFilter}
            customDateRange={customDateRange}
            setCustomDateRange={setCustomDateRange}
            empty="Aucun besoin en attente"
          />
        ) : (
          <div className="text-center py-12 border rounded-lg bg-gray-50">
            <CheckCircle className="mx-auto h-8 w-8 text-green-600 mb-2" />
            <p>Aucun besoin en attente</p>
          </div>
        )}
      </div>

      {/* ================== HISTORY ================== */}
      <div>
        <h2 className="text-xl font-semibold mb-3">
          Historique des validations ({proceedData.length})
        </h2>

        <DataVal
          data={proceedData}
          type="proceed"
          empty="Aucun besoin traité"
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
          customDateRange={customDateRange}
          setCustomDateRange={setCustomDateRange}
        />
      </div>
    </div>
  );
};

export default Approb;
