import { DataTable } from "@/components/base/data-table";
import { BesoinsTraiterTable } from "@/components/tables/besoins-traiter-table";
import { CommandeTable } from "@/components/tables/commande-table";
import { DepartementTable } from "@/components/tables/departement-table";
import { PaiementTable } from "@/components/tables/paiement-table";
import { ServiceTable } from "@/components/tables/service-table";
import { TicketsTable } from "@/components/tables/tickets-table";
import { UtilisateursTable } from "@/components/tables/utilisateurs-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import React from "react";

const serviceData = [
  {
    reference: "SRV-001",
    name: "Support Technique",
    description: "Assistance technique aux utilisateurs",
    chef: "Alice Moreau",
    nombreEmployes: 10,
    department: "IT & Infrastructure",
    chefDepartement: "Jean Michel Atangana",
    statut: "actif" as const,
  },
  {
    reference: "SRV-002",
    name: "Développement",
    description: "Développement d'applications et logiciels",
    chef: "Marc Lefebvre",
    nombreEmployes: 15,
    department: "IT & Infrastructure",
    chefDepartement: "Jean Michel Atangana",
    statut: "actif" as const,
  },
  {
    reference: "SRV-003",
    name: "Recrutement",
    description: "Gestion du recrutement et onboarding",
    chef: "Julie Petit",
    nombreEmployes: 5,
    department: "Ressources Humaines",
    chefDepartement: "Sophie Martin",
    statut: "actif" as const,
  },
  {
    reference: "SRV-004",
    name: "Formation",
    description: "Formation continue des employés",
    chef: "Paul Girard",
    nombreEmployes: 7,
    department: "Ressources Humaines",
    chefDepartement: "Sophie Martin",
    statut: "en-reorganisation" as const,
  },
  {
    reference: "SRV-005",
    name: "Comptabilité Générale",
    description: "Gestion de la comptabilité générale",
    chef: "Isabelle Blanc",
    nombreEmployes: 5,
    department: "Comptabilité",
    chefDepartement: "Pierre Dubois",
    statut: "actif" as const,
  },
  {
    reference: "SRV-006",
    name: "Paie",
    description: "Gestion de la paie et des salaires",
    chef: "François Roux",
    nombreEmployes: 3,
    department: "Comptabilité",
    chefDepartement: "Pierre Dubois",
    statut: "inactif" as const,
  },
];

const ServicesPage = () => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col">
        <div className="flex justify-between">
          <h2>Services</h2>
        </div>
        <ServiceTable data={serviceData} />
      </div>
    </div>
  );
};

export default ServicesPage;
