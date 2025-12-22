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

/* =========================
   UTILS
========================= */

const getUserValidatorPosition = (
  category: Category | undefined,
  userId: number
): number | null => {
  if (!category || !category.validators) return null;
  const validator = category.validators.find(v => v.userId === userId);
  return validator?.rank ?? null;
};

/* =========================
   HOOKS
========================= */

const useHasUserAlreadyValidated = (
  categoryData: UseQueryResult<{ data: Category[] }, Error>
) => {
  return React.useCallback(
    (request: RequestModelT, userId: number) => {
      const categories = categoryData.data?.data;
      if (!categories || !request.categoryId) return false;

      const validatorId = categories
        .find(c => c.id === request.categoryId)
        ?.validators.find(v => v.userId === userId)?.id;

      if (!validatorId) return false;

      return (
        request.revieweeList?.some(
          r => r.validatorId === validatorId
        ) ?? false
      );
    },
    [categoryData.data?.data]
  );
};

const useIsLastValidatorForCategory = (
  categoryData: UseQueryResult<{ data: Category[] }, Error>,
  user: User
) => {
  return React.useCallback(
    (categoryId: number) => {
      const categories = categoryData.data?.data;
      if (!categories) return false;

      const category = categories.find(c => c.id === categoryId);
      if (!category || !category.validators?.length) return false;

      const maxRank = Math.max(...category.validators.map(v => v.rank));
      const lastValidator = category.validators.find(v => v.rank === maxRank);

      return lastValidator?.userId === user.id;
    },
    [categoryData.data?.data, user.id]
  );
};

const useFilteredRequests = (
  requestData: UseQueryResult<{ data: RequestModelT[] }, Error>,
  dateFilter: Props["dateFilter"],
  customDateRange?: { from: Date; to: Date }
) => {
  return React.useMemo(() => {
    const data = requestData.data?.data.filter(item => item.state !== "cancel") ?? [];
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
  const hasUserAlreadyValidated = useHasUserAlreadyValidated(categoryData);

  return React.useMemo(() => {
    const categories = categoryData.data?.data;
    if (!categories) return [];

    return filteredData.filter((item) => {
      // 1️⃣ Seulement les besoins en attente
      if (item.state !== "pending") return false;

      const category = categories.find(
        (c) => c.id === item.categoryId
      );
      if (!category || !category.validators?.length) return false;

      // 2️⃣ Vérifier que l'utilisateur est validateur
      const currentValidator = category.validators.find(
        (v) => v.userId === user.id
      );
      if (!currentValidator) return false;

      // 3️⃣ S'il a déjà validé → ne plus afficher
      if (hasUserAlreadyValidated(item, user.id!)) return false;

      // 4️⃣ Trouver les validateurs précédents (rank inférieur)
      const previousValidators = category.validators.filter(
        (v) => v.rank < currentValidator.rank
      );

      // 5️⃣ Aucun validateur avant lui → OK (rank 1)
      if (previousValidators.length === 0) return true;

      // 6️⃣ IDs des validateurs précédents
      const previousValidatorIds = previousValidators.map((v) => v.id);

      // 7️⃣ Vérifier qu'ils ont TOUS validé
      const validatedIds =
        item.revieweeList?.map((r) => r.validatorId) ?? [];

      const allPreviousValidated = previousValidatorIds.every((id) =>
        validatedIds.includes(id!)
      );

      return allPreviousValidated;
    });
  }, [
    filteredData,
    user.id,
    categoryData.data?.data,
    hasUserAlreadyValidated,
  ]);
};


const useProceedData = (
  filteredData: RequestModelT[],
  user: User,
  categoryData: UseQueryResult<{ data: Category[] }, Error>
) => {
  const hasUserAlreadyValidated = useHasUserAlreadyValidated(categoryData);
  const isLastValidatorForCategory = useIsLastValidatorForCategory(
    categoryData,
    user
  );

  return React.useMemo(() => {
    return filteredData.filter(item => {
      if (!item.categoryId) return false;

      if (isLastValidatorForCategory(item.categoryId)) {
        return item.state !== "pending";
      }

      return hasUserAlreadyValidated(item, user.id!);
    });
  }, [
    filteredData,
    user.id,
    hasUserAlreadyValidated,
    isLastValidatorForCategory,
  ]);
};

/* =========================
   COMPONENT
========================= */

const Approb = ({
  dateFilter,
  setDateFilter,
  customDateRange,
  setCustomDateRange,
}: Props) => {
  const { isHydrated, user } = useStore();

  if (!isHydrated || !user) return null;

  const request = new RequestQueries();
  const category = new CategoryQueries();
  const userQueries = new UserQueries();

  const categoryData = useQuery({
    queryKey: ["categories"],
    queryFn: () => category.getCategories(),
  });

  const requestData = useQuery({
    queryKey: ["requests"],
    queryFn: () => request.getAll(),
  });

  useQuery({
    queryKey: ["users"],
    queryFn: () => userQueries.getAll(),
  });

  const filteredData = useFilteredRequests(
    requestData,
    dateFilter,
    customDateRange
  );

  const pendingData = usePendingData(filteredData, user, categoryData);
  const proceedData = useProceedData(filteredData, user, categoryData);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold mb-3">
          Besoins en attente de validation
        </h2>

        {pendingData.length > 0 ? (
            <DataVal
              data={pendingData}
              dateFilter={dateFilter}
              setDateFilter={setDateFilter}
              customDateRange={customDateRange}
              setCustomDateRange={setCustomDateRange}
              empty={"Aucun besoin traité"}
            />
        ) : (
          <div className="text-center py-12 border rounded-lg bg-gray-50">
            <CheckCircle className="mx-auto h-8 w-8 text-green-600 mb-2" />
            <p>Aucun besoin en attente</p>
          </div>
        )}
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-3">
          Historique des validations
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
