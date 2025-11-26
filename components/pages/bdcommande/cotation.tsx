"use client";

import { CommandeTable } from "@/components/tables/commande-table";
import { CommandQueries } from "@/queries/commandModule";
import { useQuery } from "@tanstack/react-query";

const Cotation = () => {
  const command = new CommandQueries();
  const commandData = useQuery({
    queryKey: ["commands"],
    queryFn: async () => command.getAll(),
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col">
        <CommandeTable data={commandData.data?.data} />
      </div>
    </div>
  );
};

export default Cotation;
