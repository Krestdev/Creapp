import PageTitle from "@/components/pageTitle";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import React from "react";

const Page = () => {
  return (
    <div className="content">
      <PageTitle
        title="Devis"
        subtitle="Consultez et gérez les cotations."
        color="red"
      >
        <Link href={"devis/creer"}><Button variant={"ghost"}>{"Créer un devis"}</Button></Link>
      </PageTitle>
    </div>
  );
};

export default Page;
