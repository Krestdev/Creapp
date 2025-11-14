import { BonCommandePaiement } from "@/components/modals/detail-bc-val";
import { BonsCommandePaiementTable } from "@/components/tables/bons-commande-paiement-table";

export const bonsCommandePaiementData: BonCommandePaiement[] = [
  {
    id: "1",
    reference: "BCP-001",
    fournisseur: "Tech Solutions",
    titre: "Matériel informatique",
    montant: 5000000,
    priorite: "high" as const,
    moyen: "Espece",
    statut: "approved" as const,
    delai: "22/11/2025",
    lieu: "Creaconsult",
    emetteur: "Atangana Paul",
    creeLe: "22/10/2025",
    modifieLe: "22/10/2025",
    justificatif: [
      {
        type: "file",
        nom: "Proforma.pdf",
        taille: 110
      },
      {
        type: "image",
        nom: "image.jpg",
        taille: 110
      },
    ],
    condition: "Le règlement sera effectué en un seul versement, à la réception de la facture définitive dûment validée. Une pénalité de 3000 FCFA sera appliquée par jour de retard",
    besoin: [
      {
        title: "Ordinateur Architecte FANDO",
        prix: 150000,
        qte: 2
      },
      {
        title: "Ordinateur Comptable Loïc",
        prix: 150000,
        qte: 2
      }
    ]
  },
  {
    id: "2",
    reference: "BCP-002",
    fournisseur: "Office Supplies Co",
    titre: "Fournitures bureau",
    montant: 750000,
    priorite: "medium" as const,
    moyen: "Espece",
    statut: "rejected" as const,
    delai: "22/11/2025",
    lieu: "Creaconsult",
    emetteur: "Atangana Paul",
    creeLe: "22/10/2025",
    modifieLe: "22/10/2025",
    justificatif: [
      {
        type: "file",
        nom: "Proforma.pdf",
        taille: 110
      },
      {
        type: "image",
        nom: "image.jpg",
        taille: 110
      },
    ],
    condition: "Le règlement sera effectué en un seul versement, à la réception de la facture définitive dûment validée. Une pénalité de 3000 FCFA sera appliquée par jour de retard",
    besoin: [
      {
        title: "Ordinateur Architecte FANDO",
        prix: 150000,
        qte: 2
      },
      {
        title: "Ordinateur Comptable Loïc",
        prix: 150000,
        qte: 2
      }
    ]
  },
  {
    id: "3",
    reference: "BCP-003",
    fournisseur: "Safety First",
    titre: "Équipement sécurité",
    montant: 2500000,
    priorite: "urgent" as const,
    moyen: "Espece",
    statut: "approved" as const,
    delai: "22/11/2025",
    lieu: "Creaconsult",
    emetteur: "Atangana Paul",
    creeLe: "22/10/2025",
    modifieLe: "22/10/2025",
    justificatif: [
      {
        type: "file",
        nom: "Proforma.pdf",
        taille: 110
      },
      {
        type: "image",
        nom: "image.jpg",
        taille: 110
      },
      {
        type: "image",
        nom: "image2.jpg",
        taille: 110
      },
    ],
    condition: "Le règlement sera effectué en un seul versement, à la réception de la facture définitive dûment validée. Une pénalité de 3000 FCFA sera appliquée par jour de retard",
    besoin: [
      {
        title: "Ordinateur Architecte FANDO",
        prix: 150000,
        qte: 2
      },
      {
        title: "Ordinateur Comptable Loïc",
        prix: 150000,
        qte: 2
      }
    ]
  },
];

const BdCommandePaiement = () => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col">
        <div className="flex justify-between">
          <h2>{"Commandes"}</h2>
        </div>
        <BonsCommandePaiementTable data={bonsCommandePaiementData} />
      </div>
    </div>
  );
};

export default BdCommandePaiement;
