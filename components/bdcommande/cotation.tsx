"use client";

import { CommandeTable } from "@/components/tables/commande-table";
import { CommandRqstQueries } from "@/queries/commandRqstModule";
import { useQuery } from "@tanstack/react-query";
import React from "react";

const Cotation = () => {
  const [dateFilter, setDateFilter] = React.useState<
    "today" | "week" | "month" | "year" | "custom" | undefined
  >();

  const command = new CommandRqstQueries();
  const commandData = useQuery({
    queryKey: ["commands"],
    queryFn: async () => command.getAll(),
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col">
        <CommandeTable
          data={commandData.data?.data}
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
        />
      </div>
    </div>
  );
};

export default Cotation;
