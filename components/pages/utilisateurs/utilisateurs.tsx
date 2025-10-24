import { DataTable } from "@/components/base/data-table";
import { BesoinsTraiterTable } from "@/components/tables/besoins-traiter-table";
import { CommandeTable } from "@/components/tables/commande-table";
import { PaiementTable } from "@/components/tables/paiement-table";
import { TicketsTable } from "@/components/tables/tickets-table";
import { UtilisateursTable } from "@/components/tables/utilisateurs-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import React from "react";

const utilisateursData = [
  {
    id: "1",
    nom: "Jean Michel Atangana",
    role: "admin" as const,
    statut: "active" as const,
    derniereConnexion: "2025-01-22T14:30:00",
    serviceAssocie: "IT & Infrastructure",
  },
  {
    id: "2",
    nom: "Sophie Martin",
    role: "manager" as const,
    statut: "active" as const,
    derniereConnexion: "2025-01-22T09:15:00",
    serviceAssocie: "Ressources Humaines",
  },
  {
    id: "3",
    nom: "Pierre Dubois",
    role: "user" as const,
    statut: "inactive" as const,
    derniereConnexion: "2025-01-20T16:45:00",
    serviceAssocie: "Comptabilité",
  },
  {
    id: "4",
    nom: "Marie Dupont",
    role: "user" as const,
    statut: "active" as const,
    derniereConnexion: "2025-01-22T11:20:00",
    serviceAssocie: "Marketing",
  },
  {
    id: "5",
    nom: "Thomas Bernard",
    role: "viewer" as const,
    statut: "suspended" as const,
    derniereConnexion: "2025-01-15T08:30:00",
    serviceAssocie: "Logistique",
  },
  {
    id: "6",
    nom: "Claire Rousseau",
    role: "manager" as const,
    statut: "active" as const,
    derniereConnexion: "2025-01-22T13:00:00",
    serviceAssocie: "Achats",
  },
];

const UtilisateursPage = () => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col">
        <div className="flex justify-between">
          <h2>Utilisateurs</h2>
        </div>
        <UtilisateursTable data={utilisateursData} />
      </div>
    </div>
  );
};

export default UtilisateursPage;
