"use client";

import Empty from "@/components/base/empty";
import { BesoinsTraiter } from "@/components/tables/besoin-traiter";
import { CommandQueries } from "@/queries/commandModule";
import { RequestQueries } from "@/queries/requestModule";
import { useQuery } from "@tanstack/react-query";
import { Dispatch, SetStateAction } from "react";

interface Request {
  id: number;
  name: string;
  dueDate?: Date;
}
interface Props {
  selected: Request[];
  setSelected: Dispatch<SetStateAction<Request[]>>;
}

const Besoins = ({ selected, setSelected }: Props) => {
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

  const categoriesData = useQuery({
    queryKey: ["categories"],
    queryFn: async () => request.getCategories(),
  });

  const cotation = commandData.data?.data ?? [];

  const besoinCommandes =
    cotation.flatMap((item) => item.besoins?.flatMap((b) => b.id)) ?? [];
  const filteredData =
    requestData.data?.data.filter(
      (item) => item.state === "validated" && !besoinCommandes.includes(item.id)
    ) ?? [];

  return (
    <div className="flex flex-col gap-4">
      {filteredData.length > 0 ? (
        <div className="flex flex-col">
          <BesoinsTraiter
            data={filteredData}
            selected={selected}
            setSelected={setSelected}
            categories={categoriesData.data?.data ?? []}
          />
        </div>
      ) : (
        <Empty message={"Aucune donnée a afficher"} />
      )}
    </div>
  );
};

export default Besoins;
