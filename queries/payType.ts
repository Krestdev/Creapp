import api from "@/providers/axios";
import { PayType } from "@/types/types";

class PayTypeQueries {
  route = "/request/payType";

  // ============================
  //       PAYTYPE ROUTES
  // ============================

  // GET /request/payType
  getAll = async (): Promise<{ data: PayType[] }> => {
    return api.get(`${this.route}/`).then((res) => res.data);
  };

  // POST /request/payType
  create = async (
    data: Omit<PayType, "id" | "createdAt" | "updatedAt">
  ): Promise<{ message: string; data: PayType }> => {
    return api.post(`${this.route}/`, data).then((res) => res.data);
  };

  // GET /request/payType/{id}
  getOne = async (id: number): Promise<{ data: PayType }> => {
    return api.get(`${this.route}/${id}`).then((res) => res.data);
  };

  // PUT /request/payType/{id}
  update = async (
    id: number,
    data: Partial<PayType>
  ): Promise<{ data: PayType }> => {
    return api.put(`${this.route}/${id}`, data).then((res) => res.data);
  };

  // GET /request/payType/{id}
  delete = async (id: number): Promise<{ data: PayType }> => {
    return api.delete(`${this.route}/${id}`).then((res) => res.data);
  };
}

export const payTypeQ = new PayTypeQueries();
