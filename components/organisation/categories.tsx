"use client";
import { categoryQ } from "@/queries/categoryModule";
import ErrorPage from "../error-page";
import LoadingPage from "../loading-page";
import { CategoriesTable } from "./categories-table";
import { useQuery } from "@tanstack/react-query";

const CategoriesPage = () => {
  const { isSuccess, isError, error, isLoading, data } = useQuery({
    queryKey: ["categoryList"],
    queryFn: categoryQ.getCategories,
  });

  if (isLoading) {
    return <LoadingPage />;
  }
  if (isError) {
    return <ErrorPage error={error ?? isError ?? undefined} />;
  }
  if (isSuccess)
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col">
          <CategoriesTable data={data.data} />
        </div>
      </div>
    );
};

export default CategoriesPage;
