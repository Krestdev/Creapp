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

const paiementData = [
  {
    id: "1",
    reference: "PAY-001",
    bonDeCommande: "BC-001",
    fournisseur: "Tech Solutions",
    montant: 3000000,
    date: "2025-09-15",
    priorite: "high" as const,
    statut: "completed" as const,
  },
  {
    id: "2",
    reference: "PAY-002",
    bonDeCommande: "BC-002",
    fournisseur: "Office Supplies Co",
    montant: 750000,
    date: "2025-09-20",
    priorite: "medium" as const,
    statut: "pending" as const,
  },
  {
    id: "3",
    reference: "PAY-003",
    bonDeCommande: "BC-003",
    fournisseur: "Safety First",
    montant: 1000000,
    date: "2025-09-18",
    priorite: "urgent" as const,
    statut: "processing" as const,
  },
  {
    id: "4",
    reference: "PAY-004",
    bonDeCommande: "BC-004",
    fournisseur: "Furniture Plus",
    montant: 500000,
    date: "2025-09-10",
    priorite: "low" as const,
    statut: "failed" as const,
  },
];

const Tickets = () => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col">
        <div className="flex justify-between">
          <h2>Tickets</h2>
        </div>
        <TicketsTable data={ticketsData} />
      </div>
      <div className="flex flex-col">
        <div className="flex justify-between">
          <h2>Paiements</h2>
        </div>
        <PaiementTable data={paiementData} />
      </div>
    </div>
  );
};

export default Tickets;
