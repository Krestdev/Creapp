import api from "@/providers/axios";
import { Bank } from "@/types/types";

export class BankQuery {
  route = "/request/bank";

  getAll = async (): Promise<{ data: Array<Bank> }> => {
    return api.get(this.route).then((response) => {
      return response.data;
    });
  };
}
