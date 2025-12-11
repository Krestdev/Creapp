"use client";

import Approbation from "@/components/besoin/Approbation";
import PageTitle from "@/components/pageTitle";
import useAuthGuard from "@/hooks/useAuthGuard";
import React from "react";

const Page = () => {
  const { hasAccess, isChecking } = useAuthGuard({
    authorizedRoles: ["ADMIN", "MANAGER"],
  });
  const [dateFilter, setDateFilter] = React.useState<
    "today" | "week" | "month" | "year" | "custom" | undefined
  >();
  // const [customDateRange, setCustomDateRange] = React.useState<
  //   { from: Date; to: Date } | undefined
  // >();

  if (isChecking) {
    return <div>Chargement...</div>;
  }

  if (!hasAccess) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6">
      {/* page title */}
      <PageTitle
        title="Validation des besoins"
        subtitle="Soumettez ou rejetez les besoins."
        color="green"
      />
      <Approbation dateFilter={dateFilter} setDateFilter={setDateFilter} />
    </div>
  );
};

export default Page;
