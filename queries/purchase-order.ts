import api from "@/providers/axios";
import { BonsCommande } from "@/types/types";

export type CreatePurchasePayload = {
  command: Omit<
    BonsCommande,
    | "id"
    | "createdAt"
    | "updatedAt"
    | "status"
    | "devi"
    | "reference"
    | "provider"
    | "instalments"
    | "commandConditions"
    | "invoice"
  > & {
    instalments: Array<{
      percentage: number;
      deadLine?: Date | undefined;
    }>;
  };
  ids: Array<number>;
  conditions: Array<number>;
};
export type updatePoPayload = Omit<
  BonsCommande,
  | "createdAt"
  | "updatedAt"
  | "status"
  | "devi"
  | "reference"
  | "provider"
  | "id"
  | "deviId"
  | "providerId"
  | "netToPay"
  | "commandConditions"
  | "invoice"
  | "instalments"
> & {
  /* instalments: Array<{
    percentage: number;
    deadLine?: Date | undefined;
  }>; */
  conditions: Array<number>;
};

export type AddFileProps = {
  id: number;
  proof: File;
};

export interface PurchaseOrderParams {
  pageIndex?: number | undefined;
  pageSize?: number | undefined;
  //Onglet des pages d'approbation : PENDING = PENDING + IN-REVIEW, COMPLETED = APPROVED + REJECTED
  tab?: "PENDING" | "COMPLETED" | undefined;
  //Recherche : id, reference, devi.ref, provider.name, devi.commandRequest (titre, reference), deliveryLocation, paymentTerms
  search?: string | undefined;
  status?: BonsCommande["status"] | undefined;
  priority?: BonsCommande["priority"] | undefined;
  providerId?: number | undefined;
  deviId?: number | undefined;
  //Progression du paiement en % de netToPay (0-100)
  paymentMin?: number | undefined;
  paymentMax?: number | undefined;
  //Filtre sur createdAt : préréglage ou plage personnalisée (from/to en ISO)
  date?: "today" | "week" | "month" | "year" | "custom" | undefined;
  from?: string | undefined;
  to?: string | undefined;
}

export type PurchaseOrderListItem = BonsCommande & {
  //Somme des paiements au statut "paid" des factures liées au bon
  paidAmount: number;
};

export type PurchaseOrderStats = {
  total: number;
  totalAmount: number;
  pending: number;
  rejected: number;
  approved: number;
  approvedAmount: number;
};

class PurchaseOrder {
  route = "/request/command";

  getAll = async (): Promise<{ data: Array<BonsCommande> }> => {
    return api.get(this.route).then((response) => {
      return response.data;
    });
  };

  getPaginated = async (
    params?: PurchaseOrderParams,
  ): Promise<{
    data: { data: Array<PurchaseOrderListItem>; total: number };
  }> => {
    return api.get(this.route, { params }).then((response) => {
      return response.data;
    });
  };

  //Statistiques calculées sur l'ensemble filtré (mêmes filtres que getPaginated, sans pagination)
  getStats = async (
    params?: Omit<PurchaseOrderParams, "pageIndex" | "pageSize">,
  ): Promise<{ data: PurchaseOrderStats }> => {
    return api.get(`${this.route}/stats`, { params }).then((response) => {
      return response.data;
    });
  };

  getOne = async (id: number): Promise<{ data: BonsCommande }> => {
    return api.get(`${this.route}/${id}`).then((response) => {
      return response.data;
    });
  };

  //Pending for validation count
  getPendingCount = async (): Promise<{ data: number }> => {
    return api.get(`${this.route}/pending/count`).then((response) => {
      return response.data;
    });
  };

  create = async (
    payload: CreatePurchasePayload,
  ): Promise<{ data: BonsCommande }> => {
    return api.post(this.route, payload).then((response) => {
      return response.data;
    });
  };
  update = async (
    payload: updatePoPayload,
    id: number,
  ): Promise<{ data: BonsCommande }> => {
    return api.put(`${this.route}/${id}`, payload).then((response) => {
      return response.data;
    });
  };
  //Command File Upload
  addFile = async ({
    id,
    proof,
  }: AddFileProps): Promise<{ data: BonsCommande }> => {
    const formData = new FormData();
    formData.append("proof", proof);
    return api.put(`${this.route}/addFile/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  };
  approve = async (item: BonsCommande): Promise<{ data: BonsCommande }> => {
    const conditions = item.commandConditions.map((condition) => condition.id);
    return api
      .put(`${this.route}/commandVerdict/${item.id}`, {
        status: "APPROVED",
        conditions,
      })
      .then((response) => {
        return response.data;
      });
  };
  reject = async (
    bon: BonsCommande,
    reason: string,
  ): Promise<{ data: BonsCommande }> => {
    const conditions = bon.commandConditions.map((c) => c.id);
    return api
      .put(`${this.route}/commandVerdict/${bon.id}`, {
        status: "REJECTED",
        motif: reason,
        conditions,
      })
      .then((response) => {
        return response.data;
      });
  };
}

export const purchaseQ = new PurchaseOrder();
