"use client";

import StatsCard from "@/components/base/StatsCard";
import RequestList from "@/components/pages/besoin/RequestListPage";
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

  const soumis = requestData.data?.data.length ?? 0;
  const soumisMois =
    requestData.data?.data.filter(
      (item) => new Date(item.createdAt).getMonth() === new Date().getMonth()
    ).length ?? 0;
  const attentes =
    requestData.data?.data.filter((item) => item.state === "pending").length ??
    0;
  const rejetes =
    requestData.data?.data.filter((item) => item.state === "rejected").length ??
    0;
  return (
    <div className="flex flex-col gap-6">
      {/* page title */}
      <PageTitle
        title="Mes Besoins"
        subtitle="Consulter et gerez les besoins"
        color="red"
      />
      <div className="flex flex-row flex-wrap md:grid md:grid-cols-4 gap-2 md:gap-5">
        {/* Statistics cards could go here in the future */}
        <StatsCard
          title="Total besoins soumis"
          titleColor="text-[#E4E4E7]"
          value={String(soumis)}
          description="Besoins soumis ce mois :"
          descriptionValue={String(soumisMois)}
          descriptionColor="red"
          dividerColor="bg-[#2262A2]"
          className={"bg-[#013E7B] text-[#ffffff] border-[#2262A2]"}
          dvalueColor="text-[#FFFFFF]"
        />
        <StatsCard
          title="En attente de validation"
          titleColor="text-[#52525B]"
          value={String(attentes)}
          description="Besoins rejetés :"
          descriptionValue={String(rejetes)}
          descriptionColor="text-[#A1A1AA]"
          dividerColor="bg-[#DFDFDF]"
          className={"bg-[#FFFFFF] text-[#000000] border-[#DFDFDF]"}
          dvalueColor="text-[#DC2626]"
        />
      </div>
      {/* Page table */}
      <RequestList />
    </div>
  );
};

export default Page;
