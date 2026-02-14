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
    | "netToPay"
    | "commandConditions"
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
>;

export type AddFileProps = {
  id: number;
  proof: File;
}

class PurchaseOrder {
  route = "/request/command";

  getAll = async (): Promise<{ data: Array<BonsCommande> }> => {
    return api.get(this.route).then((response) => {
      return response.data;
    });
  };

  create = async (
    payload: CreatePurchasePayload
  ): Promise<{ data: BonsCommande }> => {
    return api.post(this.route, payload).then((response) => {
      return response.data;
    });
  };
  update = async (
    payload: updatePoPayload,
    id: number
  ): Promise<{ data: BonsCommande }> => {
    return api.put(`${this.route}/${id}`, payload).then((response) => {
      return response.data;
    });
  };
  //Command File Upload
  addFile = async({id, proof}:AddFileProps): Promise<{data: BonsCommande}> => {
    const formData = new FormData();
    formData.append('proof', proof);
    return api.put(`${this.route}/addFile/${id}`, formData,{
        headers: { "Content-Type": "multipart/form-data" },
      });
  }
  approve = async (id: number): Promise<{ data: BonsCommande }> => {
    return api
      .put(`${this.route}/${id}`, { status: "APPROVED" })
      .then((response) => {
        return response.data;
      });
  };
  reject = async (
    id: number,
    reason: string
  ): Promise<{ data: BonsCommande }> => {
    return api
      .put(`${this.route}/${id}`, { status: "REJECTED", motif: reason })
      .then((response) => {
        return response.data;
      });
  };
}

export const purchaseQ = new PurchaseOrder();
