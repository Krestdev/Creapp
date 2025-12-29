import api from "@/providers/axios";
import { Reception } from "@/types/types";

export class ReceptionQuery {
  route = "/request/reception";

  getAll = async (): Promise<{ data: Array<Reception> }> => {
    return api.get(this.route).then((response) => {
      return response.data;
    });
  };
}
