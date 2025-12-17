"use client";

import Empty from "@/components/base/empty";
import { CommandeTable } from "@/components/tables/commande-table";
import { CommandRqstQueries } from "@/queries/commandRqstModule";
import { RequestQueries } from "@/queries/requestModule";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import React from "react";

const Bdcommande = () => {
  const [dateFilter, setDateFilter] = React.useState<
    "today" | "week" | "month" | "year" | "custom" | undefined
  >();
  // const router = useRouter();
  const request = new RequestQueries();
  const command = new CommandRqstQueries();

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
      {/* <div className="flex flex-row flex-wrap md:grid md:grid-cols-4 gap-2 md:gap-5">
        <StatsCard
          title="Bons de commande"
          titleColor="text-[#E4E4E7]"
          value={String(0)}
          description="En attente de réception :"
          descriptionValue={String(0)}
          descriptionColor="text-[#E4E4E7]"
          dividerColor="bg-[#2262A2]"
          className={"bg-[#013E7B] text-[#FFFFFF] border border-[#2262A2]"}
          dvalueColor="text-[#FFFFFF]"
        />
        <StatsCard
          title="Besoins à traiter"
          titleColor="text-[#E4E4E7]"
          value={String(filteredData.length)}
          description="Besoins traités :"
          descriptionValue={String(
            (requestData.data?.data.length ?? 0) - filteredData.length
          )}
          descriptionColor="text-[#E4E4E7]"
          dividerColor="bg-[#EB88B4]"
          className={"bg-[#9E1351] text-[#FFFFFF] border border-[#EB88B4]"}
          dvalueColor="text-[#FFFFFF]"
        />
        <StatsCard
          title="Devis"
          titleColor="text-[#E4E4E7]"
          value={String(filteredData.length)}
          description="En attente :"
          descriptionValue={String(
            (requestData.data?.data.length ?? 0) - filteredData.length
          )}
          descriptionColor="text-[#E4E4E7]"
          dividerColor="bg-[#DFDFDF]"
          className={"bg-[#18181B] text-[#FFFFFF] border border-[#DFDFDF]"}
          dvalueColor="text-[#FFFFFF]"
        />
        <StatsCard
          title="Factures"
          titleColor="text-[#52525B]"
          value={String(filteredData.length)}
          description="En attente de paiement :"
          descriptionValue={String(
            (requestData.data?.data.length ?? 0) - filteredData.length
          )}
          descriptionColor="text-[#52525B]"
          dividerColor="bg-[#DFDFDF]"
          className={"bg-[#FFFFFF] text-[#000000] border border-[#DFDFDF]"}
          dvalueColor="text-[#2F2F2F]"
        />
      </div> */}
      {cotation.length > 0 && (
        <div className="flex flex-col">
          <div className="flex justify-between">
            <h2>{"Demandes de cotation"}</h2>
          </div>
          <CommandeTable
            data={commandData.data?.data}
            dateFilter={dateFilter}
            setDateFilter={setDateFilter}
          />
        </div>
      )}
      {filteredData.length === 0 && cotation.length === 0 && (
        <Empty message={"Aucune donnée a afficher"} />
      )}
    </div>
  );
};

export default Bdcommande;
