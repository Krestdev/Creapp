import { DataTable } from "@/components/base/data-table";
import React from "react";

const RequestList = () => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col">
        <h2>En attente d'approbation</h2>
        <DataTable />
      </div>
      <div className="flex flex-col">
        <h2>Mes besoins recents</h2>
        <DataTable />
      </div>
    </div>
  );
};

export default RequestList;
