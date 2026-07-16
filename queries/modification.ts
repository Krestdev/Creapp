import api from "@/providers/axios";
import { modification } from "@/types/types";

export type modificationPayload = Omit<
  modification,
  "id" | "createdAt" | "updatedAt" | "status"
>

class modificationQuery {
  route = "/base/modification";

  getAll = async (): Promise<{ data: Array<modification> }> => {
    return api.get(this.route).then((response) => {
      return response.data;
    });
  };

  create = async (
    payload: modificationPayload,
  ): Promise<{ data: modification }> => {
    return api.post(this.route, payload).then((response) => {
      return response.data;
    });
  };

  update = async (
    id: number,
    payload: Partial<modification>,
  ): Promise<{ data: modification }> => {
    return api.put(`${this.route}/${id}`, payload).then((response) => {
      return response.data;
    });
  };
}

export const modificationQ = new modificationQuery();
