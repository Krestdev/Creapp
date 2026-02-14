import api from "@/providers/axios";
import { Reception } from "@/types/types";

export interface ReceptionCompletion {
  id: number;
  Deliverables: Reception["Deliverables"];
  proof?: Array<File>;
  note: string;
}

class ReceptionQuery {
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
  completeReception = async ({
    id,
    Deliverables,
    proof,
    note
  }: ReceptionCompletion): Promise<{ data: Reception }> => {
    const formData = new FormData();
    formData.append("Deliverables", JSON.stringify(Deliverables));
    formData.append("note", note)
    if (proof && proof.length > 0) {
      proof.forEach((file) => {
        formData.append("Proof", file);
      });
    }
    return api
      .put(`${this.route}/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((response) => {
        return response.data;
      });
  };
}

export const receptionQ = new ReceptionQuery();
