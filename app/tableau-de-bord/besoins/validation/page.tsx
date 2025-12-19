"use client";

import Approb from "@/components/besoin/Approb";
import PageTitle from "@/components/pageTitle";
import useAuthGuard from "@/hooks/useAuthGuard";
import React from "react";

const Page = () => {
  const { hasAccess, isChecking } = useAuthGuard({
    authorizedRoles: ["ADMIN", "MANAGER"],
  });
  
  // État pour tous les filtres
  const [dateFilter, setDateFilter] = React.useState<
    "today" | "week" | "month" | "year" | "custom" | undefined
  >(undefined);
  const [customDateRange, setCustomDateRange] = React.useState<
    { from: Date; to: Date } | undefined
  >(undefined);

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
      <Approb 
        dateFilter={dateFilter} 
        setDateFilter={setDateFilter}
        customDateRange={customDateRange}
        setCustomDateRange={setCustomDateRange}
      />
    </div>
  );
};

export default Page;