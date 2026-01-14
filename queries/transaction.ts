import api from "@/providers/axios";
import { Transaction } from "@/types/types";

type source = { label: string; accountNumber?: string; phoneNumber?: string };

export interface TransactionProps
  extends Omit<
    Transaction,
    "id" | "proof" | "from" | "to" | "createdAt" | "status"
  > {
  proof?: File[];
  from?: source;
  to?: source;
  fromBankId?: number;
  toBankId?: number;
}

export interface TransferProps
  extends Omit<
    Transaction,
    "id" | "proof" | "from" | "to" | "createdAt" | "status" | "date"
  > {
  fromBankId: number;
  toBankId: number;
}

export interface StatusUpdateProps {
  id: number;
  status: Transaction["status"];
  reason?: string;
  validatorId: number;
}

class TransactionQuery {
  route = "/request/transaction";

  getAll = async (): Promise<{ data: Array<Transaction> }> => {
    return api.get(this.route).then((response) => {
      return response.data;
    });
  };

  create = async (
    payload: TransactionProps
  ): Promise<{ data: Transaction }> => {
    const formData = new FormData();
    formData.append("label", payload.label);
    formData.append("amount", String(payload.amount));
    formData.append("Type", payload.Type);
    formData.append("date", String(payload.date));
    formData.append("userId", String(payload.userId));
    if (payload.from) formData.append("from", JSON.stringify(payload.from));
    if (payload.fromBankId)
      formData.append("fromBankId", String(payload.fromBankId));
    if (payload.to) formData.append("to", JSON.stringify(payload.to));
    if (payload.toBankId) formData.append("toBankId", String(payload.toBankId));
    if (payload.proof && payload.proof.length > 0) {
      payload.proof.forEach((file) => {
        formData.append("proof", file);
      });
    }
    return api
      .post(this.route, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((response) => {
        return response.data;
      });
  };

  approve = async (data: StatusUpdateProps): Promise<{ data: Transaction }> => {
    const { id, reason, ...rest } = data;
    let payload: {
      status: Transaction["status"];
      reason?: string;
      validatorId: number;
    } = { ...rest };
    if (reason) {
      payload = { ...payload, reason };
    }
    return api.put(`${this.route}/validate/${id}`, payload).then((response) => {
      return response.data;
    });
  };
  complete = async({id, proof, date}:{id:number, proof: File; date: Date}):Promise<{data: Transaction}> => {
    const formData = new FormData();
    formData.append("date", String(date));
    formData.append("status", "APPROVED");
    formData.append("proof", proof);
    return api.put(`${this.route}/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((response)=>response.data)
  }
  createTransaction = async (
    data: TransferProps
  ): Promise<{ data: Transaction }> => {
    const formData = new FormData();
    formData.append("label", data.label);
    formData.append("amount", String(data.amount));
    formData.append("Type", data.Type);
    formData.append("date", String(new Date()));
    formData.append("userId", String(data.userId));
    formData.append("fromBankId", String(data.fromBankId));
    formData.append("toBankId", String(data.toBankId));

    return api
      .post(this.route, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((response) => {
        return response.data;
      });
  };
}

export const transactionQ = new TransactionQuery();
