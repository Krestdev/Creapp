"use client";

import PageTitle from "@/components/pageTitle";
import { DevisTable } from "@/components/tables/DevisTable";
import { Button } from "@/components/ui/button";
import { useFetchQuery } from "@/hooks/useData";
import { QuotationQueries } from "@/queries/quotation";
import { Quotation } from "@/types/types";
import Link from "next/link";
import React from "react";


const Page = () => {
  /**Quotation fetch */
  const quotationQuery = new QuotationQueries();
  const { data, isSuccess } = useFetchQuery(["quotations"], quotationQuery.getAll);

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
        data={data?.data}
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
      />
    </div>
  );
};

export default Page;
