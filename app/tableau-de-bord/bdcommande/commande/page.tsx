"use client";

import TitleValueCard from "@/components/base/TitleValueCard";
import PageTitle from "@/components/pageTitle";
import { BonsCommandeTable } from "@/components/tables/bons-commande-table";
import React from "react";

export type BonsCommande = {
  id: string;
  reference: string;
  titre: string;
  fournisseur: string;
  montant: number;
  priorite: "low" | "medium" | "high" | "urgent";
  statut: "approved" | "pending" | "in-review" | "rejected";
  createdAt: Date;
  updatedAt: Date;
};

const bonsCommandeData: BonsCommande[] = [
  {
    id: "1",
    reference: "BC-001",
    titre: "Matériel informatique",
    fournisseur: "Tech Solutions",
    priorite: "high" as const,
    statut: "approved" as const,
    montant: 50000,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "2",
    reference: "BC-002",
    titre: "Fournitures bureau",
    fournisseur: "Office Supplies Co",
    priorite: "medium" as const,
    statut: "pending" as const,
    montant: 50000,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "3",
    reference: "BC-003",
    titre: "Équipement sécurité",
    fournisseur: "Safety First",
    priorite: "urgent" as const,
    statut: "in-review" as const,
    montant: 50000,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "4",
    reference: "BC-004",
    titre: "Mobilier",
    fournisseur: "Furniture Plus",
    priorite: "low" as const,
    statut: "rejected" as const,
    montant: 50000,
    createdAt: new Date(),
    updatedAt: new Date()
  },
];

const Page = () => {
  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Validation"
        subtitle="Approbation des bons de commandes"
        color="green"
      />
      <div className="grid grid-cols-1 @min-[640px]:grid-cols-2 @min-[1024px]:grid-cols-4 items-center gap-5">
        <TitleValueCard
          title={"Bons en attente"}
          value={"13"}
          className={"border border-[#2262A2] bg-[#013E7B] text-[#E4E4E7]"}
          valColor={"text-white"}
        />
        <TitleValueCard
          title={"Bons rejetés"}
          value={"4"}
          className={"border border-[#EB88B4] bg-[#9E1351] text-[#E4E4E7]"}
          valColor={"text-white"}
        />
        <TitleValueCard
          title={"Bons validés"}
          value={"62"}
          className={"border border-[#BBF7D0] bg-[#15803D] text-[#E4E4E7]"}
          valColor={"text-white"}
        />
        <TitleValueCard
          title={"Bons de commande"}
          value={"79"}
          className={"border border-[#DFDFDF] bg-[#FFFFFF] text-[#52525B]"}
          valColor={"text-[#52525B]"}
        />
      </div>
      {/* <CommandeBd /> */}
      <BonsCommandeTable data={bonsCommandeData} />
    </div>
  );
};

export default Page;
