"use client";
import { DataTable } from "@/components/base/data-table";
import { BesoinsTraiterTable } from "@/components/tables/besoins-traiter-table";
import { CommandeTable } from "@/components/tables/commande-table";
import { PaiementTable } from "@/components/tables/paiement-table";
import { ProjectTable } from "@/components/tables/project-table";
import { TicketsTable } from "@/components/tables/tickets-table";
import { Button } from "@/components/ui/button";
import { useStore } from "@/providers/datastore";
import { ProjectQueries } from "@/queries/projectModule";
import { ProjectT } from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import React from "react";

const projects: ProjectT[] = [
  {
    id: 1,
    reference: "PRJ-001",
    label: "Corporate Website Redesign",
    budget: 15000000,
    chief: { id: 1, name: "Jean Dupont" },
    status: "in-progress" as const,
    description: "Redesigning the corporate website for better UX.",
  },
  {
    id: 2,
    reference: "PRJ-002",
    label: "Mobile Sales Tracking App",
    budget: 22000000,
    chief: { id: 2, name: "Marie Curie" },
    status: "planning" as const,
    description: "Developing a mobile app to track sales on the go.",
  },
  {
    id: 3,
    reference: "PRJ-003",
    label: "Inventory Management System",
    budget: 12000000,
    chief: { id: 3, name: "Alain Tientcheu" },
    status: "completed" as const,
    description: "Implementing a new system to manage inventory efficiently.",
  },
  {
    id: 4,
    reference: "PRJ-004",
    label: "HR Automation Platform",
    budget: 18000000,
    chief: { id: 4, name: "Clarisse Ngongang" },
    status: "in-progress" as const,
    description: "Creating a platform to automate HR processes.",
  },
  {
    id: 5,
    reference: "PRJ-005",
    label: "Digital Marketing Campaign",
    budget: 8000000,
    chief: { id: 5, name: "Prisca Ndong" },
    status: "on-hold" as const,
    description: "Launching a new digital marketing campaign for product X.",
  },
  {
    reference: "PRJ-006",
    label: "E-commerce Web Application",
    budget: 25000000,
    chief: { id: 6, name: "Junior Kamdem" },
    status: "in-progress" as const,
    description: "Building a full-featured e-commerce web application.",
  },
  {
    reference: "PRJ-007",
    label: "Customer Support Chatbot",
    budget: 10000000,
    chief: { id: 7, name: "Vanessa Mbappe" },
    status: "planning" as const,
    description: "Developing a chatbot to enhance customer support.",
  },
  {
    reference: "PRJ-008",
    label: "Company ERP Integration",
    budget: 30000000,
    chief: { id: 8, name: "Liliane Fotso" },
    status: "completed" as const,
    description: "Integrating company ERP systems for streamlined operations.",
  },
  {
    reference: "PRJ-009",
    label: "Cloud Migration Initiative",
    budget: 27000000,
    chief: { id: 9, name: "Sandrine Mvondo" },
    status: "planning" as const,
    description: "Migrating company data and applications to the cloud.",
  },
  {
    reference: "PRJ-010",
    label: "Social Media Management Tool",
    budget: 9000000,
    chief: { id: 9, name: "Sandrine Mvondo" },
    status: "planning" as const,
    description:
      "Developing a tool to manage social media accounts effectively.",
  },
  {
    reference: "PRJ-010",
    label: "Social Media Management Tool",
    budget: 9000000,
    chief: { id: 10, name: "Rodrigue Nde" },
    status: "cancelled" as const,
    description:
      "Developing a tool to manage social media accounts effectively.",
  },
];

const ProjectsPage = () => {
  const { isHydrated } = useStore();
  const project = new ProjectQueries();
  const projectData = useQuery({
    queryKey: ["projectsList"],
    queryFn: () => project.getAll(),
    enabled: isHydrated,
  });
  if (projectData.data)
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col">
          <div className="flex justify-between">
            <h2>Projects</h2>
          </div>
          <ProjectTable data={projectData.data?.data} />
        </div>
      </div>
    );
};

export default ProjectsPage;
