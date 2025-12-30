"use client";

import { Notification, notificationRoutes } from "@/types/types";
import { useRouter } from "next/navigation";
import { NotificationItem } from "@/components/NotificationItem";
import PageTitle from "@/components/pageTitle";
import Empty from "@/components/base/empty";
import { Pagination } from "@/components/base/pagination";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table";
import { useState, useMemo } from "react";

// ShadCN Select
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Page() {
  const router = useRouter();

  // --- Notifications ---
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      title: "Besoin à valider",
      type: "BESOIN_A_VALIDER",
      message: "Le besoin BES-2025-001 attend votre validation",
      userId: 2,
      read: false,
      createdAt: "2025-01-10T09:20:00Z",
      updatedAt: "2025-01-10T09:20:00Z",
    },
    {
      id: 2,
      title: "Besoin validé",
      type: "BESOIN_VALIDE",
      message: "Votre besoin BES-2025-001 a été validé",
      userId: 1,
      read: false,
      createdAt: "2025-01-10T11:00:00Z",
      updatedAt: "2025-01-10T11:00:00Z",
    },
    {
      id: 3,
      title: "Devis à valider",
      type: "DEVIS_A_VALIDER",
      message: "Des devis sont disponibles pour la demande BES-2025-001",
      userId: 4,
      read: false,
      createdAt: "2025-01-13T08:30:00Z",
      updatedAt: "2025-01-13T08:30:00Z",
    },
    {
      id: 4,
      title: "Paiement à valider",
      type: "PAIEMENT_A_VALIDER",
      message: "Le paiement du BC-2025-015 attend votre validation",
      userId: 5,
      read: false,
      createdAt: "2025-01-16T09:05:00Z",
      updatedAt: "2025-01-16T09:05:00Z",
    },
    {
      id: 5,
      title: "Paiement validé",
      type: "PAIEMENT_VALIDE",
      message: "Le paiement du BC-2025-015 a été validé",
      userId: 6,
      read: false,
      createdAt: "2025-01-16T11:00:00Z",
      updatedAt: "2025-01-16T11:00:00Z",
    },
    {
      id: 6,
      title: "Paiement effectué",
      type: "PAIEMENT_PAYE",
      message: "Le paiement du BC-2025-015 a été effectué",
      userId: 1,
      read: false,
      createdAt: "2025-01-17T15:30:00Z",
      updatedAt: "2025-01-17T15:30:00Z",
    },
  ]);

  // --- Filtres ---
  const [filterType, setFilterType] = useState<string>("ALL");
  const [filterRead, setFilterRead] = useState<string>("ALL"); // ALL / READ / UNREAD

  const notificationTypes = [
    { label: "Toutes les notifications", value: "ALL" },
    { label: "Besoin à valider", value: "BESOIN_A_VALIDER" },
    { label: "Besoin validé", value: "BESOIN_VALIDE" },
    { label: "Devis à valider", value: "DEVIS_A_VALIDER" },
    { label: "Paiement à valider", value: "PAIEMENT_A_VALIDER" },
    { label: "Paiement validé", value: "PAIEMENT_VALIDE" },
    { label: "Paiement payé", value: "PAIEMENT_PAYE" },
  ];

  const readOptions = [
    { label: "Tous statuts", value: "ALL" },
    { label: "Non-lu", value: "UNREAD" },
    { label: "Lu", value: "READ" },
  ];

  // --- Notifications filtrées (mémoïsées pour éviter le freeze) ---
  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      const typeMatch = filterType === "ALL" || n.type === filterType;
      const readMatch =
        filterRead === "ALL" ||
        (filterRead === "READ" && n.read) ||
        (filterRead === "UNREAD" && !n.read);
      return typeMatch && readMatch;
    });
  }, [notifications, filterType, filterRead]);

  // --- Colonnes minimales pour react-table ---
  const columns = useMemo(
    () => [{ accessorKey: "title", header: "Title" }],
    []
  );

  // --- Table pour pagination ---
  const table = useReactTable({
    data: filteredNotifications,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  // --- Marquer notification comme lue ---
  const handleRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  // --- Click sur notification ---
  const handleClick = (notification: Notification) => {
    if (!notification.read) handleRead(notification.id);
    const route = notificationRoutes[notification.type];
    if (route) router.push(route);
  };

  return (
    <div>
      <PageTitle
        title="Notifications"
        subtitle="Consulter et traiter les notifications."
        color="red"
      />

      {/* Filtre ShadCN */}
      <div className="flex gap-4 mb-4 mt-4">
        <div className="flex items-center gap-2">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filtrer par type" />
            </SelectTrigger>
            <SelectContent>
              {notificationTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Select value={filterRead} onValueChange={setFilterRead}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              {readOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Liste notifications */}
      <div className="bg-background rounded-lg flex flex-col gap-2">
        {filteredNotifications.length === 0 ? (
          <Empty message="Aucune notification" />
        ) : (
          table
            .getRowModel()
            .rows.map((row) => (
              <NotificationItem
                key={row.original.id}
                notification={row.original}
                onRead={handleRead}
              />
            ))
        )}

        {/* Pagination */}
        <Pagination table={table} />
      </div>
    </div>
  );
}
