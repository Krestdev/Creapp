import { DataTable } from "@/components/base/data-table";
import { BesoinsTraiterTable } from "@/components/tables/besoins-traiter-table";
import { CommandeTable } from "@/components/tables/commande-table";
import { DepartementTable } from "@/components/tables/departement-table";
import { PaiementTable } from "@/components/tables/paiement-table";
import { TicketsTable } from "@/components/tables/tickets-table";
import { UtilisateursTable } from "@/components/tables/utilisateurs-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import React from "react";

const departementData = [
  {
    reference: "DEPT-001",
    name: "IT & Infrastructure",
    description: "Gestion des systèmes informatiques et infrastructure réseau",
    chef: "Jean Michel Atangana",
    nombreEmployes: 25,
    statut: "actif" as const,
  },
  {
    reference: "DEPT-002",
    name: "Ressources Humaines",
    description: "Gestion du personnel et développement des talents",
    chef: "Sophie Martin",
    nombreEmployes: 12,
    statut: "actif" as const,
  },
  {
    reference: "DEPT-003",
    name: "Comptabilité",
    description: "Gestion financière et comptable de l'entreprise",
    chef: "Pierre Dubois",
    nombreEmployes: 8,
    statut: "en-reorganisation" as const,
  },
  {
    reference: "DEPT-004",
    name: "Marketing",
    description: "Stratégie marketing et communication",
    chef: "Marie Dupont",
    nombreEmployes: 15,
    statut: "actif" as const,
  },
  {
    reference: "DEPT-005",
    name: "Logistique",
    description: "Gestion des approvisionnements et distribution",
    chef: "Thomas Bernard",
    nombreEmployes: 20,
    statut: "inactif" as const,
  },
];

const DepartementPage = () => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col">
        <div className="flex justify-between">
          <h2>Departement</h2>
        </div>
        <DepartementTable data={departementData} />
      </div>
    </div>
  );
};

export default DepartementPage;
