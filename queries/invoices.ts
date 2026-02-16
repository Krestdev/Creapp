import api from "@/providers/axios";
import { Invoice } from "@/types/types";

export interface NewInvoice extends Omit<
  Invoice,
  "id" | "createdAt" | "updatedAt" | "proof" | "reference" | "status" | "payments" | "userId"
> {
  proof: File;
  commandId: number;
}

export interface UpdateInvoice extends Omit<Partial<Invoice>, "proof"> {
  proof?: File;
}


class InvoiceQueries {
  route = "/request/invoice";

  // --------------------------------------
  // CREATE (POST)
  // --------------------------------------
  create = async (
    data: NewInvoice,
  ): Promise<{ message: string; data: Invoice }> => {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("amount", data.amount.toString());
    formData.append("isPartial", data.isPartial.toString());
    formData.append("deadline", data.deadline.toString());
    formData.append("commandId", data.commandId.toString());
    formData.append("proof", data.proof);
    return api
      .post(this.route, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((response) => response.data);
  };

  // --------------------------------------
  // READ (GET ALL)
  // --------------------------------------
  getAll = async (): Promise<{ data: Invoice[] }> => {
    return api.get(this.route).then((response) => response.data);
  };

  // --------------------------------------
  // READ (GET ONE)
  // --------------------------------------
  getOne = async (id: number): Promise<{ data: Invoice }> => {
    return api.get(`${this.route}/${id}`).then((response) => response.data);
  };

  update = async (
    id: number,
    data: UpdateInvoice,
  ): Promise<{ data: Invoice }> => {
    const formData = new FormData();
    const { proof, ...rest } = data;
    if (proof) formData.append("proof", proof);
    Object.entries(rest).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      formData.append(key, String(value));
    });
    return api
      .put(`${this.route}/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((res) => res.data);
  };
  cancel = async (id: number): Promise<{data: Invoice}> => {
    const formData = new FormData();
    formData.append("status", "CANCELLED");
    return api
      .put(`${this.route}/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((res) => res.data);

  }
}

export const invoiceQ = new InvoiceQueries();

// socket invalidated invoices = ["invoices"]
