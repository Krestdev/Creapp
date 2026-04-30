import api from "@/providers/axios";
import { Service } from "@/types/types";

export interface NewService extends Omit<
  Service,
  "id" | "createdAt" | "updatedAt" | "users"
> {
  users: number[];
  headId: number;
}

export interface UpdateService extends Omit<
  Service,
  "users" | "head" | "createdAt" | "updatedAt" | "id"
> {
  users: number[];
  headId?: number;
}

class ServiceQueries {
  route = "/request/services";

  // --------------------------------------
  // CREATE (POST)
  // --------------------------------------
  create = async (
    data: NewService,
  ): Promise<{ message: string; data: Service }> => {
    return api.post(this.route, data).then((response) => response.data);
  };

  // --------------------------------------
  // READ (GET ALL)
  // --------------------------------------
  getAll = async (): Promise<{ data: Service[] }> => {
    return api.get(this.route).then((response) => response.data);
  };

  // --------------------------------------
  // READ (GET ONE)
  // --------------------------------------
  getOne = async (id: number): Promise<{ data: Service }> => {
    return api.get(`${this.route}/${id}`).then((response) => response.data);
  };

  update = async (
    id: number,
    data: UpdateService,
  ): Promise<{ data: Service }> => {
    return api.put(`${this.route}/${id}`, data).then((res) => res.data);
  };
  delete = async (id: number): Promise<{ data: Service }> => {
    return api.delete(`${this.route}/${id}`).then((res) => res.data);
  };
}

export const serviceQ = new ServiceQueries();
