import api from "@/providers/axios";
import { PaymentRequest } from "@/types/types";

export interface NewPayment
  extends Omit<
    PaymentRequest,
    "id" | "createdAt" | "updatedAt" | "proof" | "reference" | "status"
  > {
  proof: File;
  commandId: number;
}

export interface UpdatePayment extends Omit<Partial<PaymentRequest>, "proof"> {
  proof?: File;
}

export type PayPayload = Omit<
  PaymentRequest,
  "id" | "createdAt" | "updatedAt" | "status" | "justification"
> & { justification: File };

class PaymentQueries {
  route = "/request/payment";

  // --------------------------------------
  // CREATE (POST)
  // --------------------------------------
  create = async (
    data: Omit<PaymentRequest, "id" | "createdAt" | "updatedAt">
  ): Promise<{ message: string; data: PaymentRequest }> => {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (value === undefined || value === null) return;

      // Multiple files
      if (Array.isArray(value) && value[0] instanceof File) {
        value.forEach((file) => {
          formData.append(key, file);
        });
        return;
      }

      // Single file
      // if (value instanceof File) {
      //   formData.append(key, value);
      //   return;
      // }

      // Normal fields
      formData.append(key, String(value));
    });

    return api
      .post(this.route, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((response) => response.data);
  };

  createDepense = async (
    data: Omit<PaymentRequest, "id" | "createdAt" | "updatedAt"> & {
      caisseId: number;
    }
  ): Promise<{ message: string; data: PaymentRequest }> => {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (value === undefined || value === null) return;

      // Multiple files
      if (Array.isArray(value) && value[0] instanceof File) {
        value.forEach((file) => {
          formData.append(key, file);
        });
        return;
      }

      // Single file
      // if (value instanceof File) {
      //   formData.append(key, value);
      //   return;
      // }

      // Normal fields
      formData.append(key, String(value));
    });

    return api
      .post(`${this.route}/depense`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((response) => response.data);
  };

  new = async (payload: Omit<NewPayment, "vehiclesId" | "bankId" | "transactionId">): Promise<{ data: PaymentRequest }> => {
    const formData = new FormData();
    const { proof, ...rest } = payload;
    formData.append("proof", proof);
    Object.entries(rest).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      formData.append(key, String(value));
    });
    return api
      .post(this.route, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((response) => response.data);
  };

  // --------------------------------------
  // READ (GET ALL)
  // --------------------------------------
  getAll = async (): Promise<{ data: PaymentRequest[] }> => {
    return api.get(this.route).then((response) => response.data);
  };

  // --------------------------------------
  // READ (GET ONE)
  // --------------------------------------
  getOne = async (id: number): Promise<{ data: PaymentRequest }> => {
    return api.get(`${this.route}/${id}`).then((response) => response.data);
  };

  // --------------------------------------
  // UPDATE (PUT)
  // --------------------------------------
  // update = async (
  //   id: number,
  //   data: Partial<Omit<PaymentRequest, "id" | "createdAt" | "updatedAt">>
  // ): Promise<{ data: PaymentRequest }> => {
  //   const formData = new FormData();

  //   Object.entries(data).forEach(([key, value]) => {
  //     if (value === undefined || value === null) return;

  //     // Multiple files
  //     if (Array.isArray(value) && value[0] instanceof File) {
  //       value.forEach((file) => {
  //         formData.append(key, file);
  //       });
  //       return;
  //     }
  //     formData.append(key, String(value));
  //   });

  //   return api
  //     .put(`${this.route}/${id}`, formData, {
  //       headers: { "Content-Type": "multipart/form-data" },
  //     })
  //     .then((response) => response.data);
  // };

  update = async (
    id: number,
    data: UpdatePayment
  ): Promise<{ data: PaymentRequest }> => {
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

  approveInvoice = async (id: number): Promise<{ data: PaymentRequest }> => {
    const formData = new FormData();
    formData.append("status", "accepted");
    return api
      .put(`${this.route}/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((response) => response.data);
  };

  validate = async (data: {
    paymentId: number;
    userId: number;
  }): Promise<{ data: PaymentRequest }> => {
    return api
      .put(`${this.route}/validate/${data.paymentId}`, { userId: data.userId })
      .then((response) => response.data);
  };

  rejectInvoice = async ({
    id,
    reason,
  }: {
    id: number;
    reason: string;
  }): Promise<{ data: PaymentRequest }> => {
    const formData = new FormData();
    formData.append("status", "rejected");
    formData.append("reason", reason);
    return api
      .put(`${this.route}/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((response) => response.data);
  };

  vaidate = async (
    id: number,
    data: UpdatePayment
  ): Promise<{ data: PaymentRequest }> => {
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
      .then((response) => {
        console.log(response.data);
        return response.data;
      });
  };

  pay = async (
    id: number,
    data: PayPayload
  ): Promise<{ data: PaymentRequest }> => {
    const formData = new FormData();
    const { justification, ...rest } = data;
    formData.append("justification", justification);
    formData.append("status", "paid");
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

  // --------------------------------------
  // DELETE
  // --------------------------------------
  delete = async (id: number): Promise<{ data: PaymentRequest }> => {
    return api.delete(`${this.route}/${id}`).then((response) => response.data);
  };
}

export const paymentQ = new PaymentQueries();
