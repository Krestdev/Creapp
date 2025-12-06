"use client";
import { CategoriesTable } from "@/components/tables/categories-table";
import { useStore } from "@/providers/datastore";
import { DepartmentQueries } from "@/queries/departmentModule";
import { RequestQueries } from "@/queries/requestModule";
import { DepartmentT } from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import React from "react";

// const categoriesData: DepartmentT[] = [
//   {
//     id: 1,
//     reference: "DEPT-001",
//     label: "IT & Infrastructure",
//     description: "Gestion des systèmes informatiques et infrastructure réseau",
//     members: [],
//     status: "actif" as const,
//     createdAt: "Date",
//     updatedAt: "Date",
//   },
//   {
//     id: 2,
//     reference: "DEPT-002",
//     label: "Ressources Humaines",
//     description: "Gestion du personnel et développement des talents",
//     members: [],
//     status: "actif" as const,
//     createdAt: "Date",
//     updatedAt: "Date",
//   },
//   {
//     id: 3,
//     reference: "DEPT-003",
//     label: "Comptabilité",
//     description: "Gestion financière et comptable de l'entreprise",
//     members: [],
//     status: "en-reorganisation" as const,
//     createdAt: "Date",
//     updatedAt: "Date",
//   },
//   {
//     id: 4,
//     reference: "DEPT-004",
//     label: "Marketing",
//     description: "Stratégie marketing et communication",
//     members: [],
//     status: "actif" as const,
//     createdAt: "Date",
//     updatedAt: "Date",
//   },
//   {
//     id: 5,
//     reference: "DEPT-005",
//     label: "Logistique",
//     description: "Gestion des approvisionnements et distribution",
//     members: [],
//     status: "inactif" as const,
//     createdAt: "Date",
//     updatedAt: "Date",
//   },
// ];

const CategoriesPage = () => {
  const { isHydrated } = useStore();
  const category = new RequestQueries();
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
            <h2>Categories</h2>
          </div>
          <CategoriesTable data={categoryData.data.data} />
        </div>
      </div>
    );
};

export default CategoriesPage;
