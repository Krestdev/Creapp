'use client'
import React from "react";
import PageTitle from "@/components/pageTitle";
import { ReceptionTable } from "@/components/tables/ReceptionTable";
import { ReceptionQuery } from "@/queries/reception";
import { useFetchQuery } from "@/hooks/useData";

export type Reception = {
  id: string;
  reference: string;
  provider: string;
  statut: "pending" | "completed" | "failed" | "processing";
  refBC: string;
  bonDeCommande: string;
  dueDate: Date;
  receptionDate: Date;
  items: {
    id: number
    name: string;
    status: boolean;
  }[];
  proof: string[];
  editor: string;
  createdAt: Date;
  updatedAt: Date;
};

const receptionsData: Reception[] = [
  {
    id: "1",
    reference: "RC-001",
    provider: "Tech Solutions",
    statut: "pending",
    refBC: "BC-001",
    bonDeCommande: "Achat de matériel informatique",
    dueDate: new Date(),
    receptionDate: new Date(),
    items: [
      {
        id: 1,
        name: "Matériel informatique",
        status: true,
      },
      {
        id: 2,
        name: "Fournitures de bureau",
        status: false,
      },
    ],
    proof: ["document.pdf"],
    editor: "Atangana Pierre",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    reference: "RC-002",
    provider: "Office Supplies Co",
    statut: "completed",
    refBC: "BC-002",
    bonDeCommande: "Achat de fournitures de bureau",
    dueDate: new Date(),
    receptionDate: new Date(),
    items: [
      {
        id: 3,
        name: "Fournitures de bureau",
        status: true,
      },
      {
        id: 4,
        name: "Matériel informatique",
        status: false,
      },
      {
        id: 5,
        name: "Équipement sécurité",
        status: false,
      },
      {
        id: 6,
        name: "Fournitures de bureau",
        status: false,
      },
    ],
    proof: ["document.pdf"],
    editor: "Atangana Pierre",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const ReceptionsPage = () => {
  const receptionQuery = new ReceptionQuery();
  const getReceptions = useFetchQuery(["receptions"], receptionQuery.getAll);
  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title={"Réceptions"}
        subtitle={
          "Enregistrez les réceptions des livraisons relatives aux bons de commande."
        }
        color={"red"}
      />

      <ReceptionTable data={receptionsData} />
    </div>
  );
};

export default ReceptionsPage;
