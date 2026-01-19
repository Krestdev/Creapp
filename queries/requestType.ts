import api from "@/providers/axios";
import { RequestType } from "@/types/types";

class RequestTypeQueries {
  route = "/request/requestType";

  getAll = async (): Promise<{ data: RequestType[] }> => {
    return api.get(this.route).then((response) => {
      return response.data;
    });
  };

  update = async (id: number, data: Partial<RequestType>) => {
    return api.put(`${this.route}/${id}`, data).then((response) => {
      return response.data;
    });
  };
}

export const requestTypeQ = new RequestTypeQueries();
