"use client";

import { DataTable } from "@/components/base/data-table";
import React from "react";

const RequestList = () => {
  const [dateFilter, setDateFilter] = React.useState<
    "today" | "week" | "month" | "year" | "custom" | undefined
  >();
  const [customDateRange, setCustomDateRange] = React.useState<
    { from: Date; to: Date } | undefined
  >();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col">
        <h2 className="text-black">Mes besoins recents</h2>
        <DataTable
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
          customDateRange={customDateRange}
          setCustomDateRange={setCustomDateRange}
        />
      </div>
    </div>
  );
};

export default RequestList;
