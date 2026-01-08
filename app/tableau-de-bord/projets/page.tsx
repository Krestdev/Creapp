import PageTitle from "@/components/pageTitle";

function Page() {
  return (
    <div className="flex flex-col gap-6">
      {/* page title */}
      <PageTitle
        title="Projets"
        subtitle="Consultez et gérez les projets."
        color="red"
      />
      {/* <ProjectsPage /> */}
    </div>
  );
}

export default Page;
