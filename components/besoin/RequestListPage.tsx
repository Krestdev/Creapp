"use client";

import { DataTable, TableFilters } from "@/components/base/data-table";
import { RequestModelT } from "@/types/types";
import React from "react";

interface RequestListProps {
  dateFilter?: "today" | "week" | "month" | "year" | "custom" | undefined;
  setDateFilter: React.Dispatch<
    React.SetStateAction<
      "today" | "week" | "month" | "year" | "custom" | undefined
    >
  >;
  customDateRange:
    | {
        from: Date;
        to: Date;
      }
    | undefined;
  setCustomDateRange: React.Dispatch<
    React.SetStateAction<
      | {
          from: Date;
          to: Date;
        }
      | undefined
    >
  >;
  requestData: RequestModelT[] | undefined;
  
  // Nouveaux props pour tous les filtres
  filters?: TableFilters;
  setFilters?: React.Dispatch<React.SetStateAction<TableFilters>>;
}

const RequestList = ({
  dateFilter,
  setDateFilter,
  customDateRange,
  setCustomDateRange,
  requestData,
  filters,
  setFilters,
}: RequestListProps) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col">
        <DataTable
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
          customDateRange={customDateRange}
          setCustomDateRange={setCustomDateRange}
          requestData={requestData}
          filters={filters}
          setFilters={setFilters}
        />
      </div>
    </div>
  );
};

export default RequestList;