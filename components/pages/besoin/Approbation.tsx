import { DataValidation } from "@/components/base/dataValidation";
import React from "react";

const Approbation = () => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col">
        <h2>Liste des besoins à valider</h2>
        <DataValidation />
      </div>
    </div>
  );
};

export default Approbation;
