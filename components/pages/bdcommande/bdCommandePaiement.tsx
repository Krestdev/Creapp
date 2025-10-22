import { BonsCommandePaiementTable } from "@/components/tables/bons-commande-paiement-table";

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

const BdCommandePaiement = () => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col">
        <div className="flex justify-between">
          <h2>Commandes</h2>
        </div>
        <BonsCommandePaiementTable data={bonsCommandePaiementData} />
      </div>
    </div>
  );
};

export default BdCommandePaiement;
