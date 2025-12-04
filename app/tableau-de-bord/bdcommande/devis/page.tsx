"use client"

import PageTitle from "@/components/pageTitle";
import { DevisTable } from "@/components/tables/DevisTable";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import React from "react";

const cmdrqt = [
  {
    id: 1,
    deliveryDate: new Date(),
    reference: "ref-1",
    updatedAt: new Date(),
    createdAt: new Date(),
    userId: 1,
    dueDate: new Date(),
    title: "title 1",
    requests: [1, 2],
    besoins: [],
  },
  {
    id: 2,
    deliveryDate: new Date(),
    reference: "ref-2",
    updatedAt: new Date(),
    createdAt: new Date(),
    userId: 1,
    dueDate: new Date(),
    title: "title 2",
    requests: [1, 2],
    besoins: [],
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
        data={cmdrqt}
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
      />
    </div>
  );
};

export default Page;
