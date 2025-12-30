"use client";
import { useStore } from "@/providers/datastore";
import { CategoryQueries } from "@/queries/categoryModule";
import { useQuery } from "@tanstack/react-query";
import { CategoriesTable } from "./categories-table";
import { useFetchQuery } from "@/hooks/useData";
import LoadingPage from "../loading-page";
import ErrorPage from "../error-page";

const CategoriesPage = () => {
  const category = new CategoryQueries();
  const { isSuccess, isError, error, isLoading, data } = useFetchQuery(
    ["categoryList"],
    category.getCategories
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
