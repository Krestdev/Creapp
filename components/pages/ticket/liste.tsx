import { TicketsTable } from "@/components/tables/tickets-table";
import { TicketsData } from "@/types/types";
import React from "react";

const ticketsData: TicketsData[] = [
  {
    id: "1",
    reference: "TKT-001",
    fournisseur: "Tech Solutions",
    bonDeCommande: "BC-001",
    montant: 5000000,
    priorite: "high" as const,
    moyenPaiement: "",
    comptePayeur: "",
    state: "pending",
    createdAt: new Date("2025-02-24"),
    updatedAt: new Date("2025-02-24")
  },
  {
    id: "2",
    reference: "TKT-002",
    fournisseur: "Office Supplies Co",
    bonDeCommande: "BC-002",
    montant: 750000,
    priorite: "medium" as const,
    moyenPaiement: "",
    comptePayeur: "",
    state: "pending",
    createdAt: new Date("2025-02-24"),
    updatedAt: new Date("2025-02-24")
  },
  {
    id: "3",
    reference: "TKT-003",
    fournisseur: "Safety First",
    bonDeCommande: "BC-003",
    montant: 2500000,
    priorite: "urgent" as const,
    moyenPaiement: "",
    comptePayeur: "",
    state: "pending",
    createdAt: new Date("2025-02-24"),
    updatedAt: new Date("2025-02-24")
  },
];

const Liste = () => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col">
        <div className="flex justify-between">
          <h2>Tickets</h2>
        </div>
        <TicketsTable data={ticketsData} isAdmin={false} />
      </div>
    </div>
  );
};

export default Liste;
