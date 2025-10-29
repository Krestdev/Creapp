import ProjectListPage from "@/components/pages/projets/liste";
import PageTitle from "@/components/pageTitle";

function Page() {
  return (
    <div className="flex flex-col gap-6">
      {/* page title */}
      <PageTitle
        title="Les Projets"
        subtitle="Consultez la liste des projets."
        color="red"
      />
      <ProjectListPage />
    </div>
  );
}

export default Page;
