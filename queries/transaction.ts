import api from "@/providers/axios";
import { Transaction } from "@/types/types";

type source = { label: string; accountNumber?: string; phoneNum?: string };

export interface TransactionProps extends Omit<
  Transaction,
  "id" | "proof" | "from" | "to" | "createdAt" | "status" | "updatedAt"
> {
  proof?: File[];
  from?: source;
  to?: source;
  fromBankId?: number;
  toBankId?: number;
  status?: string;
  paymentId?: number;
  methodId?: number;
  docNumber?: string;
}

export interface TransferProps extends Omit<
  Transaction,
  "id" | "proof" | "from" | "to" | "createdAt" | "date" | "updatedAt"
> {
  fromBankId: number;
  toBankId: number;
}

export interface ApproProps extends Omit<
  Transaction,
  | "id"
  | "proof"
  | "from"
  | "to"
  | "createdAt"
  | "status"
  | "date"
  | "updatedAt"
  | "payments"
> {
  fromBankId: number;
  toBankId: number;
  payments?: Array<number>;
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
    payload: TransactionProps,
  ): Promise<{ data: Transaction }> => {
    const url =
      payload.Type === "CREDIT"
        ? this.route.concat("/credit")
        : this.route.concat("/debit");
    const formData = new FormData();
    formData.append("label", payload.label);
    formData.append("amount", String(payload.amount));
    formData.append("Type", payload.Type);
    formData.append("date", String(payload.date));
    formData.append("userId", String(payload.userId));
    if (payload.from) formData.append("from", JSON.stringify(payload.from));
    if (typeof payload.fromBankId === "number")
      formData.append("fromBankId", String(payload.fromBankId));
    if (payload.to) formData.append("to", JSON.stringify(payload.to));
    if (payload.toBankId) formData.append("toBankId", String(payload.toBankId));
    if (payload.proof && payload.proof.length > 0) {
      payload.proof.forEach((file) => {
        formData.append("proof", file);
      });
    }
    return api
      .post(url, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((response) => {
        return response.data;
      });
  };

  //Debit Payment
  createDebitTransaction = async (
    payload: TransactionProps,
  ): Promise<{ data: Transaction }> => {
    console.log(payload);
    const formData = new FormData();
    formData.append("label", payload.label);
    formData.append("amount", String(payload.amount));
    formData.append("Type", "DEBIT");
    formData.append("date", String(payload.date));
    formData.append("userId", String(payload.userId));
    formData.append("paymentId", String(payload.paymentId));
    formData.append("methodId", String(payload.methodId));
    formData.append("status", String(payload.status));
    formData.append("docNumber", String(payload.docNumber));
    //if (!!payload.from) formData.append("from", JSON.stringify(payload.from));
    if (typeof payload.fromBankId === "number")
      formData.append("fromBankId", String(payload.fromBankId));
    if (payload.to) formData.append("to", JSON.stringify(payload.to));
    //if (payload.toBankId) formData.append("toBankId", String(payload.toBankId));
    if (payload.proof && payload.proof.length > 0) {
      payload.proof.forEach((file) => {
        formData.append("proof", file);
      });
    }
    return api
      .post(`${this.route}/debitPayment`, formData, {
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

  update = async (
    id: number,
    data: Omit<TransactionProps, "userId" | "updatedAt">,
  ): Promise<{ data: Transaction }> => {
    const status: Transaction["status"] = "APPROVED";
    const formData = new FormData();
    formData.append("label", data.label);
    formData.append("amount", String(data.amount));
    formData.append("Type", data.Type);
    formData.append("date", String(new Date()));
    formData.append("status", status);
    formData.append("paymentId", String(data.paymentId));
    if (data.from) formData.append("from", JSON.stringify(data.from));
    if (data.fromBankId) formData.append("fromBankId", String(data.fromBankId));
    if (data.to) formData.append("to", JSON.stringify(data.to));
    if (data.toBankId) formData.append("toBankId", String(data.toBankId));
    if (data.proof && data.proof.length > 0) {
      data.proof.forEach((file) => {
        formData.append("proof", file);
      });
    }
    return api
      .put(`${this.route}/transferUpdate/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((response) => {
        return response.data;
      });
  };

  cancel = async (
    id: number,
    reason: string,
  ): Promise<{ data: Transaction }> => {
    const formData = new FormData();
    formData.append("status", "CANCELLED");
    formData.append("reason", reason);
    return api
      .put(`${this.route}/transferUpdate/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((response) => {
        return response.data;
      });
  };

  //Complete Payments
  completePayment = async ({
    id,
    proof,
    paymentId,
  }: {
    id: number;
    proof: File;
    paymentId: number;
  }): Promise<{ data: Transaction }> => {
    const formData = new FormData();
    formData.append("status", "APPROVED");
    formData.append("proof", proof);
    formData.append("paymentId", paymentId.toString());
    return api
      .put(`${this.route}/paymentUpdate/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((response) => response.data);
  };

  complete = async ({
    id,
    proof,
    date,
  }: {
    id: number;
    proof: File;
    date: Date;
  }): Promise<{ data: Transaction }> => {
    const formData = new FormData();
    formData.append("date", String(date));
    formData.append("proof", proof);
    return api
      .put(`${this.route}/transferComplete/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((response) => response.data);
  };

  initiateSign = async ({
    id,
    methodId,
    docNumber,
  }: {
    id: number;
    methodId: number;
    docNumber: string;
  }): Promise<{ data: Transaction }> => {
    return api
      .put(`${this.route}/initiateSign/${id}`, { methodId, docNumber })
      .then((response) => response.data);
  };

  sign = async ({
    id,
    signDoc,
  }: {
    id: number;
    signDoc: File;
  }): Promise<{ data: Transaction }> => {
    const formData = new FormData();
    formData.append("signDoc", signDoc);
    return api
      .put(`${this.route}/sign/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((response) => response.data);
  };

  //Transfer Transactions
  createTransfer = async (
    data: TransferProps,
  ): Promise<{ data: Transaction }> => {
    return api
      .post(`${this.route}/transferTransaction`, data)
      .then((response) => {
        return response.data;
      });
  };
  createAppro = async (data: ApproProps): Promise<{ data: Transaction }> => {
    return api
      .post(`${this.route}/appro`, data)
      .then((response) => response.data);
  };
}

export const transactionQ = new TransactionQuery();

// transactionQ = ["transactions"]
