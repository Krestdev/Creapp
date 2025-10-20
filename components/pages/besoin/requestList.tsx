import { DataTable } from "@/components/base/data-table";
import React from "react";

const RequestList = () => {
  return (
    <div className="flex flex-col">
      <h2>Mes besoins recents</h2>
      <DataTable />
    </div>
  );
};

export default RequestList;
