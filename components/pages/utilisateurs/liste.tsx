"use client";
import { DataTable } from "@/components/base/data-table";
import { BesoinsTraiterTable } from "@/components/tables/besoins-traiter-table";
import { CommandeTable } from "@/components/tables/commande-table";
import { PaiementTable } from "@/components/tables/paiement-table";
import { TicketsTable } from "@/components/tables/tickets-table";
import { UtilisateursTable } from "@/components/tables/utilisateurs-table";
import { Button } from "@/components/ui/button";
import { useStore } from "@/providers/datastore";
import { UserQueries } from "@/queries/baseModule";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import React from "react";

const UserListPage = () => {
  const { isHydrated } = useStore();
  const user = new UserQueries();
  const userData = useQuery({
    queryKey: ["usersList"],
    queryFn: () => user.getAll(),
    enabled: isHydrated,
  });

  if (userData.data)
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col">
          <div className="flex justify-between">
            <h2>Utilisateurs</h2>
          </div>
          <UtilisateursTable data={userData.data.data} />
        </div>
      </div>
    );
};

export default UserListPage;
