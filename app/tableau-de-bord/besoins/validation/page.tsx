"use client";

import {
  StatisticCard,
  StatisticProps,
} from "@/components/base/TitleValueCard";
import Approb from "@/components/besoin/Approb";
import LoadingPage from "@/components/loading-page";
import PageTitle from "@/components/pageTitle";
import useAuthGuard from "@/hooks/useAuthGuard";
import { useFetchQuery } from "@/hooks/useData";
import { useStore } from "@/providers/datastore";
import { categoryQ } from "@/queries/categoryModule";
import { RequestModelT } from "@/types/types";
import React from "react";

const Page = () => {
  const { hasAccess, isChecking } = useAuthGuard({
    authorizedRoles: ["ADMIN", "MANAGER"],
  });

  const { user } = useStore();

  const categoriesData = useFetchQuery(
    ["categories"],
    categoryQ.getCategories,
    15000
  );

  const validator = categoriesData.data?.data
    .find((c) => c.validators.some((v) => v.userId === user?.id))
    ?.validators.find((v) => v.userId === user?.id);

  // État pour tous les filtres
  const [dateFilter, setDateFilter] = React.useState<
    "today" | "week" | "month" | "year" | "custom" | undefined
  >(undefined);
  const [customDateRange, setCustomDateRange] = React.useState<
    { from: Date; to: Date } | undefined
  >(undefined);

  const [data, setData] = React.useState<RequestModelT[]>([]);

  // Calcul des statistiques à partir des données filtrées
  const pending = React.useMemo(() => {
    return data.filter((item) => item.state === "pending").length;
  }, [data]);

  const approved = React.useMemo(() => {
    return data.filter((item) => item.state === "validated").length;
  }, [data]);

  const received = React.useMemo(() => {
    return data.length;
  }, [data]);

  const rejected = React.useMemo(() => {
    return data.filter((item) => item.state === "rejected").length;
  }, [data]);

  if (isChecking) {
    return <LoadingPage />;
  }

  if (!hasAccess) {
    return null;
  }

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
      <Approb
        setData={setData}
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
        customDateRange={customDateRange}
        setCustomDateRange={setCustomDateRange}
      />
    </div>
  );
};

export default Page;
