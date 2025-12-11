import { PaiementTable } from "@/components/tables/paiement-table";

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

const PaiementRecus = () => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col">
        <div className="flex justify-between">
          <h2>PaiementRecus</h2>
        </div>
        <PaiementTable data={paiementData} />
      </div>
    </div>
  );
};

export default PaiementRecus;
