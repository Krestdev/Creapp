import { DataTable } from "@/components/base/data-table";
import { BesoinsTraiterTable } from "@/components/tables/besoins-traiter-table";
import { CommandeTable } from "@/components/tables/commande-table";
import { PaiementTable } from "@/components/tables/paiement-table";
import { TicketsTable } from "@/components/tables/tickets-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import React from "react";

const ticketsData = [
  {
    id: "1",
    reference: "TKT-001",
    fournisseur: "Tech Solutions",
    bonDeCommande: "BC-001",
    montant: 5000000,
    priorite: "high" as const,
    resteAPayer: 2000000,
  },
  {
    id: "2",
    reference: "TKT-002",
    fournisseur: "Office Supplies Co",
    bonDeCommande: "BC-002",
    montant: 750000,
    priorite: "medium" as const,
    resteAPayer: 0,
  },
  {
    id: "3",
    reference: "TKT-003",
    fournisseur: "Safety First",
    bonDeCommande: "BC-003",
    montant: 2500000,
    priorite: "urgent" as const,
    resteAPayer: 1500000,
  },
];

const Liste = () => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col">
        <div className="flex justify-between">
          <h2>Tickets</h2>
        </div>
        <TicketsTable data={ticketsData} />
      </div>
    </div>
  );
};

export default Liste;
