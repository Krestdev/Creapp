"use client";

import StatsCard from "@/components/base/StatsCard";
import RequestList from "@/components/besoin/RequestListPage";
import PageTitle from "@/components/pageTitle";
import { useStore } from "@/providers/datastore";
import { RequestQueries } from "@/queries/requestModule";
import { CategoryQueries } from "@/queries/categoryModule";
import { TableFilters } from "@/components/base/data-table";
import { useQuery } from "@tanstack/react-query";
import React from "react";

const Page = () => {
  const { user, isHydrated } = useStore();
  const request = new RequestQueries();
  
  // État pour tous les filtres
  const [filters, setFilters] = React.useState<TableFilters>({
    globalFilter: "",
    statusFilter: "all",
    categoryFilter: "all",
    projectFilter: "all",
    userFilter: "all",
    dateFilter: undefined,
    customDateRange: undefined,
  });

  // Récupérer les besoins de l'utilisateur
  const requestData = useQuery({
    queryKey: ["requests", user?.id],
    queryFn: () => {
      if (!user?.id) {
        throw new Error("ID utilisateur non disponible");
      }
      return request.getMine(user.id);
    },
    enabled: !!user?.id && isHydrated,
  });

  // Récupérer les catégories (pour le nouveau système de validation)
  const category = new CategoryQueries();
  const categoriesData = useQuery({
    queryKey: ["categories"],
    queryFn: () => category.getCategories(),
    enabled: isHydrated,
  });

  // Fonction pour filtrer les données selon TOUS les filtres
  const getFilteredData = React.useMemo(() => {
    if (!requestData.data?.data) {
      return requestData.data?.data || [];
    }

    let filtered = [...requestData.data.data];

    // Filtrer par date
    if (filters.dateFilter) {
      const now = new Date();
      let startDate = new Date();
      let endDate = now;

      switch (filters.dateFilter) {
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
          if (filters.customDateRange?.from && filters.customDateRange?.to) {
            startDate = filters.customDateRange.from;
            endDate = filters.customDateRange.to;
          } else {
            break;
          }
          break;
        default:
          break;
      }

      filtered = filtered.filter((item) => {
        const itemDate = new Date(item.createdAt);
        return itemDate >= startDate && itemDate <= endDate;
      });
    }

    // Filtrer par statut
    if (filters.statusFilter && filters.statusFilter !== "all") {
      filtered = filtered.filter((item) => item.state === filters.statusFilter);
    }

    // Filtrer par catégorie
    if (filters.categoryFilter && filters.categoryFilter !== "all") {
      filtered = filtered.filter(
        (item) => String(item.categoryId) === String(filters.categoryFilter)
      );
    }

    // Filtrer par recherche globale
    if (filters.globalFilter) {
      const searchValue = filters.globalFilter.toLowerCase();
      filtered = filtered.filter((item) => {
        const searchText = [
          item.label || "",
          item.ref || "",
        ].join(" ").toLowerCase();
        return searchText.includes(searchValue);
      });
    }

    // Filtrer par projet
    if (filters.projectFilter && filters.projectFilter !== "all") {
      filtered = filtered.filter(
        (item) => String(item.projectId) === String(filters.projectFilter)
      );
    }

    return filtered;
  }, [requestData.data?.data, filters]);

  // Calculer les statistiques BASÉES SUR LES FILTRES
  const soumis = getFilteredData.length ?? 0;
  const attentes =
    getFilteredData.filter((item) => item.state === "pending").length ?? 0;
  const rejetes =
    getFilteredData.filter((item) => item.state === "rejected").length ?? 0;
  const validés = soumis - attentes - rejetes;

  return (
    <div className="flex flex-col gap-6">
      {/* page title */}
      <PageTitle
        title="Mes Besoins"
        subtitle="Consulter et gérez les besoins"
        color="red"
      />

      {/* Cartes de statistiques originales */}
      <div className="flex flex-row flex-wrap md:grid md:grid-cols-4 gap-2 md:gap-5">
        <StatsCard
          titleColor="text-[#E4E4E7]"
          title="En attente de validation"
          value={String(attentes)}
          description="Besoins rejetés :"
          descriptionValue={String(rejetes)}
          descriptionColor="red"
          dividerColor="bg-[#2262A2]"
          className={"bg-[#013E7B] text-[#ffffff] border-[#2262A2]"}
          dvalueColor="text-[#DC2626]"
        />
        <StatsCard
          title="Total besoins soumis"
          titleColor="text-[#52525B]"
          value={String(soumis)}
          description="Besoins Approuvés :"
          descriptionValue={String(validés)}
          descriptionColor="text-[#A1A1AA]"
          dividerColor="bg-[#DFDFDF]"
          className={"bg-[#FFFFFF] text-[#000000] border-[#DFDFDF]"}
          dvalueColor="text-green-600"
        />
      </div>
      
      {/* Page table */}
      <RequestList 
        dateFilter={filters.dateFilter}
        setDateFilter={(value) => setFilters(prev => ({ ...prev, dateFilter: typeof value === 'function' ? value(prev.dateFilter) : value }))}
        customDateRange={filters.customDateRange}
        setCustomDateRange={(value) => setFilters(prev => ({ ...prev, customDateRange: typeof value === 'function' ? value(prev.customDateRange) : value }))}
        requestData={getFilteredData}
        filters={filters}
        setFilters={setFilters}
      />
    </div>
  );
};

export default Page;