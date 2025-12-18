
export const bonsCommandePaiementData = [
  {
    id: 1,
    reference: "BCP-001",
    fournisseur: "Tech Solutions",
    titre: "Matériel informatique",
    montant: 5000000,
    moyenPaiement: "Virement bancaire",
    priorite: "high",
    statut: "pending",
    userId: 1,
    justificatif: "document.pdf",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 2,
    reference: "BCP-002",
    fournisseur: "Office Supplies Co",
    titre: "Fournitures de bureau",
    montant: 750000,
    moyenPaiement: "Mobile Money",
    priorite: "medium",
    statut: "paid",
    userId: 2,
    justificatif: "document.pdf",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

const BdCommandePaiement = () => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col">
        {/* <BonsCommandePaiementTable data={bonsCommandePaiementData} /> */}
      </div>
    </div>
  );
};

export default BdCommandePaiement;
