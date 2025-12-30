import api from "@/providers/axios";
import { PaymentRequest } from "@/types/types";

interface NewPayment extends Omit<PaymentRequest, "id" | "createdAt" | "updatedAt" | "proof" | "reference"> {
  proof: File;
}

export class PaymentQueries {
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
  new = async (payload:NewPayment):Promise<{data: PaymentRequest}> => {
    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      if (Array.isArray(value) && value[0] instanceof File) {
        value.forEach((file) => {
          formData.append(key, file);
        });
        return;
      }
      formData.append(key, String(value));
    });
    return api.post(this.route, payload).then((response) => response.data)
  }

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
    data: Partial<PaymentRequest>
  ): Promise<{ data: PaymentRequest }> => {
    return api.put(`${this.route}/${id}`, data).then((res) => res.data);
  };

  // --------------------------------------
  // DELETE
  // --------------------------------------
  delete = async (id: number): Promise<{ data: PaymentRequest }> => {
    return api.delete(`${this.route}/${id}`).then((response) => response.data);
  };
}
