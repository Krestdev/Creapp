import api from "@/providers/axios";
import { PaymentRequest } from "@/types/types";

export interface NewPayment extends Omit<
  PaymentRequest,
  | "id"
  | "createdAt"
  | "updatedAt"
  | "proof"
  | "reference"
  | "status"
  | "signer"
  | "selected"
> {
  proof: File;
  invoiceId: number;
}

export interface UpdatePayment extends Omit<Partial<PaymentRequest>, "proof"> {
  proof?: File;
}

export type PayPayload = Omit<
  PaymentRequest,
  "id" | "createdAt" | "updatedAt" | "status" | "justification" | "signer"
> & { justification: File };

export type PayloadGasCompletion = {
  id: number;
  //km: number;
  price: number;
  benefId: number;
  liters: number;
  deadline: Date;
};

export type PayloadSettleCompletion = {
  id: number;
  //km: number;
  price: number;
  benefId: number;
  deadline: Date;
};

export type PaymentCancelPayload = {
  id: number;
  reason: string;
};

export interface PaymentQueryOptions {
  state?: "validated" | "pending" | "rejected";
  userId?: string;
  paymentType?: string;
  excludeType?: "deposit" | "expense" | "transport" | "gas";
  requestId?: string;
  page?: number;
  limit?: number;
  type?: "deposit" | "expense" | "transport" | "gas";
  date?: string;
}

class PaymentQueries {
  route = "/request/payment";

  // --------------------------------------
  // CREATE (POST)
  // --------------------------------------
  create = async (
    data: Omit<PaymentRequest, "id" | "createdAt" | "updatedAt" | "signer">,
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
    data: Omit<
      PaymentRequest,
      "id" | "createdAt" | "updatedAt" | "signer" | "selected"
    > & {
      caisseId: number;
    },
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

  new = async (
    payload: Omit<NewPayment, "vehiclesId" | "bankId" | "transactionId">,
  ): Promise<{ data: PaymentRequest }> => {
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

  getAll = async (
    params?: PaymentQueryOptions,
  ): Promise<{ data: PaymentRequest[]; total: number }> => {
    return api.get(this.route, { params }).then((response) => {
      return response.data.data;
    });
  };

  getDepenses = async (
    params?: Record<string, any>,
  ): Promise<{ data: PaymentRequest[]; count: number }> => {
    return api
      .get(`${this.route}/expenses/all`, { params })
      .then((response) => {
        return response.data.data;
      });
  };

  getDepensesStats = async (
    params?: Record<string, any>,
  ): Promise<{
    validated: {
      count: number;
      sum: number;
    };
    processed: {
      count: number;
      sum: number;
    };
    paid: {
      count: number;
      sum: number;
    };
    cancelled: {
      count: number;
      sum: number;
    };
  }> => {
    return api
      .get(`${this.route}/expenses/stats`, { params })
      .then((response) => {
        return response.data.data;
      });
  };

  getAccountantPayments = async (
    params?: Record<string, any>,
  ): Promise<{ data: PaymentRequest[]; count: number }> => {
    return api
      .get(`${this.route}/expenses/accountant/`, { params })
      .then((response) => {
        return response.data.data;
      });
  };

  getAccountantPaymentsStats = async (
    params?: Record<string, any>,
  ): Promise<{
    pending: {
      count: number;
      sum: number;
    };
    processed: {
      count: number;
      sum: number;
    };
    paid: {
      count: number;
      sum: number;
    };
    cancelled: {
      count: number;
      sum: number;
    };
  }> => {
    return api
      .get(`${this.route}/expenses/accountant/stats`, { params })
      .then((response) => {
        return response.data.data;
      });
  };

  // --------------------------------------
  // READ (GET ONE)
  // --------------------------------------
  getOne = async (
    id: number,
  ): Promise<{
    data: PaymentRequest & { totalPaid: number; progress: number };
  }> => {
    return api.get(`${this.route}/${id}`).then((response) => response.data);
  };

  getAllByRequestId = async (
    requestId: number,
  ): Promise<{ data: PaymentRequest }> => {
    return api
      .get(`${this.route}/request/${requestId}`)
      .then((response) => response.data);
  };
  //Pending for validation count
  getVoltPendingCount = async (): Promise<{ data: number }> => {
    return api.get(`${this.route}/tickets-pending/count`).then((response) => {
      return response.data;
    });
  };

  //Pending depense count
  getPendingDepenseCount = async (): Promise<{ data: number }> => {
    return api.get(`${this.route}/paymentToTreat/count`).then((response) => {
      return response.data;
    });
  };

  //To sign count
  getPendingToSignCount = async (): Promise<{ data: number }> => {
    return api.get(`${this.route}/paymentToSign/count`).then((response) => {
      return response.data;
    });
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
    data: UpdatePayment,
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
    signeDoc: File | string | undefined;
  }): Promise<{ data: PaymentRequest }> => {
    const formData = new FormData();
    formData.append("userId", String(data.userId));
    if (data.signeDoc) formData.append("signeDoc", data.signeDoc);
    return api
      .put(`${this.route}/validate/${data.paymentId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((response) => response.data);
  };

  rejectPayment = async ({
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
    data: UpdatePayment,
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
        return response.data;
      });
  };

  pay = async (
    id: number,
    data: PayPayload,
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

  gasCompletion = async ({
    payload,
  }: {
    payload: PayloadGasCompletion;
  }): Promise<{ data: PaymentRequest }> => {
    const { id, liters, price, benefId, deadline } = payload;
    return api
      .put(`${this.route}/gas/${id}`, {
        liters,
        price,
        benefId,
        deadline,
      })
      .then((response) => response.data);
  };

  settleCompletion = async ({
    payload,
  }: {
    payload: PayloadSettleCompletion;
  }): Promise<{ data: PaymentRequest }> => {
    const { id, price, benefId, deadline } = payload;
    return api
      .put(`${this.route}/settle/${id}`, {
        price,
        benefId,
        deadline,
      })
      .then((response) => response.data);
  };

  cancel = async ({
    id,
    reason,
  }: PaymentCancelPayload): Promise<{ data: PaymentRequest }> => {
    const formData = new FormData();
    formData.append("reason", reason);
    formData.append("status", "cancelled");
    return api
      .put(`${this.route}/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((response) => response.data);
  };
}

export const paymentQ = new PaymentQueries();

// socket invalidated payments = ["payments"]
