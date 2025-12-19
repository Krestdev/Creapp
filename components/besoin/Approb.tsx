"use client";

import { useStore } from "@/providers/datastore";
import { CategoryQueries } from "@/queries/categoryModule";
import { RequestQueries } from "@/queries/requestModule";
import { UserQueries } from "@/queries/baseModule";
import { Category, RequestModelT, User } from "@/types/types";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import React from "react";
import { DataVal } from "../base/dataVal";
import { Badge } from "../ui/badge";
import { CheckCircle } from "lucide-react";

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

// Hook pour récupérer la position de l'utilisateur dans la chaîne de validation d'une catégorie
const getUserValidatorPosition = (
  category: Category | undefined,
  userId: number
): number | null => {
  if (!category || !category.validators || !userId) return null;
  
  const validator = category.validators.find(v => v.userId === userId);
  return validator?.rank || null;
};

// Hook pour vérifier si un utilisateur est le dernier validateur pour une catégorie
const useIsLastValidatorForCategory = (
  categoryData: UseQueryResult<
    {
      data: Category[];
    },
    Error
  >,
  user: User
) => {
  return React.useCallback((categoryId: number) => {
    const categories = categoryData?.data?.data;
    const userId = user?.id;

    if (!categories || !userId) return false;

    const category = categories.find(cat => cat.id === categoryId);
    if (!category || !category.validators || category.validators.length === 0) {
      return false;
    }

    // Trouver le validateur avec la position la plus élevée
    const maxPosition = Math.max(...category.validators.map(v => v.rank));
    const lastValidator = category.validators.find(v => v.rank === maxPosition);
    
    return lastValidator?.userId === userId;
  }, [categoryData?.data?.data, user?.id]);
};

// Hook pour vérifier si un besoin est prêt pour la validation de l'utilisateur courant
const useIsReadyForUserValidation = (
  categoryData: UseQueryResult<
    {
      data: Category[];
    },
    Error
  >,
  user: User
) => {
  const userId = user?.id;

  return React.useCallback((request: RequestModelT) => {
    const categories = categoryData?.data?.data;

    if (!categories || !userId || !request.categoryId) return false;

    const category = categories.find(cat => cat.id === request.categoryId);
    if (!category || !category.validators || category.validators.length === 0) {
      return false;
    }

    const userPosition = getUserValidatorPosition(category, userId);
    if (userPosition === null) return false;

    // Si l'utilisateur est le premier validateur (rank 1)
    if (userPosition === 1) {
      // Vérifier si aucune validation n'a encore été faite
      return !request.revieweeList || request.revieweeList.length === 0;
    }

    // Pour les validateurs suivants, vérifier si tous les validateurs précédents ont validé
    const previousPositions = Array.from(
      { length: userPosition - 1 },
      (_, i) => i + 1
    );

    // Récupérer les IDs des validateurs précédents
    const previousValidatorIds = category.validators
      .filter(v => previousPositions.includes(v.rank))
      .map(v => v.userId);

    // Vérifier si tous les validateurs précédents ont validé
    const validatedPreviousIds = request.revieweeList
      ?.map(r => r.validatorId)
      .filter(id => previousValidatorIds.includes(id)) || [];

    return previousValidatorIds.length > 0 && 
           previousValidatorIds.length === validatedPreviousIds.length;
  }, [categoryData?.data?.data, userId]);
};

// Hook pour vérifier si l'utilisateur a déjà validé un besoin
const useHasUserAlreadyValidated = () => {
  return React.useCallback((request: RequestModelT, userId: number) => {
    return request.revieweeList?.some(r => r.validatorId === userId) || false;
  }, []);
};

// Hook personnalisé pour filtrer les données
const useFilteredRequests = (
  requestData: UseQueryResult<
    {
      data: RequestModelT[];
    },
    Error
  >,
  dateFilter: "today" | "week" | "month" | "year" | "custom" | undefined,
  customDateRange: { from: Date; to: Date } | undefined
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

// Hook personnalisé pour pendingData basé sur les catégories
const usePendingData = (
  filteredData: RequestModelT[],
  user: User,
  categoryData: UseQueryResult<
    {
      data: Category[];
    },
    Error
  >
) => {
  const isReadyForUserValidation = useIsReadyForUserValidation(categoryData, user);
  const hasUserAlreadyValidated = useHasUserAlreadyValidated();
  const userId = user?.id;

  return React.useMemo(() => {
    const categories = categoryData?.data?.data;

    if (!filteredData || !userId || !categories) return [];

    return filteredData.filter((item) => {
      // Filtrer seulement les besoins en attente
      if (item.state !== "pending") return false;

      // Vérifier si l'utilisateur est un validateur pour cette catégorie
      const category = categories.find(cat => cat.id === item.categoryId);
      if (!category || !category.validators) return false;

      const isUserValidator = category.validators.some(v => v.userId === userId);
      if (!isUserValidator) return false;

      // Vérifier si l'utilisateur a déjà validé ce besoin
      if (hasUserAlreadyValidated(item, userId)) return false;

      // Vérifier si le besoin est prêt pour la validation de cet utilisateur
      return isReadyForUserValidation(item);
    });
  }, [filteredData, userId, categoryData, isReadyForUserValidation, hasUserAlreadyValidated]);
};

// Hook personnalisé pour proceedData basé sur les catégories
const useProceedData = (
  filteredData: RequestModelT[],
  user: User,
  categoryData: UseQueryResult<
    {
      data: Category[];
    },
    Error
  >
) => {
  const isLastValidatorForCategory = useIsLastValidatorForCategory(categoryData, user);
  const hasUserAlreadyValidated = useHasUserAlreadyValidated();
  const userId = user?.id;

  return React.useMemo(() => {
    const categories = categoryData?.data?.data;

    if (!filteredData || !userId || !categories) return [];

    return filteredData.filter((item) => {
      // Pour tous les utilisateurs : afficher les besoins qu'ils ont validés
      const userHasValidated = hasUserAlreadyValidated(item, userId);
      
      // Pour le dernier validateur d'une catégorie : afficher tous les besoins traités de cette catégorie
      if (item.categoryId && isLastValidatorForCategory(item.categoryId)) {
        // Le dernier validateur voit tous les besoins traités de sa catégorie
        // s'il est le dernier validateur pour cette catégorie
        const isLastForThisCategory = isLastValidatorForCategory(item.categoryId);
        if (isLastForThisCategory) {
          return item.state !== "pending" || userHasValidated;
        }
      }

      // Pour les autres validateurs : afficher seulement les besoins qu'ils ont traités
      return userHasValidated;
    });
  }, [filteredData, userId, categoryData, isLastValidatorForCategory, hasUserAlreadyValidated]);
};

// Hook pour obtenir des statistiques sur les besoins en attente
const useValidationStats = (
  pendingData: RequestModelT[],
  user: User,
  categoryData: UseQueryResult<
    {
      data: Category[];
    },
    Error
  >
) => {
  const userId = user?.id;

  return React.useMemo(() => {
    if (!pendingData || !userId || !categoryData?.data?.data) {
      return { total: 0, byCategory: {} };
    }

    const categories = categoryData.data.data;
    const stats: Record<string, { count: number; name: string }> = {};

    pendingData.forEach((item) => {
      const category = categories.find(cat => cat.id === item.categoryId);
      const categoryName = category?.label || `Catégorie #${item.categoryId}`;
      
      if (!stats[categoryName]) {
        stats[categoryName] = { count: 0, name: categoryName };
      }
      stats[categoryName].count++;
    });

    return {
      total: pendingData.length,
      byCategory: stats,
    };
  }, [pendingData, userId, categoryData?.data?.data]);
};

const Approb = ({
  dateFilter,
  setDateFilter,
  customDateRange,
  setCustomDateRange,
}: Props) => {
  const { isHydrated, user } = useStore();
  const request = new RequestQueries();
  const category = new CategoryQueries();
  const userQueries = new UserQueries();

  const categoryData = useQuery({
    queryKey: ["categories-with-validators"],
    queryFn: async () => {
      return category.getCategories();
    },
    enabled: isHydrated,
  });

  const usersData = useQuery({
    queryKey: ["users-validation"],
    queryFn: async () => {
      return userQueries.getAll();
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
  const filteredData = useFilteredRequests(
    requestData,
    dateFilter,
    customDateRange
  );
  const pendingData = usePendingData(
    filteredData,
    user!,
    categoryData
  );
  const proceedData = useProceedData(filteredData, user!, categoryData);
  const validationStats = useValidationStats(pendingData, user!, categoryData);

  // Fonction pour obtenir la position de l'utilisateur pour un besoin
  const getUserPositionForRequest = (request: RequestModelT) => {
    if (!request.categoryId || !user?.id || !categoryData?.data?.data) return null;
    
    const category = categoryData.data.data.find(cat => cat.id === request.categoryId);
    return getUserValidatorPosition(category, user.id);
  };

  // Fonction pour obtenir le nom de la catégorie
  const getCategoryName = (categoryId: number) => {
    const category = categoryData?.data?.data?.find(cat => cat.id === categoryId);
    return category?.label || `Catégorie #${categoryId}`;
  };

  // Fonction pour obtenir le nombre total de validateurs pour une catégorie
  const getTotalValidatorsForCategory = (categoryId: number) => {
    const category = categoryData?.data?.data?.find(cat => cat.id === categoryId);
    return category?.validators?.length || 0;
  };

  // Fonction pour obtenir le nombre de validateurs qui ont déjà validé un besoin
  const getValidatedCountForRequest = (request: RequestModelT) => {
    return request.revieweeList?.length || 0;
  };

  return (
    <div className="flex flex-col gap-6">

      <div className="flex flex-col gap-4">
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold">Besoins en attente de validation</h2>
          </div>
          
          {pendingData.length > 0 ? (
            <div className="space-y-4">
              {pendingData.map((request) => {
                const userPosition = getUserPositionForRequest(request);
                const categoryName = getCategoryName(request.categoryId!);
                const totalValidators = getTotalValidatorsForCategory(request.categoryId!);
                const validatedCount = getValidatedCountForRequest(request);
                
                return (
                  <DataVal
                    key={request.id}
                    data={[request]}
                    empty={"Aucun besoin en attente de validation"}
                    dateFilter={dateFilter}
                    setDateFilter={setDateFilter}
                    customDateRange={customDateRange}
                    setCustomDateRange={setCustomDateRange}
                    customProps={{
                      userPosition,
                      categoryName,
                      totalValidators,
                      validatedCount,
                    }}
                  />
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 border rounded-lg bg-gray-50">
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Aucun besoin en attente</h3>
                  <p className="text-gray-500 text-sm mt-1">
                    Tous les besoins nécessitant votre approbation sont traités
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold">Historique des approbations</h2>
          </div>
          
          <DataVal
            data={proceedData}
            empty={"Aucun besoin traité"}
            type="proceed"
            dateFilter={dateFilter}
            setDateFilter={setDateFilter}
            customDateRange={customDateRange}
            setCustomDateRange={setCustomDateRange}
          />
        </div>
      </div>
    </div>
  );
};

export default Approb;