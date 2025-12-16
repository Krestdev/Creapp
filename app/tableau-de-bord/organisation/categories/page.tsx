import CategoriesPage from "@/components/organisation/categories";
import PageTitle from "@/components/pageTitle";

function Page() {
  return (
    <div className="flex flex-col gap-6">
      {/* page title */}
      <PageTitle
        title="Categories"
        subtitle="Consultez la liste des categories."
        color="red"
      />
      <CategoriesPage />
    </div>
  );
}

export default Page;
