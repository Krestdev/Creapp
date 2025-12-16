"use client";

import StatsCard from "@/components/base/StatsCard";
import RequestList from "@/components/besoin/RequestListPage";
import PageTitle from "@/components/pageTitle";
import { useStore } from "@/providers/datastore";
import { RequestQueries } from "@/queries/requestModule";
import { useQuery } from "@tanstack/react-query";
import React from "react";

const Page = () => {
  const { user, isHydrated } = useStore();
  const request = new RequestQueries();
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

  const [dateFilter, setDateFilter] = React.useState<
    "today" | "week" | "month" | "year" | "custom" | undefined
  >();
  const [customDateRange, setCustomDateRange] = React.useState<
    { from: Date; to: Date } | undefined
  >();

  // Fonction pour filtrer les données selon la période sélectionnée
  const getFilteredData = React.useMemo(() => {
    if (!requestData.data?.data) {
      return requestData.data?.data || [];
    }

    // Si pas de filtre, retourner toutes les données
    if (!dateFilter) {
      return requestData.data.data;
    }

    const now = new Date();
    let startDate = new Date();
    let endDate = now;

    switch (dateFilter) {
      case "today":
        // Début de la journée
        startDate.setHours(0, 0, 0, 0);
        break;
      case "week":
        // Début de la semaine (lundi)
        startDate.setDate(
          now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1)
        );
        startDate.setHours(0, 0, 0, 0);
        break;
      case "month":
        // Début du mois
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "year":
        // Début de l'année
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case "custom":
        // Utiliser la plage personnalisée
        if (customDateRange?.from && customDateRange?.to) {
          startDate = customDateRange.from;
          endDate = customDateRange.to;
        } else {
          return requestData.data.data;
        }
        break;
      default:
        return requestData.data.data;
    }

    return requestData.data.data.filter((item) => {
      const itemDate = new Date(item.createdAt);
      return itemDate >= startDate && itemDate <= endDate;
    });
  }, [requestData.data?.data, dateFilter, customDateRange]);

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
        subtitle="Consulter et gerez les besoins"
        color="red"
      />
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
        setDateFilter={setDateFilter}
        customDateRange={customDateRange}
        setCustomDateRange={setCustomDateRange}
        requestData={getFilteredData}
      />
    </div>
  );
};

export default Page;
