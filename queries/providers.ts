import api from "@/providers/axios";
import { Provider } from "@/types/types";

export class ProviderQueries {
  route = "/request/provider";

  // --------------------------------------
  // CREATE
  // --------------------------------------

  create = async (
    data: Omit<Provider, "id" | "createdAt">
  ): Promise<{ message: string; data: Provider }> => {
    return api.post(this.route, data).then((response) => {
      console.log(response.data);
      return response.data;
    });
  };

  // --------------------------------------
  // READ
  // --------------------------------------

  getAll = async (): Promise<{ data: Array<Provider> }> => {
    return api.get(this.route).then((response) => {
      return response.data;
    });
  };

  getOne = async (id: number): Promise<{ data: Provider }> => {
    return api.get(`${this.route}/${id}`).then((response) => {
      console.log(response.data);
      return response.data;
    });
  };

  // --------------------------------------
  // UPDATE (PUT)
  // --------------------------------------

  update = async (
    id: number,
    data: Partial<Omit<Provider, "id" | "createdAt">>
  ): Promise<{ data: Provider }> => {
    return api.put(`${this.route}/${id}`, data).then((response) => {
      console.log(response.data);
      return response.data;
    });
  };

  // --------------------------------------
  // DELETE
  // --------------------------------------

  delete = async (id: number): Promise<{ data: Provider }> => {
    return api.delete(`${this.route}/${id}`).then((response) => {
      console.log(response.data);
      return response.data;
    });
  };
}
