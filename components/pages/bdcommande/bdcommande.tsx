import { DataTable } from "@/components/base/data-table";
import { BesoinsTraiterTable } from "@/components/tables/besoins-traiter-table";
import { CommandeTable } from "@/components/tables/commande-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import React from "react";

export const commandeData = [
  {
    id: "1",
    reference: "CMD-001",
    statut: "pending",
    titre: "Achat de matériel informatique",
    bonDeCommande: "BC-2025-001",
    author: "BONFOU Jacques",
    besoins: [
      {
        ref: "B-001",
        title: "Ordinateur Architecte FANDO",
        qte: 1,
      },
      {
        ref: "B-002",
        title: "Ordinateur Comptable Loïc",
        qte: 1,
      }
    ],
    datelimite: "22 Octobre 2025",
    createdAt: "12 septembre 2025",
    updatedAt: "12 septembre 2025 ",
  },
  {
    id: "2",
    reference: "CMD-002",
    statut: "pending",
    titre: "Fournitures de bureau",
    bonDeCommande: "BC-2025-002",
    author: "BONFOU Jacques",
    besoins: [
      {
        title: "Fournitures de bureau",
        qte: 2,
      },
    ],
    datelimite: "22 Octobre 2025",
    createdAt: "12 septembre 2025",
    updatedAt: "12 septembre 2025 ",
  },
  {
    id: "3",
    reference: "CMD-003",
    statut: "pending",
    titre: "Équipement de sécurité",
    bonDeCommande: "BC-2025-003",
    author: "BONFOU Jacques",
    besoins: [
      {
        title: "Fournitures de bureau",
        qte: 2,
      },
    ],
    datelimite: "22 Octobre 2025",
    createdAt: "12 septembre 2025",
    updatedAt: "12 septembre 2025 ",
  },
];

const besoinsTraiterData = [
  {
    id: "1",
    titre: "Casque de protection",
    projet: "Mediatech",
    categorie: "Matériel technique & logistique",
    emetteur: "Jean Michel Atangana",
    beneficiaires: "Jean Michel Atangana, Marie Dupont",
  },
  {
    id: "2",
    titre: "Ordinateurs portables",
    projet: "IT Infrastructure",
    categorie: "Informatique",
    emetteur: "Sophie Martin",
    beneficiaires: "Équipe développement",
  },
  {
    id: "3",
    titre: "Mobilier de bureau",
    projet: "Aménagement",
    categorie: "Mobilier",
    emetteur: "Pierre Dubois",
    beneficiaires: "Tous les employés",
  },
];

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

const bonsCommandePaiementData = [
  {
    id: "1",
    reference: "BCP-001",
    fournisseur: "Tech Solutions",
    titre: "Matériel informatique",
    montant: 5000000,
    priorite: "high" as const,
  },
  {
    id: "2",
    reference: "BCP-002",
    fournisseur: "Office Supplies Co",
    titre: "Fournitures bureau",
    montant: 750000,
    priorite: "medium" as const,
  },
  {
    id: "3",
    reference: "BCP-003",
    fournisseur: "Safety First",
    titre: "Équipement sécurité",
    montant: 2500000,
    priorite: "urgent" as const,
  },
];

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
    statut: "completed" as const,
  },
  {
    id: "2",
    reference: "PAY-002",
    bonDeCommande: "BC-002",
    fournisseur: "Office Supplies Co",
    montant: 750000,
    date: "2025-09-20",
    statut: "pending" as const,
  },
  {
    id: "3",
    reference: "PAY-003",
    bonDeCommande: "BC-003",
    fournisseur: "Safety First",
    montant: 1000000,
    date: "2025-09-18",
    statut: "processing" as const,
  },
  {
    id: "4",
    reference: "PAY-004",
    bonDeCommande: "BC-004",
    fournisseur: "Furniture Plus",
    montant: 500000,
    date: "2025-09-10",
    statut: "failed" as const,
  },
];

const Bdcommande = () => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col">
        <div className="flex justify-between">
          <h2>Commandes</h2>
        </div>
        <CommandeTable data={commandeData} />
      </div>
      <div className="flex flex-col">
        <div className="flex justify-between">
          <h2>{"En attente d'approbation"}</h2>
          <Button>
            Créer une commande <Plus />
          </Button>
        </div>
        {/* <BesoinsTraiterTable data={data} /> */}
      </div>
    </div>
  );
};

export default Bdcommande;
