import { CommandeTable } from "@/components/tables/commande-table";
import { commandeData } from "./bdcommande";

// const commandeData = [
//   {
//     id: "1",
//     reference: "CMD-001",
//     titre: "Achat de matériel informatique",
//     bonDeCommande: "BC-2025-001",
//   },
//   {
//     id: "2",
//     reference: "CMD-002",
//     titre: "Fournitures de bureau",
//     bonDeCommande: "BC-2025-002",
//   },
//   {
//     id: "3",
//     reference: "CMD-003",
//     titre: "Équipement de sécurité",
//     bonDeCommande: "BC-2025-003",
//   },
// ];

const Cotation = () => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col">
        <div className="flex justify-between">
          <h2>Commandes</h2>
        </div>
        <CommandeTable data={commandeData } />
      </div>
    </div>
  );
};

export default Cotation;
