import { DataTable } from "@/components/base/data-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import React from "react";

const Besoins = () => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col">
        <div className="flex justify-between">
          <h2>En attente d'approbation</h2>
          <Button>
            Créer une commande <Plus />
          </Button>
        </div>
        <DataTable />
      </div>
    </div>
  );
};

export default Besoins;
