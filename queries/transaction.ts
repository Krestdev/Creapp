import api from "@/providers/axios";
import { Transaction } from "@/types/types";

type source = { label: string; accountNumber?: string; phoneNumber?: string };

export interface TransactionProps extends Omit<Transaction, "id" | "proof" | "from" | "to" | "createdAt"> {
    proof?: File[];
    from?: source;
    to?: source;
    fromBankId?:number;
    toBankId?:number;
    date: Date;
}

export class TransactionQuery {
  route = "/request/transaction";

  getAll = async (): Promise<{ data: Array<Transaction> }> => {
    return api.get(this.route).then((response) => {
      return response.data;
    });
  };

  create = async (payload:TransactionProps):Promise<{data: Transaction}> => {
    const formData = new FormData();
    formData.append("label", payload.label);
    formData.append("amount", String(payload.amount));
    formData.append("Type", payload.Type);
    formData.append("date", String(payload.date));
    if(payload.from)formData.append("from", JSON.stringify(payload.from));
    if(payload.fromBankId)formData.append("fromBankId", String(payload.fromBankId));
    if(payload.to)formData.append("to", JSON.stringify(payload.to));
    if(payload.toBankId)formData.append("toBankId", String(payload.toBankId));
    if (payload.proof && payload.proof.length > 0) {
      payload.proof.forEach((file) => {
        formData.append("proof", file);
      });
    }
    return api.post(this.route, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then((response) => {
      return response.data;
    });
  }
}
