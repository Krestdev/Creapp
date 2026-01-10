"use client";
import { useFetchQuery } from "@/hooks/useData";
import { categoryQ } from "@/queries/categoryModule";
import ErrorPage from "../error-page";
import LoadingPage from "../loading-page";
import { CategoriesTable } from "./categories-table";

const CategoriesPage = () => {
  const { isSuccess, isError, error, isLoading, data } = useFetchQuery(
    ["categoryList"],
    categoryQ.getCategories
  );

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
