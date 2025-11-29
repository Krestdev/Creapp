"use client";

import { DataTable } from "@/components/base/data-table";
import StatsCard from "@/components/base/StatsCard";
import PageTitle from "@/components/pageTitle";
import { useStore } from "@/providers/datastore";
import { DepartmentQueries } from "@/queries/departmentModule";
import { RequestQueries } from "@/queries/requestModule";
import { RequestModelT } from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import React from "react";

function Page() {
  const { user, isHydrated } = useStore();
  const links = [
    { title: "Creer un besoin", href: "/tableau-de-bord/besoins/create" },
    { title: "Mes Besoins", href: "/tableau-de-bord/besoins/mylist" },
    { title: "Approbation", href: "/tableau-de-bord/besoins/approbation" },
  ];

  const [data, setData] = React.useState<RequestModelT[]>([]);
  const request = new RequestQueries();
  // Récupérer tous les besoins en attente de validation (pour les validateurs)
  const requestData = useQuery({
    queryKey: ["requests-validation"],
    queryFn: () => {
      return request.getAll();
    },
    enabled: isHydrated,
  });

  const department = new DepartmentQueries();
  const departmentData = useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      return department.getAll();
    },
  });

  const isLastValidator =
    departmentData.data?.data
      .flatMap((mem) => mem.members)
      .find((mem) => mem.userId === user?.id)?.finalValidator === true;

  // afficher les element a valider en fonction du validateur
  React.useEffect(() => {
    if (requestData.data?.data && user) {
      const show = requestData.data?.data
        .filter((x) => x.state === "pending")
        .filter((item) => {
          // Récupérer la liste des IDs des validateurs pour ce departement
          const validatorIds = departmentData.data?.data
            .flatMap((x) => x.members)
            .filter((x) => x.validator === true)
            .map((x) => x.userId);

          if (isLastValidator) {
            return validatorIds?.every((id) =>
              item.revieweeList?.flatMap((x) => x.validatorId).includes(id)
            );
          } else {
            return (
              !item.revieweeList
                ?.flatMap((x) => x.validatorId)
                .includes(user?.id!) && item.state === "pending"
            );
          }
        });
      setData(show);
    }
  }, [
    requestData.data?.data,
    user,
    isLastValidator,
    departmentData.data?.data,
  ]);

  const reçus = requestData.data?.data.length ?? 0;
  const reçusMois =
    requestData.data?.data.filter(
      (item) => new Date(item.createdAt).getMonth() === new Date().getMonth()
    ).length ?? 0;
  const attentes = data.filter((item) => item.state === "pending").length ?? 0;
  const mine = data.filter((item) => item.userId === user?.id).length ?? 0;

  if (!isHydrated) return null;
  return (
    <div className="flex flex-col gap-6">
      {/* page title */}
      <PageTitle
        title="Besoins"
        subtitle="Consulter et gerez les besoins"
        color="red"
        links={links.filter(
          (x) =>
            !(
              x.title === "Approbation" &&
              !user?.role.flatMap((r) => r.label).includes("MANAGER")
            )
        )}
      />
      {user?.role.flatMap((r) => r.label).includes("MANAGER") && (
        <div className="flex flex-row flex-wrap md:grid md:grid-cols-4 gap-2 md:gap-5">
          <StatsCard
            title="En attente de validation"
            titleColor="text-[#E4E4E7]"
            value={String(attentes)}
            description="Mes besoins en attente :"
            descriptionValue={String(mine)}
            descriptionColor="red"
            dividerColor="bg-[#2262A2]"
            className={"bg-[#013E7B] text-[#ffffff] border-[#2262A2]"}
            dvalueColor="text-[#FFFFFF]"
          />
          <StatsCard
            title="Total besoins recus"
            titleColor="text-[#52525B]"
            value={String(reçus)}
            description="Besoins reçus ce mois :"
            descriptionValue={String(reçusMois)}
            descriptionColor="text-[#A1A1AA]"
            dividerColor="bg-[#DFDFDF]"
            className={"bg-[#FFFFFF] text-[#000000] border-[#DFDFDF]"}
            dvalueColor="text-[#000000]"
          />
        </div>
      )}
      {/* Page table */}
      <DataTable />
    </div>
  );
}

export default Page;
