"use client";

import TitleValueCard from "@/components/base/TitleValueCard";
import Tickets from "@/components/pages/ticket/tickets";
import PageTitle from "@/components/pageTitle";
import { useStore } from "@/providers/datastore";
import { TicketsData } from "@/types/types";

const ticketsData: TicketsData[] = [
  {
    id: "1",
    reference: "TKT-001",
    fournisseur: "Tech Solutions",
    bonDeCommande: "BC-001",
    montant: 5000000,
    moyenPaiement: "Virement bancaire",
    comptePayeur: "Compte Principal",
    priorite: "high",
    state: "pending",
    createdAt: new Date("2025-02-24"),
    updatedAt: new Date("2025-02-24"),
  },
  {
    id: "2",
    reference: "TKT-002",
    fournisseur: "Office Supplies Co",
    bonDeCommande: "BC-002",
    montant: 750000,
    moyenPaiement: "Mobile Money",
    comptePayeur: "Compte Secondaire",
    priorite: "medium",
    state: "paid",
    createdAt: new Date("2025-02-24"),
    updatedAt: new Date("2025-02-24"),
  },
  {
    id: "3",
    reference: "TKT-003",
    fournisseur: "Safety First",
    bonDeCommande: "BC-003",
    montant: 2500000,
    moyenPaiement: "Chèque",
    comptePayeur: "Compte Approvisionnement",
    priorite: "urgent",
    state: "approved",
    createdAt: new Date("2025-02-24"),
    updatedAt: new Date("2025-02-24"),
  },
];

function Page() {
  const { user } = useStore();
  const pending = ticketsData.filter((ticket) => ticket.state === "pending");
  const approved = ticketsData.filter((ticket) => ticket.state !== "pending");

  return (
    <div className="flex flex-col gap-6">
      {user?.role.flatMap((r) => r.label).includes("MANAGER") ? (
        <PageTitle
          title="Tickets"
          subtitle="Consultez et gérez les tickets."
          color="red"
        />
      ) : (
        <>
          <PageTitle
            title="Approbation"
            subtitle="Validez les tickets de paiement des bons de commandes"
            color="green"
          />
          <div className="grid grid-cols-1 @min-[640px]:grid-cols-2 @min-[1024px]:grid-cols-4 items-center gap-5">
            <TitleValueCard
              title="Tickets en attente"
              value={pending.length.toString()}
              className="bg-[#15803D] border border-[#2262A2] text-[#E4E4E7]"
              valColor="text-white"
            />
            <TitleValueCard
              title="Tickets Validées"
              value={approved.length.toString()}
              className="bg-[#013E7B] border border-[#BBF7D0] text-[#E4E4E7]"
              valColor="text-white"
            />
            <TitleValueCard
              title="Total Tickets"
              value={ticketsData.length.toString()}
              className="bg-white border border-[#DFDFDF] text-[#52525B]"
              valColor="text-black"
            />
          </div>
        </>
      )}
      <Tickets ticketsData={ticketsData} />
    </div>
  );
}

export default Page;
