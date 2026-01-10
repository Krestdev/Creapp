import api from "@/providers/axios";
import { BonsCommande } from "@/types/types";

class CommandQueries {
  route = "/request/command";

  // --------------------------------------
  // CREATE
  // --------------------------------------

  create = async (
    data: Omit<
      BonsCommande,
      "id" | "createdAt" | "updatedAt" | "reference" | "hasPenalties"
    >
  ): Promise<{ data: BonsCommande }> => {
    return api.post(this.route, data).then((response) => {
      console.log(response.data);
      return response.data;
    });
  };

  // --------------------------------------
  // READ
  // --------------------------------------

  getAll = async (): Promise<{ data: BonsCommande[] }> => {
    return api.get(this.route).then((response) => {
      console.log(response.data);
      return response.data;
    });
  };

  getOne = async (id: number): Promise<{ data: BonsCommande }> => {
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
    data: Partial<BonsCommande>
  ): Promise<{ data: BonsCommande }> => {
    return api.put(`${this.route}/${id}`, data).then((response) => {
      console.log(response.data);
      return response.data;
    });
  };

  // --------------------------------------
  // DELETE
  // --------------------------------------

  delete = async (id: number): Promise<{ data: BonsCommande }> => {
    return api.delete(`${this.route}/${id}`).then((response) => {
      console.log(response.data);
      return response.data;
    });
  };
}

export const commadQ = new CommandQueries();
