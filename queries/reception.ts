import api from "@/providers/axios";
import { Reception } from "@/types/types";

export interface ReceptionCompletion {
  id: number;
  Deliverables: Array<Reception["Deliverables"]>;
}

export class ReceptionQuery {
  route = "/request/reception";

  getAll = async (): Promise<{ data: Array<Reception> }> => {
    return api.get(this.route).then((response) => {
      return response.data;
    });
  };

  update = async (
    id: number,
    data: Reception
  ): Promise<{ data: Array<Reception> }> => {
    return api.put(`${this.route}/${id}`, data).then((response) => {
      return response.data;
    });
  };
  completeReception = async ({id, Deliverables}:ReceptionCompletion): Promise<{ data: Reception }> => {
    return api.put(`${this.route}/complete/${id}`, { Deliverables }).then((response) => {
      return response.data;
    });
  };
}
