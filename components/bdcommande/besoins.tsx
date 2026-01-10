"use client";

import Empty from "@/components/base/empty";
import { BesoinsTraiter } from "@/components/besoin/besoin-traiter";
import { categoryQ } from "@/queries/categoryModule";
import { commandRqstQ } from "@/queries/commandRqstModule";
import { requestQ } from "@/queries/requestModule";
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
  isHome?: boolean;
}

const Besoins = ({
  selected,
  setSelected,
  dataSup = [],
  isHome = false,
}: Props) => {
  const commandData = useQuery({
    queryKey: ["commands"],
    queryFn: async () => commandRqstQ.getAll(),
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const requestData = useQuery({
    queryKey: ["requests"],
    queryFn: () => requestQ.getAll(),
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const categoriesData = useQuery({
    queryKey: ["categories"],
    queryFn: async () => categoryQ.getCategories(),
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
            data={filteredData.filter((x) => x.categoryId !== 0)}
            selected={selected}
            setSelected={setSelected}
            categories={categoriesData.data?.data ?? []}
            isHome={isHome}
          />
        </div>
      ) : (
        <Empty message={"Aucune donnée à afficher"} />
      )}
    </div>
  );
};

export default Besoins;
