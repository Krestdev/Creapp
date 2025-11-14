import { BesoinsTraiterTable } from "@/components/tables/besoins-traiter-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { commandeData } from "./bdcommande";
import { data } from "@/components/base/data-table";

// const besoinsTraiterData = [
//   {
//     id: "1",
//     titre: "Casque de protection",
//     projet: "Mediatech",
//     categorie: "Matériel technique & logistique",
//     emetteur: "Jean Michel Atangana",
//     beneficiaires: "Jean Michel Atangana, Marie Dupont",
//   },
//   {
//     id: "2",
//     titre: "Ordinateurs portables",
//     projet: "IT Infrastructure",
//     categorie: "Informatique",
//     emetteur: "Sophie Martin",
//     beneficiaires: "Équipe développement",
//   },
//   {
//     id: "3",
//     titre: "Mobilier de bureau",
//     projet: "Aménagement",
//     categorie: "Mobilier",
//     emetteur: "Pierre Dubois",
//     beneficiaires: "Tous les employés",
//   },
// ];

const Besoins = () => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col">
        <div className="flex justify-between">
          <h2>En attente d'approbation</h2>
          <Button>
            Créer une commande <Plus />
          </Button>
        </div>
        <BesoinsTraiterTable data={data} />
      </div>
    </div>
  );
};

export default Besoins;
