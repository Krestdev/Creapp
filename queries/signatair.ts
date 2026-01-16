import api from "@/providers/axios";
import { Signatair } from "@/types/types";

class SignatairQueries {
  route = "/request/signatair";

  // ============================
  //       SIGNATAIR ROUTES
  // ============================

  // GET /request/signatair
  getAll = async (): Promise<{ data: Signatair[] }> => {
    return api.get(`${this.route}`).then((res) => res.data);
  };

  // POST /request/signatair
  create = async (
    data: Omit<Signatair, "id" | "createdAt" | "updatedAt">
  ): Promise<{ message: string; data: Signatair }> => {
    return api.post(`${this.route}`, data).then((res) => res.data);
  };

  // GET /request/signatair/{id}
  getOne = async (id: number): Promise<{ data: Signatair }> => {
    return api.get(`${this.route}/${id}`).then((res) => res.data);
  };

  // PUT /request/signatair/{id}
  update = async (
    id: number,
    data: Partial<Signatair>
  ): Promise<{ data: Signatair }> => {
    return api.put(`${this.route}/${id}`, data).then((res) => res.data);
  };

  // GET /request/signatair/{id}
  delete = async (id: number): Promise<{ data: Signatair }> => {
    return api.delete(`${this.route}/${id}`).then((res) => res.data);
  };
}

export const signatairQ = new SignatairQueries();

// signatairQ = ["signatairs"]
