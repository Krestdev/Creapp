"use client";

import Empty from "@/components/base/empty";
import { BesoinsTraiter } from "@/components/besoin/besoin-traiter";
import { CategoryQueries } from "@/queries/categoryModule";
import { CommandRqstQueries } from "@/queries/commandRqstModule";
import { RequestQueries } from "@/queries/requestModule";
import { RequestModelT } from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import React, { Dispatch, SetStateAction } from "react";

interface Request {
  id: number;
  name: string;
  dueDate?: Date;
}

interface Props {
  selected: Request[];
  setSelected: Dispatch<SetStateAction<Request[]>>;
  dataSup?: RequestModelT[];
}

const Besoins = ({ selected, setSelected, dataSup = [] }: Props) => {
  const command = new CommandRqstQueries();
  const request = new RequestQueries();
  const category = new CategoryQueries();

  const commandData = useQuery({
    queryKey: ["commands"],
    queryFn: async () => command.getAll(),
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const requestData = useQuery({
    queryKey: ["requests"],
    queryFn: () => request.getAll(),
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const categoriesData = useQuery({
    queryKey: ["categories"],
    queryFn: async () => category.getCategories(),
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  // Filtrer les données avec useMemo
  const filteredData = React.useMemo(() => {
    const allRequests = requestData.data?.data ?? [];
    const cotation = commandData.data?.data ?? [];

    // IDs des besoins déjà dans des commandes
    const besoinCommandes = cotation.flatMap(
      (item) => item.besoins?.flatMap((b) => b.id) ?? []
    );

    // IDs des besoins dans dataSup
    const dataSupIds = new Set(dataSup.map((d) => d.id));

    // Filtrer les besoins disponibles
    const availableRequests = allRequests.filter((item) => {
      const isValidated = item.state === "validated";
      const notInCommand = !besoinCommandes.includes(item.id);
      const notInDataSup = !dataSupIds.has(item.id);
      return isValidated && notInCommand && notInDataSup;
    });

    // Combiner avec les besoins déjà sélectionnés (dataSup)
    return [...availableRequests, ...dataSup];
  }, [requestData.data?.data, commandData.data?.data, dataSup]);

  return (
    <div className="flex flex-col gap-4">
      {filteredData.length > 0 ? (
        <div className="flex flex-col">
          <BesoinsTraiter
            data={filteredData.filter(x => x.categoryId !== 0)}
            selected={selected}
            setSelected={setSelected}
            categories={categoriesData.data?.data ?? []}
          />
        </div>
      ) : (
        <Empty message={"Aucune donnée à afficher"} />
      )}
    </div>
  );
};

export default Besoins;
