import { BonsCommandeTable } from "@/components/tables/bons-commande-table";
import React from "react";
import { bonsCommandePaiementData } from "./bdCommandePaiement";


const CommandeBd = () => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col">
        <div className="flex justify-between">
          <h2>{"Commandes"}</h2>
        </div>
        
      </div>
    </div>
  );
};

export default CommandeBd;
