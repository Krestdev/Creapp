import { DataTable } from "@/components/base/data-table";
import { BesoinsTraiterTable } from "@/components/tables/besoins-traiter-table";
import { BonsCommandeTable } from "@/components/tables/bons-commande-table";
import { CommandeTable } from "@/components/tables/commande-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import React from "react";

const bonsCommandeData = [
  {
    id: "1",
    reference: "BC-001",
    titre: "Matériel informatique",
    fournisseur: "Tech Solutions",
    priorite: "high" as const,
    statut: "approved" as const,
  },
  {
    id: "2",
    reference: "BC-002",
    titre: "Fournitures bureau",
    fournisseur: "Office Supplies Co",
    priorite: "medium" as const,
    statut: "pending" as const,
  },
  {
    id: "3",
    reference: "BC-003",
    titre: "Équipement sécurité",
    fournisseur: "Safety First",
    priorite: "urgent" as const,
    statut: "in-review" as const,
  },
  {
    id: "4",
    reference: "BC-004",
    titre: "Mobilier",
    fournisseur: "Furniture Plus",
    priorite: "low" as const,
    statut: "rejected" as const,
  },
];

const CommandeBd = () => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col">
        <div className="flex justify-between">
          <h2>Commandes</h2>
        </div>
        <BonsCommandeTable data={bonsCommandeData} />
      </div>
    </div>
  );
};

export default CommandeBd;
