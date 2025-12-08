"use client";
import { DepartementTable } from "@/components/tables/departement-table";
import { useStore } from "@/providers/datastore";
import { DepartmentQueries } from "@/queries/departmentModule";
import { useQuery } from "@tanstack/react-query";

// const departementData: DepartmentT[] = [
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

const DepartementPage = () => {
  const { isHydrated } = useStore();
  const department = new DepartmentQueries();
  const departmentData = useQuery({
    queryKey: ["departmentList"],
    queryFn: () => department.getAll(),
    enabled: isHydrated,
  });
  if (departmentData.data)
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col">
          <div className="flex justify-between">
            <h2>Departement</h2>
          </div>
          <DepartementTable data={departmentData.data.data} />
        </div>
      </div>
    );
};

export default DepartementPage;
