"use client";

import PageTitle from "@/components/pageTitle";
import { DevisTable } from "@/components/tables/DevisTable";
import { Button } from "@/components/ui/button";
import { Quotation } from "@/types/types";
import Link from "next/link";
import React from "react";


const devis: Quotation[] = [
  {
    id: 0,
    commandRequestId: 7,
    providerId: 0,
    element: [
      {
        id: 0,
        deviId: 0,
        requestModelId: 1,
        title: "Element 1",
        quantity: 2,
        unit: "unite",
        priceProposed: 1000,
      },
      {
        requestModelId: 2,
        title: "Element 2",
        quantity: 3,
        unit: "unite",
        priceProposed: 1500,
        id: 0,
        deviId: 0
      },
    ],
    proof: "document1.pdf",
    createdAt: (new Date()).toISOString(),
    updatedAt: (new Date()).toISOString(),
    dueDate: (new Date()).toISOString(),
    ref: "ref-123"
  },
  {
    id: 1,
    commandRequestId: 4,
    providerId: 0,
    element: [
      {
        requestModelId: 3,
        title: "Element 3",
        quantity: 1,
        unit: "unite",
        priceProposed: 2000,
        id: 0,
        deviId: 0
      },
      {
        requestModelId: 4,
        title: "Element 4",
        quantity: 2,
        unit: "unite",
        priceProposed: 2500,
        id: 0,
        deviId: 0
      },
      {
        requestModelId: 5,
        title: "Element 5",
        quantity: 3,
        unit: "unite",
        priceProposed: 3000,
        id: 0,
        deviId: 0
      },
    ],
    proof: "document3.pdf",
    createdAt: (new Date()).toISOString(),
    updatedAt: (new Date()).toISOString(),
    dueDate: (new Date()).toISOString(),
    ref: "Ref-321"
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
