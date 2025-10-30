import { DataTable } from "@/components/base/data-table";
import { BesoinsTraiterTable } from "@/components/tables/besoins-traiter-table";
import { CommandeTable } from "@/components/tables/commande-table";
import { PaiementTable } from "@/components/tables/paiement-table";
import { ProjectTable } from "@/components/tables/project-table";
import { TicketsTable } from "@/components/tables/tickets-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import React from "react";

const projects = [
  {
    reference: "PRJ-001",
    project: "Corporate Website Redesign",
    totalBudget: 15000000,
    budgetLeft: 3500000,
    chief: "Nadine Tchoua",
    state: "in-progress" as const,
  },
  {
    reference: "PRJ-002",
    project: "Mobile Sales Tracking App",
    totalBudget: 22000000,
    budgetLeft: 8000000,
    chief: "Viche Hakim",
    state: "planning" as const,
  },
  {
    reference: "PRJ-003",
    project: "Inventory Management System",
    totalBudget: 12000000,
    budgetLeft: 0,
    chief: "Alain Tientcheu",
    state: "completed" as const,
  },
  {
    reference: "PRJ-004",
    project: "HR Automation Platform",
    totalBudget: 18000000,
    budgetLeft: 9500000,
    chief: "Clarisse Ngongang",
    state: "in-progress" as const,
  },
  {
    reference: "PRJ-005",
    project: "Digital Marketing Campaign",
    totalBudget: 8000000,
    budgetLeft: 2000000,
    chief: "Prisca Ndong",
    state: "on-hold" as const,
  },
  {
    reference: "PRJ-006",
    project: "E-commerce Web Application",
    totalBudget: 25000000,
    budgetLeft: 5000000,
    chief: "Junior Kamdem",
    state: "in-progress" as const,
  },
  {
    reference: "PRJ-007",
    project: "Customer Support Chatbot",
    totalBudget: 10000000,
    budgetLeft: 10000000,
    chief: "Vanessa Mbappe",
    state: "planning" as const,
  },
  {
    reference: "PRJ-008",
    project: "Company ERP Integration",
    totalBudget: 30000000,
    budgetLeft: 4000000,
    chief: "Liliane Fotso",
    state: "completed" as const,
  },
  {
    reference: "PRJ-009",
    project: "Cloud Migration Initiative",
    totalBudget: 27000000,
    budgetLeft: 27000000,
    chief: "Sandrine Mvondo",
    state: "planning" as const,
  },
  {
    reference: "PRJ-010",
    project: "Social Media Management Tool",
    totalBudget: 9000000,
    budgetLeft: 0,
    chief: "Rodrigue Nde",
    state: "cancelled" as const,
  },
];

const ProjectsPage = () => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col">
        <div className="flex justify-between">
          <h2>Projects</h2>
        </div>
        <ProjectTable data={projects} />
      </div>
    </div>
  );
};

export default ProjectsPage;
