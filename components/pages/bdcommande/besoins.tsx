"use client";

import Empty from "@/components/base/empty";
import { BesoinsTraiterTable } from "@/components/tables/besoins-traiter-table";
import { Button } from "@/components/ui/button";
import { CommandQueries } from "@/queries/commandModule";
import { RequestQueries } from "@/queries/requestModule";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

const Besoins = () => {
  const router = useRouter();
  const command = new CommandQueries();
  const request = new RequestQueries();

  const commandData = useQuery({
    queryKey: ["commands"],
    queryFn: async () => command.getAll(),
  });

  const requestData = useQuery({
    queryKey: ["requests"],
    queryFn: () => request.getAll(),
  });

  const cotation = commandData.data?.data ?? [];

  // Filtrer les besoins a traiter de telle sorte que que seul ceux qui sont validé et pas dans une command.request soit affiché
  const besoinCommandes =
    cotation.flatMap((item) => item.besoins?.flatMap((b) => b.id)) ?? [];
  const filteredData =
    requestData.data?.data.filter(
      (item) => item.state === "validated" && !besoinCommandes.includes(item.id)
    ) ?? [];

  return (
    <div className="flex flex-col gap-4">
      {filteredData.length > 0 ? 
      <div className="flex flex-col">
        <div className="flex justify-end">
          <Button
            onClick={() =>
              router.push("/tableau-de-bord/bdcommande/cotation/creer")
            }
          >
            {"Créer une commande"}
            <Plus />
          </Button>
        </div>
        <BesoinsTraiterTable data={filteredData} />
      </div> : 
      <Empty message={"Aucune donnée a afficher"} />
      }
    </div>
  );
};

export default Besoins;
