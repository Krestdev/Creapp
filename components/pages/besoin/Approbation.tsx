import { DataTable } from "@/components/base/data-table";
import React from "react";

const Approbation = () => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col">
        <h2>Liste des besoins a Valider</h2>
        <DataTable />
      </div>
    </div>
  );
};

export default Approbation;
