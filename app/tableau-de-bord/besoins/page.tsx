"use client";

import { DataTable } from "@/components/base/data-table";
import StatsCard from "@/components/base/StatsCard";
import PageTitle from "@/components/pageTitle";
import { Button } from "@/components/ui/button";
import { useStore } from "@/providers/datastore";
import { DepartmentQueries } from "@/queries/departmentModule";
import { RequestQueries } from "@/queries/requestModule";
import { RequestModelT } from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import React from "react";

function Page() {
  const { user, isHydrated } = useStore();
  const [dateFilter, setDateFilter] = React.useState<
    "today" | "week" | "month" | "year" | "custom" | undefined
  >();
  const [customDateRange, setCustomDateRange] = React.useState<
    { from: Date; to: Date } | undefined
  >();

  const links:Array<{title: string; href: string;}> = [
    { title: "Creer un besoin", href: "/tableau-de-bord/besoins/create" },
    { title: "Mes Besoins", href: "/tableau-de-bord/besoins/mylist" },
    { title: "Approbation", href: "/tableau-de-bord/besoins/approbation" },
  ];

  const request = new RequestQueries();

  const requestData = useQuery({
    queryKey: ["requests-validation"],
    queryFn: () => request.getAll(),
    enabled: isHydrated,
  });

  const department = new DepartmentQueries();

  const departmentData = useQuery({
    queryKey: ["departments"],
    queryFn: () => department.getAll(),
  });

  const isLastValidator =
    departmentData.data?.data
      .flatMap((mem) => mem.members)
      .find((mem) => mem.userId === user?.id)?.finalValidator === true;

  // -------------------------------------------------
  // FILTER BY DATE — MEMOIZED (IMPORTANT)
  // -------------------------------------------------
  const filteredData = React.useMemo(() => {
    if (!requestData.data?.data) return [];

    const data = requestData.data.data;

    if (!dateFilter) return data;

    const now = new Date();
    let startDate = new Date();

    switch (dateFilter) {
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
    }

    return data.filter((item) => {
      const itemDate = new Date(item.createdAt);
      return itemDate >= startDate && itemDate <= now;
    });
  }, [requestData.data?.data, dateFilter]);

  // -------------------------------------------------
  // VALIDATION LOGIC
  // -------------------------------------------------

  const [data, setData] = React.useState<RequestModelT[]>([]);

  React.useEffect(() => {
    if (!filteredData || !user || !departmentData.data?.data) return;

    const allMembers = departmentData.data.data.flatMap((x) => x.members);

    const validatorIds = allMembers
      .filter((x) => x.validator)
      .map((x) => x.userId);

    const show = filteredData
      .filter((x) => x.state === "pending")
      .filter((item) => {
        const reviewedIds =
          item.revieweeList?.flatMap((x) => x.validatorId) ?? [];

        if (isLastValidator) {
          return validatorIds.every((id) => reviewedIds.includes(id));
        } else {
          return !reviewedIds.includes(user.id!);
        }
      });

    setData(show);
  }, [filteredData, user, isLastValidator, departmentData.data?.data]);

  // -------------------------------------------------
  // STATS
  // -------------------------------------------------

  const reçus = filteredData.length;

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const reçusMois =
    filteredData.filter((item) => {
      const itemDate = new Date(item.createdAt);
      return (
        itemDate.getMonth() === currentMonth &&
        itemDate.getFullYear() === currentYear
      );
    }).length ?? 0;

  const attentes = data.filter((i) => i.state === "pending").length;

  const mine = data.filter((i) => i.userId === user?.id).length;

  if (!isHydrated) return null;

  return (
    <div className="flex flex-col gap-6">
      {/* page title */}
      <PageTitle
        title="Besoins"
        subtitle="Consulter et gérez les besoins"
        color="red"
      >
        {links
        .filter(
          (x) =>
            !(
              x.title === "Approbation" &&
              !user?.role.flatMap((r) => r.label).includes("MANAGER")
            )
        )
        .map((link, id)=>{
          const isLast = links.length > 1 ? false : id === links.length - 1;
          return (
          <Link key={id} href={link.href}>
            <Button size={"lg"} variant={isLast ? "accent" : "ghost"}>{link.title}</Button>
          </Link>
          )
        }
          )
        }
      </PageTitle>

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
            title="Total besoins reçus"
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

      {/* Table */}

      <DataTable
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
        customDateRange={customDateRange}
        setCustomDateRange={setCustomDateRange}
      />
    </div>
  );
}

export default Page;
