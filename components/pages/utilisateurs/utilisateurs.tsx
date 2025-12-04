"use client";
import { DataTable } from "@/components/base/data-table";
import { BesoinsTraiterTable } from "@/components/tables/besoins-traiter-table";
import { CommandeTable } from "@/components/tables/commande-table";
import { PaiementTable } from "@/components/tables/paiement-table";
import { TicketsTable } from "@/components/tables/tickets-table";
import { UtilisateursTable } from "@/components/tables/utilisateurs-table";
import { Button } from "@/components/ui/button";
import { useStore } from "@/providers/datastore";
import { UserQueries } from "@/queries/baseModule";
import { User } from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import React from "react";

const utilisateursData: User[] = [
  {
    id: 1,
    name: "Jean Michel Atangana",
    // role: "admin",
    status: "active",
    lastConnection: "2025-01-22T14:30:00",
    members: [],
    email: "string",
    phone: "string",
    password: "string",
    projectId: 1,
    verificationOtp: 1,
    verified: false,
    createdAt: "string",
    updatedAt: "string",
    role: [
      {
        id: 1,
        label: "USER",
      },
    ],
  },
  {
    id: 2,
    name: "Sophie Martin",
    // role: "manager",
    status: "active",
    lastConnection: "2025-01-22T09:15:00",
    members: [],
    email: "string",
    phone: "string",
    password: "string",
    projectId: 1,
    verificationOtp: 1,
    verified: false,
    createdAt: "string",
    updatedAt: "string",
    role: [
      {
        id: 1,
        label: "USER",
      },
    ],
  },
  {
    id: 3,
    name: "Pierre Dubois",
    // role: "user",
    status: "inactive",
    lastConnection: "2025-01-20T16:45:00",
    members: [],
    email: "string",
    phone: "string",
    password: "string",
    projectId: 1,
    verificationOtp: 1,
    verified: false,
    createdAt: "string",
    updatedAt: "string",
    role: [
      {
        id: 1,
        label: "USER",
      },
    ],
  },
  {
    id: 4,
    name: "Marie Dupont",
    // role: "user",
    status: "active",
    lastConnection: "2025-01-22T11:20:00",
    members: [],
    email: "string",
    phone: "string",
    password: "string",
    projectId: 1,
    verificationOtp: 1,
    verified: false,
    createdAt: "string",
    updatedAt: "string",
    role: [
      {
        id: 1,
        label: "USER",
      },
    ],
  },
  {
    id: 5,
    name: "Thomas Bernard",
    // role: "viewer",
    status: "suspended",
    lastConnection: "2025-01-15T08:30:00",
    members: [],
    email: "string",
    phone: "string",
    password: "string",
    projectId: 1,
    verificationOtp: 1,
    verified: false,
    createdAt: "string",
    updatedAt: "string",
    role: [
      {
        id: 1,
        label: "USER",
      },
    ],
  },
  {
    id: 6,
    name: "Claire Rousseau ll",
    // role: "manager",
    status: "active",
    lastConnection: "2025-01-22T13:00:00",
    members: [],
    email: "string",
    phone: "string",
    password: "string",
    projectId: 1,
    verificationOtp: 1,
    verified: false,
    createdAt: "string",
    updatedAt: "string",
    role: [
      {
        id: 1,
        label: "USER",
      },
    ],
  },
];

const UtilisateursPage = () => {
  const { isHydrated } = useStore();
  const user = new UserQueries();
  const userData = useQuery({
    queryKey: ["usersList"],
    queryFn: () => user.getAll(),
    enabled: isHydrated,
  });

  if (userData.data)
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col">
          <div className="flex justify-between">
            <h2>Utilisateurs</h2>
          </div>
          {/* <UtilisateursTable data={utilisateursData} /> */}
          <UtilisateursTable data={userData.data.data} />
        </div>
      </div>
    );
};

export default UtilisateursPage;
