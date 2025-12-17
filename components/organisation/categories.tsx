"use client";
import { useStore } from "@/providers/datastore";
import { CategoryQueries } from "@/queries/categoryModule";
import { useQuery } from "@tanstack/react-query";
import { CategoriesTable } from "./categories-table";

const CategoriesPage = () => {
  const { isHydrated } = useStore();
  const category = new CategoryQueries();
  const categoryData = useQuery({
    queryKey: ["categoryList"],
    queryFn: () => category.getCategories(),
    enabled: isHydrated,
  });
  if (categoryData.data)
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col">
          <div className="flex justify-between">
            <h2>Catégories</h2>
          </div>
          <CategoriesTable data={categoryData.data.data} />
        </div>
      </div>
    );
};

export default CategoriesPage;
