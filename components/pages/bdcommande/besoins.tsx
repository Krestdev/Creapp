"use client";

import { BesoinsTraiterTable } from "@/components/tables/besoins-traiter-table";
import { Button } from "@/components/ui/button";
import { RequestQueries } from "@/queries/requestModule";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";

const Besoins = () => {
  const request = new RequestQueries();

  const requestData = useQuery({
    queryKey: ["requests"],
    queryFn: () => request.getAll(),
  });

  // Pas besoin de useState ni useEffect
  const filteredData =
    requestData.data?.data.filter((item) => item.state === "validated") ?? [];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col">
        <div className="flex justify-between">
          <h2>{"En attente d'approbation"}</h2>
          <Button>
            {"Créer une commande"}
            <Plus />
          </Button>
        </div>

        <BesoinsTraiterTable data={filteredData} />
      </div>
    </div>
  );
};

export default Besoins;
