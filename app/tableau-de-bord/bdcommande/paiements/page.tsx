import PageTitle from "@/components/pageTitle";
import { PaiementsTable } from "@/components/tables/PaiementsTable";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export type Paiement = {
  id: string;
  reference: string;
  title: string;
  bonDeCommande: string;
  fournisseur: string;
  montant: number;
  moyen: string;
  priorite: "urgent" | "high" | "medium" | "low";
  statut: "pending" | "completed" | "failed" | "processing";
  dueDate: Date;
  createdAt: Date;
  updatedAt: Date;
};

const paiementsData: Paiement[] = [
  {
    id: "1",
    reference: "BCP-001",
    title: "Matériel informatique",
    fournisseur: "Tech Solutions",
    montant: 5000000,
    moyen: "Virement bancaire",
    priorite: "high",
    statut: "pending",
    dueDate: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    bonDeCommande: "BC-001",
  },
  {
    id: "2",
    reference: "BCP-002",
    title: "Fournitures de bureau",
    fournisseur: "Office Supplies Co",
    montant: 750000,
    moyen: "Mobile Money",
    priorite: "medium",
    statut: "completed",
    dueDate: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    bonDeCommande: "BC-002",
  },
];

const PaiementPage = () => {
  const links = [
    {
      title: "Créer une facture",
      href: "/tableau-de-bord/bdcommande/paiements/creer",
    },
  ];
  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title={"Paiements"}
        subtitle={
          "Créez et gérez les paiements des factures relatives aux bons de commande"
        }
        color={"red"}
      >
        {links.map((x) => (
          <Link href={x.href} key={x.title}>
            <Button variant={"ghost"}>{x.title}</Button>
          </Link>
        ))}
      </PageTitle>
      <PaiementsTable data={paiementsData} />
    </div>
  );
};

export default PaiementPage;
