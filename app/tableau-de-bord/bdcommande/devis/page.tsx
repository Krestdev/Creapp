"use client";

import PageTitle from "@/components/pageTitle";
import { DevisTable } from "@/components/tables/DevisTable";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import React from "react";

type Devis = {
  id: number;
  ref: string;
  title: string;
  quotationId: number;
  providerId: number;
  elements: {
    needId: number;
    designation: string;
    quantity: number;
    unit: string;
    price: number;
  }[];
  documents: (string | File)[];
  dueDate: Date;
  createdAt: Date;
  updatedAt: Date;
};

const devis: Devis[] = [
  {
    id: 0,
    quotationId: 7,
    providerId: 0,
    elements: [
      {
        needId: 1,
        designation: "Element 1",
        quantity: 2,
        unit: "unite",
        price: 10,
      },
      {
        needId: 2,
        designation: "Element 2",
        quantity: 3,
        unit: "unite",
        price: 15,
      },
    ],
    documents: ["document1.pdf", "document2.pdf"],
    createdAt: new Date(),
    updatedAt: new Date(),
    dueDate: new Date(),
    ref: "ref-123",
    title: "Devis 1",
  },
  {
    id: 1,
    quotationId: 4,
    providerId: 0,
    elements: [
      {
        needId: 3,
        designation: "Element 3",
        quantity: 1,
        unit: "unite",
        price: 20,
      },
      {
        needId: 4,
        designation: "Element 4",
        quantity: 2,
        unit: "unite",
        price: 25,
      },
      {
        needId: 5,
        designation: "Element 5",
        quantity: 3,
        unit: "unite",
        price: 30,
      },
    ],
    documents: ["document3.pdf"],
    createdAt: new Date(),
    updatedAt: new Date(),
    dueDate: new Date(),
    ref: "Ref-321",
    title: "Devis 2",
  },
];

const Page = () => {
  const [dateFilter, setDateFilter] = React.useState<
    "today" | "week" | "month" | "year" | "custom" | undefined
  >();

  return (
    <div className="content">
      <PageTitle
        title="Devis"
        subtitle="Consultez et gérez les cotations."
        color="red"
      >
        <Link href={"devis/creer"}>
          <Button variant={"ghost"}>{"Créer un devis"}</Button>
        </Link>
      </PageTitle>
      <DevisTable
        data={devis}
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
      />
    </div>
  );
};

export default Page;
