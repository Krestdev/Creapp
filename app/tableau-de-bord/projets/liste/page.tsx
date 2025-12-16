import ProjectListPage from "@/components/projets/liste";
import PageTitle from "@/components/pageTitle";
import Link from "next/link";
import { Button } from "@/components/ui/button";

function Page() {
  return (
    <div className="flex flex-col gap-6">
      {/* page title */}
      <PageTitle
        title="Les Projets"
        subtitle="Consultez la liste des projets."
        color="red"
      >
        <Link href={"./create"}>
          <Button variant={"ghost"}>{"Créer un Projet"}</Button>
        </Link>
      </PageTitle>
      <ProjectListPage />
    </div>
  );
}

export default Page;
