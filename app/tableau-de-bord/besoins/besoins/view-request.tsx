"use client";
import { DetailBesoin } from "@/components/besoin/detail-besoin";
import { queryKeys } from "@/lib/query-keys";
import { projectQ } from "@/queries/projectModule";
import { purchaseQ } from "@/queries/purchase-order";
import { receptionQ } from "@/queries/reception";
import { requestQ } from "@/queries/requestModule";
import { RequestType, User } from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import React from "react";

interface ViewRequestProps {
  open: boolean;
  openChange: React.Dispatch<React.SetStateAction<boolean>>;
  reqId: number;
  users: Array<User>;
  /** Conservé pour les appelants existants : le tiroir relit les types lui-même. */
  requestTypes?: RequestType[];
}

/**
 * Tiroir « Voir le besoin » de la liste « Tous les besoins » : charge le besoin
 * et ses documents (projets, bons de commande, réceptions), puis s'affiche avec
 * le même tiroir que « Mes besoins » (`DetailBesoin`, Figma · Besoins voir).
 */
function ViewRequest({ open, openChange, reqId, users }: ViewRequestProps) {
  const request = useQuery({
    queryKey: queryKeys.request(reqId),
    queryFn: () => requestQ.getOne(reqId),
  });
  const projects = useQuery({
    queryKey: queryKeys.projects,
    queryFn: () => projectQ.getAll(),
  });
  const receptions = useQuery({
    queryKey: queryKeys.receptions,
    queryFn: () => receptionQ.getAll(),
  });
  const purchases = useQuery({
    queryKey: queryKeys.purchaseOrders,
    queryFn: () => purchaseQ.getAll(),
  });

  if (!request.isSuccess) return null;

  return (
    <DetailBesoin
      open={open}
      onOpenChange={openChange}
      data={request.data.data}
      users={users}
      projects={projects.data?.data ?? []}
      receptions={receptions.data?.data ?? []}
      purchaseOrders={purchases.data?.data ?? []}
    />
  );
}

export default ViewRequest;
